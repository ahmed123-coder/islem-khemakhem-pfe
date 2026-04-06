import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getConsultantId } from '@/lib/auth'
import { createZoomMeeting } from '@/lib/zoom'
import { notifyReservationUpdate } from '@/lib/notification-service'

const prisma = new PrismaClient()

export async function GET(req: NextRequest) {
  const consultantId = await getConsultantId()
  if (!consultantId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const clientId = searchParams.get('clientId')

  try {
    const reservations = await prisma.reservation.findMany({
      where: { 
        consultantId,
        ...(clientId ? { clientId } : {})
      },
      include: {
        client: { select: { id: true, name: true, email: true } },
        serviceTier: { include: { service: true } }
      },
      orderBy: { startTime: 'asc' }
    })
    return NextResponse.json(reservations)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch reservations' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  const consultantId = await getConsultantId()
  if (!consultantId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { id, status } = await req.json()
    const reservation = await prisma.reservation.findUnique({ 
      where: { id },
      include: {
        client: { select: { id: true, name: true, email: true } },
        serviceTier: { include: { service: true } }
      }
    })
    
    if (!reservation || reservation.consultantId !== consultantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    let zoomJoinUrl = reservation.zoomJoinUrl
    let zoomPassword = reservation.zoomPassword

    // If confirming the reservation, only create Zoom if meetingType is ZOOM
    if (status === 'CONFIRMED' && reservation.meetingType === 'ZOOM' && !zoomJoinUrl) {
      try {
        const durationMinutes = Math.round(
          (new Date(reservation.endTime).getTime() - new Date(reservation.startTime).getTime()) / 60000
        )
        
        const meeting = await createZoomMeeting({
          topic: `Consultation: ${reservation.serviceTier.service.name} - ${reservation.client.name || reservation.client.email}`,
          startTime: new Date(reservation.startTime).toISOString(),
          duration: durationMinutes > 0 ? durationMinutes : 60,
        })

        zoomJoinUrl = meeting.join_url
        zoomPassword = meeting.password ?? null
      } catch (zoomError) {
        console.error('Failed to create Zoom meeting:', zoomError)
        // We can either abort the confirmation or proceed without zoom. Let's proceed but maybe log it.
        // It's safer to let the reservation be confirmed and the consultant can manually send a link if it fails.
      }
    }

    const updated = await prisma.reservation.update({
      where: { id },
      data: { 
        status,
        zoomJoinUrl,
        zoomPassword
      }
    })
    await notifyReservationUpdate(id, status)
    return NextResponse.json(updated)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update reservation' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  const consultantId = await getConsultantId()
  if (!consultantId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { id } = await req.json()
    const { notifyReservationDelete } = await import('@/lib/notification-service')
    
    // Check ownership
    const reservation = await prisma.reservation.findUnique({ where: { id } })
    if (!reservation || reservation.consultantId !== consultantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Send notification BEFORE deleting to fetch details
    await notifyReservationDelete(id, 'CONSULTANT')

    await prisma.reservation.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete error:', error)
    return NextResponse.json({ error: 'Failed to delete reservation' }, { status: 500 })
  }
}
