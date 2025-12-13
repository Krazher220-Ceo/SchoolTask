import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import {
  verifyPhotoMetadata,
  checkPhotoDuplicate,
  validatePhotoFile,
  analyzeTaskCompletionTime,
} from '@/lib/anti-cheat'

export const dynamic = 'force-dynamic'

// POST - проверить фото на обман
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
    }

    const formData = await request.formData()
    const photoFile = formData.get('photo') as File
    const taskId = formData.get('taskId') as string
    const taskTakenAt = formData.get('taskTakenAt') as string

    if (!photoFile) {
      return NextResponse.json({ error: 'Фото не предоставлено' }, { status: 400 })
    }

    // Валидация файла
    const fileValidation = validatePhotoFile(photoFile)
    if (!fileValidation.valid) {
      return NextResponse.json({ error: fileValidation.error }, { status: 400 })
    }

    // Проверка метаданных
    const metadataCheck = await verifyPhotoMetadata(
      photoFile,
      new Date(taskTakenAt)
    )

    // Проверка на дубликаты (требует получения хешей из БД)
    // const existingHashes: string[] = [] // TODO: Получить из БД
    // const duplicateCheck = await checkPhotoDuplicate(photoFile, session.user.id, existingHashes)

    const result = {
      passed: metadataCheck.passed,
      warnings: metadataCheck.warnings,
      errors: metadataCheck.errors,
      details: metadataCheck.details,
      // duplicate: duplicateCheck,
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Ошибка проверки фото:', error)
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 })
  }
}

