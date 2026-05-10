import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import HeroSlideshow from '@/components/HeroSlideshow'

async function getFeaturedProducts() {
  return prisma.product.findMany({
    where: { featured: true, visible: true },
    include: { images: { orderBy: { order: 'asc' }, take: 1 }, category: true },
    take: 6,
  })
}

async function getSectionItems() {
  try {
    const raw = await prisma.$queryRaw<any[]>`SELECT * FROM "SectionItem" WHERE active = true ORDER BY "order" ASC`
    return raw as { id: string; section: string; url: string; label?: string | null; subtitle?: string | null }[]
  } catch { return [] }
}

async function getGalleryPhotos() {
  try {
    const raw = await prisma.$queryRaw<any[]>`SELECT * FROM "GalleryPhoto" WHERE active = true ORDER BY "order" ASC`
    return raw as { id: string; url: string; label: string }[]
  } catch { return [] }
}

// Fallback si la galería del admin está vacía
const GALLERY_FALLBACK = [
  { id: '1', url: '/uploads/1.jpg', label: 'Collar Estrella Lila' },
  { id: '2', url: '/uploads/625427031_18434292976117136_6408267993621859003_n.jpg', label: 'Colección Tropical' },
  { id: '3', url: '/uploads/3.jpg', label: 'Collar Pez Rosado' },
  { id: '4', url: '/uploads/625973076_18409338064120281_6238602945464082546_n.jpg', label: 'Pulseras Naturales' },
  { id: '5', url: '/uploads/621752952_18344595364224718_501820947408374506_n.jpg', label: 'Bolso Hibiscus' },
  { id: '6', url: '/uploads/5.jpg', label: 'Collar Estrella Blanca' },
  { id: '7', url: '/uploads/621601327_18347823259228164_2692812966605630185_n.jpg', label: 'Bolsos de Playa' },
  { id: '8', url: '/uploads/12.jpg', label: 'Colección Completa' },
  { id: '9', url: '/uploads/9.jpg', label: 'Collar Pez Nácar' },
  { id: '10', url: '/uploads/4.jpg', label: 'Collar Estrella Violeta' },
  { id: '11', url: '/uploads/6.jpg', label: 'Collar Pez Iridiscente' },
  { id: '12', url: '/uploads/2.jpg', label: 'Collar Flor Celeste' },
]

const HERO_LIFESTYLE = '/uploads/625427031_18434292976117136_6408267993621859003_n.jpg'

