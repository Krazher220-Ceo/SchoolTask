// Базовая Anti-Cheat система для проверки фото-отчетов

interface PhotoVerificationResult {
  passed: boolean
  warnings: string[]
  errors: string[]
  details: {
    dateCheck?: { passed: boolean; reason?: string }
    deviceCheck?: { passed: boolean; reason?: string }
    duplicateCheck?: { passed: boolean; similarity?: number }
  }
}

/**
 * Проверка EXIF метаданных фото
 * В браузере используем exif-js, на сервере - sharp/exifr
 */
export async function verifyPhotoMetadata(
  photoFile: File | Buffer,
  taskTakenAt: Date
): Promise<PhotoVerificationResult> {
  const result: PhotoVerificationResult = {
    passed: true,
    warnings: [],
    errors: [],
    details: {},
  }

  try {
    // В браузере используем exif-js
    if (typeof window !== 'undefined') {
      const EXIF = (await import('exif-js')).default
      
      return new Promise((resolve) => {
        EXIF.getData(photoFile as any, function(this: any) {
          const exifData = EXIF.getAllTags(this)
          checkMetadata(exifData, taskTakenAt, result)
          resolve(result)
        })
      })
    } else {
      // На сервере используем exifr (опционально)
      try {
        const exifr = await import('exifr')
        const exifData = await exifr.parse(photoFile)
        
        if (exifData) {
          checkMetadata(exifData, taskTakenAt, result)
        } else {
          result.warnings.push('EXIF данные не найдены (фото могло быть обработано)')
        }
      } catch (error) {
        // exifr не установлен - пропускаем проверку
        result.warnings.push('EXIF проверка недоступна (установи exifr для полной функциональности)')
      }
      
      return result
    }
  } catch (error) {
    console.error('Ошибка проверки EXIF:', error)
    result.warnings.push('Не удалось проверить метаданные фото')
    return result
  }
}

function checkMetadata(
  exifData: any,
  taskTakenAt: Date,
  result: PhotoVerificationResult
) {
  // Проверка даты съемки
  if (exifData.DateTimeOriginal || exifData.DateTime) {
    const photoDateStr = exifData.DateTimeOriginal || exifData.DateTime
    const photoDate = parseExifDate(photoDateStr)
    
    if (photoDate) {
      const now = new Date()
      const daysDifference = (now.getTime() - photoDate.getTime()) / (1000 * 60 * 60 * 24)
      
      // Фото должно быть сделано ПОСЛЕ взятия задачи
      if (photoDate < taskTakenAt) {
        result.passed = false
        result.errors.push('Фото сделано ДО взятия задачи')
        result.details.dateCheck = {
          passed: false,
          reason: 'Фото сделано ДО взятия задачи',
        }
      }
      // Фото не может быть из будущего
      else if (photoDate > now) {
        result.passed = false
        result.errors.push('Дата съемки в будущем (подделка метаданных)')
        result.details.dateCheck = {
          passed: false,
          reason: 'Дата съемки в будущем',
        }
      }
      // Фото не должно быть слишком старым (>7 дней)
      else if (daysDifference > 7) {
        result.warnings.push(`Фото сделано ${Math.round(daysDifference)} дней назад (подозрительно)`)
        result.details.dateCheck = {
          passed: true,
        }
      } else {
        result.details.dateCheck = {
          passed: true,
        }
      }
    }
  } else {
    result.warnings.push('Дата съемки не найдена в метаданных')
  }

  // Проверка устройства
  if (exifData.Make && exifData.Model) {
    const device = `${exifData.Make} ${exifData.Model}`
    result.details.deviceCheck = {
      passed: true,
    }
    // В будущем можно сравнить с зарегистрированными устройствами пользователя
  }
}

function parseExifDate(dateStr: string): Date | null {
  try {
    // Формат EXIF: "2025:12:15 10:30:45"
    const [datePart, timePart] = dateStr.split(' ')
    const [year, month, day] = datePart.split(':').map(Number)
    const [hour, minute, second] = timePart.split(':').map(Number)
    
    return new Date(year, month - 1, day, hour, minute, second)
  } catch (error) {
    return null
  }
}

/**
 * Простая проверка на дубликаты через размер файла и хеш
 * В будущем можно добавить perceptual hashing (pHash)
 */
