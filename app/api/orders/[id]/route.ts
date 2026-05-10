import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// Ensure the 'available' column exists on OrderItem (runs once, safe to retry)
async function ensureAvailableColumn() {
  try {
    await prisma.$executeRaw`ALTER TABLE "OrderItem" ADD COLUMN "available" INTEGER NOT NULL DEFAULT 1`
  } catch {}
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (session?.user?.role !== 'admin') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const { id } = await params
  const { status, unavailableItemIds = [] } = await req.json()

  const order = await prisma.order.update({
    where: { id },
    data: { status },
    include: { items: true },
  })

  if (status === 'confirmado') {
    await ensureAvailableColumn()

    // Mark unavailable items in DB so clients can see them
    for (const itemId of unavailableItemIds as string[]) {
      await prisma.$executeRaw`UPDATE "OrderItem" SET available = 0 WHERE id = ${itemId}`
    }

    // Deduct stock only for available items
    const availableItems = order.items.filter(
      (item) => !(unavailableItemIds as string[]).includes(item.id)
    )
    await Promise.all(
      availableItems.map((item) =>
        prisma.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        })
      )
    )
  }

  return NextResponse.json(order)
}
