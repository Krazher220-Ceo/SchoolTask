import Link from 'next/link'
import { 
  Trophy, 
  Award, 
  TrendingUp, 
  Star,
  Zap,
  Target,
  Users,
  Crown,
  ArrowLeft
} from 'lucide-react'

const levels = [
  { level: 1, name: 'Новичок', xp: '0-100', color: 'bg-gray-400' },
  { level: 2, name: 'Активист', xp: '100-300', color: 'bg-blue-400' },
  { level: 3, name: 'Энтузиаст', xp: '300-600', color: 'bg-green-400' },
  { level: 4, name: 'Организатор', xp: '600-1000', color: 'bg-purple-400' },
  { level: 5, name: 'Эксперт', xp: '1000-1500', color: 'bg-pink-400' },
  { level: 6, name: 'Мастер', xp: '1500-2500', color: 'bg-orange-400' },
  { level: 7, name: 'Легенда', xp: '2500+', color: 'bg-yellow-400' },
]

const badges = [
  { name: 'Первые шаги', description: 'Выполнил первую задачу', rarity: 'COMMON', icon: '🎯' },
  { name: 'Спринтер', description: 'Выполнил 5 задач досрочно', rarity: 'RARE', icon: '⚡' },
  { name: 'Перфекционист', description: '10 отчетов приняты с первого раза', rarity: 'EPIC', icon: '✨' },
  { name: 'Командный игрок', description: 'Помог 5 разным участникам', rarity: 'RARE', icon: '🤝' },
  { name: 'Креативщик', description: 'Предложил 5 реализованных идей', rarity: 'LEGENDARY', icon: '💡' },
]

