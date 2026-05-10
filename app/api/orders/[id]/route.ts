import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

async function ensureColumns() {
  try {
    await prisma.$executeRaw`ALTER TABLE "OrderItem" ADD COLUMN "available" BOOLEAN NOT NULL DEFAULT true`
  } catch {}
  try {
    await prisma.$executeRaw`ALTER TABLE "OrderItem" ADD COLUMN "originalQuantity" INTEGER`
  } catch {}
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (session?.user?.role !== 'admin') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const { id } = await params
  const { status, unavailableItemIds = [], adjustedQuantities = {} } = await req.json()

  const order = await prisma.order.update({
    where: { id },
    data: { status },
    include: { items: true },
  })

  if (status === 'confirmado') {
    await ensureColumns()

    // Mark unavailable items
    for (const itemId of unavailableItemIds as string[]) {
      await prisma.$executeRaw`UPDATE "OrderItem" SET available = false WHERE id = ${itemId}`
    }

    // Save original quantity and apply adjustments
    for (const [itemId, newQty] of Object.entries(adjustedQuantities as Record<string, number>)) {
      const item = order.items.find(i => i.id === itemId)
      if (!item) continue
      const original = item.quantity
      if (newQty !== original) {
        await prisma.$executeRaw`UPDATE "OrderItem" SET "originalQuantity" = ${original}, quantity = ${newQty} WHERE id = ${itemId}`
      }
    }

    // Deduct stock only for available items (use adjusted quantity)
    const availableItems = order.items.filter(
      (item) => !(unavailableItemIds as string[]).includes(item.id)
    )
    await Promise.all(
      availableItems.map((item) => {
        const qty = (adjustedQuantities as Record<string, number>)[item.id] ?? item.quantity
        return prisma.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: qty } },
        })
      })
    )
  }

  return NextResponse.json(order)
}
