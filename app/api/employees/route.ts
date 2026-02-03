import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        const employees = await prisma.employee.findMany({
            select: {
                id: true,
                name: true,
                employeeId: true
            },
            orderBy: { name: 'asc' }
        })
        return NextResponse.json(employees)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch employees' }, { status: 500 })
    }
}
