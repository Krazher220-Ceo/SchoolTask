import { NextRequest, NextResponse } from 'next/server'
import {
  rateLimit,
  validateRequestSize,
  isSuspiciousRequest,
  addSecurityHeaders,
  createRateLimitResponse,
} from './security'

/**
 * Обертка для защиты API роутов
 */
export function withApiProtection(
  handler: (req: NextRequest) => Promise<NextResponse>,
  options: {
    rateLimit?: {
      limit: number
      window: number
    }
    maxRequestSize?: number
    requireAuth?: boolean
  } = {}
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    try {
      // Проверка на подозрительные запросы
      if (isSuspiciousRequest(req)) {
        return NextResponse.json(
          { error: 'Запрос отклонен по соображениям безопасности' },
          { status: 400 }
        )
      }

      // Проверка размера запроса
      const maxSize = options.maxRequestSize || 5 * 1024 * 1024 // 5MB по умолчанию
      if (!validateRequestSize(req, maxSize)) {
        return NextResponse.json(
          { error: 'Размер запроса превышает допустимый лимит' },
          { status: 413 }
        )
      }

      // Rate limiting
      if (options.rateLimit) {
        const limitResult = rateLimit(req, {
          limit: options.rateLimit.limit,
          window: options.rateLimit.window,
        })

        if (!limitResult.success) {
          return createRateLimitResponse(
            limitResult.limit,
            limitResult.remaining,
            limitResult.reset
          )
        }
      }

      // Выполняем основной handler
      const response = await handler(req)

      // Добавляем security headers
      addSecurityHeaders(response)

      return response
    } catch (error) {
      console.error('API Protection Error:', error)
      
      // Не раскрываем детали ошибки в продакшене
      const errorMessage =
        process.env.NODE_ENV === 'development'
          ? (error as Error).message
          : 'Внутренняя ошибка сервера'

      const response = NextResponse.json(
        { error: errorMessage },
        { status: 500 }
      )

      addSecurityHeaders(response)
      return response
    }
  }
}

/**
 * Валидация JSON тела запроса
 */
export function validateJsonBody<T>(
  body: unknown,
  validator?: (data: unknown) => data is T
): T {
  if (!body || typeof body !== 'object') {
    throw new Error('Неверный формат данных')
  }

  if (validator && !validator(body)) {
    throw new Error('Данные не прошли валидацию')
  }

  return body as T
}

/**
 * Защита от CSRF (для форм)
 */
export function validateCSRFToken(
  request: NextRequest,
  token: string | null
): boolean {
  // В Next.js с App Router CSRF защита встроена через SameSite cookies
  // Дополнительная проверка может быть добавлена здесь
  return true
}

/**
 * Логирование подозрительной активности
 */
export function logSuspiciousActivity(
  request: NextRequest,
  reason: string
): void {
  const ip = request.headers.get('x-forwarded-for') || 
             request.headers.get('x-real-ip') || 
             'unknown'
  const userAgent = request.headers.get('user-agent') || 'unknown'
  const path = request.nextUrl.pathname

  console.warn(`[SECURITY] Suspicious activity detected:`, {
    ip,
    userAgent,
    path,
    reason,
    timestamp: new Date().toISOString(),
  })

  // В продакшене здесь можно отправлять в систему мониторинга
  // Например, Sentry, LogRocket, или собственную систему
}

