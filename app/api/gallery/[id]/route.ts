import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'admin') return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  const { id } = await params
  const data = await req.json()
  if (data.active !== undefined) {
    const active = Boolean(data.active)
    await prisma.$executeRaw`UPDATE "GalleryPhoto" SET active = ${active} WHERE id = ${id}`
  }
  if (data.label !== undefined) {
    await prisma.$executeRaw`UPDATE "GalleryPhoto" SET label = ${data.label} WHERE id = ${id}`
  }
  if (data.url !== undefined) {
    await prisma.$executeRaw`UPDATE "GalleryPhoto" SET url = ${data.url} WHERE id = ${id}`
  }
  return NextResponse.json({ ok: true })
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'admin') return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  const { id } = await params
  await prisma.$executeRaw`DELETE FROM "GalleryPhoto" WHERE id = ${id}`
  return NextResponse.json({ ok: true })
}
