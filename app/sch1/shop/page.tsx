'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, 
  ShoppingBag, 
  Sparkles, 
  Crown, 
  Image as ImageIcon,
  Star,
  Zap,
  Coins,
  Check,
  X
} from 'lucide-react'

interface ShopItem {
  id: string
  name: string
  description: string
  category: string
  price: number
  duration: number
  data: string
}

interface ShopData {
  items: ShopItem[]
  userPurchases: Array<{
    id: string
    shopItemId: string
    category: string
    expiresAt: string | null
  }>
  userBalance: number
  visualEffects: {
    nicknameColor: string | null
    avatarBorder: string | null
    customTitle: string | null
  } | null
}

export default function ShopPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [shopData, setShopData] = useState<ShopData | null>(null)
  const [loading, setLoading] = useState(true)
  const [purchasing, setPurchasing] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/sch1/login')
      return
    }
    if (status === 'authenticated') {
      fetchShopData()
    }
  }, [status, router])

  const fetchShopData = async () => {
    try {
      const res = await fetch('/api/shop/items')
      if (!res.ok) throw new Error('Ошибка загрузки')
      const data = await res.json()
      setShopData(data)
    } catch (err) {
      setError('Не удалось загрузить магазин')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handlePurchase = async (itemId: string) => {
    if (!shopData) return
    
    const item = shopData.items.find(i => i.id === itemId)
    if (!item) {
      setError('Товар не найден')
      return
    }
    
    if (shopData.userBalance < item.price) {
      setError('Недостаточно EP')
      return
    }

    setPurchasing(itemId)
    setError(null)

    try {
      const res = await fetch('/api/shop/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shopItemId: itemId }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Ошибка покупки')
      }

      const data = await res.json()
      // Обновляем данные
      await fetchShopData()
      
      // Показываем успешное сообщение
      alert(`Покупка успешна! Остаток: ${data.newBalance} EP`)
    } catch (err: any) {
      setError(err.message || 'Ошибка при покупке')
    } finally {
      setPurchasing(null)
    }
  }

  const isPurchased = (itemId: string) => {
    if (!shopData) return false
    const purchase = shopData.userPurchases.find(p => p.shopItemId === itemId)
    if (!purchase) return false
    if (purchase.expiresAt) {
      return new Date(purchase.expiresAt) > new Date()
    }
    return true
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'NICKNAME_COLOR':
        return <Sparkles className="h-6 w-6" />
      case 'AVATAR_BORDER':
        return <ImageIcon className="h-6 w-6" />
      case 'CUSTOM_TITLE':
        return <Crown className="h-6 w-6" />
      case 'SPOTLIGHT':
        return <Star className="h-6 w-6" />
      case 'STREAK_FREEZE':
        return <Zap className="h-6 w-6" />
      default:
        return <ShoppingBag className="h-6 w-6" />
    }
  }

  const getCategoryName = (category: string) => {
    switch (category) {
      case 'NICKNAME_COLOR':
        return 'Цвет Никнейма'
      case 'AVATAR_BORDER':
        return 'Рамка Аватара'
      case 'CUSTOM_TITLE':
        return 'Уникальный Титул'
      case 'SPOTLIGHT':
        return 'Закреп в Шапке'
      case 'STREAK_FREEZE':
        return 'Заморозка Стрика'
      default:
        return category
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'NICKNAME_COLOR':
        return 'from-pink-500 to-purple-600'
      case 'AVATAR_BORDER':
        return 'from-blue-500 to-cyan-600'
      case 'CUSTOM_TITLE':
        return 'from-yellow-500 to-orange-600'
      case 'SPOTLIGHT':
        return 'from-purple-500 to-pink-600'
      case 'STREAK_FREEZE':
        return 'from-green-500 to-emerald-600'
      default:
        return 'from-gray-500 to-gray-600'
    }
  }

  if (loading || !shopData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка магазина...</p>
        </div>
      </div>
    )
  }

  // Группируем товары по категориям
  const itemsByCategory = shopData.items.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = []
    }
    acc[item.category].push(item)
    return acc
  }, {} as Record<string, ShopItem[]>)

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      {/* Шапка */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/sch1" className="flex items-center space-x-2 text-gray-700 hover:text-primary-600">
              <ArrowLeft className="h-5 w-5" />
              <span>Назад</span>
            </Link>
            <div className="flex items-center space-x-3">
              <ShoppingBag className="h-8 w-8 text-primary-600" />
              <h1 className="text-xl font-bold text-gray-900">Магазин Эффектов</h1>
            </div>
            <div className="flex items-center space-x-2 bg-gradient-to-r from-yellow-400 to-orange-500 px-4 py-2 rounded-full">
              <Coins className="h-5 w-5 text-white" />
              <span className="font-bold text-white">{shopData.userBalance} EP</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Товары по категориям */}
        {Object.entries(itemsByCategory).map(([category, items]) => (
          <section key={category} className="mb-12">
            <div className="flex items-center mb-6">
              <div className={`p-3 rounded-lg bg-gradient-to-r ${getCategoryColor(category)} text-white mr-4`}>
                {getCategoryIcon(category)}
              </div>
              <h2 className="text-3xl font-bold text-gray-900">{getCategoryName(category)}</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map((item) => {
                const purchased = isPurchased(item.id)
                const itemData = JSON.parse(item.data || '{}')
                const canAfford = shopData.userBalance >= item.price

                return (
                  <div
                    key={item.id}
                    className="backdrop-blur-md bg-white/10 border border-white/20 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all"
                  >
                    <div className="mb-4">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{item.name}</h3>
                      <p className="text-gray-600 text-sm mb-4">{item.description}</p>
                      
                      {/* Превью эффекта */}
                      {item.category === 'NICKNAME_COLOR' && itemData.gradient && (
                        <div className="mb-4 p-3 bg-gray-100 rounded-lg">
                          <span
                            className={`text-transparent bg-clip-text bg-gradient-to-r ${
                              itemData.gradient === 'fire' 
                                ? 'from-orange-500 via-red-500 to-orange-500' 
                                : 'from-purple-500 via-pink-500 to-purple-500'
                            } font-bold text-lg`}
                          >
                            Пример имени
                          </span>
                        </div>
                      )}

                      {item.category === 'CUSTOM_TITLE' && itemData.title && (
                        <div className="mb-4 p-3 bg-gray-100 rounded-lg">
                          <p className="text-sm text-gray-600 mb-1">Имя пользователя</p>
                          <p className="text-xs text-primary-600 font-semibold">{itemData.title}</p>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <Coins className="h-5 w-5 text-yellow-500" />
                        <span className="text-2xl font-bold text-gray-900">{item.price} EP</span>
                      </div>
                      {item.duration > 0 && (
                        <span className="text-sm text-gray-500">
                          на {item.duration} {item.duration === 7 ? 'дней' : item.duration === 14 ? 'дней' : item.duration === 30 ? 'дней' : 'день'}
                        </span>
                      )}
                    </div>

                    {purchased ? (
                      <button
                        disabled
                        className="w-full bg-green-500 text-white px-4 py-3 rounded-lg font-semibold flex items-center justify-center space-x-2 cursor-not-allowed"
                      >
                        <Check className="h-5 w-5" />
                        <span>Куплено</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handlePurchase(item.id)}
                        disabled={!canAfford || purchasing === item.id}
                        className={`w-full px-4 py-3 rounded-lg font-semibold transition-all ${
                          canAfford
                            ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed grayscale'
                        }`}
                      >
                        {purchasing === item.id ? 'Покупка...' : 'Купить'}
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}

