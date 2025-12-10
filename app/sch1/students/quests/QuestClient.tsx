'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle, Clock, Trophy } from 'lucide-react'

export default function QuestClient({ 
  dailyQuests, 
  weeklyQuests, 
  monthlyQuests 
}: { 
  dailyQuests: any[]
  weeklyQuests: any[]
  monthlyQuests: any[]
}) {
  const router = useRouter()
  const [completing, setCompleting] = useState<string | null>(null)
  const [showModal, setShowModal] = useState<string | null>(null)
  const [proof, setProof] = useState('')

  const handleComplete = async (questId: string, questName: string) => {
    if (!proof.trim() || proof.trim().length < 10) {
      alert('Необходимо предоставить доказательство выполнения (минимум 10 символов)')
      return
    }

    setCompleting(questId)
    try {
      const res = await fetch(`/api/quests/${questId}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ proof }),
      })

      if (res.ok) {
        const data = await res.json()
        alert(`Квест выполнен! Начислено: ${data.epAwarded} EP`)
        setShowModal(null)
        setProof('')
        router.refresh()
      } else {
        const error = await res.json()
        alert(error.error || 'Ошибка при выполнении квеста')
      }
    } catch (error) {
      alert('Ошибка при выполнении квеста')
    } finally {
      setCompleting(null)
    }
  }

  const QuestCard = ({ aq, type }: { aq: any; type: string }) => (
    <div className={`bg-white rounded-xl shadow-lg p-6 ${
      aq.completed ? 'opacity-75' : ''
    }`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <h3 className="font-semibold text-gray-900">{aq.quest.name}</h3>
            {aq.completed && (
              <CheckCircle className="h-5 w-5 text-green-600" />
            )}
          </div>
          <p className="text-sm text-gray-600 mb-3">{aq.quest.description}</p>
          <div className="flex items-center space-x-4 text-sm">
            <span className="text-primary-600 font-semibold">
              Награда: {aq.quest.epReward} EP
            </span>
            {aq.completed && aq.completedAt && (
              <span className="text-gray-500">
                Выполнено: {new Date(aq.completedAt).toLocaleDateString('ru-RU')}
              </span>
            )}
          </div>
        </div>
      </div>
      {!aq.completed && (
        <button
          onClick={() => setShowModal(aq.quest.id)}
          className="w-full bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition"
        >
          Выполнить квест
        </button>
      )}
    </div>
  )

  return (
    <>
      {/* Модальное окно для сдачи квеста */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Сдача квеста</h3>
            <p className="text-sm text-gray-600 mb-4">
              Опишите, как вы выполнили это задание. В будущем здесь будет проверка через ИИ.
            </p>
            <textarea
              value={proof}
              onChange={(e) => setProof(e.target.value)}
              placeholder="Опишите выполнение задания (минимум 10 символов)..."
              rows={6}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent mb-4"
            />
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowModal(null)
                  setProof('')
                }}
                className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition"
              >
                Отмена
              </button>
              <button
                onClick={() => {
                  const quest = [...dailyQuests, ...weeklyQuests, ...monthlyQuests]
                    .find(aq => aq.quest.id === showModal)
                  if (quest) {
                    handleComplete(showModal, quest.quest.name)
                  }
                }}
                disabled={completing === showModal || !proof.trim() || proof.trim().length < 10}
                className="flex-1 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition disabled:opacity-50"
              >
                {completing === showModal ? 'Отправка...' : 'Сдать квест'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ежедневные задания */}
      {dailyQuests.length > 0 && (
        <section className="mb-8">
          <div className="flex items-center space-x-2 mb-4">
            <Clock className="h-6 w-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Ежедневные задания</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {dailyQuests.map((aq) => (
              <QuestCard key={aq.id} aq={aq} type="daily" />
            ))}
          </div>
        </section>
      )}

      {/* Недельные задания */}
      {weeklyQuests.length > 0 && (
        <section className="mb-8">
          <div className="flex items-center space-x-2 mb-4">
            <Trophy className="h-6 w-6 text-purple-600" />
            <h2 className="text-2xl font-bold text-gray-900">Недельные задания</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {weeklyQuests.map((aq) => (
              <QuestCard key={aq.id} aq={aq} type="weekly" />
            ))}
          </div>
        </section>
      )}

      {/* Месячные задания */}
      {monthlyQuests.length > 0 && (
        <section className="mb-8">
          <div className="flex items-center space-x-2 mb-4">
            <Trophy className="h-6 w-6 text-yellow-600" />
            <h2 className="text-2xl font-bold text-gray-900">Месячные задания</h2>
          </div>
          <div className="grid gap-4">
            {monthlyQuests.map((aq) => (
              <QuestCard key={aq.id} aq={aq} type="monthly" />
            ))}
          </div>
        </section>
      )}
    </>
  )
}

