import { PrismaClient } from '@prisma/client'
import * as XLSX from 'xlsx'
import * as path from 'path'
import { randomUUID } from 'crypto'

const prisma = new PrismaClient()

function parseDate(dateStr: string | null | undefined): Date | null {
    if (!dateStr || typeof dateStr !== 'string') return null
    const trimmed = dateStr.trim()
    if (!trimmed) return null

    const dotMatch = trimmed.match(/^(\d{1,2})\.(\d{1,2})\.(\d{2,4})$/)
    if (dotMatch) {
        let [, day, month, year] = dotMatch
        if (year.length === 2) year = `20${year}`
        const d = new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`)
        if (!isNaN(d.getTime())) return d
    }

    const slashMatch = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/)
    if (slashMatch) {
        let [, day, month, year] = slashMatch
        if (year.length === 2) year = `20${year}`
        const d = new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`)
        if (!isNaN(d.getTime())) return d
    }

    const d = new Date(trimmed)
    return isNaN(d.getTime()) ? null : d
}

function parsePeriod(period: string | null | undefined): { start: Date | null, end: Date | null } {
    if (!period) return { start: null, end: null }
    const parts = period.split(/\s*to\s*/i)
    return {
        start: parseDate(parts[0]?.trim()),
        end: parseDate(parts[1]?.trim()),
    }
}

function parseNumber(val: any): number {
    if (val === null || val === undefined || val === 'NA' || val === 'na' || val === '-') return 0
    const num = parseFloat(String(val).replace(/,/g, ''))
    return isNaN(num) ? 0 : num
}

interface CustomerRow {
    name: string
    contactNumber: string
    address: string
    serviceType: string
    terms: string
    frequency: string
    contractPeriod: string
    contractValue: number
    gst: number
    total: number
    serviceDates: { date: Date; status: string }[]
}

function parseSheet(sheet: XLSX.WorkSheet, sheetName: string): CustomerRow[] {
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1, raw: false }) as any[][]
    const customers: CustomerRow[] = []
    const startRow = sheetName.includes('Renew') ? 3 : 1

    for (let i = startRow; i < data.length; i++) {
        const row = data[i]
        if (!row || !row[2] || !String(row[2]).trim()) continue

        const serviceDates: { date: Date; status: string }[] = []
        for (let col = 12; col < (row.length || 0); col += 2) {
            const dateVal = row[col]
            if (dateVal && String(dateVal).trim()) {
                const parsedDate = parseDate(String(dateVal))
                if (parsedDate) {
                    serviceDates.push({
                        date: parsedDate,
                        status: String(row[col + 1] || 'PENDING').trim()
                    })
                }
            }
        }

        customers.push({
            name: String(row[2]).trim(),
            contactNumber: String(row[3] || '').trim(),
            address: String(row[4] || '').trim(),
            serviceType: String(row[5] || 'General').trim(),
            terms: String(row[6] || '').trim(),
            frequency: String(row[7] || '').trim(),
            contractPeriod: String(row[8] || '').trim(),
            contractValue: parseNumber(row[9]),
            gst: parseNumber(row[10]),
            total: parseNumber(row[11]),
            serviceDates,
        })
    }
    return customers
}

