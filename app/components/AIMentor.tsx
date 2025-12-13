'use client'

import { useState } from 'react'
import { MessageCircle, Sparkles, Lightbulb, Send, Loader2 } from 'lucide-react'

export default function AIMentor() {
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(true)

  const handleAsk = async () => {
    if (!question.trim()) return

    setLoading(true)
    setAnswer(null)

    try {
      const res = await fetch('/api/ai/mentor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question }),
      })

      if (!res.ok) throw new Error('Ошибка запроса')

      const data = await res.json()
      setAnswer(data.answer)
      setShowSuggestions(false)
    } catch (error) {
      setAnswer('Произошла ошибка. Попробуйте позже.')
    } finally {
      setLoading(false)
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    setQuestion(suggestion)
    setShowSuggestions(false)
  }

  const quickSuggestions = [
    'Как организовать мероприятие?',
    'Какие министерства есть в парламенте?',
    'Как заработать больше EP?',
    'Как повысить свой ранг?',
    'Что такое система рейтингов?',
  ]

  return (
    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 shadow-lg">
      <div className="flex items-center mb-4">
        <Sparkles className="h-6 w-6 text-purple-500 mr-2" />
        <h3 className="text-xl font-bold text-gray-900">AI-Ментор</h3>
      </div>

      <p className="text-sm text-gray-600 mb-4">
        Задай вопрос о парламенте, организации мероприятий или системе рейтингов
      </p>

      {showSuggestions && (
        <div className="mb-4">
          <p className="text-xs text-gray-500 mb-2">Быстрые вопросы:</p>
          <div className="flex flex-wrap gap-2">
            {quickSuggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className="text-xs bg-purple-100 text-purple-700 px-3 py-1 rounded-full hover:bg-purple-200 transition"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleAsk()}
          placeholder="Задай вопрос..."
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          disabled={loading}
        />
        <button
          onClick={handleAsk}
          disabled={loading || !question.trim()}
          className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2 rounded-lg hover:from-purple-600 hover:to-pink-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Send className="h-5 w-5" />
          )}
        </button>
      </div>

      {answer && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <MessageCircle className="h-5 w-5 text-purple-500 mt-0.5" />
            <div className="flex-1">
              <p className="text-gray-800 whitespace-pre-wrap">{answer}</p>
            </div>
          </div>
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-gray-200">
        <button
          onClick={async () => {
            setLoading(true)
            try {
              const res = await fetch('/api/ai/suggestions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({}),
              })
              const data = await res.json()
              setSuggestions(data.ideas || [])
            } catch (error) {
              console.error('Ошибка получения идей:', error)
            } finally {
              setLoading(false)
            }
          }}
          className="flex items-center gap-2 text-sm text-purple-600 hover:text-purple-700"
        >
          <Lightbulb className="h-4 w-4" />
          <span>Получить идеи для мероприятий</span>
        </button>

        {suggestions.length > 0 && (
          <div className="mt-3 space-y-2">
            {suggestions.map((idea: any, index) => (
              <div key={index} className="bg-white/50 rounded-lg p-3 border border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-1">{idea.title}</h4>
                <p className="text-sm text-gray-600 mb-2">{idea.description}</p>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span>💰 {idea.estimatedEP} EP</span>
                  <span>📊 {idea.difficulty}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

