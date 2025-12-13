import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Заполнение магазина товарами...')

  // Цвета никнейма
  const nicknameColors = [
    {
      name: 'Красный никнейм',
      description: 'Твое имя будет выделяться красным цветом',
      category: 'NICKNAME_COLOR',
      price: 500,
      duration: 7,
      data: JSON.stringify({ type: 'solid', color: 'red' }),
    },
    {
      name: 'Синий никнейм',
      description: 'Твое имя будет выделяться синим цветом',
      category: 'NICKNAME_COLOR',
      price: 500,
      duration: 7,
      data: JSON.stringify({ type: 'solid', color: 'blue' }),
    },
    {
      name: 'Зеленый никнейм',
      description: 'Твое имя будет выделяться зеленым цветом',
      category: 'NICKNAME_COLOR',
      price: 500,
      duration: 7,
      data: JSON.stringify({ type: 'solid', color: 'green' }),
    },
    {
      name: 'Огненный градиент',
      description: 'VIP эффект: твое имя с переливом оранжево-красного градиента',
      category: 'NICKNAME_COLOR',
      price: 800,
      duration: 7,
      data: JSON.stringify({ type: 'gradient', gradient: 'fire' }),
    },
    {
      name: 'Киберпанк градиент',
      description: 'VIP эффект: неон-фиолетовый градиент для твоего имени',
      category: 'NICKNAME_COLOR',
      price: 800,
      duration: 7,
      data: JSON.stringify({ type: 'gradient', gradient: 'cyberpunk' }),
    },
  ]

  // Рамки аватара
  const avatarBorders = [
    {
      name: 'Пульсирующая рамка',
      description: 'Тонкая линия вокруг аватара, которая "дышит"',
      category: 'AVATAR_BORDER',
      price: 800,
      duration: 14,
      data: JSON.stringify({ type: 'pulse' }),
    },
    {
      name: 'Королевская рамка',
      description: 'Золотая рамка с иконкой короны - для настоящих лидеров',
      category: 'AVATAR_BORDER',
      price: 1000,
      duration: 14,
      data: JSON.stringify({ type: 'crown' }),
    },
    {
      name: 'Глитч-рамка',
      description: 'Рамка с эффектом помех - для тех, кто любит стиль',
      category: 'AVATAR_BORDER',
      price: 900,
      duration: 14,
      data: JSON.stringify({ type: 'glitch' }),
    },
  ]

  // Уникальные титулы
  const customTitles = [
    {
      name: 'Гроза дедлайнов',
      description: 'Покажи всем, что ты всегда успеваешь',
      category: 'CUSTOM_TITLE',
      price: 1000,
      duration: 30,
      data: JSON.stringify({ title: 'Гроза дедлайнов' }),
    },
    {
      name: 'Главный по мемам',
      description: 'Титул для самых креативных',
      category: 'CUSTOM_TITLE',
      price: 1000,
      duration: 30,
      data: JSON.stringify({ title: 'Главный по мемам' }),
    },
    {
      name: 'Спящий режим',
      description: 'Для тех, кто ценит отдых',
      category: 'CUSTOM_TITLE',
      price: 1000,
      duration: 30,
      data: JSON.stringify({ title: 'Спящий режим' }),
    },
    {
      name: 'Future President',
      description: 'Титул для будущих лидеров',
      category: 'CUSTOM_TITLE',
      price: 1500,
      duration: 30,
      data: JSON.stringify({ title: 'Future President' }),
    },
  ]

  // Закреп в шапке
  const spotlight = [
    {
      name: 'Закреп на главной',
      description: 'Стань героем дня! Твое фото и цитата на главной странице на 24 часа',
      category: 'SPOTLIGHT',
      price: 2000,
      duration: 1,
      data: JSON.stringify({ quote: null }), // Пользователь может указать свою цитату
    },
  ]

  // Заморозка стрика
  const streakFreeze = [
    {
      name: 'Заморозка стрика',
      description: 'Позволяет пропустить один день без потери огонька',
      category: 'STREAK_FREEZE',
      price: 300,
      duration: 0, // Одноразовое использование
      data: JSON.stringify({}),
    },
  ]

  const allItems = [
    ...nicknameColors,
    ...avatarBorders,
    ...customTitles,
    ...spotlight,
    ...streakFreeze,
  ]

  for (const item of allItems) {
    const existing = await prisma.shopItem.findFirst({
      where: {
        name: item.name,
        category: item.category,
      },
    })

    if (existing) {
      await prisma.shopItem.update({
        where: { id: existing.id },
        data: {
          description: item.description,
          price: item.price,
          duration: item.duration,
          data: item.data,
          isActive: true,
        },
      })
    } else {
      await prisma.shopItem.create({
        data: {
          name: item.name,
          description: item.description,
          category: item.category,
          price: item.price,
          duration: item.duration,
          data: item.data,
          isActive: true,
        },
      })
    }
  }

  console.log(`✅ Создано ${allItems.length} товаров в магазине`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

