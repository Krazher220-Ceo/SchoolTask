import Link from 'next/link'
import { ArrowLeft, Users, Calendar, Image as ImageIcon, Award, Mail } from 'lucide-react'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { ministryNames, ministrySlugToEnum } from '@/lib/utils'

const ministryData: Record<string, { slogan: string; description: string; icon: string; color: string }> = {
  'law-and-order': {
    slogan: 'Справедливость и порядок',
    description: 'Обеспечение соблюдения правил и порядка в школе, организация дежурств и поддержание дисциплины.',
    icon: '⚖️',
    color: 'bg-blue-500',
  },
  'information': {
    slogan: 'Информация - сила',
    description: 'Создание контента, ведение социальных сетей, фото и видеосъемка мероприятий, освещение событий школы.',
    icon: '📷',
    color: 'bg-pink-500',
  },
  'sport': {
    slogan: 'Движение - это жизнь',
    description: 'Организация спортивных мероприятий, турниров, соревнований и популяризация здорового образа жизни.',
    icon: '⚽',
    color: 'bg-green-500',
  },
  'care': {
    slogan: 'Забота о каждом',
    description: 'Организация мероприятий по заботе о младших учениках, помощь нуждающимся и создание дружеской атмосферы.',
    icon: '❤️',
    color: 'bg-red-500',
  },
}

