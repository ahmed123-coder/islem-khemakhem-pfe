import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { contactSchema } from '@/lib/validation/schemas/contact.schemas'
import { sanitizeObject } from '@/lib/validation/sanitizer'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const sanitized = sanitizeObject(body)

    const result = contactSchema.safeParse(sanitized)

    if (!result.success) {
      const errors = (result.error as any).issues.map((err: any) => ({
        field: err.path.join('.'),
        message: err.message,
      }))
      return NextResponse.json({ errors }, { status: 400 })
    }

    const { name, email, message } = result.data

    const contact = await prisma.contact.create({
      data: { name, email, message },
    })

    return NextResponse.json(
      { message: 'Contact form submitted successfully', id: contact.id },
      { status: 201 }
    )
  } catch (error) {
    console.error('Contact form error:', error)
    return NextResponse.json(
      { error: 'Failed to submit contact form' },
      { status: 500 }
    )
  }
}