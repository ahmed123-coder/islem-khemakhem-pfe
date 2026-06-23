import { NextRequest } from 'next/server'
import { requireAuth } from '@/lib/auth/middleware'
import { prisma } from '@/lib/prisma'
import { handleError, successResponse } from '@/lib/errors/handler'

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
      return handleError(new Error('Content not found'), req)
    }

    return successResponse(content)
  } catch (error) {
    return handleError(error, req)
  }
}

// PUT /api/content/[key] - Admin only
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  const authResult = requireAuth(req, ['ADMIN'])
  if (!authResult.success) return authResult.response!

  try {
    const { key } = await params
    const { value } = await req.json()

    if (!value) {
      return handleError(new Error('Value is required'), req)
    }

    // Upsert: create if not exists, update if exists
    const content = await prisma.siteContent.upsert({
      where: { key },
      update: { value },
      create: { key, value }
    })

    return successResponse(content, 'Content updated successfully')
  } catch (error) {
    return handleError(error, req)
  }
}

