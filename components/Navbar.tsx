'use client'
import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { useState } from 'react'
import { ShoppingBag, Menu, X, LogOut, Settings } from 'lucide-react'
import { useCart } from './CartContext'
import { useOrderNotifications } from '@/hooks/useOrderNotifications'

export default function Navbar() {
  const { data: session } = useSession()
  const { itemCount } = useCart()
  const [mobileOpen, setMobileOpen] = useState(false)
  const isCliente = session?.user?.role === 'cliente'
  const orderNotifCount = useOrderNotifications(isCliente)

  return (
    <nav className="sticky top-0 z-50 shadow-lg" style={{ backgroundColor: '#2C1A0E' }}>
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 shadow-md" style={{ border: '2px solid rgba(20,184,166,0.5)' }}>
            <img
              src="/logo.png"
              alt="Mapali Beach"
              className="w-full h-full object-cover"
              onError={(e) => {
                // Fallback si no existe el logo aún
                const el = e.currentTarget.parentElement!
                el.innerHTML = '<span style="font-size:22px;display:flex;align-items:center;justify-content:center;width:100%;height:100%;background:#2C1A0E">🌴</span>'
              }}
            />
          </div>
          <div className="leading-none">
            <span className="text-white font-black text-lg tracking-wider block leading-none">MAPALI</span>
            <span className="font-bold text-xs tracking-[0.2em] block" style={{ color: '#14B8A6' }}>BEACH</span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-6">
          <Link href="/" className="font-medium transition-colors" style={{ color: 'rgba(255,255,255,0.75)' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#5EEAD4')}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.75)')}>
            Inicio
          </Link>
          <Link href="/catalogo" className="font-medium transition-colors" style={{ color: 'rgba(255,255,255,0.75)' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#5EEAD4')}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.75)')}>
            Catálogo
          </Link>

          {session ? (
            <>
              {session.user.role === 'admin' ? (
                <Link href="/admin" className="flex items-center gap-1.5 font-medium text-sm px-3 py-1.5 rounded-full transition-all"
                  style={{ color: '#14B8A6', border: '1px solid rgba(20,184,166,0.3)' }}>
                  <Settings size={15} /> Admin
                </Link>
              ) : (
                <>
                  <Link href="/cliente/catalogo" className="font-medium transition-colors" style={{ color: 'rgba(255,255,255,0.75)' }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#5EEAD4')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.75)')}>
                    Mi Catálogo
                  </Link>
                  <Link href="/cliente/pedidos" className="relative" style={{ color: 'rgba(255,255,255,0.75)' }}>
                    <ShoppingBag size={22} />
                    {/* Cart items badge */}
                    {itemCount > 0 && (
                      <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: '#E8603C' }}>
                        {itemCount}
                      </span>
                    )}
                    {/* Order notification badge */}
                    {orderNotifCount > 0 && itemCount === 0 && (
                      <span
                        className="absolute -top-2 -right-2 w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-black"
                        style={{ backgroundColor: '#F5A623', boxShadow: '0 0 0 2px #2C1A0E', animation: 'pulse 2s infinite' }}
                      >
                        !
                      </span>
                    )}
                    {orderNotifCount > 0 && itemCount > 0 && (
                      <span
                        className="absolute -bottom-1.5 -right-1.5 w-3.5 h-3.5 rounded-full border-2"
                        style={{ backgroundColor: '#F5A623', borderColor: '#2C1A0E', animation: 'pulse 2s infinite' }}
                      />
                    )}
                  </Link>
                </>
              )}
              <div className="flex items-center gap-2 pl-3" style={{ borderLeft: '1px solid rgba(255,255,255,0.1)' }}>
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold" style={{ backgroundColor: 'rgba(20,184,166,0.2)', color: '#5EEAD4' }}>
                  {(session.user.name || 'U')[0].toUpperCase()}
                </div>
                <span className="text-sm font-medium text-white/70 max-w-24 truncate">{session.user.name}</span>
                <button onClick={() => signOut({ callbackUrl: '/' })} className="ml-1 opacity-60 hover:opacity-100 transition-opacity" title="Cerrar sesión">
                  <LogOut size={16} color="white" />
                </button>
              </div>
            </>
          ) : (
            <Link href="/login" className="btn-tropical px-5 py-2 rounded-full font-bold text-sm shadow-lg">
              Ingresar
            </Link>
          )}
        </div>

        {/* Mobile toggle */}
        <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden text-white p-1">
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden px-4 py-4 flex flex-col gap-3" style={{ backgroundColor: '#3D2510', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <Link href="/" onClick={() => setMobileOpen(false)} className="text-white/80 font-medium py-1">Inicio</Link>
          <Link href="/catalogo" onClick={() => setMobileOpen(false)} className="text-white/80 font-medium py-1">Catálogo</Link>
          {session ? (
            <>
              {session.user.role === 'admin'
                ? <Link href="/admin" onClick={() => setMobileOpen(false)} className="font-medium py-1" style={{ color: '#14B8A6' }}>Panel Admin</Link>
                : <>
                    <Link href="/cliente/catalogo" onClick={() => setMobileOpen(false)} className="text-white/80 font-medium py-1">Mi Catálogo</Link>
                    <Link href="/cliente/pedidos" onClick={() => setMobileOpen(false)} className="text-white/80 font-medium py-1">Mis Pedidos</Link>
                  </>
              }
              <button onClick={() => signOut({ callbackUrl: '/' })} className="text-left py-1 font-medium" style={{ color: '#E8603C' }}>
                Cerrar Sesión
              </button>
            </>
          ) : (
            <Link href="/login" onClick={() => setMobileOpen(false)} className="btn-tropical px-5 py-2 rounded-full font-bold text-sm text-center">
              Ingresar
            </Link>
          )}
        </div>
      )}
    </nav>
  )
}
