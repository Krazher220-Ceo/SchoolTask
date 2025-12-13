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

  // Загружаем рейтинг по EP (все ученики) с визуальными эффектами
  const usersWithEP = await prisma.user.findMany({
    include: {
      eventPoints: true,
      visualEffects: true,
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
        avatar: user.avatar,
        ep: totalEP,
        visualEffects: user.visualEffects,
      }
    })
    .filter((user) => user.ep > 0)
    .sort((a, b) => b.ep - a.ep)
    .slice(0, 100)

  // Топ-3 для пьедестала
  const top3 = epRating.slice(0, 3)
  const rest = epRating.slice(3)

  // Функция для определения лиги
  const getLeague = (ep: number) => {
    if (ep < 1000) return { name: 'Бронзовая лига', color: 'bg-amber-900', textColor: 'text-amber-100', borderColor: 'border-amber-700' }
    if (ep < 5000) return { name: 'Серебряная лига', color: 'bg-gray-200', textColor: 'text-gray-800', borderColor: 'border-gray-400' }
    return { name: 'Золотая лига', color: 'bg-yellow-100', textColor: 'text-yellow-900', borderColor: 'border-yellow-400' }
  }

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

            {/* Пьедестал для топ-3 */}
            {top3.length >= 3 && (
              <div className="mb-12">
                <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Пьедестал Почета</h3>
                <div className="flex items-end justify-center gap-4 max-w-4xl mx-auto">
                  {/* 2 место */}
                  <div className="flex-1 max-w-[200px]">
                    <div className="bg-gradient-to-b from-gray-300 to-gray-400 rounded-t-xl p-6 text-center shadow-lg">
                      <div className="text-4xl mb-2">🥈</div>
                      <div className="relative w-20 h-20 mx-auto mb-3">
                        <div className="absolute inset-0 rounded-full bg-gray-200 border-4 border-gray-400"></div>
                        {top3[1].avatar && (
                          <img src={top3[1].avatar} alt={top3[1].name} className="w-full h-full rounded-full object-cover" />
                        )}
                        {top3[1].visualEffects?.avatarBorder && (
                          <div className={`absolute inset-0 rounded-full border-4 ${top3[1].visualEffects.avatarBorder === 'pulse' ? 'border-gray-400 animate-pulse' : top3[1].visualEffects.avatarBorder === 'crown' ? 'border-yellow-400' : 'border-gray-400'}`}></div>
                        )}
                      </div>
                      <div className={`font-bold text-lg ${
                        top3[1].visualEffects?.nicknameColor 
                          ? JSON.parse(top3[1].visualEffects.nicknameColor || '{}').type === 'gradient' && JSON.parse(top3[1].visualEffects.nicknameColor || '{}').gradient === 'fire'
                            ? 'text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-red-500 to-orange-500'
                            : 'text-gray-900'
                          : 'text-gray-900'
                      }`}>
                        {top3[1].name}
                      </div>
                      {top3[1].visualEffects?.customTitle && (
                        <div className="text-xs text-primary-600 font-semibold mt-1">{top3[1].visualEffects.customTitle}</div>
                      )}
                      <div className="text-2xl font-bold text-gray-700 mt-2">{top3[1].ep} EP</div>
                    </div>
                  </div>

                  {/* 1 место */}
                  <div className="flex-1 max-w-[250px]">
                    <div className="bg-gradient-to-b from-yellow-400 to-yellow-600 rounded-t-xl p-8 text-center shadow-2xl transform scale-105">
                      <div className="text-5xl mb-3">🥇</div>
                      <div className="relative w-24 h-24 mx-auto mb-4">
                        <div className="absolute inset-0 rounded-full bg-yellow-200 border-4 border-yellow-500"></div>
                        {top3[0].avatar && (
                          <img src={top3[0].avatar} alt={top3[0].name} className="w-full h-full rounded-full object-cover" />
                        )}
                        {top3[0].visualEffects?.avatarBorder && (
                          <div className={`absolute inset-0 rounded-full border-4 ${top3[0].visualEffects.avatarBorder === 'pulse' ? 'border-yellow-500 animate-pulse' : top3[0].visualEffects.avatarBorder === 'crown' ? 'border-yellow-600' : 'border-yellow-500'}`}></div>
                        )}
                      </div>
                      <div className={`font-bold text-xl ${
                        top3[0].visualEffects?.nicknameColor 
                          ? JSON.parse(top3[0].visualEffects.nicknameColor || '{}').type === 'gradient' && JSON.parse(top3[0].visualEffects.nicknameColor || '{}').gradient === 'fire'
                            ? 'text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-red-500 to-orange-500'
                            : 'text-white'
                          : 'text-white'
                      }`}>
                        {top3[0].name}
                      </div>
                      {top3[0].visualEffects?.customTitle && (
                        <div className="text-xs text-yellow-100 font-semibold mt-1">{top3[0].visualEffects.customTitle}</div>
                      )}
                      <div className="text-3xl font-bold text-white mt-2">{top3[0].ep} EP</div>
                    </div>
                  </div>

                  {/* 3 место */}
                  <div className="flex-1 max-w-[200px]">
                    <div className="bg-gradient-to-b from-orange-300 to-orange-500 rounded-t-xl p-6 text-center shadow-lg">
                      <div className="text-4xl mb-2">🥉</div>
                      <div className="relative w-20 h-20 mx-auto mb-3">
                        <div className="absolute inset-0 rounded-full bg-orange-200 border-4 border-orange-400"></div>
                        {top3[2].avatar && (
                          <img src={top3[2].avatar} alt={top3[2].name} className="w-full h-full rounded-full object-cover" />
                        )}
                        {top3[2].visualEffects?.avatarBorder && (
                          <div className={`absolute inset-0 rounded-full border-4 ${top3[2].visualEffects.avatarBorder === 'pulse' ? 'border-orange-400 animate-pulse' : top3[2].visualEffects.avatarBorder === 'crown' ? 'border-orange-500' : 'border-orange-400'}`}></div>
                        )}
                      </div>
                      <div className={`font-bold text-lg ${
                        top3[2].visualEffects?.nicknameColor 
                          ? JSON.parse(top3[2].visualEffects.nicknameColor || '{}').type === 'gradient' && JSON.parse(top3[2].visualEffects.nicknameColor || '{}').gradient === 'fire'
                            ? 'text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-red-500 to-orange-500'
                            : 'text-gray-900'
                          : 'text-gray-900'
                      }`}>
                        {top3[2].name}
                      </div>
                      {top3[2].visualEffects?.customTitle && (
                        <div className="text-xs text-primary-600 font-semibold mt-1">{top3[2].visualEffects.customTitle}</div>
                      )}
                      <div className="text-2xl font-bold text-orange-800 mt-2">{top3[2].ep} EP</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Остальной рейтинг с лигами */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Остальной рейтинг</h3>
              {rest.map((user, index) => {
                const league = getLeague(user.ep)
                const position = index + 4
                return (
                  <div
                    key={user.userId}
                    className={`flex items-center justify-between p-4 rounded-lg border-2 ${league.borderColor} ${league.color}`}
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold ${league.textColor} bg-white/50`}>
                        {position}
                      </div>
                      <div className="relative">
                        {user.avatar && (
                          <div className="relative w-10 h-10 rounded-full overflow-hidden mr-3 inline-block">
                            <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                            {user.visualEffects?.avatarBorder && (
                              <div className={`absolute inset-0 rounded-full border-2 ${user.visualEffects.avatarBorder === 'pulse' ? 'border-gray-400 animate-pulse' : user.visualEffects.avatarBorder === 'crown' ? 'border-yellow-400' : 'border-gray-400'}`}></div>
                            )}
                          </div>
                        )}
                        <div>
                          <div className={`font-semibold ${league.textColor} ${
                            user.visualEffects?.nicknameColor 
                              ? JSON.parse(user.visualEffects.nicknameColor || '{}').type === 'gradient' && JSON.parse(user.visualEffects.nicknameColor || '{}').gradient === 'fire'
                                ? 'text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-red-500 to-orange-500'
                                : ''
                              : ''
                          }`}>
                            {user.name}
                          </div>
                          {user.visualEffects?.customTitle && (
                            <div className="text-xs text-primary-600 font-semibold">{user.visualEffects.customTitle}</div>
                          )}
                          <div className={`text-sm ${league.textColor} opacity-80`}>
                            {user.class || 'Не указан'} класс • {league.name}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-2xl font-bold ${league.textColor}`}>{user.ep} EP</div>
                      {league.name === 'Золотая лига' && (
                        <Trophy className="h-5 w-5 text-yellow-600 inline-block ml-2" />
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}


