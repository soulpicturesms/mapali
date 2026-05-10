'use client'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { Trash2, Eye, EyeOff, Upload, Plus } from 'lucide-react'

interface SectionItem {
  id: string; section: string; url: string
  label?: string | null; subtitle?: string | null
  order: number; active: boolean
}

interface HeroSlot { slot: number; items: SectionItem[] }

function UploadPhotoForm({
  section,
  onAdded,
  extraFields,
}: {
  section: string
  onAdded: (item: SectionItem) => void
  extraFields?: boolean
}) {
  const [uploading, setUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState('')
  const [label, setLabel] = useState('')
  const [subtitle, setSubtitle] = useState('')
  const [open, setOpen] = useState(false)

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const fd = new FormData()
    fd.append('file', file)
    const res = await fetch('/api/upload', { method: 'POST', body: fd })
    const data = await res.json()
    setUploading(false)
    const url = data.url || data.urls?.[0]
    if (url) setPreviewUrl(url)
  }

  const handleAdd = async () => {
    if (!previewUrl) { toast.error('Subí una foto primero'); return }
    const res = await fetch('/api/sections', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ section, url: previewUrl, label, subtitle }),
    })
    if (res.ok) {
      const item = await res.json()
      onAdded(item)
      setPreviewUrl(''); setLabel(''); setSubtitle(''); setOpen(false)
      toast.success('Foto agregada ✅')
    } else {
      toast.error('Error al agregar')
    }
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl border-2 border-dashed text-sm font-semibold transition-colors"
        style={{ borderColor: 'rgba(20,184,166,0.4)', color: '#14B8A6' }}>
        <Plus size={16} /> Agregar foto
      </button>
    )
  }

  return (
    <div className="p-4 rounded-xl border" style={{ backgroundColor: '#FFFBF4', borderColor: 'rgba(245,166,35,0.3)' }}>
      <div className="flex gap-4">
        <label className="w-28 h-28 rounded-xl overflow-hidden flex-shrink-0 cursor-pointer flex items-center justify-center border-2 border-dashed"
          style={{ borderColor: 'rgba(245,166,35,0.5)' }}>
          {uploading ? <span className="text-xs" style={{ color: '#14B8A6' }}>Subiendo...</span>
            : previewUrl ? <img src={previewUrl} className="w-full h-full object-cover" alt="" />
            : <><Upload size={20} style={{ color: '#F5A623' }} /><span className="text-xs mt-1" style={{ color: '#7A5230' }}>Foto</span></>}
          <input type="file" accept="image/*" className="hidden" onChange={handleUpload} />
        </label>
        <div className="flex-1 space-y-2">
          <input type="text" value={label} onChange={e => setLabel(e.target.value)}
            placeholder="Título (ej: Collar Tropical)" className="input-mapali w-full text-sm" />
          {extraFields && (
            <input type="text" value={subtitle} onChange={e => setSubtitle(e.target.value)}
              placeholder="Subtítulo (ej: Flecos de colores)" className="input-mapali w-full text-sm" />
          )}
          <div className="flex gap-2">
            <button onClick={() => setOpen(false)} className="text-xs px-3 py-1.5 rounded-lg border"
              style={{ borderColor: '#14B8A6', color: '#14B8A6' }}>Cancelar</button>
            <button onClick={handleAdd} className="btn-tropical text-xs px-3 py-1.5 rounded-lg text-white font-bold">
              Agregar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function ItemCard({ item, onDelete, onToggle }: {
  item: SectionItem
  onDelete: (id: string) => void
  onToggle: (item: SectionItem) => void
}) {
  return (
    <div className="relative group rounded-xl overflow-hidden shadow-md"
      style={{ border: item.active ? '2px solid rgba(20,184,166,0.4)' : '2px solid #ddd', opacity: item.active ? 1 : 0.55 }}>
      <img src={item.url} alt={item.label ?? ''} className="w-full h-28 object-cover" />
      {item.label && (
        <div className="px-2 py-1.5">
          <p className="text-xs font-semibold truncate" style={{ color: '#2C1A0E' }}>{item.label}</p>
          {item.subtitle && <p className="text-xs truncate" style={{ color: '#7A5230' }}>{item.subtitle}</p>}
        </div>
      )}
      <div className="absolute top-1.5 right-1.5 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={() => onToggle(item)}
          className="w-7 h-7 rounded-full flex items-center justify-center shadow"
          style={{ backgroundColor: item.active ? '#F5A623' : '#14B8A6' }}>
          {item.active ? <EyeOff size={12} color="white" /> : <Eye size={12} color="white" />}
        </button>
        <button onClick={() => onDelete(item.id)}
          className="w-7 h-7 rounded-full flex items-center justify-center shadow"
          style={{ backgroundColor: '#E8603C' }}>
          <Trash2 size={12} color="white" />
        </button>
      </div>
    </div>
  )
}

export default function SeccionesAdmin({
  heroSlots: initialSlots,
  bolsosInitial,
}: {
  heroSlots: HeroSlot[]
  bolsosInitial: SectionItem[]
}) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [tab, setTab] = useState<'hero' | 'bolsos'>('hero')
  const [heroSlots, setHeroSlots] = useState(initialSlots)
  const [bolsos, setBolsos] = useState(bolsosInitial)

  const handleDelete = async (id: string, isHero: boolean, slot?: number) => {
    if (!confirm('¿Eliminar esta foto?')) return
    const res = await fetch(`/api/sections/${id}`, { method: 'DELETE' })
    if (res.ok) {
      if (isHero && slot !== undefined) {
        setHeroSlots(prev => prev.map(s =>
          s.slot === slot ? { ...s, items: s.items.filter(i => i.id !== id) } : s
        ))
      } else {
        setBolsos(prev => prev.filter(i => i.id !== id))
      }
      toast.success('Eliminado')
    }
  }

  const handleToggle = async (item: SectionItem, isHero: boolean, slot?: number) => {
    const res = await fetch(`/api/sections/${item.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: !item.active }),
    })
    if (res.ok) {
      const update = (i: SectionItem) => i.id === item.id ? { ...i, active: !i.active } : i
      if (isHero && slot !== undefined) {
        setHeroSlots(prev => prev.map(s =>
          s.slot === slot ? { ...s, items: s.items.map(update) } : s
        ))
      } else {
        setBolsos(prev => prev.map(update))
      }
    }
  }

  const tabs = [
    { key: 'hero', label: '✨ Hero / Novedades' },
    { key: 'bolsos', label: '👜 Bolsos de Playa' },
  ] as const

  return (
    <div className="p-6 max-w-5xl">
      <div className="mb-6">
        <h1 className="text-3xl font-black" style={{ color: '#2C1A0E' }}>Secciones del Inicio</h1>
        <p className="text-sm mt-1" style={{ color: '#7A5230' }}>
          Gestioná las fotos que aparecen en el hero y en la sección de bolsos
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className="px-5 py-2 rounded-full font-semibold text-sm transition-all"
            style={{
              backgroundColor: tab === t.key ? '#14B8A6' : 'white',
              color: tab === t.key ? 'white' : '#2C1A0E',
              border: '2px solid #14B8A6',
            }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ─── HERO SLOTS ─── */}
      {tab === 'hero' && (
        <div className="space-y-6">
          <p className="text-sm" style={{ color: '#7A5230' }}>
            4 recuadros en el hero. Cada uno puede tener varias fotos — se pasan solas como un slide.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {heroSlots.map(({ slot, items }) => (
              <div key={slot} className="bg-white rounded-2xl p-4 shadow-md"
                style={{ border: '1px solid rgba(245,166,35,0.2)' }}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold" style={{ color: '#2C1A0E' }}>
                    Recuadro {slot + 1}
                  </h3>
                  <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                    style={{
                      backgroundColor: items.length >= 4 ? 'rgba(232,96,60,0.1)' : 'rgba(20,184,166,0.1)',
                      color: items.length >= 4 ? '#E8603C' : '#14B8A6',
                    }}>
                    {items.length}/4 fotos
                  </span>
                </div>
                {items.length > 1 && (
                  <p className="text-xs mb-2" style={{ color: '#7A5230' }}>
                    ✨ Slide activo — pasan solas cada 4 seg
                  </p>
                )}
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {items.map(item => (
                    <ItemCard key={item.id} item={item}
                      onDelete={(id) => handleDelete(id, true, slot)}
                      onToggle={(i) => handleToggle(i, true, slot)} />
                  ))}
                </div>
                {items.length < 4 ? (
                  <UploadPhotoForm
                    section={`hero_${slot}`}
                    onAdded={(item) => setHeroSlots(prev =>
                      prev.map(s => s.slot === slot ? { ...s, items: [...s.items, item] } : s)
                    )}
                  />
                ) : (
                  <p className="text-xs text-center py-2 rounded-lg" style={{ backgroundColor: 'rgba(232,96,60,0.08)', color: '#E8603C' }}>
                    Máximo 4 fotos por recuadro
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── BOLSOS ─── */}
      {tab === 'bolsos' && (
        <div>
          <p className="text-sm mb-4" style={{ color: '#7A5230' }}>
            Fotos que aparecen en la sección "Bolsos de Playa" del inicio.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
            {bolsos.map(item => (
              <ItemCard key={item.id} item={item}
                onDelete={(id) => handleDelete(id, false)}
                onToggle={(i) => handleToggle(i, false)} />
            ))}
          </div>
          <UploadPhotoForm
            section="bolsos"
            extraFields
            onAdded={(item) => setBolsos(prev => [...prev, item])}
          />
        </div>
      )}
    </div>
  )
}
