export const dynamic = 'force-dynamic'
import { prisma } from '@/lib/prisma'
import UsuariosAdmin from './UsuariosAdmin'

export default async function UsuariosPage() {
  const users = await prisma.user.findMany({
    where: { role: 'cliente' },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      active: true,
      createdAt: true,
      _count: { select: { orders: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return <UsuariosAdmin users={JSON.parse(JSON.stringify(users))} />
}
