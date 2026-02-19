import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const [blogs, services, contacts, subscriptions, missions] = await Promise.all([
      prisma.blog.count(),
      prisma.service.count(),
      prisma.contact.count(),
      prisma.subscriptions.count(),
      prisma.mission.count()
    ])

    return NextResponse.json({ blogs, services, contacts, subscriptions, missions })
  } catch (error) {
    return NextResponse.json({ blogs: 0, services: 0, contacts: 0, subscriptions: 0, missions: 0 })
  }
}
