import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const user = await getCurrentUser()
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const services = await prisma.service.findMany({ orderBy: { createdAt: 'desc' } })
  return NextResponse.json(services.map(s => ({ ...s, title: s.name, icon: s.category })))
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { title, description, icon } = await req.json()
  const service = await prisma.service.create({ 
    data: { 
      name: title, 
      description, 
      category: icon 
    } 
  })
  return NextResponse.json({ ...service, title: service.name, icon: service.category })
}

export async function PUT(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id, title, description, icon } = await req.json()
  const service = await prisma.service.update({ 
    where: { id }, 
    data: { 
      name: title, 
      description, 
      category: icon 
    } 
  })
  return NextResponse.json({ ...service, title: service.name, icon: service.category })
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
