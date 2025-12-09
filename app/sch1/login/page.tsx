'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Mail, Lock, AlertCircle } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [loginOrEmail, setLoginOrEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPasswordReset, setShowPasswordReset] = useState(false)
  const [resetCode, setResetCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [resetLoading, setResetLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await signIn('credentials', {
        email: loginOrEmail, // Может быть email или login
        password,
        redirect: false,
      })

      if (result?.error) {
        setError('Неверный логин/email или пароль')
      } else {
        router.push('/sch1/dashboard')
        router.refresh()
      }
    } catch (err) {
      setError('Произошла ошибка при входе')
    } finally {
      setLoading(false)
    }
  }

  const handleRequestResetCode = async () => {
    if (!loginOrEmail) {
      setError('Введите логин или email')
      return
    }

    setResetLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth/reset-password/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ loginOrEmail }),
      })

      if (res.ok) {
        alert('Код восстановления отправлен на ваш email или Telegram')
        setShowPasswordReset(true)
      } else {
        const error = await res.json()
        setError(error.error || 'Ошибка при запросе кода')
      }
    } catch (err) {
      setError('Ошибка при запросе кода восстановления')
    } finally {
      setResetLoading(false)
    }
  }

  const handleResetPassword = async () => {
    if (!resetCode || !newPassword || newPassword.length < 8) {
      setError('Введите код и новый пароль (минимум 8 символов)')
      return
    }

    setResetLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth/reset-password/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          loginOrEmail,
          code: resetCode,
          newPassword,
        }),
      })

      if (res.ok) {
        alert('Пароль успешно изменен! Теперь войдите с новым паролем.')
        setShowPasswordReset(false)
        setResetCode('')
        setNewPassword('')
      } else {
        const error = await res.json()
        setError(error.error || 'Ошибка при сбросе пароля')
      }
    } catch (err) {
      setError('Ошибка при сбросе пароля')
    } finally {
      setResetLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <Link
          href="/sch1"
          className="inline-flex items-center text-gray-600 hover:text-primary-600 mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Назад
        </Link>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Вход в систему</h1>
            <p className="text-gray-600">Войдите в свой аккаунт парламента</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center">
              <AlertCircle className="h-5 w-5 mr-2" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="loginOrEmail" className="block text-sm font-semibold text-gray-700 mb-2">
                Логин или Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  id="loginOrEmail"
                  value={loginOrEmail}
                  onChange={(e) => setLoginOrEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="логин или email@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                Пароль
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Вход...' : 'Войти'}
            </button>

            <div className="mt-4 space-y-2 text-center">
              <button
                type="button"
                onClick={handleRequestResetCode}
                disabled={resetLoading || !loginOrEmail}
                className="text-primary-600 hover:text-primary-700 text-sm font-medium disabled:opacity-50"
              >
                Забыли пароль? Восстановить через код
              </button>
              <div>
                <Link
                  href="/register"
                  className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                >
                  Нет аккаунта? Подать заявку на регистрацию
                </Link>
              </div>
            </div>

            {showPasswordReset && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-4">
                <h3 className="font-semibold text-blue-900">Восстановление пароля</h3>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Код восстановления
                  </label>
                  <input
                    type="text"
                    value={resetCode}
                    onChange={(e) => setResetCode(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Введите код из email/Telegram"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Новый пароль
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Минимум 8 символов"
                  />
                </div>
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={handleResetPassword}
                    disabled={resetLoading}
                    className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                  >
                    {resetLoading ? 'Обработка...' : 'Изменить пароль'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowPasswordReset(false)
                      setResetCode('')
                      setNewPassword('')
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                  >
                    Отмена
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  )
}

