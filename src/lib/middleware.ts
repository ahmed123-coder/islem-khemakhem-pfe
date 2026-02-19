import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from './auth'

export async function requireAuth(req: NextRequest) {
  const token = req.cookies.get('auth_token')?.value
  if (!token) {
    return { error: 'Unauthorized', status: 401 }
  }

  const payload = verifyToken(token)
  if (!payload) {
    return { error: 'Invalid token', status: 401 }
  }

  return { user: payload }
}

export async function requireRole(req: NextRequest, allowedRoles: string[]) {
  const authResult = await requireAuth(req)
  if ('error' in authResult) {
    return authResult
  }

  if (!allowedRoles.includes(authResult.user.role)) {
    return { error: 'Forbidden', status: 403 }
  }

  return authResult
}
