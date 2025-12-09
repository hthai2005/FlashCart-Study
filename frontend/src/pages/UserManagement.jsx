import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import api from '../services/api'
import toast from 'react-hot-toast'
import AdminSidebar from '../components/AdminSidebar'

export default function UserManagement() {
  const { user, loading: authLoading } = useAuth()
  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState('All')
  const [selectedUsers, setSelectedUsers] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalUsers, setTotalUsers] = useState(0)
  const usersPerPage = 5

  useEffect(() => {
    if (user && !authLoading) {
      fetchUsers()
    }
  }, [user, authLoading, currentPage])

  const fetchUsers = async () => {
    try {
      // Fetch users from API (this endpoint may need to be created)
      const response = await api.get('/api/admin/users').catch(() => ({
        data: {
          users: [],
          total: 0
        }
      }))

      if (response.data.users) {
        setUsers(response.data.users)
        setTotalUsers(response.data.total || response.data.users.length)
      } else {
        // Mock data for demonstration
        const mockUsers = [
          {
            id: 1,
            username: 'olivia.m',
            email: 'olivia.m@example.com',
            full_name: 'Olivia Martin',
            role: 'Admin',
            date_joined: '2023-10-26',
            last_active: '2024-05-22',
            status: 'Active'
          },
          {
            id: 2,
            username: 'ben.carter',
            email: 'ben.carter@example.com',
            full_name: 'Benjamin Carter',
            role: 'User',
            date_joined: '2023-10-25',
            last_active: '2024-05-21',
            status: 'Active'
          },
          {
            id: 3,
            username: 'sophia.r',
            email: 'sophia.r@example.com',
            full_name: 'Sophia Rodriguez',
            role: 'User',
            date_joined: '2023-10-24',
            last_active: '2024-05-20',
            status: 'Suspended'
          },
          {
            id: 4,
            username: 'liam.g',
            email: 'liam.g@example.com',
            full_name: 'Liam Goldberg',
            role: 'User',
            date_joined: '2023-10-23',
            last_active: '2024-05-19',
            status: 'Active'
          },
          {
            id: 5,
            username: 'ava.n',
            email: 'ava.n@example.com',
            full_name: 'Ava Nguyen',
            role: 'Admin',
            date_joined: '2023-10-22',
            last_active: '2024-05-18',
            status: 'Active'
          }
        ]
        setUsers(mockUsers)
        setTotalUsers(mockUsers.length)
      }
    } catch (error) {
      toast.error('Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedUsers(users.map(u => u.id))
    } else {
      setSelectedUsers([])
    }
  }

  const handleSelectUser = (userId) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    )
  }

  const handleDelete = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await api.delete(`/api/admin/users/${userId}`)
        toast.success('User deleted successfully')
        fetchUsers()
      } catch (error) {
        toast.error('Failed to delete user')
      }
    }
  }

  const handleEdit = (userId) => {
    toast.info('Edit user functionality coming soon!')
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.username?.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesRole = roleFilter === 'All' || user.role === roleFilter
    const matchesStatus = statusFilter === 'All' || user.status === statusFilter
    
    return matchesSearch && matchesRole && matchesStatus
  })

  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * usersPerPage,
    currentPage * usersPerPage
  )

  const totalPages = Math.ceil(filteredUsers.length / usersPerPage)

  if (authLoading || loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background-light dark:bg-background-dark">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="relative flex min-h-screen w-full bg-background-light dark:bg-background-dark">
      <AdminSidebar />

      {/* Main Content */}
      <main className="flex-1 p-8">
        <div className="mx-auto flex w-full max-w-7xl flex-col">
          {/* PageHeading */}
          <header className="flex flex-wrap items-center justify-between gap-3">
            <h1 className="text-gray-900 dark:text-white text-4xl font-black leading-tight tracking-[-0.033em]">
              User Management
            </h1>
            <button
              onClick={() => toast.info('Add user functionality coming soon!')}
              className="flex min-w-[84px] cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-lg h-10 px-4 bg-primary text-[#111618] text-sm font-bold leading-normal tracking-[0.015em]"
            >
              <span className="material-symbols-outlined">add</span>
              <span className="truncate">Add User</span>
            </button>
          </header>

          {/* Search and Filters */}
          <div className="mt-6 flex flex-wrap items-center gap-4">
            {/* SearchBar */}
            <div className="flex-grow">
              <label className="flex flex-col min-w-40 h-12 w-full">
                <div className="flex w-full flex-1 items-stretch rounded-lg h-full">
                  <div className="text-gray-500 dark:text-gray-400 flex border-none bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 items-center justify-center pl-4 rounded-l-lg border-r-0">
                    <span className="material-symbols-outlined">search</span>
                  </div>
                  <input
                    className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-gray-900 dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-l-0 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:border-primary h-full placeholder:text-gray-400 dark:placeholder:text-gray-500 px-4 rounded-l-none pl-2 text-base font-normal leading-normal"
                    placeholder="Search by name or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </label>
            </div>

            {/* Chips */}
            <div className="flex gap-3 flex-wrap">
              <button
                onClick={() => toast.info('Role filter coming soon!')}
                className="flex h-12 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 px-4 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <p className="text-gray-900 dark:text-white text-sm font-medium leading-normal">Role: {roleFilter}</p>
                <span className="material-symbols-outlined text-gray-600 dark:text-gray-400">arrow_drop_down</span>
              </button>
              <button
                onClick={() => toast.info('Status filter coming soon!')}
                className="flex h-12 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 px-4 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <p className="text-gray-900 dark:text-white text-sm font-medium leading-normal">Status: {statusFilter}</p>
                <span className="material-symbols-outlined text-gray-600 dark:text-gray-400">arrow_drop_down</span>
              </button>
              <button
                onClick={() => {
                  setSearchQuery('')
                  setRoleFilter('All')
                  setStatusFilter('All')
                }}
                className="flex h-12 shrink-0 items-center justify-center gap-x-2 rounded-lg border border-gray-300 dark:border-gray-600 px-4 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white"
              >
                <span className="material-symbols-outlined">close</span>
                <p className="text-sm font-medium leading-normal">Clear Filters</p>
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="mt-6">
            <div className="flex overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              <table className="w-full text-left">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th className="p-4 w-12 text-center">
                      <input
                        className="h-5 w-5 rounded border-gray-300 dark:border-gray-600 border-2 bg-transparent text-primary checked:bg-primary checked:border-primary focus:ring-0 focus:ring-offset-0"
                        type="checkbox"
                        checked={selectedUsers.length === paginatedUsers.length && paginatedUsers.length > 0}
                        onChange={handleSelectAll}
                      />
                    </th>
                    <th className="px-4 py-3 text-left text-gray-900 dark:text-white text-sm font-medium leading-normal">
                      User
                    </th>
                    <th className="px-4 py-3 text-left text-gray-900 dark:text-white text-sm font-medium leading-normal">Role</th>
                    <th className="px-4 py-3 text-left text-gray-900 dark:text-white text-sm font-medium leading-normal">
                      Date Joined
                    </th>
                    <th className="px-4 py-3 text-left text-gray-900 dark:text-white text-sm font-medium leading-normal">
                      Last Active
                    </th>
                    <th className="px-4 py-3 text-left text-gray-900 dark:text-white text-sm font-medium leading-normal">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-gray-900 dark:text-white text-sm font-medium leading-normal">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedUsers.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                        No users found
                      </td>
                    </tr>
                  ) : (
                    paginatedUsers.map((user) => (
                      <tr
                        key={user.id}
                        className="border-t border-t-gray-200 dark:border-t-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900/50"
                      >
                        <td className="p-4 text-center">
                          <input
                            className="h-5 w-5 rounded border-gray-300 dark:border-gray-600 border-2 bg-transparent text-primary checked:bg-primary checked:border-primary focus:ring-0 focus:ring-offset-0"
                            type="checkbox"
                            checked={selectedUsers.includes(user.id)}
                            onChange={() => handleSelectUser(user.id)}
                          />
                        </td>
                        <td className="px-4 py-3 text-gray-900 dark:text-white text-sm font-normal leading-normal">
                          <div className="flex items-center gap-3">
                            <div className="bg-gradient-to-br from-primary-400 to-purple-500 aspect-square rounded-full size-8 flex items-center justify-center text-white text-xs font-semibold">
                              {user.full_name?.charAt(0).toUpperCase() || user.username?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            <div>
                              <div className="text-gray-900 dark:text-white">{user.full_name || user.username}</div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">{user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-600 dark:text-gray-300 text-sm font-normal leading-normal">
                          {user.role}
                        </td>
                        <td className="px-4 py-3 text-gray-600 dark:text-gray-300 text-sm font-normal leading-normal">
                          {user.date_joined}
                        </td>
                        <td className="px-4 py-3 text-gray-600 dark:text-gray-300 text-sm font-normal leading-normal">
                          {user.last_active}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              user.status === 'Active'
                                ? 'bg-green-500/20 text-green-600 dark:text-green-400'
                                : user.status === 'Suspended'
                                ? 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400'
                                : 'bg-red-500/20 text-red-600 dark:text-red-400'
                            }`}
                          >
                            {user.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-600 dark:text-gray-300 text-sm leading-normal">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEdit(user.id)}
                              className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                            >
                              <span className="material-symbols-outlined text-xl">edit</span>
                            </button>
                            <button
                              onClick={() => handleDelete(user.id)}
                              className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                            >
                              <span className="material-symbols-outlined text-xl">delete</span>
                            </button>
                            <button
                              onClick={() => toast.info('More options coming soon!')}
                              className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                            >
                              <span className="material-symbols-outlined text-xl">more_horiz</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          <div className="mt-6 flex items-center justify-between">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Showing {(currentPage - 1) * usersPerPage + 1} to {Math.min(currentPage * usersPerPage, filteredUsers.length)} of {filteredUsers.length} users
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="material-symbols-outlined text-xl">chevron_left</span>
              </button>
              {Array.from({ length: Math.min(totalPages, 3) }, (_, i) => {
                const page = currentPage <= 2 ? i + 1 : currentPage - 1 + i
                if (page > totalPages) return null
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`flex h-8 w-8 items-center justify-center rounded-lg border border-gray-300 dark:border-gray-600 ${
                      currentPage === page
                        ? 'bg-primary text-white border-primary'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    {page}
                  </button>
                )
              })}
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="material-symbols-outlined text-xl">chevron_right</span>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

