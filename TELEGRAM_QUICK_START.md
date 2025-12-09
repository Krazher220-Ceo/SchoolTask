# 🚀 Быстрый старт Telegram бота

## ✅ Токен бота уже настроен
Токен: `8156755769:AAG_KkFYtyKgi5giyGV2JOAnV0UO-VaJGzE`

## 📋 Что нужно сделать

### 1. Для Vercel (после деплоя)

**Шаг 1:** Добавьте переменные окружения в Vercel:
- Зайдите в Vercel Dashboard → Ваш проект → Settings → Environment Variables
- Добавьте:
  ```
  TELEGRAM_BOT_TOKEN = 8156755769:AAG_KkFYtyKgi5giyGV2JOAnV0UO-VaJGzE
  ```

**Шаг 2:** После успешного деплоя настройте webhook:

Замените `YOUR_DOMAIN` на ваш домен Vercel (например: `school-task.vercel.app`) и выполните:

```bash
curl -X POST "https://api.telegram.org/bot8156755769:AAG_KkFYtyKgi5giyGV2JOAnV0UO-VaJGzE/setWebhook?url=https://YOUR_DOMAIN.vercel.app/api/telegram/webhook"
```

**Пример:**
```bash
curl -X POST "https://api.telegram.org/bot8156755769:AAG_KkFYtyKgi5giyGV2JOAnV0UO-VaJGzE/setWebhook?url=https://school-task.vercel.app/api/telegram/webhook"
```

**Шаг 3:** Проверьте webhook:
```bash
curl "https://api.telegram.org/bot8156755769:AAG_KkFYtyKgi5giyGV2JOAnV0UO-VaJGzE/getWebhookInfo"
```

Должно вернуться:
```json
{
  "ok": true,
  "result": {
    "url": "https://ваш-домен.vercel.app/api/telegram/webhook",
    "has_custom_certificate": false,
    "pending_update_count": 0
  }
}
```

### 2. Для локальной разработки

**Шаг 1:** Установите ngrok:
```bash
# macOS
brew install ngrok

# Или скачайте с https://ngrok.com/
```

**Шаг 2:** Запустите ngrok:
```bash
ngrok http 3000
```

**Шаг 3:** Скопируйте HTTPS URL (например: `https://abc123.ngrok.io`)

**Шаг 4:** Обновите `.env.local`:
```env
TELEGRAM_BOT_TOKEN="8156755769:AAG_KkFYtyKgi5giyGV2JOAnV0UO-VaJGzE"
TELEGRAM_WEBHOOK_URL="https://abc123.ngrok.io/api/telegram/webhook"
```

**Шаг 5:** Настройте webhook:
```bash
npm run telegram:setup
```

Или вручную:
```bash
curl -X POST "https://api.telegram.org/bot8156755769:AAG_KkFYtyKgi5giyGV2JOAnV0UO-VaJGzE/setWebhook?url=https://abc123.ngrok.io/api/telegram/webhook"
```

## 🎯 Как это работает

### На Vercel:
1. ✅ Бот **автоматически работает** после деплоя
2. ✅ API endpoint `/api/telegram/webhook` доступен сразу
3. ⚠️ Нужно только **один раз настроить webhook** после деплоя

### Что делает бот:
- Принимает команды от пользователей (`/start`, `/tasks`, `/report`)
- Принимает фото с баллами для создания отчетов
- Отправляет уведомления министерствам о новых задачах
- Отправляет уведомления об одобрении/отклонении отчетов

## 🧪 Проверка работы

1. Найдите вашего бота в Telegram (username от BotFather)
2. Отправьте `/start`
3. Бот должен ответить приветствием

Если бот не отвечает:
- Проверьте, что webhook настроен (команда выше)
- Проверьте логи на Vercel (Functions → telegram/webhook)
- Убедитесь, что `TELEGRAM_BOT_TOKEN` установлен в Vercel

## 📞 Помощь

Если что-то не работает:
- Telegram: @krazher220
- Телефон: +7 705 669 76 77

