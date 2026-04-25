import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { BillingService } from '@/lib/billing'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const invoiceId = params.id
    
    // In a real app, verify that the invoice belongs to the user
    // The BillingService could do this check as well.

    const pdfBuffer = await BillingService.generateInvoicePDF(invoiceId)

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename=invoice-${invoiceId}.pdf`,
      },
    })
  } catch (error) {
    console.error('Download invoice error:', error)
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 })
  }
}
