'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { Package, Tag, ShoppingBag, Users, LayoutDashboard, LogOut, Image, Layout, Menu, X } from 'lucide-react'
import { useState } from 'react'

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/productos', label: 'Productos', icon: Package },
  { href: '/admin/categorias', label: 'Categorías', icon: Tag },
  { href: '/admin/pedidos', label: 'Pedidos', icon: ShoppingBag },
  { href: '/admin/usuarios', label: 'Clientes', icon: Users },
  { href: '/admin/secciones', label: 'Secciones', icon: Layout },
  { href: '/admin/galeria', label: 'Galería', icon: Image },
]

export default function AdminNav({ userName }: { userName: string }) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const navContent = (
    <>
      {/* Logo */}
      <div className="p-5 border-b" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
            <span className="text-2xl">🌴</span>
            <div>
              <span className="text-white font-black text-lg">MAPALI</span>
              <span className="font-black text-lg" style={{ color: '#14B8A6' }}> BEACH</span>
            </div>
          </Link>
          <button className="md:hidden text-white" onClick={() => setOpen(false)}>
            <X size={22} />
          </button>
        </div>
        <p className="text-xs mt-1" style={{ color: '#F5A623' }}>Panel de Admin</p>
      </div>

      {/* User */}
      <div className="px-4 py-3" style={{ backgroundColor: 'rgba(0,0,0,0.2)' }}>
        <p className="text-xs" style={{ color: 'rgba(255,255,255,0.6)' }}>Administrador</p>
        <p className="text-sm font-semibold text-white truncate">{userName}</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = href === '/admin' ? pathname === '/admin' : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all"
              style={{
                backgroundColor: active ? '#14B8A6' : 'transparent',
                color: active ? 'white' : '#F5A623',
              }}
            >
              <Icon size={18} />
              <span className="text-sm font-medium">{label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl w-full transition-all"
          style={{ color: 'rgba(255,255,255,0.6)' }}
        >
          <LogOut size={18} />
          <span className="text-sm">Cerrar sesión</span>
        </button>
      </div>
    </>
  )

  return (
    <>
      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 flex items-center px-4 py-3 shadow-lg" style={{ backgroundColor: '#2C1A0E' }}>
        <button onClick={() => setOpen(true)} style={{ color: '#F5A623' }}>
          <Menu size={24} />
        </button>
        <span className="ml-3 text-white font-black text-lg">MAPALI <span style={{ color: '#14B8A6' }}>BEACH</span></span>
      </div>

      {/* Mobile overlay */}
      {open && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <aside className="w-56 flex flex-col shadow-xl h-full overflow-y-auto" style={{ backgroundColor: '#2C1A0E' }}>
            {navContent}
          </aside>
          <div className="flex-1 bg-black/50" onClick={() => setOpen(false)} />
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-56 flex-col shadow-xl" style={{ backgroundColor: '#2C1A0E', minHeight: '100vh' }}>
        {navContent}
      </aside>
    </>
  )
}
