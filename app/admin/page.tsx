import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export default async function AdminDashboard() {
  const [productsCount, ordersCount, usersCount, pendingOrders] = await Promise.all([
    prisma.product.count(),
    prisma.order.count(),
    prisma.user.count({ where: { role: 'cliente' } }),
    prisma.order.count({ where: { status: 'pendiente' } }),
  ])

  const recentOrders = await prisma.order.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { name: true, email: true } },
      items: { include: { product: { select: { name: true, code: true } } } },
    },
  })

  const stats = [
    { label: 'Productos', value: productsCount, icon: '📦', color: '#14B8A6', href: '/admin/productos' },
    { label: 'Pedidos Totales', value: ordersCount, icon: '🛍️', color: '#E8603C', href: '/admin/pedidos' },
    { label: 'Clientes', value: usersCount, icon: '👥', color: '#F5A623', href: '/admin/usuarios' },
    { label: 'Pendientes', value: pendingOrders, icon: '⏳', color: '#DC2626', href: '/admin/pedidos' },
  ]

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-black" style={{ color: '#2C1A0E' }}>Dashboard 🌴</h1>
        <p className="text-sm mt-1" style={{ color: '#7A5230' }}>Bienvenida al panel de administración de Mapali Beach</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href}>
            <div
              className="bg-white rounded-2xl p-5 shadow-md hover:shadow-lg transition-shadow"
              style={{ border: '1px solid rgba(245,166,35,0.2)' }}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-3xl">{stat.icon}</span>
                <span className="text-3xl font-black" style={{ color: stat.color }}>{stat.value}</span>
              </div>
              <p className="text-sm font-semibold" style={{ color: '#2C1A0E' }}>{stat.label}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-2xl shadow-md overflow-hidden" style={{ border: '1px solid rgba(245,166,35,0.2)' }}>
        <div className="p-5 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(245,166,35,0.2)' }}>
          <h2 className="text-lg font-black" style={{ color: '#2C1A0E' }}>Pedidos Recientes</h2>
          <Link href="/admin/pedidos" className="text-sm font-semibold" style={{ color: '#14B8A6' }}>
            Ver todos →
          </Link>
        </div>
        <div className="divide-y" style={{ borderColor: 'rgba(245,166,35,0.1)' }}>
          {recentOrders.length === 0 ? (
            <p className="p-6 text-center" style={{ color: '#7A5230' }}>No hay pedidos todavía</p>
          ) : (
            recentOrders.map((order) => (
              <div key={order.id} className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-bold text-sm" style={{ color: '#2C1A0E' }}>
                    #{order.id.slice(-6).toUpperCase()} · {order.user.name}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: '#7A5230' }}>
                    {order.items.length} artículo{order.items.length !== 1 ? 's' : ''} ·{' '}
                    {new Date(order.createdAt).toLocaleDateString('es-AR')}
                  </p>
                </div>
                <span
                  className="text-xs font-bold px-3 py-1 rounded-full"
                  style={{
                    backgroundColor: order.status === 'pendiente' ? '#FEF3C7' : order.status === 'confirmado' ? '#DCFCE7' : '#DBEAFE',
                    color: order.status === 'pendiente' ? '#D97706' : order.status === 'confirmado' ? '#16A34A' : '#2563EB',
                  }}
                >
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { href: '/admin/productos', label: 'Nuevo Producto', icon: '➕' },
          { href: '/admin/categorias', label: 'Nueva Categoría', icon: '🏷️' },
          { href: '/admin/usuarios', label: 'Nuevo Cliente', icon: '👤' },
          { href: '/', label: 'Ver Tienda', icon: '🌴' },
        ].map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className="bg-white rounded-xl p-4 text-center shadow-md hover:shadow-lg transition-shadow"
            style={{ border: '1px solid rgba(245,166,35,0.2)' }}
          >
            <div className="text-2xl mb-1">{action.icon}</div>
            <p className="text-xs font-semibold" style={{ color: '#2C1A0E' }}>{action.label}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
