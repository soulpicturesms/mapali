'use client'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { Plus, Edit2, Trash2, X, Eye, EyeOff } from 'lucide-react'

interface User {
  id: string
  name: string | null
  email: string
  phone: string | null
  active: boolean
  createdAt: string
  _count: { orders: number }
}

const emptyForm = { name: '', email: '', password: '', phone: '', active: true }

export default function UsuariosAdmin({ users }: { users: User[] }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [showForm, setShowForm] = useState(false)
  const [editUser, setEditUser] = useState<User | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [showPass, setShowPass] = useState(false)

  const openCreate = () => {
    setEditUser(null)
    setForm(emptyForm)
    setShowForm(true)
  }

  const openEdit = (user: User) => {
    setEditUser(user)
    setForm({ name: user.name || '', email: user.email, password: '', phone: user.phone || '', active: user.active })
    setShowForm(true)
  }

  const handleSave = () => {
    if (!form.email) return toast.error('El email es requerido')
    if (!editUser && !form.password) return toast.error('La contraseña es requerida para un nuevo cliente')

    startTransition(async () => {
      const url = editUser ? `/api/users/${editUser.id}` : '/api/users'
      const method = editUser ? 'PUT' : 'POST'
      const body: any = { name: form.name, email: form.email, phone: form.phone, active: form.active }
      if (form.password) body.password = form.password

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (res.ok) {
        toast.success(editUser ? 'Cliente actualizado ✅' : 'Cliente creado ✅')
        setShowForm(false)
        router.refresh()
      } else {
        const data = await res.json()
        toast.error(data.error || 'Error al guardar')
      }
    })
  }

  const handleDelete = (user: User) => {
    if (!confirm(`¿Eliminar el cliente "${user.name || user.email}"?`)) return
    startTransition(async () => {
      const res = await fetch(`/api/users/${user.id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('Cliente eliminado')
        router.refresh()
      } else {
        toast.error('Error al eliminar')
      }
    })
  }

  const toggleActive = (user: User) => {
    startTransition(async () => {
      await fetch(`/api/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: user.name, email: user.email, phone: user.phone, active: !user.active }),
      })
      toast.success(user.active ? 'Cliente desactivado' : 'Cliente activado')
      router.refresh()
    })
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-black" style={{ color: '#2C1A0E' }}>👥 Clientes</h1>
          <p className="text-sm" style={{ color: '#7A5230' }}>{users.length} clientes registrados</p>
        </div>
        <button onClick={openCreate} className="btn-tropical flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-bold">
          <Plus size={18} /> Nuevo Cliente
        </button>
      </div>

      <div className="bg-white rounded-2xl overflow-hidden shadow-md" style={{ border: '1px solid rgba(245,166,35,0.2)' }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead style={{ backgroundColor: '#FFFBF4' }}>
              <tr>
                <th className="text-left px-4 py-3 font-bold" style={{ color: '#2C1A0E' }}>Nombre</th>
                <th className="text-left px-4 py-3 font-bold" style={{ color: '#2C1A0E' }}>Email</th>
                <th className="text-left px-4 py-3 font-bold" style={{ color: '#2C1A0E' }}>Teléfono</th>
                <th className="text-left px-4 py-3 font-bold" style={{ color: '#2C1A0E' }}>Pedidos</th>
                <th className="text-left px-4 py-3 font-bold" style={{ color: '#2C1A0E' }}>Estado</th>
                <th className="text-left px-4 py-3 font-bold" style={{ color: '#2C1A0E' }}>Registrado</th>
                <th className="text-right px-4 py-3 font-bold" style={{ color: '#2C1A0E' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, idx) => (
                <tr key={user.id} style={{ backgroundColor: idx % 2 === 0 ? 'white' : '#FAFAFA', borderBottom: '1px solid rgba(245,166,35,0.1)' }}>
                  <td className="px-4 py-3 font-semibold" style={{ color: '#2C1A0E' }}>{user.name || '—'}</td>
                  <td className="px-4 py-3" style={{ color: '#7A5230' }}>{user.email}</td>
                  <td className="px-4 py-3" style={{ color: '#7A5230' }}>
                    {user.phone ? (
                      <a
                        href={`https://wa.me/1${user.phone.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 hover:underline"
                        style={{ color: '#25D366' }}
                      >
                        📲 {user.phone}
                      </a>
                    ) : '—'}
                  </td>
                  <td className="px-4 py-3 text-center font-bold" style={{ color: '#2C1A0E' }}>{user._count.orders}</td>
                  <td className="px-4 py-3">
                    <span
                      className="badge-stock cursor-pointer"
                      onClick={() => toggleActive(user)}
                      style={{
                        backgroundColor: user.active ? 'rgba(20,184,166,0.2)' : 'rgba(239,68,68,0.1)',
                        color: user.active ? '#3D9A8A' : '#DC2626',
                      }}
                    >
                      {user.active ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs" style={{ color: '#7A5230' }}>
                    {new Date(user.createdAt).toLocaleDateString('es-AR')}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openEdit(user)} className="p-1.5 rounded-lg hover:bg-gray-100">
                        <Edit2 size={15} style={{ color: '#F5A623' }} />
                      </button>
                      <button onClick={() => handleDelete(user)} className="p-1.5 rounded-lg hover:bg-gray-100">
                        <Trash2 size={15} style={{ color: '#E8603C' }} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {users.length === 0 && (
            <div className="text-center py-12" style={{ color: '#7A5230' }}>
              No hay clientes todavía
            </div>
          )}
        </div>
      </div>

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl" style={{ border: '2px solid rgba(245,166,35,0.3)' }}>
            <div className="flex items-center justify-between p-5" style={{ borderBottom: '1px solid rgba(245,166,35,0.2)' }}>
              <h2 className="text-xl font-black" style={{ color: '#2C1A0E' }}>
                {editUser ? '✏️ Editar Cliente' : '👤 Nuevo Cliente'}
              </h2>
              <button onClick={() => setShowForm(false)}><X size={22} style={{ color: '#7A5230' }} /></button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1" style={{ color: '#2C1A0E' }}>Nombre</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-mapali w-full" placeholder="Nombre completo" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1" style={{ color: '#2C1A0E' }}>Email *</label>
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input-mapali w-full" placeholder="email@ejemplo.com" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1" style={{ color: '#2C1A0E' }}>
                  Contraseña {editUser && <span className="font-normal text-xs">(dejar vacío para no cambiar)</span>}
                </label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="input-mapali w-full pr-10"
                    placeholder={editUser ? 'Nueva contraseña...' : 'Contraseña inicial'}
                  />
                  <button onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2">
                    {showPass ? <EyeOff size={16} style={{ color: '#7A5230' }} /> : <Eye size={16} style={{ color: '#7A5230' }} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1" style={{ color: '#2C1A0E' }}>Teléfono (WhatsApp)</label>
                <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input-mapali w-full" placeholder="8293429417" />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <div
                  className="w-10 h-6 rounded-full relative transition-colors"
                  style={{ backgroundColor: form.active ? '#14B8A6' : '#D1D5DB' }}
                  onClick={() => setForm({ ...form, active: !form.active })}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.active ? 'translate-x-5' : 'translate-x-1'}`} />
                </div>
                <span className="text-sm font-semibold" style={{ color: '#2C1A0E' }}>Cuenta activa</span>
              </label>
            </div>
            <div className="flex gap-3 p-5" style={{ borderTop: '1px solid rgba(245,166,35,0.2)' }}>
              <button onClick={() => setShowForm(false)} className="flex-1 py-2.5 rounded-xl font-semibold border-2" style={{ borderColor: '#F5A623', color: '#2C1A0E' }}>
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={isPending}
                className="flex-1 btn-tropical py-2.5 rounded-xl text-white font-bold disabled:opacity-60"
              >
                {isPending ? 'Guardando...' : editUser ? 'Actualizar' : 'Crear Cliente'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
