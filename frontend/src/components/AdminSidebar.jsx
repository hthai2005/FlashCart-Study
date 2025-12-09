import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function AdminSidebar() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const isActive = (path) => {
    if (path === '/admin') {
      return location.pathname === '/admin'
    }
    return location.pathname.startsWith(path)
  }

  return (
    <aside className="flex w-64 flex-col bg-white dark:bg-[#1A2831] border-r border-gray-200 dark:border-gray-700 h-screen sticky top-0">
      <div className="flex items-center gap-3 p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="bg-primary p-2 rounded-lg text-white">
          <span className="material-symbols-outlined">school</span>
        </div>
        <h1 className="text-xl font-bold text-gray-800 dark:text-white">Flashcard App</h1>
      </div>

      <nav className="flex flex-col gap-2 p-4 grow">
        <Link
          to="/admin"
          className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer ${
            isActive('/admin') && location.pathname === '/admin'
              ? 'bg-primary/20 text-primary'
              : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10'
          }`}
        >
          <span className="material-symbols-outlined">dashboard</span>
          <p className="text-sm font-medium">Dashboard</p>
        </Link>
        <Link
          to="/admin/users"
          className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer ${
            isActive('/admin/users')
              ? 'bg-primary/20 text-primary'
              : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10'
          }`}
        >
          <span className="material-symbols-outlined">group</span>
          <p className="text-sm font-medium">User Management</p>
        </Link>
        <Link
          to="/admin/sets"
          className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer ${
            isActive('/admin/sets')
              ? 'bg-primary/20 text-primary'
              : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10'
          }`}
        >
          <span className="material-symbols-outlined">style</span>
          <p className="text-sm font-medium">Flashcard Sets</p>
        </Link>
        <Link
          to="/admin/moderation"
          className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer ${
            isActive('/admin/moderation')
              ? 'bg-primary/20 text-primary'
              : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10'
          }`}
        >
          <span className="material-symbols-outlined">flag</span>
          <p className="text-sm font-medium">Content Moderation</p>
        </Link>
      </nav>

      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3 mb-4 px-3 py-2">
          <div className="bg-gradient-to-br from-primary-400 to-purple-500 aspect-square rounded-full size-10 flex items-center justify-center text-white font-semibold text-sm">
            {user?.username?.charAt(0).toUpperCase() || 'A'}
          </div>
          <div className="flex flex-col flex-1">
            <span className="text-sm font-medium text-gray-800 dark:text-white">{user?.username || 'Admin'}</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">Administrator</span>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 cursor-pointer w-full"
        >
          <span className="material-symbols-outlined">logout</span>
          <p className="text-sm font-medium">Logout</p>
        </button>
      </div>
    </aside>
  )
}

