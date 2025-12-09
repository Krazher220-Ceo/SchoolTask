/**
 * Telegram Bot для интеграции с системой парламента
 * 
 * Функционал:
 * 1. Прием фото/видео от учеников для отчетов
 * 2. Отправка уведомлений министерствам о новых задачах
 * 3. Проверка и одобрение отчетов через бота
 * 
 * Для настройки:
 * 1. Создайте бота через @BotFather в Telegram
 * 2. Получите токен бота
 * 3. Добавьте TELEGRAM_BOT_TOKEN в .env.local
 * 4. Настройте webhook или используйте polling
 */

import { prisma } from '@/lib/prisma'

// Типы для Telegram API
interface TelegramUser {
  id: number
  first_name: string
  last_name?: string
  username?: string
}

interface TelegramMessage {
  message_id: number
  from: TelegramUser
  chat: { id: number; type: string }
  text?: string
  photo?: Array<{ file_id: string; file_size: number }>
  video?: { file_id: string; file_size: number }
  document?: { file_id: string; file_name: string }
}

interface TelegramUpdate {
  update_id: number
  message?: TelegramMessage
  callback_query?: {
    id: string
    from: TelegramUser
    data: string
    message?: TelegramMessage
  }
}

// Telegram Bot API базовый URL
const TELEGRAM_API = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}`

/**
 * Отправка сообщения пользователю
 */
export async function sendTelegramMessage(chatId: number, text: string, options?: {
  reply_markup?: any
  parse_mode?: 'HTML' | 'Markdown'
}) {
  try {
    const response = await fetch(`${TELEGRAM_API}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        ...options,
      }),
    })

    return await response.json()
  } catch (error) {
    console.error('Ошибка отправки сообщения в Telegram:', error)
    return null
  }
}

/**
 * Отправка фото пользователю
 */
export async function sendTelegramPhoto(chatId: number, photo: string, caption?: string) {
  try {
    const response = await fetch(`${TELEGRAM_API}/sendPhoto`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        photo,
        caption,
      }),
    })

    return await response.json()
  } catch (error) {
    console.error('Ошибка отправки фото в Telegram:', error)
    return null
  }
}

/**
 * Получение файла из Telegram
 */
export async function getTelegramFile(fileId: string) {
  try {
    const response = await fetch(`${TELEGRAM_API}/getFile?file_id=${fileId}`)
    const data = await response.json()
    
    if (data.ok) {
      return `https://api.telegram.org/file/bot${process.env.TELEGRAM_BOT_TOKEN}/${data.result.file_path}`
    }
    return null
  } catch (error) {
    console.error('Ошибка получения файла из Telegram:', error)
    return null
  }
}

/**
 * Обработка входящего сообщения от пользователя
 */
