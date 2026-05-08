import { NextRequest } from 'next/server'
import { v2 as cloudinary } from 'cloudinary'
import { requireAuth } from '@/lib/auth/middleware'
import { handleError, successResponse } from '@/lib/errors/handler'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

function uploadToCloudinary(buffer: Buffer, folder: string, resourceType: 'raw' | 'image' | 'auto'): Promise<string> {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      { folder, resource_type: resourceType },
      (error, result) => {
        if (error) return reject(error)
        if (!result) return reject(new Error('Upload failed'))
        resolve(result.secure_url)
      }
    ).end(buffer)
  })
}

export async function POST(request: NextRequest) {
  const authResult = requireAuth(request)
  if (!authResult.success) return authResult.response!

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const folder = (formData.get('folder') as string) || 'documents'

    if (!file) {
      return handleError(new Error('No file provided'), request)
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const isPdf = file.type === 'application/pdf' || file.name.endsWith('.pdf')
    const resourceType = isPdf ? 'raw' : 'image'

    const url = await uploadToCloudinary(buffer, folder, resourceType)

    return successResponse({ url }, 'Document uploaded successfully')
  } catch (error) {
    return handleError(error, request)
  }
}