export default function GamePage() {
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
              <h1 className="text-xl font-bold text-gray-900">Система Геймификации</h1>
            </div>
            <div className="w-24"></div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Введение */}
        <section className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Играй, развивайся, побеждай! 🎮
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Двухуровневая система мотивации для членов парламента и всех учеников школы. 
            Зарабатывай баллы, получай бейджи, поднимайся в рейтинге!
          </p>
        </section>

        {/* Для членов парламента */}
        <section className="bg-white rounded-2xl shadow-xl p-8 mb-12">
          <div className="flex items-center mb-6">
            <Crown className="h-8 w-8 text-yellow-500 mr-3" />
            <h3 className="text-3xl font-bold text-gray-900">Для членов парламента</h3>
          </div>

          {/* Система XP */}
          <div className="mb-8">
            <h4 className="text-2xl font-semibold text-gray-800 mb-4">Система баллов (XP)</h4>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="font-semibold text-gray-900 mb-2">Выполнение задачи</div>
                <div className="text-gray-600">10-50 XP (в зависимости от сложности)</div>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <div className="font-semibold text-gray-900 mb-2">Досрочное выполнение</div>
                <div className="text-gray-600">+10 XP бонус</div>
              </div>
              <div className="bg-purple-50 rounded-lg p-4">
                <div className="font-semibold text-gray-900 mb-2">Качественный отчет</div>
                <div className="text-gray-600">+15 XP (одобрен с первого раза)</div>
              </div>
              <div className="bg-pink-50 rounded-lg p-4">
                <div className="font-semibold text-gray-900 mb-2">Организация мероприятия</div>
                <div className="text-gray-600">+100 XP</div>
              </div>
              <div className="bg-orange-50 rounded-lg p-4">
                <div className="font-semibold text-gray-900 mb-2">Инициатива</div>
                <div className="text-gray-600">+30 XP (предложил свою идею)</div>
              </div>
              <div className="bg-yellow-50 rounded-lg p-4">
                <div className="font-semibold text-gray-900 mb-2">Наставничество</div>
                <div className="text-gray-600">+25 XP</div>
              </div>
            </div>
          </div>

          {/* Система уровней */}
          <div className="mb-8">
            <h4 className="text-2xl font-semibold text-gray-800 mb-4">Система уровней</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {levels.map((lvl) => (
                <div key={lvl.level} className="bg-gray-50 rounded-lg p-4 border-2 border-gray-200">
                  <div className={`${lvl.color} w-12 h-12 rounded-full flex items-center justify-center mb-3 mx-auto`}>
                    <span className="text-white font-bold text-lg">{lvl.level}</span>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-gray-900 mb-1">{lvl.name}</div>
                    <div className="text-sm text-gray-600">{lvl.xp} XP</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Бейджи */}
          <div className="mb-8">
            <h4 className="text-2xl font-semibold text-gray-800 mb-4">Бейджи и достижения</h4>
            <div className="grid md:grid-cols-3 gap-4">
              {badges.map((badge, idx) => (
                <div key={idx} className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4 border-2 border-gray-200">
                  <div className="text-4xl mb-2">{badge.icon}</div>
                  <div className="font-semibold text-gray-900 mb-1">{badge.name}</div>
                  <div className="text-sm text-gray-600 mb-2">{badge.description}</div>
                  <div className={`text-xs px-2 py-1 rounded inline-block ${
                    badge.rarity === 'COMMON' ? 'bg-gray-300' :
                    badge.rarity === 'RARE' ? 'bg-blue-300' :
                    badge.rarity === 'EPIC' ? 'bg-purple-300' :
                    'bg-yellow-300'
                  }`}>
                    {badge.rarity}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Рейтинги */}
          <div>
            <h4 className="text-2xl font-semibold text-gray-800 mb-4">Рейтинги</h4>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6">
                <TrendingUp className="h-8 w-8 text-blue-600 mb-3" />
                <div className="font-semibold text-gray-900 mb-2">Общий рейтинг активности</div>
                <div className="text-gray-600">Топ-10 всего парламента по XP</div>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-6">
                <Users className="h-8 w-8 text-green-600 mb-3" />
                <div className="font-semibold text-gray-900 mb-2">Рейтинг по министерствам</div>
                <div className="text-gray-600">Топ-5 в каждом министерстве</div>
              </div>
            </div>
          </div>
        </section>

        {/* Для всех учеников */}
        <section className="bg-white rounded-2xl shadow-xl p-8 mb-12">
          <div className="flex items-center mb-6">
            <Star className="h-8 w-8 text-orange-500 mr-3" />
            <h3 className="text-3xl font-bold text-gray-900">Для всех учеников школы</h3>
          </div>

          {/* Система EP */}
          <div className="mb-8">
            <h4 className="text-2xl font-semibold text-gray-800 mb-4">Система баллов (EP - Event Points)</h4>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="font-semibold text-gray-900 mb-2">Участие в мероприятии</div>
                <div className="text-gray-600">+10 EP</div>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <div className="font-semibold text-gray-900 mb-2">Победа в конкурсе</div>
                <div className="text-gray-600">+30 EP</div>
              </div>
              <div className="bg-purple-50 rounded-lg p-4">
                <div className="font-semibold text-gray-900 mb-2">Предложенная идея принята</div>
                <div className="text-gray-600">+50 EP</div>
              </div>
              <div className="bg-pink-50 rounded-lg p-4">
                <div className="font-semibold text-gray-900 mb-2">Идея реализована</div>
                <div className="text-gray-600">+100 EP</div>
              </div>
              <div className="bg-orange-50 rounded-lg p-4">
                <div className="font-semibold text-gray-900 mb-2">Волонтерство</div>
                <div className="text-gray-600">+20 EP</div>
              </div>
              <div className="bg-yellow-50 rounded-lg p-4">
                <div className="font-semibold text-gray-900 mb-2">Креативный контент</div>
                <div className="text-gray-600">+15 EP (фото/видео)</div>
              </div>
            </div>
          </div>

          {/* Ранги для учеников */}
          <div className="mb-8">
            <h4 className="text-2xl font-semibold text-gray-800 mb-4">Система рангов</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { rank: 'Наблюдатель', ep: '0-50', icon: '👀' },
                { rank: 'Участник', ep: '50-150', icon: '🙋' },
                { rank: 'Активный участник', ep: '150-300', icon: '⭐' },
                { rank: 'Энергайзер', ep: '300-500', icon: '⚡' },
                { rank: 'Звезда школы', ep: '500-800', icon: '🌟' },
                { rank: 'Легенда школы', ep: '800+', icon: '👑' },
              ].map((r, idx) => (
                <div key={idx} className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-lg p-4 border-2 border-orange-200">
                  <div className="text-3xl mb-2 text-center">{r.icon}</div>
                  <div className="font-bold text-gray-900 text-center mb-1">{r.rank}</div>
                  <div className="text-sm text-gray-600 text-center">{r.ep} EP</div>
                </div>
              ))}
            </div>
          </div>

          {/* Классные соревнования */}
          <div>
            <h4 className="text-2xl font-semibold text-gray-800 mb-4">Классные соревнования</h4>
            <div className="bg-gradient-to-r from-yellow-400 to-orange-400 rounded-lg p-6 text-white">
              <div className="flex items-center mb-3">
                <Trophy className="h-8 w-8 mr-3" />
                <div className="font-bold text-xl">Рейтинг классов по EP</div>
              </div>
              <p className="mb-4">
                Соревнуйся вместе с классом! Самый активный класс получает приз каждую четверть 
                и переходящий кубок.
              </p>
              <div className="bg-white/20 rounded-lg p-4">
                <div className="font-semibold mb-2">Текущий лидер:</div>
                <div className="text-2xl font-bold">11 &quot;А&quot; класс - 2,450 EP</div>
              </div>
            </div>
          </div>
        </section>

        {/* Квесты и миссии */}
        <section className="bg-white rounded-2xl shadow-xl p-8 mb-12">
          <div className="flex items-center mb-6">
            <Target className="h-8 w-8 text-red-500 mr-3" />
            <h3 className="text-3xl font-bold text-gray-900">Квесты и миссии</h3>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-blue-50 rounded-lg p-6">
              <div className="text-2xl mb-3">📅</div>
              <div className="font-semibold text-gray-900 mb-2">Ежедневные квесты</div>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• &quot;Утренний старт&quot; - +3 XP</li>
                <li>• &quot;Командир&quot; - +5 XP</li>
                <li>• &quot;Продуктивный день&quot; - +10 XP</li>
              </ul>
            </div>
            <div className="bg-green-50 rounded-lg p-6">
              <div className="text-2xl mb-3">📆</div>
              <div className="font-semibold text-gray-900 mb-2">Еженедельные миссии</div>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• &quot;Продуктивная неделя&quot; - +50 XP</li>
                <li>• &quot;Социальный&quot; - +25 XP</li>
                <li>• &quot;Креатор&quot; - +30 XP</li>
              </ul>
            </div>
            <div className="bg-purple-50 rounded-lg p-6">
              <div className="text-2xl mb-3">🎉</div>
              <div className="font-semibold text-gray-900 mb-2">Сезонные челленджи</div>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• &quot;Осенний марафон&quot;</li>
                <li>• &quot;Зимний драйв&quot;</li>
                <li>• &quot;Весенний бум&quot;</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Призывы к действию */}
        <div className="grid md:grid-cols-2 gap-6">
          <Link
            href="/sch1/login"
            className="bg-gradient-to-r from-primary-600 to-indigo-600 rounded-xl shadow-lg p-8 text-white hover:shadow-xl transition text-center"
          >
            <Zap className="h-12 w-12 mx-auto mb-4" />
            <div className="text-2xl font-bold mb-2">Начать зарабатывать XP</div>
            <div className="text-primary-100">Войди в систему и начни свой путь к легенде!</div>
          </Link>
          <Link
            href="/sch1"
            className="bg-gradient-to-r from-orange-500 to-pink-500 rounded-xl shadow-lg p-8 text-white hover:shadow-xl transition text-center"
          >
            <Award className="h-12 w-12 mx-auto mb-4" />
            <div className="text-2xl font-bold mb-2">Посмотреть рейтинг</div>
            <div className="text-orange-100">Узнай, кто на вершине!</div>
          </Link>
        </div>
      </div>
    </div>
  )
}

