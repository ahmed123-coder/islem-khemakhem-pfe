import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth/middleware'
import { handleError, successResponse } from '@/lib/errors/handler'

export async function GET(req: NextRequest) {
  try {
    const faqs = await prisma.faq.findMany({
      orderBy: { order: 'asc' }
    })
    return successResponse(faqs)
  } catch (error) {
    return handleError(error, req)
  }
}

export async function POST(req: NextRequest) {
  const authResult = requireAuth(req, ['ADMIN'])
  if (!authResult.success) return authResult.response!

  try {
    const data = await req.json()
    const { question, answer, order, isActive } = data

    if (!question || !answer) {
      return handleError(new Error('Missing required fields'), req)
    }

    const faq = await prisma.faq.create({
      data: {
        question,
        answer,
        order: order || 0,
        isActive: isActive !== undefined ? isActive : true
      }
    })
    return successResponse(faq, 'FAQ created successfully', 201)
  } catch (error) {
    return handleError(error, req)
  }
}

