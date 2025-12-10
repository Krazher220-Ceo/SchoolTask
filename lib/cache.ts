// Утилиты для кэширования данных

const CACHE_DURATION = {
  SHORT: 60 * 1000, // 1 минута
  MEDIUM: 5 * 60 * 1000, // 5 минут
  LONG: 30 * 60 * 1000, // 30 минут
}

interface CacheEntry<T> {
  data: T
  timestamp: number
  duration: number
}

const cache = new Map<string, CacheEntry<any>>()

/**
 * Получить данные из кэша
 */
export function getCached<T>(key: string): T | null {
  const entry = cache.get(key)
  if (!entry) return null

  const now = Date.now()
  if (now - entry.timestamp > entry.duration) {
    cache.delete(key)
    return null
  }

  return entry.data as T
}

/**
 * Сохранить данные в кэш
 */
export function setCached<T>(key: string, data: T, duration: number = CACHE_DURATION.MEDIUM): void {
  cache.set(key, {
    data,
    timestamp: Date.now(),
    duration,
  })
}

/**
 * Очистить кэш
 */
export function clearCache(key?: string): void {
  if (key) {
    cache.delete(key)
  } else {
    cache.clear()
  }
}

/**
 * Создать кэшированную функцию
 */
export function cached<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  keyGenerator: (...args: Parameters<T>) => string,
  duration: number = CACHE_DURATION.MEDIUM
): T {
  return (async (...args: Parameters<T>) => {
    const key = keyGenerator(...args)
    const cached = getCached(key)
    if (cached !== null) {
      return cached
    }

    const result = await fn(...args)
    setCached(key, result, duration)
    return result
  }) as T
}

export { CACHE_DURATION }

