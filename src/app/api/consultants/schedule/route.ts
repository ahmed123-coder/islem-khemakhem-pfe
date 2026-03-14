import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate') || new Date().toISOString().split('T')[0]
    const days = parseInt(searchParams.get('days') || '7')
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

    console.log('Schedule API request:', { serviceTierId, startDate, days });
    console.log('Generated whereClause:', JSON.stringify(whereClause, null, 2));

    const consultants = await prisma.consultant.findMany({
      where: whereClause,
      include: {
        reservations: {
          where: {
            startTime: {
              gte: new Date(startDate),
              lt: new Date(new Date(startDate).getTime() + days * 24 * 60 * 60 * 1000)
            }
          }
        }
      },
      orderBy: { name: 'asc' }
    })

    return NextResponse.json(consultants)
  } catch (error) {
    console.error('Schedule API error:', error)
    return NextResponse.json({ error: 'Failed to fetch schedule', details: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 })
  }
}
