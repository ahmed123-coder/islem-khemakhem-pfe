import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate') || new Date().toISOString().split('T')[0]
    const days = parseInt(searchParams.get('days') || '7')

    const consultants = await prisma.consultant.findMany({
      where: { isActive: true },
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
