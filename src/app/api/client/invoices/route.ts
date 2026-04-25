import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'CLIENT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const invoices = await prisma.invoice.findMany({
      where: { clientId: user.id },
      include: {
        order: {
          include: {
            serviceTier: {
              include: { service: true }
            }
          }
        }
      },
      orderBy: { issueDate: 'desc' }
    })

    return NextResponse.json(invoices)
  } catch (error) {
    console.error('List invoices error:', error)
    return NextResponse.json({ error: 'Failed to list invoices' }, { status: 500 })
  }
}
