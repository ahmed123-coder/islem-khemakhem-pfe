import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/middleware'
import { checkMissionAccess } from '@/lib/mission-access'
import { writeFile } from 'fs/promises'
import { join } from 'path'
import { randomUUID } from 'crypto'

// GET - List documents for a mission
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const authResult = await requireAuth(req)
  if ('error' in authResult) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status })
  }

  const { user } = authResult
  const missionId = params.id

  try {
    // Check mission access
    const hasAccess = await checkMissionAccess(missionId, user.userId, user.role)
    if (!hasAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const documents = await prisma.missionDocument.findMany({
      where: { missionId },
      include: {
        uploadedBy: { select: { id: true, name: true, email: true } }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(documents)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch documents' }, { status: 500 })
  }
}

// POST - Upload document
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const authResult = await requireAuth(req)
  if ('error' in authResult) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status })
  }

  const { user } = authResult
  const missionId = params.id

  try {
    // Check mission access
    const hasAccess = await checkMissionAccess(missionId, user.userId, user.role)
    if (!hasAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const formData = await req.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large (max 10MB)' }, { status: 400 })
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop()
    const uniqueFileName = `${randomUUID()}.${fileExt}`
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'documents')
    const filePath = join(uploadDir, uniqueFileName)

    // Save file
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filePath, buffer)

    // Save to database
    const document = await prisma.missionDocument.create({
      data: {
        fileName: file.name,
        fileUrl: `/uploads/documents/${uniqueFileName}`,
        fileSize: file.size,
        mimeType: file.type,
        uploadedById: user.userId,
        missionId
      },
      include: {
        uploadedBy: { select: { id: true, name: true, email: true } }
      }
    })

    return NextResponse.json(document, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to upload document' }, { status: 500 })
  }
}

// DELETE - Delete document
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const authResult = await requireAuth(req)
  if ('error' in authResult) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status })
  }

  const { user } = authResult
  const missionId = params.id
  const { searchParams } = new URL(req.url)
  const documentId = searchParams.get('documentId')

  if (!documentId) {
    return NextResponse.json({ error: 'Document ID required' }, { status: 400 })
  }

  try {
    // Get document
    const document = await prisma.missionDocument.findUnique({
      where: { id: documentId },
      include: { mission: true }
    })

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    if (document.missionId !== missionId) {
      return NextResponse.json({ error: 'Invalid mission' }, { status: 400 })
    }

    // Check permissions - only uploader, mission client, or admin can delete
    const canDelete = 
      user.role === 'ADMIN' ||
      document.uploadedById === user.userId ||
      (user.role === 'CLIENT' && document.mission.clientId === user.userId)

    if (!canDelete) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Delete from database
    await prisma.missionDocument.delete({
      where: { id: documentId }
    })

    // Note: File deletion from filesystem can be added here if needed
    // const fs = require('fs').promises
    // await fs.unlink(join(process.cwd(), 'public', document.fileUrl))

    return NextResponse.json({ message: 'Document deleted' })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete document' }, { status: 500 })
  }
}