export async function checkPhotoDuplicate(
  photoFile: File | Buffer | ArrayBuffer,
  userId: string,
  existingPhotoHashes: string[]
): Promise<{ isDuplicate: boolean; similarity?: number }> {
  try {
    // Вычисляем простой хеш файла
    let fileBuffer: ArrayBuffer
    
    if (photoFile instanceof File) {
      fileBuffer = await photoFile.arrayBuffer()
    } else if (typeof Buffer !== 'undefined' && photoFile instanceof Buffer) {
      // Конвертируем Buffer в ArrayBuffer через Uint8Array
      const uint8 = new Uint8Array(photoFile)
      fileBuffer = uint8.buffer
    } else {
      // Уже ArrayBuffer
      fileBuffer = photoFile as ArrayBuffer
    }

    // Используем Web Crypto API для хеширования
    const hashBuffer = await crypto.subtle.digest('SHA-256', fileBuffer)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')

    // Проверяем, есть ли такой хеш в базе
    if (existingPhotoHashes.includes(hashHex)) {
      return {
        isDuplicate: true,
        similarity: 100,
      }
    }

    return {
      isDuplicate: false,
    }
  } catch (error) {
    console.error('Ошибка проверки дубликата:', error)
    return {
      isDuplicate: false,
    }
  }
}

/**
 * Проверка размера и типа файла
 */
export function validatePhotoFile(file: File): { valid: boolean; error?: string } {
  // Максимальный размер: 10MB
  const maxSize = 10 * 1024 * 1024
  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'Файл слишком большой (максимум 10MB)',
    }
  }

  // Разрешенные типы
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Неподдерживаемый формат. Используйте JPG, PNG или WebP',
    }
  }

  return { valid: true }
}

/**
 * Поведенческий анализ: проверка времени выполнения задачи
 */
export function analyzeTaskCompletionTime(
  taskTakenAt: Date,
  reportSubmittedAt: Date,
  taskType: string
): { suspicious: boolean; reason?: string } {
  const timeDiff = (reportSubmittedAt.getTime() - taskTakenAt.getTime()) / (1000 * 60) // минуты

  // Слишком быстро (< 5 минут) - подозрительно
  if (timeDiff < 5) {
    return {
      suspicious: true,
      reason: `Задача выполнена слишком быстро (${Math.round(timeDiff)} минут)`,
    }
  }

  // Слишком медленно (> 7 дней) - тоже подозрительно для некоторых задач
  if (timeDiff > 7 * 24 * 60 && taskType !== 'LONG_TERM') {
    return {
      suspicious: true,
      reason: `Задача выполнена слишком долго (${Math.round(timeDiff / 60)} часов)`,
    }
  }

  return { suspicious: false }
}

/**
 * Простой perceptual hash (pHash) для детекции похожих изображений
 * Упрощенная версия - в продакшене лучше использовать библиотеку
 */
export async function calculateSimplePHash(imageFile: File | Buffer): Promise<string> {
  try {
    // В браузере используем Canvas API
    if (typeof window !== 'undefined') {
      return new Promise((resolve, reject) => {
        const img = new Image()
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        
        if (!ctx) {
          reject(new Error('Canvas не поддерживается'))
          return
        }

        img.onload = () => {
          // Уменьшаем до 8x8
          canvas.width = 8
          canvas.height = 8
          ctx.drawImage(img, 0, 0, 8, 8)
          
          const imageData = ctx.getImageData(0, 0, 8, 8)
          const pixels = imageData.data
          
          // Конвертируем в grayscale и вычисляем среднюю яркость
          let sum = 0
          const grayscale: number[] = []
          
          for (let i = 0; i < pixels.length; i += 4) {
            const gray = (pixels[i] + pixels[i + 1] + pixels[i + 2]) / 3
            grayscale.push(gray)
            sum += gray
          }
          
          const avg = sum / grayscale.length
          
          // Создаем битовую строку
          const hash = grayscale.map(pixel => (pixel > avg ? '1' : '0')).join('')
          resolve(hash)
        }
        
        img.onerror = reject
        
        if (imageFile instanceof File) {
          img.src = URL.createObjectURL(imageFile)
        } else {
          reject(new Error('Buffer не поддерживается в браузере'))
        }
      })
    } else {
      // На сервере используем sharp (требует установки)
      // Для упрощения возвращаем пустую строку
      // В продакшене нужно установить: npm install sharp
      return Promise.resolve('')
    }
  } catch (error) {
    console.error('Ошибка вычисления pHash:', error)
    return ''
  }
}

/**
 * Сравнение perceptual hashes (расстояние Хэмминга)
 */
export function comparePHashes(hash1: string, hash2: string): number {
  if (hash1.length !== hash2.length) return 100 // Максимальное расстояние
  
  let distance = 0
  for (let i = 0; i < hash1.length; i++) {
    if (hash1[i] !== hash2[i]) distance++
  }
  
  return distance
}

/**
 * Проверка на скриншот (базовая эвристика)
 */
export function detectScreenshot(imageFile: File): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      // Эвристика: скриншоты часто имеют определенные характеристики
      // В реальности нужна ML-модель
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        resolve(false)
        return
      }
      
      canvas.width = img.width
      canvas.height = img.height
      ctx.drawImage(img, 0, 0)
      
      // Проверяем наличие UI-элементов (упрощенно)
      // В продакшене использовать TensorFlow.js с обученной моделью
      resolve(false) // Пока всегда false
    }
    img.onerror = () => resolve(false)
    img.src = URL.createObjectURL(imageFile)
  })
}

