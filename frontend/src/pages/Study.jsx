import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import TopNav from '../components/TopNav'
import api from '../services/api'
import toast from 'react-hot-toast'

export default function Study() {
  const { setId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [cards, setCards] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showAnswer, setShowAnswer] = useState(false)
  const [sessionId, setSessionId] = useState(null)
  const [stats, setStats] = useState({ studied: 0, correct: 0, incorrect: 0 })
  const [startTime] = useState(Date.now())
  const [setInfo, setSetInfo] = useState(null)
  const [nextReview, setNextReview] = useState(null)
  const [totalCards, setTotalCards] = useState(0)

  useEffect(() => {
    startSession()
    fetchSetInfo()
    fetchCards()
  }, [setId])

  const startSession = async () => {
    try {
      const response = await api.post('/api/study/sessions', { set_id: parseInt(setId) })
      setSessionId(response.data.id)
    } catch (error) {
      toast.error('Failed to start study session')
    }
  }

  const fetchSetInfo = async () => {
    try {
      const response = await api.get(`/api/flashcards/sets/${setId}`)
      setSetInfo(response.data)
      
      // Get total cards count
      const cardsRes = await api.get(`/api/flashcards/sets/${setId}/cards`)
      setTotalCards(cardsRes.data.length)
    } catch (error) {
      toast.error('Failed to load set information')
    }
  }

  const fetchCards = async () => {
    try {
      const response = await api.get(`/api/study/sets/${setId}/due`)
      setCards(response.data)
    } catch (error) {
      toast.error('Failed to load flashcards')
    }
  }

  const handleAnswer = async (quality) => {
    if (!showAnswer) {
      setShowAnswer(true)
      return
    }

    const currentCard = cards[currentIndex]
    if (!currentCard) return

    try {
      await api.post('/api/study/answer', {
        flashcard_id: currentCard.id,
        quality: quality
      })

      // Get next review info
      const progressRes = await api.get(`/api/study/progress/${setId}`).catch(() => null)
      if (progressRes && currentCard.next_review_date) {
        const days = Math.ceil((new Date(currentCard.next_review_date) - new Date()) / (1000 * 60 * 60 * 24))
        setNextReview(days > 0 ? days : 0)
      }

      const newStats = { ...stats }
      newStats.studied += 1
      if (quality >= 3) {
        newStats.correct += 1
      } else {
        newStats.incorrect += 1
      }
      setStats(newStats)

      // Move to next card after a short delay
      setTimeout(() => {
        if (currentIndex < cards.length - 1) {
          setCurrentIndex(currentIndex + 1)
          setShowAnswer(false)
          setNextReview(null)
        } else {
          completeSession(newStats)
        }
      }, 500)
    } catch (error) {
      toast.error('Failed to submit answer')
    }
  }

  const completeSession = async (finalStats) => {
    if (!sessionId) return
    
    const duration = Math.floor((Date.now() - startTime) / 1000 / 60)
    
    try {
      await api.put(`/api/study/sessions/${sessionId}`, {
        cards_studied: finalStats.studied,
        cards_correct: finalStats.correct,
        cards_incorrect: finalStats.incorrect,
        duration_minutes: duration
      })
      
      toast.success('Study session completed!')
      setTimeout(() => {
        navigate('/dashboard')
      }, 2000)
    } catch (error) {
      toast.error('Failed to complete session')
    }
  }

  const handleEndSession = async () => {
    if (window.confirm('Are you sure you want to end this session?')) {
      if (sessionId && stats.studied > 0) {
        await completeSession(stats)
      } else {
        navigate('/dashboard')
      }
    }
  }

  if (cards.length === 0) {
    return (
      <div className="flex min-h-screen w-full flex-col bg-background-light dark:bg-background-dark">
        <TopNav />
        <main className="flex-1 flex items-center justify-center p-4">
          <div className="text-center">
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-4">No cards to review!</p>
            <button
              onClick={() => navigate('/sets')}
              className="bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded-lg"
            >
              Back to Sets
            </button>
          </div>
        </main>
      </div>
    )
  }

  const currentCard = cards[currentIndex]
  const progressPercentage = totalCards > 0 ? (stats.studied / totalCards) * 100 : 0

  return (
    <div className="flex flex-col min-h-screen bg-background-light dark:bg-background-dark">
      <TopNav />
      
      {/* Header Section */}
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <header className="flex items-center justify-between whitespace-nowrap border-b border-gray-200 dark:border-gray-700/50 py-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-3 text-gray-800 dark:text-white">
                <span className="material-symbols-outlined text-2xl">layers</span>
                <h1 className="text-lg font-bold leading-tight">
                  {setInfo?.title || 'Loading...'}
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={handleEndSession}
                className="flex items-center justify-center rounded-lg h-10 px-4 bg-primary text-white text-sm font-bold leading-normal transition-colors hover:bg-primary/90"
              >
                <span>End Session</span>
              </button>
              <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center justify-center rounded-lg h-10 w-10 transition-colors text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                <span className="material-symbols-outlined text-2xl">close</span>
              </button>
            </div>
          </header>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-grow flex items-center justify-center p-4">
        <div className="w-full max-w-2xl mx-auto flex flex-col gap-6">
          {/* Progress */}
          <div className="px-4">
            <div className="flex flex-col gap-2">
              <p className="text-gray-600 dark:text-gray-300 text-sm font-medium">Progress</p>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
              <p className="text-gray-500 dark:text-gray-400 text-xs">
                {stats.studied}/{totalCards} cards reviewed
              </p>
            </div>
          </div>

          {/* Flashcard */}
          <div className="p-4">
            <div className="flex flex-col items-center justify-center rounded-xl shadow-lg bg-white dark:bg-[#1c1f27] min-h-[320px] p-8 text-center">
              <div className="flex flex-col gap-4 items-center justify-center">
                {!showAnswer ? (
                  <>
                    <p className="text-gray-800 dark:text-white text-2xl font-bold tracking-tight">
                      {currentCard?.front || 'Loading...'}
                    </p>
                    <p className="text-gray-500 dark:text-gray-400 text-base">
                      Click 'Show Answer' to reveal.
                    </p>
                    <button
                      onClick={() => setShowAnswer(true)}
                      className="mt-4 flex min-w-[120px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-5 bg-primary text-white text-base font-bold leading-normal tracking-wide transition-colors hover:bg-primary/90"
                    >
                      <span>Show Answer</span>
                    </button>
                  </>
                ) : (
                  <>
                    <p className="text-gray-800 dark:text-white text-2xl font-bold tracking-tight">
                      {currentCard?.front || 'Loading...'}
                    </p>
                    <div className="w-full border-t border-gray-200 dark:border-gray-700 my-4"></div>
                    <p className="text-gray-800 dark:text-white text-xl font-semibold tracking-tight">
                      {currentCard?.back || 'Loading...'}
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Rating Buttons - Always visible */}
          <div className="flex justify-center">
            <div className="flex flex-1 gap-3 flex-wrap px-4 py-3 max-w-lg justify-center">
              <button
                onClick={() => handleAnswer(1)}
                disabled={!showAnswer}
                className={`flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-5 transition-colors text-base font-bold leading-normal grow ${
                  showAnswer
                    ? 'bg-[#E57373]/10 text-[#E57373] hover:bg-[#E57373]/20'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                }`}
              >
                <span>Hard</span>
              </button>
              <button
                onClick={() => handleAnswer(3)}
                disabled={!showAnswer}
                className={`flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-5 transition-colors text-base font-bold leading-normal grow ${
                  showAnswer
                    ? 'bg-[#81C784]/10 text-[#81C784] hover:bg-[#81C784]/20'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                }`}
              >
                <span>Good</span>
              </button>
              <button
                onClick={() => handleAnswer(5)}
                disabled={!showAnswer}
                className={`flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-5 transition-colors text-base font-bold leading-normal grow ${
                  showAnswer
                    ? 'bg-[#64B5F6]/10 text-[#64B5F6] hover:bg-[#64B5F6]/20'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                }`}
              >
                <span>Easy</span>
              </button>
            </div>
          </div>

          {/* Next Review Info */}
          {nextReview !== null && (
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm font-normal leading-normal text-center">
                Next review in: ~{nextReview} {nextReview === 1 ? 'day' : 'days'}
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
