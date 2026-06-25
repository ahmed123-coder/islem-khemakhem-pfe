import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth/middleware'
import { handleError, successResponse } from '@/lib/errors/handler'

export async function GET(request: NextRequest) {
  const authResult = requireAuth(request, ['ADMIN']);
  if (!authResult.success) return authResult.response;
  
  try {
    const [
      blogs,
      services,
      contacts,
      clients,
      activeClients,
      inactiveClients,
      consultants,
      activeConsultants,
      pendingContacts,
      totalOrders,
      activeOrders,
      pendingOrders,
      completedOrders,
      totalReservations,
      revenueData,
      avgRatingData
    ] = await Promise.all([
      prisma.blog.count(),
      prisma.service.count(),
      prisma.contact.count(),
      prisma.user.count({ where: { role: 'CLIENT' } }),
      prisma.user.count({ where: { role: 'CLIENT', isActive: true } }),
      prisma.user.count({ where: { role: 'CLIENT', isActive: false } }),
      prisma.consultant.count(),
      prisma.consultant.count({ where: { isActive: true } }),
      prisma.contact.count({ where: { status: 'new' } }),
      prisma.order.count(),
      prisma.order.count({ where: { status: 'ACTIVE' } }),
      prisma.order.count({ where: { status: 'PENDING' } }),
      prisma.order.count({ where: { status: 'COMPLETED' } }),
      prisma.reservation.count(),
      prisma.invoice.aggregate({
        _sum: { amount: true },
        where: { status: 'PAID' }
      }),
      prisma.review.aggregate({
        _avg: { rating: true },
        where: { isPublished: true }
      })
    ])

    // ── Calcul du taux de croissance (30 derniers jours) ──────────
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    
    const newClients = await prisma.user.count({
      where: { 
        role: 'CLIENT',
        createdAt: { gte: thirtyDaysAgo }
      }
    })

    const growth = clients > 0 ? ((newClients / clients) * 100).toFixed(1) : "0"

    // ── Données réelles du graphique clients (7 derniers jours) ───
    const clientsChartData = await Promise.all(
      Array.from({ length: 7 }, (_, i) => {
        const date = new Date()
        date.setDate(date.getDate() - (6 - i))
        const start = new Date(date)
        start.setHours(0, 0, 0, 0)
        const end = new Date(date)
        end.setHours(23, 59, 59, 999)

        return prisma.user.count({
          where: {
            role: 'CLIENT',
            createdAt: { gte: start, lte: end }
          }
        }).then(count => ({
          name: start.toLocaleDateString('fr-FR', { weekday: 'short' }),
          value: count
        }))
      })
    )

    // ── Données réelles du graphique contacts (7 derniers jours) ──
    const contactsChartData = await Promise.all(
      Array.from({ length: 7 }, (_, i) => {
        const date = new Date()
        date.setDate(date.getDate() - (6 - i))
        const start = new Date(date)
        start.setHours(0, 0, 0, 0)
        const end = new Date(date)
        end.setHours(23, 59, 59, 999)

        return prisma.contact.count({
          where: {
            createdAt: { gte: start, lte: end }
          }
        }).then(count => ({
          name: start.toLocaleDateString('fr-FR', { weekday: 'short' }),
          value: count
        }))
      })
    )

    const totalRevenue = Number(revenueData._sum.amount || 0)
    const avgRating    = avgRatingData._avg.rating !== null
      ? (avgRatingData._avg.rating || 0).toFixed(1)
      : "0"

    return successResponse({ 
      blogs, 
      services, 
      contacts,
      clients,
      activeClients,
      inactiveClients,
      consultants,
      activeConsultants,
      pendingContacts,
      growth,
      clientsChartData,
      contactsChartData,
      totalOrders,
      activeOrders,
      pendingOrders,
      completedOrders,
      totalReservations,
      totalRevenue,
      avgRating,
    });
  } catch (error) {
    return handleError(error, request);
  }
}