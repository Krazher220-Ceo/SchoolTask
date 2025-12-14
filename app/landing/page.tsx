'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import FeatureCard from '../components/FeatureCard'

const features = [
  {
    icon: '🎮',
    title: 'Геймификация',
    description: 'Система XP/EP, рангов, стриков и достижений превращает школьную жизнь в увлекательную игру',
    highlights: ['7 рангов', '150+ достижений', 'Дуэли и челленджи']
  },
  {
    icon: '🤖',
    title: 'AI-Помощник',
    description: 'Умный ментор помогает ученикам, отвечает на вопросы и дает персональные рекомендации',
    highlights: ['База знаний', 'Генерация идей', 'Умные напоминания']
  },
  {
    icon: '🛡️',
    title: 'Честная система',
    description: 'Anti-cheat защита и прозрачность начислений исключают коррупцию и блат',
    highlights: ['Проверка фото', 'GPS-верификация', 'Peer verification']
  }
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden px-6 py-20 lg:px-8">
        {/* Animated Background */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-0 -translate-x-1/2 blur-3xl opacity-30">
            <div className="w-[800px] h-[800px] rounded-full bg-gradient-to-r from-indigo-500 to-purple-500" />
          </div>
        </div>

        <div className="mx-auto max-w-7xl text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 inline-flex items-center gap-2 rounded-full bg-indigo-100 px-4 py-2 text-sm font-medium text-indigo-700"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-indigo-500" />
            </span>
            700+ учеников уже используют SCH1
          </motion.div>

          {/* Main Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl font-bold tracking-tight text-gray-900 sm:text-7xl"
          >
            Превращаем школьное
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              {' '}самоуправление{' '}
            </span>
            в увлекательную игру
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-6 text-xl leading-8 text-gray-600 max-w-3xl mx-auto"
          >
            Геймификация, честная конкуренция и AI-помощник для мотивации учеников. 
            Без коррупции. Без блата. Только заслуги.
          </motion.p>

          {/* Features Pills */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8 flex flex-wrap justify-center gap-3"
          >
            {['🎮 Геймификация', '🤖 AI-помощник', '🏆 Честный рейтинг', '📜 Цифровые сертификаты'].map((feature) => (
              <span key={feature} className="px-4 py-2 bg-white rounded-full shadow-sm border border-gray-200 text-sm">
                {feature}
              </span>
            ))}
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-10 flex items-center justify-center gap-4"
          >
            <Link
              href="/sch1/login"
              className="group relative px-8 py-4 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-all hover:scale-105 shadow-lg hover:shadow-xl"
            >
              Попробовать бесплатно
              <span className="ml-2 group-hover:translate-x-1 transition-transform inline-block">→</span>
            </Link>
            
            <button className="px-8 py-4 bg-white text-gray-900 rounded-xl font-semibold hover:bg-gray-50 transition-all border border-gray-200 shadow-sm hover:shadow-md">
              <span className="mr-2">▶</span>
              Смотреть демо
            </button>
          </motion.div>

          {/* Social Proof */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-12 flex items-center justify-center gap-8 text-sm text-gray-600"
          >
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {[1,2,3,4].map(i => (
                  <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 border-2 border-white" />
                ))}
              </div>
              <span>Используют 5+ школ</span>
            </div>
            <div className="flex items-center gap-1">
              {'⭐⭐⭐⭐⭐'.split('').map((star, i) => (
                <span key={i} className="text-yellow-400">{star}</span>
              ))}
              <span className="ml-2">4.9/5 рейтинг</span>
            </div>
          </motion.div>
        </div>

        {/* Animated Dashboard Preview */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-20 mx-auto max-w-6xl"
        >
          <div className="rounded-2xl border border-gray-200 bg-white p-2 shadow-2xl">
            <div className="rounded-lg bg-gradient-to-br from-indigo-100 to-purple-100 h-96 flex items-center justify-center">
              <p className="text-gray-500">Dashboard Preview</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900">
              Всё что нужно для мотивации учеников
            </h2>
            <p className="mt-4 text-xl text-gray-600">
              Полный набор инструментов в одной платформе
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <FeatureCard key={idx} {...feature} />
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-5xl font-bold text-indigo-600 mb-2">5,000+</div>
              <div className="text-gray-600">Выполнено задач</div>
            </div>
            <div>
              <div className="text-5xl font-bold text-purple-600 mb-2">95%</div>
              <div className="text-gray-600">Вовлеченность</div>
            </div>
            <div>
              <div className="text-5xl font-bold text-pink-600 mb-2">3x</div>
              <div className="text-gray-600">Рост активности</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-4">SCH1</h3>
            <p className="text-gray-400 mb-6">Инновационная EdTech платформа для школьного самоуправления</p>
            <div className="flex justify-center gap-4">
              <Link href="/sch1/login" className="text-gray-400 hover:text-white transition">
                Войти
              </Link>
              <Link href="/about" className="text-gray-400 hover:text-white transition">
                О нас
              </Link>
              <Link href="/contacts" className="text-gray-400 hover:text-white transition">
                Контакты
              </Link>
            </div>
            <p className="mt-8 text-gray-500 text-sm">
              &copy; 2024 SCH1. Все права защищены.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

