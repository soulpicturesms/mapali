import { prisma } from '@/lib/prisma'
import CategoriasAdmin from './CategoriasAdmin'

export default async function CategoriasPage() {
  const categories = await prisma.category.findMany({
    orderBy: { order: 'asc' },
    include: { _count: { select: { products: true } } },
  })
  return <CategoriasAdmin categories={JSON.parse(JSON.stringify(categories))} />
}