export async function handleTelegramMessage(update: TelegramUpdate) {
  if (!update.message) return

  const message = update.message
  const chatId = message.chat.id
  const userId = message.from.id
  const text = message.text || ''

  // Поиск пользователя по Telegram ID
  const user = await prisma.user.findUnique({
    where: { telegramId: userId.toString() },
    include: {
      parliamentMember: true,
    },
  })

  // Если пользователь не найден, предлагаем связать аккаунт
  if (!user) {
    const startParam = text.split(' ')[1]
    if (startParam === 'link') {
      // Пользователь пытается привязать через /start link, но не авторизован на сайте
      return await sendTelegramMessage(
        chatId,
        `🔗 Привязка аккаунта\n\n` +
        `Для привязки Telegram аккаунта:\n` +
        `1. Войдите на сайт sch1\n` +
        `2. Перейдите в раздел "Привязка Telegram"\n` +
        `3. Введите ваш Telegram ID: ${userId}\n` +
        `4. Бот отправит вам код подтверждения\n` +
        `5. Введите код на сайте\n\n` +
        `Или обратитесь к администратору.`
      )
    }

    // Проверяем, не является ли сообщение 6-значным кодом
    if (/^\d{6}$/.test(text.trim())) {
      const code = text.trim()
      // Ищем код в БД
      const linkCode = await prisma.telegramLinkCode.findUnique({
        where: { code },
        include: { user: true },
      })

      if (!linkCode) {
        return await sendTelegramMessage(
          chatId,
          `❌ Неверный код подтверждения. Проверьте правильность ввода.`
        )
      }

      if (linkCode.used) {
        return await sendTelegramMessage(
          chatId,
          `❌ Этот код уже использован. Запросите новый код на сайте.`
        )
      }

      if (linkCode.expiresAt < new Date()) {
        return await sendTelegramMessage(
          chatId,
          `❌ Код истек. Запросите новый код на сайте.`
        )
      }

      if (linkCode.telegramId !== userId.toString()) {
        return await sendTelegramMessage(
          chatId,
          `❌ Этот код не для вашего Telegram аккаунта.`
        )
      }

      // Привязываем аккаунт
      await prisma.user.update({
        where: { id: linkCode.userId },
        data: {
          telegramId: userId.toString(),
          telegramUsername: message.from.username,
        },
      })

      // Помечаем код как использованный
      await prisma.telegramLinkCode.update({
        where: { id: linkCode.id },
        data: { used: true },
      })

      return await sendTelegramMessage(
        chatId,
        `✅ Telegram аккаунт успешно привязан!\n\n` +
        `Теперь вы будете получать уведомления о задачах и отчетах.`
      )
    }

    // Проверяем, не является ли сообщение ID профиля (cuid формат)
    if (text.trim().length > 10 && text.trim().length < 30) {
      // Ищем пользователя по ID
      const targetUser = await prisma.user.findUnique({
        where: { id: text.trim() },
      })

      if (!targetUser) {
        return await sendTelegramMessage(
          chatId,
          `❌ Пользователь с таким ID не найден. Проверьте правильность ввода.\n\n` +
          `Ваш Telegram ID: ${userId}\n` +
          `Отправьте этот ID на сайте для получения кода.`
        )
      }

      // Проверяем, не привязан ли уже этот Telegram ID к другому пользователю
      const existingUser = await prisma.user.findUnique({
        where: { telegramId: userId.toString() },
      })

      if (existingUser && existingUser.id !== targetUser.id) {
        return await sendTelegramMessage(
          chatId,
          `❌ Этот Telegram аккаунт уже привязан к другому пользователю.\n\n` +
          `Текущий аккаунт: ${existingUser.name}\n` +
          `Запрошенный аккаунт: ${targetUser.name}\n\n` +
          `Для привязки к другому аккаунту сначала отвяжите текущий.`
        )
      }

      // Удаляем старые неиспользованные коды для этого пользователя и Telegram ID
      await prisma.telegramLinkCode.deleteMany({
        where: {
          userId: targetUser.id,
          telegramId: userId.toString(),
          used: false,
          OR: [
            { expiresAt: { lt: new Date() } },
          ],
        },
      })

      // Генерируем 6-значный код
      const code = Math.floor(100000 + Math.random() * 900000).toString()
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 минут

      // Создаем код подтверждения
      await prisma.telegramLinkCode.create({
        data: {
          userId: targetUser.id,
          telegramId: userId.toString(),
          code,
          expiresAt,
        },
      })

      return await sendTelegramMessage(
        chatId,
        `🔐 Код подтверждения\n\n` +
        `Ваш код: ${code}\n\n` +
        `Введите этот код на сайте в разделе "Привязка Telegram".\n` +
        `Код действителен в течение 10 минут.\n\n` +
        `Если код не пришел, используйте функцию "Отправить код повторно" на сайте.`
      )
    }

    return await sendTelegramMessage(
      chatId,
      `👋 Привет! Я бот Школьного Парламента.\n\n` +
      `Для использования бота необходимо связать ваш Telegram аккаунт с аккаунтом на сайте.\n\n` +
      `Ваш Telegram ID: ${userId}\n\n` +
      `Для привязки:\n` +
      `1. Войдите на сайт\n` +
      `2. Перейдите в раздел "Привязка Telegram"\n` +
      `3. Введите ваш Telegram ID: ${userId}\n` +
      `4. Бот отправит вам код подтверждения\n` +
      `5. Введите код на сайте\n\n` +
      `Или отправьте ID вашего профиля боту, и он отправит вам код.`
    )
  }

  // Обработка команд
  if (text.startsWith('/')) {
    const command = text.split(' ')[0]

    switch (command) {
      case '/start':
        const startParam = text.split(' ')[1]
        if (startParam === 'link') {
          // Привязка аккаунта через команду /start link
          // Обновляем Telegram ID пользователя
          await prisma.user.update({
            where: { id: user.id },
            data: {
              telegramId: userId.toString(),
              telegramUsername: message.from.username,
            },
          })
          return await sendTelegramMessage(
            chatId,
            `✅ Telegram аккаунт успешно привязан!\n\n` +
            `Теперь вы будете получать уведомления о задачах и отчетах.`
          )
        }
        return await sendTelegramMessage(
          chatId,
          `👋 Привет, ${user.name}!\n\n` +
          `Я бот Школьного Парламента. Вот что я умею:\n\n` +
          `/tasks - Мои задачи\n` +
          `/report - Загрузить фото балла\n` +
          `/link - Привязать аккаунт\n` +
          `/help - Помощь`
        )

      case '/link':
        // Привязка аккаунта
        await prisma.user.update({
          where: { id: user.id },
          data: {
            telegramId: userId.toString(),
            telegramUsername: message.from.username,
          },
        })
        return await sendTelegramMessage(
          chatId,
          `✅ Telegram аккаунт успешно привязан!\n\n` +
          `Теперь вы будете получать уведомления о задачах и отчетах.`
        )

      case '/tasks':
        // Получаем задачи пользователя
        const tasks = await prisma.task.findMany({
          where: {
            OR: [
              { assignedToId: user.id },
              { 
                targetAudience: 'STUDENT',
                assignedToId: null, // Задачи для всех учеников
              },
            ],
            status: { in: ['NEW', 'IN_PROGRESS'] },
          },
          take: 10,
          orderBy: { createdAt: 'desc' },
        })

        if (tasks.length === 0) {
          return await sendTelegramMessage(chatId, '✅ У вас нет активных задач!')
        }

        let tasksText = '📋 Ваши задачи:\n\n'
        tasks.forEach((task, idx) => {
          tasksText += `${idx + 1}. ${task.title}\n`
          if (task.deadline) {
            tasksText += `   📅 До: ${new Date(task.deadline).toLocaleDateString('ru-RU')}\n`
          }
          if (task.targetAudience === 'STUDENT' && task.epReward) {
            tasksText += `   🎁 Награда: ${task.epReward} EP\n`
          } else if (task.xpReward) {
            tasksText += `   🎁 Награда: ${task.xpReward} XP\n`
          }
          tasksText += '\n'
        })

        return await sendTelegramMessage(chatId, tasksText)

      case '/report':
        return await sendTelegramMessage(
          chatId,
          `📸 Загрузка фото балла\n\n` +
          `Отправьте фото вашего балла за предмет или СОР.\n\n` +
          `Формат: отправьте фото с подписью в формате:\n` +
          `"Математика 10" или "СОР История 9"\n\n` +
          `Вы получите EP = (балл - 1)`
        )

      case '/help':
        return await sendTelegramMessage(
          chatId,
          `ℹ️ Помощь по боту\n\n` +
          `/start - Начать работу\n` +
          `/tasks - Мои задачи\n` +
          `/report - Загрузить фото балла\n` +
          `/link - Привязать аккаунт\n` +
          `/help - Эта справка\n\n` +
          `Для загрузки фото балла:\n` +
          `1. Отправьте фото\n` +
          `2. В подписи укажите предмет и балл\n` +
          `Пример: "Математика 10"`
        )

      default:
        return await sendTelegramMessage(chatId, '❓ Неизвестная команда. Используйте /help')
    }
  }

  // Обработка фото с подписью (отчет о балле)
  if (message.photo && text) {
    const photo = message.photo[message.photo.length - 1] // Берем самое большое фото
    const fileUrl = await getTelegramFile(photo.file_id)

    if (!fileUrl) {
      return await sendTelegramMessage(chatId, '❌ Ошибка загрузки фото. Попробуйте еще раз.')
    }

    // Парсим подпись: "Математика 10" или "СОР История 9"
    const match = text.match(/(?:СОР\s+)?(.+?)\s+(\d+)/i)
    
    if (!match) {
      return await sendTelegramMessage(
        chatId,
        '❌ Неверный формат. Используйте: "Предмет Балл" или "СОР Предмет Балл"\n' +
        'Пример: "Математика 10" или "СОР История 9"'
      )
    }

    const [, subject, gradeStr] = match
    const grade = parseInt(gradeStr)
    const isSOR = text.toLowerCase().includes('сор')
    const epAmount = Math.max(0, grade - 1)

    // Создаем отчет
    try {
      const report = await prisma.studentReport.create({
        data: {
          userId: user.id,
          type: isSOR ? 'SOR' : 'GRADE_PHOTO',
          subject: subject.trim(),
          grade,
          photoUrl: fileUrl,
          telegramFileId: photo.file_id,
          epAmount,
          status: 'PENDING',
        },
      })

      return await sendTelegramMessage(
        chatId,
        `✅ Отчет отправлен на проверку!\n\n` +
        `Предмет: ${subject.trim()}\n` +
        `Балл: ${grade}\n` +
        `Будет начислено: ${epAmount} EP\n\n` +
        `Ожидайте проверки администратором.`
      )
    } catch (error) {
      console.error('Ошибка создания отчета:', error)
      return await sendTelegramMessage(chatId, '❌ Ошибка при создании отчета. Попробуйте позже.')
    }
  }

  // Если просто фото без подписи
  if (message.photo && !text) {
    return await sendTelegramMessage(
      chatId,
      '📸 Фото получено!\n\n' +
      'Отправьте подпись к фото в формате:\n' +
      '"Предмет Балл" или "СОР Предмет Балл"\n\n' +
      'Пример: "Математика 10"'
    )
  }
}

