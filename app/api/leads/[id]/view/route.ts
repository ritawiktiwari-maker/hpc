import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    const lead = await prisma.lead.update({
      where: { id },
      data: { isViewed: true },
    })

    return NextResponse.json(lead)
  } catch (error) {
    console.error('Mark lead as viewed error:', error)
    return NextResponse.json(
      { error: 'Failed to mark lead as viewed' },
      { status: 500 }
    )
  }
}
