import { NextRequest } from 'next/server'
import { requireAuth } from '@/lib/auth/middleware'
import { prisma } from '@/lib/prisma'
import { handleError, successResponse } from '@/lib/errors/handler'
import bcrypt from 'bcryptjs'

export async function PUT(req: NextRequest) {
  const authResult = requireAuth(req, ['ADMIN'])
  if (!authResult.success) return authResult.response!

  const userId = authResult.user!.userId

  try {
    const data = await req.json()
    const { name, email, currentPassword, newPassword } = data

    // Verify current password if they want to change password
    let passwordHash = undefined
    if (newPassword && currentPassword) {
      const dbUser = await prisma.user.findUnique({ where: { id: userId } })
      if (!dbUser) return handleError(new Error('User not found'), req)

      const isValid = await bcrypt.compare(currentPassword, dbUser.password)
      if (!isValid) {
        return handleError(new Error('Invalid current password'), req)
      }
      passwordHash = await bcrypt.hash(newPassword, 10)
    }

    const updateData: any = {}
    if (name) updateData.name = name
    if (email) updateData.email = email
    if (passwordHash) updateData.password = passwordHash

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
    })

    return successResponse({ 
      id: updatedUser.id, 
      name: updatedUser.name, 
      email: updatedUser.email 
    }, 'Profile updated successfully')

  } catch (error: any) {
    return handleError(error, req)
  }
}

