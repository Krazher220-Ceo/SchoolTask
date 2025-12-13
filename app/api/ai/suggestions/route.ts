import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// Генерация идей для мероприятий на основе профиля пользователя
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
    }

    const body = await request.json()
    const { preferences } = body

    // Получаем историю задач пользователя
    const userTasks = await prisma.task.findMany({
      where: {
        OR: [
          { assignedToId: session.user.id },
          { createdById: session.user.id },
        ],
      },
      include: {
        reports: {
          where: {
            status: 'APPROVED',
          },
        },
      },
      take: 20,
    })

    // Анализируем интересы пользователя
    const interests: string[] = []
    userTasks.forEach(task => {
      if (task.ministry) {
        interests.push(task.ministry)
      }
      if (task.tags) {
        try {
          const tags = JSON.parse(task.tags)
          interests.push(...tags)
        } catch (e) {
          // Игнорируем ошибки парсинга
        }
      }
    })

    // Подсчитываем популярные категории
    const categoryCount: Record<string, number> = {}
    interests.forEach(interest => {
      categoryCount[interest] = (categoryCount[interest] || 0) + 1
    })

    const topInterests = Object.entries(categoryCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([category]) => category)

    // Генерируем идеи на основе интересов
    const ideas = generateIdeas(topInterests, preferences)

    return NextResponse.json({
      ideas,
      basedOn: topInterests,
    })
  } catch (error) {
    console.error('Ошибка генерации идей:', error)
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 })
  }
}

function generateIdeas(interests: string[], preferences?: any): Array<{
  title: string
  description: string
  category: string
  estimatedEP: number
  difficulty: 'Легкая' | 'Средняя' | 'Высокая'
  requirements: string[]
}> {
  const allIdeas: Record<string, Array<{
    title: string
    description: string
    estimatedEP: number
    difficulty: 'Легкая' | 'Средняя' | 'Высокая'
    requirements: string[]
  }>> = {
    INFORMATION: [
      {
        title: 'Фотоквест по школе',
        description: 'Организуй квест с поиском локаций по фотографиям. Участники должны найти и сфотографировать указанные места.',
        estimatedEP: 300,
        difficulty: 'Средняя',
        requirements: ['Минимум 10 локаций', '30-50 участников', 'Призы для победителей'],
      },
      {
        title: 'Весенний фотофестиваль',
        description: 'Проведи конкурс фотографий на весеннюю тематику. Организуй выставку лучших работ.',
        estimatedEP: 400,
        difficulty: 'Средняя',
        requirements: ['Жюри из 3-5 человек', 'Выставка в холле школы', 'Награждение победителей'],
      },
      {
        title: 'Школьный TikTok-челлендж',
        description: 'Создай вирусный челлендж для школьного TikTok. Участники снимают видео по заданному формату.',
        estimatedEP: 250,
        difficulty: 'Легкая',
        requirements: ['Придумать формат', 'Минимум 20 участников', 'Публикация в соцсетях'],
      },
    ],
    SPORT: [
      {
        title: 'Турнир по настольному теннису',
        description: 'Организуй соревнование по настольному теннису. Пригласи участников и судей.',
        estimatedEP: 350,
        difficulty: 'Средняя',
        requirements: ['Минимум 16 участников', 'Судьи', 'Призы для топ-3'],
      },
      {
        title: 'Спортивная эстафета',
        description: 'Проведи веселую эстафету между классами. Разные этапы: бег, прыжки, метание.',
        estimatedEP: 400,
        difficulty: 'Средняя',
        requirements: ['Минимум 5 команд', 'Инвентарь', 'Судьи на этапах'],
      },
    ],
    CARE: [
      {
        title: 'Благотворительная акция "Доброе сердце"',
        description: 'Собери вещи, игрушки или канцелярию для детского дома. Организуй пункт сбора.',
        estimatedEP: 500,
        difficulty: 'Средняя',
        requirements: ['Пункт сбора', 'Минимум 50 участников', 'Транспортировка'],
      },
      {
        title: 'Помощь младшим классам',
        description: 'Организуй группу помощи для учеников начальной школы. Помощь с уроками, игры на переменах.',
        estimatedEP: 300,
        difficulty: 'Легкая',
        requirements: ['Минимум 10 волонтеров', 'Расписание', 'Согласование с учителями'],
      },
    ],
    default: [
      {
        title: 'Организация мастер-класса',
        description: 'Проведи мастер-класс по своему хобби или навыку. Поделись знаниями с другими учениками.',
        estimatedEP: 200,
        difficulty: 'Легкая',
        requirements: ['Минимум 15 слушателей', 'Материалы', 'Помещение'],
      },
      {
        title: 'Школьный флешмоб',
        description: 'Организуй массовый флешмоб на перемене или после уроков. Придумай танец или акцию.',
        estimatedEP: 250,
        difficulty: 'Средняя',
        requirements: ['Минимум 30 участников', 'Хореография', 'Музыка', 'Видеосъемка'],
      },
    ],
  }

  // Выбираем идеи на основе интересов
  const selectedIdeas: any[] = []
  
  interests.forEach(interest => {
    const ideasForInterest = allIdeas[interest] || allIdeas.default
    selectedIdeas.push(...ideasForInterest.slice(0, 2))
  })

  // Если идей мало, добавляем из default
  if (selectedIdeas.length < 5) {
    selectedIdeas.push(...allIdeas.default.slice(0, 5 - selectedIdeas.length))
  }

  // Убираем дубликаты и возвращаем топ-5
  const uniqueIdeas = selectedIdeas
    .filter((idea, index, self) => 
      index === self.findIndex(i => i.title === idea.title)
    )
    .slice(0, 5)
    .map(idea => ({
      ...idea,
      category: interests[0] || 'Общее',
    }))

  return uniqueIdeas
}