/**
 * Отправка уведомления министерству о новой задаче
 */
export async function notifyMinistryAboutTask(taskId: string, ministry: string) {
  try {
    // Получаем всех участников министерства с Telegram ID
    const members = await prisma.user.findMany({
      where: {
        parliamentMember: {
          ministry,
          isActive: true,
        },
        telegramId: { not: null },
      },
      select: {
        telegramId: true,
        name: true,
      },
    })

    const task = await prisma.task.findUnique({
      where: { id: taskId },
      select: {
        title: true,
        description: true,
        deadline: true,
        xpReward: true,
      },
    })

    if (!task) return

    const message = `📋 Новая задача для министерства!\n\n` +
      `📌 ${task.title}\n` +
      `${task.description.substring(0, 200)}${task.description.length > 200 ? '...' : ''}\n\n` +
      `🎁 Награда: ${task.xpReward} XP\n` +
      (task.deadline ? `📅 Дедлайн: ${new Date(task.deadline).toLocaleDateString('ru-RU')}\n` : '') +
      `\nПроверьте задачи на сайте!`

    // Отправляем уведомления всем участникам
    for (const member of members) {
      if (member.telegramId) {
        await sendTelegramMessage(parseInt(member.telegramId), message)
        // Сохраняем уведомление в БД
        const memberUser = await prisma.user.findUnique({
          where: { telegramId: member.telegramId },
          select: { id: true },
        })
        if (memberUser) {
          await prisma.telegramNotification.create({
            data: {
              userId: memberUser.id,
              type: 'TASK_ASSIGNED',
              message,
              taskId,
              sent: true,
              sentAt: new Date(),
            },
          })
        }
      }
    }
  } catch (error) {
    console.error('Ошибка отправки уведомлений:', error)
  }
}

