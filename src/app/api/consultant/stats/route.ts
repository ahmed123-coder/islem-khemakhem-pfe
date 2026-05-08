import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth/middleware'
import { handleError, successResponse } from '@/lib/errors/handler'

export async function GET(request: NextRequest) {
  const authResult = requireAuth(request, ['CONSULTANT']);
  if (!authResult.success || !authResult.user) return authResult.response;

  try {
    const consultantId = authResult.user.userId

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
      recentClientGrowth,
      todayMissions,
      consultantRatings
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
          status: { in: ['COMPLETED'] }
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
      }),
      // Today's Missions
      prisma.reservation.findMany({
        where: {
          consultantId,
          startTime: {
            gte: startOfDay,
            lte: endOfDay
          },
          status: { in: ['CONFIRMED', 'COMPLETED'] }
        },
        orderBy: { startTime: 'asc' },
        include: { client: { select: { name: true } } }
      }),
      // Consultant Ratings
      prisma.consultant.findUnique({
        where: { id: consultantId },
        select: { avgRating: true, reviewCount: true }
      })
    ])

    // Calculate total hours
    const hours = totalHoursMonth.reduce((acc, res) => {
      const diff = res.endTime.getTime() - res.startTime.getTime()
      return acc + (diff / (1000 * 60 * 60))
    }, 0)

    const goal = 160
    const progress = Math.min(Math.round((hours / goal) * 100), 100)

    return successResponse({
      appointmentsToday,
      hoursMonth: Math.round(hours),
      progress,
      totalClients: totalClients.length,
      nextAppointment,
      clientGrowth: recentClientGrowth,
      todayMissions,
      ratings: consultantRatings
    });
  } catch (error) {
    console.error('Stats error:', error)
    return handleError(error, request);
  }
}
