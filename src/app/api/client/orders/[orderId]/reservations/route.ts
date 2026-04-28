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
      return NextResponse.json([])
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
        zoomPassword: true,
        consultantId: true,
        consultant: {
          select: { name: true }
        }
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
      return NextResponse.json({ error: 'Champs requis manquants (startTime/endTime)' }, { status: 400 })
    }

    return await prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: params.orderId },
        include: { 
          serviceTier: true,
          consultant: true,
          reservations: {
            orderBy: { sessionIndex: 'desc' }
          }
        }
      })

      if (!order || order.clientId !== user.id) {
        return NextResponse.json({ error: 'Commande non trouvée' }, { status: 404 })
      }

      if (order.status !== 'ACTIVE') {
        return NextResponse.json({ error: 'Cette commande n\'est plus active' }, { status: 403 })
      }

      if (!order.consultantId) {
        return NextResponse.json({ error: 'Aucun consultant n\'est assigné à cette commande' }, { status: 400 })
      }

      // 1. Check for active (PENDING or CONFIRMED) reservations
      const activeReservation = order.reservations.find(r => 
        r.status === 'PENDING' || r.status === 'CONFIRMED'
      )

      if (activeReservation) {
        return NextResponse.json({ 
          error: 'Vous avez déjà une réservation en cours. Terminez-la ou annulez-la avant d\'en prévoir une autre.' 
        }, { status: 400 })
      }

      // 2. Calculate next session index
      const completedCount = order.reservations.filter(r => r.status === 'COMPLETED').length
      const sessionsConfig = (order.serviceTier.sessionsConfig as any[]) || []

      if (completedCount >= sessionsConfig.length) {
        return NextResponse.json({ error: 'Toutes les séances de ce pack ont été consommées.' }, { status: 400 })
      }

      const nextIndex = completedCount
      const sessionLabel = sessionsConfig[nextIndex]?.label || `Séance ${nextIndex + 1}`

      // 3. Check for consultant availability (overlapping)
      const BUFFER_MS = 15 * 60 * 1000
      const bufferEnd = new Date(new Date(endTime).getTime() + BUFFER_MS)

      const overlapping = await tx.reservation.findFirst({
        where: {
          consultantId: order.consultantId,
          AND: [
            { startTime: { lt: bufferEnd } },
            { endTime: { gt: new Date(startTime) } }
          ],
          NOT: { status: 'CANCELLED' }
        }
      })

      if (overlapping) {
        return NextResponse.json({ error: 'Ce créneau est déjà réservé par un autre client.' }, { status: 409 })
      }

      // 4. Create the reservation with 15-minute buffer
      const reservation = await tx.reservation.create({
        data: {
          orderId: order.id,
          clientId: user.id,
          consultantId: order.consultantId,
          serviceTierId: order.serviceTierId,
          startTime: new Date(startTime),
          endTime: bufferEnd, // This already has the 15min buffer from step 3 above
          meetingType: meetingType === 'SUR_PLACE' ? 'SUR_PLACE' : 'ZOOM',
          sessionIndex: nextIndex,
          sessionLabel: sessionLabel,
          status: 'PENDING'
        }
      })

      // Notify the consultant
      const { notifyNewReservation } = await import('@/lib/notification-service')
      await notifyNewReservation(reservation.id)

      return NextResponse.json(reservation)
    })
  } catch (error) {
    console.error('Reservation error:', error)
    return NextResponse.json({ error: 'Échec de la création de la réservation' }, { status: 500 })
  }
}
