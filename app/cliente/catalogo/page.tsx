export const dynamic = 'force-dynamic'
import { prisma } from '@/lib/prisma'
import ClienteCatalogoView from './ClienteCatalogoView'

export default async function ClienteCatalogoPage() {
  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      where: { visible: true },
      include: {
        category: true,
        images: { orderBy: { order: 'asc' } },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.category.findMany({
      where: { active: true },
      orderBy: { order: 'asc' },
    }),
  ])

  return (
    <ClienteCatalogoView
      products={JSON.parse(JSON.stringify(products))}
      categories={JSON.parse(JSON.stringify(categories))}
    />
  )
}
