import { NextRequest, NextResponse } from 'next/server'
import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

function uploadToCloudinary(buffer: Buffer, folder: string, resourceType: 'raw' | 'image' | 'auto'): Promise<string> {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      { folder, resource_type: resourceType, use_filename: true, unique_filename: true },
      (error, result) => {
        if (error) return reject(error)
        if (!result) return reject(new Error('Upload failed'))
        resolve(result.secure_url)
      }
    ).end(buffer)
  })
}

const ALLOWED_TYPES = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
const ALLOWED_EXTS = ['.pdf', '.png', '.jpg', '.jpeg', '.doc', '.docx']

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const folder = (formData.get('folder') as string) || 'documents'

    if (!file) {
      return NextResponse.json({ error: 'Aucun fichier fourni' }, { status: 400 })
    }

    const ext = '.' + file.name.split('.').pop()?.toLowerCase()

    if (!ALLOWED_TYPES.includes(file.type) && !ALLOWED_EXTS.includes(ext)) {
      return NextResponse.json({ error: 'Type de fichier non autorisé. Formats acceptés : PDF, PNG, JPG, DOC, DOCX' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const isPdf = file.type === 'application/pdf' || ext === '.pdf'
    const isDoc = ['.doc', '.docx'].includes(ext)
    const resourceType = (isPdf || isDoc) ? 'raw' : 'image'

    const url = await uploadToCloudinary(buffer, folder, resourceType)

    return NextResponse.json({ url })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erreur lors du téléchargement'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
