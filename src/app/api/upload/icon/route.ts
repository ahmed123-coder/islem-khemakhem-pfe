import { NextRequest } from 'next/server'
import { requireAuth } from '@/lib/auth/middleware'
import { handleError, successResponse } from '@/lib/errors/handler'
import { uploadImage } from '@/lib/cloudinary'

export async function POST(request: NextRequest) {
  const authResult = requireAuth(request, ['ADMIN'])
  if (!authResult.success) return authResult.response!

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return handleError(new Error('No file provided'), request)
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const url = await uploadImage(buffer, 'icons')
    
    return successResponse({ url }, 'Icon uploaded successfully')
  } catch (error) {
    return handleError(error, request)
  }
}

