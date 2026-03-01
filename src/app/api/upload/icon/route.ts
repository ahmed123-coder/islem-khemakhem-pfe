import { NextResponse } from 'next/server'
import { writeFile } from 'fs/promises'
import { join } from 'path'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const filename = `icon-${Date.now()}-${file.name.replace(/\s/g, '-')}`
    const path = join(process.cwd(), 'public', 'uploads', filename)
    
    await writeFile(path, buffer)
    
    return NextResponse.json({ url: `/uploads/${filename}` })
  } catch (error) {
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
