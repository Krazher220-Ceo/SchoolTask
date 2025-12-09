'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, MessageCircle, CheckCircle, XCircle, RefreshCw, Settings } from 'lucide-react'

export default function TelegramSetupPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [settingUp, setSettingUp] = useState(false)
  const [webhookInfo, setWebhookInfo] = useState<any>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchWebhookInfo()
  }, [])

  const fetchWebhookInfo = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/telegram/setup-webhook')
      const data = await res.json()
      
      if (res.ok) {
        setWebhookInfo(data.webhookInfo)
      } else {
        setError(data.error || 'Ошибка получения информации о webhook')
      }
    } catch (err) {
      setError('Ошибка подключения к серверу')
    } finally {
      setLoading(false)
    }
  }

  const setupWebhook = async () => {
    setSettingUp(true)
    setError('')
    try {
      const res = await fetch('/api/telegram/setup-webhook', {
        method: 'POST',
      })
      const data = await res.json()
      
      if (res.ok) {
        setWebhookInfo(data.webhookInfo)
        alert('✅ Webhook успешно настроен!')
      } else {
        setError(data.error || 'Ошибка настройки webhook')
      }
    } catch (err) {
      setError('Ошибка подключения к серверу')
    } finally {
      setSettingUp(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Link href="/sch1/admin" className="flex items-center text-gray-700 hover:text-primary-600">
              <ArrowLeft className="h-5 w-5 mr-2" />
              Назад
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="text-center mb-8">
            <MessageCircle className="h-16 w-16 text-primary-600 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Настройка Telegram бота</h1>
            <p className="text-gray-600">
              Управление webhook для Telegram бота @sch_ly1_bot
            </p>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="text-gray-600">Загрузка информации...</div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Статус webhook */}
              <div className={`border rounded-lg p-6 ${
                webhookInfo?.url 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-red-50 border-red-200'
              }`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    {webhookInfo?.url ? (
                      <CheckCircle className="h-6 w-6 text-green-600 mr-2" />
                    ) : (
                      <XCircle className="h-6 w-6 text-red-600 mr-2" />
                    )}
                    <h3 className="text-lg font-semibold">
                      {webhookInfo?.url ? 'Webhook настроен' : 'Webhook не настроен'}
                    </h3>
                  </div>
                  <button
                    onClick={fetchWebhookInfo}
                    className="text-primary-600 hover:text-primary-700 flex items-center"
                  >
                    <RefreshCw className="h-4 w-4 mr-1" />
                    Обновить
                  </button>
                </div>

                {webhookInfo?.url ? (
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-semibold">URL:</span>{' '}
                      <code className="bg-white px-2 py-1 rounded text-xs">{webhookInfo.url}</code>
                    </div>
                    {webhookInfo.pending_update_count > 0 && (
                      <div className="text-yellow-700">
                        ⚠️ Ожидающих обновлений: {webhookInfo.pending_update_count}
                      </div>
                    )}
                    {webhookInfo.last_error_date && (
                      <div className="text-red-700">
                        ❌ Последняя ошибка: {new Date(webhookInfo.last_error_date * 1000).toLocaleString('ru-RU')}
                        {webhookInfo.last_error_message && (
                          <div className="text-xs mt-1">{webhookInfo.last_error_message}</div>
                        )}
                      </div>
                    )}
                    {!webhookInfo.last_error_date && (
                      <div className="text-green-700">
                        ✅ Webhook работает корректно
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-red-700">
                    Бот находится в офлайне. Настройте webhook для активации.
                  </div>
                )}
              </div>

              {/* Действия */}
              <div className="flex space-x-4">
                <button
                  onClick={setupWebhook}
                  disabled={settingUp}
                  className="flex-1 bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition disabled:opacity-50 flex items-center justify-center"
                >
                  <Settings className="h-5 w-5 mr-2" />
                  {settingUp ? 'Настройка...' : 'Настроить Webhook'}
                </button>
                <button
                  onClick={fetchWebhookInfo}
                  disabled={loading}
                  className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition disabled:opacity-50 flex items-center justify-center"
                >
                  <RefreshCw className="h-5 w-5 mr-2" />
                  Обновить статус
                </button>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-800">{error}</p>
                </div>
              )}

              {/* Инструкция */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="font-semibold text-blue-900 mb-3">Инструкция:</h3>
                <ol className="list-decimal list-inside space-y-2 text-blue-800 text-sm">
                  <li>Убедитесь, что в переменных окружения Vercel установлены:
                    <ul className="list-disc list-inside ml-4 mt-1">
                      <li><code>TELEGRAM_BOT_TOKEN</code> - токен бота от @BotFather</li>
                      <li><code>TELEGRAM_WEBHOOK_URL</code> - URL вида: <code>https://sch1.vercel.app/api/telegram/webhook</code></li>
                    </ul>
                  </li>
                  <li>Нажмите кнопку &quot;Настроить Webhook&quot; выше</li>
                  <li>Проверьте статус бота в Telegram - он должен стать онлайн</li>
                </ol>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

