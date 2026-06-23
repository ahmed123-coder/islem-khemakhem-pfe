import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth/middleware'
import { handleError, successResponse } from '@/lib/errors/handler'

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const authResult = requireAuth(req, ['ADMIN'])
  if (!authResult.success) return authResult.response!

  try {
    const data = await req.json()
    const { question, answer, order, isActive } = data

    const faq = await prisma.faq.update({
      where: { id: params.id },
      data: {
        question,
        answer,
        order,
        isActive
      }
    })

    return successResponse(faq, 'FAQ updated successfully')
  } catch (error) {
    return handleError(error, req)
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const authResult = requireAuth(req, ['ADMIN'])
  if (!authResult.success) return authResult.response!

  try {
    await prisma.faq.delete({
      where: { id: params.id }
    })
    return successResponse({ success: true }, 'FAQ deleted successfully')
  } catch (error) {
    return handleError(error, req)
  }
}

