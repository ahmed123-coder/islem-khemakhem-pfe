import { NextResponse } from 'next/server'
import * as bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { createToken, setAuthCookie } from '@/lib/auth'
import { notifyNewClientRegistration, notifyNewConsultantRegistration } from '@/lib/notification-service'

export async function POST(request: Request) {
  try {
    const { 
      email, password, name, firstName, phone, 
      company, matriculeFiscale, sector, address, needs, 
      specialty, competences, cvUrl, certificationUrls, certUrls, 
      role, type 
    } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const accountRole = role || type

    if (accountRole === 'CONSULTANT') {
      const exists = await prisma.consultant.findUnique({ where: { email } })
      if (exists) {
        return NextResponse.json({ error: 'Email already in use' }, { status: 400 })
      }
      await prisma.consultant.create({
        data: { 
          email, 
          password: hashedPassword, 
          name,
          firstName,
          phone,
          specialty: specialty || competences, 
          cvUrl, 
          certifications: certificationUrls || certUrls || [], 
          isActive: false 
        }
      })
      // Notify admins
      const newConsultant = await prisma.consultant.findUnique({ where: { email } })
      if (newConsultant) await notifyNewConsultantRegistration(newConsultant.id)
      return NextResponse.json({ message: 'Consultant account created, awaiting activation' }, { status: 201 })
    }

    const exists = await prisma.user.findUnique({ where: { email } })
    if (exists) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 })
    }

    await prisma.user.create({
      data: { 
        email, 
        password: hashedPassword, 
        name, 
        firstName,
        phone, 
        company,
        matriculeFiscale,
        sector,
        address,
        needs,
        isActive: false 
      }
    })
    // Notify admins
    const newUser = await prisma.user.findUnique({ where: { email } })
    if (newUser) await notifyNewClientRegistration(newUser.id)
    return NextResponse.json({ message: 'Compte créé, en attente de validation par un administrateur.' }, { status: 201 })
  } catch (error) {
    console.error('Register error:', error)
    return NextResponse.json({ error: 'Registration failed', details: String(error) }, { status: 500 })
  }
}
