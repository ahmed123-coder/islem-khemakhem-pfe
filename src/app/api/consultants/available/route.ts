import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const consultants = await prisma.consultant.findMany({
      where: { isActive: true },
      include: {
        reservations: {
          where: {
            requestedDate: {
              gte: new Date()
            }
          },
          orderBy: { requestedDate: 'asc' }
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
