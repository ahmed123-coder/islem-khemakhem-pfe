import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createZoomMeeting } from '@/lib/zoom'

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'CLIENT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { serviceTierId, consultantId, startTime, endTime } = await request.json()

    if (!serviceTierId || !consultantId || !startTime || !endTime) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const serviceTier = await prisma.serviceTier.findUnique({
      where: { id: serviceTierId },
      include: { service: true }
    })

    if (!serviceTier) {
      return NextResponse.json({ error: 'Service tier not found' }, { status: 404 })
    }

    const consultant = await prisma.consultant.findUnique({
      where: { id: consultantId }
    })

    if (!consultant) {
      return NextResponse.json({ error: 'Consultant not found' }, { status: 404 })
    }

    // Check for overlapping reservations
    const overlapping = await prisma.reservation.findFirst({
      where: {
        consultantId: consultantId,
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
      return NextResponse.json({ error: 'Ce créneau est déjà réservé' }, { status: 409 })
    }

    // Create order
    const order = await prisma.order.create({
      data: {
        clientId: user.id,
        consultantId: consultantId,
        serviceTierId: serviceTierId,
        status: 'ACTIVE'
      }
    })

    // Create reservation
    const reservation = await prisma.reservation.create({
      data: {
        clientId: user.id,
        consultantId: consultantId,
        serviceTierId: serviceTierId,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        status: 'PENDING'
      }
    })

    // Create Zoom Meeting
    let zoomData = {}
    try {
      const zoomMeeting = await createZoomMeeting({
        topic: `Consultation: ${serviceTier.service.name} - ${user.name || user.email}`,
        startTime: new Date(startTime).toISOString(),
        duration: serviceTier.maxCallDuration || 60,
      })

      zoomData = {
        zoomMeetingId: zoomMeeting.id.toString(),
        zoomJoinUrl: zoomMeeting.join_url,
        zoomPassword: zoomMeeting.password,
      }

      // Update reservation with zoom details
      await prisma.reservation.update({
        where: { id: reservation.id },
        data: zoomData
      })
    } catch (zoomError) {
      console.error('Failed to create Zoom meeting:', zoomError)
      // Note: We continue even if Zoom fails so the booking is not lost
      // In a real app, you might want to queue a retry or notify admin
    }

    // Create notification
    await prisma.notification.create({
      data: {
        userId: user.id,
        type: 'ORDER',
        title: 'Commande créée',
        message: `Votre commande pour ${serviceTier.service.name} (${serviceTier.tierType}) a été créée. Appel prévu le ${new Date(startTime).toLocaleDateString()} de ${new Date(startTime).getHours()}h à ${new Date(endTime).getHours()}h.`
      }
    })

    return NextResponse.json({
      order,
      reservation,
      consultant: {
        id: consultant.id,
        name: consultant.name,
        specialty: consultant.specialty
      }
    })
  } catch (error) {
    console.error('Purchase error:', error)
    return NextResponse.json({ error: 'Purchase failed' }, { status: 500 })
  }
}
