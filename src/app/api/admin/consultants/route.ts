import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { requireAuth } from '@/lib/auth/middleware'
import { handleError, successResponse } from '@/lib/errors/handler'

export async function GET(req: NextRequest) {
  const authResult = requireAuth(req, ['ADMIN'])
  if (!authResult.success) return authResult.response!

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
    return successResponse(consultants)
  } catch (error) {
    return handleError(error, req)
  }
}

export async function POST(req: NextRequest) {
  const authResult = requireAuth(req, ['ADMIN'])
  if (!authResult.success) return authResult.response!

  try {
    const body = await req.json()
    const { email, password, name, firstName, phone, specialty, hourlyRate, bio, imageUrl, cvUrl, certifications, isActive, serviceIds } = body
    
    if (!email) {
      return handleError(new Error('Email is required'), req)
    }
    if (!password) {
      return handleError(new Error('Password is required'), req)
    }
    if (!name) {
      return handleError(new Error('Name is required'), req)
    }

    const exists = await prisma.consultant.findUnique({ where: { email } })
    if (exists) {
      return handleError(new Error('Email already in use'), req)
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
    
    return successResponse(consultant, 'Consultant created successfully', 201)
  } catch (error: any) {
    return handleError(error, req)
  }
}

export async function PUT(req: NextRequest) {
  const authResult = requireAuth(req, ['ADMIN'])
  if (!authResult.success) return authResult.response!

  try {
    const body = await req.json()
    const { id, email, name, firstName, phone, specialty, hourlyRate, bio, imageUrl, cvUrl, certifications, isActive, serviceIds } = body

    if (!id) {
      return handleError(new Error('ID is required'), req)
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
    
    return successResponse(consultant, 'Consultant updated successfully')
  } catch (error) {
    return handleError(error, req)
  }
}

