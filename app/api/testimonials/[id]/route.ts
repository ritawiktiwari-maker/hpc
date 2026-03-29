import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    const { name, location, rating, text, service, isActive } = body

    const testimonial = await prisma.testimonial.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(location !== undefined && { location }),
        ...(rating !== undefined && { rating }),
        ...(text !== undefined && { text }),
        ...(service !== undefined && { service }),
        ...(isActive !== undefined && { isActive }),
      },
    })

    return NextResponse.json(testimonial)
  } catch (error: any) {
    console.error('Update testimonial error:', error)
    if (error?.code === 'P2025') {
      return NextResponse.json(
        { error: 'Testimonial not found' },
        { status: 404 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to update testimonial' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    await prisma.testimonial.delete({ where: { id } })

    return NextResponse.json({ success: true, message: 'Testimonial deleted' })
  } catch (error: any) {
    console.error('Delete testimonial error:', error)
    if (error?.code === 'P2025') {
      return NextResponse.json(
        { error: 'Testimonial not found' },
        { status: 404 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to delete testimonial' },
      { status: 500 }
    )
  }
}
