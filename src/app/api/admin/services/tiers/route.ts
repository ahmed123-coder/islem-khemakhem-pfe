import { NextRequest } from 'next/server'
import { requireAuth } from '@/lib/auth/middleware'
import { prisma } from '@/lib/prisma'
import { handleError, successResponse } from '@/lib/errors/handler'
import { TierType } from '@prisma/client'

export async function GET(req: NextRequest) {
  const authResult = requireAuth(req, ['ADMIN'])
  if (!authResult.success) return authResult.response!

  try {
    const { searchParams } = new URL(req.url)
    const serviceId = searchParams.get('serviceId')

    if (!serviceId) {
      return handleError(new Error('Service ID is required'), req)
    }

    const tiers = await prisma.serviceTier.findMany({
      where: { serviceId },
      orderBy: { price: 'asc' }
    })
    return successResponse(tiers)
  } catch (error) {
    return handleError(error, req)
  }
}

export async function POST(req: NextRequest) {
  const authResult = requireAuth(req, ['ADMIN'])
  if (!authResult.success) return authResult.response!

  try {
    const body = await req.json()
    const { serviceId, tierType, price, maxMessages, maxCallDuration, canSelectConsultant, description, sessionsConfig } = body

    if (!serviceId || !tierType || price === undefined) {
      return handleError(new Error('Missing required fields'), req)
    }

    const tier = await prisma.serviceTier.create({
      data: {
        serviceId,
        tierType: tierType as TierType,
        price: Number(price),
        maxMessages: maxMessages ? Number(maxMessages) : null,
        maxCallDuration: maxCallDuration ? Number(maxCallDuration) : null,
        canSelectConsultant: !!canSelectConsultant,
        description,
        sessionsConfig: sessionsConfig ? (typeof sessionsConfig === 'string' ? JSON.parse(sessionsConfig) : sessionsConfig) : null
      }
    })

    return successResponse(tier, 'Service tier created successfully', 201)
  } catch (error: any) {
    return handleError(error, req)
  }
}

export async function PUT(req: NextRequest) {
  const authResult = requireAuth(req, ['ADMIN'])
  if (!authResult.success) return authResult.response!

  try {
    const body = await req.json()
    const { id, tierType, price, maxMessages, maxCallDuration, canSelectConsultant, description, sessionsConfig } = body

    if (!id) {
      return handleError(new Error('ID is required'), req)
    }

    const tier = await prisma.serviceTier.update({
      where: { id },
      data: {
        tierType: tierType as TierType,
        price: Number(price),
        maxMessages: maxMessages ? Number(maxMessages) : null,
        maxCallDuration: maxCallDuration ? Number(maxCallDuration) : null,
        canSelectConsultant: !!canSelectConsultant,
        description,
        sessionsConfig: sessionsConfig ? (typeof sessionsConfig === 'string' ? JSON.parse(sessionsConfig) : sessionsConfig) : null
      }
    })

    return successResponse(tier, 'Service tier updated successfully')
  } catch (error: any) {
    return handleError(error, req)
  }
}

export async function DELETE(req: NextRequest) {
  const authResult = requireAuth(req, ['ADMIN'])
  if (!authResult.success) return authResult.response!

  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return handleError(new Error('ID is required'), req)
    }

    await prisma.serviceTier.delete({
      where: { id }
    })

    return successResponse({ success: true }, 'Service tier deleted successfully')
  } catch (error) {
    return handleError(error, req)
  }
}

