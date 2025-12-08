import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import TopNav from '../components/TopNav'
import api from '../services/api'
import toast from 'react-hot-toast'

export default function Achievements() {
  const { user, logout, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [achievements, setAchievements] = useState([])
  const [stats, setStats] = useState({
    totalSessions: 0,
    currentStreak: 0,
    totalDecks: 0,
    perfectQuizzes: 0,
    correctStreak: 0
  })

  useEffect(() => {
    if (user && !authLoading) {
      fetchAchievements()
    } else if (!authLoading && !user) {
      navigate('/login')
    }
  }, [user, authLoading])

  const fetchAchievements = async () => {
    try {
      // Fetch user stats
      const [setsRes, rankRes] = await Promise.all([
        api.get('/api/flashcards/sets').catch(() => ({ data: [] })),
        api.get('/api/leaderboard/my-rank').catch(() => ({ data: null }))
      ])

      const totalDecks = setsRes.data.length
      const currentStreak = rankRes.data?.streak_days || 0
      
      // Get session count (simplified - can be enhanced with actual API)
      let totalSessions = 0
      try {
        const sessionsRes = await api.get('/api/study/sessions').catch(() => ({ data: [] }))
        totalSessions = sessionsRes.data.length || 0
      } catch {}

      // Calculate achievements
      const achievementList = [
        {
          id: 'first_steps',
          icon: 'school',
          title: 'First Steps',
          description: 'Complete your first study session.',
          progress: totalSessions > 0 ? 1 : 0,
          maxProgress: 1,
          completed: totalSessions > 0,
          status: totalSessions > 0 ? '1/1 Completed' : '0/1 Completed'
        },
        {
          id: 'study_streak',
          icon: 'local_fire_department',
          title: 'Study Streak',
          description: 'Maintain a 7-day study streak.',
          progress: Math.min(currentStreak, 7),
          maxProgress: 7,
          completed: currentStreak >= 7,
          status: `${currentStreak}/7 Days`
        },
        {
          id: 'deck_builder',
          icon: 'library_add',
          title: 'Deck Builder',
          description: 'Create 5 custom decks.',
          progress: Math.min(totalDecks, 5),
          maxProgress: 5,
          completed: totalDecks >= 5,
          status: `${totalDecks}/5 Decks`
        },
        {
          id: 'quick_learner',
          icon: 'rocket_launch',
          title: 'Quick Learner',
          description: 'Master a deck in under an hour.',
          progress: 0,
          maxProgress: 1,
          completed: false,
          status: 'Locked'
        },
        {
          id: 'knowledge_king',
          icon: 'social_leaderboard',
          title: 'Knowledge King',
          description: 'Score 100% on 10 quizzes.',
          progress: 0, // Can be calculated from study sessions
          maxProgress: 10,
          completed: false,
          status: '0/10 Quizzes'
        },
        {
          id: 'perfectionist',
          icon: 'workspace_premium',
          title: 'Perfectionist',
          description: 'Get 1000 cards right in a row.',
          progress: 0, // Can be calculated from study records
          maxProgress: 1000,
          completed: false,
          status: '0/1000 Cards'
        }
      ]

      setAchievements(achievementList)
      setStats({
        totalSessions,
        currentStreak,
        totalDecks,
        perfectQuizzes: 0,
        correctStreak: 0
      })
    } catch (error) {
      toast.error('Failed to load achievements')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen w-full flex-col bg-background-light dark:bg-background-dark">
        <TopNav />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </main>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col bg-background-light dark:bg-background-dark overflow-x-hidden">
      <TopNav />
      
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="w-full lg:w-64 flex-shrink-0">
            <div className="sticky top-24 flex flex-col gap-2 bg-white dark:bg-[#1c2327] p-4 rounded-xl border border-slate-200 dark:border-[#283339]">
              <a
                onClick={(e) => {
                  e.preventDefault()
                  navigate('/profile')
                }}
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-[#283339] text-slate-700 dark:text-white transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-2xl">person</span>
                <p className="text-sm font-medium leading-normal">Profile</p>
              </a>
              <a
                onClick={(e) => {
                  e.preventDefault()
                }}
                className="flex items-center gap-3 px-3 py-2 rounded-lg bg-primary/20 text-primary cursor-pointer"
              >
                <span className="material-symbols-outlined text-2xl">military_tech</span>
                <p className="text-sm font-medium leading-normal">Achievements</p>
              </a>
              <div className="border-t border-slate-200 dark:border-[#283339] my-2"></div>
              <a
                onClick={(e) => {
                  e.preventDefault()
                  toast.info('Help center coming soon!')
                }}
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-[#283339] text-slate-700 dark:text-white transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-2xl">help</span>
                <p className="text-sm font-medium leading-normal">Help</p>
              </a>
              <a
                onClick={handleLogout}
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-red-500/10 text-red-500 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-2xl">logout</span>
                <p className="text-sm font-medium leading-normal">Log Out</p>
              </a>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-col gap-8">
              <div className="flex flex-col gap-6" id="achievements">
                <h1 className="text-slate-900 dark:text-white text-3xl sm:text-4xl font-black leading-tight tracking-[-0.033em] min-w-72">
                  Achievements
                </h1>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {achievements.map((achievement) => {
                    const progressPercentage = achievement.maxProgress > 0
                      ? (achievement.progress / achievement.maxProgress) * 100
                      : 0
                    const isLocked = !achievement.completed && achievement.progress === 0 && achievement.id !== 'first_steps'

                    return (
                      <div
                        key={achievement.id}
                        className={`flex flex-col items-center gap-4 bg-white dark:bg-[#1c2327] p-6 rounded-xl border border-slate-200 dark:border-[#283339] ${
                          isLocked ? 'opacity-50' : ''
                        }`}
                      >
                        <div
                          className={`flex items-center justify-center size-20 rounded-full ${
                            achievement.completed
                              ? 'bg-primary/10 text-primary'
                              : isLocked
                              ? 'bg-slate-200 dark:bg-[#283339] text-slate-500 dark:text-[#9db0b9]'
                              : 'bg-primary/10 text-primary'
                          }`}
                        >
                          <span className="material-symbols-outlined !text-5xl">{achievement.icon}</span>
                        </div>
                        <div className="text-center">
                          <h3
                            className={`text-lg font-bold ${
                              achievement.completed
                                ? 'text-slate-900 dark:text-white'
                                : isLocked
                                ? 'text-slate-700 dark:text-white/80'
                                : 'text-slate-900 dark:text-white'
                            }`}
                          >
                            {achievement.title}
                          </h3>
                          <p className="text-slate-500 dark:text-[#9db0b9] text-sm">
                            {achievement.description}
                          </p>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-[#283339] rounded-full h-2.5">
                          <div
                            className="bg-primary h-2.5 rounded-full transition-all duration-300"
                            style={{ width: `${progressPercentage}%` }}
                          ></div>
                        </div>
                        <p className="text-slate-500 dark:text-[#9db0b9] text-xs font-medium">
                          {achievement.status}
                        </p>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

