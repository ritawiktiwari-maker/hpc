import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const section = searchParams.get('section')
    const all = searchParams.get('all') // include inactive for admin

    const where: any = {}
    if (!all) where.isActive = true
    if (section) where.section = section

    const images = await prisma.siteImage.findMany({
      where,
      orderBy: { sortOrder: 'asc' },
    })

    return NextResponse.json(images)
  } catch (error) {
    console.error('Fetch site images error:', error)
    return NextResponse.json({ error: 'Failed to fetch images' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { key, title, alt, section, imageData, isActive, sortOrder } = body

    if (!key || !title || !section || !imageData) {
      return NextResponse.json(
        { error: 'key, title, section, and imageData are required' },
        { status: 400 }
      )
    }

    const image = await prisma.siteImage.create({
      data: {
        key,
        title,
        alt: alt || title,
        section,
        imageData,
        isActive: isActive ?? true,
        sortOrder: sortOrder ?? 0,
      },
    })

    return NextResponse.json(image, { status: 201 })
  } catch (error: any) {
    console.error('Create site image error:', error)
    if (error?.code === 'P2002') {
      return NextResponse.json(
        { error: 'An image with this key already exists' },
        { status: 409 }
      )
    }
    return NextResponse.json({ error: 'Failed to create image' }, { status: 500 })
  }
}
