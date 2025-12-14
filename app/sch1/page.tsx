import Link from 'next/link'
import Image from 'next/image'
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
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { ministryNames, ministrySlugs } from '@/lib/utils'
import Spotlight from '@/app/components/Spotlight'
import MinistryWar from '@/app/components/MinistryWar'
import AIMentor from '@/app/components/AIMentor'
import SocialFeed from '@/app/components/SocialFeed'

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
  // Разрешаем авторизованным пользователям видеть главную страницу
  // (убрали автоматический редирект, чтобы кнопка "Главная" работала)
  const session = await getServerSession(authOptions)

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
                position: 'Министр',
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

  // Загружаем последние мероприятия
  const recentEvents = await prisma.event.findMany({
    where: {
      status: {
        in: ['UPCOMING', 'IN_PROGRESS'],
      },
    },
    orderBy: {
      date: 'asc',
    },
    take: 6,
    include: {
      participants: true,
    },
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 selection:bg-[#0ea5e9] selection:text-white">
      {/* Шапка */}
      <header className="glass-nav border-b border-gray-200/50 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/sch1" className="flex items-center gap-3">
              <Image
                src="/parliament-logo.png"
                alt="Эмблема Школьного Парламента"
                width={40}
                height={40}
                className="object-contain"
                priority
              />
              <div>
                <h1 className="text-lg font-bold tracking-tight text-gray-900">Школьный Парламент</h1>
              </div>
            </Link>
            <nav className="hidden md:flex items-center space-x-6">
              <Link href="/sch1" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                Главная
              </Link>
              <Link href="/sch1/game" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                Геймификация
              </Link>
              <Link href="/sch1/ratings" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                Рейтинги
              </Link>
              <Link href="/sch1/shop" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                Магазин
              </Link>
            </nav>
            {session ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600 hidden sm:block">{session.user.name}</span>
                <Link
                  href={session.user.role === 'ADMIN' ? '/sch1/admin' : 
                        (session.user as any).parliamentMember ? '/sch1/parliament/dashboard' : 
                        '/sch1/students/dashboard'}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                >
                  Личный кабинет
                </Link>
              </div>
            ) : (
              <Link
                href="/sch1/login"
                className="bg-[#0284c7] hover:bg-[#0369a1] text-white text-sm font-medium px-4 py-2 rounded-lg shadow-sm shadow-blue-200 transition-all"
              >
                Войти
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Главный баннер */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        <div className="text-center mb-16">
          <div className="flex justify-center items-center gap-6 md:gap-12 mb-8">
            <Image
              src="/parliament-logo.png"
              alt="Эмблема Школьного Парламента"
              width={120}
              height={120}
              className="object-contain"
              priority
            />
            <Image
              src="/school-logo.png"
              alt="Эмблема Мектеп-Лицей №1"
              width={140}
              height={140}
              className="object-contain"
              priority
            />
            <Image
              src="/adal-azamat-logo.png"
              alt="Эмблема Адал Азамат"
              width={120}
              height={120}
              className="object-contain"
              priority
            />
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight text-gray-900 mb-6 max-w-4xl mx-auto leading-tight">
            Добро пожаловать в <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0284c7] to-indigo-600">
              Школьный Парламент!
            </span>
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Платформа для активных учеников, где каждый может реализовать свои идеи, 
            развить лидерские качества и внести вклад в жизнь школы
          </p>
        </div>

        {/* О парламенте */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mb-12">
          <h3 className="text-2xl font-semibold text-gray-900 mb-6 tracking-tight">О парламенте</h3>
          <div className="space-y-8">
            <div>
              <h4 className="text-lg font-semibold text-gray-800 mb-3">Что такое Школьный Парламент?</h4>
              <p className="text-gray-600 mb-4 leading-relaxed">
                Школьный парламент является выборным органом самоуправления. Основная функция парламента 
                на первой стадии развития - исполнительская, в дальнейшем, по мере развития - организаторская и управленческая.
              </p>
              <p className="text-gray-600 leading-relaxed">
                Деятельность направлена на развитие модели гражданского общества в рамках школьного коллектива, 
                воспитание правовой культуры учащихся, формирование у них активной гражданской позиции, 
                развитие ученического самоуправления.
              </p>
            </div>

            <div>
              <h4 className="text-lg font-semibold text-gray-800 mb-3">Структура парламента</h4>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h5 className="font-semibold text-gray-900 mb-2">Руководство</h5>
                  <ul className="text-gray-600 space-y-1 text-sm">
                    <li>• Президент парламента</li>
                    <li>• Совет министров</li>
                  </ul>
                </div>
                <div>
                  <h5 className="font-semibold text-gray-900 mb-2">Министерства</h5>
                  <ul className="text-gray-600 space-y-1 text-sm">
                    <li>• Права и порядка</li>
                    <li>• Информации</li>
                    <li>• Спорта и здорового образа жизни</li>
                    <li>• Самопознания и счастья</li>
                    <li>• Заботы (волонтерство)</li>
                    <li>• Культуры и искусства</li>
                    <li>• Дебатного движения</li>
                    <li>• Экологии и труда</li>
                  </ul>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-semibold text-gray-800 mb-3">Основные функции министерств</h4>
              <div className="grid md:grid-cols-2 gap-6 text-sm">
                <div>
                  <h5 className="font-medium text-gray-900 mb-2">Права и порядка</h5>
                  <p className="text-gray-600">
                    Дежурство по школе, охрана порядка на мероприятиях, контроль за соблюдением правил 
                    безопасного поведения и внутреннего распорядка.
                  </p>
                </div>
                <div>
                  <h5 className="font-medium text-gray-900 mb-2">Информации</h5>
                  <p className="text-gray-600">
                    Сбор и распространение информации о достижениях школы, формирование положительного 
                    имиджа, фото и видеосъемка мероприятий.
                  </p>
                </div>
                <div>
                  <h5 className="font-medium text-gray-900 mb-2">Спорта и здоровья</h5>
                  <p className="text-gray-600">
                    Организация спортивных соревнований, участие в городских и республиканских мероприятиях, 
                    проведение спортивных праздников и веселых переменок.
                  </p>
                </div>
                <div>
                  <h5 className="font-medium text-gray-900 mb-2">Заботы</h5>
                  <p className="text-gray-600">
                    Развитие волонтерской деятельности, проведение благотворительных акций, организация 
                    помощи нуждающимся, поздравления с днями рождения.
                  </p>
                </div>
                <div>
                  <h5 className="font-medium text-gray-900 mb-2">Культуры и искусства</h5>
                  <p className="text-gray-600">
                    Подготовка и проведение интеллектуальных игр, выставок, конкурсов, праздников, 
                    фестивалей, театральных постановок.
                  </p>
                </div>
                <div>
                  <h5 className="font-medium text-gray-900 mb-2">Экологии и труда</h5>
                  <p className="text-gray-600">
                    Участие в экологических акциях, организация субботников, формирование экологической 
                    культуры учащихся, привлечение внимания к проблемам климата.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
              <p className="text-sm text-gray-700">
                Парламент взаимодействует с педагогическим советом, администрацией школы и 
                Попечительским советом в соответствии с уставом школы.
              </p>
            </div>
          </div>
        </div>

        {/* Совет министров */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-semibold text-gray-900 tracking-tight">
              Совет министров
            </h3>
            <Link href="/sch1/ratings" className="text-sm font-medium text-[#0284c7] hover:text-[#0369a1] flex items-center gap-1">
              Все министерства <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {ministers.map((ministry) => {
              const Icon = ministry.icon
              const borderColors: Record<string, string> = {
                'bg-blue-500': 'border-[#3b82f6]',
                'bg-pink-500': 'border-[#ec4899]',
                'bg-green-500': 'border-[#10b981]',
                'bg-red-500': 'border-[#ef4444]',
              }
              const bgColors: Record<string, string> = {
                'bg-blue-500': 'bg-blue-50',
                'bg-pink-500': 'bg-pink-50',
                'bg-green-500': 'bg-green-50',
                'bg-red-500': 'bg-red-50',
              }
              const iconColors: Record<string, string> = {
                'bg-blue-500': 'text-[#3b82f6]',
                'bg-pink-500': 'text-[#ec4899]',
                'bg-green-500': 'text-[#10b981]',
                'bg-red-500': 'text-[#ef4444]',
              }
              return (
                <Link
                  key={ministry.slug}
                  href={`/sch1/ministry/${ministry.slug}`}
                  className="bg-white rounded-xl shadow-lg border-b-4 p-6 hover:shadow-xl transition-all hover:-translate-y-1 cursor-pointer"
                  style={{ borderBottomColor: borderColors[ministry.color]?.replace('border-', '') || '#3b82f6' }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-2 ${bgColors[ministry.color]} ${iconColors[ministry.color]} rounded-lg`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className="text-xs font-semibold bg-gray-100 text-gray-600 px-2 py-1 rounded-full">0 Задач</span>
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-1">
                    {ministry.name}
                  </h4>
                  {ministry.minister ? (
                    <p className="text-sm text-gray-500 mb-4 line-clamp-2">
                      Министр: {ministry.minister.name}
                    </p>
                  ) : (
                    <p className="text-sm text-gray-400 mb-4">Министр не назначен</p>
                  )}
                  <div className="w-full bg-gray-100 rounded-full h-1.5">
                    <div 
                      className={`h-1.5 rounded-full`}
                      style={{ 
                        width: '40%',
                        backgroundColor: borderColors[ministry.color]?.replace('border-', '') || '#3b82f6'
                      }}
                    ></div>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>

        {/* Статистика */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 relative overflow-hidden group hover:shadow-xl transition-all duration-300">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-50 rounded-full group-hover:scale-110 transition-transform"></div>
            <div className="relative z-10 flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Всего задач</p>
                <h3 className="text-3xl font-semibold text-gray-900 tracking-tight">{totalTasks}</h3>
              </div>
              <div className="p-3 bg-blue-100 text-[#0284c7] rounded-lg">
                <Calendar className="h-6 w-6" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 relative overflow-hidden group hover:shadow-xl transition-all duration-300">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-pink-50 rounded-full group-hover:scale-110 transition-transform"></div>
            <div className="relative z-10 flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Участников</p>
                <h3 className="text-3xl font-semibold text-gray-900 tracking-tight">{totalMembers}</h3>
              </div>
              <div className="p-3 bg-pink-100 text-[#ec4899] rounded-lg">
                <Users className="h-6 w-6" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 relative overflow-hidden group hover:shadow-xl transition-all duration-300">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-green-50 rounded-full group-hover:scale-110 transition-transform"></div>
            <div className="relative z-10 flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Всего XP</p>
                <h3 className="text-3xl font-semibold text-gray-900 tracking-tight">{totalXP._sum.xp || 0}</h3>
              </div>
              <div className="p-3 bg-green-100 text-[#10b981] rounded-lg">
                <Award className="h-6 w-6" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 relative overflow-hidden group hover:shadow-xl transition-all duration-300">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-yellow-50 rounded-full group-hover:scale-110 transition-transform"></div>
            <div className="relative z-10 flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Выполнено</p>
                <h3 className="text-3xl font-semibold text-gray-900 tracking-tight">{completedTasks}</h3>
              </div>
              <div className="p-3 bg-yellow-100 text-yellow-600 rounded-lg">
                <TrendingUp className="h-6 w-6" />
              </div>
            </div>
          </div>
        </div>

        {/* Spotlight и Битва Министерств */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
          <Spotlight />
          <MinistryWar />
        </div>

        {/* AI-Ментор и Лента Событий */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
          <AIMentor />
          <SocialFeed />
        </div>

        {/* Недавние мероприятия */}
        {recentEvents.length > 0 && (
          <div className="mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-6 text-center">
              Недавние мероприятия
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentEvents.map((event) => {
                const ministry = ministries.find(m => m.enum === event.ministry)
                const Icon = ministry?.icon || Calendar
                const ministryColor = ministry?.color || 'bg-gray-500'
                return (
                  <div key={event.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition">
                    <div className={`${ministryColor} h-32 flex items-center justify-center`}>
                      <Icon className="h-12 w-12 text-white" />
                    </div>
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-primary-600">{event.category}</span>
                        <span className={`text-xs px-2 py-1 rounded ${
                          event.status === 'UPCOMING' ? 'bg-blue-100 text-blue-800' :
                          event.status === 'IN_PROGRESS' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {event.status === 'UPCOMING' ? 'Предстоит' :
                           event.status === 'IN_PROGRESS' ? 'В процессе' :
                           event.status}
                        </span>
                      </div>
                      <h4 className="text-xl font-bold text-gray-900 mb-2">{event.title}</h4>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">{event.description}</p>
                      <div className="space-y-2 text-sm text-gray-500">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2" />
                          {new Date(event.date).toLocaleDateString('ru-RU', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                        {event.location && (
                          <div className="flex items-center">
                            <span className="mr-2">📍</span>
                            {event.location}
                          </div>
                        )}
                        {event.maxParticipants && (
                          <div className="flex items-center">
                            <Users className="h-4 w-4 mr-2" />
                            {event.participants.length} / {event.maxParticipants} участников
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Как присоединиться */}
        <div className="bg-gradient-to-br from-[#0284c7] to-indigo-600 rounded-2xl shadow-lg p-8 text-white mb-12 relative overflow-hidden">
          <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
          <div className="relative z-10">
            <h3 className="text-2xl font-semibold mb-3">Хочешь стать частью команды?</h3>
            <p className="text-blue-100 text-base mb-6 max-w-2xl">
              Мы всегда рады новым активным участникам! Подай заявку и стань частью 
              самого креативного сообщества школы.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/forms/registration"
                className="bg-white text-[#0284c7] hover:bg-blue-50 px-6 py-3 rounded-lg transition font-semibold text-center shadow-sm"
              >
                Подать заявку
              </Link>
              <Link
                href="/sch1/game"
                className="bg-white/10 backdrop-blur text-white hover:bg-white/20 px-6 py-3 rounded-lg transition font-semibold text-center border border-white/20"
              >
                Узнать о геймификации
              </Link>
            </div>
          </div>
        </div>

        {/* Предложи идею */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mb-12">
          <div className="flex items-center mb-4">
            <div className="p-2 bg-yellow-50 text-yellow-600 rounded-lg mr-3">
              <Lightbulb className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 tracking-tight">Предложи идею</h3>
          </div>
          <p className="text-gray-600 mb-6 text-sm">
            У тебя есть крутая идея для мероприятия или проекта? Поделись ею с нами! 
            Лучшие идеи мы обязательно реализуем.
          </p>
          <Link
            href="/forms/idea"
            className="bg-[#0284c7] hover:bg-[#0369a1] text-white px-6 py-2.5 rounded-lg transition font-medium inline-flex items-center text-sm shadow-sm shadow-blue-200"
          >
            Предложить мероприятие
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Футер */}
      <footer className="bg-gray-50 border-t border-gray-200 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4">
              <Image
                src="/school-logo.png"
                alt="Эмблема Мектеп-Лицей №1"
                width={48}
                height={48}
                className="object-contain"
              />
              <Image
                src="/parliament-logo.png"
                alt="Эмблема Школьного Парламента"
                width={48}
                height={48}
                className="object-contain"
              />
              <span className="font-semibold text-gray-900">Школьный Парламент</span>
            </div>
            <p className="text-sm text-gray-500">&copy; 2024 Мектеп-Лицей №1, г. Костанай. Все права защищены</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
