export const dynamic = 'force-dynamic'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import PedidosClient from './PedidosClient'

export default async function PedidosPage() {
  const session = await getServerSession(authOptions)
  const orders = await prisma.order.findMany({
    where: { userId: session!.user.id },
    include: {
      items: {
        include: {
          product: {
            include: { images: { take: 1, orderBy: { order: 'asc' } } },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  // Fetch availability and originalQuantity (columns may not exist yet)
  let extraData: { id: string; available: boolean; originalQuantity: number | null }[] = []
  try {
    extraData = await prisma.$queryRaw`SELECT id, available, "originalQuantity" FROM "OrderItem"`
  } catch {}

  const extraMap = new Map(extraData.map(r => [r.id, r]))

  const ordersWithAvailability = orders.map(order => ({
    ...order,
    items: order.items.map(item => {
      const extra = extraMap.get(item.id)
      return {
        ...item,
        available: extra ? Boolean(extra.available) : true,
        originalQuantity: extra?.originalQuantity ?? null,
      }
    }),
  }))

  return <PedidosClient orders={JSON.parse(JSON.stringify(ordersWithAvailability))} />
}
