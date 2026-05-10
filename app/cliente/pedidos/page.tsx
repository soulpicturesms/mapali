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

  // Fetch unavailable item IDs (column may not exist yet — catch safely)
  let unavailableItemIds: string[] = []
  try {
    const rows = await prisma.$queryRaw<{ id: string }[]>`SELECT id FROM "OrderItem" WHERE available = false`
    unavailableItemIds = rows.map(r => r.id)
  } catch {}

  const ordersWithAvailability = orders.map(order => ({
    ...order,
    items: order.items.map(item => ({
      ...item,
      available: !unavailableItemIds.includes(item.id),
    })),
  }))

  return <PedidosClient orders={JSON.parse(JSON.stringify(ordersWithAvailability))} />
}
