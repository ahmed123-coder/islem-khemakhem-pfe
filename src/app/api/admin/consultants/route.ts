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
        firstName: true,
        phone: true,
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
    console.log('POST /api/admin/consultants body:', body)
    const { email, password, name, firstName, phone, specialty, hourlyRate, bio, imageUrl, cvUrl, certifications, isActive, serviceIds } = body
    
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }
    if (!password) {
      return NextResponse.json({ error: 'Password is required' }, { status: 400 })
    }
    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    const exists = await prisma.consultant.findUnique({ where: { email } })
    if (exists) {
      return NextResponse.json({ error: 'Email already in use' }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    
    const consultant = await prisma.consultant.create({
      data: {
        email,
        password: hashedPassword,
        name,
        firstName: firstName || null,
        phone: phone || null,
        specialty: specialty || null,
        hourlyRate: (hourlyRate && !isNaN(parseFloat(hourlyRate))) ? parseFloat(hourlyRate) : null,
        bio: bio || null,
        imageUrl: imageUrl || null,
        cvUrl: cvUrl || null,
        certifications: Array.isArray(certifications) ? certifications : [],
        isActive: isActive ?? true,
        services: serviceIds && Array.isArray(serviceIds) && serviceIds.length > 0 ? {
          connect: serviceIds.map((id: string) => ({ id }))
        } : undefined,
      },
      include: {
        services: { select: { id: true, name: true } }
      }
    })
    
    return NextResponse.json(consultant)
  } catch (error: any) {
    console.error('POST /api/admin/consultants error:', error)
    return NextResponse.json({ 
      error: 'Failed to create consultant', 
      details: error.message || String(error),
      code: error.code // Prisma error codes
    }, { status: 500 })
  }
}

export async function PUT(request: Request) {
    const user = await getCurrentUser()
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  
  try {
    const body = await request.json()
    const { id, email, name, firstName, phone, specialty, hourlyRate, bio, imageUrl, cvUrl, certifications, isActive, serviceIds } = body

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }

    const data: any = {}
    if (email !== undefined) data.email = email
    if (name !== undefined) data.name = name
    if (firstName !== undefined) data.firstName = firstName || null
    if (phone !== undefined) data.phone = phone || null
    if (specialty !== undefined) data.specialty = specialty || null
    if (hourlyRate !== undefined) data.hourlyRate = (hourlyRate && !isNaN(parseFloat(hourlyRate))) ? parseFloat(hourlyRate) : null
    if (bio !== undefined) data.bio = bio || null
    if (imageUrl !== undefined) data.imageUrl = imageUrl || null
    if (cvUrl !== undefined) data.cvUrl = cvUrl || null
    if (certifications !== undefined) data.certifications = certifications || []
    if (isActive !== undefined) data.isActive = isActive
    if (serviceIds !== undefined) {
      data.services = {
        set: serviceIds.map((id: string) => ({ id }))
      }
    }
    
    const consultant = await prisma.consultant.update({ where: { id }, data })
    
    return NextResponse.json(consultant)
  } catch (error) {
    console.error('PUT /api/admin/consultants error:', error)
    return NextResponse.json({ error: 'Failed to update consultant', details: String(error) }, { status: 500 })
  }
}
