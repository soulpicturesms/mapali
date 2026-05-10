'use client'
import { useState, useTransition, useEffect } from 'react'
import { useCart } from '@/components/CartContext'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { Minus, Plus, X, Send, ChevronDown, ChevronUp, ZoomIn, Printer } from 'lucide-react'

const STATUS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  pendiente: { label: 'Pendiente', color: '#D97706', bg: '#FEF3C7' },
  revisado: { label: 'Revisado', color: '#2563EB', bg: '#DBEAFE' },
  confirmado: { label: 'Confirmado ✅', color: '#16A34A', bg: '#DCFCE7' },
  cancelado: { label: 'Cancelado', color: '#DC2626', bg: '#FEE2E2' },
}

interface OrderItem {
  id: string
  quantity: number
  originalQuantity: number | null
  notes: string | null
  available: boolean
  product: {
    id: string
    code: string
    name: string
    price: number | null
    images: { url: string }[]
  }
}

interface Order {
  id: string
  status: string
  notes: string | null
  createdAt: string
  items: OrderItem[]
}

function printClientOrder(order: Order) {
  const available = order.items.filter(i => i.available !== false)
  const unavailable = order.items.filter(i => i.available === false)
  const items = available
  const total = items.reduce((sum, i) => sum + (i.product.price ?? 0) * i.quantity, 0)
  const hasPrice = items.some(i => i.product.price != null)

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Pedido #${order.id.slice(-6).toUpperCase()} - Mapali Beach</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Arial, sans-serif; padding: 40px; color: #2C1A0E; font-size: 14px; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 28px; border-bottom: 3px solid #14B8A6; padding-bottom: 16px; }
    .brand { font-size: 24px; font-weight: 900; color: #14B8A6; }
    .brand-sub { font-size: 12px; color: #7A5230; margin-top: 2px; }
    .order-num h2 { font-size: 18px; color: #2C1A0E; text-align: right; }
    .order-num p { font-size: 12px; color: #7A5230; text-align: right; }
    .badge { display: inline-block; background: #DCFCE7; color: #16A34A; padding: 2px 10px; border-radius: 20px; font-weight: bold; font-size: 12px; }
    table { width: 100%; border-collapse: collapse; margin-top: 8px; }
    th { background: #14B8A6; color: white; padding: 10px 12px; text-align: left; font-size: 12px; text-transform: uppercase; }
    td { padding: 10px 12px; border-bottom: 1px solid #EDE5D5; font-size: 13px; }
    tr:nth-child(even) td { background: #FFFBF4; }
    .total-row td { font-weight: bold; background: #DCFCE7; color: #16A34A; }
    .code { font-family: monospace; color: #14B8A6; }
    .footer { margin-top: 36px; padding-top: 12px; border-top: 1px solid #EDE5D5; font-size: 11px; color: #7A5230; text-align: center; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="brand">🌴 Mapali Beach</div>
      <div class="brand-sub">Bávaro, Punta Cana · Joyería Artesanal</div>
    </div>
    <div class="order-num">
      <h2>Pedido #${order.id.slice(-6).toUpperCase()}</h2>
      <p>${new Date(order.createdAt).toLocaleString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
      <p style="margin-top:4px"><span class="badge">Confirmado ✅</span></p>
    </div>
  </div>
  <table>
    <thead>
      <tr>
        <th>#</th>
        <th>Código</th>
        <th>Producto</th>
        ${hasPrice ? '<th>Precio unit.</th>' : ''}
        <th>Cantidad</th>
        ${hasPrice ? '<th>Subtotal</th>' : ''}
      </tr>
    </thead>
    <tbody>
      ${items.map((item, i) => `
        <tr>
          <td>${i + 1}</td>
          <td><span class="code">${item.product.code}</span></td>
          <td>${item.product.name}${item.notes ? `<br><small style="color:#7A5230;font-style:italic">Nota: ${item.notes}</small>` : ''}</td>
          ${hasPrice ? `<td>${item.product.price != null ? `$${item.product.price.toFixed(2)}` : '—'}</td>` : ''}
          <td>${item.quantity}</td>
          ${hasPrice ? `<td>${item.product.price != null ? `$${(item.product.price * item.quantity).toFixed(2)}` : '—'}</td>` : ''}
        </tr>
      `).join('')}
      ${hasPrice ? `<tr class="total-row"><td colspan="${hasPrice ? 5 : 3}" style="text-align:right">TOTAL</td><td>$${total.toFixed(2)}</td></tr>` : ''}
    </tbody>
  </table>
  ${unavailable.length > 0 ? `
  <div style="margin-top:24px;margin-bottom:8px;font-size:13px;font-weight:bold;color:#DC2626;border-left:4px solid #DC2626;padding-left:10px;">
    ⚠️ Artículos No Disponibles (${unavailable.length})
  </div>
  <p style="font-size:11px;color:#DC2626;margin-bottom:6px;">Estos artículos no pudieron ser incluidos en tu pedido.</p>
  <table>
    <thead><tr>
      <th style="background:#DC2626;">#</th>
      <th style="background:#DC2626;">Código</th>
      <th style="background:#DC2626;">Producto</th>
      <th style="background:#DC2626;">Cantidad</th>
    </tr></thead>
    <tbody>
      ${unavailable.map((item, i) => `
        <tr style="opacity:0.6;text-decoration:line-through;color:#DC2626;">
          <td>${i + 1}</td>
          <td>${item.product.code}</td>
          <td>${item.product.name}</td>
          <td>${item.quantity}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>
  ` : ''}
  <div class="footer">Mapali Beach — Joyería artesanal hecha con amor 🌺 · Productos de Colombia 🇨🇴</div>
</body>
</html>`

  const win = window.open('', '_blank', 'width=800,height=700')
  if (!win) { toast.error('El navegador bloqueó la ventana emergente'); return }
  win.document.write(html)
  win.document.close()
  win.focus()
  setTimeout(() => win.print(), 400)
}

export default function PedidosClient({ orders: initial }: { orders: Order[] }) {
  const { items, itemCount, updateQuantity, removeItem, updateNotes, clearCart } = useCart()
  const [notes, setNotes] = useState('')
  const [isPending, startTransition] = useTransition()
  const [orders, setOrders] = useState(initial)
  const [expandedOrders, setExpandedOrders] = useState<string[]>([])
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null)

  // Mark orders as seen — clears the notification badge in the navbar
  useEffect(() => {
    localStorage.setItem('mapali_orders_seen', Date.now().toString())
    window.dispatchEvent(new Event('mapali_orders_seen'))
  }, [])

  const toggleOrder = (id: string) => {
    setExpandedOrders((prev) =>
      prev.includes(id) ? prev.filter((o) => o !== id) : [...prev, id]
    )
  }

  const handleSubmit = async () => {
    if (items.length === 0) {
      toast.error('Agregá productos al pedido primero')
      return
    }

    const cartSnapshot = [...items]

    startTransition(async () => {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notes,
          items: cartSnapshot.map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
            notes: i.notes,
          })),
        }),
      })

      if (res.ok) {
        const newOrder = await res.json()
        clearCart()
        setNotes('')
        // Add to local orders list immediately — default available: true for all items
        const orderWithAvailability = {
          ...newOrder,
          items: (newOrder.items ?? []).map((i: OrderItem) => ({ ...i, available: true })),
        }
        setOrders(prev => [orderWithAvailability, ...prev])
        setExpandedOrders(prev => [newOrder.id, ...prev])
        toast.success('¡Pre-orden enviada! Te confirmamos pronto 🌴')
      } else {
        const data = await res.json()
        toast.error(data.error || 'Error al enviar el pedido')
      }
    })
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Lightbox */}
      {lightboxUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.85)' }}
          onClick={() => setLightboxUrl(null)}
        >
          <button
            className="absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center"
            style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}
            onClick={() => setLightboxUrl(null)}
          >
            <X size={20} color="white" />
          </button>
          <img
            src={lightboxUrl}
            alt="Foto del producto"
            className="max-w-full max-h-full rounded-2xl shadow-2xl"
            style={{ maxHeight: '85vh', objectFit: 'contain' }}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      <h1 className="text-3xl font-black mb-2" style={{ color: '#2C1A0E' }}>Mis Pre-órdenes 🛍️</h1>
      <p className="text-sm mb-8" style={{ color: '#7A5230' }}>Confirmá tu pedido y te contactamos pronto</p>

      {/* Current cart */}
      {itemCount > 0 && (
        <div className="bg-white rounded-2xl overflow-hidden shadow-lg mb-8" style={{ border: '2px solid #5DBFAD' }}>
          <div className="p-4 flex items-center justify-between" style={{ backgroundColor: '#14B8A6' }}>
            <h2 className="text-white font-bold text-lg">🛍️ Nueva Pre-orden</h2>
            <span className="bg-white text-sm font-bold px-3 py-1 rounded-full" style={{ color: '#14B8A6' }}>
              {itemCount} artículo{itemCount !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="p-4">
            <div className="space-y-3 mb-4">
              {items.map((item) => (
                <div key={item.productId} className="flex items-center gap-3 p-3 rounded-xl" style={{ backgroundColor: '#FFFBF4' }}>
                  <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0" style={{ backgroundColor: '#EDE5D5' }}>
                    {item.productImage ? (
                      <img src={item.productImage} alt={item.productName} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl">📿</div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-mono font-bold" style={{ color: '#14B8A6' }}>#{item.productCode}</p>
                    <p className="text-sm font-semibold" style={{ color: '#2C1A0E' }}>{item.productName}</p>
                    <input
                      type="text"
                      placeholder="Nota (color, talle...)"
                      value={item.notes || ''}
                      onChange={(e) => updateNotes(item.productId, e.target.value)}
                      className="mt-1 text-xs border rounded px-2 py-1 w-full"
                      style={{ borderColor: '#F5A623', color: '#2C1A0E' }}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      className="w-7 h-7 rounded-full flex items-center justify-center text-white"
                      style={{ backgroundColor: '#E8603C' }}
                    >
                      <Minus size={12} />
                    </button>
                    <span className="font-bold text-sm w-6 text-center" style={{ color: '#2C1A0E' }}>{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      className="w-7 h-7 rounded-full flex items-center justify-center text-white"
                      style={{ backgroundColor: '#14B8A6' }}
                    >
                      <Plus size={12} />
                    </button>
                    <button onClick={() => removeItem(item.productId)}>
                      <X size={16} style={{ color: '#E8603C' }} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notas generales del pedido (opcional)..."
              rows={3}
              className="input-mapali w-full mb-4 resize-none text-sm"
            />

            <div className="flex gap-3">
              <Link
                href="/cliente/catalogo"
                className="flex-1 py-3 rounded-xl font-semibold text-center border-2 transition-colors"
                style={{ borderColor: '#14B8A6', color: '#14B8A6' }}
              >
                + Agregar más
              </Link>
              <button
                onClick={handleSubmit}
                disabled={isPending}
                className="flex-1 btn-tropical py-3 rounded-xl text-white font-bold flex items-center justify-center gap-2 disabled:opacity-60"
              >
                <Send size={18} />
                {isPending ? 'Enviando...' : 'Confirmar Pre-orden'}
              </button>
            </div>
          </div>
        </div>
      )}

      {itemCount === 0 && orders.length === 0 && (
        <div className="text-center py-16">
          <span className="text-6xl">🛍️</span>
          <p className="mt-4 text-xl font-semibold" style={{ color: '#2C1A0E' }}>Todavía no tenés pedidos</p>
          <p className="mt-2 mb-6" style={{ color: '#7A5230' }}>Explorá el catálogo y agregá artículos a tu pre-orden</p>
          <Link href="/cliente/catalogo" className="btn-tropical px-8 py-3 rounded-full text-white font-bold">
            Ver Catálogo 📿
          </Link>
        </div>
      )}

      {/* Order history */}
      {orders.length > 0 && (
        <div>
          <h2 className="text-xl font-black mb-4" style={{ color: '#2C1A0E' }}>Historial de Pedidos</h2>
          <div className="space-y-3">
            {orders.map((order) => {
              const statusInfo = STATUS_LABELS[order.status] || STATUS_LABELS.pendiente
              const isExpanded = expandedOrders.includes(order.id)
              const availableItems = order.items.filter(i => i.available !== false)
              const hasPrice = availableItems.some(i => i.product.price != null)
              const total = availableItems.reduce((sum, i) => sum + (i.product.price ?? 0) * i.quantity, 0)
              const unavailableCount = order.items.filter(i => i.available === false).length

              return (
                <div key={order.id} className="bg-white rounded-2xl overflow-hidden shadow-md"
                  style={{ border: '1px solid rgba(245,166,35,0.2)' }}>
                  <button
                    onClick={() => toggleOrder(order.id)}
                    className="w-full p-4 flex items-center justify-between text-left"
                  >
                    <div className="flex items-center gap-3 flex-wrap">
                      <div>
                        <p className="font-bold text-sm" style={{ color: '#2C1A0E' }}>
                          Pedido #{order.id.slice(-6).toUpperCase()}
                        </p>
                        <p className="text-xs" style={{ color: '#7A5230' }}>
                          {new Date(order.createdAt).toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })}
                          {' · '}{order.items.length} artículo{order.items.length !== 1 ? 's' : ''}
                          {unavailableCount > 0 && (
                            <span className="ml-1 font-bold" style={{ color: '#DC2626' }}>
                              · {unavailableCount} no disponible{unavailableCount !== 1 ? 's' : ''}
                            </span>
                          )}
                        </p>
                      </div>
                      <span
                        className="text-xs font-bold px-3 py-1 rounded-full"
                        style={{ color: statusInfo.color, backgroundColor: statusInfo.bg }}
                      >
                        {statusInfo.label}
                      </span>
                    </div>
                    {isExpanded ? <ChevronUp size={18} style={{ color: '#7A5230' }} /> : <ChevronDown size={18} style={{ color: '#7A5230' }} />}
                  </button>

                  {isExpanded && (
                    <div className="px-4 pb-4 space-y-2">
                      {order.items.map((item) => {
                        const imgUrl = item.product.images[0]?.url
                        const notAvail = item.available === false
                        return (
                          <div key={item.id} className="flex items-center gap-3 p-2 rounded-lg transition-all"
                            style={{
                              backgroundColor: notAvail ? 'rgba(254,226,226,0.5)' : '#FFFBF4',
                              opacity: notAvail ? 0.6 : 1,
                              border: notAvail ? '1px solid rgba(220,38,38,0.2)' : '1px solid transparent',
                            }}>
                            <div
                              className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 relative group/img cursor-pointer"
                              style={{ backgroundColor: '#EDE5D5' }}
                              onClick={() => imgUrl && setLightboxUrl(imgUrl)}
                            >
                              {imgUrl ? (
                                <>
                                  <img src={imgUrl} alt={item.product.name} className="w-full h-full object-cover" />
                                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity"
                                    style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}>
                                    <ZoomIn size={16} color="white" />
                                  </div>
                                </>
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">📿</div>
                              )}
                            </div>
                            <div className="flex-1">
                              <p className="text-xs font-mono"
                                style={{ color: notAvail ? '#DC2626' : '#14B8A6', textDecoration: notAvail ? 'line-through' : 'none' }}>
                                #{item.product.code}
                              </p>
                              <p className="text-sm font-semibold"
                                style={{ color: notAvail ? '#DC2626' : '#2C1A0E', textDecoration: notAvail ? 'line-through' : 'none' }}>
                                {item.product.name}
                              </p>
                              {notAvail && (
                                <p className="text-xs font-bold" style={{ color: '#DC2626' }}>No disponible</p>
                              )}
                              {item.notes && !notAvail && <p className="text-xs italic" style={{ color: '#7A5230' }}>Nota: {item.notes}</p>}
                            </div>
                            <div className="text-right">
                              {item.originalQuantity != null && item.originalQuantity !== item.quantity ? (
                                <div>
                                  <p className="text-xs line-through" style={{ color: '#DC2626' }}>×{item.originalQuantity}</p>
                                  <p className="text-sm font-bold" style={{ color: '#2C1A0E' }}>×{item.quantity}</p>
                                  <p className="text-xs font-bold" style={{ color: '#DC2626' }}>−{item.originalQuantity - item.quantity} faltante</p>
                                </div>
                              ) : (
                                <span className="font-bold text-sm"
                                  style={{ color: notAvail ? '#DC2626' : '#2C1A0E', textDecoration: notAvail ? 'line-through' : 'none' }}>
                                  ×{item.quantity}
                                </span>
                              )}
                              {item.product.price != null && !notAvail && (
                                <p className="text-xs" style={{ color: '#7A5230' }}>
                                  ${(item.product.price * item.quantity).toFixed(2)}
                                </p>
                              )}
                            </div>
                          </div>
                        )
                      })}

                      {hasPrice && (
                        <div className="flex justify-between items-center px-3 py-2 rounded-xl font-bold text-sm"
                          style={{ backgroundColor: '#DCFCE7', color: '#16A34A' }}>
                          <span>Total</span>
                          <span>${total.toFixed(2)}</span>
                        </div>
                      )}

                      {order.notes && (
                        <p className="text-xs italic px-2" style={{ color: '#7A5230' }}>📝 {order.notes}</p>
                      )}

                      {order.status === 'confirmado' && (
                        <button
                          onClick={() => printClientOrder(order)}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white mt-2"
                          style={{ backgroundColor: '#F5A623' }}
                        >
                          <Printer size={15} /> Descargar PDF
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
