export const dynamic = 'force-dynamic'
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

  return <PedidosAdmin orders={JSON.parse(JSON.stringify(ordersWithAvailability))} />
}
