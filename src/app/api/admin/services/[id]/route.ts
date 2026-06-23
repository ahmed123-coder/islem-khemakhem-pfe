import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth/middleware'
import { handleError, successResponse } from '@/lib/errors/handler'
import { NotFoundError } from '@/lib/errors/types'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = requireAuth(request, ['ADMIN']);
  if (!authResult.success) return authResult.response;

  const { id } = params
  
  try {
    const service = await prisma.service.findUnique({
      where: { id },
      include: { tiers: true }
    })

    if (!service) {
      throw new NotFoundError('Service', id);
    }

    return successResponse({ ...service, title: service.name, icon: service.category });
  } catch (error) {
    return handleError(error, request);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = requireAuth(request, ['ADMIN']);
  if (!authResult.success) return authResult.response;

  const { id } = params
  
  try {
    const { title, description, icon, logo, isActive } = await request.json()
    
    const service = await prisma.service.update({
      where: { id },
      data: {
        name: title,
        description,
        category: icon,
        logo,
        isActive: isActive !== undefined ? isActive : true
      }
    })
    return successResponse({ ...service, title: service.name, icon: service.category });
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

  const { id } = params

  try {
    await prisma.service.delete({ where: { id } })
    return successResponse({ success: true });
  } catch (error) {
    return handleError(error, request);
  }
}
