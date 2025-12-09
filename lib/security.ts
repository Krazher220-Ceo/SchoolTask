import { NextRequest, NextResponse } from 'next/server'

// Rate limiting storage (в продакшене используйте Redis)
interface RateLimitEntry {
  count: number
  resetTime: number
}

const rateLimitStore = new Map<string, RateLimitEntry>()

// Очистка старых записей каждые 5 минут
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetTime < now) {
      rateLimitStore.delete(key)
    }
  }
}, 5 * 60 * 1000)

/**
 * Rate limiting для защиты от DDoS
 */
export function rateLimit(
  request: NextRequest,
  options: {
    limit: number // Максимальное количество запросов
    window: number // Окно времени в миллисекундах
    identifier?: string // Кастомный идентификатор (по умолчанию IP)
  }
): { success: boolean; limit: number; remaining: number; reset: number } {
  const identifier = options.identifier || getClientIdentifier(request)
  const now = Date.now()
  const windowMs = options.window

  const entry = rateLimitStore.get(identifier)

  if (!entry || entry.resetTime < now) {
    // Создаем новую запись
    rateLimitStore.set(identifier, {
      count: 1,
      resetTime: now + windowMs,
    })
    return {
      success: true,
      limit: options.limit,
      remaining: options.limit - 1,
      reset: now + windowMs,
    }
  }

  if (entry.count >= options.limit) {
    // Превышен лимит
    return {
      success: false,
      limit: options.limit,
      remaining: 0,
      reset: entry.resetTime,
    }
  }

  // Увеличиваем счетчик
  entry.count++
  return {
    success: true,
    limit: options.limit,
    remaining: options.limit - entry.count,
    reset: entry.resetTime,
  }
}

/**
 * Получить идентификатор клиента (IP адрес)
 */
function getClientIdentifier(request: NextRequest): string {
  // Пробуем получить реальный IP из заголовков
  const forwarded = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  const cfConnectingIp = request.headers.get('cf-connecting-ip') // Cloudflare

  const ip = cfConnectingIp || realIp || forwarded?.split(',')[0] || 'unknown'
  return ip.trim()
}

/**
 * Проверка размера тела запроса
 */
export function validateRequestSize(
  request: NextRequest,
  maxSize: number = 1024 * 1024 // 1MB по умолчанию
): boolean {
  const contentLength = request.headers.get('content-length')
  if (contentLength) {
    const size = parseInt(contentLength, 10)
    return size <= maxSize
  }
  return true
}

/**
 * Проверка на подозрительные паттерны в URL
 */
export function isSuspiciousRequest(request: NextRequest): boolean {
  const url = request.url
  const pathname = new URL(url).pathname

  // Проверка на SQL injection паттерны
  const sqlPatterns = [
    /(\%27)|(\')|(\-\-)|(\%23)|(#)/i,
    /((\%3D)|(=))[^\n]*((\%27)|(\')|(\-\-)|(\%3B)|(;))/i,
    /\w*((\%27)|(\'))((\%6F)|o|(\%4F))((\%72)|r|(\%52))/i,
    /((\%27)|(\'))union/i,
  ]

  // Проверка на XSS паттерны
  const xssPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /<iframe/i,
    /<img/i,
    /<svg/i,
  ]

  // Проверка на path traversal
  const pathTraversalPatterns = [
    /\.\./,
    /\.\.\//,
    /\.\.\\/,
  ]

  const allPatterns = [...sqlPatterns, ...xssPatterns, ...pathTraversalPatterns]

  return allPatterns.some(pattern => pattern.test(pathname) || pattern.test(url))
}

/**
 * Проверка User-Agent на ботов и сканеры
 */
export function isSuspiciousUserAgent(request: NextRequest): boolean {
  const userAgent = request.headers.get('user-agent') || ''
  
  const suspiciousPatterns = [
    /sqlmap/i,
    /nikto/i,
    /nmap/i,
    /masscan/i,
    /zmap/i,
    /scanner/i,
    /bot/i,
    /crawler/i,
    /spider/i,
  ]

  // Разрешаем известные легитимные боты
  const allowedBots = [
    /googlebot/i,
    /bingbot/i,
    /slurp/i,
    /duckduckbot/i,
  ]

  // Если это известный легитимный бот, разрешаем
  if (allowedBots.some(pattern => pattern.test(userAgent))) {
    return false
  }

  // Проверяем на подозрительные паттерны
  return suspiciousPatterns.some(pattern => pattern.test(userAgent))
}

/**
 * Создать ответ с rate limit ошибкой
 */
export function createRateLimitResponse(
  limit: number,
  remaining: number,
  reset: number
): NextResponse {
  const response = NextResponse.json(
    {
      error: 'Слишком много запросов. Пожалуйста, попробуйте позже.',
      retryAfter: Math.ceil((reset - Date.now()) / 1000),
    },
    { status: 429 }
  )

  response.headers.set('X-RateLimit-Limit', limit.toString())
  response.headers.set('X-RateLimit-Remaining', remaining.toString())
  response.headers.set('X-RateLimit-Reset', reset.toString())
  response.headers.set('Retry-After', Math.ceil((reset - Date.now()) / 1000).toString())

  return response
}

/**
 * Добавить security headers к ответу
 */
export function addSecurityHeaders(response: NextResponse): NextResponse {
  // Content Security Policy
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self'; frame-ancestors 'none';"
  )

  // X-Frame-Options
  response.headers.set('X-Frame-Options', 'DENY')

  // X-Content-Type-Options
  response.headers.set('X-Content-Type-Options', 'nosniff')

  // X-XSS-Protection
  response.headers.set('X-XSS-Protection', '1; mode=block')

  // Referrer-Policy
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')

  // Permissions-Policy
  response.headers.set(
    'Permissions-Policy',
    'geolocation=(), microphone=(), camera=()'
  )

  // Strict-Transport-Security (HSTS) - только для HTTPS
  if (process.env.NODE_ENV === 'production') {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    )
  }

  return response
}

/**
 * Валидация CORS
 */
export function validateCORS(request: NextRequest): boolean {
  const origin = request.headers.get('origin')
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || []

  // Если нет origin (например, same-origin запрос), разрешаем
  if (!origin) {
    return true
  }

  // В development разрешаем localhost
  if (process.env.NODE_ENV === 'development') {
    if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
      return true
    }
  }

  // Проверяем разрешенные origins
  return allowedOrigins.some(allowed => origin === allowed || origin.endsWith(allowed))
}

/**
 * Проверка на медленные запросы (Slowloris защита)
 */
const requestTimestamps = new Map<string, number>()

export function trackRequestStart(request: NextRequest): string {
  const identifier = getClientIdentifier(request)
  requestTimestamps.set(identifier, Date.now())
  return identifier
}

export function validateRequestTimeout(identifier: string, maxTime: number = 30000): boolean {
  const startTime = requestTimestamps.get(identifier)
  if (!startTime) return true

  const elapsed = Date.now() - startTime
  if (elapsed > maxTime) {
    requestTimestamps.delete(identifier)
    return false
  }

  return true
}

export function clearRequestTracking(identifier: string): void {
  requestTimestamps.delete(identifier)
}

