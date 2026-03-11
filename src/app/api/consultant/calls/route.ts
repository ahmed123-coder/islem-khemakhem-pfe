import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getConsultantId } from '@/lib/auth'

const prisma = new PrismaClient()

export async function GET(req: NextRequest) {
  const consultantId = await getConsultantId()
  if (!consultantId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const orderId = req.nextUrl.searchParams.get('orderId')
  if (!orderId) return NextResponse.json({ error: 'Order ID required' }, { status: 400 })

  try {
    const order = await prisma.order.findUnique({ where: { id: orderId } })
    if (!order || order.consultantId !== consultantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const calls = await prisma.call.findMany({
      where: { orderId },
      orderBy: { startedAt: 'desc' }
    })
    return NextResponse.json(calls)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch calls' }, { status: 500 })
  }
}
