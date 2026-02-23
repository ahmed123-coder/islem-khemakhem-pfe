import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const [
      blogs,
      services,
      contacts,
      clients,
      consultants,
      pendingContacts
    ] = await Promise.all([
      prisma.blog.count(),
      prisma.service.count(),
      prisma.contact.count(),
      prisma.user.count({ where: { role: 'CLIENT' } }),
      prisma.consultant.count(),
      prisma.contact.count({ where: { status: 'new' } })
    ])

    return NextResponse.json({ 
      blogs, 
      services, 
      contacts,
      clients,
      consultants,
      pendingContacts
    })
  } catch (error) {
    return NextResponse.json({ 
      blogs: 0, 
      services: 0, 
      contacts: 0,
      clients: 0,
      consultants: 0,
      pendingContacts: 0
    })
  }
}
