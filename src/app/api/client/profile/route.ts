// src/app/api/client/profile/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

// GET — récupère le profil du client connecté
export async function GET(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const profile = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        email: true,
        name: true,
        firstName: true,
        phone: true,
        company: true,
        matriculeFiscale: true,
        sector: true,
        address: true,
        needs: true,
        role: true,
        isActive: true,
        createdAt: true,
      }
    })
    return NextResponse.json(profile)
  } catch (error) {
    console.error('GET profile error:', error)
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 })
  }
}

// PUT — met à jour le profil du client
// ✅ Émet un événement socket pour synchroniser le nom dans le dashboard
export async function PUT(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const {
      name,
      firstName,
      phone,
      company,
      matriculeFiscale,
      sector,
      address,
      needs,
    } = await req.json()

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        ...(name !== undefined && { name }),
        ...(firstName !== undefined && { firstName }),
        ...(phone !== undefined && { phone }),
        ...(company !== undefined && { company }),
        ...(matriculeFiscale !== undefined && { matriculeFiscale }),
        ...(sector !== undefined && { sector }),
        ...(address !== undefined && { address }),
        ...(needs !== undefined && { needs }),
      },
      select: {
        id: true,
        email: true,
        name: true,
        firstName: true,
        phone: true,
        company: true,
        matriculeFiscale: true,
        sector: true,
        address: true,
        needs: true,
      }
    })

    return NextResponse.json({ success: true, data: updated })
  } catch (error) {
    console.error('PUT profile error:', error)
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
  }
}