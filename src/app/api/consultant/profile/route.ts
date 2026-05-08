// SECURITY: Backend Authorization - Consultant-only route protection
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth/middleware'
import { handleError, successResponse } from '@/lib/errors/handler'

export async function GET(request: NextRequest) {
  // Authenticate and authorize - CONSULTANT only
  const authResult = requireAuth(request, ['CONSULTANT']);
  if (!authResult.success || !authResult.user) {
    return authResult.response;
  }

  try {
    const consultant = await prisma.consultant.findUnique({ 
      where: { email: authResult.user.email },
      select: { name: true, email: true, specialty: true }
    })

    return successResponse(consultant || { name: '', email: '', specialty: '' });
  } catch (error) {
    return handleError(error, request);
  }
}

export async function PUT(request: NextRequest) {
  // Authenticate and authorize - CONSULTANT only
  const authResult = requireAuth(request, ['CONSULTANT']);
  if (!authResult.success || !authResult.user) {
    return authResult.response;
  }

  try {
    const { name, specialty } = await request.json()

    await prisma.consultant.update({
      where: { email: authResult.user.email },
      data: { name, specialty }
    })

    return successResponse({ success: true }, 'Profile updated successfully');
  } catch (error) {
    return handleError(error, request);
  }
}
// END SECURITY: Backend Authorization - Consultant route protection complete

