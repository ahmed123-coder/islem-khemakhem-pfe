import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createZoomMeeting } from '@/lib/zoom'

export async function GET(req: NextRequest, { params }: { params: { orderId: string } }) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'CLIENT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const order = await prisma.order.findUnique({ 
      where: { id: params.orderId },
      include: { consultant: true }
    })

    if (!order || order.clientId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    if (!order.consultantId) {
      return NextResponse.json({ error: 'No consultant assigned to this order' }, { status: 400 })
    }

    // Fetch all reservations for this consultant to show availability in the calendar grid
    const reservations = await prisma.reservation.findMany({
      where: {
        consultantId: order.consultantId
      },
      select: {
        id: true,
        startTime: true,
        endTime: true,
        status: true,
        orderId: true,
        meetingType: true,
        zoomJoinUrl: true,
        zoomPassword: true
      },
      orderBy: { startTime: 'asc' }
    })

    return NextResponse.json(reservations)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch reservations' }, { status: 500 })
  }
}

export async function POST(req: NextRequest, { params }: { params: { orderId: string } }) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'CLIENT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { startTime, endTime, meetingType } = await req.json()

    if (!startTime || !endTime) {
      return NextResponse.json({ error: 'Missing start or end time' }, { status: 400 })
    }

    const order = await prisma.order.findUnique({
      where: { id: params.orderId },
      include: { 
        serviceTier: { include: { service: true } },
        consultant: true
      }
    })

    if (!order || order.clientId !== user.id || order.status !== 'ACTIVE') {
      return NextResponse.json({ error: 'Order is not active or unauthorized' }, { status: 403 })
    }

    if (!order.consultantId) {
      return NextResponse.json({ error: 'No consultant assigned to this order' }, { status: 400 })
    }

    // Check for overlapping CONFIRMED reservations for this consultant
    const overlapping = await prisma.reservation.findFirst({
      where: {
        consultantId: order.consultantId,
        status: 'CONFIRMED',
        OR: [
          {
            AND: [
              { startTime: { lt: new Date(endTime) } },
              { endTime: { gt: new Date(startTime) } }
            ]
          }
        ]
      }
    })

    if (overlapping) {
      return NextResponse.json({ error: 'Le consultant a déjà une réservation confirmée sur ce créneau' }, { status: 409 })
    }

    // Create reservation
    const reservation = await prisma.reservation.create({
      data: {
        orderId: order.id,
        clientId: user.id,
        consultantId: order.consultantId,
        serviceTierId: order.serviceTierId,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        meetingType: meetingType === 'SUR_PLACE' ? 'SUR_PLACE' : 'ZOOM',
        status: 'PENDING'
      }
    })

    // Notify the consultant
    const { notifyNewReservation } = await import('@/lib/notification-service')
    await notifyNewReservation(reservation.id)

    return NextResponse.json(reservation)
  } catch (error) {
    console.error('Reservation error:', error)
    return NextResponse.json({ error: 'Failed to create reservation' }, { status: 500 })
  }
}
