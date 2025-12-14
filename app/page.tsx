import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Trophy, Users, Shield, Zap, BookOpen, Gift } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <header className="fixed w-full bg-white/80 backdrop-blur-md z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
                S1
              </div>
              <span className="font-bold text-xl text-gray-900">SCH1</span>
            </div>
            
            <nav className="hidden md:flex gap-8">
              <Link href="#features" className="text-gray-600 hover:text-indigo-600 transition">Возможности</Link>
              <Link href="#how-it-works" className="text-gray-600 hover:text-indigo-600 transition">Как это работает</Link>
              <Link href="#stats" className="text-gray-600 hover:text-indigo-600 transition">Статистика</Link>
            </nav>

            <div className="flex items-center gap-4">
              <Link 
                href="/sch1/login"
                className="text-gray-900 hover:text-indigo-600 font-medium px-4 py-2"
              >
                Войти
              </Link>
              <Link
                href="/sch1/login" // В демо ведет на логин
                className="bg-indigo-600 text-white px-5 py-2 rounded-full hover:bg-indigo-700 transition font-medium shadow-lg shadow-indigo-200"
              >
                Демо
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Background Blobs */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-gradient-to-r from-indigo-200/30 to-purple-200/30 rounded-full blur-3xl -z-10" />

        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white border border-indigo-100 rounded-full px-4 py-1.5 mb-8 shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            <span className="text-sm font-medium text-gray-600">Уже используют 700+ учеников</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 tracking-tight mb-6">
            Превращаем школьное <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
              самоуправление
            </span>
            {' '}в игру
          </h1>

          <p className="mt-6 text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Геймификация, честная конкуренция и AI-помощник для мотивации учеников. 
            Без коррупции. Без блата. Только заслуги.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/sch1"
              className="w-full sm:w-auto px-8 py-4 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition shadow-xl hover:shadow-2xl hover:-translate-y-1"
            >
              Попробовать бесплатно
              <ArrowRight className="inline-block ml-2 h-5 w-5" />
            </Link>
            <Link
              href="#demo"
              className="w-full sm:w-auto px-8 py-4 bg-white text-gray-900 border border-gray-200 rounded-xl font-semibold hover:bg-gray-50 transition shadow-md hover:shadow-lg"
            >
              Смотреть видео
            </Link>
          </div>

          {/* Feature Pills */}
          <div className="mt-12 flex flex-wrap justify-center gap-3">
            {[
              { icon: '🎮', text: 'Геймификация' },
              { icon: '🤖', text: 'AI-помощник' },
              { icon: '🏆', text: 'Честный рейтинг' },
              { icon: '📜', text: 'Цифровые сертификаты' }
            ].map((item, idx) => (
              <div key={idx} className="flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-gray-200 shadow-sm text-sm font-medium text-gray-700">
                <span>{item.icon}</span>
                {item.text}
              </div>
            ))}
          </div>
        </div>

        {/* Dashboard Preview */}
        <div className="mt-20 mx-auto max-w-6xl relative">
          <div className="absolute inset-0 bg-gradient-to-t from-indigo-50 via-transparent to-transparent z-10" />
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-2 transform rotate-1 hover:rotate-0 transition duration-500">
            <Image 
              src="/dashboard-preview.png" 
              alt="SCH1 Dashboard" 
              width={1200} 
              height={675}
              className="rounded-xl w-full h-auto"
              priority
            />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section id="stats" className="py-20 bg-white border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            {[
              { value: '5,000+', label: 'Выполнено задач', icon: <Trophy className="w-6 h-6 text-yellow-500" /> },
              { value: '95%', label: 'Вовлеченность', icon: <Users className="w-6 h-6 text-blue-500" /> },
              { value: '3x', label: 'Рост активности', icon: <Zap className="w-6 h-6 text-purple-500" /> },
            ].map((stat, idx) => (
              <div key={idx} className="p-6 rounded-2xl bg-gray-50 border border-gray-100">
                <div className="flex justify-center mb-4">{stat.icon}</div>
                <div className="text-4xl font-bold text-gray-900 mb-2">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Всё что нужно для мотивации</h2>
            <p className="text-xl text-gray-600">Полный набор инструментов в одной платформе</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
              icon="🎮" 
              title="Игровая Система" 
              description="XP/EP баллы, ранги от 'Новичка' до 'Легенды', стрики активности и достижения."
              features={['7 рангов', '150+ ачивок', 'Магазин наград']}
            />
            <FeatureCard 
              icon="🤖" 
              title="AI Ментор" 
              description="Умный помощник на базе RAG. Отвечает на вопросы, генерирует идеи и помогает в учебе."
              features={['База знаний', 'Генерация идей', '24/7 поддержка']}
            />
            <FeatureCard 
              icon="🛡️" 
              title="Anti-Cheat" 
              description="Многоуровневая защита от накрутки. EXIF проверка фото, GPS-верификация."
              features={['Проверка фото', 'Геолокация', 'Умные алгоритмы']}
            />
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="py-20 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Как это работает?</h2>
            <p className="text-xl text-gray-400">Путь от новичка до легенды школы</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { step: '01', title: 'Регистрация', desc: 'Вход через школьную почту. Автоматическое распределение по классам.' },
              { step: '02', title: 'Задачи', desc: 'Выполняй общественные или министерские задачи, получай EP/XP.' },
              { step: '03', title: 'Рост', desc: 'Повышай ранг, открывай новые возможности и привилегии.' },
              { step: '04', title: 'Награды', desc: 'Обменивай баллы на реальные призы в магазине школы.' },
            ].map((item, idx) => (
              <div key={idx} className="relative p-6 border border-gray-800 rounded-2xl bg-gray-800/50">
                <div className="text-5xl font-bold text-gray-700 mb-4 opacity-50">{item.step}</div>
                <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                <p className="text-gray-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
                S1
              </div>
              <span className="font-bold text-xl text-gray-900">SCH1</span>
            </div>
            <div className="text-gray-500 text-sm">
              © 2024 SCH1 Platform. Все права защищены.
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ icon, title, description, features }: { icon: string, title: string, description: string, features: string[] }) {
  return (
    <div className="p-8 bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300 group">
      <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">{icon}</div>
      <h3 className="text-2xl font-bold text-gray-900 mb-3">{title}</h3>
      <p className="text-gray-600 mb-6">{description}</p>
      <ul className="space-y-3">
        {features.map((item, i) => (
          <li key={i} className="flex items-center gap-2 text-sm text-gray-700">
            <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center text-green-600 text-xs">✓</div>
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}
