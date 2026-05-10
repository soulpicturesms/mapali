import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (session?.user?.role !== 'admin') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const formData = await req.formData()
  const files = [
    ...formData.getAll('files'),
    ...formData.getAll('file'),
  ].filter(Boolean) as File[]

  if (!files || files.length === 0) {
    return NextResponse.json({ error: 'No se recibieron archivos' }, { status: 400 })
  }

  const urls: string[] = []

  for (const file of files) {
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const ext = file.name.split('.').pop() || 'jpg'
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

    if (process.env.BLOB_READ_WRITE_TOKEN) {
      // Production: Vercel Blob
      const { put } = await import('@vercel/blob')
      const blob = await put(`uploads/${filename}`, buffer, {
        access: 'public',
        contentType: file.type || 'image/jpeg',
      })
      urls.push(blob.url)
    } else {
      // Local dev: filesystem
      const { writeFile, mkdir } = await import('fs/promises')
      const { join } = await import('path')
      const uploadDir = join(process.cwd(), 'public', 'uploads')
      await mkdir(uploadDir, { recursive: true })
      await writeFile(join(uploadDir, filename), buffer)
      urls.push(`/uploads/${filename}`)
    }
  }

  return NextResponse.json({ urls, url: urls[0] })
}
