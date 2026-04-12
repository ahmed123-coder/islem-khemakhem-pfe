import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthToken, verifyToken } from '@/lib/auth'

export async function GET() {
  try {
    const token = await getAuthToken()
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const payload = verifyToken(token)
    if (!payload || payload.role !== 'CONSULTANT') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const consultantId = payload.userId

    // Get current date boundaries
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59)
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0)

    const [
      appointmentsToday,
      totalHoursMonth,
      totalClients,
      nextAppointment,
      recentClientGrowth
    ] = await Promise.all([
      // Appointments today
      prisma.reservation.count({
        where: {
          consultantId,
          startTime: {
            gte: startOfDay,
            lte: endOfDay
          },
          status: 'CONFIRMED'
        }
      }),
      // Total hours this month (sum of durations of completed/confirmed reservations)
      prisma.reservation.findMany({
        where: {
          consultantId,
          startTime: { gte: startOfMonth },
          status: { in: ['CONFIRMED', 'COMPLETED'] }
        },
        select: {
          startTime: true,
          endTime: true
        }
      }),
      // Total unique clients
      prisma.reservation.groupBy({
        by: ['clientId'],
        where: { consultantId }
      }),
      // Next appointment today
      prisma.reservation.findFirst({
        where: {
          consultantId,
          startTime: { gte: now },
          status: 'CONFIRMED'
        },
        orderBy: { startTime: 'asc' },
        include: { client: { select: { name: true } } }
      }),
      // Client growth last 30 days
      prisma.reservation.count({
        where: {
          consultantId,
          createdAt: { gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) }
        }
      })
    ])

    // Calculate total hours
    const hours = totalHoursMonth.reduce((acc, res) => {
      const diff = res.endTime.getTime() - res.startTime.getTime()
      return acc + (diff / (1000 * 60 * 60))
    }, 0)

    const goal = 160
    const progress = Math.min(Math.round((hours / goal) * 100), 100)

    return NextResponse.json({
      appointmentsToday,
      hoursMonth: Math.round(hours),
      progress,
      totalClients: totalClients.length,
      nextAppointment,
      clientGrowth: recentClientGrowth
    })
  } catch (error) {
    console.error('Stats error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