export default async function MinistryPage({ params }: { params: { slug: string } }) {
  const ministryEnum = ministrySlugToEnum[params.slug]
  
  if (!ministryEnum || !ministryData[params.slug]) {
    notFound()
  }

  const ministry = ministryData[params.slug]
  const ministryName = ministryNames[ministryEnum]

  // Загружаем министра
  const minister = await prisma.user.findFirst({
    where: {
      parliamentMember: {
        ministry: ministryEnum as any,
        position: 'Министр',
      },
    },
    include: {
      parliamentMember: true,
    },
  })

  // Загружаем всех членов министерства (кроме министра)
  const members = await prisma.user.findMany({
    where: {
      parliamentMember: {
        ministry: ministryEnum as any,
        position: { 
          notIn: ['Министр'],
        },
      },
    },
    include: {
      parliamentMember: true,
    },
    orderBy: {
      parliamentMember: {
        xp: 'desc',
      },
    },
  })

  // Загружаем задачи министерства
  const tasks = await prisma.task.findMany({
    where: {
      ministry: ministryEnum as any,
    },
    include: {
      assignedTo: {
        select: {
          name: true,
        },
      },
      createdBy: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 10,
  })

  // Статистика
  const stats = {
    totalMembers: members.length + (minister ? 1 : 0),
    totalXP: members.reduce((sum, m) => sum + (m.parliamentMember?.xp || 0), 0) + (minister?.parliamentMember?.xp || 0),
    activeTasks: tasks.filter(t => t.status === 'IN_PROGRESS' || t.status === 'NEW').length,
    completedTasks: tasks.filter(t => t.status === 'COMPLETED').length,
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Шапка */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/sch1" className="flex items-center space-x-2 text-gray-700 hover:text-primary-600">
              <ArrowLeft className="h-5 w-5" />
              <span>Назад</span>
            </Link>
            <div className="flex items-center space-x-3">
              <span className="text-2xl">{ministry.icon}</span>
              <h1 className="text-xl font-bold text-gray-900">Министерство {ministryName}</h1>
            </div>
            <div className="w-24"></div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Шапка министерства */}
        <section className="mb-12">
          <div className={`${ministry.color} rounded-2xl shadow-xl p-12 text-white mb-8`}>
            <div className="text-6xl mb-4">{ministry.icon}</div>
            <h2 className="text-4xl font-bold mb-2">Министерство {ministryName}</h2>
            <p className="text-xl text-white/90">{ministry.slogan}</p>
          </div>

          {/* Министр */}
          {minister && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center space-x-6">
                <div className="w-24 h-24 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center">
                  <Users className="h-12 w-12 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-2xl font-bold text-gray-900">{minister.name}</h3>
                    <span className="bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-sm font-semibold">
                      Министр
                    </span>
                  </div>
                  <p className="text-gray-600 mb-2">Класс: {minister.class || 'Не указан'}</p>
                  {minister.parliamentMember && (
                    <div className="flex items-center space-x-4 text-sm">
                      <span className="text-gray-500">
                        XP: <span className="font-semibold text-primary-600">{minister.parliamentMember.xp}</span>
                      </span>
                      <span className="text-gray-500">
                        Уровень: <span className="font-semibold text-primary-600">{minister.parliamentMember.level}</span>
                      </span>
                      <span className="text-gray-500">
                        Ранг: <span className="font-semibold text-primary-600">{minister.parliamentMember.rank}</span>
                      </span>
                    </div>
                  )}
                  <div className="mt-2 flex items-center text-gray-500">
                    <Mail className="h-4 w-4 mr-2" />
                    <span className="text-sm">{minister.email}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Статистика */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <Users className="h-8 w-8 text-primary-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">{stats.totalMembers}</div>
            <div className="text-sm text-gray-600">Участников</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <Award className="h-8 w-8 text-primary-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">{stats.totalXP}</div>
            <div className="text-sm text-gray-600">Всего XP</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <Calendar className="h-8 w-8 text-primary-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">{stats.activeTasks}</div>
            <div className="text-sm text-gray-600">Активных задач</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <Award className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">{stats.completedTasks}</div>
            <div className="text-sm text-gray-600">Выполнено</div>
          </div>
        </section>

        {/* О министерстве */}
        <section className="bg-white rounded-xl shadow-lg p-8 mb-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">О министерстве</h3>
          <p className="text-gray-600 mb-6 text-lg">{ministry.description}</p>
        </section>

        {/* Команда */}
        <section className="bg-white rounded-xl shadow-lg p-8 mb-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Наша команда</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {members.map((member) => (
              <div key={member.id} className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full mx-auto mb-3 flex items-center justify-center">
                  <Users className="h-10 w-10 text-gray-500" />
                </div>
                <div className="font-semibold text-gray-900 mb-1">{member.name}</div>
                <div className="text-sm text-gray-600 mb-2">
                  {member.parliamentMember?.position || 'Участник'}
                  {member.parliamentMember?.shift && ` (${member.parliamentMember.shift})`}
                </div>
                <div className="text-xs text-primary-600 font-semibold">
                  {member.parliamentMember?.xp || 0} XP
                </div>
                <div className="text-xs text-gray-500">
                  Уровень {member.parliamentMember?.level || 1}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Задачи */}
        {tasks.length > 0 && (
          <section className="bg-white rounded-xl shadow-lg p-8 mb-12">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Последние задачи</h3>
            <div className="space-y-4">
              {tasks.map((task) => (
                <div key={task.id} className="border-2 border-gray-200 rounded-lg p-4 hover:border-primary-300 transition">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="font-semibold text-gray-900 mb-1">{task.title}</div>
                      <div className="text-sm text-gray-600">{task.description.substring(0, 100)}...</div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      task.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                      task.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' :
                      task.status === 'NEW' ? 'bg-gray-100 text-gray-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {task.status === 'COMPLETED' ? 'Выполнено' :
                       task.status === 'IN_PROGRESS' ? 'В работе' :
                       task.status === 'NEW' ? 'Новая' : 'На проверке'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>Исполнитель: {task.assignedTo?.name || 'Не назначен'}</span>
                    <span>Награда: {task.xpReward} XP</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Присоединяйся */}
        <section className="bg-gradient-to-r from-primary-600 to-indigo-600 rounded-2xl shadow-xl p-8 text-white">
          <h3 className="text-3xl font-bold mb-4">Присоединяйся к нам!</h3>
          <p className="text-lg mb-6 text-primary-100">
            Стань частью команды и помоги создавать незабываемые мероприятия!
          </p>
          <a
            href="https://forms.google.com/your-form-link"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white text-primary-600 px-6 py-3 rounded-lg hover:bg-gray-100 transition font-semibold inline-block"
          >
            Подать заявку
          </a>
        </section>
      </div>
    </div>
  )
}
