import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { uploadImage } from '@/lib/cloudinary'
import { requireAuth } from '@/lib/auth/middleware'
import { handleError, successResponse } from '@/lib/errors/handler'

export async function GET() {
  try {
    const content = await prisma.siteContent.findUnique({ where: { key: 'hero_images' } })
    return successResponse({ images: content?.value || [] });
  } catch (error) {
    return successResponse({ images: [] });
  }
}

export async function POST(request: NextRequest) {
  const authResult = requireAuth(request, ['ADMIN']);
  if (!authResult.success) return authResult.response;
  
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    
    if (!file) {
      return handleError(new Error('No file provided'), request);
    }

    const content = await prisma.siteContent.findUnique({ where: { key: 'hero_images' } })
    const images = content?.value ? (Array.isArray(content.value) ? content.value : []) : []
    
    if (images.length >= 3) {
      return handleError(new Error('Maximum 3 images allowed'), request);
    }
    
    const bytes = await file.arrayBuffer()
    const imageUrl = await uploadImage(Buffer.from(bytes), 'hero')
    
    images.push(imageUrl)
    
    await prisma.siteContent.upsert({
      where: { key: 'hero_images' },
      update: { value: images },
      create: { key: 'hero_images', value: images }
    })
    
    return successResponse({ success: true, url: imageUrl });
  } catch (error) {
    return handleError(error, request);
  }
}

export async function DELETE(request: NextRequest) {
  const authResult = requireAuth(request, ['ADMIN']);
  if (!authResult.success) return authResult.response;
  
  try {
    const { imageUrl } = await request.json()
    
    const content = await prisma.siteContent.findUnique({ where: { key: 'hero_images' } })
    const images = content?.value ? (Array.isArray(content.value) ? content.value as string[] : []) : []
    
    const filtered = images.filter((img: string) => img !== imageUrl)
    
    await prisma.siteContent.update({
      where: { key: 'hero_images' },
      data: { value: filtered }
    })
    
    return successResponse({ success: true });
  } catch (error) {
    return handleError(error, request);
  }
}
