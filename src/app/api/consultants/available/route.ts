import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const serviceTierId = searchParams.get('serviceTierId')

    let whereClause: any = { isActive: true }

    if (serviceTierId) {
      const serviceTier = await prisma.serviceTier.findUnique({
        where: { id: serviceTierId },
        select: { serviceId: true }
      })

      if (serviceTier) {
        whereClause.services = {
          some: {
            id: serviceTier.serviceId
          }
        }
      }
    }

    const consultants = await prisma.consultant.findMany({
      where: whereClause,
      include: {
        reservations: {
          where: {
            startTime: {
              gte: new Date()
            }
          },
          orderBy: { startTime: 'asc' }
        },
        orders: {
          where: { status: 'ACTIVE' }
        }
      }
    })

    const consultantsWithScore = consultants.map(c => ({
      id: c.id,
      name: c.name,
      specialty: c.specialty,
      bio: c.bio,
      imageUrl: c.imageUrl,
      reservations: c.reservations,
      activeOrders: c.orders.length,
      availabilityScore: c.reservations.length + c.orders.length
    }))

    consultantsWithScore.sort((a, b) => a.availabilityScore - b.availabilityScore)

    return NextResponse.json(consultantsWithScore)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch consultants' }, { status: 500 })
  }
}
