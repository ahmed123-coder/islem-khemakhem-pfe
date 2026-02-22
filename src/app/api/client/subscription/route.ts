import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const subscription = await prisma.subscriptions.findFirst({
      where: { userId: user.id, status: 'ACTIVE' },
      include: {
        subscription_packages: {
          include: {
            subscription_plans: true
          }
        }
      }
    })

    if (!subscription) {
      return NextResponse.json({ plan: 'None', status: 'INACTIVE', billingCycle: 'N/A', endDate: null })
    }

    return NextResponse.json({
      plan: subscription.subscription_packages.subscription_plans.name,
      status: subscription.status,
      billingCycle: subscription.billingCycle,
      endDate: subscription.endDate
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch subscription' }, { status: 500 })
  }
}
