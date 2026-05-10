import { prisma } from '@/lib/prisma'
import ProductosAdmin from './ProductosAdmin'

export default async function ProductosPage() {
  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      include: {
        category: true,
        images: { orderBy: { order: 'asc' } },
        _count: { select: { orderItems: true } },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.category.findMany({ orderBy: { order: 'asc' } }),
  ])

  return (
    <ProductosAdmin
      products={JSON.parse(JSON.stringify(products))}
      categories={JSON.parse(JSON.stringify(categories))}
    />
  )
}
