'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, User, Mail, Phone, Key, BookOpen } from 'lucide-react'

export default function RegisterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    login: '',
    bilimClassLogin: '',
    class: '',
    classLetter: '',
  })

  const handleBilimClassChange = (value: string) => {
    setFormData({
      ...formData,
      bilimClassLogin: value,
      // Автоматически заполняем логин, если он пустой или совпадает со старым bilimClassLogin
      login: formData.login === formData.bilimClassLogin || !formData.login ? value : formData.login,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch('/api/registration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          bilimClassLogin: formData.bilimClassLogin || null,
          class: formData.class || null,
          classLetter: formData.classLetter || null,
        }),
      })

      const data = await res.json()

      if (res.ok) {
        alert('Заявка успешно подана! Ожидайте рассмотрения администратором. Вы получите уведомление на указанный email.')
        router.push('/sch1/login')
      } else {
        alert(data.error || 'Ошибка при подаче заявки')
      }
    } catch (error) {
      alert('Ошибка при подаче заявки')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <div className="mb-6">
          <Link href="/sch1/login" className="inline-flex items-center text-gray-600 hover:text-primary-600 mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Назад к входу
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Регистрация</h1>
          <p className="text-gray-600">Подайте заявку на регистрацию в системе</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <User className="h-4 w-4 inline mr-1" />
              ФИО *
            </label>
            <input
              type="text"
              required
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              placeholder="Иванов Иван Иванович"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <Phone className="h-4 w-4 inline mr-1" />
              Телефон *
            </label>
            <input
              type="tel"
              required
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+7 700 123 45 67"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <Mail className="h-4 w-4 inline mr-1" />
              Email *
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="example@email.com"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <BookOpen className="h-4 w-4 inline mr-1" />
              Логин от Bilim class (если есть)
            </label>
            <input
              type="text"
              value={formData.bilimClassLogin}
              onChange={(e) => handleBilimClassChange(e.target.value)}
              placeholder="Ваш логин от Bilim class"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              Если указан, логин заполнится автоматически
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <Key className="h-4 w-4 inline mr-1" />
              Логин *
            </label>
            <input
              type="text"
              required
              minLength={3}
              value={formData.login}
              onChange={(e) => setFormData({ ...formData, login: e.target.value })}
              placeholder="username"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              Минимум 3 символа. Можно изменить, если указан Bilim class логин.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Класс
              </label>
              <input
                type="text"
                value={formData.class}
                onChange={(e) => setFormData({ ...formData, class: e.target.value })}
                placeholder="9"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Литер
              </label>
              <input
                type="text"
                value={formData.classLetter}
                onChange={(e) => setFormData({ ...formData, classLetter: e.target.value })}
                placeholder="Д"
                maxLength={1}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Без кавычек
              </p>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition disabled:opacity-50 font-semibold"
          >
            {loading ? 'Отправка...' : 'Подать заявку'}
          </button>

          <p className="text-xs text-center text-gray-500">
            После подачи заявки администратор рассмотрит её и создаст ваш аккаунт.
            Вы получите уведомление на указанный email.
          </p>
        </form>
      </div>
    </div>
  )
}

