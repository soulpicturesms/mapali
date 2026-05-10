import { prisma } from '@/lib/prisma'
import GaleriaAdmin from './GaleriaAdmin'

export default async function GaleriaPage() {
  const raw = await prisma.$queryRaw<any[]>`SELECT * FROM "GalleryPhoto" ORDER BY "order" ASC`
  const photos = raw.map(p => ({ ...p, active: Boolean(Number(p.active)) }))
  return <GaleriaAdmin photos={photos} />
}
