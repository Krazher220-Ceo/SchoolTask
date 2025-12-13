'use client'

import { useEffect } from 'react'

export default function PWARegister() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('Service Worker зарегистрирован:', registration)
        })
        .catch((error) => {
          console.error('Ошибка регистрации Service Worker:', error)
        })
    }
  }, [])

  return null
}

