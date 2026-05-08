import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth/middleware'
import { handleError, successResponse } from '@/lib/errors/handler'

export async function GET(request: NextRequest) {
  const authResult = requireAuth(request, ['ADMIN']);
  if (!authResult.success) return authResult.response;
  
  try {
    const [
      blogs,
      services,
      contacts,
      clients,
      activeClients,
      inactiveClients,
      consultants,
      activeConsultants,
      pendingContacts
    ] = await Promise.all([
      prisma.blog.count(),
      prisma.service.count(),
      prisma.contact.count(),
      prisma.user.count({ where: { role: 'CLIENT' } }),
      prisma.user.count({ where: { role: 'CLIENT', isActive: true } }),
      prisma.user.count({ where: { role: 'CLIENT', isActive: false } }),
      prisma.consultant.count(),
      prisma.consultant.count({ where: { isActive: true } }),
      prisma.contact.count({ where: { status: 'new' } })
    ])

    // Calculate growth (clients in last 30 days vs total)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    
    const newClients = await prisma.user.count({
      where: { 
        role: 'CLIENT',
        createdAt: { gte: thirtyDaysAgo }
      }
    })

    const growth = clients > 0 ? ((newClients / clients) * 100).toFixed(1) : "0"

    return successResponse({ 
      blogs, 
      services, 
      contacts,
      clients,
      activeClients,
      inactiveClients,
      consultants,
      activeConsultants,
      pendingContacts,
      growth
    });
  } catch (error) {
    return handleError(error, request);
  }
}
