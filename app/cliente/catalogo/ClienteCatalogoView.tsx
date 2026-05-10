'use client'
import { useState } from 'react'
import { Search, ShoppingBag, Plus, Minus, X, Check } from 'lucide-react'
import { useCart } from '@/components/CartContext'
import Link from 'next/link'
import toast from 'react-hot-toast'

interface Category { id: string; name: string; slug: string; icon: string | null }
interface ProductImage { url: string; alt: string | null }
interface Product {
  id: string
  code: string
  name: string
  description: string | null
  price: number | null
  stock: number
  featured: boolean
  category: Category | null
  images: ProductImage[]
}

export default function ClienteCatalogoView({
  products,
  categories,
}: {
  products: Product[]
  categories: Category[]
}) {
  const { items, itemCount, addItem, removeItem, updateQuantity } = useCart()
  const [activeCategory, setActiveCategory] = useState('todos')
  const [search, setSearch] = useState('')
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [imgIdx, setImgIdx] = useState(0)
  const [showCart, setShowCart] = useState(false)

  const filtered = products.filter((p) => {
    const matchCat = activeCategory === 'todos' || p.category?.slug === activeCategory
    const q = search.toLowerCase()
    const matchSearch = !q || p.name.toLowerCase().includes(q) || p.code.toLowerCase().includes(q)
    return matchCat && matchSearch
  })

  const isInCart = (id: string) => items.some((i) => i.productId === id)

  const handleAdd = (product: Product) => {
    if (product.stock === 0) return
    addItem({
      productId: product.id,
      productCode: product.code,
      productName: product.name,
      productImage: product.images[0]?.url,
    })
    toast.success(`${product.name} agregado al pedido 🛍️`)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-black" style={{ color: '#2C1A0E' }}>📿 Mi Catálogo</h1>
          <p className="text-sm mt-1" style={{ color: '#7A5230' }}>Seleccioná los artículos para tu pre-orden</p>
        </div>
        <button
          onClick={() => setShowCart(true)}
          className="relative flex items-center gap-2 px-4 py-2 rounded-full text-white font-semibold btn-tropical"
        >
          <ShoppingBag size={20} />
          <span>Pre-orden</span>
          {itemCount > 0 && (
            <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold" style={{ backgroundColor: '#E8603C' }}>
              {itemCount}
            </span>
          )}
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-md mb-6">
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
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setActiveCategory('todos')}
          className="px-4 py-1.5 rounded-full font-semibold text-sm transition-all"
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
            className="px-4 py-1.5 rounded-full font-semibold text-sm transition-all"
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

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {filtered.map((product) => {
          const inCart = isInCart(product.id)
          const cartItem = items.find((i) => i.productId === product.id)
          return (
            <div
              key={product.id}
              className="product-card bg-white rounded-2xl overflow-hidden shadow-md"
              style={{
                border: inCart ? '2px solid #5DBFAD' : '1px solid rgba(245,166,35,0.2)',
              }}
            >
              <div
                className="aspect-square relative overflow-hidden cursor-pointer"
                style={{ background: 'linear-gradient(135deg, rgba(20,184,166,0.08), rgba(232,96,60,0.08))' }}
                onClick={() => { setSelectedProduct(product); setImgIdx(0) }}
              >
                {product.images[0] ? (
                  <img src={product.images[0].url} alt={product.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-6xl">📿</span>
                  </div>
                )}
                {product.images.length > 1 && (
                  <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-0.5 rounded-full">
                    +{product.images.length - 1} fotos
                  </div>
                )}
                {product.stock === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}>
                    <span className="text-white px-3 py-1 rounded-full text-sm font-bold" style={{ backgroundColor: '#E8603C' }}>Sin stock</span>
                  </div>
                )}
                {inCart && (
                  <div className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center" style={{ backgroundColor: '#14B8A6' }}>
                    <Check size={16} color="white" />
                  </div>
                )}
              </div>
              <div className="p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-mono font-bold" style={{ color: '#14B8A6' }}>#{product.code}</span>
                  {product.category && (
                    <span className="text-xs" style={{ color: '#7A5230' }}>{product.category.icon} {product.category.name}</span>
                  )}
                </div>
                <h3 className="font-bold text-sm" style={{ color: '#2C1A0E' }}>{product.name}</h3>
                <div className="mt-2 flex items-center justify-between">
                  <span
                    className="badge-stock"
                    style={{
                      backgroundColor: product.stock > 0 ? 'rgba(20,184,166,0.2)' : 'rgba(239,68,68,0.1)',
                      color: product.stock > 0 ? '#3D9A8A' : '#DC2626',
                    }}
                  >
                    {product.stock > 0 ? 'Disponible' : 'Sin stock'}
                  </span>
                  {product.price != null && (
                    <span className="text-sm font-bold" style={{ color: '#2C1A0E' }}>${product.price.toFixed(2)}</span>
                  )}
                </div>
                {/* Add/Remove controls */}
                {product.stock > 0 && (
                  <div className="mt-2">
                    {inCart ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(product.id, (cartItem?.quantity ?? 1) - 1)}
                          className="w-7 h-7 rounded-full flex items-center justify-center text-white"
                          style={{ backgroundColor: '#E8603C' }}
                        >
                          <Minus size={14} />
                        </button>
                        <span className="font-bold text-sm flex-1 text-center" style={{ color: '#2C1A0E' }}>
                          {cartItem?.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(product.id, (cartItem?.quantity ?? 1) + 1)}
                          className="w-7 h-7 rounded-full flex items-center justify-center text-white"
                          style={{ backgroundColor: '#14B8A6' }}
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleAdd(product)}
                        className="btn-tropical w-full py-1.5 rounded-xl text-white text-sm font-semibold"
                      >
                        + Agregar
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-20">
          <span className="text-6xl">🌊</span>
          <p className="mt-4 text-xl font-semibold" style={{ color: '#2C1A0E' }}>No se encontraron productos</p>
        </div>
      )}

      {/* Product detail modal */}
      {selectedProduct && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
          onClick={() => setSelectedProduct(null)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex">
              {/* Images */}
              <div className="w-1/2 relative" style={{ backgroundColor: '#FFFBF4' }}>
                <div className="aspect-square relative overflow-hidden flex items-center justify-center">
                  {selectedProduct.images[imgIdx] ? (
                    <img src={selectedProduct.images[imgIdx].url} alt={selectedProduct.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-8xl">📿</span>
                  )}
                </div>
                {selectedProduct.images.length > 1 && (
                  <div className="flex gap-1 p-2 overflow-x-auto">
                    {selectedProduct.images.map((img, i) => (
                      <button
                        key={i}
                        onClick={() => setImgIdx(i)}
                        className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0"
                        style={{ border: i === imgIdx ? '2px solid #5DBFAD' : '2px solid transparent' }}
                      >
                        <img src={img.url} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="w-1/2 p-6 flex flex-col">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <span className="text-xs font-mono font-bold" style={{ color: '#14B8A6' }}>#{selectedProduct.code}</span>
                    <h2 className="text-xl font-black mt-1" style={{ color: '#2C1A0E' }}>{selectedProduct.name}</h2>
                    {selectedProduct.category && (
                      <span className="text-sm" style={{ color: '#7A5230' }}>
                        {selectedProduct.category.icon} {selectedProduct.category.name}
                      </span>
                    )}
                  </div>
                  <button onClick={() => setSelectedProduct(null)}>
                    <X size={20} style={{ color: '#7A5230' }} />
                  </button>
                </div>

                {selectedProduct.description && (
                  <p className="text-sm leading-relaxed mb-4" style={{ color: '#7A5230' }}>
                    {selectedProduct.description}
                  </p>
                )}

                {selectedProduct.price != null && (
                  <p className="text-2xl font-black mb-4" style={{ color: '#2C1A0E' }}>
                    ${selectedProduct.price.toFixed(2)}
                  </p>
                )}

                <div className="mt-auto">
                  <div className="mb-3">
                    <span
                      className="badge-stock"
                      style={{
                        backgroundColor: selectedProduct.stock > 0 ? 'rgba(20,184,166,0.2)' : 'rgba(239,68,68,0.1)',
                        color: selectedProduct.stock > 0 ? '#3D9A8A' : '#DC2626',
                      }}
                    >
                      {selectedProduct.stock > 0 ? `Stock disponible: ${selectedProduct.stock}` : 'Sin stock'}
                    </span>
                  </div>
                  {selectedProduct.stock > 0 && (
                    <button
                      onClick={() => { handleAdd(selectedProduct); setSelectedProduct(null) }}
                      className="btn-tropical w-full py-3 rounded-xl text-white font-bold"
                    >
                      {isInCart(selectedProduct.id) ? '+ Agregar otro' : '🛍️ Agregar al pedido'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cart sidebar */}
      {showCart && (
        <div
          className="fixed inset-0 z-50 flex justify-end"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          onClick={() => setShowCart(false)}
        >
          <div
            className="w-full max-w-sm bg-white h-full overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-black" style={{ color: '#2C1A0E' }}>🛍️ Mi Pre-orden</h2>
                <button onClick={() => setShowCart(false)}>
                  <X size={24} style={{ color: '#7A5230' }} />
                </button>
              </div>

              {items.length === 0 ? (
                <div className="text-center py-12">
                  <span className="text-5xl">🛍️</span>
                  <p className="mt-3" style={{ color: '#7A5230' }}>Tu pre-orden está vacía</p>
                </div>
              ) : (
                <>
                  <div className="space-y-3 mb-6">
                    {items.map((item) => (
                      <div
                        key={item.productId}
                        className="flex items-center gap-3 p-3 rounded-xl"
                        style={{ backgroundColor: '#FFFBF4' }}
                      >
                        <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0" style={{ backgroundColor: '#EDE5D5' }}>
                          {item.productImage ? (
                            <img src={item.productImage} alt={item.productName} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-2xl">📿</div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-mono font-bold" style={{ color: '#14B8A6' }}>#{item.productCode}</p>
                          <p className="text-sm font-semibold truncate" style={{ color: '#2C1A0E' }}>{item.productName}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <button
                              onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                              className="w-5 h-5 rounded-full flex items-center justify-center text-white"
                              style={{ backgroundColor: '#E8603C' }}
                            >
                              <Minus size={10} />
                            </button>
                            <span className="text-sm font-bold" style={{ color: '#2C1A0E' }}>{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                              className="w-5 h-5 rounded-full flex items-center justify-center text-white"
                              style={{ backgroundColor: '#14B8A6' }}
                            >
                              <Plus size={10} />
                            </button>
                          </div>
                        </div>
                        <button onClick={() => removeItem(item.productId)}>
                          <X size={16} style={{ color: '#E8603C' }} />
                        </button>
                      </div>
                    ))}
                  </div>

                  <Link
                    href="/cliente/pedidos"
                    onClick={() => setShowCart(false)}
                    className="btn-tropical w-full py-3 rounded-xl text-white font-bold text-center block"
                  >
                    Confirmar Pre-orden ({itemCount}) 🌴
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
