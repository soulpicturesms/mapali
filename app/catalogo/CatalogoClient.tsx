'use client'
import { useState } from 'react'
import { Search } from 'lucide-react'

interface Category { id: string; name: string; slug: string; icon: string | null }
interface Product {
  id: string
  code: string
  name: string
  description: string | null
  price: number | null
  stock: number
  featured: boolean
  category: Category | null
  images: { url: string }[]
}

export default function CatalogoClient({
  products,
  categories,
}: {
  products: Product[]
  categories: Category[]
}) {
  const [activeCategory, setActiveCategory] = useState('todos')
  const [search, setSearch] = useState('')

  const filtered = products.filter((p) => {
    const matchCat = activeCategory === 'todos' || p.category?.slug === activeCategory
    const q = search.toLowerCase()
    const matchSearch =
      !q ||
      p.name.toLowerCase().includes(q) ||
      p.code.toLowerCase().includes(q) ||
      p.category?.name.toLowerCase().includes(q)
    return matchCat && matchSearch
  })

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Search */}
      <div className="relative max-w-md mx-auto mb-8">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: '#F5A623' }} />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar productos..."
          className="input-mapali w-full"
          style={{ paddingLeft: '2.5rem' }}
        />
      </div>

      {/* Category tabs */}
      <div className="flex flex-wrap gap-2 justify-center mb-8">
        <button
          onClick={() => setActiveCategory('todos')}
          className="px-5 py-2 rounded-full font-semibold text-sm transition-all"
          style={{
            backgroundColor: activeCategory === 'todos' ? '#14B8A6' : 'white',
            color: activeCategory === 'todos' ? 'white' : '#2C1A0E',
            border: '2px solid #5DBFAD',
          }}
        >
          🛍️ Todos
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.slug)}
            className="px-5 py-2 rounded-full font-semibold text-sm transition-all"
            style={{
              backgroundColor: activeCategory === cat.slug ? '#14B8A6' : 'white',
              color: activeCategory === cat.slug ? 'white' : '#2C1A0E',
              border: '2px solid #5DBFAD',
            }}
          >
            {cat.icon} {cat.name}
          </button>
        ))}
      </div>

      {/* Count */}
      <p className="text-center text-sm mb-6" style={{ color: '#7A5230' }}>
        {filtered.length} producto{filtered.length !== 1 ? 's' : ''} encontrado{filtered.length !== 1 ? 's' : ''}
      </p>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <span className="text-6xl">🌊</span>
          <p className="mt-4 text-xl font-semibold" style={{ color: '#2C1A0E' }}>No se encontraron productos</p>
          <p className="mt-2" style={{ color: '#7A5230' }}>Probá con otra categoría o búsqueda</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map((product) => (
            <div
              key={product.id}
              className="product-card bg-white rounded-2xl overflow-hidden shadow-md"
              style={{ border: '1px solid rgba(245,166,35,0.2)' }}
            >
              <div
                className="aspect-square relative overflow-hidden flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, rgba(20,184,166,0.1), rgba(232,96,60,0.1))' }}
              >
                {product.images[0] ? (
                  <img src={product.images[0].url} alt={product.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-6xl">📿</span>
                )}
                {product.stock === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}>
                    <span className="text-white px-3 py-1 rounded-full text-sm font-bold" style={{ backgroundColor: '#E8603C' }}>Sin stock</span>
                  </div>
                )}
                {product.featured && (
                  <div className="absolute top-2 left-2">
                    <span className="text-white px-2 py-0.5 rounded-full text-xs font-bold" style={{ backgroundColor: '#F5A623' }}>
                      ✨ Destacado
                    </span>
                  </div>
                )}
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-mono font-bold" style={{ color: '#14B8A6' }}>#{product.code}</span>
                  {product.category && (
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: 'rgba(245,166,35,0.2)', color: '#2C1A0E' }}>
                      {product.category.icon} {product.category.name}
                    </span>
                  )}
                </div>
                <h3 className="font-bold" style={{ color: '#2C1A0E' }}>{product.name}</h3>
                {product.description && (
                  <p className="text-xs mt-1 line-clamp-2" style={{ color: '#7A5230' }}>{product.description}</p>
                )}
                <div className="mt-3 flex items-center justify-between">
                  <span
                    className="badge-stock"
                    style={{
                      backgroundColor: product.stock > 0 ? 'rgba(20,184,166,0.2)' : 'rgba(239,68,68,0.1)',
                      color: product.stock > 0 ? '#3D9A8A' : '#DC2626',
                    }}
                  >
                    {product.stock > 0 ? `Disponible` : 'Sin stock'}
                  </span>
                  {product.price != null && (
                    <span className="font-bold" style={{ color: '#2C1A0E' }}>${product.price.toFixed(2)}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
