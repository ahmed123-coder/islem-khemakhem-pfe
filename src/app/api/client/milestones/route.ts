import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'CLIENT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { milestoneId, status } = await req.json()

    if (status === 'PENDING') {
      return NextResponse.json({ error: 'Clients cannot set milestones to pending' }, { status: 400 })
    }

    // Verify the milestone belongs to a mission in an order owned by this client
    const milestone = await prisma.milestone.findUnique({
      where: { id: milestoneId },
      include: {
        mission: {
          include: {
            order: true
          }
        }
      }
    })

    if (!milestone || milestone.mission.order.clientId !== user.id) {
      return NextResponse.json({ error: 'Milestone not found or unauthorized' }, { status: 403 })
    }

    const updatedMilestone = await prisma.milestone.update({
      where: { id: milestoneId },
      data: {
        status,
        completedAt: status === 'COMPLETED' ? new Date() : null
      }
    })

    return NextResponse.json(updatedMilestone)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update milestone' }, { status: 500 })
  }
}
