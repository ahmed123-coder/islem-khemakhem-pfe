import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const invoices = await prisma.invoice.findMany({
      include: {
        client: { select: { name: true, email: true } },
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
