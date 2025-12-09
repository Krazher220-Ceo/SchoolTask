import Link from 'next/link'
import { ArrowLeft, ExternalLink, Calendar, Users, Award } from 'lucide-react'

const projects = [
  {
    id: 1,
    title: 'Новогодний фестиваль талантов',
    description: 'Организация крупнейшего культурного мероприятия года с участием 200+ учеников. Включало конкурсы, концерты и выставки.',
    category: 'Культура',
    date: 'Декабрь 2024',
    participants: 200,
    results: 'Мероприятие получило высокую оценку от администрации школы и родителей',
    image: 'bg-gradient-to-r from-purple-400 to-pink-400',
  },
  {
    id: 2,
    title: 'Турнир по баскетболу',
    description: 'Организация межклассового турнира с участием 12 команд. Полный цикл от планирования до награждения.',
    category: 'Спорт',
    date: 'Ноябрь 2024',
    participants: 120,
    results: 'Повышение интереса к спорту среди учеников на 40%',
    image: 'bg-gradient-to-r from-green-400 to-blue-400',
  },
  {
    id: 3,
    title: 'Волонтерская акция "Помощь детям"',
    description: 'Организация благотворительной акции по сбору средств и игрушек для детского дома.',
    category: 'Волонтерство',
    date: 'Октябрь 2024',
    participants: 80,
    results: 'Собрано 50,000 тенге и 200+ игрушек',
    image: 'bg-gradient-to-r from-red-400 to-orange-400',
  },
]

export default function PortfolioPage() {
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">Портфолио проектов</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Реализованные проекты и мероприятия, которые изменили жизнь школы
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project) => (
            <div key={project.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition">
              <div className={`${project.image} h-48 flex items-center justify-center`}>
                <Award className="h-16 w-16 text-white opacity-80" />
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-primary-600">{project.category}</span>
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="h-4 w-4 mr-1" />
                    {project.date}
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{project.title}</h3>
                <p className="text-gray-600 mb-4">{project.description}</p>
                
                <div className="flex items-center text-sm text-gray-500 mb-4">
                  <Users className="h-4 w-4 mr-2" />
                  {project.participants} участников
                </div>

                <div className="border-t pt-4">
                  <div className="text-sm font-semibold text-gray-900 mb-1">Результаты:</div>
                  <div className="text-sm text-gray-600">{project.results}</div>
                </div>

                <button className="mt-4 w-full bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition flex items-center justify-center">
                  Подробнее
                  <ExternalLink className="ml-2 h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Статистика */}
        <section className="mt-16 bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Статистика проектов</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary-600 mb-2">50+</div>
              <div className="text-gray-600">Реализованных проектов</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary-600 mb-2">5000+</div>
              <div className="text-gray-600">Участников мероприятий</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary-600 mb-2">200+</div>
              <div className="text-gray-600">Реализованных идей</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary-600 mb-2">98%</div>
              <div className="text-gray-600">Успешных проектов</div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

