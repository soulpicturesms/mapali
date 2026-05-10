'use client'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { Trash2, Eye, EyeOff, Plus, Upload, Edit2, Check, X } from 'lucide-react'

interface GalleryPhoto {
  id: string
  url: string
  label: string
  order: number
  active: boolean
}

export default function GaleriaAdmin({ photos: initial }: { photos: GalleryPhoto[] }) {
  const [photos, setPhotos] = useState(initial)
  const [uploading, setUploading] = useState(false)
  const [newLabel, setNewLabel] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [previewUrl, setPreviewUrl] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editLabel, setEditLabel] = useState('')
  const [editUrl, setEditUrl] = useState('')
  const [editUploading, setEditUploading] = useState(false)

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, forEdit = false) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (forEdit) setEditUploading(true); else setUploading(true)
    const fd = new FormData()
    fd.append('file', file)
    const res = await fetch('/api/upload', { method: 'POST', body: fd })
    const data = await res.json()
    if (forEdit) setEditUploading(false); else setUploading(false)
    const url = data.url || data.urls?.[0]
    if (url) { if (forEdit) setEditUrl(url); else setPreviewUrl(url) }
  }

  const handleAdd = async () => {
    if (!previewUrl || !newLabel.trim()) { toast.error('Cargá una foto y poné un título'); return }
    const res = await fetch('/api/gallery', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: previewUrl, label: newLabel.trim() }),
    })
    if (res.ok) {
      const newPhoto = await res.json()
      setPhotos(prev => [...prev, { ...newPhoto, active: true }])
      toast.success('Foto agregada ✅')
      setPreviewUrl(''); setNewLabel(''); setShowAdd(false)
    } else { toast.error('Error al agregar foto') }
  }

  const startEdit = (photo: GalleryPhoto) => {
    setEditingId(photo.id)
    setEditLabel(photo.label)
    setEditUrl(photo.url)
  }

  const cancelEdit = () => { setEditingId(null); setEditLabel(''); setEditUrl('') }

  const saveEdit = async (photo: GalleryPhoto) => {
    const res = await fetch(`/api/gallery/${photo.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ label: editLabel, url: editUrl }),
    })
    if (res.ok) {
      setPhotos(prev => prev.map(p => p.id === photo.id ? { ...p, label: editLabel, url: editUrl } : p))
      toast.success('Foto actualizada ✅')
      cancelEdit()
    } else { toast.error('Error al guardar') }
  }

  const handleToggle = async (photo: GalleryPhoto) => {
    const res = await fetch(`/api/gallery/${photo.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: !photo.active }),
    })
    if (res.ok) {
      setPhotos(prev => prev.map(p => p.id === photo.id ? { ...p, active: !p.active } : p))
      toast.success(photo.active ? 'Foto ocultada' : 'Foto visible')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar esta foto de la galería?')) return
    const res = await fetch(`/api/gallery/${id}`, { method: 'DELETE' })
    if (res.ok) { setPhotos(prev => prev.filter(p => p.id !== id)); toast.success('Foto eliminada') }
  }

  return (
    <div className="p-6 max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-black" style={{ color: '#2C1A0E' }}>Galería del Inicio 🌺</h1>
          <p className="text-sm mt-1" style={{ color: '#7A5230' }}>
            Sección "Cada pieza, una historia" — {photos.filter(p => p.active).length} fotos activas
          </p>
        </div>
        <button onClick={() => setShowAdd(!showAdd)}
          className="btn-tropical px-5 py-2.5 rounded-full text-white font-bold flex items-center gap-2">
          <Plus size={18} /> Agregar foto
        </button>
      </div>

      {/* Add photo panel */}
      {showAdd && (
        <div className="bg-white rounded-2xl p-6 mb-6 shadow-md" style={{ border: '2px solid rgba(245,166,35,0.3)' }}>
          <h2 className="font-bold text-lg mb-4" style={{ color: '#2C1A0E' }}>Nueva foto para la galería</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <label className="flex flex-col items-center justify-center h-40 rounded-xl cursor-pointer border-2 border-dashed"
              style={{ borderColor: 'rgba(245,166,35,0.5)', backgroundColor: '#FFFBF4' }}>
              {uploading ? <p className="text-sm" style={{ color: '#14B8A6' }}>Subiendo...</p>
                : previewUrl ? <img src={previewUrl} alt="preview" className="w-full h-full object-cover rounded-xl" />
                : <><Upload size={28} style={{ color: '#F5A623' }} /><p className="text-sm mt-2" style={{ color: '#7A5230' }}>Subir foto</p></>}
              <input type="file" accept="image/*" className="hidden" onChange={e => handleUpload(e, false)} />
            </label>
            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-semibold mb-1" style={{ color: '#2C1A0E' }}>Título</label>
                <input type="text" value={newLabel} onChange={e => setNewLabel(e.target.value)}
                  placeholder="Ej: Collar Tropical..." className="input-mapali w-full" />
              </div>
              <div className="flex gap-3 mt-auto">
                <button onClick={() => setShowAdd(false)} className="flex-1 py-2 rounded-xl border font-semibold text-sm"
                  style={{ borderColor: '#14B8A6', color: '#14B8A6' }}>Cancelar</button>
                <button onClick={handleAdd} className="flex-1 btn-tropical py-2 rounded-xl text-white font-bold text-sm">
                  Agregar a galería
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Gallery grid */}
      {photos.length === 0 ? (
        <div className="text-center py-20">
          <span className="text-5xl">🖼️</span>
          <p className="mt-4 text-lg font-semibold" style={{ color: '#2C1A0E' }}>No hay fotos en la galería</p>
          <p className="mt-2" style={{ color: '#7A5230' }}>Agregá fotos para que aparezcan en el inicio</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {photos.map((photo, i) => (
            <div key={photo.id} className="relative group rounded-2xl overflow-hidden shadow-md"
              style={{
                border: photo.active ? '2px solid rgba(20,184,166,0.4)' : '2px solid rgba(0,0,0,0.1)',
                opacity: photo.active ? 1 : 0.55,
              }}>

              {/* Edit mode */}
              {editingId === photo.id ? (
                <div className="p-3 space-y-2">
                  <label className="block rounded-lg overflow-hidden cursor-pointer relative" style={{ height: 120 }}>
                    <img src={editUrl || photo.url} alt="" className="w-full h-full object-cover" />
                    {editUploading && (
                      <div className="absolute inset-0 flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                        <span className="text-white text-xs">Subiendo...</span>
                      </div>
                    )}
                    <div className="absolute bottom-1 right-1 bg-black/60 text-white text-xs px-1.5 py-0.5 rounded flex items-center gap-1">
                      <Upload size={10} /> Cambiar
                    </div>
                    <input type="file" accept="image/*" className="hidden" onChange={e => handleUpload(e, true)} />
                  </label>
                  <input type="text" value={editLabel} onChange={e => setEditLabel(e.target.value)}
                    className="input-mapali w-full text-xs" placeholder="Título..." />
                  <div className="flex gap-1.5">
                    <button onClick={() => saveEdit(photo)}
                      className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-white text-xs font-bold"
                      style={{ backgroundColor: '#14B8A6' }}>
                      <Check size={12} /> Guardar
                    </button>
                    <button onClick={cancelEdit}
                      className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-bold border"
                      style={{ borderColor: '#E8603C', color: '#E8603C' }}>
                      <X size={12} /> Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="aspect-square">
                    <img src={photo.url} alt={photo.label} className="w-full h-full object-cover" />
                  </div>
                  <div className="p-2">
                    <p className="text-xs font-semibold truncate" style={{ color: '#2C1A0E' }}>{photo.label}</p>
                    <p className="text-xs" style={{ color: '#7A5230' }}>#{i + 1} · {photo.active ? 'Visible' : 'Oculta'}</p>
                  </div>
                  {/* Actions */}
                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => startEdit(photo)}
                      className="w-8 h-8 rounded-full flex items-center justify-center shadow-md"
                      style={{ backgroundColor: '#2C1A0E' }} title="Editar">
                      <Edit2 size={13} color="white" />
                    </button>
                    <button onClick={() => handleToggle(photo)}
                      className="w-8 h-8 rounded-full flex items-center justify-center shadow-md"
                      style={{ backgroundColor: photo.active ? '#F5A623' : '#14B8A6' }}
                      title={photo.active ? 'Ocultar' : 'Mostrar'}>
                      {photo.active ? <EyeOff size={13} color="white" /> : <Eye size={13} color="white" />}
                    </button>
                    <button onClick={() => handleDelete(photo.id)}
                      className="w-8 h-8 rounded-full flex items-center justify-center shadow-md"
                      style={{ backgroundColor: '#E8603C' }} title="Eliminar">
                      <Trash2 size={13} color="white" />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
