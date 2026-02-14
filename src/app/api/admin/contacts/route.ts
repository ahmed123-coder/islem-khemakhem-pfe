import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const user = await getCurrentUser()
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const contacts = await prisma.contact.findMany({ orderBy: { createdAt: 'desc' } })
  return NextResponse.json(contacts)
}

export async function PUT(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id, ...data } = await req.json()
  const contact = await prisma.contact.update({ where: { id }, data })
  return NextResponse.json(contact)
}

export async function DELETE(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })

  await prisma.contact.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
