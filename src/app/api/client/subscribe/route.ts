import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const { packageId, billingCycle, clientId } = await request.json()

    if (!packageId || !billingCycle || !clientId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Check if user has active subscription
    const existingSubscription = await prisma.subscriptions.findFirst({
      where: {
        userId: clientId,
        status: 'ACTIVE',
        endDate: { gte: new Date() }
      }
    })

    if (existingSubscription) {
      return NextResponse.json({ 
        error: 'You already have an active subscription' 
      }, { status: 400 })
    }

    // Calculate dates
    const startDate = new Date()
    const endDate = new Date()
    if (billingCycle === 'MONTHLY') {
      endDate.setMonth(endDate.getMonth() + 1)
    } else {
      endDate.setFullYear(endDate.getFullYear() + 1)
    }

    // Create subscription
    const subscription = await prisma.subscriptions.create({
      data: {
        userId: clientId,
        packageId,
        billingCycle,
        status: 'ACTIVE',
        startDate,
        endDate,
        currentPeriodStart: startDate,
        currentPeriodEnd: endDate,
        autoRenew: true
      }
    })

    return NextResponse.json({ success: true, subscription })
  } catch (error) {
    console.error('Subscribe error:', error)
    return NextResponse.json({ error: 'Failed to create subscription' }, { status: 500 })
  }
}
