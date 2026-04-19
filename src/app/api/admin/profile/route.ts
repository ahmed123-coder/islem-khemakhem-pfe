import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function PUT(req: Request) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await req.json()
    const { name, email, currentPassword, newPassword } = data

    // Verify current password if they want to change password
    let passwordHash = undefined
    if (newPassword && currentPassword) {
      const dbUser = await prisma.user.findUnique({ where: { id: user.id } })
      if (!dbUser) return NextResponse.json({ error: 'User not found' }, { status: 404 })

      const isValid = await bcrypt.compare(currentPassword, dbUser.password)
      if (!isValid) {
        return NextResponse.json({ error: 'Invalid current password' }, { status: 400 })
      }
      passwordHash = await bcrypt.hash(newPassword, 10)
    }

    const updateData: any = {}
    if (name) updateData.name = name
    if (email) updateData.email = email
    if (passwordHash) updateData.password = passwordHash

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: updateData,
    })

    return NextResponse.json({ success: true, user: { id: updatedUser.id, name: updatedUser.name, email: updatedUser.email } })

  } catch (error: any) {
    console.error('Profile update error:', error)
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
  }
}
