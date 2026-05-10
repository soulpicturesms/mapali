import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { randomUUID } from 'crypto'

export async function GET() {
  const raw = await prisma.$queryRaw<any[]>`SELECT * FROM "GalleryPhoto" WHERE active = 1 ORDER BY "order" ASC`
  return NextResponse.json(raw.map(p => ({ ...p, active: Boolean(Number(p.active)) })))
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }
  const { url, label } = await req.json()
  if (!url || !label) return NextResponse.json({ error: 'URL y label requeridos' }, { status: 400 })

  const countRows = await prisma.$queryRaw<any[]>`SELECT COUNT(*) as c FROM "GalleryPhoto"`
  const count = Number(countRows[0]?.c ?? 0)
  const id = randomUUID()
  await prisma.$executeRaw`INSERT INTO "GalleryPhoto" (id, url, label, "order", active, createdAt) VALUES (${id}, ${url}, ${label}, ${count}, 1, datetime('now'))`
  return NextResponse.json({ id, url, label, order: count, active: true })
}
