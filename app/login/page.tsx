'use client'
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ username: '', password: '' })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const result = await signIn('credentials', {
      username: form.username,
      password: form.password,
      redirect: false,
    })
    setLoading(false)

    if (result?.ok) {
      toast.success('¡Bienvenida a Mapali Beach! 🌴')
      router.push('/')
      router.refresh()
    } else {
      toast.error('Usuario o contraseña incorrectos')
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden" style={{ backgroundColor: '#FFFBF4' }}>
      {/* Background decorations */}
      <div className="absolute inset-0 pointer-events-none select-none">
        <div className="absolute top-0 left-0 text-[150px] opacity-10 -rotate-12">🌴</div>
        <div className="absolute bottom-0 right-0 text-[120px] opacity-10 rotate-12">🌿</div>
        <div className="absolute top-1/2 left-10 text-[60px] opacity-10">🌊</div>
      </div>

      {/* Card */}
      <div className="relative w-full max-w-md mx-4">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <span className="text-4xl">🌴</span>
            <div>
              <span className="font-black text-3xl" style={{ color: '#2C1A0E' }}>MAPALI</span>
              <span className="font-black text-3xl" style={{ color: '#14B8A6' }}> BEACH</span>
            </div>
          </Link>
          <p className="italic" style={{ color: '#F5A623' }}>Our nature made jewelry</p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl overflow-hidden" style={{ border: '2px solid rgba(245,166,35,0.3)' }}>
          {/* Top bar */}
          <div className="h-2" style={{ background: 'linear-gradient(90deg, #5DBFAD, #E07B54)' }} />

          <div className="p-8">
            <h2 className="text-2xl font-black mb-2" style={{ color: '#2C1A0E' }}>Bienvenida 🌺</h2>
            <p className="text-sm mb-6" style={{ color: '#7A5230' }}>Ingresa con tu cuenta para ver el catálogo</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1" style={{ color: '#2C1A0E' }}>
                  Usuario
                </label>
                <input
                  type="text"
                  required
                  autoComplete="username"
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  className="input-mapali w-full"
                  placeholder="Ej: admin"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1" style={{ color: '#2C1A0E' }}>
                  Contraseña
                </label>
                <input
                  type="password"
                  required
                  autoComplete="current-password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="input-mapali w-full"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-tropical w-full py-3 rounded-xl text-white font-bold text-lg mt-2 disabled:opacity-60"
              >
                {loading ? '🌊 Ingresando...' : 'Ingresar 🌴'}
              </button>
            </form>

            <div className="mt-6 pt-6" style={{ borderTop: '1px solid rgba(245,166,35,0.2)' }}>
              <p className="text-center text-sm" style={{ color: '#7A5230' }}>
                ¿No tenés cuenta? Consultá con{' '}
                <a
                  href={`https://wa.me/18293429417?text=Hola%20Mapali%20Beach!%20Quisiera%20obtener%20acceso%20al%20catalogo%20🌴`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold"
                  style={{ color: '#14B8A6' }}
                >
                  Mapali Beach
                </a>
              </p>
            </div>
          </div>
        </div>

        <div className="text-center mt-6">
          <Link href="/" className="text-sm" style={{ color: '#7A5230' }}>
            ← Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  )
}
