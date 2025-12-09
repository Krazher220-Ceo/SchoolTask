import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import {
  rateLimit,
  isSuspiciousRequest,
  isSuspiciousUserAgent,
  validateRequestSize,
  addSecurityHeaders,
  validateCORS,
  trackRequestStart,
  validateRequestTimeout,
  clearRequestTracking,
  createRateLimitResponse,
} from '@/lib/security'

// Основной middleware для защиты
function securityMiddleware(req: NextRequest) {
  const path = req.nextUrl.pathname
  const identifier = trackRequestStart(req)

  // Проверка на подозрительные запросы
  if (isSuspiciousRequest(req)) {
    clearRequestTracking(identifier)
    return NextResponse.json(
      { error: 'Запрос отклонен по соображениям безопасности' },
      { status: 400 }
    )
  }

  // Проверка User-Agent (только для API)
  if (path.startsWith('/api/') && isSuspiciousUserAgent(req)) {
    clearRequestTracking(identifier)
    return NextResponse.json(
      { error: 'Доступ запрещен' },
      { status: 403 }
    )
  }

  // Проверка размера запроса
  if (!validateRequestSize(req, 5 * 1024 * 1024)) { // 5MB максимум
    clearRequestTracking(identifier)
    return NextResponse.json(
      { error: 'Размер запроса превышает допустимый лимит' },
      { status: 413 }
    )
  }

  // Проверка таймаута запроса
  if (!validateRequestTimeout(identifier, 30000)) { // 30 секунд
    clearRequestTracking(identifier)
    return NextResponse.json(
      { error: 'Превышено время ожидания запроса' },
      { status: 408 }
    )
  }

  // Rate limiting для API
  if (path.startsWith('/api/')) {
    // Более строгий лимит для API
    const apiLimit = rateLimit(req, {
      limit: path.startsWith('/api/auth') ? 5 : 100, // 5 запросов для auth, 100 для остальных
      window: 60 * 1000, // 1 минута
    })

    if (!apiLimit.success) {
      clearRequestTracking(identifier)
      return createRateLimitResponse(apiLimit.limit, apiLimit.remaining, apiLimit.reset)
    }
  }

  // Rate limiting для страниц
  if (path.startsWith('/sch1/')) {
    const pageLimit = rateLimit(req, {
      limit: 200, // 200 запросов
      window: 60 * 1000, // 1 минута
    })

    if (!pageLimit.success) {
      clearRequestTracking(identifier)
      return createRateLimitResponse(pageLimit.limit, pageLimit.remaining, pageLimit.reset)
    }
  }

  // CORS проверка для API
  if (path.startsWith('/api/') && !validateCORS(req)) {
    clearRequestTracking(identifier)
    return NextResponse.json(
      { error: 'CORS: Доступ запрещен' },
      { status: 403 }
    )
  }

  return null // Продолжаем обработку
}

// Auth middleware с withAuth
export default withAuth(
  function middleware(req) {
    const identifier = trackRequestStart(req)
    const path = req.nextUrl.pathname

    // Сначала проверяем безопасность
    const securityResponse = securityMiddleware(req)
    if (securityResponse) {
      clearRequestTracking(identifier)
      return securityResponse
    }

    const token = req.nextauth.token

    // Если пользователь авторизован и пытается зайти на публичную страницу sch1, редиректим в dashboard
    if (token && path === '/sch1') {
      const response = NextResponse.redirect(new URL('/sch1/dashboard', req.url))
      addSecurityHeaders(response)
      clearRequestTracking(identifier)
      return response
    }

    // Если пользователь авторизован и пытается зайти на login, редиректим в dashboard
    if (token && path === '/sch1/login') {
      const response = NextResponse.redirect(new URL('/sch1/dashboard', req.url))
      addSecurityHeaders(response)
      clearRequestTracking(identifier)
      return response
    }

    // Применяем security headers
    const response = NextResponse.next()
    addSecurityHeaders(response)
    clearRequestTracking(identifier)
    return response
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname
        
        // Публичные страницы sch1 (главная, game, ministry, ratings, login)
        const publicPages = ['/sch1/game', '/sch1/ratings', '/sch1/login']
        const isPublicPage = publicPages.some(page => path.startsWith(page)) || 
                            path.startsWith('/sch1/ministry/')
        
        // Если это публичная страница, разрешаем доступ
        if (isPublicPage) {
          return true
        }
        
        // Для защищенных страниц требуется авторизация
        if (path.startsWith('/sch1/')) {
          return !!token
        }
        
        return true
      },
    },
  }
)

export const config = {
  matcher: [
    '/sch1/:path*',
    '/api/:path*',
  ],
}

