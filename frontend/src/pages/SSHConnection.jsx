import { useState, useEffect } from 'react'
import TopNav from '../components/TopNav'
import Sidebar from '../components/Sidebar'
import toast from 'react-hot-toast'

export default function SSHConnection() {
  const [savedConnections, setSavedConnections] = useState([])
  const [sshConfig, setSshConfig] = useState({
    name: '',
    host: '',
    username: '',
    port: '22',
    keyPath: ''
  })
  const [editingId, setEditingId] = useState(null)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    loadSavedConnections()
  }, [])

  const loadSavedConnections = () => {
    const saved = localStorage.getItem('sshConnections')
    if (saved) {
      setSavedConnections(JSON.parse(saved))
    }
  }

  const saveConnections = (connections) => {
    localStorage.setItem('sshConnections', JSON.stringify(connections))
    setSavedConnections(connections)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setSshConfig(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSave = () => {
    if (!sshConfig.host || !sshConfig.username) {
      toast.error('Vui lòng điền đầy đủ thông tin Host và Username')
      return
    }

    if (!sshConfig.name) {
      sshConfig.name = `${sshConfig.username}@${sshConfig.host}`
    }

    const connections = [...savedConnections]
    
    if (editingId) {
      // Update existing
      const index = connections.findIndex(c => c.id === editingId)
      if (index !== -1) {
        connections[index] = { ...sshConfig, id: editingId }
        toast.success('Đã cập nhật SSH connection!')
      }
    } else {
      // Add new
      const newConnection = {
        ...sshConfig,
        id: Date.now().toString()
      }
      connections.push(newConnection)
      toast.success('Đã lưu SSH connection!')
    }

    saveConnections(connections)
    resetForm()
  }

  const handleEdit = (connection) => {
    setSshConfig(connection)
    setEditingId(connection.id)
    setShowForm(true)
  }

  const handleDelete = (id) => {
    if (window.confirm('Bạn có chắc muốn xóa connection này?')) {
      const connections = savedConnections.filter(c => c.id !== id)
      saveConnections(connections)
      toast.success('Đã xóa SSH connection!')
    }
  }

  const handleConnect = async (connection) => {
    const sshCommand = connection.keyPath
      ? `ssh -i ${connection.keyPath} -p ${connection.port} ${connection.username}@${connection.host}`
      : `ssh -p ${connection.port} ${connection.username}@${connection.host}`

    try {
      await navigator.clipboard.writeText(sshCommand)
      toast.success(`Đã copy SSH command cho ${connection.name}!`)
    } catch (error) {
      toast.error('Không thể copy command')
    }
  }

  const handleTestConnection = (connection) => {
    toast.info('Tính năng test connection đang được phát triển')
  }

  const resetForm = () => {
    setSshConfig({
      name: '',
      host: '',
      username: '',
      port: '22',
      keyPath: ''
    })
    setEditingId(null)
    setShowForm(false)
  }

  const generateSSHConfig = () => {
    if (savedConnections.length === 0) {
      toast.error('Chưa có connection nào được lưu')
      return
    }

    let config = '# SSH Config for VSCode Remote SSH\n\n'
    savedConnections.forEach(conn => {
      config += `Host ${conn.name || `${conn.username}@${conn.host}`}\n`
      config += `    HostName ${conn.host}\n`
      config += `    User ${conn.username}\n`
      config += `    Port ${conn.port}\n`
      if (conn.keyPath) {
        config += `    IdentityFile ${conn.keyPath}\n`
      }
      config += '\n'
    })

    navigator.clipboard.writeText(config)
    toast.success('Đã copy SSH config vào clipboard! Bạn có thể paste vào ~/.ssh/config hoặc C:\\Users\\YourName\\.ssh\\config')
  }

  return (
    <div className="flex min-h-screen w-full bg-background-light dark:bg-background-dark">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <TopNav />
        <main className="flex-1 p-6 lg:p-8">
          <div className="mx-auto max-w-6xl">
            {/* Header */}
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h1 className="text-gray-900 dark:text-white text-4xl font-black leading-tight tracking-[-0.033em] mb-2">
                  Remote Explorer
                </h1>
                <p className="text-gray-600 dark:text-gray-400 text-base">
                  Quản lý và kết nối SSH với các máy ảo hoặc server của bạn
                </p>
              </div>
              <div className="flex gap-3">
                {savedConnections.length > 0 && (
                  <button
                    onClick={generateSSHConfig}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                  >
                    Export SSH Config
                  </button>
                )}
                <button
                  onClick={() => {
                    resetForm()
                    setShowForm(!showForm)
                  }}
                  className="px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors"
                >
                  {showForm ? 'Hủy' : '+ Thêm Connection'}
                </button>
              </div>
            </div>

            {/* Connection Form */}
            {showForm && (
              <div className="bg-white dark:bg-background-dark rounded-xl border border-gray-200 dark:border-white/10 p-6 mb-6">
                <h2 className="text-gray-900 dark:text-white text-xl font-bold mb-4">
                  {editingId ? 'Chỉnh sửa Connection' : 'Thêm Connection Mới'}
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Tên Connection (Alias)
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={sshConfig.name}
                      onChange={handleInputChange}
                      placeholder="vm-flashcard hoặc tên bạn muốn"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      Tên này sẽ được dùng trong SSH config. Để trống sẽ tự động tạo từ username@host
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Host / IP Address *
                    </label>
                    <input
                      type="text"
                      name="host"
                      value={sshConfig.host}
                      onChange={handleInputChange}
                      placeholder="192.168.1.100 hoặc example.com"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Username *
                      </label>
                      <input
                        type="text"
                        name="username"
                        value={sshConfig.username}
                        onChange={handleInputChange}
                        placeholder="ubuntu, root, hoặc username của bạn"
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Port
                      </label>
                      <input
                        type="number"
                        name="port"
                        value={sshConfig.port}
                        onChange={handleInputChange}
                        placeholder="22"
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      SSH Key Path (Tùy chọn)
                    </label>
                    <input
                      type="text"
                      name="keyPath"
                      value={sshConfig.keyPath}
                      onChange={handleInputChange}
                      placeholder="~/.ssh/id_rsa hoặc C:\\Users\\YourName\\.ssh\\id_rsa"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      Để trống nếu sử dụng password authentication
                    </p>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={handleSave}
                      className="flex-1 px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors"
                    >
                      {editingId ? 'Cập nhật' : 'Lưu Connection'}
                    </button>
                    <button
                      onClick={resetForm}
                      className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                    >
                      Hủy
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Saved Connections List */}
            <div className="bg-white dark:bg-background-dark rounded-xl border border-gray-200 dark:border-white/10 p-6">
              <h2 className="text-gray-900 dark:text-white text-xl font-bold mb-4">
                Saved Connections ({savedConnections.length})
              </h2>
              
              {savedConnections.length === 0 ? (
                <div className="text-center py-12">
                  <span className="material-symbols-outlined text-6xl text-gray-400 dark:text-gray-600 mb-4 block">
                    cloud_off
                  </span>
                  <p className="text-gray-500 dark:text-gray-400 mb-4">
                    Chưa có connection nào được lưu
                  </p>
                  <button
                    onClick={() => setShowForm(true)}
                    className="px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors"
                  >
                    Thêm Connection đầu tiên
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {savedConnections.map((connection) => (
                    <div
                      key={connection.id}
                      className="flex items-center justify-between p-4 border border-gray-200 dark:border-white/10 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="material-symbols-outlined text-primary">
                            computer
                          </span>
                          <h3 className="text-gray-900 dark:text-white font-semibold">
                            {connection.name || `${connection.username}@${connection.host}`}
                          </h3>
                        </div>
                        <div className="ml-8 space-y-1 text-sm text-gray-600 dark:text-gray-400">
                          <p>
                            <span className="font-medium">Host:</span> {connection.host}
                          </p>
                          <p>
                            <span className="font-medium">User:</span> {connection.username}
                            {connection.port !== '22' && ` • Port: ${connection.port}`}
                          </p>
                          {connection.keyPath && (
                            <p className="text-xs">
                              <span className="font-medium">Key:</span> {connection.keyPath}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleConnect(connection)}
                          className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
                          title="Copy SSH Command"
                        >
                          <span className="material-symbols-outlined text-lg">content_copy</span>
                        </button>
                        <button
                          onClick={() => handleTestConnection(connection)}
                          className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                          title="Test Connection"
                        >
                          <span className="material-symbols-outlined text-lg">network_check</span>
                        </button>
                        <button
                          onClick={() => handleEdit(connection)}
                          className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                          title="Edit"
                        >
                          <span className="material-symbols-outlined text-lg">edit</span>
                        </button>
                        <button
                          onClick={() => handleDelete(connection.id)}
                          className="px-4 py-2 border border-red-300 dark:border-red-600 text-red-700 dark:text-red-300 rounded-lg text-sm font-medium hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                          title="Delete"
                        >
                          <span className="material-symbols-outlined text-lg">delete</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Instructions */}
            <div className="mt-6 bg-white dark:bg-background-dark rounded-xl border border-gray-200 dark:border-white/10 p-6">
              <h2 className="text-gray-900 dark:text-white text-xl font-bold mb-4">
                Hướng dẫn sử dụng
              </h2>
              
              <div className="space-y-4 text-gray-700 dark:text-gray-300">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    1. Thêm Connection
                  </h3>
                  <p className="text-sm">
                    Click "Thêm Connection" và điền thông tin SSH. Connection sẽ được lưu trong trình duyệt của bạn.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    2. Kết nối SSH
                  </h3>
                  <p className="text-sm mb-2">
                    Click nút copy để copy SSH command, sau đó paste vào terminal để kết nối.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    3. Sử dụng với VSCode Remote SSH
                  </h3>
                  <p className="text-sm mb-2">
                    Click "Export SSH Config" để copy SSH config format. Sau đó:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-sm ml-4">
                    <li>Mở file <code className="bg-gray-100 dark:bg-slate-700 px-1 rounded">~/.ssh/config</code> (Linux/Mac) hoặc <code className="bg-gray-100 dark:bg-slate-700 px-1 rounded">C:\Users\YourName\.ssh\config</code> (Windows)</li>
                    <li>Paste config vào file</li>
                    <li>Trong VSCode, nhấn F1 → "Remote-SSH: Connect to Host"</li>
                    <li>Chọn connection từ danh sách</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
