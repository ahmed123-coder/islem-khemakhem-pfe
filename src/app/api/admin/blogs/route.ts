import { NextRequest } from 'next/server'
import { requireAuth } from '@/lib/auth/middleware'
import { prisma } from '@/lib/prisma'
import { handleError, successResponse } from '@/lib/errors/handler'
import { uploadImage } from '@/lib/cloudinary'

export async function GET(req: NextRequest) {
  const authResult = requireAuth(req, ['ADMIN'])
  if (!authResult.success) return authResult.response!

  try {
    const blogs = await prisma.blog.findMany({ orderBy: { createdAt: 'desc' } })
    return successResponse(blogs)
  } catch (error) {
    return handleError(error, req)
  }
}

export async function POST(req: NextRequest) {
  const authResult = requireAuth(req, ['ADMIN'])
  if (!authResult.success) return authResult.response!

  try {
    const formData = await req.formData()
    const title = formData.get('title') as string
    const content = formData.get('content') as string
    const excerpt = formData.get('excerpt') as string | null
    const published = formData.get('published') === 'true'

    const iconFile = formData.get('icon') as File | null
    const imageFile = formData.get('image') as File | null

    let iconUrl = null
    if (iconFile) {
      const bytes = await iconFile.arrayBuffer()
      iconUrl = await uploadImage(Buffer.from(bytes), 'blogs')
    }

    let imageUrl = null
    if (imageFile) {
      const bytes = await imageFile.arrayBuffer()
      imageUrl = await uploadImage(Buffer.from(bytes), 'blogs')
    }

    const blog = await prisma.blog.create({ 
      data: {
        title,
        content,
        excerpt,
        published,
        icon: iconUrl,
        image: imageUrl
      }
    })
    return successResponse(blog, 'Blog post created successfully', 201)
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

    const title = formData.get('title') as string
    const content = formData.get('content') as string
    const excerpt = formData.get('excerpt') as string | null
    const publishedRaw = formData.get('published')

    const iconFile = formData.get('icon') as File | null
    const imageFile = formData.get('image') as File | null

    const dataToUpdate: any = {}
    if (title) dataToUpdate.title = title
    if (content) dataToUpdate.content = content
    if (excerpt !== null) dataToUpdate.excerpt = excerpt
    if (publishedRaw !== null) dataToUpdate.published = publishedRaw === 'true'

    if (iconFile) {
      const bytes = await iconFile.arrayBuffer()
      dataToUpdate.icon = await uploadImage(Buffer.from(bytes), 'blogs')
    }

    if (imageFile) {
      const bytes = await imageFile.arrayBuffer()
      dataToUpdate.image = await uploadImage(Buffer.from(bytes), 'blogs')
    }

    const blog = await prisma.blog.update({ 
      where: { id }, 
      data: dataToUpdate 
    })
    return successResponse(blog, 'Blog post updated successfully')
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

    await prisma.blog.delete({ where: { id } })
    return successResponse({ success: true }, 'Blog post deleted successfully')
  } catch (error) {
    return handleError(error, req)
  }
}

