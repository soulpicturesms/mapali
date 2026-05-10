import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST() {
  const password = await bcrypt.hash('1234', 10)

  // Update or create admin user with username "admin"
  await prisma.user.upsert({
    where: { email: 'admin' },
    update: { password, name: 'Admin', active: true },
    create: { email: 'admin', name: 'Admin', password, role: 'admin', active: true },
  })

  // Remove old admin email if exists
  try {
    const old = await prisma.user.findUnique({ where: { email: 'admin@mapalibeach.com' } })
    if (old) await prisma.user.delete({ where: { email: 'admin@mapalibeach.com' } })
  } catch {}

  // Update or create test user with username "test"
  await prisma.user.upsert({
    where: { email: 'test' },
    update: { password, name: 'Cliente Test', active: true },
    create: { email: 'test', name: 'Cliente Test', password, role: 'cliente', active: true },
  })

  // Remove old test email if exists
  try {
    const old = await prisma.user.findUnique({ where: { email: 'test@mapalibeach.com' } })
    if (old) await prisma.user.delete({ where: { email: 'test@mapalibeach.com' } })
  } catch {}

  return NextResponse.json({ ok: true, message: 'Credenciales actualizadas' })
}
