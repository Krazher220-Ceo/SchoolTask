'use client'

import { useState, useEffect } from 'react'
import { AlertCircle, CheckCircle, FileText } from 'lucide-react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export function TermsAcceptance() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [show, setShow] = useState(false)
  const [accepted, setAccepted] = useState(false)

  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      // Проверяем, принял ли пользователь условия использования
      const termsAccepted = localStorage.getItem(`termsAccepted_${session.user.id}`)
      if (!termsAccepted) {
        setShow(true)
      }
    }
  }, [session, status])

  const handleAccept = async () => {
    if (!session?.user?.id) return

    try {
      // Сохраняем принятие условий
      localStorage.setItem(`termsAccepted_${session.user.id}`, 'true')
      localStorage.setItem(`termsAcceptedDate_${session.user.id}`, new Date().toISOString())
      
      // Можно также отправить на сервер для сохранения в БД
      // await fetch('/api/users/accept-terms', { method: 'POST' })
      
      setAccepted(true)
      setTimeout(() => {
        setShow(false)
      }, 2000)
    } catch (error) {
      console.error('Ошибка при принятии условий:', error)
    }
  }

  const handleDecline = () => {
    // При отказе перенаправляем на страницу выхода
    router.push('/api/auth/signout')
  }

  if (!show || status !== 'authenticated') return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <FileText className="h-6 w-6 text-primary-600" />
            <h2 className="text-2xl font-bold text-gray-900">
              Условия использования
            </h2>
          </div>

          {accepted ? (
            <div className="text-center py-8">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <p className="text-lg font-semibold text-gray-900">
                Спасибо! Условия приняты.
              </p>
            </div>
          ) : (
            <>
              <div className="mb-6 space-y-4 text-gray-700">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="font-semibold text-blue-900 mb-2">
                    Добро пожаловать в систему Школьного Парламента!
                  </p>
                  <p className="text-sm text-blue-800">
                    Пожалуйста, ознакомьтесь с условиями использования платформы перед началом работы.
                  </p>
                </div>

                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-900">Основные правила:</h3>
                  <ul className="list-disc list-inside space-y-2 text-sm text-gray-600 ml-4">
                    <li>Использование платформы только в образовательных целях</li>
                    <li>Соблюдение правил школы и этических норм</li>
                    <li>Ответственность за размещаемый контент</li>
                    <li>Запрет на распространение личной информации других пользователей</li>
                    <li>Соблюдение авторских прав</li>
                    <li>Запрет на использование платформы для незаконных целей</li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-900">Ваши права:</h3>
                  <ul className="list-disc list-inside space-y-2 text-sm text-gray-600 ml-4">
                    <li>Доступ к вашим данным и возможность их изменения</li>
                    <li>Право на удаление аккаунта</li>
                    <li>Конфиденциальность личной информации</li>
                  </ul>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-yellow-800">
                      <strong>Важно:</strong> Нарушение условий использования может привести к ограничению доступа к платформе.
                    </p>
                  </div>
                </div>

                <div className="text-sm text-gray-500">
                  Полный текст{' '}
                  <Link href="/terms" className="text-primary-600 hover:underline">
                    условий использования
                  </Link>{' '}
                  и{' '}
                  <Link href="/privacy" className="text-primary-600 hover:underline">
                    политики конфиденциальности
                  </Link>
                  .
                </div>
              </div>

              <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    required
                  />
                  <span className="text-sm text-gray-700">
                    Я прочитал и согласен с условиями использования
                  </span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 mt-6">
                <button
                  onClick={handleDecline}
                  className="px-6 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                >
                  Отклонить
                </button>
                <button
                  onClick={handleAccept}
                  className="px-6 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Принять условия
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

