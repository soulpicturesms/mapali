'use client'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { Plus, Edit2, Trash2, X } from 'lucide-react'

interface Category {
  id: string
  name: string
  slug: string
  icon: string | null
  order: number
  active: boolean
  _count: { products: number }
}

const emptyForm = { name: '', slug: '', icon: '📿', order: 0, active: true }

export default function CategoriasAdmin({ categories }: { categories: Category[] }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [showForm, setShowForm] = useState(false)
  const [editCat, setEditCat] = useState<Category | null>(null)
  const [form, setForm] = useState(emptyForm)

  const openCreate = () => {
    setEditCat(null)
    setForm({ ...emptyForm, order: categories.length })
    setShowForm(true)
  }

  const openEdit = (cat: Category) => {
    setEditCat(cat)
    setForm({ name: cat.name, slug: cat.slug, icon: cat.icon || '📿', order: cat.order, active: cat.active })
    setShowForm(true)
  }

  const autoSlug = (name: string) => name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')

  const handleSave = () => {
    startTransition(async () => {
      const url = editCat ? `/api/categories/${editCat.id}` : '/api/categories'
      const method = editCat ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        toast.success(editCat ? 'Categoría actualizada ✅' : 'Categoría creada ✅')
        setShowForm(false)
        router.refresh()
      } else {
        const data = await res.json()
        toast.error(data.error || 'Error al guardar')
      }
    })
  }

  const handleDelete = (cat: Category) => {
    if (!confirm(`¿Eliminar "${cat.name}"? Los productos quedarán sin categoría.`)) return
    startTransition(async () => {
      const res = await fetch(`/api/categories/${cat.id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('Categoría eliminada')
        router.refresh()
      } else {
        toast.error('Error al eliminar')
      }
    })
  }

  const ICON_OPTIONS = ['📿', '👜', '🌊', '🌿', '✨', '🌴', '🐚', '🦋', '🌺', '💎', '🔮', '🎀']

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-black" style={{ color: '#2C1A0E' }}>🏷️ Categorías</h1>
          <p className="text-sm" style={{ color: '#7A5230' }}>{categories.length} categorías</p>
        </div>
        <button onClick={openCreate} className="btn-tropical flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-bold">
          <Plus size={18} /> Nueva Categoría
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="bg-white rounded-2xl p-5 shadow-md"
            style={{ border: `2px solid ${cat.active ? 'rgba(20,184,166,0.3)' : 'rgba(239,68,68,0.2)'}` }}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <span className="text-4xl">{cat.icon}</span>
                <div>
                  <h3 className="font-black text-lg" style={{ color: '#2C1A0E' }}>{cat.name}</h3>
                  <p className="text-xs font-mono" style={{ color: '#7A5230' }}>{cat.slug}</p>
                </div>
              </div>
              <div className="flex gap-1">
                <button onClick={() => openEdit(cat)} className="p-1.5 rounded-lg hover:bg-gray-100">
                  <Edit2 size={15} style={{ color: '#F5A623' }} />
                </button>
                <button onClick={() => handleDelete(cat)} className="p-1.5 rounded-lg hover:bg-gray-100">
                  <Trash2 size={15} style={{ color: '#E8603C' }} />
                </button>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <span className="text-sm" style={{ color: '#7A5230' }}>
                {cat._count.products} producto{cat._count.products !== 1 ? 's' : ''}
              </span>
              <span
                className="badge-stock"
                style={{
                  backgroundColor: cat.active ? 'rgba(20,184,166,0.2)' : 'rgba(239,68,68,0.1)',
                  color: cat.active ? '#3D9A8A' : '#DC2626',
                }}
              >
                {cat.active ? 'Activa' : 'Inactiva'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl" style={{ border: '2px solid rgba(245,166,35,0.3)' }}>
            <div className="flex items-center justify-between p-5" style={{ borderBottom: '1px solid rgba(245,166,35,0.2)' }}>
              <h2 className="text-xl font-black" style={{ color: '#2C1A0E' }}>
                {editCat ? '✏️ Editar Categoría' : '➕ Nueva Categoría'}
              </h2>
              <button onClick={() => setShowForm(false)}>
                <X size={22} style={{ color: '#7A5230' }} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1" style={{ color: '#2C1A0E' }}>Nombre *</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value, slug: autoSlug(e.target.value) })}
                  className="input-mapali w-full"
                  placeholder="Collares"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1" style={{ color: '#2C1A0E' }}>Slug (URL)</label>
                <input
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  className="input-mapali w-full font-mono text-sm"
                  placeholder="collares"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: '#2C1A0E' }}>Ícono</label>
                <div className="flex flex-wrap gap-2">
                  {ICON_OPTIONS.map((icon) => (
                    <button
                      key={icon}
                      onClick={() => setForm({ ...form, icon })}
                      className="text-2xl w-10 h-10 rounded-lg flex items-center justify-center transition-all"
                      style={{
                        border: form.icon === icon ? '2px solid #14B8A6' : '2px solid transparent',
                        backgroundColor: form.icon === icon ? 'rgba(20,184,166,0.1)' : '#FFFBF4',
                      }}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1" style={{ color: '#2C1A0E' }}>Orden</label>
                  <input
                    type="number"
                    value={form.order}
                    onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) })}
                    className="input-mapali w-full"
                  />
                </div>
                <div className="flex items-end">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <div
                      className="w-10 h-6 rounded-full relative transition-colors"
                      style={{ backgroundColor: form.active ? '#14B8A6' : '#D1D5DB' }}
                      onClick={() => setForm({ ...form, active: !form.active })}
                    >
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.active ? 'translate-x-5' : 'translate-x-1'}`} />
                    </div>
                    <span className="text-sm font-semibold" style={{ color: '#2C1A0E' }}>Activa</span>
                  </label>
                </div>
              </div>
            </div>
            <div className="flex gap-3 p-5" style={{ borderTop: '1px solid rgba(245,166,35,0.2)' }}>
              <button onClick={() => setShowForm(false)} className="flex-1 py-2.5 rounded-xl font-semibold border-2" style={{ borderColor: '#F5A623', color: '#2C1A0E' }}>
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={isPending || !form.name || !form.slug}
                className="flex-1 btn-tropical py-2.5 rounded-xl text-white font-bold disabled:opacity-60"
              >
                {isPending ? 'Guardando...' : editCat ? 'Actualizar' : 'Crear'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
