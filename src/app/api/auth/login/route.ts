import { NextResponse } from 'next/server'
import bcrypt from 'bcrypt'
import { prisma } from '@/lib/prisma'
import { createToken, setAuthCookie } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 })
    }

    // Check User table first
    const user = await prisma.user.findUnique({ where: { email } })
    if (user) {
      const valid = await bcrypt.compare(password, user.password)
      if (!valid) {
        return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
      }

      const token = createToken({ userId: user.id, email: user.email, role: user.role })
      await setAuthCookie(token)

      return NextResponse.json({
        user: { id: user.id, email: user.email, name: user.name, role: user.role }
      })
    }

    // Check Consultant table
    const consultant = await prisma.consultant.findUnique({ where: { email } })
    if (consultant) {
      const valid = await bcrypt.compare(password, consultant.password)
      if (!valid) {
        return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
      }

      const token = createToken({ userId: consultant.id, email: consultant.email, role: 'CONSULTANT' })
      await setAuthCookie(token)

      return NextResponse.json({
        user: { id: consultant.id, email: consultant.email, name: consultant.name, role: 'CONSULTANT' }
      })
    }

    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
  } catch (error) {
    return NextResponse.json({ error: 'Login failed' }, { status: 500 })
  }
}
