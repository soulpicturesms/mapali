import SeccionesAdmin from './SeccionesAdmin'
import { prisma } from '@/lib/prisma'

export default async function SeccionesPage() {
  const all = await prisma.$queryRaw<any[]>`SELECT * FROM "SectionItem" ORDER BY "order" ASC`
  const items = all.map(i => ({ ...i, active: Boolean(Number(i.active)) }))

  const heroSlots = [0, 1, 2, 3].map(slot => ({
    slot,
    items: items.filter(i => i.section === `hero_${slot}`),
  }))
  const bolsos = items.filter(i => i.section === 'bolsos')

  return <SeccionesAdmin heroSlots={heroSlots} bolsosInitial={bolsos} />
}
