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
        orderId: true
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

    const { startTime, endTime } = await req.json()

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
        status: 'PENDING'
      }
    })

    // Create Zoom Meeting
    try {
      const durationMinutes = Math.round((new Date(endTime).getTime() - new Date(startTime).getTime()) / 60000)
      const zoomMeeting = await createZoomMeeting({
        topic: `Consultation: ${order.serviceTier.service.name} - ${user.name || user.email}`,
        startTime: new Date(startTime).toISOString(),
        duration: durationMinutes > 0 ? durationMinutes : 60,
      })

      await prisma.reservation.update({
        where: { id: reservation.id },
        data: {
          zoomJoinUrl: zoomMeeting.join_url,
          zoomPassword: zoomMeeting.password,
        }
      })
    } catch (zoomError) {
      console.error('Failed to create Zoom meeting:', zoomError)
    }

    // Notify the consultant
    const { notifyNewReservation } = await import('@/lib/notification-service')
    await notifyNewReservation(reservation.id)

    return NextResponse.json(reservation)
  } catch (error) {
    console.error('Reservation error:', error)
    return NextResponse.json({ error: 'Failed to create reservation' }, { status: 500 })
  }
}
