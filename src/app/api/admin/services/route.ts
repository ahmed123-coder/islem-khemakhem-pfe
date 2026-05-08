import { NextRequest } from 'next/server'
import { requireAuth } from '@/lib/auth/middleware'
import { prisma } from '@/lib/prisma'
import { handleError, successResponse } from '@/lib/errors/handler'
import { uploadImage } from '@/lib/cloudinary'

export async function GET(req: NextRequest) {
  const authResult = requireAuth(req, ['ADMIN'])
  if (!authResult.success) return authResult.response!

  try {
    const services = await prisma.service.findMany({ orderBy: { createdAt: 'desc' } })
    return successResponse(services)
  } catch (error) {
    return handleError(error, req)
  }
}

export async function POST(req: NextRequest) {
  const authResult = requireAuth(req, ['ADMIN'])
  if (!authResult.success) return authResult.response!

  try {
    const formData = await req.formData()
    const name = formData.get('name') as string
    const description = formData.get('description') as string
    const category = formData.get('category') as string | null

    const iconFile = formData.get('icon') as File | null
    const imageFile = formData.get('image') as File | null

    let iconUrl = null
    if (iconFile) {
      const bytes = await iconFile.arrayBuffer()
      iconUrl = await uploadImage(Buffer.from(bytes), 'services')
    }

    let imageUrl = null
    if (imageFile) {
      const bytes = await imageFile.arrayBuffer()
      imageUrl = await uploadImage(Buffer.from(bytes), 'services')
    }

    const service = await prisma.service.create({ 
      data: { 
        name, 
        description, 
        category,
        icon: iconUrl,
        image: imageUrl
      } 
    })
    return successResponse(service, 'Service created successfully', 201)
  } catch (error) {
    return handleError(error, req)
  }
}

export async function PUT(req: NextRequest) {
  const authResult = requireAuth(req, ['ADMIN'])
  if (!authResult.success) return authResult.response!

  try {
    const formData = await req.formData()
    const id = formData.get('id') as string
    if (!id) return handleError(new Error('ID required'), req)

    const name = formData.get('name') as string
    const description = formData.get('description') as string
    const category = formData.get('category') as string | null
    const isActiveRaw = formData.get('isActive')

    const iconFile = formData.get('icon') as File | null
    const imageFile = formData.get('image') as File | null

    const dataToUpdate: any = {}
    if (name) dataToUpdate.name = name
    if (description) dataToUpdate.description = description
    if (category !== null) dataToUpdate.category = category
    if (isActiveRaw !== null) dataToUpdate.isActive = isActiveRaw === 'true'

    if (iconFile) {
      const bytes = await iconFile.arrayBuffer()
      dataToUpdate.icon = await uploadImage(Buffer.from(bytes), 'services')
    }

    if (imageFile) {
      const bytes = await imageFile.arrayBuffer()
      dataToUpdate.image = await uploadImage(Buffer.from(bytes), 'services')
    }

    const service = await prisma.service.update({ 
      where: { id }, 
      data: dataToUpdate
    })
    return successResponse(service, 'Service updated successfully')
  } catch (error) {
    return handleError(error, req)
  }
}

export async function DELETE(req: NextRequest) {
  const authResult = requireAuth(req, ['ADMIN'])
  if (!authResult.success) return authResult.response!

  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) return handleError(new Error('ID required'), req)

    await prisma.service.delete({ where: { id } })
    return successResponse({ success: true }, 'Service deleted successfully')
  } catch (error) {
    return handleError(error, req)
  }
}

