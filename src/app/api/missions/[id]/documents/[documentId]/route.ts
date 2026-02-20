import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/middleware'
import { checkMissionAccess } from '@/lib/mission-access'
import { readFile } from 'fs/promises'
import { join } from 'path'

export async function GET(req: NextRequest, { params }: { params: { id: string; documentId: string } }) {
  const authResult = await requireAuth(req)
  if ('error' in authResult) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status })
  }

  const { user } = authResult
  const { id: missionId, documentId } = params

  try {
    // Get document
    const document = await prisma.missionDocument.findUnique({
      where: { id: documentId }
    })

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    if (document.missionId !== missionId) {
      return NextResponse.json({ error: 'Invalid mission' }, { status: 400 })
    }

    // Check mission access
    const hasAccess = await checkMissionAccess(missionId, user.userId, user.role)
    if (!hasAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Read file
    const filePath = join(process.cwd(), 'public', document.fileUrl)
    const fileBuffer = await readFile(filePath)

    // Return file
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': document.mimeType || 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${document.fileName}"`,
        'Content-Length': document.fileSize?.toString() || fileBuffer.length.toString()
      }
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to download document' }, { status: 500 })
  }
}
