'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'

export default function Sidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  
  const userRole = session?.user?.role || 'STUDENT'
  
  const studentMenu = [
    { icon: '📊', label: 'Дашборд', href: '/sch1/dashboard' },
    { icon: '📝', label: 'Задачи', href: '/sch1/tasks', badge: null },
    { icon: '🏆', label: 'Рейтинг', href: '/sch1/ratings' },
    { icon: '🎯', label: 'Квесты', href: '/sch1/students/quests', badge: null },
    { icon: '🛒', label: 'Магазин', href: '/sch1/shop' },
    { icon: '👥', label: 'Гильдии', href: '/sch1/guilds' },
    { icon: '📜', label: 'Портфолио', href: '/portfolio' },
    { icon: '⚙️', label: 'Настройки', href: '/sch1/settings' }
  ]

  const parliamentMenu = [
    { icon: '💼', label: 'Парламент', href: '/sch1/parliament' },
    ...studentMenu
  ]

  const adminMenu = [
    { icon: '📊', label: 'Обзор', href: '/sch1/admin' },
    { icon: '👥', label: 'Пользователи', href: '/sch1/admin/users' },
    { icon: '📝', label: 'Задачи', href: '/sch1/admin/tasks' },
    { icon: '🏆', label: 'Рейтинги', href: '/sch1/admin/leaderboards' },
    { icon: '📜', label: 'Сертификаты', href: '/sch1/admin/certificates' },
    { icon: '🛒', label: 'Магазин', href: '/sch1/admin/shop' },
    { icon: '🤖', label: 'AI', href: '/sch1/admin/ai' },
    { icon: '⚙️', label: 'Настройки', href: '/sch1/admin/settings' }
  ]

  const menu = userRole === 'ADMIN' ? adminMenu :
                userRole === 'PARLIAMENT' ? parliamentMenu :
                studentMenu

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-screen sticky top-0 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <Link href="/sch1" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
            S1
          </div>
          <span className="font-bold text-xl">SCH1</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <ul className="space-y-1">
          {menu.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
            
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center justify-between gap-3 px-4 py-3 rounded-lg transition-all ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-700 font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{item.icon}</span>
                    <span>{item.label}</span>
                  </div>
                  
                  {item.badge && (
                    <span className="px-2 py-1 bg-red-500 text-white text-xs rounded-full font-medium">
                      {item.badge}
                    </span>
                  )}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-gray-50">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 flex items-center justify-center text-white font-semibold">
            {session?.user?.name?.charAt(0) || 'U'}
          </div>
          <div className="flex-1">
            <div className="font-medium text-sm">{session?.user?.name || 'Пользователь'}</div>
            <div className="text-xs text-gray-600">{session?.user?.class || ''}</div>
          </div>
          <button className="text-gray-400 hover:text-gray-600">
            ⋮
          </button>
        </div>
      </div>
    </div>
  )
}

