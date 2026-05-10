import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { randomUUID } from 'crypto'

export async function GET(req: NextRequest) {
  const section = req.nextUrl.searchParams.get('section')
  const raw = section
    ? await prisma.$queryRaw<any[]>`SELECT * FROM "SectionItem" WHERE section = ${section} AND active = 1 ORDER BY "order" ASC`
    : await prisma.$queryRaw<any[]>`SELECT * FROM "SectionItem" WHERE active = 1 ORDER BY "order" ASC`
  return NextResponse.json(raw.map(i => ({ ...i, active: Boolean(Number(i.active)) })))
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }
  const { section, url, label, subtitle } = await req.json()
  if (!section || !url) return NextResponse.json({ error: 'Faltan datos' }, { status: 400 })

  const countRows = await prisma.$queryRaw<any[]>`SELECT COUNT(*) as c FROM "SectionItem" WHERE section = ${section}`
  const count = Number(countRows[0]?.c ?? 0)
  const id = randomUUID()
  const lbl = label || null
  const sub = subtitle || null
  await prisma.$executeRaw`INSERT INTO "SectionItem" (id, section, url, label, subtitle, "order", active, createdAt) VALUES (${id}, ${section}, ${url}, ${lbl}, ${sub}, ${count}, 1, datetime('now'))`
  return NextResponse.json({ id, section, url, label: lbl, subtitle: sub, order: count, active: true })
}
