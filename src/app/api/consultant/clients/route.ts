import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(req: NextRequest) {
  const consultantId = req.nextUrl.searchParams.get('consultantId')
  if (!consultantId) return NextResponse.json({ error: 'Consultant ID required' }, { status: 400 })

  try {
    const orders = await prisma.order.findMany({
      where: { consultantId },
      include: {
        client: { select: { id: true, name: true, email: true } },
        serviceTier: { include: { service: true } }
      },
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(orders)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch clients' }, { status: 500 })
  }
}
