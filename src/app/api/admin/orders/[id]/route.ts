import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth/middleware'
import { handleError, successResponse } from '@/lib/errors/handler'

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const authResult = requireAuth(request, ['ADMIN']);
  if (!authResult.success) return authResult.response;
  
  try {
    await prisma.order.delete({ where: { id: params.id } })
    return successResponse({ success: true });
  } catch (error) {
    return handleError(error, request);
  }
}
