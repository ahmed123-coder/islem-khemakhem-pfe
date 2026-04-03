import { NextResponse } from 'next/server'
import * as bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { createToken, setAuthCookie } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const { email, password, name, phone, specialty, cvUrl, certificationUrls, role } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    if (role === 'CONSULTANT') {
      const exists = await prisma.consultant.findUnique({ where: { email } })
      if (exists) {
        return NextResponse.json({ error: 'Email already in use' }, { status: 400 })
      }
      await prisma.consultant.create({
        data: { email, password: hashedPassword, name, specialty, cvUrl, certifications: certificationUrls || [], isActive: false }
      })
      return NextResponse.json({ message: 'Consultant account created, awaiting activation' }, { status: 201 })
    }

    const exists = await prisma.user.findUnique({ where: { email } })
    if (exists) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 })
    }

    await prisma.user.create({
      data: { email, password: hashedPassword, name, phone, isActive: false }
    })

    return NextResponse.json({ message: 'Compte créé, en attente de validation par un administrateur.' }, { status: 201 })
  } catch (error) {
    console.error('Register error:', error)
    return NextResponse.json({ error: 'Registration failed', details: String(error) }, { status: 500 })
  }
}
