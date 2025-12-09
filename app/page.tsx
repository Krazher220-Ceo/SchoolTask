import Link from 'next/link'
import { ArrowRight, Users, Calendar, Lightbulb, Trophy } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Навигация */}
      <nav className="bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Trophy className="h-8 w-8 text-primary-600" />
              <span className="text-xl font-bold text-gray-900">Алихан</span>
            </div>
            <div className="hidden md:flex space-x-8">
              <Link href="/about" className="text-gray-700 hover:text-primary-600 transition">
                О себе
              </Link>
              <Link href="/portfolio" className="text-gray-700 hover:text-primary-600 transition">
                Портфолио
              </Link>
              <Link href="/sch1" className="text-gray-700 hover:text-primary-600 transition">
                Школьный Парламент
              </Link>
              <Link href="/contacts" className="text-gray-700 hover:text-primary-600 transition">
                Контакты
              </Link>
            </div>
            <Link
              href="/sch1"
              className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition"
            >
              Войти в Парламент
            </Link>
          </div>
        </div>
      </nav>

      {/* Главный баннер */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Привет, я <span className="text-primary-600">Алихан</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-700 mb-4">
            Председатель Школьного Парламента
          </p>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
            Создаю возможности для развития и самореализации каждого ученика через 
            активное участие в жизни школы
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/sch1"
              className="bg-primary-600 text-white px-8 py-3 rounded-lg hover:bg-primary-700 transition text-lg font-semibold inline-flex items-center justify-center"
            >
              Узнать о Парламенте
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link
              href="/portfolio"
              className="bg-white text-primary-600 px-8 py-3 rounded-lg hover:bg-gray-50 transition text-lg font-semibold border-2 border-primary-600"
            >
              Мои Проекты
            </Link>
          </div>
        </div>
      </section>

      {/* Счетчики достижений */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <Calendar className="h-12 w-12 text-primary-600 mx-auto mb-4" />
            <div className="text-4xl font-bold text-gray-900 mb-2">50+</div>
            <div className="text-gray-600">Мероприятий проведено</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <Users className="h-12 w-12 text-primary-600 mx-auto mb-4" />
            <div className="text-4xl font-bold text-gray-900 mb-2">120+</div>
            <div className="text-gray-600">Участников парламента</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <Lightbulb className="h-12 w-12 text-primary-600 mx-auto mb-4" />
            <div className="text-4xl font-bold text-gray-900 mb-2">200+</div>
            <div className="text-gray-600">Реализованных идей</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <Trophy className="h-12 w-12 text-primary-600 mx-auto mb-4" />
            <div className="text-4xl font-bold text-gray-900 mb-2">6</div>
            <div className="text-gray-600">Министерств</div>
          </div>
        </div>
      </section>

      {/* Последние новости */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          Последние новости из Парламента
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((item) => (
            <div key={item} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition">
              <div className="h-48 bg-gradient-to-r from-primary-400 to-primary-600"></div>
              <div className="p-6">
                <div className="text-sm text-gray-500 mb-2">15 декабря 2024</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Новогодний фестиваль талантов
                </h3>
                <p className="text-gray-600">
                  Министерство культуры объявляет о начале подготовки к самому яркому событию года!
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Футер */}
      <footer className="bg-gray-900 text-white mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">Алихан</h3>
              <p className="text-gray-400">
                Председатель Школьного Парламента. Создаю возможности для развития каждого ученика.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">Быстрые ссылки</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/about" className="hover:text-white transition">О себе</Link></li>
                <li><Link href="/portfolio" className="hover:text-white transition">Портфолио</Link></li>
                <li><Link href="/sch1" className="hover:text-white transition">Парламент</Link></li>
                <li><Link href="/contacts" className="hover:text-white transition">Контакты</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">Контакты</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Email: alikhan@example.com</li>
                <li>Telegram: @alikhan</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Алихан. Все права защищены.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

