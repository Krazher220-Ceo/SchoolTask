import Link from 'next/link'
import { ArrowLeft, Users, FileText } from 'lucide-react'

export default function RegistrationFormPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
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
              <Users className="h-8 w-8 text-primary-600" />
              <span className="text-xl font-bold text-gray-900">Заявка на регистрацию</span>
            </div>
            <div className="w-24"></div>
          </div>
        </div>
      </nav>

      {/* Контент */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Заголовок */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
            <FileText className="h-8 w-8 text-primary-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Заявка на регистрацию в Школьный Парламент
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Заполните форму ниже, чтобы стать частью активного сообщества школы. 
            После рассмотрения заявки администратором вы получите уведомление на указанный email.
          </p>
        </div>

        {/* Информационный блок */}
        <div className="bg-blue-50 border-l-4 border-blue-400 p-6 mb-8 rounded-r-lg">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-700">
                <strong>Важно:</strong> Заполните все обязательные поля. После подачи заявки администратор рассмотрит её в течение 1-2 рабочих дней. 
                Мы ценим вашу инициативность и готовность участвовать в жизни школы!
              </p>
            </div>
          </div>
        </div>

        {/* Форма Google Forms */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="w-full overflow-hidden rounded-lg">
            <iframe 
              src="https://docs.google.com/forms/d/e/1FAIpQLScOm6I8SLnakj7Jn9JuYXVyEUgw21kkCP5fzm0K1bGvrA9N6g/viewform?embedded=true" 
              width="100%" 
              height="1617" 
              frameBorder="0" 
              marginHeight={0} 
              marginWidth={0}
              className="w-full"
              style={{ minHeight: '1617px' }}
            >
              Загрузка…
            </iframe>
          </div>
        </div>

        {/* Дополнительная информация */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Что дальше?</h2>
          <div className="space-y-4 text-gray-600">
            <div className="flex items-start">
              <div className="flex-shrink-0 w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center mr-3 mt-1">
                <span className="text-primary-600 font-semibold text-sm">1</span>
              </div>
              <div>
                <p className="font-semibold text-gray-900">Подача заявки</p>
                <p>Заполните форму выше и отправьте заявку. Убедитесь, что все данные указаны корректно.</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center mr-3 mt-1">
                <span className="text-primary-600 font-semibold text-sm">2</span>
              </div>
              <div>
                <p className="font-semibold text-gray-900">Рассмотрение заявки</p>
                <p>Администратор рассмотрит вашу заявку в течение 1-2 рабочих дней.</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center mr-3 mt-1">
                <span className="text-primary-600 font-semibold text-sm">3</span>
              </div>
              <div>
                <p className="font-semibold text-gray-900">Уведомление</p>
                <p>Вы получите уведомление на указанный email о результате рассмотрения заявки.</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center mr-3 mt-1">
                <span className="text-primary-600 font-semibold text-sm">4</span>
              </div>
              <div>
                <p className="font-semibold text-gray-900">Начало работы</p>
                <p>После одобрения заявки вы получите доступ к системе и сможете начать работу в парламенте.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


