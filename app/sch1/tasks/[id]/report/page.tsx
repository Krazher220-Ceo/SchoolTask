'use client'

import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, Upload } from 'lucide-react'

export default function CreateReportPage() {
  const router = useRouter()
  const params = useParams()
  const taskId = params.id as string
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    description: '',
    photos: [] as string[],
    videos: [] as string[],
    links: [] as string[],
    timeSpent: '',
  })
  const [photoLinks, setPhotoLinks] = useState('')
  const [videoLinks, setVideoLinks] = useState('')
  const [linkUrls, setLinkUrls] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const photos = photoLinks.split(',').filter(l => l.trim())
      const videos = videoLinks.split(',').filter(l => l.trim())
      const links = linkUrls.split(',').filter(l => l.trim())

      const response = await fetch(`/api/tasks/${taskId}/reports`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          description: formData.description,
          photos,
          videos,
          links,
          timeSpent: formData.timeSpent ? parseInt(formData.timeSpent) : undefined,
        }),
      })

      if (response.ok) {
        router.push(`/sch1/tasks/${taskId}`)
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
            <Link href={`/sch1/tasks/${taskId}`} className="flex items-center space-x-2 text-gray-700 hover:text-primary-600">
              <ArrowLeft className="h-5 w-5" />
              <span>Назад</span>
            </Link>
            <h1 className="text-xl font-bold text-gray-900">Создать отчет</h1>
            <div className="w-24"></div>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-8 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Описание выполненной работы *
            </label>
            <textarea
              required
              rows={8}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Опишите, что было сделано, какие результаты достигнуты, какие трудности возникли..."
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Ссылки на фото (через запятую)
            </label>
            <input
              type="text"
              value={photoLinks}
              onChange={(e) => setPhotoLinks(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="https://example.com/photo1.jpg, https://example.com/photo2.jpg"
            />
            <p className="text-xs text-gray-500 mt-1">Максимум 10 фото</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Ссылки на видео (через запятую)
            </label>
            <input
              type="text"
              value={videoLinks}
              onChange={(e) => setVideoLinks(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="https://youtube.com/watch?v=..., https://drive.google.com/..."
            />
            <p className="text-xs text-gray-500 mt-1">Максимум 100 МБ на видео</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Дополнительные ссылки (через запятую)
            </label>
            <input
              type="text"
              value={linkUrls}
              onChange={(e) => setLinkUrls(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Google Drive, YouTube, другие ресурсы"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Затраченное время (минуты)
            </label>
            <input
              type="number"
              min="0"
              value={formData.timeSpent}
              onChange={(e) => setFormData({ ...formData, timeSpent: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="120"
            />
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <Link
              href={`/sch1/tasks/${taskId}`}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              Отмена
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition flex items-center disabled:opacity-50"
            >
              <Save className="h-4 w-4 mr-2" />
              {loading ? 'Отправка...' : 'Отправить отчет'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}


