import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { uploadImage } from '@/lib/cloudinary'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('logo') as File
    
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
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

    return NextResponse.json({ success: true, logoUrl })
  } catch (error) {
    console.error('Logo upload error:', error)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
