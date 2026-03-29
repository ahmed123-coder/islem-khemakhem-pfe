import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { uploadImage } from '@/lib/cloudinary'

export async function GET() {
  try {
    const content = await prisma.siteContent.findUnique({ where: { key: 'hero_images' } })
    return NextResponse.json({ images: content?.value || [] })
  } catch (error) {
    return NextResponse.json({ images: [] })
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const content = await prisma.siteContent.findUnique({ where: { key: 'hero_images' } })
    const images = content?.value ? (Array.isArray(content.value) ? content.value : []) : []
    
    if (images.length >= 3) {
      return NextResponse.json({ error: 'Maximum 3 images allowed' }, { status: 400 })
    }
    
    const bytes = await file.arrayBuffer()
    const imageUrl = await uploadImage(Buffer.from(bytes), 'hero')
    
    images.push(imageUrl)
    
    await prisma.siteContent.upsert({
      where: { key: 'hero_images' },
      update: { value: images },
      create: { key: 'hero_images', value: images }
    })
    
    return NextResponse.json({ success: true, url: imageUrl })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to add image' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { imageUrl } = await request.json()
    
    const content = await prisma.siteContent.findUnique({ where: { key: 'hero_images' } })
    const images = content?.value ? (Array.isArray(content.value) ? content.value as string[] : []) : []
    
    const filtered = images.filter((img: string) => img !== imageUrl)
    
    await prisma.siteContent.update({
      where: { key: 'hero_images' },
      data: { value: filtered }
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete image' }, { status: 500 })
  }
}
