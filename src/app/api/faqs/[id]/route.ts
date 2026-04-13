import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const data = await req.json()
    const { question, answer, order, isActive } = data

    const faq = await prisma.faq.update({
      where: { id: params.id },
      data: {
        question,
        answer,
        order,
        isActive
      }
    })

    return NextResponse.json(faq, { status: 200 })
  } catch (error) {
    console.error('Error updating faq:', error)
    return NextResponse.json({ error: 'Failed to update faq' }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    await prisma.faq.delete({
      where: { id: params.id }
    })
    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error('Error deleting faq:', error)
    return NextResponse.json({ error: 'Failed to delete faq' }, { status: 500 })
  }
}
