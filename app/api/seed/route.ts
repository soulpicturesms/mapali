import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { randomUUID } from 'crypto'

export async function POST() {
  // Admin user
  const adminPassword = await bcrypt.hash('admin123', 10)
  await prisma.user.upsert({
    where: { email: 'admin@mapalibeach.com' },
    update: {},
    create: { name: 'Admin Mapali', email: 'admin@mapalibeach.com', password: adminPassword, role: 'admin' },
  })

  // Categories
  const cats = [
    { name: 'Bolsos', slug: 'bolsos', icon: '👜', order: 1 },
    { name: 'Collares', slug: 'collares', icon: '📿', order: 2 },
    { name: 'Pulseras', slug: 'pulseras', icon: '🌿', order: 3 },
    { name: 'Tobilleras', slug: 'tobilleras', icon: '🌊', order: 4 },
    { name: 'Aros', slug: 'aros', icon: '✨', order: 5 },
    { name: 'Accesorios', slug: 'accesorios', icon: '🌴', order: 6 },
  ]
  const createdCats: Record<string, string> = {}
  for (const cat of cats) {
    const c = await prisma.category.upsert({ where: { slug: cat.slug }, update: {}, create: cat })
    createdCats[cat.slug] = c.id
  }

  // Clear existing products
  await prisma.productImage.deleteMany()
  await prisma.orderItem.deleteMany()
  await prisma.product.deleteMany()

  // Products - Collares
  const collares = [
    {
      code: 'COL-001', name: 'Collar Estrella Lila', featured: true, stock: 8,
      description: 'Collar de cristales lilas con perlas y colgante de estrella de mar morada. Perfecto para looks de playa.',
      images: ['/uploads/1.jpg'],
    },
    {
      code: 'COL-002', name: 'Collar Flor Celeste', featured: true, stock: 5,
      description: 'Collar lila degradé con perlas y dije floral azul artesanal. Diseño exclusivo de Colombia.',
      images: ['/uploads/2.jpg'],
    },
    {
      code: 'COL-003', name: 'Collar Pez Rosado', featured: true, stock: 6,
      description: 'Collar de cristales celestes con perlas y adorable pez rosado con lunares. 100% artesanal.',
      images: ['/uploads/3.jpg'],
    },
    {
      code: 'COL-004', name: 'Collar Estrella Violeta', featured: true, stock: 4,
      description: 'Collar lila con cristales facetados, perlas y estrella de mar violeta punteada.',
      images: ['/uploads/4.jpg'],
    },
    {
      code: 'COL-005', name: 'Collar Estrella Mar Blanca', featured: false, stock: 7,
      description: 'Collar celeste con perlas y preciosa estrella de mar blanca texturizada. Delicado y único.',
      images: ['/uploads/5.jpg'],
    },
    {
      code: 'COL-006', name: 'Collar Pez Iridiscente', featured: false, stock: 3,
      description: 'Collar rosa cuarzo con perlas y dije de pez iridiscente nacarado. Elegante y bohemio.',
      images: ['/uploads/6.jpg'],
    },
    {
      code: 'COL-007', name: 'Collar Pez Cristal', featured: false, stock: 5,
      description: 'Collar blanco perla con micro perlas rosas y dije de pez transparente. Minimalista y fresco.',
      images: ['/uploads/7.jpg'],
    },
    {
      code: 'COL-008', name: 'Collar Pez Rojo', featured: false, stock: 4,
      description: 'Collar blanco perla con detalle en rosa y dije de pez rojo con lunares blancos. Llamativo.',
      images: ['/uploads/8.jpg'],
    },
    {
      code: 'COL-009', name: 'Collar Pez Nácar', featured: false, stock: 6,
      description: 'Collar verde agua con perlas y pez de nácar natural. Materiales de primera calidad.',
      images: ['/uploads/9.jpg'],
    },
    {
      code: 'COL-010', name: 'Collar Concha Verde', featured: false, stock: 5,
      description: 'Collar celeste con perlas y concha de mar verde menta artesanal. Inspirado en el Caribe.',
      images: ['/uploads/10.jpg'],
    },
    {
      code: 'COL-011', name: 'Collar Concha Blanca', featured: false, stock: 4,
      description: 'Collar azul cielo con perlas y concha blanca porcelana. Sofisticado y natural.',
      images: ['/uploads/11.jpg'],
    },
    {
      code: 'COL-012', name: 'Colección Completa Beach', featured: true, stock: 0,
      description: 'Vista completa de la colección de temporada. Disponible en múltiples colores y figuras marinas.',
      images: ['/uploads/12.jpg'],
    },
  ]

  for (const p of collares) {
    await prisma.product.create({
      data: {
        code: p.code, name: p.name, description: p.description,
        stock: p.stock, visible: true, featured: p.featured,
        categoryId: createdCats['collares'],
        images: { create: p.images.map((url, i) => ({ url, order: i })) },
      },
    })
  }

  // Products - Bolsos
  const bolsos = [
    {
      code: 'BOL-001', name: 'Mochila Tropical Flecos', featured: true, stock: 3,
      description: 'Mochila de tela tropical con estampado de selva y flecos de colores. Ideal para playa. Hecha en Colombia.',
      images: ['/uploads/621601327_18347823259228164_2692812966605630185_n.jpg'],
    },
    {
      code: 'BOL-002', name: 'Cartera Hibiscus & Flecos', featured: true, stock: 2,
      description: 'Cartera de mano con estampado de hibiscus azul marino y flecos rosas. Perfecta para días de verano.',
      images: ['/uploads/621752952_18344595364224718_501820947408374506_n.jpg'],
    },
  ]

  for (const p of bolsos) {
    await prisma.product.create({
      data: {
        code: p.code, name: p.name, description: p.description,
        stock: p.stock, visible: true, featured: p.featured,
        categoryId: createdCats['bolsos'],
        images: { create: p.images.map((url, i) => ({ url, order: i })) },
      },
    })
  }

  // Products - Pulseras
  const pulseras = [
    {
      code: 'PUL-001', name: 'Set Pulseras Piedras Naturales', featured: true, stock: 10,
      description: 'Set de pulseras de piedras naturales en turquesa, fucsia, rojo y madera. Estilo boho chic.',
      images: ['/uploads/625973076_18409338064120281_6238602945464082546_n.jpg'],
    },
  ]

  for (const p of pulseras) {
    await prisma.product.create({
      data: {
        code: p.code, name: p.name, description: p.description,
        stock: p.stock, visible: true, featured: p.featured,
        categoryId: createdCats['pulseras'],
        images: { create: p.images.map((url, i) => ({ url, order: i })) },
      },
    })
  }

  // Gallery photos
  const existingGalleryRows = await prisma.$queryRaw<any[]>`SELECT COUNT(*) as c FROM "GalleryPhoto"`
  if (Number(existingGalleryRows[0]?.c ?? 0) === 0) {
    const galleryPhotos = [
      { url: '/uploads/1.jpg', label: 'Collar Estrella Lila', order: 0 },
      { url: '/uploads/625427031_18434292976117136_6408267993621859003_n.jpg', label: 'Colección Tropical', order: 1 },
      { url: '/uploads/3.jpg', label: 'Collar Pez Rosado', order: 2 },
      { url: '/uploads/625973076_18409338064120281_6238602945464082546_n.jpg', label: 'Pulseras Naturales', order: 3 },
      { url: '/uploads/621752952_18344595364224718_501820947408374506_n.jpg', label: 'Bolso Hibiscus', order: 4 },
      { url: '/uploads/5.jpg', label: 'Collar Estrella Blanca', order: 5 },
      { url: '/uploads/621601327_18347823259228164_2692812966605630185_n.jpg', label: 'Bolsos Tropical', order: 6 },
      { url: '/uploads/12.jpg', label: 'Colección Completa', order: 7 },
      { url: '/uploads/9.jpg', label: 'Collar Pez Nácar', order: 8 },
      { url: '/uploads/4.jpg', label: 'Collar Estrella Violeta', order: 9 },
      { url: '/uploads/6.jpg', label: 'Collar Pez Iridiscente', order: 10 },
      { url: '/uploads/2.jpg', label: 'Collar Flor Celeste', order: 11 },
    ]
    for (const p of galleryPhotos) {
      const id = randomUUID()
      await prisma.$executeRaw`INSERT INTO "GalleryPhoto" (id, url, label, "order", active, createdAt) VALUES (${id}, ${p.url}, ${p.label}, ${p.order}, 1, datetime('now'))`
    }
  }

  return NextResponse.json({ ok: true, message: 'Datos de ejemplo creados con imágenes reales' })
}
