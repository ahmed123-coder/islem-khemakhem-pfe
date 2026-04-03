import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { getCurrentUser } from '@/lib/auth'

export async function GET() {
    const user = await getCurrentUser()
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  
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
        cvUrl: true,
        certifications: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        services: { select: { id: true, name: true } },
        _count: { select: { orders: true, reservations: true, missions: true } }
      },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(consultants)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch consultants' }, { status: 500 })
  }
}

export async function POST(request: Request) {
    const user = await getCurrentUser()
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  
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
    const user = await getCurrentUser()
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  
  try {
    const body = await request.json()
    const { id, email, name, specialty, hourlyRate, bio, imageUrl, isActive, serviceIds } = body

    const data: any = {}
    if (email !== undefined) data.email = email
    if (name !== undefined) data.name = name
    if (specialty !== undefined) data.specialty = specialty
    if (hourlyRate !== undefined) data.hourlyRate = hourlyRate ? parseFloat(hourlyRate) : null
    if (bio !== undefined) data.bio = bio
    if (imageUrl !== undefined) data.imageUrl = imageUrl
    if (isActive !== undefined) data.isActive = isActive
    if (serviceIds !== undefined) data.services = { set: serviceIds.map((id: string) => ({ id })) }
    
    const consultant = await prisma.consultant.update({ where: { id }, data })
    
    return NextResponse.json(consultant)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update consultant' }, { status: 500 })
  }
}
