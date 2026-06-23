import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth/middleware'
import { handleError, successResponse } from '@/lib/errors/handler'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = requireAuth(request, ['ADMIN']);
  if (!authResult.success) return authResult.response;

  const id = params.id
  
  try {
    const data = await request.json()
    
    const contact = await prisma.contact.update({
      where: { id },
      data: {
        status: data.status
      }
    })
    return successResponse(contact);
  } catch (error) {
    return handleError(error, request);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = requireAuth(request, ['ADMIN']);
  if (!authResult.success) return authResult.response;

  const id = params.id

  try {
    await prisma.contact.delete({ where: { id } })
    return successResponse({ success: true });
  } catch (error) {
    return handleError(error, request);
  }
}
