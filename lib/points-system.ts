/**
 * Система начисления баллов для SCH1
 * Разделяет школьную систему (EP) и парламентскую систему (XP)
 */

export type PointType = 'EP' | 'XP'

export interface User {
  id: string
  isParliament: boolean
  
  // Школьная система
  ep: number
  schoolRank: string
  schoolLevel: number
  
  // Парламентская система (null если не член парламента)
  xp: number | null
  parliamentRank: string | null
  ministry: string | null
}

export interface Task {
  id: string
  type: 'public' | 'ministry'
  pointsType: PointType
  reward: number
}

// Школьные ранги
const SCHOOL_RANKS = [
  { name: 'Наблюдатель', threshold: 0 },
  { name: 'Участник', threshold: 300 },
  { name: 'Энтузиаст', threshold: 800 },
  { name: 'Активист', threshold: 1500 },
  { name: 'Лидер Мнений', threshold: 2500 },
  { name: 'Герой Школы', threshold: 4000 },
  { name: 'Легенда Школы', threshold: 6000 }
]

// Парламентские ранги
const PARLIAMENT_RANKS = [
  { name: 'Новичок Парламента', threshold: 0 },
  { name: 'Активист', threshold: 500 },
  { name: 'Координатор', threshold: 1500 },
  { name: 'Министр-Эксперт', threshold: 3000 },
  { name: 'Вице-Председатель', threshold: 5000 },
  { name: 'Почетный Член', threshold: 8000 },
  { name: 'Легенда Парламента', threshold: 12000 }
]

export class PointsSystem {
  // Начисление баллов
  static awardPoints(user: User, task: Task): { user: User; rankUp?: { type: 'school' | 'parliament'; rank: string } } {
    const updatedUser = { ...user }
    let rankUp: { type: 'school' | 'parliament'; rank: string } | undefined

    if (task.type === 'public') {
      // Общественные задачи → всегда EP (школьная система)
      updatedUser.ep += task.reward
      const newRank = this.checkSchoolRankUp(updatedUser)
      if (newRank && newRank !== updatedUser.schoolRank) {
        updatedUser.schoolRank = newRank
        rankUp = { type: 'school', rank: newRank }
      }
    } else if (task.type === 'ministry') {
      // Министерские задачи → всегда XP (парламентская система)
      if (!updatedUser.isParliament) {
        throw new Error('Only parliament members can complete ministry tasks')
      }
      
      if (updatedUser.xp === null) {
        updatedUser.xp = 0
      }
      
      updatedUser.xp += task.reward
      const newRank = this.checkParliamentRankUp(updatedUser)
      if (newRank && newRank !== updatedUser.parliamentRank) {
        updatedUser.parliamentRank = newRank
        rankUp = { type: 'parliament', rank: newRank }
      }
    }
    
    return { user: updatedUser, rankUp }
  }
  
  // Проверка повышения ранга (школа)
  static checkSchoolRankUp(user: User): string | null {
    const ranks = [...SCHOOL_RANKS].reverse()
    const newRank = ranks.find(r => user.ep >= r.threshold)
    return newRank?.name || null
  }
  
  // Проверка повышения ранга (парламент)
  static checkParliamentRankUp(user: User): string | null {
    if (!user.isParliament || user.xp === null) return null
    
    const ranks = [...PARLIAMENT_RANKS].reverse()
    const newRank = ranks.find(r => user.xp! >= r.threshold)
    return newRank?.name || null
  }

  // Получить следующий ранг и необходимое количество баллов
  static getNextRank(user: User, type: 'school' | 'parliament'): { rank: string; pointsNeeded: number } | null {
    if (type === 'school') {
      const currentRankIndex = SCHOOL_RANKS.findIndex(r => r.name === user.schoolRank)
      if (currentRankIndex === -1 || currentRankIndex === SCHOOL_RANKS.length - 1) {
        return null
      }
      const nextRank = SCHOOL_RANKS[currentRankIndex + 1]
      return {
        rank: nextRank.name,
        pointsNeeded: nextRank.threshold - user.ep
      }
    } else {
      if (!user.isParliament || user.xp === null) return null
      const currentRankIndex = PARLIAMENT_RANKS.findIndex(r => r.name === user.parliamentRank)
      if (currentRankIndex === -1 || currentRankIndex === PARLIAMENT_RANKS.length - 1) {
        return null
      }
      const nextRank = PARLIAMENT_RANKS[currentRankIndex + 1]
      return {
        rank: nextRank.name,
        pointsNeeded: nextRank.threshold - user.xp
      }
    }
  }
}

// Функции для обновления рейтингов (заглушки, должны быть реализованы с Prisma)
export async function updateSchoolLeaderboard(userId: string, ep: number): Promise<void> {
  // TODO: Реализовать обновление школьного рейтинга в БД
}

export async function updateParliamentLeaderboard(userId: string, xp: number): Promise<void> {
  // TODO: Реализовать обновление парламентского рейтинга в БД
}

