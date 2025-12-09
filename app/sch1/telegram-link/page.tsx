'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Check, X, MessageCircle, Key, User, RefreshCw } from 'lucide-react'

export default function TelegramLinkPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [linking, setLinking] = useState(false)
  const [isLinked, setIsLinked] = useState(false)
  const [telegramInfo, setTelegramInfo] = useState<any>(null)
  const [botUsername, setBotUsername] = useState('')
  const [telegramId, setTelegramId] = useState('')
  const [code, setCode] = useState('')
  const [generatingCode, setGeneratingCode] = useState(false)
  const [verifyingCode, setVerifyingCode] = useState(false)
  const [codeGenerated, setCodeGenerated] = useState(false)
  const [error, setError] = useState('')

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
    setBotUsername(process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || 'sch_ly1_bot')
  }, [])

  const handleGenerateCode = async () => {
    if (!telegramId.trim()) {
      setError('Введите Telegram ID')
      return
    }

    setGeneratingCode(true)
    setError('')
    try {
      const res = await fetch('/api/telegram/link', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ telegramId: telegramId.trim() }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Ошибка при генерации кода')
        return
      }

      setCodeGenerated(true)
      // Не показываем alert, показываем сообщение в UI
    } catch (error) {
      setError('Ошибка при генерации кода')
    } finally {
      setGeneratingCode(false)
    }
  }

  const handleVerifyCode = async () => {
    if (!code.trim() || code.trim().length !== 6) {
      setError('Введите 6-значный код')
      return
    }

    setVerifyingCode(true)
    setError('')
    try {
      const res = await fetch('/api/telegram/link', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.trim() }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Ошибка при подтверждении кода')
        return
      }

      // Обновляем информацию о привязке
      const linkRes = await fetch('/api/telegram/link')
      const linkData = await linkRes.json()
      setIsLinked(linkData.isLinked)
      setTelegramInfo(linkData)
      setCodeGenerated(false)
      setCode('')
      setTelegramId('')
      alert('Telegram аккаунт успешно привязан!')
    } catch (error) {
      setError('Ошибка при подтверждении кода')
    } finally {
      setVerifyingCode(false)
    }
  }

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
                <h3 className="font-semibold text-blue-900 mb-3">Способ 1: Через ID профиля и код</h3>
                <ol className="list-decimal list-inside space-y-2 text-blue-800 mb-4">
                  <li>Откройте бота @{botUsername} в Telegram</li>
                  <li>Отправьте боту ваш ID профиля (можно скопировать из адресной строки браузера)</li>
                  <li>Бот отправит вам 6-значный код</li>
                  <li>Введите код ниже и нажмите &quot;Подтвердить&quot;</li>
                </ol>
                <div className="space-y-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-blue-900 mb-2">
                      Telegram ID (можно получить у бота)
                    </label>
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={telegramId}
                        onChange={(e) => setTelegramId(e.target.value)}
                        placeholder="Введите ваш Telegram ID"
                        className="flex-1 px-4 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={codeGenerated}
                      />
                      <button
                        onClick={handleGenerateCode}
                        disabled={generatingCode || codeGenerated}
                        className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition disabled:opacity-50 flex items-center"
                      >
                        <Key className="h-4 w-4 mr-2" />
                        {generatingCode ? 'Генерация...' : 'Получить код'}
                      </button>
                    </div>
                  </div>
                  {codeGenerated && (
                    <div className="space-y-3">
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <p className="text-green-800 text-sm flex items-center">
                          <Check className="h-4 w-4 mr-2" />
                          Код отправлен в Telegram! Проверьте сообщения от бота @{botUsername}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-blue-900 mb-2">
                          Код подтверждения (6 цифр)
                        </label>
                        <div className="flex space-x-2">
                          <input
                            type="text"
                            value={code}
                            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                            placeholder="000000"
                            maxLength={6}
                            className="flex-1 px-4 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-2xl tracking-widest"
                          />
                          <button
                            onClick={handleVerifyCode}
                            disabled={verifyingCode || code.length !== 6}
                            className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition disabled:opacity-50 flex items-center"
                          >
                            <Check className="h-4 w-4 mr-2" />
                            {verifyingCode ? 'Проверка...' : 'Подтвердить'}
                          </button>
                        </div>
                      </div>
                      <button
                        onClick={handleGenerateCode}
                        disabled={generatingCode}
                        className="w-full bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition disabled:opacity-50 flex items-center justify-center text-sm"
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        {generatingCode ? 'Отправка...' : 'Отправить код повторно'}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-3">Способ 2: Через команду /link</h3>
                <ol className="list-decimal list-inside space-y-2 text-gray-700 mb-4">
                  <li>Нажмите кнопку &quot;Открыть бота&quot; ниже</li>
                  <li>Отправьте команду /link боту</li>
                  <li>Вернитесь сюда и нажмите &quot;Проверить привязку&quot;</li>
                </ol>
                <div className="flex space-x-4">
                  <button
                    onClick={handleLink}
                    disabled={linking}
                    className="flex-1 bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition disabled:opacity-50 flex items-center justify-center"
                  >
                    <MessageCircle className="h-5 w-5 mr-2" />
                    {linking ? 'Открытие...' : 'Открыть бота'}
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

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-800 flex items-center">
                    <X className="h-5 w-5 mr-2" />
                    {error}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

