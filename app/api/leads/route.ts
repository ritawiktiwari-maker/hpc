import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        const leads = await prisma.lead.findMany({
            orderBy: { createdAt: 'desc' },
            include: { followedBy: true }
        })
        return NextResponse.json(leads)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch leads' }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { name, mobile, address, source, followedById } = body

        const lead = await prisma.lead.create({
            data: {
                name,
                mobile,
                address,
                source,
                followedById: followedById || null
            }
        })

        return NextResponse.json(lead)
    } catch (error: any) {
        console.error("LEAD CREATE ERROR:", error)
        return NextResponse.json({
            error: 'Failed to create lead',
            details: error instanceof Error ? error.message : String(error)
        }, { status: 500 })
    }
}
