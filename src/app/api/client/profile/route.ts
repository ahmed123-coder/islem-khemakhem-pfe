// SECURITY: Backend Authorization - Client-only route protection
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth/middleware'
import { handleError, successResponse } from '@/lib/errors/handler'

export async function GET(request: NextRequest) {
  // Authenticate and authorize - CLIENT only
  const authResult = requireAuth(request, ['CLIENT']);
  if (!authResult.success || !authResult.user) {
    return authResult.response;
  }

  try {
    return successResponse({ 
      name: authResult.user.email.split('@')[0] || '', 
      email: authResult.user.email 
    });
  } catch (error) {
    return handleError(error, request);
  }
}

export async function PUT(request: NextRequest) {
  // Authenticate and authorize - CLIENT only
  const authResult = requireAuth(request, ['CLIENT']);
  if (!authResult.success || !authResult.user) {
    return authResult.response;
  }

  try {
    const { name } = await request.json()

    await prisma.user.update({
      where: { id: authResult.user.userId },
      data: { name }
    })

    return successResponse({ success: true }, 'Profile updated successfully');
  } catch (error) {
    return handleError(error, request);
  }
}
// END SECURITY: Backend Authorization - Client route protection complete

