'use client'

import { useState, useEffect } from 'react'
import { X, Cookie } from 'lucide-react'
import Link from 'next/link'

export function CookieConsent() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    // Проверяем, принял ли пользователь куки
    const cookieConsent = localStorage.getItem('cookieConsent')
    if (!cookieConsent) {
      setShow(true)
    }
  }, [])

  const handleAccept = () => {
    localStorage.setItem('cookieConsent', 'accepted')
    localStorage.setItem('cookieConsentDate', new Date().toISOString())
    setShow(false)
  }

  const handleReject = () => {
    localStorage.setItem('cookieConsent', 'rejected')
    localStorage.setItem('cookieConsentDate', new Date().toISOString())
    setShow(false)
  }

  if (!show) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-white border-t border-gray-200 shadow-lg">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3 flex-1">
          <Cookie className="h-6 w-6 text-primary-600 mt-1 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-1">
              Мы используем файлы cookie
            </h3>
            <p className="text-sm text-gray-600">
              Мы используем файлы cookie для улучшения работы сайта, анализа трафика и персонализации контента.
              Продолжая использовать сайт, вы соглашаетесь с использованием cookie.{' '}
              <Link href="/privacy" className="text-primary-600 hover:underline">
                Политика конфиденциальности
              </Link>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={handleReject}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
          >
            Отклонить
          </button>
          <button
            onClick={handleAccept}
            className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition"
          >
            Принять
          </button>
        </div>
      </div>
    </div>
  )
}