export default async function Home() {
  const [featured, galleryFromDb, sectionItems] = await Promise.all([
    getFeaturedProducts(), getGalleryPhotos(), getSectionItems(),
  ])

  // Hero slots
  const heroSlots = [0, 1, 2, 3].map(slot => ({
    slot,
    slides: sectionItems
      .filter(i => i.section === `hero_${slot}`)
      .map(i => ({ url: i.url, label: i.label })),
  }))
  const hasHeroContent = heroSlots.some(s => s.slides.length > 0)

  // Fallback hero si no hay contenido en admin aún
  const HERO_FALLBACK = [
    [{ url: '/uploads/1.jpg', label: 'Collar Estrella Lila' }, { url: '/uploads/4.jpg', label: 'Collar Estrella Violeta' }],
    [{ url: '/uploads/621752952_18344595364224718_501820947408374506_n.jpg', label: 'Bolso Hibiscus' }],
    [{ url: '/uploads/3.jpg', label: 'Collar Pez Rosado' }, { url: '/uploads/6.jpg', label: 'Collar Iridiscente' }],
    [{ url: '/uploads/5.jpg', label: 'Collar Blanca' }, { url: '/uploads/9.jpg', label: 'Collar Nácar' }],
  ]
  const finalHeroSlots = hasHeroContent
    ? heroSlots
    : heroSlots.map((s, i) => ({ ...s, slides: HERO_FALLBACK[i] }))

  // Bolsos section
  const bolsosItems = sectionItems.filter(i => i.section === 'bolsos')
  const hasBolsos = bolsosItems.length > 0
  const BOLSOS_FALLBACK = [
    { id: 'b1', url: '/uploads/621601327_18347823259228164_2692812966605630185_n.jpg', label: 'Mochilas Tropical', subtitle: 'Con flecos de colores · Edición limitada' },
    { id: 'b2', url: '/uploads/621752952_18344595364224718_501820947408374506_n.jpg', label: 'Cartera Hibiscus', subtitle: 'Flecos rosas · Estampado tropical' },
  ]
  const finalBolsos = hasBolsos ? bolsosItems : BOLSOS_FALLBACK
  const gallery = galleryFromDb.length > 0 ? galleryFromDb : GALLERY_FALLBACK
  const waLink = `https://wa.me/18293429417?text=Hola%20Mapali%20Beach!%20Me%20interesa%20conocer%20sus%20colecciones%20🌴`

  return (
    <>
      <Navbar />
      <main>
        {/* ─── HERO ─── */}
        <section className="relative min-h-screen flex items-center overflow-hidden" style={{ backgroundColor: '#2C1A0E' }}>
          {/* Background lifestyle photo */}
          <div className="absolute inset-0">
            <img
              src={HERO_LIFESTYLE}
              alt="Mapali Beach"
              className="w-full h-full object-cover opacity-30"
              style={{ objectPosition: 'center 20%' }}
            />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(44,26,14,0.85) 0%, rgba(44,26,14,0.5) 60%, rgba(20,184,166,0.3) 100%)' }} />
          </div>

          {/* Palm leaf decorations */}
          <div className="absolute inset-0 pointer-events-none select-none">
            <div className="absolute top-0 right-0 text-[120px] opacity-10 rotate-12">🌴</div>
            <div className="absolute bottom-20 left-0 text-[90px] opacity-10 -rotate-12">🌿</div>
          </div>

          <div className="relative max-w-7xl mx-auto px-4 py-24 w-full">
            <div className="flex flex-col lg:flex-row items-center gap-16">
              {/* Text */}
              <div className="flex-1 text-center lg:text-left">
                {/* Logo grande */}
                <div className="flex justify-center lg:justify-start mb-6">
                  <div className="w-32 h-32 rounded-full overflow-hidden shadow-2xl flex items-center justify-center" style={{ border: '3px solid rgba(20,184,166,0.6)', boxShadow: '0 0 50px rgba(20,184,166,0.25), 0 0 0 6px rgba(20,184,166,0.1)', backgroundColor: 'rgba(20,184,166,0.15)' }}>
                    <img src="/logo.png" alt="Mapali Beach" className="w-full h-full object-cover" />
                  </div>
                </div>
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm mb-6 border" style={{ backgroundColor: 'rgba(20,184,166,0.15)', borderColor: 'rgba(20,184,166,0.4)', color: '#14B8A6' }}>
                  📍 Bávaro, Punta Cana · Productos de Colombia 🇨🇴
                </div>
                <h1 className="font-black text-white leading-none mb-4" style={{ fontSize: 'clamp(3.5rem, 8vw, 6rem)' }}>
                  MAPALI
                  <br />
                  <span style={{ color: '#14B8A6' }}>BEACH</span>
                </h1>
                <p className="text-xl lg:text-2xl italic mb-8" style={{ color: '#F5A623' }}>
                  "Our nature made jewelry"
                </p>
                <p className="text-lg mb-10 max-w-lg leading-relaxed" style={{ color: 'rgba(255,255,255,0.85)' }}>
                  Joyería y accesorios artesanales con materiales naturales.<br />
                  Estilo fresco, bohemio y tropical 🌊📿
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <Link href="/catalogo" className="btn-tropical px-9 py-4 rounded-full text-white font-bold text-lg shadow-2xl inline-block">
                    Ver Catálogo ✨
                  </Link>
                  <a href={waLink} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 justify-center text-white px-9 py-4 rounded-full font-bold text-lg transition-all hover:opacity-90 shadow-xl"
                    style={{ backgroundColor: '#25D366' }}>
                    <WhatsAppIcon /> Consultar
                  </a>
                </div>
              </div>

              {/* Hero slideshow — manejado desde admin */}
              <HeroSlideshow slots={finalHeroSlots} />
            </div>
          </div>

          {/* Wave */}
          <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none">
            <svg viewBox="0 0 1440 70" className="w-full" style={{ fill: '#FFFBF4' }}>
              <path d="M0,35 C240,70 480,0 720,35 C960,70 1200,0 1440,35 L1440,70 L0,70 Z" />
            </svg>
          </div>
        </section>

        {/* ─── STRIP STATS ─── */}
        <section className="py-8" style={{ backgroundColor: '#FFFBF4' }}>
          <div className="max-w-5xl mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: '📿', num: '100+', label: 'Diseños únicos' },
                { icon: '🌿', num: '100%', label: 'Natural & artesanal' },
                { icon: '🇨🇴', num: '1ra', label: 'Calidad colombiana' },
                { icon: '🌊', num: '∞', label: 'Estilo beach & boho' },
              ].map(s => (
                <div key={s.label} className="text-center bg-white rounded-2xl py-5 shadow-sm" style={{ border: '1px solid rgba(245,166,35,0.2)' }}>
                  <div className="text-3xl mb-1">{s.icon}</div>
                  <div className="text-2xl font-black" style={{ color: '#14B8A6' }}>{s.num}</div>
                  <div className="text-xs font-medium mt-0.5" style={{ color: '#7A5230' }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── GALERÍA MASONRY ─── */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-12">
              <span className="text-sm font-bold uppercase tracking-widest" style={{ color: '#14B8A6' }}>Nuestra Colección</span>
              <h2 className="text-4xl font-black mt-2 mb-3" style={{ color: '#2C1A0E' }}>
                Cada pieza, una historia 🌺
              </h2>
              <p style={{ color: '#7A5230' }}>Joyería artesanal inspirada en la playa y la naturaleza</p>
            </div>

            {/* Masonry-style grid — fotos desde el admin */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {[0, 1, 2, 3].map((col) => {
                const heights = ['h-64', 'h-40', 'h-52', 'h-48', 'h-56', 'h-44']
                const borders = [
                  'rgba(245,166,35,0.15)', 'rgba(20,184,166,0.2)',
                  'rgba(232,96,60,0.2)', 'rgba(245,166,35,0.15)',
                ]
                const colPhotos = gallery.filter((_, i) => i % 4 === col)
                return (
                  <div key={col} className="space-y-3" style={{ paddingTop: col % 2 === 1 ? 24 : 0 }}>
                    {colPhotos.map((photo, idx) => (
                      <div key={photo.id} className="relative group overflow-hidden rounded-2xl shadow-md"
                        style={{ border: `2px solid ${borders[col]}` }}>
                        <img
                          src={photo.url}
                          alt={photo.label}
                          className={`w-full ${heights[(col * 3 + idx) % heights.length]} object-cover transition-transform duration-500 group-hover:scale-105`}
                        />
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-end"
                          style={{ background: 'linear-gradient(transparent, rgba(44,26,14,0.8))' }}>
                          <p className="text-white font-bold p-3 text-sm">{photo.label}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              })}
            </div>

            <div className="text-center mt-10">
              <Link href="/catalogo" className="btn-tropical px-10 py-4 rounded-full text-white font-bold text-lg shadow-xl inline-block">
                Ver Catálogo Completo 📿
              </Link>
            </div>
          </div>
        </section>

        {/* ─── PRODUCTOS DESTACADOS ─── */}
        {featured.length > 0 && (
          <section className="py-20" style={{ backgroundColor: '#FFFBF4' }}>
            <div className="max-w-7xl mx-auto px-4">
              <div className="text-center mb-12">
                <span className="text-sm font-bold uppercase tracking-widest" style={{ color: '#14B8A6' }}>Novedades</span>
                <h2 className="text-4xl font-black mt-2 mb-3" style={{ color: '#2C1A0E' }}>
                  Productos Destacados ✨
                </h2>
                <p style={{ color: '#7A5230' }}>Las piezas más queridas de la temporada</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {featured.map((product) => (
                  <div key={product.id} className="product-card bg-white rounded-2xl overflow-hidden shadow-md" style={{ border: '1px solid rgba(245,166,35,0.2)' }}>
                    <div className="relative overflow-hidden" style={{ height: 280 }}>
                      {product.images[0] ? (
                        <img src={product.images[0].url} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-6xl" style={{ backgroundColor: '#FFFBF4' }}>📿</div>
                      )}
                      {product.stock === 0 && (
                        <div className="absolute inset-0 flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}>
                          <span className="text-white px-4 py-1.5 rounded-full font-bold" style={{ backgroundColor: '#E8603C' }}>Sin stock</span>
                        </div>
                      )}
                      <div className="absolute top-3 left-3">
                        <span className="text-white text-xs font-bold px-2 py-1 rounded-full" style={{ backgroundColor: '#F5A623' }}>✨ Destacado</span>
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-mono font-bold" style={{ color: '#14B8A6' }}>#{product.code}</span>
                        {product.category && (
                          <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: 'rgba(245,166,35,0.15)', color: '#2C1A0E' }}>
                            {product.category.icon} {product.category.name}
                          </span>
                        )}
                      </div>
                      <h3 className="font-bold text-lg" style={{ color: '#2C1A0E' }}>{product.name}</h3>
                      {product.description && (
                        <p className="text-sm mt-1 line-clamp-2" style={{ color: '#7A5230' }}>{product.description}</p>
                      )}
                      <div className="mt-3 flex items-center justify-between">
                        <span className="badge-stock" style={{
                          backgroundColor: product.stock > 0 ? 'rgba(20,184,166,0.2)' : 'rgba(239,68,68,0.1)',
                          color: product.stock > 0 ? '#3D9A8A' : '#DC2626',
                        }}>
                          {product.stock > 0 ? `Stock: ${product.stock}` : 'Sin stock'}
                        </span>
                        {product.price && <span className="font-bold" style={{ color: '#2C1A0E' }}>${product.price.toFixed(2)}</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ─── LIFESTYLE BANNER ─── */}
        <section className="relative py-0 overflow-hidden" style={{ minHeight: 420 }}>
          <img
            src="/uploads/625427031_18434292976117136_6408267993621859003_n.jpg"
            alt="Mapali Beach lifestyle"
            className="absolute inset-0 w-full h-full object-cover"
            style={{ objectPosition: 'center 25%' }}
          />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(90deg, rgba(44,26,14,0.88) 40%, rgba(44,26,14,0.3) 100%)' }} />
          <div className="relative h-full flex items-center min-h-[420px]">
            <div className="max-w-7xl mx-auto px-4 py-16">
              <div className="max-w-xl">
                <span className="text-sm font-bold uppercase tracking-widest" style={{ color: '#14B8A6' }}>Nuestra Esencia</span>
                <h2 className="text-4xl font-black text-white mt-3 mb-5 leading-tight">
                  Llevar la playa<br />a donde vayas 🌊
                </h2>
                <p className="text-lg leading-relaxed mb-8" style={{ color: 'rgba(255,255,255,0.85)' }}>
                  Diseños inspirados en la playa y la naturaleza, ideales para quienes buscan
                  piezas auténticas, elegantes y con personalidad.
                </p>
                <div className="flex flex-wrap gap-3">
                  {['📿 Joyería Artesanal', '🌿 Materiales Naturales', '🌊 Beach & Boho', '🇨🇴 Colombia'].map(tag => (
                    <span key={tag} className="px-4 py-1.5 rounded-full text-sm font-medium border" style={{ backgroundColor: 'rgba(255,255,255,0.1)', borderColor: 'rgba(245,166,35,0.4)', color: '#F5A623' }}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── FILA PULSERAS FOTO ─── */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex flex-col lg:flex-row items-center gap-12">
              <div className="flex-1">
                <span className="text-sm font-bold uppercase tracking-widest" style={{ color: '#E8603C' }}>Pulseras & Accesorios</span>
                <h2 className="text-3xl font-black mt-2 mb-4" style={{ color: '#2C1A0E' }}>
                  Materiales naturales<br />con personalidad única
                </h2>
                <p className="text-lg leading-relaxed mb-6" style={{ color: '#7A5230' }}>
                  Piedras naturales, madera, conchas y cristales artesanales seleccionados de
                  los mejores proveedores colombianos. Cada pieza es irrepetible.
                </p>
                <Link href="/catalogo" className="btn-tropical px-8 py-3 rounded-full text-white font-bold shadow-lg inline-block">
                  Explorar Colección 🌿
                </Link>
              </div>
              <div className="flex-1 relative">
                <div className="rounded-3xl overflow-hidden shadow-2xl" style={{ border: '3px solid rgba(20,184,166,0.3)' }}>
                  <img
                    src="/uploads/625973076_18409338064120281_6238602945464082546_n.jpg"
                    alt="Pulseras naturales Mapali Beach"
                    className="w-full h-80 object-cover"
                    style={{ objectPosition: 'center 60%' }}
                  />
                </div>
                {/* Floating badge */}
                <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl shadow-xl p-4" style={{ border: '2px solid rgba(20,184,166,0.3)' }}>
                  <div className="text-2xl mb-1">🌿</div>
                  <p className="text-xs font-bold" style={{ color: '#2C1A0E' }}>100% Natural</p>
                  <p className="text-xs" style={{ color: '#7A5230' }}>Sin químicos</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── BOLSOS STRIP — desde admin ─── */}
        <section className="py-16" style={{ backgroundColor: '#FFFBF4' }}>
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-black" style={{ color: '#2C1A0E' }}>Bolsos de Playa 👜</h2>
              <p className="mt-2" style={{ color: '#7A5230' }}>Estampados tropicales con flecos artesanales</p>
            </div>
            <div className={`grid gap-6 ${finalBolsos.length <= 2 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'}`}>
              {finalBolsos.map((item: any) => (
                <div key={item.id} className="relative group overflow-hidden rounded-3xl shadow-xl" style={{ height: 340 }}>
                  <img src={item.url} alt={item.label ?? 'Bolso'}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    style={{ objectPosition: 'center 30%' }} />
                  <div className="absolute inset-0" style={{ background: 'linear-gradient(transparent 40%, rgba(44,26,14,0.75))' }} />
                  {(item.label || item.subtitle) && (
                    <div className="absolute bottom-0 left-0 p-6">
                      {item.label && <p className="text-white font-black text-xl">{item.label}</p>}
                      {item.subtitle && <p className="text-sm mt-1" style={{ color: '#F5A623' }}>{item.subtitle}</p>}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── ABOUT ─── */}
        <section className="py-20 relative overflow-hidden" style={{ backgroundColor: '#2C1A0E' }}>
          <div className="absolute inset-0 pointer-events-none select-none opacity-8">
            <div className="absolute top-0 left-0 text-[200px] -rotate-12 opacity-10">🌴</div>
            <div className="absolute bottom-0 right-0 text-[150px] rotate-12 opacity-10">🌿</div>
          </div>
          <div className="relative max-w-4xl mx-auto px-4 text-center">
            <span className="text-4xl">🌺</span>
            <h2 className="text-4xl font-black text-white mt-4 mb-6">Nuestra Historia</h2>
            <p className="text-xl leading-relaxed mb-8" style={{ color: '#F5A623' }}>
              Mapali Beach es una marca dedicada a la distribución de joyería y accesorios artesanales,
              elaborados con materiales naturales que reflejan un estilo fresco, bohemio y tropical.
            </p>
            <p className="text-lg leading-relaxed mb-10" style={{ color: 'rgba(255,255,255,0.8)' }}>
              Perfectos para uso diario o para complementar looks de playa y verano. Nuestros productos
              destacan por su calidad, originalidad y conexión con lo natural. 🌊
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {[
                { icon: '📿', text: 'Joyería Artesanal' },
                { icon: '🌿', text: 'Materiales Naturales' },
                { icon: '🌊', text: 'Beach & Boho' },
                { icon: '🇨🇴', text: 'Made in Colombia' },
              ].map(t => (
                <span key={t.text} className="px-5 py-2 rounded-full text-sm font-medium border"
                  style={{ backgroundColor: 'rgba(255,255,255,0.08)', borderColor: 'rgba(245,166,35,0.35)', color: '#F5A623' }}>
                  {t.icon} {t.text}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ─── CTA FINAL ─── */}
        <section className="py-20 bg-white">
          <div className="max-w-3xl mx-auto px-4 text-center">
            {/* Small product strip */}
            <div className="flex justify-center gap-3 mb-10">
              {['/uploads/1.jpg', '/uploads/4.jpg', '/uploads/5.jpg', '/uploads/8.jpg', '/uploads/11.jpg'].map((src, i) => (
                <div key={i} className="w-14 h-14 rounded-full overflow-hidden shadow-md flex-shrink-0" style={{ border: '2px solid #14B8A6', transform: `rotate(${(i - 2) * 4}deg)` }}>
                  <img src={src} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
            <span className="text-5xl">🐚</span>
            <h2 className="text-4xl font-black mt-4 mb-4" style={{ color: '#2C1A0E' }}>
              ¿Lista para tu nueva joya?
            </h2>
            <p className="text-lg mb-8" style={{ color: '#7A5230' }}>
              Ingresá como cliente para ver el catálogo completo y hacer tu pre-orden
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/login" className="btn-tropical px-9 py-4 rounded-full text-white font-bold text-lg shadow-xl">
                Ingresar al Catálogo
              </Link>
              <a href={waLink} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 justify-center text-white px-9 py-4 rounded-full font-bold text-lg shadow-xl"
                style={{ backgroundColor: '#25D366' }}>
                <WhatsAppIcon /> WhatsApp
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}

function WhatsAppIcon() {
  return (
    <svg className="w-5 h-5" fill="white" viewBox="0 0 24 24">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
    </svg>
  )
}
