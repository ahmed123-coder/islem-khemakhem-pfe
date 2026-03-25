import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { notifyReservationDelete } from '@/lib/notification-service'

export async function DELETE(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'CLIENT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await req.json()
    const reservation = await prisma.reservation.findUnique({
      where: { id }
    })

    if (!reservation || reservation.clientId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized or not found' }, { status: 403 })
    }

    // Client can only delete PENDING reservations
    if (reservation.status !== 'PENDING') {
      return NextResponse.json({ error: 'You can only cancel pending reservations' }, { status: 400 })
    }

    await notifyReservationDelete(id, 'CLIENT')
    await prisma.reservation.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Reservation cancellation error:', error)
    return NextResponse.json({ error: 'Failed to cancel reservation' }, { status: 500 })
  }
}
