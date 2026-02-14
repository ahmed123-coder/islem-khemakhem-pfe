import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const user = await getCurrentUser()
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const blogs = await prisma.blog.findMany({ orderBy: { createdAt: 'desc' } })
  return NextResponse.json(blogs)
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const data = await req.json()
  const blog = await prisma.blog.create({ data })
  return NextResponse.json(blog)
}

export async function PUT(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id, ...data } = await req.json()
  const blog = await prisma.blog.update({ where: { id }, data })
  return NextResponse.json(blog)
}

export async function DELETE(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })

  await prisma.blog.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
