import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Sets from './pages/Sets'
import Study from './pages/Study'
import Leaderboard from './pages/Leaderboard'
import CreateSet from './pages/CreateSet'
import Profile from './pages/Profile'
import Achievements from './pages/Achievements'
import AdminDashboard from './pages/AdminDashboard'
import UserManagement from './pages/UserManagement'
import SetManagement from './pages/SetManagement'
import ContentModeration from './pages/ContentModeration'
import StudyGuard from './components/StudyGuard'

function PrivateRoute({ children }) {
  const { user, loading } = useAuth()
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }
  
  return user ? children : <Navigate to="/login" />
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-background-light dark:bg-background-dark">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/sets" element={<Sets />} />
            <Route path="/sets/create" element={<CreateSet />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/achievements" element={<Achievements />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<UserManagement />} />
            <Route path="/admin/sets" element={<SetManagement />} />
            <Route path="/admin/moderation" element={<ContentModeration />} />
            <Route
              path="/study/:setId"
              element={
                <StudyGuard>
                  <Study />
                </StudyGuard>
              }
            />
          </Routes>
          <Toaster position="top-right" />
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App

