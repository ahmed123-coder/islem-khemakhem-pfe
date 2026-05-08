import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth/middleware'
import { handleError, successResponse } from '@/lib/errors/handler'
import { uploadImage } from '@/lib/cloudinary'

export async function POST(request: NextRequest) {
  const authResult = requireAuth(request, ['ADMIN'])
  if (!authResult.success) return authResult.response!

  try {
    const formData = await request.formData()
    const file = formData.get('logo') as File
    
    if (!file) {
      return handleError(new Error('No file uploaded'), request)
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Upload logo to Cloudinary
    const logoUrl = await uploadImage(buffer, 'logos')

    // Update logo in siteContent
    let siteLogo = await prisma.siteContent.findUnique({ where: { key: 'logo' } })
    if (siteLogo) {
      await prisma.siteContent.update({
        where: { key: 'logo' },
        data: { value: { ...(siteLogo.value as any), url: logoUrl } }
      })
    } else {
      await prisma.siteContent.create({
        data: {
          key: 'logo',
          value: { url: logoUrl }
        }
      })
    }

    const footer = await prisma.siteContent.findUnique({ where: { key: 'footer' } })
    if (footer) {
      await prisma.siteContent.update({
        where: { key: 'footer' },
        data: { value: { ...(footer.value as any), logoUrl: logoUrl } }
      })
    }

    return successResponse({ logoUrl }, 'Logo uploaded successfully')
  } catch (error) {
    return handleError(error, request)
  }
}

