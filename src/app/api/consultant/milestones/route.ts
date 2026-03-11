import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(req: NextRequest) {
  try {
    const { missionId, title, description, dueDate } = await req.json()

    // 1. Verify mission exists and include associated order
    const mission = await prisma.mission.findUnique({
      where: { id: missionId },
      include: { order: true }
    })

    if (!mission) {
      return NextResponse.json({ error: 'Mission not found' }, { status: 404 })
    }

    // 2. Verify order status is active
    if (mission.order.status !== 'ACTIVE') {
      return NextResponse.json({ error: 'Cannot add milestones to a non-active order' }, { status: 400 })
    }

    const milestone = await prisma.milestone.create({
      data: {
        missionId,
        title,
        description,
        dueDate: dueDate ? new Date(dueDate) : null,
        status: 'PENDING'
      }
    })
    return NextResponse.json(milestone)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create milestone' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { milestoneId, status, title, description } = await req.json()
    const milestone = await prisma.milestone.update({
      where: { id: milestoneId },
      data: { 
        status,
        title,
        description,
        completedAt: status === 'COMPLETED' ? new Date() : null
      }
    })
    return NextResponse.json(milestone)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update milestone' }, { status: 500 })
  }
}
