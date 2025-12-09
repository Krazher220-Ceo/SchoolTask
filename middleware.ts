import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const path = req.nextUrl.pathname

    // Если пользователь авторизован и пытается зайти на публичную страницу sch1, редиректим в dashboard
    if (token && path === '/sch1') {
      return NextResponse.redirect(new URL('/sch1/dashboard', req.url))
    }

    // Если пользователь авторизован и пытается зайти на login, редиректим в dashboard
    if (token && path === '/sch1/login') {
      return NextResponse.redirect(new URL('/sch1/dashboard', req.url))
    }

    return NextResponse.next()
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
  ],
}

