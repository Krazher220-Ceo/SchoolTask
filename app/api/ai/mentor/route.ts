import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// Базовая версия AI-ментора с Groq API
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
    }

    const body = await request.json()
    const { question, context } = body

    if (!question) {
      return NextResponse.json({ error: 'Вопрос обязателен' }, { status: 400 })
    }

    // Используем Groq API (бесплатный tier: 14,400 запросов/день)
    const GROQ_API_KEY = process.env.GROQ_API_KEY
    if (!GROQ_API_KEY) {
      // Fallback на простой ответ, если API ключ не настроен
      return NextResponse.json({
        answer: 'AI-ментор временно недоступен. Обратитесь к куратору парламента.',
        sources: [],
      })
    }

    // База знаний (в будущем можно расширить с RAG)
    const knowledgeBase = `
Школьный Парламент - это орган самоуправления учеников.

Основные министерства:
- Права и порядка: дежурство, порядок, безопасность
- Информации: соцсети, фото, видео, контент
- Спорта: спортивные мероприятия, секции
- Заботы: волонтерство, помощь младшим

Система рейтингов:
- XP (Experience Points) - для членов парламента
- EP (Event Points) - для всех учеников
- Ранги от "Новичок" до "Легенда"

Для организации мероприятия нужно:
1. Зарегистрировать минимум за 2 недели
2. Подготовить план и бюджет
3. Согласовать с куратором
4. Собрать команду
5. Провести мероприятие
6. Загрузить отчет с фото
`

    // Формируем промпт
    const prompt = `Ты - AI-ментор Школьного Парламента. Помогаешь ученикам разобраться в работе парламента и организации мероприятий.

База знаний:
${knowledgeBase}

Контекст пользователя: ${context || 'Нет дополнительного контекста'}

Вопрос ученика: ${question}

Ответь подробно и дружелюбно на русском языке. Если вопрос не связан с парламентом, вежливо перенаправь к соответствующей теме.`

    // Запрос к Groq API
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-70b-versatile', // Бесплатная модель Groq
        messages: [
          {
            role: 'system',
            content: 'Ты дружелюбный AI-ментор Школьного Парламента. Отвечаешь на русском языке, помогаешь ученикам разобраться в работе парламента.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('Groq API error:', error)
      return NextResponse.json({
        answer: 'Ошибка при обращении к AI. Попробуйте позже или обратитесь к куратору.',
        sources: [],
      })
    }

    const data = await response.json()
    const answer = data.choices[0]?.message?.content || 'Не удалось получить ответ от AI.'

    return NextResponse.json({
      answer,
      sources: [], // В будущем можно добавить источники из RAG
      model: 'llama-3.1-70b-versatile',
    })
  } catch (error) {
    console.error('Ошибка AI-ментора:', error)
    return NextResponse.json(
      {
        answer: 'Произошла ошибка. Попробуйте позже или обратитесь к куратору парламента.',
        sources: [],
      },
      { status: 500 }
    )
  }
}

