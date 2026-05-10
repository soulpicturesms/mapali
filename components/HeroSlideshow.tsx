'use client'
import { useState, useEffect } from 'react'

interface Slide { url: string; label?: string | null }
interface SlotData { slot: number; slides: Slide[] }

const BORDERS = [
  'rgba(20,184,166,0.6)',
  'rgba(245,166,35,0.6)',
  'rgba(232,96,60,0.6)',
  'rgba(20,184,166,0.6)',
]
const HEIGHTS = [220, 160, 160, 220]

function SlotCarousel({ slides, h, border }: { slides: Slide[]; h: number; border: string }) {
  const [active, setActive] = useState(0)

  useEffect(() => {
    if (slides.length <= 1) return
    const timer = setInterval(() => {
      setActive(prev => (prev + 1) % slides.length)
    }, 4000)
    return () => clearInterval(timer)
  }, [slides.length])

  return (
    <div className="rounded-2xl overflow-hidden shadow-2xl relative group"
      style={{ border: `3px solid ${border}`, height: h }}>

      {/* Todas las imágenes apiladas — crossfade con opacity */}
      {slides.map((slide, i) => (
        <img
          key={slide.url + i}
          src={slide.url}
          alt={slide.label ?? 'Producto'}
          className="absolute inset-0 w-full h-full object-cover"
          style={{
            opacity: i === active ? 1 : 0,
            transition: 'opacity 1s ease-in-out',
          }}
        />
      ))}

      {slides.length === 0 && (
        <div className="w-full h-full flex items-center justify-center text-5xl"
          style={{ backgroundColor: 'rgba(20,184,166,0.08)' }}>
          📿
        </div>
      )}

      {/* Dots */}
      {slides.length > 1 && (
        <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5 pointer-events-none z-10">
          {slides.map((_, i) => (
            <div key={i} className="rounded-full"
              style={{
                width: i === active ? 16 : 6,
                height: 6,
                backgroundColor: i === active ? 'white' : 'rgba(255,255,255,0.45)',
                transition: 'width 0.4s ease, background-color 0.4s ease',
              }} />
          ))}
        </div>
      )}

      {/* Label hover */}
      {slides[active]?.label && (
        <div className="absolute bottom-0 left-0 right-0 p-2.5 opacity-0 group-hover:opacity-100 z-10"
          style={{
            background: 'linear-gradient(transparent, rgba(44,26,14,0.85))',
            transition: 'opacity 0.3s ease',
          }}>
          <p className="text-white text-xs font-bold">{slides[active].label}</p>
        </div>
      )}
    </div>
  )
}

export default function HeroSlideshow({ slots }: { slots: SlotData[] }) {
  return (
    <div className="flex-1 w-full max-w-sm lg:max-w-none">
      <div className="text-center mb-4">
        <span className="text-white text-xs font-bold uppercase tracking-[0.2em] px-4 py-1.5 rounded-full"
          style={{ backgroundColor: 'rgba(245,166,35,0.25)', border: '1px solid rgba(245,166,35,0.5)', color: '#F5A623' }}>
          ✨ Novedades
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3" style={{ maxWidth: 460, margin: '0 auto' }}>
        {[0, 1, 2, 3].map((slot) => (
          <div key={slot} style={{ paddingTop: slot === 1 || slot === 3 ? 28 : 0 }}>
            <SlotCarousel
              slides={slots[slot]?.slides ?? []}
              h={HEIGHTS[slot]}
              border={BORDERS[slot]}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
