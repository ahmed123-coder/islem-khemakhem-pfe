// src/app/api/admin/users/[id]/route.ts
// Quand l'admin modifie un client → émet socket pour sync en temps réel

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth/middleware'
import { handleError, successResponse } from '@/lib/errors/handler'

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = requireAuth(req, ['ADMIN'])
  if (!authResult.success) return authResult.response

  try {
    const { name, firstName, phone, company, matriculeFiscale, sector, address, needs, isActive } = await req.json()

    const updated = await prisma.user.update({
      where: { id: params.id },
      data: {
        ...(name !== undefined && { name }),
        ...(firstName !== undefined && { firstName }),
        ...(phone !== undefined && { phone }),
        ...(company !== undefined && { company }),
        ...(matriculeFiscale !== undefined && { matriculeFiscale }),
        ...(sector !== undefined && { sector }),
        ...(address !== undefined && { address }),
        ...(needs !== undefined && { needs }),
        ...(isActive !== undefined && { isActive }),
      }
    })

    // ✅ Émet un événement socket au client concerné
    // Le Header du client écoute 'socket-profile-updated' et met à jour le nom
    const io = (global as any).io
    if (io) {
      io.to(`user:${params.id}`).emit('profile-updated', {
        name: updated.name,
        firstName: updated.firstName,
        phone: updated.phone,
        company: updated.company,
      })
      console.log(`[Socket] Profile updated emitted to user:${params.id}`)
    }

    return successResponse(updated)
  } catch (error) {
    return handleError(error, req)
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = requireAuth(req, ['ADMIN'])
  if (!authResult.success) return authResult.response

  try {
    const { id } = params

    await prisma.missionFile.deleteMany({ where: { uploadedById: id } })

    await prisma.order.deleteMany({ where: { clientId: id } })

    await prisma.reservation.deleteMany({ where: { clientId: id } })

    await prisma.$executeRawUnsafe('DELETE FROM "Payment" WHERE "invoiceId" IN (SELECT "id" FROM "Invoice" WHERE "clientId" = $1)', id)
    await prisma.$executeRawUnsafe('DELETE FROM "Invoice" WHERE "clientId" = $1', id)

    await prisma.user.delete({ where: { id } })

    return successResponse({ success: true })
  } catch (error) {
    return handleError(error, req)
  }
}