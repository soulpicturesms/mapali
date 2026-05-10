import { prisma } from '@/lib/prisma'
import PedidosAdmin from './PedidosAdmin'

export default async function PedidosAdminPage() {
  const orders = await prisma.order.findMany({
    include: {
      user: { select: { name: true, email: true, phone: true } },
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

  return <PedidosAdmin orders={JSON.parse(JSON.stringify(ordersWithAvailability))} />
}
