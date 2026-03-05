import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function PUT(
    request: Request,
    props: { params: Promise<{ id: string }> }
) {
    try {
        const params = await props.params
        const id = params.id
        const body = await request.json()
        const {
            isActive,
            name,
            mobileNumber,
            address,
            fatherName,
            aadhaarNumber,
            dateOfBirth,
            emergencyContact,
            photo,
            dateOfJoining,
            password
        } = body

        const employee = await prisma.employee.update({
            where: { id },
            data: {
                ...(isActive !== undefined && { isActive }),
                ...(name && { name }),
                ...(mobileNumber && { mobileNumber }),
                ...(address && { address }),
                ...(fatherName !== undefined && { fatherName }),
                ...(aadhaarNumber !== undefined && { aadhaarNumber }),
                ...(dateOfBirth && { dateOfBirth: new Date(dateOfBirth) }),
                ...(emergencyContact !== undefined && { emergencyContact }),
                ...(photo !== undefined && { photo }),
                ...(dateOfJoining && { dateOfJoining: new Date(dateOfJoining) }),
                ...(password && { password }),
            }
        })
        return NextResponse.json(employee)
    } catch (error) {
        console.error("Employee Update Error:", error)
        return NextResponse.json({ error: 'Failed to update employee' }, { status: 500 })
    }
}

export async function DELETE(
    request: Request,
    props: { params: Promise<{ id: string }> }
) {
    try {
        const params = await props.params
        const id = params.id

        await prisma.$transaction(async (tx) => {
            // 1. Delete EmployeeStock
            await tx.employeeStock.deleteMany({
                where: { employeeId: id }
            })

            // 2. Delete StockReturnItem & StockReturnRequest
            const returnRequests = await tx.stockReturnRequest.findMany({
                where: { employeeId: id },
                select: { id: true }
            })
            const returnRequestIds = returnRequests.map(r => r.id)

            if (returnRequestIds.length > 0) {
                await tx.stockReturnItem.deleteMany({
                    where: { requestId: { in: returnRequestIds } }
                })
                await tx.stockReturnRequest.deleteMany({
                    where: { employeeId: id }
                })
            }

            // 3. Unlink Leads
            await tx.lead.updateMany({
                where: { followedById: id },
                data: { followedById: null }
            })

            // 4. Unlink Visits
            await tx.visit.updateMany({
                where: { assignedEmployeeId: id },
                data: { assignedEmployeeId: null }
            })

            // 5. Delete Employee
            await tx.employee.delete({
                where: { id }
            })
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Employee Delete Error:", error)
        return NextResponse.json({ error: 'Failed to delete employee' }, { status: 500 })
    }
}
