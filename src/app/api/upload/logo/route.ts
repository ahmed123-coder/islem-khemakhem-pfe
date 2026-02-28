import { NextRequest, NextResponse } from 'next/server'
import { writeFile } from 'fs/promises'
import { join } from 'path'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('logo') as File
    
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Save to public folder with both timestamped and favicon names
    const timestamp = Date.now()
    const filename = `logo-${timestamp}.jpeg`
    const path = join(process.cwd(), 'public', filename)
    await writeFile(path, buffer)

    // Also save as favicon.ico for browser icon
    const faviconPath = join(process.cwd(), 'public', 'favicon.ico')
    await writeFile(faviconPath, buffer)

    const logoUrl = `/${filename}`

    // Update navbar and footer with new logo URL
    await prisma.siteContent.updateMany({
      where: { key: { in: ['navbar', 'footer'] } },
      data: {
        value: {
          ...(await prisma.siteContent.findFirst({ where: { key: 'navbar' } }))?.value as any,
          logoUrl
        }
      }
    })

    // Update navbar
    const navbar = await prisma.siteContent.findUnique({ where: { key: 'navbar' } })
    if (navbar) {
      await prisma.siteContent.update({
        where: { key: 'navbar' },
        data: { value: { ...(navbar.value as any), logoUrl } }
      })
    }

    // Update footer
    const footer = await prisma.siteContent.findUnique({ where: { key: 'footer' } })
    if (footer) {
      await prisma.siteContent.update({
        where: { key: 'footer' },
        data: { value: { ...(footer.value as any), logoUrl } }
      })
    }

    return NextResponse.json({ success: true, logoUrl })
  } catch (error) {
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
