import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth/middleware'
import { handleError, successResponse } from '@/lib/errors/handler'

export async function GET(request: NextRequest) {
  const authResult = requireAuth(request, ['ADMIN']);
  if (!authResult.success) return authResult.response;
  
  try {
    const orders = await prisma.order.findMany({
      include: {
        client: { select: { id: true, name: true, email: true } },
        consultant: { select: { id: true, name: true } },
        serviceTier: {
          include: {
            service: { select: { name: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
    })
    return successResponse(orders);
  } catch (error) {
    return handleError(error, request);
  }
}

export async function PUT(request: NextRequest) {
  const authResult = requireAuth(request, ['ADMIN']);
  if (!authResult.success) return authResult.response;
  
  try {
    const body = await request.json()
    const { id, status, messagesUsed, callMinutesUsed } = body
    
    const order = await prisma.order.update({
      where: { id },
      data: {
        status,
        messagesUsed,
        callMinutesUsed,
      },
    })

    // If order is activated, mark its pending invoices as PAID
    if (status === 'ACTIVE') {
      await prisma.invoice.updateMany({
        where: { orderId: id, status: 'PENDING' },
        data: { status: 'PAID', paidAt: new Date() }
      })
    }
    
    return successResponse(order);
  } catch (error) {
    return handleError(error, request);
  }
}
