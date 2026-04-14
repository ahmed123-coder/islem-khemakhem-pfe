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
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        firstName: true,
        phone: true,
        company: true,
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
    return NextResponse.json(users)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const user = await getCurrentUser()
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { email, password, name, firstName, phone, company, sector, address, needs, role } = body
    
    const hashedPassword = await bcrypt.hash(password, 10)
    
    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        firstName,
        phone,
        company,
        sector,
        address,
        needs,
        role: role || 'CLIENT',
      },
    })
    
    return NextResponse.json(newUser)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  const user = await getCurrentUser()
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { id, email, name, firstName, phone, company, sector, address, needs, role, isActive } = body
    
    const updatedUser = await prisma.user.update({
      where: { id },
      data: { email, name, firstName, phone, company, sector, address, needs, role, ...(isActive !== undefined && { isActive }) },
    })
    
    return NextResponse.json(updatedUser)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 })
  }
}
