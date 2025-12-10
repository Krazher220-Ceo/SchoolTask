'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Upload, Image as ImageIcon } from 'lucide-react'

export default function CreateStudentReportPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    type: 'GRADE_PHOTO',
    subject: '',
    grade: '',
    description: '',
    photoUrl: '',
  })
  const [preview, setPreview] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // В реальном приложении здесь будет загрузка на сервер
      // Пока используем FileReader для превью
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result as string)
        setFormData({ ...formData, photoUrl: reader.result as string })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/student-reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          grade: formData.grade ? parseInt(formData.grade) : undefined,
        }),
      })

      if (response.ok) {
        router.push('/sch1/students')
        router.refresh()
      } else {
        const error = await response.json()
        alert(error.error || 'Ошибка при создании отчета')
      }
    } catch (error) {
      alert('Ошибка при создании отчета')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/sch1/students" className="flex items-center space-x-2 text-gray-700 hover:text-primary-600">
              <ArrowLeft className="h-5 w-5" />
              <span>Назад</span>
            </Link>
            <h1 className="text-xl font-bold text-gray-900">Загрузить фото балла</h1>
            <div className="w-24"></div>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-8 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Тип отчета *
            </label>
            <select
              required
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="GRADE_PHOTO">Балл за предмет</option>
              <option value="SOR">СОР (Суммативное оценивание)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Предмет *
            </label>
            <input
              type="text"
              required
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              placeholder="Например: Математика, Физика, История"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Балл (0-100) *
            </label>
            <input
              type="number"
              required
              min="0"
              max="100"
              value={formData.grade}
              onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              placeholder="10"
            />
            <p className="text-xs text-gray-500 mt-1">
              Вы получите: {formData.grade ? Math.max(0, parseInt(formData.grade) - 1) : 0} EP
              {formData.grade && ` (${formData.grade} - 1, минус 10%)`}
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Фото балла *
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                id="photo-upload"
                required
              />
              <label
                htmlFor="photo-upload"
                className="cursor-pointer flex flex-col items-center"
              >
                {preview ? (
                  <Image 
                    src={preview} 
                    alt="Preview" 
                    width={800} 
                    height={400} 
                    className="max-w-full max-h-64 rounded-lg mb-4 object-contain"
                    loading="lazy"
                    quality={85}
                  />
                ) : (
                  <>
                    <Upload className="h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-gray-600 mb-2">Нажмите для загрузки фото</p>
                    <p className="text-sm text-gray-500">Или отправьте фото через Telegram бота</p>
                  </>
                )}
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Описание (опционально)
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              placeholder="Дополнительная информация..."
            />
          </div>

          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
            <p className="text-sm text-blue-700">
              💡 <strong>Совет:</strong> Вы также можете отправить фото через Telegram бота для более быстрой обработки!
            </p>
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <Link
              href="/sch1/students"
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              Отмена
            </Link>
            <button
              type="submit"
              disabled={loading || !preview}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition flex items-center disabled:opacity-50"
            >
              <ImageIcon className="h-4 w-4 mr-2" />
              {loading ? 'Отправка...' : 'Отправить на проверку'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

