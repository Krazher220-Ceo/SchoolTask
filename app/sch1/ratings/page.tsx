import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Trophy, Award, TrendingUp, ArrowLeft, Users } from 'lucide-react'
import { ministryNames } from '@/lib/utils'

export default async function RatingsPage() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/sch1/login')
  }

  // Загружаем рейтинг по XP (члены парламента)
  const xpRating = await prisma.parliamentMember.findMany({
    where: { isActive: true },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          class: true,
        },
      },
    },
    orderBy: { xp: 'desc' },
    take: 50,
  })

  // Загружаем рейтинг по EP (все ученики)
  const usersWithEP = await prisma.user.findMany({
    include: {
      eventPoints: true,
    },
  })

  const epRating = usersWithEP
    .map((user) => {
      const totalEP = user.eventPoints.reduce((sum, ep) => sum + ep.amount, 0)
      return {
        userId: user.id,
        name: user.name,
        email: user.email,
        class: user.class,
        ep: totalEP,
      }
    })
    .filter((user) => user.ep > 0)
    .sort((a, b) => b.ep - a.ep)
    .slice(0, 50)

  // Рейтинг по министерствам
  const ministryRatings = await Promise.all(
    ['LAW_AND_ORDER', 'INFORMATION', 'SPORT', 'CARE'].map(async (ministry) => {
      const members = await prisma.parliamentMember.findMany({
        where: {
          ministry: ministry as any,
          isActive: true,
        },
        include: {
          user: {
            select: {
              name: true,
            },
          },
        },
        orderBy: { xp: 'desc' },
        take: 5,
      })

      const totalXP = members.reduce((sum, m) => sum + m.xp, 0)

      return {
        ministry,
        members,
        totalXP,
      }
    })
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      {/* Шапка */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/sch1" className="flex items-center space-x-2 text-gray-700 hover:text-primary-600">
              <ArrowLeft className="h-5 w-5" />
              <span>Назад</span>
            </Link>
            <div className="flex items-center space-x-3">
              <Trophy className="h-8 w-8 text-primary-600" />
              <h1 className="text-xl font-bold text-gray-900">Рейтинги</h1>
            </div>
            <div className="w-24"></div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Рейтинг по XP */}
        <section className="bg-white rounded-xl shadow-lg p-8 mb-12">
          <div className="flex items-center mb-6">
            <Award className="h-8 w-8 text-yellow-500 mr-3" />
            <h2 className="text-3xl font-bold text-gray-900">Рейтинг членов парламента (XP)</h2>
          </div>
          <div className="space-y-3">
            {xpRating.map((member, index) => (
              <div
                key={member.id}
                className={`flex items-center justify-between p-4 rounded-lg border-2 ${
                  index === 0 ? 'bg-yellow-50 border-yellow-300' :
                  index === 1 ? 'bg-gray-50 border-gray-300' :
                  index === 2 ? 'bg-orange-50 border-orange-300' :
                  'bg-white border-gray-200'
                }`}
              >
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white ${
                    index === 0 ? 'bg-yellow-500' :
                    index === 1 ? 'bg-gray-400' :
                    index === 2 ? 'bg-orange-500' :
                    'bg-primary-600'
                  }`}>
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{member.user.name}</div>
                    <div className="text-sm text-gray-600">
                      {ministryNames[member.ministry]} • {member.user.class || 'Не указан'} класс
                    </div>
                    <div className="text-xs text-gray-500">
                      {member.position || 'Участник'} • Уровень {member.level} ({member.rank})
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary-600">{member.xp} XP</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Рейтинг по министерствам */}
        <section className="bg-white rounded-xl shadow-lg p-8 mb-12">
          <div className="flex items-center mb-6">
            <Users className="h-8 w-8 text-blue-500 mr-3" />
            <h2 className="text-3xl font-bold text-gray-900">Рейтинг по министерствам</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {ministryRatings.map((rating) => (
              <div key={rating.ministry} className="border-2 border-gray-200 rounded-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  {ministryNames[rating.ministry]}
                </h3>
                <div className="text-2xl font-bold text-primary-600 mb-4">
                  {rating.totalXP} XP
                </div>
                <div className="space-y-2">
                  {rating.members.map((member, index) => (
                    <div key={member.id} className="flex items-center justify-between text-sm">
                      <span className="text-gray-700">
                        {index + 1}. {member.user.name}
                      </span>
                      <span className="font-semibold text-primary-600">{member.xp} XP</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Рейтинг по EP (для всех учеников) */}
        {epRating.length > 0 && (
          <section className="bg-white rounded-xl shadow-lg p-8">
            <div className="flex items-center mb-6">
              <TrendingUp className="h-8 w-8 text-green-500 mr-3" />
              <h2 className="text-3xl font-bold text-gray-900">Рейтинг учеников (EP)</h2>
            </div>
            <div className="space-y-3">
              {epRating.map((user, index) => (
                <div
                  key={user.userId}
                  className={`flex items-center justify-between p-4 rounded-lg border-2 ${
                    index === 0 ? 'bg-green-50 border-green-300' :
                    index === 1 ? 'bg-blue-50 border-blue-300' :
                    index === 2 ? 'bg-purple-50 border-purple-300' :
                    'bg-white border-gray-200'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white ${
                      index === 0 ? 'bg-green-500' :
                      index === 1 ? 'bg-blue-500' :
                      index === 2 ? 'bg-purple-500' :
                      'bg-gray-500'
                    }`}>
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{user.name}</div>
                      <div className="text-sm text-gray-600">
                        {user.class || 'Не указан'} класс
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-600">{user.ep} EP</div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}

