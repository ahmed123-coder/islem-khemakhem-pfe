import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/content/[key] - Public route
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  try {
    const { key } = await params

    const content = await prisma.siteContent.findUnique({
      where: { key }
    })

    if (!content) {
      return NextResponse.json(
        { error: 'Content not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(content)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch content' },
      { status: 500 }
    )
  }
}

// PUT /api/content/[key] - Admin only
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { key } = await params
    const { value } = await req.json()

    if (!value) {
      return NextResponse.json(
        { error: 'Value is required' },
        { status: 400 }
      )
    }

    // Upsert: create if not exists, update if exists
    const content = await prisma.siteContent.upsert({
      where: { key },
      update: { value },
      create: { key, value }
    })

    return NextResponse.json(content)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update content' },
      { status: 500 }
    )
  }
}
