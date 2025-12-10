'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  Target,
  FileText,
  Trophy,
  Settings,
  Bell,
  Shield,
  BarChart3,
  MessageSquare,
} from 'lucide-react'

const menuItems = [
  {
    title: 'Главная',
    icon: LayoutDashboard,
    href: '/sch1/admin',
  },
  {
    title: 'Пользователи',
    icon: Users,
    href: '/sch1/admin/users',
  },
  {
    title: 'Задачи',
    icon: Target,
    href: '/sch1/admin/tasks',
    submenu: [
      { title: 'Все задачи', href: '/sch1/admin/tasks' },
      { title: 'Общественные задачи', href: '/sch1/admin/public-tasks' },
    ],
  },
  {
    title: 'Отчеты',
    icon: FileText,
    href: '/sch1/admin/reports',
  },
  {
    title: 'Лидерборды',
    icon: Trophy,
    href: '/sch1/admin/leaderboards',
    submenu: [
      { title: 'Парламент (XP)', href: '/sch1/admin/leaderboards/parliament' },
      { title: 'Ученики (EP)', href: '/sch1/admin/leaderboards/students' },
    ],
  },
  {
    title: 'Статистика',
    icon: BarChart3,
    href: '/sch1/admin/stats',
  },
  {
    title: 'Регистрации',
    icon: MessageSquare,
    href: '/sch1/admin/registrations',
  },
  {
    title: 'Telegram',
    icon: Bell,
    href: '/sch1/admin/telegram',
  },
  {
    title: 'Настройки',
    icon: Settings,
    href: '/sch1/admin/settings',
  },
]

export default function AdminSidebar() {
  const pathname = usePathname()

  return (
    <div className="w-64 bg-white shadow-lg min-h-screen fixed left-0 top-0 overflow-y-auto">
      <div className="p-6 border-b border-gray-200">
        <Link href="/sch1/admin" className="flex items-center space-x-3">
          <Image
            src="/parliament-logo.png"
            alt="Эмблема Школьного Парламента"
            width={32}
            height={32}
            className="object-contain"
          />
          <h2 className="text-xl font-bold text-gray-900">Админ панель</h2>
        </Link>
      </div>

      <nav className="p-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
          const hasSubmenu = item.submenu && item.submenu.length > 0

          return (
            <div key={item.href}>
              <Link
                href={item.href}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
                  isActive
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="font-medium">{item.title}</span>
              </Link>
              {hasSubmenu && isActive && (
                <div className="ml-8 mt-2 space-y-1">
                  {item.submenu?.map((subitem) => {
                    const isSubActive = pathname === subitem.href
                    return (
                      <Link
                        key={subitem.href}
                        href={subitem.href}
                        className={`block px-4 py-2 rounded-lg text-sm transition ${
                          isSubActive
                            ? 'bg-primary-100 text-primary-700 font-semibold'
                            : 'text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        {subitem.title}
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </nav>
    </div>
  )
}

