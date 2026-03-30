import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    const { key, title, alt, section, imageData, isActive, sortOrder } = body

    const image = await prisma.siteImage.update({
      where: { id },
      data: {
        ...(key !== undefined && { key }),
        ...(title !== undefined && { title }),
        ...(alt !== undefined && { alt }),
        ...(section !== undefined && { section }),
        ...(imageData !== undefined && { imageData }),
        ...(isActive !== undefined && { isActive }),
        ...(sortOrder !== undefined && { sortOrder }),
      },
    })

    return NextResponse.json(image)
  } catch (error: any) {
    console.error('Update site image error:', error)
    if (error?.code === 'P2025') {
      return NextResponse.json({ error: 'Image not found' }, { status: 404 })
    }
    if (error?.code === 'P2002') {
      return NextResponse.json({ error: 'An image with this key already exists' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Failed to update image' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    await prisma.siteImage.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Delete site image error:', error)
    if (error?.code === 'P2025') {
      return NextResponse.json({ error: 'Image not found' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Failed to delete image' }, { status: 500 })
  }
}
