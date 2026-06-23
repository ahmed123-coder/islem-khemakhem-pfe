import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, requireOwnership } from '@/lib/auth/middleware'
import { BillingService } from '@/lib/billing'
import { prisma } from '@/lib/prisma'
import { handleError } from '@/lib/errors/handler'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = requireAuth(req, ['CLIENT', 'ADMIN'])
  if (!authResult.success) return authResult.response!

  try {
    const invoiceId = params.id
    
    // Verify invoice exists and ownership
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId }
    })

    if (!invoice) {
      return handleError(new Error('Invoice not found'), req)
    }

    const ownershipResult = requireOwnership(authResult.user!, invoice.clientId)
    if (!ownershipResult.success) return ownershipResult.response!

    const pdfBuffer = await BillingService.generateInvoicePDF(invoiceId)

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename=invoice-${invoiceId}.pdf`,
      },
    })
  } catch (error) {
    return handleError(error, req)
  }
}