async function main() {
    const startTime = Date.now()
    console.log('Reading data.xlsx...')
    const filePath = path.join(process.cwd(), 'data.xlsx')
    const wb = XLSX.readFile(filePath)

    const ocfCustomers = parseSheet(wb.Sheets['OCF'], 'OCF')
    const renewCustomers = parseSheet(wb.Sheets['Renew Jan to June 2023'], 'Renew Jan to June 2023')
    console.log(`Found ${ocfCustomers.length} + ${renewCustomers.length} customer rows`)

    // Deduplicate by name+contact
    const allRows = [...ocfCustomers, ...renewCustomers]
    const customerMap = new Map<string, CustomerRow[]>()
    for (const row of allRows) {
        const key = `${row.name.toLowerCase()}|${row.contactNumber}`
        if (!customerMap.has(key)) customerMap.set(key, [])
        customerMap.get(key)!.push(row)
    }

    console.log(`${customerMap.size} unique customers to insert`)

    // Clear database
    console.log('\nClearing database...')
    await prisma.$transaction([
        prisma.visitProductUsage.deleteMany(),
        prisma.stockReturnItem.deleteMany(),
        prisma.stockReturnRequest.deleteMany(),
        prisma.stockTransaction.deleteMany(),
        prisma.employeeStock.deleteMany(),
        prisma.visit.deleteMany(),
        prisma.contract.deleteMany(),
        prisma.lead.deleteMany(),
        prisma.customer.deleteMany(),
        prisma.product.deleteMany(),
        prisma.employee.deleteMany(),
    ])
    console.log('Database cleared.')

    // Pre-generate all IDs and build flat arrays for batch insert
    const now = new Date()
    const customerRecords: any[] = []
    const contractRecords: any[] = []
    const visitRecords: any[] = []

    for (const [, rows] of customerMap) {
        const firstRow = rows[0]
        const customerId = randomUUID()

        customerRecords.push({
            id: customerId,
            name: firstRow.name,
            contactNumber: firstRow.contactNumber,
            address: firstRow.address,
            serviceType: firstRow.serviceType,
            frequency: firstRow.frequency || 'Once',
            createdAt: now,
            updatedAt: now,
        })

        for (const row of rows) {
            const contractId = randomUUID()
            const { start, end } = parsePeriod(row.contractPeriod)

            contractRecords.push({
                id: contractId,
                customerId,
                serviceType: row.serviceType,
                terms: row.terms || null,
                frequency: row.frequency || 'Once',
                startDate: start || now,
                endDate: end || now,
                contractValue: row.contractValue,
                gst: row.gst,
                totalAmount: row.total || row.contractValue + row.gst,
                createdAt: now,
                updatedAt: now,
            })

            for (const sd of row.serviceDates) {
                visitRecords.push({
                    id: randomUUID(),
                    contractId,
                    customerId,
                    scheduledDate: sd.date,
                    status: sd.status.toLowerCase() === 'done' ? 'COMPLETED' : 'PENDING',
                    completionDate: sd.status.toLowerCase() === 'done' ? sd.date : null,
                    serviceType: row.serviceType,
                    createdAt: now,
                    updatedAt: now,
                })
            }
        }
    }

    // Batch insert in chunks
    const BATCH_SIZE = 100

    console.log(`\nInserting ${customerRecords.length} customers...`)
    for (let i = 0; i < customerRecords.length; i += BATCH_SIZE) {
        const chunk = customerRecords.slice(i, i + BATCH_SIZE)
        await prisma.customer.createMany({ data: chunk })
        if ((i + BATCH_SIZE) % 200 === 0 || i + BATCH_SIZE >= customerRecords.length) {
            console.log(`  Customers: ${Math.min(i + BATCH_SIZE, customerRecords.length)}/${customerRecords.length}`)
        }
    }

    console.log(`Inserting ${contractRecords.length} contracts...`)
    for (let i = 0; i < contractRecords.length; i += BATCH_SIZE) {
        const chunk = contractRecords.slice(i, i + BATCH_SIZE)
        await prisma.contract.createMany({ data: chunk })
        if ((i + BATCH_SIZE) % 200 === 0 || i + BATCH_SIZE >= contractRecords.length) {
            console.log(`  Contracts: ${Math.min(i + BATCH_SIZE, contractRecords.length)}/${contractRecords.length}`)
        }
    }

    if (visitRecords.length > 0) {
        console.log(`Inserting ${visitRecords.length} visits...`)
        for (let i = 0; i < visitRecords.length; i += BATCH_SIZE) {
            const chunk = visitRecords.slice(i, i + BATCH_SIZE)
            await prisma.visit.createMany({ data: chunk })
        }
    }

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1)
    console.log(`\n=== Seed Complete in ${elapsed}s ===`)
    console.log(`Customers: ${customerRecords.length}`)
    console.log(`Contracts: ${contractRecords.length}`)
    console.log(`Visits: ${visitRecords.length}`)
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
