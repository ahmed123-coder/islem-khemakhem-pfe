import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getConsultantId } from '@/lib/auth'

const prisma = new PrismaClient()

export async function GET(req: NextRequest) {
  const consultantId = await getConsultantId()
  if (!consultantId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const consultant = await prisma.consultant.findUnique({
      where: { id: consultantId },
      include: {
        orders: {
          include: {
            client: { select: { name: true, email: true } },
            serviceTier: { include: { service: true } }
          }
        },
        missions: {
          include: {
            milestones: true
          }
        },
        reservations: {
          include: {
            client: { select: { name: true } }
          }
        }
      }
    })

    if (!consultant) {
      return NextResponse.json({ error: 'Consultant not found' }, { status: 404 })
    }

    return NextResponse.json(consultant)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch portfolio' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  const consultantId = await getConsultantId()
  if (!consultantId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { name, specialty, hourlyRate, bio, imageUrl } = await req.json()
    
    const updated = await prisma.consultant.update({
      where: { id: consultantId },
      data: { name, specialty, hourlyRate, bio, imageUrl }
    })
    
    return NextResponse.json(updated)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
  }
}
