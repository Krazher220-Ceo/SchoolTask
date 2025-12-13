'use client'

import { useState, useEffect } from 'react'
import { 
  Trophy, 
  Award, 
  TrendingUp, 
  Flame, 
  ShoppingBag, 
  Users,
  Filter,
  RefreshCw
} from 'lucide-react'
import { UserNameDisplay, AvatarDisplay } from '@/lib/userDisplay'

interface FeedEvent {
  id: string
  type: string
  title: string
  description: string
  category: string | null
  highlight: boolean
  pinned: boolean
  likes: number
  createdAt: string
  user: {
    id: string
    name: string
    avatar: string | null
    visualEffects: {
      nicknameColor: string | null
      avatarBorder: string | null
      customTitle: string | null
    } | null
  }
}

export default function SocialFeed() {
  const [events, setEvents] = useState<FeedEvent[]>([])
  const [pinnedEvents, setPinnedEvents] = useState<FeedEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState('all')
  const [hasMore, setHasMore] = useState(true)

  useEffect(() => {
    fetchFeed()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category])

  const fetchFeed = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/feed?category=${category}&limit=20`)
      if (res.ok) {
        const data = await res.json()
        setEvents(data.events || [])
        setPinnedEvents(data.pinnedEvents || [])
        setHasMore(data.hasMore || false)
      }
    } catch (error) {
      console.error('Ошибка загрузки ленты:', error)
    } finally {
      setLoading(false)
    }
  }

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'task_completed':
        return <Award className="h-5 w-5 text-green-500" />
      case 'achievement_unlocked':
        return <Trophy className="h-5 w-5 text-yellow-500" />
      case 'rank_up':
        return <TrendingUp className="h-5 w-5 text-purple-500" />
      case 'streak_milestone':
        return <Flame className="h-5 w-5 text-orange-500" />
      case 'shop_purchase':
        return <ShoppingBag className="h-5 w-5 text-blue-500" />
      case 'duel_update':
        return <Users className="h-5 w-5 text-red-500" />
      default:
        return <Award className="h-5 w-5 text-gray-500" />
    }
  }

  const categories = [
    { value: 'all', label: 'Все' },
    { value: 'competitive', label: 'Соревнования' },
    { value: 'collaborative', label: 'Командные' },
    { value: 'social', label: 'Социальные' },
    { value: 'economy', label: 'Экономика' },
  ]

  return (
    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900">Лента Событий</h3>
        <button
          onClick={fetchFeed}
          className="p-2 hover:bg-white/20 rounded-lg transition"
          title="Обновить"
        >
          <RefreshCw className="h-5 w-5 text-gray-600" />
        </button>
      </div>

      {/* Фильтры */}
      <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2">
        <Filter className="h-4 w-4 text-gray-500" />
        {categories.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setCategory(cat.value)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition ${
              category === cat.value
                ? 'bg-purple-500 text-white'
                : 'bg-white/50 text-gray-700 hover:bg-white/70'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto"></div>
        </div>
      ) : (
        <div className="space-y-4 max-h-[600px] overflow-y-auto">
          {/* Закрепленные события */}
          {pinnedEvents.length > 0 && (
            <div className="space-y-3 pb-4 border-b border-gray-200">
              {pinnedEvents.map((event) => (
                <FeedEventCard key={event.id} event={event} getEventIcon={getEventIcon} />
              ))}
            </div>
          )}

          {/* Обычные события */}
          {events.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Нет событий в этой категории
            </div>
          ) : (
            events.map((event) => (
              <FeedEventCard key={event.id} event={event} getEventIcon={getEventIcon} />
            ))
          )}
        </div>
      )}
    </div>
  )
}

function FeedEventCard({ event, getEventIcon }: { event: FeedEvent; getEventIcon: (type: string) => JSX.Element }) {
  return (
    <div
      className={`bg-white/50 rounded-lg p-4 border ${
        event.highlight ? 'border-yellow-400 shadow-md' : 'border-gray-200'
      } ${event.pinned ? 'ring-2 ring-purple-300' : ''}`}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          {getEventIcon(event.type)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <AvatarDisplay
              avatar={event.user.avatar}
              name={event.user.name}
              visualEffects={event.user.visualEffects}
              size="sm"
            />
            <div>
              <UserNameDisplay
                name={event.user.name}
                visualEffects={event.user.visualEffects}
                className="font-semibold text-sm"
              />
              {event.user.visualEffects?.customTitle && (
                <div className="text-xs text-primary-600">
                  {event.user.visualEffects.customTitle}
                </div>
              )}
            </div>
            <span className="text-xs text-gray-500 ml-auto">
              {new Date(event.createdAt).toLocaleDateString('ru-RU', {
                day: 'numeric',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>
          <h4 className="font-semibold text-gray-900 mb-1">{event.title}</h4>
          <p className="text-sm text-gray-600">{event.description}</p>
          {event.likes > 0 && (
            <div className="mt-2 text-xs text-gray-500">
              👍 {event.likes} лайков
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

