import Link from 'next/link'
import { 
  Users, 
  Calendar, 
  Lightbulb, 
  TrendingUp, 
  Award,
  ArrowRight,
  Scale,
  Camera,
  Dumbbell,
  Heart
} from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { ministryNames, ministrySlugs } from '@/lib/utils'

const ministries = [
  { 
    name: 'Права и порядка', 
    slug: 'law-and-order', 
    icon: Scale, 
    color: 'bg-blue-500',
    enum: 'LAW_AND_ORDER' as const
  },
  { 
    name: 'Информации', 
    slug: 'information', 
    icon: Camera, 
    color: 'bg-pink-500',
    enum: 'INFORMATION' as const
  },
  { 
    name: 'Спорта', 
    slug: 'sport', 
    icon: Dumbbell, 
    color: 'bg-green-500',
    enum: 'SPORT' as const
  },
  { 
    name: 'Заботы', 
    slug: 'care', 
    icon: Heart, 
    color: 'bg-red-500',
    enum: 'CARE' as const
  },
]

export default async function ParliamentHome() {
  // Проверяем авторизацию и редиректим в dashboard если залогинен
  // Но делаем это только на сервере, не создавая редирект-петлю
  try {
    const { getServerSession } = await import('next-auth')
    const { authOptions } = await import('@/lib/auth')
    const session = await getServerSession(authOptions)
    
    if (session) {
      const { redirect } = await import('next/navigation')
      redirect('/sch1/dashboard')
    }
  } catch (error) {
    // Игнорируем ошибки авторизации на публичной странице
  }

  // Загружаем статистику
  const totalMembers = await prisma.parliamentMember.count({
    where: { isActive: true },
  })

  const totalXP = await prisma.parliamentMember.aggregate({
    where: { isActive: true },
    _sum: { xp: true },
  })

  const totalTasks = await prisma.task.count()
  const completedTasks = await prisma.task.count({
    where: { status: 'COMPLETED' },
  })

  // Загружаем министров
  const ministers = await Promise.all(
    ministries.map(async (m) => {
      const minister = await prisma.user.findFirst({
        where: {
          OR: [
            {
              parliamentMember: {
                ministry: m.enum,
                position: 'Министр',
              },
            },
            {
              parliamentMember: {
                ministry: m.enum,
                position: 'Председатель',
              },
            },
          ],
        },
        include: {
          parliamentMember: true,
        },
      })
      return { ...m, minister }
    })
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50">
      {/* Шапка */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Award className="h-8 w-8 text-primary-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Школьный Парламент</h1>
                <p className="text-xs text-gray-500">Официальный сайт</p>
              </div>
            </div>
            <nav className="hidden md:flex space-x-6">
              <Link href="/sch1" className="text-gray-700 hover:text-primary-600 transition">
                Главная
              </Link>
              <Link href="/sch1/game" className="text-gray-700 hover:text-primary-600 transition">
                Геймификация
              </Link>
              <Link href="/sch1/ratings" className="text-gray-700 hover:text-primary-600 transition">
                Рейтинги
              </Link>
            </nav>
            <Link
              href="/sch1/login"
              className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition"
            >
              Войти
            </Link>
          </div>
        </div>
      </header>

      {/* Главный баннер */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Добро пожаловать в Школьный Парламент!
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Платформа для активных учеников, где каждый может реализовать свои идеи, 
            развить лидерские качества и внести вклад в жизнь школы
          </p>
        </div>

        {/* О парламенте */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">О парламенте</h3>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h4 className="text-lg font-semibold text-gray-800 mb-2">Наша миссия</h4>
              <p className="text-gray-600 mb-4">
                Создавать условия для развития лидерских качеств, творческих способностей 
                и социальной активности каждого ученика через участие в управлении школьной жизнью.
              </p>
              <h4 className="text-lg font-semibold text-gray-800 mb-2">Наши ценности</h4>
              <ul className="list-disc list-inside text-gray-600 space-y-1">
                <li>Активность и инициативность</li>
                <li>Командная работа</li>
                <li>Креативность и инновации</li>
                <li>Ответственность и надежность</li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-gray-800 mb-2">Структура</h4>
              <p className="text-gray-600 mb-4">
                Парламент состоит из 4 министерств, каждое из которых отвечает за свое направление 
                деятельности. Во главе стоит Председатель и Совет министров.
              </p>
            </div>
          </div>
        </div>

        {/* Совет министров */}
        <div className="mb-12">
          <h3 className="text-3xl font-bold text-gray-900 mb-6 text-center">
            Совет министров
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {ministers.map((ministry) => {
              const Icon = ministry.icon
              return (
                <Link
                  key={ministry.slug}
                  href={`/sch1/ministry/${ministry.slug}`}
                  className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition group"
                >
                  <div className={`${ministry.color} w-16 h-16 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition`}>
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                  <h4 className="text-xl font-semibold text-gray-900 mb-2">
                    Министерство {ministry.name}
                  </h4>
                  {ministry.minister ? (
                    <div>
                      <p className="text-gray-600 mb-2">
                        Министр: {ministry.minister.name}
                      </p>
                      <div className="text-sm text-gray-500">
                        {ministry.minister.parliamentMember?.xp || 0} XP • Уровень {ministry.minister.parliamentMember?.level || 1}
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-400 text-sm">Министр не назначен</p>
                  )}
                  <div className="flex items-center text-primary-600 font-semibold mt-4">
                    Подробнее
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition" />
                  </div>
                </Link>
              )
            })}
          </div>
        </div>

        {/* Статистика */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <Calendar className="h-10 w-10 text-primary-600 mx-auto mb-3" />
            <div className="text-3xl font-bold text-gray-900 mb-1">{totalTasks}</div>
            <div className="text-sm text-gray-600">Всего задач</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <Users className="h-10 w-10 text-primary-600 mx-auto mb-3" />
            <div className="text-3xl font-bold text-gray-900 mb-1">{totalMembers}</div>
            <div className="text-sm text-gray-600">Участников парламента</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <Award className="h-10 w-10 text-primary-600 mx-auto mb-3" />
            <div className="text-3xl font-bold text-gray-900 mb-1">{totalXP._sum.xp || 0}</div>
            <div className="text-sm text-gray-600">Всего XP</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <TrendingUp className="h-10 w-10 text-primary-600 mx-auto mb-3" />
            <div className="text-3xl font-bold text-gray-900 mb-1">{completedTasks}</div>
            <div className="text-sm text-gray-600">Выполнено задач</div>
          </div>
        </div>

        {/* Как присоединиться */}
        <div className="bg-gradient-to-r from-primary-600 to-indigo-600 rounded-2xl shadow-xl p-8 text-white mb-12">
          <h3 className="text-3xl font-bold mb-4">Хочешь стать частью команды?</h3>
          <p className="text-lg mb-6 text-primary-100">
            Мы всегда рады новым активным участникам! Подай заявку и стань частью 
            самого креативного сообщества школы.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <a
              href="https://forms.google.com/your-form-link"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white text-primary-600 px-6 py-3 rounded-lg hover:bg-gray-100 transition font-semibold text-center"
            >
              Подать заявку
            </a>
            <Link
              href="/sch1/game"
              className="bg-primary-700 text-white px-6 py-3 rounded-lg hover:bg-primary-800 transition font-semibold text-center border-2 border-white"
            >
              Узнать о геймификации
            </Link>
          </div>
        </div>

        {/* Предложи идею */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-12">
          <div className="flex items-center mb-6">
            <Lightbulb className="h-8 w-8 text-yellow-500 mr-3" />
            <h3 className="text-2xl font-bold text-gray-900">Предложи идею</h3>
          </div>
          <p className="text-gray-600 mb-6">
            У тебя есть крутая идея для мероприятия или проекта? Поделись ею с нами! 
            Лучшие идеи мы обязательно реализуем.
          </p>
          <a
            href="https://forms.google.com/your-idea-form-link"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition font-semibold inline-flex items-center"
          >
            Предложить мероприятие
            <ArrowRight className="ml-2 h-4 w-4" />
          </a>
        </div>
      </section>

      {/* Футер */}
      <footer className="bg-gray-900 text-white mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <Award className="h-12 w-12 text-primary-400 mx-auto mb-4" />
            <p className="text-gray-400">
              Школьный Парламент - место, где рождаются идеи и реализуются мечты
            </p>
            <p className="text-gray-500 mt-4">&copy; 2024 Все права защищены</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
