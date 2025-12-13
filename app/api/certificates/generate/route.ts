import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const generateCertificateSchema = z.object({
  userId: z.string(),
  achievementId: z.string().optional(),
  rank: z.string().optional(),
  type: z.enum(['ACHIEVEMENT', 'RANK', 'SEASON_WINNER']),
})

// POST - сгенерировать сертификат
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
    }

    const body = await request.json()
    const data = generateCertificateSchema.parse(body)

    // Проверяем права (только для себя или админ)
    if (data.userId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Недостаточно прав' }, { status: 403 })
    }

    const user = await prisma.user.findUnique({
      where: { id: data.userId },
      include: {
        achievements: data.achievementId
          ? {
              where: { id: data.achievementId },
            }
          : undefined,
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'Пользователь не найден' }, { status: 404 })
    }

    // Генерируем уникальный ID сертификата
    const certificateId = `CERT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    // Создаем простой HTML сертификат (в будущем можно использовать pdf-lib)
    const certificateHTML = generateCertificateHTML(user, data, certificateId)

    // Возвращаем HTML (в будущем можно конвертировать в PDF)
    return new NextResponse(certificateHTML, {
      headers: {
        'Content-Type': 'text/html',
        'Content-Disposition': `inline; filename="certificate-${certificateId}.html"`,
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Неверные данные', details: error.errors }, { status: 400 })
    }
    console.error('Ошибка генерации сертификата:', error)
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 })
  }
}

function generateCertificateHTML(user: any, data: any, certificateId: string): string {
  const achievement = data.achievementId
    ? user.achievements?.find((a: any) => a.id === data.achievementId)
    : null

  const title = achievement
    ? `Достижение: ${achievement.title}`
    : data.rank
    ? `Ранг: ${data.rank}`
    : 'Сертификат'

  return `
<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Сертификат - ${user.name}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Inter:wght@400;500&display=swap');
    
    body {
      margin: 0;
      padding: 40px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      font-family: 'Inter', sans-serif;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
    }
    
    .certificate {
      background: white;
      padding: 60px;
      border-radius: 20px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      max-width: 800px;
      text-align: center;
      position: relative;
      border: 8px solid #f0f0f0;
    }
    
    .certificate::before {
      content: '';
      position: absolute;
      top: 20px;
      left: 20px;
      right: 20px;
      bottom: 20px;
      border: 2px solid #667eea;
      border-radius: 10px;
      pointer-events: none;
    }
    
    .header {
      font-family: 'Playfair Display', serif;
      font-size: 48px;
      color: #667eea;
      margin-bottom: 20px;
      font-weight: 700;
    }
    
    .subtitle {
      font-size: 18px;
      color: #666;
      margin-bottom: 40px;
      text-transform: uppercase;
      letter-spacing: 2px;
    }
    
    .name {
      font-family: 'Playfair Display', serif;
      font-size: 42px;
      color: #333;
      margin: 30px 0;
      font-weight: 700;
    }
    
    .achievement {
      font-size: 24px;
      color: #764ba2;
      margin: 30px 0;
      font-weight: 500;
    }
    
    .description {
      font-size: 18px;
      color: #666;
      line-height: 1.6;
      margin: 30px 0;
    }
    
    .date {
      font-size: 16px;
      color: #999;
      margin-top: 40px;
    }
    
    .qr-code {
      margin-top: 30px;
      padding: 20px;
      background: #f5f5f5;
      border-radius: 10px;
      display: inline-block;
    }
    
    .certificate-id {
      font-size: 12px;
      color: #999;
      margin-top: 20px;
      font-family: monospace;
    }
  </style>
</head>
<body>
  <div class="certificate">
    <div class="header">СЕРТИФИКАТ</div>
    <div class="subtitle">Школьный Парламент</div>
    
    <div class="name">${user.name}</div>
    
    ${achievement ? `<div class="achievement">${achievement.icon || '🏆'} ${achievement.title}</div>` : ''}
    ${data.rank ? `<div class="achievement">Ранг: ${data.rank}</div>` : ''}
    
    <div class="description">
      ${achievement ? achievement.description : 'За выдающиеся достижения и активное участие в жизни школы'}
    </div>
    
    <div class="date">
      ${new Date().toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })}
    </div>
    
    <div class="qr-code">
      <div style="width: 120px; height: 120px; background: #ddd; margin: 0 auto; display: flex; align-items: center; justify-content: center; border-radius: 8px;">
        QR Code<br/>
        <small style="font-size: 10px;">${certificateId}</small>
      </div>
    </div>
    
    <div class="certificate-id">
      ID: ${certificateId}<br/>
      Проверка: https://yourschool.kz/verify/${certificateId}
    </div>
  </div>
</body>
</html>
  `
}