/**
 * Отправка уведомления об одобрении/отклонении отчета
 */
export async function notifyReportStatus(
  userId: string,
  reportId: string,
  status: 'APPROVED' | 'REJECTED',
  epAmount?: number,
  feedback?: string
) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { telegramId: true, name: true },
    })

    if (!user?.telegramId) return

    const chatId = parseInt(user.telegramId)
    
    if (status === 'APPROVED') {
      await sendTelegramMessage(
        chatId,
        `✅ Ваш отчет одобрен!\n\n` +
        `🎁 Начислено: ${epAmount} EP\n` +
        (feedback ? `💬 Комментарий: ${feedback}` : '')
      )
    } else {
      await sendTelegramMessage(
        chatId,
        `❌ Ваш отчет отклонен\n\n` +
        (feedback ? `💬 Причина: ${feedback}` : 'Попробуйте еще раз')
      )
    }
  } catch (error) {
    console.error('Ошибка отправки уведомления о статусе отчета:', error)
  }
}

/**
 * Отправка уведомления админу о действиях в системе
 */
export async function notifyAdminAboutAction(
  action: string,
  details: string,
  metadata?: Record<string, any>
) {
  try {
    // Получаем всех админов с Telegram ID
    const admins = await prisma.user.findMany({
      where: {
        role: 'ADMIN',
        telegramId: { not: null },
      },
      select: {
        telegramId: true,
        name: true,
      },
    })

    const message = `🔔 Уведомление администратора\n\n` +
      `📌 Действие: ${action}\n` +
      `📝 Детали: ${details}\n` +
      (metadata ? `\nДополнительно: ${JSON.stringify(metadata, null, 2)}` : '')

    // Отправляем уведомления всем админам
    for (const admin of admins) {
      if (admin.telegramId) {
        await sendTelegramMessage(parseInt(admin.telegramId), message)
      }
    }
  } catch (error) {
    console.error('Ошибка отправки уведомления админу:', error)
  }
}

