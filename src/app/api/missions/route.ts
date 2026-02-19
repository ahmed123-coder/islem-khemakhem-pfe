import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/middleware'

// GET - List missions (filtered by role)
export async function GET(req: NextRequest) {
  const authResult = await requireAuth(req)
  if ('error' in authResult) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status })
  }

  const { user } = authResult
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')

  try {
    // Get single mission
    if (id) {
      const mission = await prisma.mission.findUnique({
        where: { id },
        include: {
          client: { select: { id: true, name: true, email: true } },
          consultant: { select: { id: true, name: true, email: true } },
          subscription: { select: { id: true, status: true } }
        }
      })

      if (!mission) {
        return NextResponse.json({ error: 'Mission not found' }, { status: 404 })
      }

      // Check access
      if (user.role === 'CLIENT' && mission.clientId !== user.userId) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }

      return NextResponse.json(mission)
    }

    // List missions based on role
    const where: any = {}
    if (user.role === 'CLIENT') {
      where.clientId = user.userId
    } else if (user.role === 'CONSULTANT') {
      where.consultantId = user.userId
    }

    const missions = await prisma.mission.findMany({
      where,
      include: {
        client: { select: { id: true, name: true, email: true } },
        consultant: { select: { id: true, name: true, email: true } },
        subscription: { select: { id: true, status: true } }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(missions)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch missions' }, { status: 500 })
  }
}

// POST - Create mission
export async function POST(req: NextRequest) {
  const authResult = await requireAuth(req)
  if ('error' in authResult) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status })
  }

  const { user } = authResult

  try {
    const body = await req.json()
    const { title, description, consultantId, subscriptionId } = body

    if (!title || !consultantId || !subscriptionId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Verify subscription belongs to user and is active
    const subscription = await prisma.subscriptions.findFirst({
      where: {
        id: subscriptionId,
        userId: user.role === 'CLIENT' ? user.userId : undefined,
        status: 'ACTIVE'
      },
      include: { subscription_packages: true }
    })

    if (!subscription) {
      return NextResponse.json({ error: 'Invalid or inactive subscription' }, { status: 400 })
    }

    // Check mission limit
    const maxMissions = subscription.subscription_packages.maxMissions
    if (maxMissions) {
      const missionCount = await prisma.mission.count({
        where: { subscriptionId, status: { in: ['PENDING', 'ACTIVE'] } }
      })

      if (missionCount >= maxMissions) {
        return NextResponse.json({ error: 'Mission limit reached' }, { status: 400 })
      }
    }

    // Verify consultant exists
    const consultant = await prisma.consultant.findUnique({
      where: { id: consultantId }
    })

    if (!consultant) {
      return NextResponse.json({ error: 'Consultant not found' }, { status: 404 })
    }

    const mission = await prisma.mission.create({
      data: {
        title,
        description,
        clientId: user.role === 'CLIENT' ? user.userId : subscription.userId,
        consultantId,
        subscriptionId,
        status: 'PENDING'
      },
      include: {
        client: { select: { id: true, name: true, email: true } },
        consultant: { select: { id: true, name: true, email: true } }
      }
    })

    return NextResponse.json(mission, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create mission' }, { status: 500 })
  }
}

// PUT - Update mission
export async function PUT(req: NextRequest) {
  const authResult = await requireAuth(req)
  if ('error' in authResult) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status })
  }

  const { user } = authResult

  try {
    const body = await req.json()
    const { id, title, description, status, progress } = body

    if (!id) {
      return NextResponse.json({ error: 'Mission ID required' }, { status: 400 })
    }

    // Get existing mission
    const existingMission = await prisma.mission.findUnique({
      where: { id }
    })

    if (!existingMission) {
      return NextResponse.json({ error: 'Mission not found' }, { status: 404 })
    }

    // Check permissions
    if (user.role === 'CLIENT' && existingMission.clientId !== user.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    if (user.role === 'CONSULTANT' && existingMission.consultantId !== user.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Validate progress
    if (progress !== undefined && (progress < 0 || progress > 100)) {
      return NextResponse.json({ error: 'Progress must be between 0 and 100' }, { status: 400 })
    }

    const updateData: any = {}
    if (title !== undefined) updateData.title = title
    if (description !== undefined) updateData.description = description
    if (status !== undefined) updateData.status = status
    if (progress !== undefined) updateData.progress = progress

    const mission = await prisma.mission.update({
      where: { id },
      data: updateData,
      include: {
        client: { select: { id: true, name: true, email: true } },
        consultant: { select: { id: true, name: true, email: true } }
      }
    })

    return NextResponse.json(mission)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update mission' }, { status: 500 })
  }
}

// DELETE - Delete mission
export async function DELETE(req: NextRequest) {
  const authResult = await requireAuth(req)
  if ('error' in authResult) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status })
  }

  const { user } = authResult
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')

  if (!id) {
    return NextResponse.json({ error: 'Mission ID required' }, { status: 400 })
  }

  try {
    const mission = await prisma.mission.findUnique({
      where: { id }
    })

    if (!mission) {
      return NextResponse.json({ error: 'Mission not found' }, { status: 404 })
    }

    // Only admin or client can delete
    if (user.role === 'CLIENT' && mission.clientId !== user.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    if (user.role === 'CONSULTANT') {
      return NextResponse.json({ error: 'Consultants cannot delete missions' }, { status: 403 })
    }

    await prisma.mission.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Mission deleted' })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete mission' }, { status: 500 })
  }
}
