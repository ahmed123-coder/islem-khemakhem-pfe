import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { randomUUID } from 'crypto'

export async function GET() {
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
    return NextResponse.json(invoices)
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
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

    return NextResponse.json(invoice)
  } catch (error) {
    console.error('Invoice creation error:', error)
    return NextResponse.json({ error: 'Failed to create invoice' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
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
    return NextResponse.json(invoice)
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Missing ID' }, { status: 400 })
  
  try {
    await prisma.invoice.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
