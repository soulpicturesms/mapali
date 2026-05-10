'use client'
import { useState, useEffect, useCallback } from 'react'

const STORAGE_KEY = 'mapali_orders_seen'

export function useOrderNotifications(enabled: boolean) {
  const [count, setCount] = useState(0)

  const check = useCallback(async () => {
    if (!enabled) return
    const since = localStorage.getItem(STORAGE_KEY) ?? '0'
    try {
      const res = await fetch(`/api/orders/notifications?since=${since}`, { cache: 'no-store' })
      if (res.ok) {
        const data = await res.json()
        setCount(data.count ?? 0)
      }
    } catch {}
  }, [enabled])

  useEffect(() => {
    if (!enabled) return
    check()
    const interval = setInterval(check, 30_000)
    const onFocus = () => check()
    const onSeen = () => setCount(0)
    window.addEventListener('focus', onFocus)
    window.addEventListener('mapali_orders_seen', onSeen)
    return () => {
      clearInterval(interval)
      window.removeEventListener('focus', onFocus)
      window.removeEventListener('mapali_orders_seen', onSeen)
    }
  }, [check, enabled])

  return count
}
