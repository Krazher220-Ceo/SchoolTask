import Link from 'next/link'
import { ArrowLeft, Lightbulb, Sparkles } from 'lucide-react'

export default function IdeaFormPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-100">
      {/* Навигация */}
      <nav className="bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link 
              href="/sch1" 
              className="flex items-center space-x-2 text-gray-700 hover:text-primary-600 transition"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Назад</span>
            </Link>
            <div className="flex items-center space-x-2">
              <Lightbulb className="h-8 w-8 text-yellow-500" />
              <span className="text-xl font-bold text-gray-900">Предложение идеи</span>
            </div>
            <div className="w-24"></div>
          </div>
        </div>
      </nav>

      {/* Контент */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Заголовок */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mb-4">
            <Sparkles className="h-8 w-8 text-yellow-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Предложение идеи или мероприятия
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            У вас есть крутая идея для мероприятия или проекта? Поделитесь ею с нами! 
            Лучшие идеи мы обязательно реализуем. После рассмотрения идеи вы получите обратную связь.
          </p>
        </div>

        {/* Информационный блок */}
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 mb-8 rounded-r-lg">
          <div className="flex">
            <div className="flex-shrink-0">
              <Lightbulb className="h-5 w-5 text-yellow-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                <strong>Совет:</strong> Чем подробнее вы опишете свою идею, тем больше шансов, что она будет реализована! 
                Укажите детали, сроки, необходимые ресурсы и вашу готовность помочь в организации.
              </p>
            </div>
          </div>
        </div>

        {/* Форма Google Forms */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="w-full overflow-hidden rounded-lg">
            <iframe 
              src="https://docs.google.com/forms/d/e/1FAIpQLScAu-9yHnqH8GrXA2ap9et_QGFxGHbiX8hoDTCNi3dxUo4PWA/viewform?embedded=true" 
              width="100%" 
              height="3021" 
              frameBorder="0" 
              marginHeight={0} 
              marginWidth={0}
              className="w-full"
              style={{ minHeight: '3021px' }}
            >
              Загрузка…
            </iframe>
          </div>
        </div>

        {/* Дополнительная информация */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Как это работает?</h2>
          <div className="space-y-4 text-gray-600">
            <div className="flex items-start">
              <div className="flex-shrink-0 w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center mr-3 mt-1">
                <span className="text-yellow-600 font-semibold text-sm">1</span>
              </div>
              <div>
                <p className="font-semibold text-gray-900">Отправка идеи</p>
                <p>Заполните форму выше, подробно описав вашу идею, цели и план реализации.</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center mr-3 mt-1">
                <span className="text-yellow-600 font-semibold text-sm">2</span>
              </div>
              <div>
                <p className="font-semibold text-gray-900">Рассмотрение</p>
                <p>Администрация и министерства рассмотрят вашу идею, оценят её реализуемость и актуальность.</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center mr-3 mt-1">
                <span className="text-yellow-600 font-semibold text-sm">3</span>
              </div>
              <div>
                <p className="font-semibold text-gray-900">Обратная связь</p>
                <p>Вы получите обратную связь на указанный email с результатом рассмотрения и дальнейшими шагами.</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center mr-3 mt-1">
                <span className="text-yellow-600 font-semibold text-sm">4</span>
              </div>
              <div>
                <p className="font-semibold text-gray-900">Реализация</p>
                <p>Если идея одобрена, мы свяжемся с вами для обсуждения деталей и начала реализации проекта.</p>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">💡 Примеры хороших идей:</h3>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-start">
                <span className="text-yellow-500 mr-2">•</span>
                <span>Организация тематических дней (День космоса, День науки и т.д.)</span>
              </li>
              <li className="flex items-start">
                <span className="text-yellow-500 mr-2">•</span>
                <span>Волонтерские акции и благотворительные проекты</span>
              </li>
              <li className="flex items-start">
                <span className="text-yellow-500 mr-2">•</span>
                <span>Спортивные турниры и соревнования</span>
              </li>
              <li className="flex items-start">
                <span className="text-yellow-500 mr-2">•</span>
                <span>Культурные мероприятия (концерты, выставки, конкурсы талантов)</span>
              </li>
              <li className="flex items-start">
                <span className="text-yellow-500 mr-2">•</span>
                <span>Образовательные проекты и мастер-классы</span>
              </li>
              <li className="flex items-start">
                <span className="text-yellow-500 mr-2">•</span>
                <span>Идеи по улучшению школьной жизни и инфраструктуры</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

