import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const consultants = await prisma.consultant.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        specialty: true,
        createdAt: true,
        _count: {
          select: {
            missions: true,
          },
        },
        services: {
          include: {
            service: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(consultants)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch consultants' }, { status: 500 })
  }
}
