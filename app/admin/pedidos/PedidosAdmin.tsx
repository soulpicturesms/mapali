'use client'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { ChevronDown, ChevronUp, MessageCircle, Ban, Undo2, Printer, X, ZoomIn } from 'lucide-react'

const STATUS_OPTIONS = [
  { value: 'pendiente', label: 'Pendiente', color: '#D97706', bg: '#FEF3C7' },
  { value: 'revisado', label: 'Revisado', color: '#2563EB', bg: '#DBEAFE' },
  { value: 'confirmado', label: 'Confirmado', color: '#16A34A', bg: '#DCFCE7' },
  { value: 'cancelado', label: 'Cancelado', color: '#DC2626', bg: '#FEE2E2' },
]

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
    description: string | null
    price: number | null
    images: { url: string }[]
  }
}

interface Order {
  id: string
  status: string
  notes: string | null
  createdAt: string
  user: { name: string | null; email: string; phone: string | null }
  items: OrderItem[]
}

interface Lightbox {
  url: string
  code: string
  name: string
  description: string | null
}

function printOrder(order: Order, unavailableIds: string[]) {
  const available = order.items.filter(i => !unavailableIds.includes(i.id))
  const unavailable = order.items.filter(i => unavailableIds.includes(i.id))
  const total = available.reduce((sum, i) => sum + (i.product.price ?? 0) * i.quantity, 0)
  const hasPrice = available.some(i => i.product.price != null)

  const itemRow = (item: OrderItem, idx: number, strike = false) => `
    <tr style="${strike ? 'opacity:0.5;text-decoration:line-through;color:#DC2626;' : ''}">
      <td>${idx + 1}</td>
      <td><span class="code">${item.product.code}</span></td>
      <td>${item.product.name}${item.notes ? `<br><small>Nota: ${item.notes}</small>` : ''}</td>
      ${hasPrice || !strike ? `<td>${item.product.price != null ? `$${item.product.price.toFixed(2)}` : '—'}</td>` : '<td>—</td>'}
      <td>${item.quantity}</td>
      ${hasPrice || !strike ? `<td>${item.product.price != null ? `$${(item.product.price * item.quantity).toFixed(2)}` : '—'}</td>` : '<td>—</td>'}
    </tr>`

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
    .order-num { text-align: right; }
    .order-num h2 { font-size: 18px; }
    .order-num p { font-size: 12px; color: #7A5230; }
    .info-box { background: #FFFBF4; border: 1px solid rgba(245,166,35,0.4); border-radius: 8px; padding: 14px; margin-bottom: 20px; display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 13px; }
    .badge-ok { display:inline-block; background:#DCFCE7; color:#16A34A; padding:2px 10px; border-radius:20px; font-weight:bold; font-size:12px; }
    table { width: 100%; border-collapse: collapse; margin-top: 8px; }
    th { background: #14B8A6; color: white; padding: 10px 12px; text-align: left; font-size: 12px; text-transform: uppercase; }
    td { padding: 10px 12px; border-bottom: 1px solid #EDE5D5; font-size: 13px; vertical-align: top; }
    tr:nth-child(even) td { background: #FFFBF4; }
    .total-row td { font-weight: bold; background: #DCFCE7; color: #16A34A; font-size: 14px; }
    .unavail-header { margin-top: 28px; margin-bottom: 8px; font-size: 13px; font-weight: bold; color: #DC2626; border-left: 4px solid #DC2626; padding-left: 10px; }
    .unavail-note { font-size: 11px; color: #DC2626; margin-bottom: 6px; }
    .code { font-family: monospace; color: #14B8A6; }
    .footer { margin-top: 36px; padding-top: 12px; border-top: 1px solid #EDE5D5; font-size: 11px; color: #7A5230; text-align: center; }
    small { font-size: 11px; color: #7A5230; font-style: italic; }
    @media print { body { padding: 20px; } }
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
      <p>${new Date(order.createdAt).toLocaleString('es-AR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
      <p style="margin-top:4px"><span class="badge-ok">Confirmado ✅</span></p>
    </div>
  </div>

  <div class="info-box">
    <p><strong>Cliente:</strong> ${order.user.name || 'Sin nombre'}</p>
    <p><strong>Email:</strong> ${order.user.email}</p>
    ${order.user.phone ? `<p><strong>Teléfono:</strong> ${order.user.phone}</p>` : ''}
    ${order.notes ? `<p><strong>Nota:</strong> ${order.notes}</p>` : ''}
  </div>

  ${available.length > 0 ? `
  <table>
    <thead>
      <tr>
        <th>#</th><th>Código</th><th>Producto</th><th>Precio unit.</th><th>Cantidad</th><th>Subtotal</th>
      </tr>
    </thead>
    <tbody>
      ${available.map((item, i) => itemRow(item, i)).join('')}
      ${hasPrice ? `<tr class="total-row"><td colspan="5" style="text-align:right">TOTAL DEL PEDIDO</td><td>$${total.toFixed(2)}</td></tr>` : ''}
    </tbody>
  </table>
  ` : '<p style="color:#7A5230;font-style:italic">Sin artículos disponibles.</p>'}

  ${unavailable.length > 0 ? `
  <div class="unavail-header">⚠️ Artículos No Disponibles (${unavailable.length})</div>
  <p class="unavail-note">Estos artículos fueron marcados como no disponibles y no se descontaron del stock.</p>
  <table>
    <thead>
      <tr style="background:#FEE2E2;">
        <th style="background:#DC2626;">#</th>
        <th style="background:#DC2626;">Código</th>
        <th style="background:#DC2626;">Producto</th>
        <th style="background:#DC2626;">Precio unit.</th>
        <th style="background:#DC2626;">Cantidad</th>
        <th style="background:#DC2626;">Subtotal</th>
      </tr>
    </thead>
    <tbody>
      ${unavailable.map((item, i) => itemRow(item, i, true)).join('')}
    </tbody>
  </table>
  ` : ''}

  <div class="footer">Mapali Beach — Joyería artesanal hecha con amor 🌺 · Productos de Colombia 🇨🇴</div>
</body>
</html>`

  const win = window.open('', '_blank', 'width=820,height=720')
  if (!win) { toast.error('El navegador bloqueó la ventana emergente'); return }
  win.document.write(html)
  win.document.close()
  win.focus()
  setTimeout(() => win.print(), 400)
}

export default function PedidosAdmin({ orders: initial }: { orders: Order[] }) {
  const [orders, setOrders] = useState(initial)
  const [expanded, setExpanded] = useState<string[]>([])
  const [filterStatus, setFilterStatus] = useState('all')
  const [confirmModalId, setConfirmModalId] = useState<string | null>(null)
  const [loadingId, setLoadingId] = useState<string | null>(null)

  // Initialize unavailableMap from DB data (items where available === false)
  const [unavailableMap, setUnavailableMap] = useState<Map<string, Set<string>>>(() => {
    const map = new Map<string, Set<string>>()
    for (const order of initial) {
      const ids = order.items.filter(i => !i.available).map(i => i.id)
      if (ids.length > 0) map.set(order.id, new Set(ids))
    }
    return map
  })
  // quantityMap: orderId -> itemId -> adjusted quantity
  const [quantityMap, setQuantityMap] = useState<Map<string, Map<string, number>>>(() => {
    const map = new Map<string, Map<string, number>>()
    for (const order of initial) {
      const itemMap = new Map<string, number>()
      for (const item of order.items) {
        itemMap.set(item.id, item.quantity)
      }
      map.set(order.id, itemMap)
    }
    return map
  })
  const [lightbox, setLightbox] = useState<Lightbox | null>(null)

  const getQty = (orderId: string, itemId: string, fallback: number) =>
    quantityMap.get(orderId)?.get(itemId) ?? fallback

  const adjustQty = (orderId: string, itemId: string, delta: number, max: number) => {
    setQuantityMap(prev => {
      const next = new Map(prev)
      const itemMap = new Map(next.get(orderId) ?? [])
      const cur = itemMap.get(itemId) ?? max
      itemMap.set(itemId, Math.max(1, Math.min(max, cur + delta)))
      next.set(orderId, itemMap)
      return next
    })
  }

  const getAdjustedQuantities = (orderId: string) => {
    const order = orders.find(o => o.id === orderId)
    if (!order) return {}
    const result: Record<string, number> = {}
    for (const item of order.items) {
      const adj = getQty(orderId, item.id, item.quantity)
      result[item.id] = adj
    }
    return result
  }

  const modalOrder = confirmModalId ? orders.find(o => o.id === confirmModalId) ?? null : null

  const toggleExpand = (id: string) => {
    setExpanded(prev => prev.includes(id) ? prev.filter(o => o !== id) : [...prev, id])
  }

  const isUnavailable = (orderId: string, itemId: string) =>
    unavailableMap.get(orderId)?.has(itemId) ?? false

  const toggleUnavailable = (orderId: string, itemId: string) => {
    setUnavailableMap(prev => {
      const next = new Map(prev)
      const set = new Set(next.get(orderId) ?? [])
      if (set.has(itemId)) set.delete(itemId)
      else set.add(itemId)
      next.set(orderId, set)
      return next
    })
  }

  const getUnavailableIds = (orderId: string) =>
    [...(unavailableMap.get(orderId) ?? [])]

  const updateStatus = async (orderId: string, status: string) => {
    if (status === 'confirmado') {
      setConfirmModalId(orderId)
      return
    }
    setLoadingId(orderId)
    const res = await fetch(`/api/orders/${orderId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    setLoadingId(null)
    if (res.ok) {
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o))
      toast.success('Estado actualizado ✅')
    } else {
      toast.error('Error al actualizar')
    }
  }

  const confirmOrder = async () => {
    if (!confirmModalId) return
    const unavailableItemIds = getUnavailableIds(confirmModalId)
    setLoadingId(confirmModalId)
    const res = await fetch(`/api/orders/${confirmModalId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'confirmado', unavailableItemIds, adjustedQuantities: getAdjustedQuantities(confirmModalId) }),
    })
    setLoadingId(null)
    if (res.ok) {
      setOrders(prev => prev.map(o => o.id === confirmModalId ? { ...o, status: 'confirmado' } : o))
      toast.success('Pedido confirmado ✅ — Stock actualizado')
      setConfirmModalId(null)
    } else {
      toast.error('Error al confirmar')
    }
  }

  const filtered = orders.filter(o => filterStatus === 'all' || o.status === filterStatus)
  const countByStatus = (status: string) => orders.filter(o => o.status === status).length

  return (
    <div className="p-6">
      {/* ─── Photo Lightbox ─── */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.88)' }}
          onClick={() => setLightbox(null)}
        >
          <button
            className="absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center"
            style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}
            onClick={() => setLightbox(null)}
          >
            <X size={20} color="white" />
          </button>
          <div className="flex flex-col items-center gap-4 max-w-md w-full"
            onClick={e => e.stopPropagation()}>
            <img
              src={lightbox.url}
              alt={lightbox.name}
              className="rounded-2xl shadow-2xl object-contain"
              style={{ maxHeight: '65vh', maxWidth: '100%' }}
            />
            <div className="bg-white rounded-2xl p-4 w-full text-center">
              <p className="text-xs font-mono font-bold mb-1" style={{ color: '#14B8A6' }}>
                #{lightbox.code}
              </p>
              <p className="text-base font-black" style={{ color: '#2C1A0E' }}>{lightbox.name}</p>
              {lightbox.description && (
                <p className="text-sm mt-1" style={{ color: '#7A5230' }}>{lightbox.description}</p>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="mb-6">
        <h1 className="text-3xl font-black" style={{ color: '#2C1A0E' }}>🛍️ Pedidos</h1>
        <p className="text-sm" style={{ color: '#7A5230' }}>{orders.length} pedidos en total</p>
      </div>

      {/* Status filter */}
      <div className="flex flex-wrap gap-2 mb-5">
        <button
          onClick={() => setFilterStatus('all')}
          className="px-4 py-1.5 rounded-full text-sm font-semibold"
          style={{
            backgroundColor: filterStatus === 'all' ? '#2C1A0E' : 'white',
            color: filterStatus === 'all' ? 'white' : '#2C1A0E',
            border: '2px solid #2C1A0E',
          }}
        >
          Todos ({orders.length})
        </button>
        {STATUS_OPTIONS.map(s => (
          <button
            key={s.value}
            onClick={() => setFilterStatus(s.value)}
            className="px-4 py-1.5 rounded-full text-sm font-semibold"
            style={{
              backgroundColor: filterStatus === s.value ? s.color : s.bg,
              color: filterStatus === s.value ? 'white' : s.color,
              border: `2px solid ${s.color}`,
            }}
          >
            {s.label} ({countByStatus(s.value)})
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="text-center py-16">
            <span className="text-5xl">📭</span>
            <p className="mt-3 font-semibold" style={{ color: '#2C1A0E' }}>No hay pedidos</p>
          </div>
        )}

        {filtered.map(order => {
          const statusInfo = STATUS_OPTIONS.find(s => s.value === order.status) || STATUS_OPTIONS[0]
          const isExpanded = expanded.includes(order.id)
          const phone = order.user.phone?.replace(/\D/g, '')
          const waLink = phone
            ? `https://wa.me/1${phone}?text=Hola%20${encodeURIComponent(order.user.name || '')}!%20Te%20contactamos%20de%20Mapali%20Beach%20sobre%20tu%20pedido%20%23${order.id.slice(-6).toUpperCase()}%20🌴`
            : null
          const unavailableIds = getUnavailableIds(order.id)
          const availableItems = order.items.filter(i => !unavailableIds.includes(i.id))
          const total = availableItems.reduce((sum, i) => sum + (i.product.price ?? 0) * i.quantity, 0)
          const hasPrice = availableItems.some(i => i.product.price != null)

          return (
            <div key={order.id} className="bg-white rounded-2xl overflow-hidden shadow-md"
              style={{ border: `2px solid ${statusInfo.bg}` }}>
              <button
                onClick={() => toggleExpand(order.id)}
                className="w-full p-4 flex items-center justify-between text-left"
              >
                <div className="flex items-center gap-4 flex-wrap">
                  <div>
                    <p className="font-bold" style={{ color: '#2C1A0E' }}>#{order.id.slice(-6).toUpperCase()}</p>
                    <p className="text-xs" style={{ color: '#7A5230' }}>
                      {new Date(order.createdAt).toLocaleString('es-AR', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold text-sm" style={{ color: '#2C1A0E' }}>{order.user.name}</p>
                    <p className="text-xs" style={{ color: '#7A5230' }}>{order.user.email}</p>
                  </div>
                  <span className="text-xs font-bold px-3 py-1 rounded-full"
                    style={{ color: statusInfo.color, backgroundColor: statusInfo.bg }}>
                    {statusInfo.label}
                  </span>
                  <span className="text-xs" style={{ color: '#7A5230' }}>
                    {order.items.length} artículo{order.items.length !== 1 ? 's' : ''}
                    {unavailableIds.length > 0 && (
                      <span className="ml-1 font-bold" style={{ color: '#DC2626' }}>
                        · {unavailableIds.length} no disponible{unavailableIds.length !== 1 ? 's' : ''}
                      </span>
                    )}
                  </span>
                </div>
                {isExpanded ? <ChevronUp size={18} style={{ color: '#7A5230' }} /> : <ChevronDown size={18} style={{ color: '#7A5230' }} />}
              </button>

              {isExpanded && (
                <div className="px-4 pb-4" style={{ borderTop: '1px solid rgba(245,166,35,0.2)' }}>
                  <div className="pt-3 space-y-2 mb-3">
                    {order.items.map(item => {
                      const notAvail = isUnavailable(order.id, item.id)
                      const imgUrl = item.product.images[0]?.url
                      return (
                        <div key={item.id}
                          className="flex items-center gap-3 p-2 rounded-xl group/item transition-all"
                          style={{
                            backgroundColor: notAvail ? 'rgba(254,226,226,0.5)' : '#FFFBF4',
                            opacity: notAvail ? 0.65 : 1,
                            border: notAvail ? '1px solid rgba(220,38,38,0.25)' : '1px solid transparent',
                          }}>
                          {/* Clickable image */}
                          <div
                            className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 cursor-pointer relative group/img"
                            style={{ backgroundColor: '#EDE5D5' }}
                            onClick={() => imgUrl && setLightbox({
                              url: imgUrl,
                              code: item.product.code,
                              name: item.product.name,
                              description: item.product.description,
                            })}
                          >
                            {imgUrl ? (
                              <>
                                <img src={imgUrl} alt={item.product.name} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity"
                                  style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}>
                                  <ZoomIn size={14} color="white" />
                                </div>
                              </>
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-xl">📿</div>
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-mono font-bold"
                              style={{ color: notAvail ? '#DC2626' : '#14B8A6', textDecoration: notAvail ? 'line-through' : 'none' }}>
                              #{item.product.code}
                            </p>
                            <p className="text-sm font-semibold truncate"
                              style={{ color: notAvail ? '#DC2626' : '#2C1A0E', textDecoration: notAvail ? 'line-through' : 'none' }}>
                              {item.product.name}
                            </p>
                            {item.notes && <p className="text-xs italic" style={{ color: '#7A5230' }}>Nota: {item.notes}</p>}
                            {notAvail && (
                              <p className="text-xs font-bold" style={{ color: '#DC2626' }}>No disponible</p>
                            )}
                          </div>

                          <div className="flex items-center gap-3">
                            {!notAvail && order.status !== 'confirmado' && order.status !== 'cancelado' ? (
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => adjustQty(order.id, item.id, -1, item.quantity)}
                                  className="w-6 h-6 rounded-full flex items-center justify-center font-bold text-sm"
                                  style={{ backgroundColor: '#EDE5D5', color: '#2C1A0E' }}
                                >−</button>
                                <div className="text-center min-w-[28px]">
                                  <span className="font-bold text-sm" style={{ color: '#2C1A0E' }}>
                                    {getQty(order.id, item.id, item.quantity)}
                                  </span>
                                  {getQty(order.id, item.id, item.quantity) !== item.quantity && (
                                    <p className="text-xs line-through" style={{ color: '#DC2626' }}>{item.quantity}</p>
                                  )}
                                </div>
                                <button
                                  onClick={() => adjustQty(order.id, item.id, +1, item.quantity)}
                                  className="w-6 h-6 rounded-full flex items-center justify-center font-bold text-sm"
                                  style={{ backgroundColor: '#EDE5D5', color: '#2C1A0E' }}
                                >+</button>
                              </div>
                            ) : (
                              <div className="text-right">
                                {item.originalQuantity != null && item.originalQuantity !== item.quantity ? (
                                  <div>
                                    <p className="text-xs line-through" style={{ color: '#DC2626' }}>×{item.originalQuantity}</p>
                                    <p className="text-sm font-bold" style={{ color: notAvail ? '#DC2626' : '#2C1A0E', textDecoration: notAvail ? 'line-through' : 'none' }}>×{item.quantity}</p>
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
                            )}

                            {/* Toggle unavailable button */}
                            {order.status !== 'confirmado' && order.status !== 'cancelado' && (
                              <button
                                onClick={() => toggleUnavailable(order.id, item.id)}
                                className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                                style={{ backgroundColor: notAvail ? '#14B8A6' : '#E8603C' }}
                                title={notAvail ? 'Restaurar artículo' : 'Marcar como no disponible'}
                              >
                                {notAvail
                                  ? <Undo2 size={12} color="white" />
                                  : <Ban size={12} color="white" />
                                }
                              </button>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {/* Available total */}
                  {hasPrice && (
                    <div className="flex justify-between items-center px-3 py-2 rounded-xl mb-3 font-bold text-sm"
                      style={{ backgroundColor: '#DCFCE7', color: '#16A34A' }}>
                      <span>Total disponible{unavailableIds.length > 0 ? ' (sin no disponibles)' : ''}</span>
                      <span>${total.toFixed(2)}</span>
                    </div>
                  )}

                  {order.notes && (
                    <p className="text-sm italic mb-3 p-2 rounded-lg" style={{ backgroundColor: '#FFFBF4', color: '#7A5230' }}>
                      📝 {order.notes}
                    </p>
                  )}

                  <div className="flex items-center gap-3 flex-wrap">
                    <div className="flex-1">
                      <label className="text-xs font-semibold block mb-1" style={{ color: '#2C1A0E' }}>Cambiar estado:</label>
                      <div className="flex gap-1 flex-wrap">
                        {STATUS_OPTIONS.map(s => (
                          <button
                            key={s.value}
                            onClick={() => updateStatus(order.id, s.value)}
                            disabled={loadingId === order.id || order.status === s.value}
                            className="px-3 py-1 rounded-full text-xs font-semibold transition-all disabled:opacity-40"
                            style={{
                              backgroundColor: order.status === s.value ? s.color : s.bg,
                              color: order.status === s.value ? 'white' : s.color,
                              border: `1px solid ${s.color}`,
                            }}
                          >
                            {s.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {order.status === 'confirmado' && (
                        <button
                          onClick={() => printOrder(order, unavailableIds)}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold text-white"
                          style={{ backgroundColor: '#F5A623' }}
                        >
                          <Printer size={15} /> PDF
                        </button>
                      )}
                      {waLink && (
                        <a href={waLink} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white"
                          style={{ backgroundColor: '#25D366' }}>
                          <MessageCircle size={16} /> WhatsApp
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* ─── Confirmation Modal ─── */}
      {modalOrder && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.65)' }}
          onClick={e => { if (e.target === e.currentTarget) setConfirmModalId(null) }}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-xl font-black" style={{ color: '#2C1A0E' }}>
                    Confirmar Pedido #{modalOrder.id.slice(-6).toUpperCase()}
                  </h2>
                  <p className="text-sm mt-0.5" style={{ color: '#7A5230' }}>
                    {modalOrder.user.name} · {modalOrder.user.email}
                  </p>
                </div>
                <button onClick={() => setConfirmModalId(null)} className="p-1 rounded-lg hover:bg-gray-100">
                  <X size={20} style={{ color: '#7A5230' }} />
                </button>
              </div>

              {/* Available items */}
              <p className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: '#14B8A6' }}>
                Artículos disponibles
              </p>
              <div className="space-y-2 mb-4">
                {modalOrder.items.filter(i => !getUnavailableIds(modalOrder.id).includes(i.id)).length === 0 && (
                  <p className="text-sm text-center py-4" style={{ color: '#7A5230' }}>
                    Todos los artículos marcados como no disponibles.
                  </p>
                )}
                {modalOrder.items.filter(i => !getUnavailableIds(modalOrder.id).includes(i.id)).map(item => (
                  <div key={item.id} className="flex items-center gap-3 p-2.5 rounded-xl" style={{ backgroundColor: '#FFFBF4' }}>
                    <div className="w-11 h-11 rounded-lg overflow-hidden flex-shrink-0" style={{ backgroundColor: '#EDE5D5' }}>
                      {item.product.images[0]
                        ? <img src={item.product.images[0].url} className="w-full h-full object-cover" alt="" />
                        : <div className="w-full h-full flex items-center justify-center">📿</div>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-mono" style={{ color: '#14B8A6' }}>#{item.product.code}</p>
                      <p className="text-sm font-semibold truncate" style={{ color: '#2C1A0E' }}>{item.product.name}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      {(() => {
                        const adj = getQty(modalOrder.id, item.id, item.quantity)
                        const faltante = item.quantity - adj
                        return (
                          <>
                            <p className="text-sm font-bold" style={{ color: '#2C1A0E' }}>×{adj}</p>
                            {faltante > 0 && (
                              <p className="text-xs font-bold" style={{ color: '#DC2626' }}>−{faltante} faltante</p>
                            )}
                            {item.product.price != null && (
                              <p className="text-xs" style={{ color: '#7A5230' }}>
                                ${(item.product.price * adj).toFixed(2)}
                              </p>
                            )}
                          </>
                        )
                      })()}
                    </div>
                  </div>
                ))}
              </div>

              {/* Unavailable items in modal */}
              {getUnavailableIds(modalOrder.id).length > 0 && (
                <>
                  <p className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: '#DC2626' }}>
                    No disponibles — no se descontará stock
                  </p>
                  <div className="space-y-2 mb-4">
                    {modalOrder.items.filter(i => getUnavailableIds(modalOrder.id).includes(i.id)).map(item => (
                      <div key={item.id} className="flex items-center gap-3 p-2.5 rounded-xl"
                        style={{ backgroundColor: 'rgba(254,226,226,0.5)', border: '1px solid rgba(220,38,38,0.2)', opacity: 0.7 }}>
                        <div className="w-11 h-11 rounded-lg overflow-hidden flex-shrink-0" style={{ backgroundColor: '#EDE5D5' }}>
                          {item.product.images[0]
                            ? <img src={item.product.images[0].url} className="w-full h-full object-cover" alt="" />
                            : <div className="w-full h-full flex items-center justify-center">📿</div>}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-mono line-through" style={{ color: '#DC2626' }}>#{item.product.code}</p>
                          <p className="text-sm font-semibold truncate line-through" style={{ color: '#DC2626' }}>{item.product.name}</p>
                        </div>
                        <span className="text-xs font-bold line-through" style={{ color: '#DC2626' }}>×{item.quantity}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* Total */}
              {modalOrder.items.filter(i => !getUnavailableIds(modalOrder.id).includes(i.id)).some(i => i.product.price != null) && (
                <div className="flex justify-between items-center px-4 py-3 rounded-xl mb-4 font-bold"
                  style={{ backgroundColor: '#DCFCE7', color: '#16A34A' }}>
                  <span>TOTAL</span>
                  <span className="text-lg">
                    ${modalOrder.items
                      .filter(i => !getUnavailableIds(modalOrder.id).includes(i.id))
                      .reduce((sum, i) => sum + (i.product.price ?? 0) * i.quantity, 0)
                      .toFixed(2)}
                  </span>
                </div>
              )}

              <p className="text-xs mb-4 p-3 rounded-xl" style={{ backgroundColor: '#FEF3C7', color: '#D97706' }}>
                ⚠️ Al confirmar, se descontará el stock de los artículos <strong>disponibles</strong>. Los no disponibles no afectan el stock.
              </p>

              <div className="flex gap-3">
                <button onClick={() => setConfirmModalId(null)}
                  className="flex-1 py-2.5 rounded-xl border-2 font-semibold text-sm"
                  style={{ borderColor: '#7A5230', color: '#7A5230' }}>
                  Cancelar
                </button>
                <button
                  onClick={() => printOrder(modalOrder, getUnavailableIds(modalOrder.id))}
                  className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl font-semibold text-sm text-white"
                  style={{ backgroundColor: '#F5A623' }}>
                  <Printer size={15} /> PDF
                </button>
                <button
                  onClick={confirmOrder}
                  disabled={loadingId === modalOrder.id}
                  className="flex-1 py-2.5 rounded-xl font-bold text-sm text-white disabled:opacity-50"
                  style={{ backgroundColor: '#16A34A' }}>
                  {loadingId === modalOrder.id ? 'Confirmando...' : 'Confirmar ✅'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
