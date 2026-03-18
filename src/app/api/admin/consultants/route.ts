import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function GET() {
  try {
    const consultants = await prisma.consultant.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        specialty: true,
        hourlyRate: true,
        bio: true,
        imageUrl: true,
        isActive: true,
        createdAt: true,
        services: {
          select: { id: true }
        }
      },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(consultants)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch consultants' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password, name, specialty, hourlyRate, bio, imageUrl, isActive, serviceIds } = body
    
    const hashedPassword = await bcrypt.hash(password, 10)
    
    const consultant = await prisma.consultant.create({
      data: {
        email,
        password: hashedPassword,
        name,
        specialty,
        hourlyRate: hourlyRate ? parseFloat(hourlyRate) : null,
        bio,
        imageUrl,
        isActive: isActive ?? true,
        services: serviceIds ? {
          connect: serviceIds.map((id: string) => ({ id }))
        } : undefined,
      },
    })
    
    return NextResponse.json(consultant)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create consultant' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { id, email, name, specialty, hourlyRate, bio, imageUrl, isActive, serviceIds } = body
    
    const consultant = await prisma.consultant.update({
      where: { id },
      data: {
        email,
        name,
        specialty,
        hourlyRate: hourlyRate ? parseFloat(hourlyRate) : null,
        bio,
        imageUrl,
        isActive,
        services: serviceIds ? {
          set: serviceIds.map((id: string) => ({ id }))
        } : undefined,
      },
    })
    
    return NextResponse.json(consultant)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update consultant' }, { status: 500 })
  }
}
