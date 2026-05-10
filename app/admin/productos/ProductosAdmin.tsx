'use client'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { Plus, Edit2, Trash2, Eye, EyeOff, Star, X, Upload, Search } from 'lucide-react'

interface Category { id: string; name: string; slug: string; icon: string | null }
interface ProductImage { url: string }
interface Product {
  id: string
  code: string
  name: string
  description: string | null
  price: number | null
  stock: number
  visible: boolean
  featured: boolean
  category: Category | null
  images: ProductImage[]
  _count: { orderItems: number }
}

const emptyForm = {
  name: '', code: '', description: '', price: '', stock: '0',
  visible: true, featured: false, categoryId: '', images: [] as string[],
}

export default function ProductosAdmin({
  products,
  categories,
}: {
  products: Product[]
  categories: Category[]
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [showForm, setShowForm] = useState(false)
  const [editProduct, setEditProduct] = useState<Product | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [uploading, setUploading] = useState(false)
  const [search, setSearch] = useState('')
  const [filterVisible, setFilterVisible] = useState<'all' | 'visible' | 'hidden'>('all')

  const filtered = products.filter((p) => {
    const q = search.toLowerCase()
    const matchSearch = !q || p.name.toLowerCase().includes(q) || p.code.toLowerCase().includes(q)
    const matchVisible =
      filterVisible === 'all' ||
      (filterVisible === 'visible' && p.visible) ||
      (filterVisible === 'hidden' && !p.visible)
    return matchSearch && matchVisible
  })

  const openCreate = () => {
    setEditProduct(null)
    setForm(emptyForm)
    setShowForm(true)
  }

  const openEdit = (product: Product) => {
    setEditProduct(product)
    setForm({
      name: product.name,
      code: product.code,
      description: product.description || '',
      price: product.price?.toString() || '',
      stock: product.stock.toString(),
      visible: product.visible,
      featured: product.featured,
      categoryId: product.category?.id || '',
      images: product.images.map((i) => i.url),
    })
    setShowForm(true)
  }

  const handleUpload = async (files: FileList) => {
    if (!files.length) return
    setUploading(true)
    const formData = new FormData()
    Array.from(files).forEach((f) => formData.append('files', f))
    const res = await fetch('/api/upload', { method: 'POST', body: formData })
    const data = await res.json()
    if (data.urls) {
      setForm((prev) => ({ ...prev, images: [...prev.images, ...data.urls] }))
      toast.success(`${data.urls.length} imagen${data.urls.length > 1 ? 'es' : ''} subida${data.urls.length > 1 ? 's' : ''}`)
    }
    setUploading(false)
  }

  const handleSave = () => {
    startTransition(async () => {
      const url = editProduct ? `/api/products/${editProduct.id}` : '/api/products'
      const method = editProduct ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        toast.success(editProduct ? 'Producto actualizado ✅' : 'Producto creado ✅')
        setShowForm(false)
        router.refresh()
      } else {
        const data = await res.json()
        toast.error(data.error || 'Error al guardar')
      }
    })
  }

  const handleDelete = (product: Product) => {
    if (!confirm(`¿Eliminar "${product.name}"?`)) return
    startTransition(async () => {
      const res = await fetch(`/api/products/${product.id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('Producto eliminado')
        router.refresh()
      } else {
        toast.error('Error al eliminar')
      }
    })
  }

  const toggleVisible = (product: Product) => {
    startTransition(async () => {
      await fetch(`/api/products/${product.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: product.name, code: product.code, description: product.description,
          price: product.price, stock: product.stock, visible: !product.visible,
          featured: product.featured, categoryId: product.category?.id,
          images: product.images.map((i) => i.url),
        }),
      })
      toast.success(product.visible ? 'Producto ocultado' : 'Producto visible')
      router.refresh()
    })
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-black" style={{ color: '#2C1A0E' }}>📦 Productos</h1>
          <p className="text-sm" style={{ color: '#7A5230' }}>{products.length} productos en total</p>
        </div>
        <button onClick={openCreate} className="btn-tropical flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-bold">
          <Plus size={18} /> Nuevo Producto
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#F5A623' }} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar..."
            className="input-mapali w-full py-2 text-sm"
            style={{ paddingLeft: '2.25rem' }}
          />
        </div>
        {(['all', 'visible', 'hidden'] as const).map((v) => (
          <button
            key={v}
            onClick={() => setFilterVisible(v)}
            className="px-4 py-2 rounded-xl text-sm font-semibold transition-all"
            style={{
              backgroundColor: filterVisible === v ? '#14B8A6' : 'white',
              color: filterVisible === v ? 'white' : '#2C1A0E',
              border: '2px solid #14B8A6',
            }}
          >
            {v === 'all' ? 'Todos' : v === 'visible' ? '👁 Visibles' : '🙈 Ocultos'}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl overflow-hidden shadow-md" style={{ border: '1px solid rgba(245,166,35,0.2)' }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead style={{ backgroundColor: '#FFFBF4' }}>
              <tr>
                <th className="text-left px-4 py-3 font-bold" style={{ color: '#2C1A0E' }}>Foto</th>
                <th className="text-left px-4 py-3 font-bold" style={{ color: '#2C1A0E' }}>Código</th>
                <th className="text-left px-4 py-3 font-bold" style={{ color: '#2C1A0E' }}>Nombre</th>
                <th className="text-left px-4 py-3 font-bold" style={{ color: '#2C1A0E' }}>Categoría</th>
                <th className="text-left px-4 py-3 font-bold" style={{ color: '#2C1A0E' }}>Stock</th>
                <th className="text-left px-4 py-3 font-bold" style={{ color: '#2C1A0E' }}>Estado</th>
                <th className="text-left px-4 py-3 font-bold" style={{ color: '#2C1A0E' }}>Pedidos</th>
                <th className="text-right px-4 py-3 font-bold" style={{ color: '#2C1A0E' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((product, idx) => (
                <tr
                  key={product.id}
                  style={{ backgroundColor: idx % 2 === 0 ? 'white' : '#FAFAFA', borderBottom: '1px solid rgba(245,166,35,0.1)' }}
                >
                  <td className="px-4 py-3">
                    <div className="w-10 h-10 rounded-lg overflow-hidden" style={{ backgroundColor: '#FFFBF4' }}>
                      {product.images[0] ? (
                        <img src={product.images[0].url} alt={product.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-lg">📿</div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono font-bold text-xs" style={{ color: '#14B8A6' }}>
                    {product.code}
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-semibold" style={{ color: '#2C1A0E' }}>{product.name}</div>
                    {product.featured && <span className="text-xs" style={{ color: '#F5A623' }}>★ Destacado</span>}
                  </td>
                  <td className="px-4 py-3" style={{ color: '#7A5230' }}>
                    {product.category ? `${product.category.icon} ${product.category.name}` : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="badge-stock"
                      style={{
                        backgroundColor: product.stock > 0 ? 'rgba(20,184,166,0.2)' : 'rgba(239,68,68,0.1)',
                        color: product.stock > 0 ? '#3D9A8A' : '#DC2626',
                      }}
                    >
                      {product.stock}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="badge-stock"
                      style={{
                        backgroundColor: product.visible ? 'rgba(20,184,166,0.2)' : 'rgba(239,68,68,0.1)',
                        color: product.visible ? '#3D9A8A' : '#DC2626',
                      }}
                    >
                      {product.visible ? 'Visible' : 'Oculto'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center" style={{ color: '#7A5230' }}>
                    {product._count.orderItems}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => toggleVisible(product)}
                        className="p-1.5 rounded-lg transition-colors hover:bg-gray-100"
                        title={product.visible ? 'Ocultar' : 'Mostrar'}
                      >
                        {product.visible ? <Eye size={16} style={{ color: '#14B8A6' }} /> : <EyeOff size={16} style={{ color: '#7A5230' }} />}
                      </button>
                      <button
                        onClick={() => openEdit(product)}
                        className="p-1.5 rounded-lg transition-colors hover:bg-gray-100"
                        title="Editar"
                      >
                        <Edit2 size={16} style={{ color: '#F5A623' }} />
                      </button>
                      <button
                        onClick={() => handleDelete(product)}
                        className="p-1.5 rounded-lg transition-colors hover:bg-gray-100"
                        title="Eliminar"
                      >
                        <Trash2 size={16} style={{ color: '#E8603C' }} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-12" style={{ color: '#7A5230' }}>
              No se encontraron productos
            </div>
          )}
        </div>
      </div>

      {/* Form modal */}
      {showForm && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-10 overflow-y-auto"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl"
            style={{ border: '2px solid rgba(245,166,35,0.3)' }}
          >
            <div className="flex items-center justify-between p-5" style={{ borderBottom: '1px solid rgba(245,166,35,0.2)' }}>
              <h2 className="text-xl font-black" style={{ color: '#2C1A0E' }}>
                {editProduct ? '✏️ Editar Producto' : '➕ Nuevo Producto'}
              </h2>
              <button onClick={() => setShowForm(false)}>
                <X size={22} style={{ color: '#7A5230' }} />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1" style={{ color: '#2C1A0E' }}>Nombre *</label>
                  <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-mapali w-full text-sm" placeholder="Collar de conchas..." />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1" style={{ color: '#2C1A0E' }}>Código *</label>
                  <input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} className="input-mapali w-full text-sm font-mono" placeholder="COL-001" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1" style={{ color: '#2C1A0E' }}>Descripción</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input-mapali w-full text-sm resize-none" rows={3} placeholder="Descripción del producto..." />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1" style={{ color: '#2C1A0E' }}>Precio</label>
                  <input type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="input-mapali w-full text-sm" placeholder="0.00" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1" style={{ color: '#2C1A0E' }}>Stock</label>
                  <input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} className="input-mapali w-full text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1" style={{ color: '#2C1A0E' }}>Categoría</label>
                  <select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} className="input-mapali w-full text-sm">
                    <option value="">Sin categoría</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Toggles */}
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <div
                    className="w-10 h-6 rounded-full relative transition-colors"
                    style={{ backgroundColor: form.visible ? '#14B8A6' : '#D1D5DB' }}
                    onClick={() => setForm({ ...form, visible: !form.visible })}
                  >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.visible ? 'translate-x-5' : 'translate-x-1'}`} />
                  </div>
                  <span className="text-sm font-semibold" style={{ color: '#2C1A0E' }}>Visible</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <div
                    className="w-10 h-6 rounded-full relative transition-colors"
                    style={{ backgroundColor: form.featured ? '#F5A623' : '#D1D5DB' }}
                    onClick={() => setForm({ ...form, featured: !form.featured })}
                  >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.featured ? 'translate-x-5' : 'translate-x-1'}`} />
                  </div>
                  <span className="text-sm font-semibold" style={{ color: '#2C1A0E' }}>⭐ Destacado</span>
                </label>
              </div>

              {/* Images */}
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: '#2C1A0E' }}>Fotos del producto</label>
                <label
                  className="flex flex-col items-center justify-center w-full h-28 rounded-xl cursor-pointer border-2 border-dashed transition-colors"
                  style={{ borderColor: '#14B8A6', backgroundColor: 'rgba(20,184,166,0.05)' }}
                >
                  <Upload size={24} style={{ color: '#14B8A6' }} className="mb-2" />
                  <span className="text-sm" style={{ color: '#14B8A6' }}>
                    {uploading ? 'Subiendo...' : 'Clic o arrastrá imágenes'}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => e.target.files && handleUpload(e.target.files)}
                  />
                </label>
                {form.images.length > 0 && (
                  <div className="flex gap-2 mt-3 flex-wrap">
                    {form.images.map((url, i) => (
                      <div key={i} className="relative group">
                        <img src={url} alt="" className="w-16 h-16 object-cover rounded-lg" style={{ border: '2px solid #F5A623' }} />
                        <button
                          onClick={() => setForm({ ...form, images: form.images.filter((_, j) => j !== i) })}
                          className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-white text-xs"
                          style={{ backgroundColor: '#E8603C' }}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3 p-5" style={{ borderTop: '1px solid rgba(245,166,35,0.2)' }}>
              <button
                onClick={() => setShowForm(false)}
                className="flex-1 py-2.5 rounded-xl font-semibold border-2 transition-colors"
                style={{ borderColor: '#F5A623', color: '#2C1A0E' }}
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={isPending || !form.name || !form.code}
                className="flex-1 btn-tropical py-2.5 rounded-xl text-white font-bold disabled:opacity-60"
              >
                {isPending ? 'Guardando...' : editProduct ? 'Actualizar' : 'Crear Producto'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
