import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const faqs = await prisma.faq.findMany({
      orderBy: { order: 'asc' }
    })
    return NextResponse.json(faqs, { status: 200 })
  } catch (error) {
    console.error('Error getting faqs:', error)
    return NextResponse.json({ error: 'Failed to get faqs' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json()
    const { question, answer, order, isActive } = data

    if (!question || !answer) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const faq = await prisma.faq.create({
      data: {
        question,
        answer,
        order: order || 0,
        isActive: isActive !== undefined ? isActive : true
      }
    })
    return NextResponse.json(faq, { status: 201 })
  } catch (error) {
    console.error('Error creating faq:', error)
    return NextResponse.json({ error: 'Failed to create faq' }, { status: 500 })
  }
}
