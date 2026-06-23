import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const content = await prisma.siteContent.findUnique({ where: { key: 'hero_images' } })
    return NextResponse.json({ images: content?.value || [] })
  } catch (error) {
    return NextResponse.json({ images: [] })
  }
}
