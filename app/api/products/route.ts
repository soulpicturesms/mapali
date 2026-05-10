import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const categorySlug = searchParams.get('category')
  const featured = searchParams.get('featured')
  const session = await getServerSession(authOptions)
  const isAdmin = session?.user?.role === 'admin'

  const where: any = {}
  if (!isAdmin) where.visible = true
  if (categorySlug && categorySlug !== 'todos') {
    where.category = { slug: categorySlug }
  }
  if (featured === 'true') where.featured = true

  const products = await prisma.product.findMany({
    where,
    include: {
      category: true,
      images: { orderBy: { order: 'asc' } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(products)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (session?.user?.role !== 'admin') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const body = await req.json()
  const { name, code, description, price, stock, visible, featured, categoryId, images } = body

  const product = await prisma.product.create({
    data: {
      name,
      code,
      description,
      price: price ? parseFloat(price) : null,
      stock: parseInt(stock) || 0,
      visible: visible ?? true,
      featured: featured ?? false,
      categoryId: categoryId || null,
      images: images?.length
        ? {
            create: images.map((url: string, i: number) => ({
              url,
              order: i,
            })),
          }
        : undefined,
    },
    include: { images: true, category: true },
  })

  return NextResponse.json(product)
}
