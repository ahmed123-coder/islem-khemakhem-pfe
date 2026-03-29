import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const user = await getCurrentUser()
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const blogs = await prisma.blog.findMany({ orderBy: { createdAt: 'desc' } })
  return NextResponse.json(blogs, { status: 200 })
}

import { uploadImage } from '@/lib/cloudinary'

export async function POST(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const formData = await req.formData()
  const title = formData.get('title') as string
  const content = formData.get('content') as string
  const excerpt = formData.get('excerpt') as string | null
  const published = formData.get('published') === 'true'

  const iconFile = formData.get('icon') as File | null
  const imageFile = formData.get('image') as File | null

  let iconUrl = null
  if (iconFile) {
    const bytes = await iconFile.arrayBuffer()
    iconUrl = await uploadImage(Buffer.from(bytes), 'blogs')
  }

  let imageUrl = null
  if (imageFile) {
    const bytes = await imageFile.arrayBuffer()
    imageUrl = await uploadImage(Buffer.from(bytes), 'blogs')
  }

  const blog = await prisma.blog.create({ 
    data: {
      title,
      content,
      excerpt,
      published,
      icon: iconUrl,
      image: imageUrl
    }
  })
  return NextResponse.json(blog, { status: 201 })
}

export async function PUT(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const formData = await req.formData()
  const id = formData.get('id') as string
  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })

  const title = formData.get('title') as string
  const content = formData.get('content') as string
  const excerpt = formData.get('excerpt') as string | null
  const publishedRaw = formData.get('published')

  const iconFile = formData.get('icon') as File | null
  const imageFile = formData.get('image') as File | null

  const dataToUpdate: any = {}
  if (title) dataToUpdate.title = title
  if (content) dataToUpdate.content = content
  if (excerpt !== null) dataToUpdate.excerpt = excerpt
  if (publishedRaw !== null) dataToUpdate.published = publishedRaw === 'true'

  if (iconFile) {
    const bytes = await iconFile.arrayBuffer()
    dataToUpdate.icon = await uploadImage(Buffer.from(bytes), 'blogs')
  }

  if (imageFile) {
    const bytes = await imageFile.arrayBuffer()
    dataToUpdate.image = await uploadImage(Buffer.from(bytes), 'blogs')
  }

  const blog = await prisma.blog.update({ 
    where: { id }, 
    data: dataToUpdate 
  })
  return NextResponse.json(blog, { status: 201 })
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
  return NextResponse.json({ success: true }, { status: 200 })
}
