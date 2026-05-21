// SECURITY: Backend Authorization - Admin-only route protection
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { requireAuth } from '@/lib/auth/middleware'
import { handleError, successResponse } from '@/lib/errors/handler'

export async function GET(request: NextRequest) {
  // Authenticate and authorize - ADMIN only
  const authResult = requireAuth(request, ['ADMIN']);
  if (!authResult.success) {
    return authResult.response;
  }

  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        firstName: true,
        phone: true,
        company: true,
        matriculeFiscale: true,
        sector: true,
        address: true,
        needs: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        _count: { select: { orders: true, reservations: true } },
        orders: {
          select: {
            id: true,
            status: true,
            createdAt: true,
            serviceTier: {
              select: {
                tierType: true,
                price: true,
                service: { select: { name: true } }
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      },
      orderBy: { createdAt: 'desc' },
    })
    return successResponse(users);
  } catch (error) {
    return handleError(error, request);
  }
}

export async function POST(request: NextRequest) {
  // Authenticate and authorize - ADMIN only
  const authResult = requireAuth(request, ['ADMIN']);
  if (!authResult.success) {
    return authResult.response;
  }

  try {
    const body = await request.json()
    const { email, password, name, firstName, phone, company, matriculeFiscale, sector, address, needs, role } = body
    
    const hashedPassword = await bcrypt.hash(password, 10)
    
    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        firstName,
        phone,
        company,
        matriculeFiscale,
        sector,
        address,
        needs,
        role: role || 'CLIENT',
      },
    })
    
    return successResponse(newUser, 'User created successfully', 201);
  } catch (error) {
    return handleError(error, request);
  }
}

export async function PUT(request: NextRequest) {
  // Authenticate and authorize - ADMIN only
  const authResult = requireAuth(request, ['ADMIN']);
  if (!authResult.success) {
    return authResult.response;
  }

  try {
    const body = await request.json()
    const { id, email, name, firstName, phone, company, matriculeFiscale, sector, address, needs, role, isActive } = body
    
    const updatedUser = await prisma.user.update({
      where: { id },
      data: { email, name, firstName, phone, company, matriculeFiscale, sector, address, needs, role, ...(isActive !== undefined && { isActive }) },
    })
    
    return successResponse(updatedUser, 'User updated successfully');
  } catch (error) {
    return handleError(error, request);
  }
}
// END SECURITY: Backend Authorization - Admin route protection complete

