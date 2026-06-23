import { NextRequest } from 'next/server'
import { requireAuth } from '@/lib/auth/middleware'
import { handleError, successResponse } from '@/lib/errors/handler'
import { uploadImage } from '@/lib/cloudinary'

export async function POST(request: NextRequest) {
  const authResult = requireAuth(request)
  if (!authResult.success) return authResult.response!

  try {
    const formData = await request.formData()
    const file = formData.get('image') as File
    
    if (!file) {
      return handleError(new Error('No file uploaded'), request)
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const imageUrl = await uploadImage(buffer, 'heroes')

    return successResponse({ imageUrl }, 'Image uploaded successfully')
  } catch (error) {
    return handleError(error, request)
  }
}

