import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function PATCH(req: NextRequest) {
  try {
    const { milestoneId, status } = await req.json()
    const milestone = await prisma.milestone.update({
      where: { id: milestoneId },
      data: { 
        status,
        completedAt: status === 'COMPLETED' ? new Date() : null
      }
    })
    return NextResponse.json(milestone)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update milestone' }, { status: 500 })
  }
}
