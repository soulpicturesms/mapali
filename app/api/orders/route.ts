import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { sendOrderNotification } from '@/lib/email'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const isAdmin = session.user.role === 'admin'

  const where: any = {}
  if (!isAdmin) where.userId = session.user.id
  const status = searchParams.get('status')
  if (status) where.status = status

  const orders = await prisma.order.findMany({
    where,
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

  return NextResponse.json(orders)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const body = await req.json()
  const { items, notes } = body

  if (!items || items.length === 0) {
    return NextResponse.json({ error: 'El pedido debe tener al menos un artículo' }, { status: 400 })
  }

  const order = await prisma.order.create({
    data: {
      userId: session.user.id,
      notes,
      items: {
        create: items.map((item: { productId: string; quantity: number; notes?: string }) => ({
          productId: item.productId,
          quantity: item.quantity,
          notes: item.notes,
        })),
      },
    },
    include: {
      user: true,
      items: {
        include: {
          product: {
            include: { images: { take: 1, orderBy: { order: 'asc' } } },
          },
        },
      },
    },
  })

  // Send email + WhatsApp notification
  await sendOrderNotification({
    id: order.id,
    clientName: order.user.name || 'Sin nombre',
    clientEmail: order.user.email,
    items: order.items.map((i) => ({
      productName: i.product.name,
      productCode: i.product.code,
      quantity: i.quantity,
      notes: i.notes,
    })),
    notes: order.notes,
  })

  return NextResponse.json(order)
}
