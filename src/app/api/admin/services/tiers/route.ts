import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { TierType } from '@prisma/client'

export async function GET(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const serviceId = searchParams.get('serviceId')

  if (!serviceId) {
    return NextResponse.json({ error: 'Service ID is required' }, { status: 400 })
  }

  const tiers = await prisma.serviceTier.findMany({
    where: { serviceId },
    orderBy: { price: 'asc' }
  })
  return NextResponse.json(tiers)
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { serviceId, tierType, price, maxMessages, maxCallDuration, canSelectConsultant, description, sessionsConfig } = body

    if (!serviceId || !tierType || price === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
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

    return NextResponse.json(tier)
  } catch (error: any) {
    console.error('Error creating tier:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { id, tierType, price, maxMessages, maxCallDuration, canSelectConsultant, description, sessionsConfig } = body

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
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

    return NextResponse.json(tier)
  } catch (error: any) {
    console.error('Error updating tier:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')

  if (!id) {
    return NextResponse.json({ error: 'ID is required' }, { status: 400 })
  }

  await prisma.serviceTier.delete({
    where: { id }
  })

  return NextResponse.json({ success: true })
}
