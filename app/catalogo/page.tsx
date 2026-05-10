export const dynamic = 'force-dynamic'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import CatalogoClient from './CatalogoClient'
import { prisma } from '@/lib/prisma'

export default async function CatalogoPage() {
  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      where: { visible: true },
      include: {
        category: true,
        images: { orderBy: { order: 'asc' }, take: 1 },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.category.findMany({
      where: { active: true },
      orderBy: { order: 'asc' },
    }),
  ])

  return (
    <>
      <Navbar />
      <main className="min-h-screen" style={{ backgroundColor: '#F5F0E8' }}>
        {/* Header */}
        <div className="relative py-16 overflow-hidden" style={{ backgroundColor: '#5C3D1E' }}>
          <div className="absolute inset-0 pointer-events-none select-none opacity-10">
            <div className="absolute top-0 right-0 text-[100px] rotate-12">🌴</div>
            <div className="absolute bottom-0 left-0 text-[80px] -rotate-12">🌊</div>
          </div>
          <div className="relative text-center">
            <h1 className="text-5xl font-black text-white mb-2">
              📿 Catálogo
            </h1>
            <p className="text-xl italic" style={{ color: '#D4A456' }}>
              Joyería & Accesorios Artesanales
            </p>
            <p className="mt-2 text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
              Colecciones inspiradas en la playa y la naturaleza 🌿
            </p>
          </div>
          <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none">
            <svg viewBox="0 0 1440 40" className="w-full" style={{ fill: '#F5F0E8' }}>
              <path d="M0,20 C360,40 1080,0 1440,20 L1440,40 L0,40 Z" />
            </svg>
          </div>
        </div>

        <CatalogoClient products={JSON.parse(JSON.stringify(products))} categories={JSON.parse(JSON.stringify(categories))} />
      </main>
      <Footer />
    </>
  )
}
