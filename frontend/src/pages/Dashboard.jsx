import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import TopNav from '../components/TopNav'
import api from '../services/api'
import toast from 'react-hot-toast'
import { useAuth } from '../contexts/AuthContext'

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth()
  const [sets, setSets] = useState([])
  const [progress, setProgress] = useState(null)
  const [loading, setLoading] = useState(true)
  const [timeFilter, setTimeFilter] = useState('7days')
  const [stats, setStats] = useState({
    streak: 0,
    totalMastered: 0,
    accuracy: 0
  })
  const [deckProgress, setDeckProgress] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    if (user && !authLoading) {
      fetchData()
    } else if (!authLoading && !user) {
      setLoading(false)
    }
  }, [user, authLoading])

  const fetchData = async () => {
    try {
      const [setsRes] = await Promise.all([
        api.get('/api/flashcards/sets'),
      ])
      setSets(setsRes.data)
      
      // Fetch progress for all sets
      const progressData = []
      let totalMastered = 0
      let totalCards = 0
      let correctAnswers = 0
      let totalAnswers = 0

      for (const set of setsRes.data) {
        try {
          const progressRes = await api.get(`/api/study/progress/${set.id}`).catch(() => null)
          if (progressRes && progressRes.data) {
            const { total_cards, cards_mastered, cards_correct, cards_studied } = progressRes.data
            const mastery = total_cards > 0 ? Math.round((cards_mastered / total_cards) * 100) : 0
            const accuracy = cards_studied > 0 ? Math.round((cards_correct / cards_studied) * 100) : 0
            
            totalMastered += cards_mastered
            totalCards += total_cards
            correctAnswers += cards_correct || 0
            totalAnswers += cards_studied || 0

            progressData.push({
              id: set.id,
              name: set.title,
              mastery,
              accuracy,
              lastStudied: set.updated_at || set.created_at
            })
          } else {
            progressData.push({
              id: set.id,
              name: set.title,
              mastery: 0,
              accuracy: 0,
              lastStudied: set.updated_at || set.created_at
            })
          }
        } catch {
          progressData.push({
            id: set.id,
            name: set.title,
            mastery: 0,
            accuracy: 0,
            lastStudied: set.updated_at || set.created_at
          })
        }
      }

      setDeckProgress(progressData)

      // Calculate overall stats
      const overallAccuracy = totalAnswers > 0 ? Math.round((correctAnswers / totalAnswers) * 100) : 0
      
      // Get streak from leaderboard or calculate
      let streak = 0
      try {
        const rankRes = await api.get('/api/leaderboard/my-rank').catch(() => null)
        if (rankRes && rankRes.data) {
          streak = rankRes.data.streak_days || 0
        }
      } catch {}

      setStats({
        streak,
        totalMastered,
        accuracy: overallAccuracy
      })

      if (setsRes.data.length > 0) {
        const progressRes = await api.get(`/api/study/progress/${setsRes.data[0].id}`).catch(() => null)
        if (progressRes) {
          setProgress(progressRes.data)
        }
      }
    } catch (error) {
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const formatLastStudied = (dateString) => {
    if (!dateString) return 'Never'
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now - date)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? 's' : ''} ago`
    return `${Math.floor(diffDays / 30)} month${Math.floor(diffDays / 30) > 1 ? 's' : ''} ago`
  }

  if (authLoading || (user && loading)) {
    return (
      <div className="flex min-h-screen w-full flex-col bg-background-light dark:bg-background-dark">
        <TopNav />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-background-light dark:bg-background-dark">
      <TopNav />
      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-8">
          {/* Header */}
          <div className="flex flex-wrap justify-between items-center gap-4">
            <p className="text-gray-900 dark:text-white text-4xl font-black leading-tight tracking-[-0.033em] min-w-72">
              Dashboard
            </p>
          </div>

          {/* Stats Cards */}
          {user && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="flex flex-col gap-2 rounded-xl p-6 border border-gray-200 dark:border-white/10 bg-white dark:bg-background-dark">
                <p className="text-gray-600 dark:text-gray-300 text-base font-medium leading-normal">
                  Current Study Streak
                </p>
                <p className="text-gray-900 dark:text-white tracking-light text-3xl font-bold leading-tight">
                  {stats.streak} Days
                </p>
              </div>
              <div className="flex flex-col gap-2 rounded-xl p-6 border border-gray-200 dark:border-white/10 bg-white dark:bg-background-dark">
                <p className="text-gray-600 dark:text-gray-300 text-base font-medium leading-normal">
                  Total Cards Mastered
                </p>
                <p className="text-gray-900 dark:text-white tracking-light text-3xl font-bold leading-tight">
                  {stats.totalMastered} Cards
                </p>
              </div>
              <div className="flex flex-col gap-2 rounded-xl p-6 border border-gray-200 dark:border-white/10 bg-white dark:bg-background-dark">
                <p className="text-gray-600 dark:text-gray-300 text-base font-medium leading-normal">
                  Overall Accuracy
                </p>
                <p className="text-gray-900 dark:text-white tracking-light text-3xl font-bold leading-tight">
                  {stats.accuracy}%
                </p>
              </div>
            </div>
          )}

          {/* Study Performance */}
          {user && (
            <div className="flex flex-col gap-6 rounded-xl border border-gray-200 dark:border-white/10 p-6 bg-white dark:bg-background-dark">
              <div className="flex flex-wrap justify-between items-center gap-4">
                <h2 className="text-gray-900 dark:text-white text-[22px] font-bold leading-tight tracking-[-0.015em]">
                  Study Performance
                </h2>
                <div className="flex gap-2 p-1 bg-gray-100 dark:bg-white/10 rounded-lg">
                  <button
                    onClick={() => setTimeFilter('7days')}
                    className={`flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-md px-4 ${
                      timeFilter === '7days'
                        ? 'bg-white dark:bg-background-dark shadow-sm'
                        : ''
                    }`}
                  >
                    <p className={`text-sm font-medium leading-normal ${
                      timeFilter === '7days'
                        ? 'text-primary'
                        : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                    }`}>
                      Last 7 Days
                    </p>
                  </button>
                  <button
                    onClick={() => setTimeFilter('30days')}
                    className={`flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-md px-4 ${
                      timeFilter === '30days'
                        ? 'bg-white dark:bg-background-dark shadow-sm'
                        : ''
                    }`}
                  >
                    <p className={`text-sm font-medium leading-normal ${
                      timeFilter === '30days'
                        ? 'text-primary'
                        : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                    }`}>
                      Last 30 Days
                    </p>
                  </button>
                  <button
                    onClick={() => setTimeFilter('alltime')}
                    className={`flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-md px-4 ${
                      timeFilter === 'alltime'
                        ? 'bg-white dark:bg-background-dark shadow-sm'
                        : ''
                    }`}
                  >
                    <p className={`text-sm font-medium leading-normal ${
                      timeFilter === 'alltime'
                        ? 'text-primary'
                        : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                    }`}>
                      All Time
                    </p>
                  </button>
                </div>
              </div>
              <div className="w-full h-80 flex items-center justify-center bg-gray-50 dark:bg-white/5 rounded-lg">
                <p className="text-gray-400 dark:text-gray-500 text-sm">
                  Chart visualization coming soon
                </p>
              </div>
            </div>
          )}

          {/* Study Activity & Mastery by Deck */}
          {user && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="flex flex-col gap-6 rounded-xl border border-gray-200 dark:border-white/10 p-6 bg-white dark:bg-background-dark">
                <h2 className="text-gray-900 dark:text-white text-[22px] font-bold leading-tight tracking-[-0.015em]">
                  Study Activity
                </h2>
                <div className="w-full h-80 flex items-center justify-center bg-gray-50 dark:bg-white/5 rounded-lg">
                  <p className="text-gray-400 dark:text-gray-500 text-sm">
                    Heatmap calendar coming soon
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-6 rounded-xl border border-gray-200 dark:border-white/10 p-6 bg-white dark:bg-background-dark">
                <h2 className="text-gray-900 dark:text-white text-[22px] font-bold leading-tight tracking-[-0.015em]">
                  Mastery by Deck
                </h2>
                <div className="w-full h-80 flex items-center justify-center bg-gray-50 dark:bg-white/5 rounded-lg">
                  <p className="text-gray-400 dark:text-gray-500 text-sm">
                    Donut chart coming soon
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Deck Progress Table */}
          {user && (
            <div className="flex flex-col gap-4 rounded-xl border border-gray-200 dark:border-white/10 p-6 bg-white dark:bg-background-dark">
              <h2 className="text-gray-900 dark:text-white text-[22px] font-bold leading-tight tracking-[-0.015em]">
                Deck Progress
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px] text-left">
                  <thead className="border-b border-gray-200 dark:border-white/10">
                    <tr>
                      <th className="p-4 text-sm font-semibold text-gray-500 dark:text-gray-400">
                        Deck Name
                      </th>
                      <th className="p-4 text-sm font-semibold text-gray-500 dark:text-gray-400">
                        Mastery
                      </th>
                      <th className="p-4 text-sm font-semibold text-gray-500 dark:text-gray-400">
                        Accuracy
                      </th>
                      <th className="p-4 text-sm font-semibold text-gray-500 dark:text-gray-400">
                        Last Studied
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {deckProgress.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
                          No decks yet. Create your first deck to get started!
                        </td>
                      </tr>
                    ) : (
                      deckProgress.map((deck, index) => (
                        <tr
                          key={deck.id}
                          className={index < deckProgress.length - 1 ? 'border-b border-gray-200 dark:border-white/10' : ''}
                        >
                          <td className="p-4 text-sm font-medium text-gray-900 dark:text-white">
                            {deck.name}
                          </td>
                          <td className="p-4 text-sm font-medium text-gray-600 dark:text-gray-300">
                            {deck.mastery}%
                          </td>
                          <td className="p-4 text-sm font-medium text-gray-600 dark:text-gray-300">
                            {deck.accuracy}%
                          </td>
                          <td className="p-4 text-sm font-medium text-gray-600 dark:text-gray-300">
                            {formatLastStudied(deck.lastStudied)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {!user && (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                Please login to view your dashboard
              </p>
              <Link
                to="/login"
                className="inline-block px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
              >
                Login
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
