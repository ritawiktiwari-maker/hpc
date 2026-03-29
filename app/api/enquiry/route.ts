import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, mobile, email, address, serviceInterest, message } = body

    if (!name || !mobile) {
      return NextResponse.json(
        { error: 'Name and mobile number are required' },
        { status: 400 }
      )
    }

    const lead = await prisma.lead.create({
      data: {
        name,
        mobile,
        email: email || null,
        address: address || null,
        serviceInterest: serviceInterest || null,
        message: message || null,
        source: 'Website',
        isViewed: false,
      },
    })

    return NextResponse.json(
      { success: true, message: 'Enquiry submitted successfully', lead },
      { status: 201 }
    )
  } catch (error) {
    console.error('Enquiry creation error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to submit enquiry' },
      { status: 500 }
    )
  }
}
