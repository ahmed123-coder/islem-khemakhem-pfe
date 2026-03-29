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

import { uploadImage } from '@/lib/cloudinary'

export async function POST(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const formData = await req.formData()
  const name = formData.get('name') as string
  const description = formData.get('description') as string
  const category = formData.get('category') as string | null

  const iconFile = formData.get('icon') as File | null
  const imageFile = formData.get('image') as File | null

  let iconUrl = null
  if (iconFile) {
    const bytes = await iconFile.arrayBuffer()
    iconUrl = await uploadImage(Buffer.from(bytes), 'services')
  }

  let imageUrl = null
  if (imageFile) {
    const bytes = await imageFile.arrayBuffer()
    imageUrl = await uploadImage(Buffer.from(bytes), 'services')
  }

  const service = await prisma.service.create({ 
    data: { 
      name, 
      description, 
      category,
      icon: iconUrl,
      image: imageUrl
    } 
  })
  return NextResponse.json(service)
}

export async function PUT(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const formData = await req.formData()
  const id = formData.get('id') as string
  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })

  const name = formData.get('name') as string
  const description = formData.get('description') as string
  const category = formData.get('category') as string | null
  const isActiveRaw = formData.get('isActive')

  const iconFile = formData.get('icon') as File | null
  const imageFile = formData.get('image') as File | null

  const dataToUpdate: any = {}
  if (name) dataToUpdate.name = name
  if (description) dataToUpdate.description = description
  if (category !== null) dataToUpdate.category = category
  if (isActiveRaw !== null) dataToUpdate.isActive = isActiveRaw === 'true'

  if (iconFile) {
    const bytes = await iconFile.arrayBuffer()
    dataToUpdate.icon = await uploadImage(Buffer.from(bytes), 'services')
  }

  if (imageFile) {
    const bytes = await imageFile.arrayBuffer()
    dataToUpdate.image = await uploadImage(Buffer.from(bytes), 'services')
  }

  const service = await prisma.service.update({ 
    where: { id }, 
    data: dataToUpdate
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
