import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const slug = searchParams.get('slug')

    if (slug) {
      const service = await prisma.service.findUnique({
        where: { slug, isActive: true },
      })
      if (!service) {
        return NextResponse.json(
          { error: 'Service not found' },
          { status: 404 }
        )
      }
      return NextResponse.json(service)
    }

    const services = await prisma.service.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    })

    return NextResponse.json(services)
  } catch (error) {
    console.error('Fetch services error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch services' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { slug, name, shortDesc, description, icon, image, features, isActive, sortOrder } = body

    if (!slug || !name || !shortDesc || !description) {
      return NextResponse.json(
        { error: 'slug, name, shortDesc, and description are required' },
        { status: 400 }
      )
    }

    const service = await prisma.service.create({
      data: {
        slug,
        name,
        shortDesc,
        description,
        icon: icon || null,
        image: image || null,
        features: features || [],
        isActive: isActive ?? true,
        sortOrder: sortOrder ?? 0,
      },
    })

    return NextResponse.json(service, { status: 201 })
  } catch (error: any) {
    console.error('Create service error:', error)
    if (error?.code === 'P2002') {
      return NextResponse.json(
        { error: 'A service with this slug already exists' },
        { status: 409 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to create service' },
      { status: 500 }
    )
  }
}
