import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const user = await getCurrentUser()
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const services = await prisma.service.findMany({ orderBy: { createdAt: 'desc' } })
  return NextResponse.json(services)
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { name, description, category, logo } = await req.json()
  const service = await prisma.service.create({ 
    data: { 
      name, 
      description, 
      category,
      logo
    } 
  })
  return NextResponse.json(service)
}

export async function PUT(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id, name, description, category, logo, isActive } = await req.json()
  const service = await prisma.service.update({ 
    where: { id }, 
    data: { 
      name, 
      description, 
      category,
      logo,
      isActive: isActive !== undefined ? isActive : true
    } 
  })
  return NextResponse.json(service)
}

export async function DELETE(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })

  await prisma.service.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
