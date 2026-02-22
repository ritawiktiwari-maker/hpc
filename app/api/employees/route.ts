import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        const employees = await prisma.employee.findMany({
            select: {
                id: true,
                name: true,
                employeeId: true,
                isActive: true
            },
            orderBy: { name: 'asc' }
        })
        return NextResponse.json(employees)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch employees' }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { employeeId, name, fatherName, aadhaarNumber, dateOfBirth, mobileNumber, emergencyContact, address, dateOfJoining, password } = body

        const employee = await prisma.employee.create({
            data: {
                employeeId,
                name,
                fatherName,
                aadhaarNumber,
                dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
                mobileNumber,
                emergencyContact,
                address,
                dateOfJoining: dateOfJoining ? new Date(dateOfJoining) : new Date(),
                password // Note: In a real app, hash this!
            }
        })

        return NextResponse.json(employee)
    } catch (error: any) {
        console.error("Employee Create Error:", error)
        return NextResponse.json({ error: 'Failed to create employee', details: error.message }, { status: 500 })
    }
}
