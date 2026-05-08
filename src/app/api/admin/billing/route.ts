import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { randomUUID } from 'crypto'
import { requireAuth } from '@/lib/auth/middleware'
import { handleError, successResponse } from '@/lib/errors/handler'

export async function GET(request: NextRequest) {
  const authResult = requireAuth(request, ['ADMIN']);
  if (!authResult.success) return authResult.response;
  
  try {
    const invoices = await prisma.invoice.findMany({
      include: {
        client: { select: { id: true, name: true, email: true } },
        order: { 
          include: { 
            serviceTier: { 
              include: { 
                service: { select: { name: true } } 
              } 
            } 
          } 
        }
      },
      orderBy: { issueDate: 'desc' }
    })
    return successResponse(invoices);
  } catch (error) {
    return handleError(error, request);
  }
}

export async function POST(request: NextRequest) {
  const authResult = requireAuth(request, ['ADMIN']);
  if (!authResult.success) return authResult.response;
  
  try {
    const { clientId, orderId, amount, dueDate, status } = await request.json()
    
    // Generate a unique invoice number (e.g., INV-20260426-XXXX)
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '')
    const shortId = randomUUID().split('-')[0].toUpperCase()
    const invoiceNumber = `INV-${dateStr}-${shortId}`

    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        clientId,
        orderId: orderId || null,
        amount: Number(amount),
        dueDate: new Date(dueDate),
        status: status || 'PENDING',
        issueDate: new Date()
      },
      include: {
        client: { select: { id: true, name: true, email: true } }
      }
    })

    return successResponse(invoice);
  } catch (error) {
    console.error('Invoice creation error:', error)
    return handleError(error, request);
  }
}

export async function PUT(request: NextRequest) {
  const authResult = requireAuth(request, ['ADMIN']);
  if (!authResult.success) return authResult.response;
  
  try {
    const { id, status, dueDate } = await request.json()
    const invoice = await prisma.invoice.update({
      where: { id },
      data: { 
        status,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        paidAt: status === 'PAID' ? new Date() : undefined
      }
    })
    return successResponse(invoice);
  } catch (error) {
    return handleError(error, request);
  }
}

export async function DELETE(request: NextRequest) {
  const authResult = requireAuth(request, ['ADMIN']);
  if (!authResult.success) return authResult.response;
  
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  if (!id) return handleError(new Error('Missing ID'), request);
  
  try {
    await prisma.invoice.delete({ where: { id } })
    return successResponse({ success: true });
  } catch (error) {
    return handleError(error, request);
  }
}
