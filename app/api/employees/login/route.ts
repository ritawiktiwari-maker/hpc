import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { employeeId, password } = body

        if (!employeeId || !password) {
            return NextResponse.json({ error: 'Employee ID and password are required' }, { status: 400 })
        }

        const employee = await prisma.employee.findUnique({
            where: { employeeId: employeeId.toUpperCase() }
        })

        if (!employee) {
            return NextResponse.json({ error: 'Invalid Employee ID or password' }, { status: 401 })
        }

        // Simplistic check as requested/documented in current code (unhashed)
        if (employee.password !== password) {
            return NextResponse.json({ error: 'Invalid Employee ID or password' }, { status: 401 })
        }

        if (!employee.isActive) {
            return NextResponse.json({ error: 'Your account is deactivated. Please contact admin.' }, { status: 403 })
        }

        // Return employee data (excluding password if possible, though we return the object for now)
        const { password: _, ...employeeWithoutPassword } = employee
        return NextResponse.json(employeeWithoutPassword)
    } catch (error: any) {
        console.error("Employee Login API Error:", error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
