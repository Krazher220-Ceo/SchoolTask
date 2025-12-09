'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Check, X, MessageCircle } from 'lucide-react'

export default function TelegramLinkPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [linking, setLinking] = useState(false)
  const [isLinked, setIsLinked] = useState(false)
  const [telegramInfo, setTelegramInfo] = useState<any>(null)
  const [botUsername, setBotUsername] = useState('')

  useEffect(() => {
    // Получаем информацию о привязке
    fetch('/api/telegram/link')
      .then(res => res.json())
      .then(data => {
        setIsLinked(data.isLinked)
        setTelegramInfo(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))

    // Получаем username бота из env (если доступен)
    // В реальном приложении это должно быть в env переменных
    setBotUsername(process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || 'your_bot_username')
  }, [])

  const handleLink = async () => {
    setLinking(true)
    try {
      // Открываем Telegram бота
      const botUrl = `https://t.me/${botUsername}?start=link`
      window.open(botUrl, '_blank')
      
      // Показываем инструкцию
      alert('Откройте бота в Telegram и отправьте команду /link. Затем вернитесь сюда и нажмите "Проверить привязку".')
    } catch (error) {
      alert('Ошибка при открытии Telegram')
    } finally {
      setLinking(false)
    }
  }

  const handleCheck = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/telegram/link')
      const data = await res.json()
      setIsLinked(data.isLinked)
      setTelegramInfo(data)
      if (data.isLinked) {
        alert('Telegram аккаунт успешно привязан!')
      } else {
        alert('Привязка не найдена. Убедитесь, что вы отправили команду /link боту.')
      }
    } catch (error) {
      alert('Ошибка при проверке привязки')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Загрузка...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Link href="/sch1/dashboard" className="flex items-center text-gray-700 hover:text-primary-600">
              <ArrowLeft className="h-5 w-5 mr-2" />
              Назад
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="text-center mb-8">
            <MessageCircle className="h-16 w-16 text-primary-600 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Привязка Telegram</h1>
            <p className="text-gray-600">
              Привяжите свой Telegram аккаунт для получения уведомлений
            </p>
          </div>

          {isLinked ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
              <Check className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-green-900 mb-2">
                Telegram аккаунт привязан
              </h2>
              {telegramInfo?.telegramUsername && (
                <p className="text-green-700">
                  @{telegramInfo.telegramUsername}
                </p>
              )}
              <p className="text-green-600 mt-2">
                Вы будете получать уведомления о задачах и отчетах
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="font-semibold text-blue-900 mb-3">Инструкция:</h3>
                <ol className="list-decimal list-inside space-y-2 text-blue-800">
                  <li>Нажмите кнопку &quot;Привязать Telegram&quot; ниже</li>
                  <li>Откроется Telegram бот</li>
                  <li>Отправьте команду /link боту</li>
                  <li>Вернитесь сюда и нажмите &quot;Проверить привязку&quot;</li>
                </ol>
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={handleLink}
                  disabled={linking}
                  className="flex-1 bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition disabled:opacity-50 flex items-center justify-center"
                >
                  <MessageCircle className="h-5 w-5 mr-2" />
                  {linking ? 'Открытие...' : 'Привязать Telegram'}
                </button>
                <button
                  onClick={handleCheck}
                  disabled={loading}
                  className="flex-1 bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition disabled:opacity-50"
                >
                  {loading ? 'Проверка...' : 'Проверить привязку'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

