import Link from 'next/link'
import { ArrowLeft, Mail, MessageCircle, Clock, MapPin } from 'lucide-react'

export default function ContactsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <nav className="bg-white/80 backdrop-blur-sm shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-2 text-gray-700 hover:text-primary-600">
              <ArrowLeft className="h-5 w-5" />
              <span>Назад</span>
            </Link>
            <Link href="/" className="text-xl font-bold text-gray-900">Алихан</Link>
            <div className="w-24"></div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">Контакты</h1>
          <p className="text-xl text-gray-600">
            Свяжитесь со мной или с парламентом
          </p>
        </div>

        {/* Контактная информация */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <Mail className="h-8 w-8 text-primary-600 mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Email</h3>
            <p className="text-gray-600 mb-4">Krazher220@icloud.com</p>
            <a
              href="mailto:Krazher220@icloud.com"
              className="text-primary-600 hover:text-primary-700 font-semibold"
            >
              Написать письмо →
            </a>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <MessageCircle className="h-8 w-8 text-primary-600 mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Telegram</h3>
            <p className="text-gray-600 mb-4">@krazher220</p>
            <a
              href="https://t.me/krazher220"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-600 hover:text-primary-700 font-semibold"
            >
              Написать в Telegram →
            </a>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <MessageCircle className="h-8 w-8 text-primary-600 mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Телефон</h3>
            <p className="text-gray-600 mb-4">+7 705 669 76 77</p>
            <a
              href="tel:+77056697677"
              className="text-primary-600 hover:text-primary-700 font-semibold"
            >
              Позвонить →
            </a>
          </div>
        </div>

        {/* Часы работы парламента */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <Clock className="h-8 w-8 text-primary-600 mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-4">Часы работы парламента</h3>
          <div className="space-y-2 text-gray-600">
            <div className="flex justify-between">
              <span>Понедельник - Пятница</span>
              <span className="font-semibold">14:00 - 17:00</span>
            </div>
            <div className="flex justify-between">
              <span>Суббота</span>
              <span className="font-semibold">10:00 - 14:00</span>
            </div>
            <div className="flex justify-between">
              <span>Воскресенье</span>
              <span className="font-semibold">Выходной</span>
            </div>
          </div>
        </div>

        {/* Форма обратной связи */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Форма обратной связи</h3>
          <form className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                Ваше имя
              </label>
              <input
                type="text"
                id="name"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Введите ваше имя"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="your@email.com"
              />
            </div>
            <div>
              <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-2">
                Сообщение
              </label>
              <textarea
                id="message"
                rows={6}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Напишите ваше сообщение..."
              ></textarea>
            </div>
            <button
              type="submit"
              className="w-full bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition font-semibold"
            >
              Отправить сообщение
            </button>
          </form>
        </div>

        {/* Ссылки на соцсети */}
        <div className="mt-8 text-center">
          <p className="text-gray-600 mb-4">Следите за новостями в социальных сетях:</p>
          <div className="flex justify-center space-x-4">
            <a
              href="#"
              className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition"
            >
              Instagram
            </a>
            <a
              href="#"
              className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition"
            >
              Telegram канал
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

