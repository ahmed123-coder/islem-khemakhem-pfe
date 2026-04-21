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

    const { serviceTierId, consultantId, startTime, endTime, meetingType, sessionIndex, sessionLabel } = await request.json()

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

    // Check for overlapping reservations with a 15-minute buffer
    const BUFFER_MS = 15 * 60 * 1000
    const bufferStartTime = new Date(new Date(startTime).getTime() - BUFFER_MS)
    const bufferEndTime = new Date(new Date(endTime).getTime() + BUFFER_MS)

    const overlapping = await prisma.reservation.findFirst({
      where: {
        consultantId: consultantId,
        AND: [
          { startTime: { lt: bufferEndTime } },
          { endTime: { gt: bufferStartTime } }
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
        orderId: order.id,
        clientId: user.id,
        consultantId: consultantId,
        serviceTierId: serviceTierId,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        meetingType: meetingType === 'SUR_PLACE' ? 'SUR_PLACE' : 'ZOOM',
        sessionIndex: sessionIndex || 0,
        sessionLabel: sessionLabel || null,
        status: 'PENDING'
      }
    })

    // Note: Zoom meeting will be created when consultant confirms the reservation

    // Create notification
    await prisma.notification.create({
      data: {
        userId: user.id,
        type: 'ORDER',
        title: 'Commande créée',
        message: `Votre commande pour ${serviceTier.service.name} (${serviceTier.tierType}) a été créée. RDV prévu le ${new Date(startTime).toLocaleDateString('fr-FR')} de ${new Date(startTime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} à ${new Date(endTime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}.`
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
