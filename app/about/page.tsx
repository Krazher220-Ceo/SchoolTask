import Link from 'next/link'
import { ArrowLeft, Award, GraduationCap, Users, Mail, MessageCircle } from 'lucide-react'

export default function AboutPage() {
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
        {/* Главный блок */}
        <section className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="text-center mb-8">
            <div className="w-32 h-32 bg-gradient-to-br from-primary-400 to-indigo-600 rounded-full mx-auto mb-6 flex items-center justify-center">
              <Users className="h-16 w-16 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Кабдуалы Алихан Аязбекұлы</h1>
            <p className="text-xl text-gray-600">Председатель Школьного Парламента • 9 класс, литер Д</p>
          </div>
        </section>

        {/* Биография */}
        <section className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Биография</h2>
          <div className="prose prose-lg max-w-none text-gray-600">
            <p className="mb-4">
              Я активный ученик, который верит в силу образования, лидерства и командной работы. 
              Как председатель Школьного Парламента, я стремлюсь создать среду, где каждый ученик 
              может реализовать свой потенциал и внести вклад в развитие школы.
            </p>
            <p className="mb-4">
              Моя миссия - объединить активных и инициативных учеников, создать платформу для 
              реализации идей и организовать мероприятия, которые запомнятся на всю жизнь.
            </p>
            <p>
              Я убежден, что каждый ученик имеет уникальные таланты и способности, и моя задача - 
              помочь им раскрыться через участие в жизни школы.
            </p>
          </div>
        </section>

        {/* Образование и достижения */}
        <section className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Образование и достижения</h2>
          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <GraduationCap className="h-8 w-8 text-primary-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Образование</h3>
                <p className="text-gray-600">Ученик 9 класса, литер Д</p>
                <p className="text-gray-600">Специализация: IT (Информационные технологии)</p>
                <p className="text-gray-600">КГУ «Школа-лицей №1 отдела образования города Костаная»</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <Award className="h-8 w-8 text-primary-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Достижения</h3>
                <ul className="list-disc list-inside text-gray-600 space-y-1">
                  <li>Председатель Школьного Парламента</li>
                  <li>Более 10+ IT проектов в портфолио</li>
                  <li>Специализация в области информационных технологий</li>
                  <li>Организатор множества школьных мероприятий</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Навыки */}
        <section className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Лидерские качества и навыки</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Лидерство</h3>
              <ul className="text-gray-600 space-y-2">
                <li>✓ Управление командой</li>
                <li>✓ Стратегическое планирование</li>
                <li>✓ Принятие решений</li>
                <li>✓ Мотивация команды</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Организация</h3>
              <ul className="text-gray-600 space-y-2">
                <li>✓ Планирование мероприятий</li>
                <li>✓ Управление проектами</li>
                <li>✓ Работа с людьми</li>
                <li>✓ Коммуникация</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Контакты */}
        <section className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Контактная информация</h2>
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <Mail className="h-6 w-6 text-primary-600" />
              <div>
                <div className="font-semibold text-gray-900">Email</div>
                <div className="text-gray-600">Krazher220@icloud.com</div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <MessageCircle className="h-6 w-6 text-primary-600" />
              <div>
                <div className="font-semibold text-gray-900">Telegram</div>
                <div className="text-gray-600">@krazher220</div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <MessageCircle className="h-6 w-6 text-primary-600" />
              <div>
                <div className="font-semibold text-gray-900">Телефон</div>
                <div className="text-gray-600">+7 705 669 76 77</div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

