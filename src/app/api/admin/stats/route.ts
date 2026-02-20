import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const [
      blogs,
      services,
      contacts,
      subscriptions,
      missions,
      clients,
      consultants,
      activeMissions,
      pendingContacts,
      activeSubscriptions
    ] = await Promise.all([
      prisma.blog.count(),
      prisma.service.count(),
      prisma.contact.count(),
      prisma.subscriptions.count(),
      prisma.mission.count(),
      prisma.user.count({ where: { role: 'CLIENT' } }),
      prisma.consultant.count(),
      prisma.mission.count({ where: { status: 'ACTIVE' } }),
      prisma.contact.count({ where: { status: 'new' } }),
      prisma.subscriptions.findMany({ where: { status: 'ACTIVE' }, include: { subscription_packages: true } })
    ])

    const revenue = activeSubscriptions.reduce((sum, sub) => {
      const price = sub.billingCycle === 'MONTHLY' 
        ? Number(sub.subscription_packages.priceMonthly)
        : Number(sub.subscription_packages.priceYearly)
      return sum + price
    }, 0)

    return NextResponse.json({ 
      blogs, 
      services, 
      contacts, 
      subscriptions, 
      missions,
      clients,
      consultants,
      revenue,
      activeMissions,
      pendingContacts
    })
  } catch (error) {
    return NextResponse.json({ 
      blogs: 0, 
      services: 0, 
      contacts: 0, 
      subscriptions: 0, 
      missions: 0,
      clients: 0,
      consultants: 0,
      revenue: 0,
      activeMissions: 0,
      pendingContacts: 0
    })
  }
}
