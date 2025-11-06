import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Users,
  BarChart3,
  TrendingUp,
  AlertTriangle,
  UserCheck,
  UserX,
  Activity,
  DollarSign
} from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import axios from 'axios'
import toast from 'react-hot-toast'

const Admin = () => {
  const [users, setUsers] = useState([])
  const [analytics, setAnalytics] = useState({})
  const [selectedTab, setSelectedTab] = useState('overview')
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

  useEffect(() => {
    fetchAdminData()
  }, [])

  const fetchAdminData = async () => {
    try {
      const token = localStorage.getItem('token')
      const headers = { Authorization: `Bearer ${token}` }

      const [statsResponse, usersResponse, analyticsResponse] = await Promise.all([
        axios.get(`${API_URL}/api/admin/stats`, { headers }),
        axios.get(`${API_URL}/api/admin/users`, { headers }),
        axios.get(`${API_URL}/api/admin/analytics`, { headers })
      ])

      const stats = statsResponse.data
      const usersData = usersResponse.data.users.map(user => ({
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        joinDate: new Date(user.createdAt).toLocaleDateString(),
        lastLogin: new Date(user.lastLogin).toLocaleDateString(),
        predictions: user.predictions?.length || 0,
        accuracy: user.predictions?.length > 0 ?
          Math.round(user.predictions.reduce((sum, p) => sum + (p.confidence || 75), 0) / user.predictions.length) :
          75
      }))

      const analyticsData = {
        ...stats,
        userGrowth: analyticsResponse.data.userGrowth,
        predictionAccuracy: analyticsResponse.data.predictionAccuracy
      }

      setUsers(usersData)
      setAnalytics(analyticsData)
    } catch (error) {
      console.error('Admin data fetch error:', error)
      toast.error('Failed to load admin data')
    }
  }

  const toggleUserStatus = async (userId) => {
    const user = users.find(u => u.id === userId)
    const newStatus = user.status === 'active' ? 'banned' : 'active'

    try {
      const token = localStorage.getItem('token')
      await axios.put(
        `${API_URL}/api/admin/users/${userId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      setUsers(prev => prev.map(u =>
        u.id === userId ? { ...u, status: newStatus } : u
      ))

      toast.success(`User ${newStatus === 'active' ? 'activated' : 'banned'} successfully`)
    } catch (error) {
      console.error('Toggle user status error:', error)
      toast.error('Failed to update user status')
    }
  }

  const stats = [
    {
      title: 'Total Users',
      value: analytics.totalUsers?.toLocaleString() || '0',
      change: '+12.5%',
      icon: Users,
      color: 'text-blue-400'
    },
    {
      title: 'Active Users',
      value: analytics.activeUsers?.toLocaleString() || '0',
      change: '+8.2%',
      icon: UserCheck,
      color: 'text-green-400'
    },
    {
      title: 'Total Predictions',
      value: analytics.totalPredictions?.toLocaleString() || '0',
      change: '+15.7%',
      icon: BarChart3,
      color: 'text-purple-400'
    },
    {
      title: 'Avg. Accuracy',
      value: `${analytics.averageAccuracy || 0}%`,
      change: '+2.1%',
      icon: TrendingUp,
      color: 'text-yellow-400'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              Admin Dashboard
            </h1>
            <p className="text-gray-400">
              Monitor platform performance and manage users
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="card hover:border-primary-500 transition-colors duration-300"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">{stat.title}</p>
                      <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
                      <p className="text-green-400 text-sm mt-1">{stat.change}</p>
                    </div>
                    <div className={stat.color}>
                      <Icon className="h-8 w-8" />
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>

          {/* Tab Navigation */}
          <div className="mb-8">
            <div className="flex space-x-1 bg-gray-800 p-1 rounded-lg w-fit">
              {[
                { key: 'overview', label: 'Overview' },
                { key: 'users', label: 'User Management' },
                { key: 'analytics', label: 'Analytics' }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setSelectedTab(tab.key)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    selectedTab === tab.key
                      ? 'bg-primary-600 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-gray-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          {selectedTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="card"
              >
                <h3 className="text-lg font-semibold mb-4 text-white">User Growth</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={analytics.userGrowth}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} />
                      <YAxis stroke="#9ca3af" fontSize={12} />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: '#1f2937',
                          border: '1px solid #374151',
                          borderRadius: '8px',
                          color: '#f9fafb'
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="users" 
                        stroke="#3b82f6"
                        strokeWidth={2}
                        dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="card"
              >
                <h3 className="text-lg font-semibold mb-4 text-white">Prediction Accuracy Distribution</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={analytics.predictionAccuracy}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {analytics.predictionAccuracy?.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: '#1f2937',
                          border: '1px solid #374151',
                          borderRadius: '8px',
                          color: '#f9fafb'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 space-y-2">
                  {analytics.predictionAccuracy?.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: item.color }}
                        ></div>
                        <span className="text-gray-300 text-sm">{item.name}</span>
                      </div>
                      <span className="text-white font-medium">{item.value}%</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          )}

          {selectedTab === 'users' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="card"
            >
              <h3 className="text-lg font-semibold mb-4 text-white">User Management</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left py-3 text-gray-400 font-medium">User</th>
                      <th className="text-left py-3 text-gray-400 font-medium">Role</th>
                      <th className="text-left py-3 text-gray-400 font-medium">Status</th>
                      <th className="text-left py-3 text-gray-400 font-medium">Join Date</th>
                      <th className="text-right py-3 text-gray-400 font-medium">Predictions</th>
                      <th className="text-right py-3 text-gray-400 font-medium">Accuracy</th>
                      <th className="text-center py-3 text-gray-400 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id} className="border-b border-gray-700 hover:bg-gray-800 transition-colors">
                        <td className="py-3">
                          <div>
                            <div className="font-semibold text-white">{user.name}</div>
                            <div className="text-sm text-gray-400">{user.email}</div>
                          </div>
                        </td>
                        <td className="py-3">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            user.role === 'admin' ? 'bg-purple-900 text-purple-300' : 'bg-gray-700 text-gray-300'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="py-3">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            user.status === 'active' ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'
                          }`}>
                            {user.status}
                          </span>
                        </td>
                        <td className="py-3 text-gray-300">{user.joinDate}</td>
                        <td className="py-3 text-right text-white">{user.predictions}</td>
                        <td className="py-3 text-right text-white">{user.accuracy}%</td>
                        <td className="py-3 text-center">
                          <button
                            onClick={() => toggleUserStatus(user.id)}
                            className={`p-2 rounded-lg transition-colors ${
                              user.status === 'active' 
                                ? 'text-red-400 hover:bg-red-900/20' 
                                : 'text-green-400 hover:bg-green-900/20'
                            }`}
                          >
                            {user.status === 'active' ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {selectedTab === 'analytics' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-8"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="card text-center">
                  <Activity className="h-12 w-12 text-blue-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">Daily Active Users</h3>
                  <p className="text-3xl font-bold text-blue-400">642</p>
                  <p className="text-green-400 text-sm mt-1">+5.2% from yesterday</p>
                </div>
                
                <div className="card text-center">
                  <DollarSign className="h-12 w-12 text-green-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">Revenue</h3>
                  <p className="text-3xl font-bold text-green-400">$12,450</p>
                  <p className="text-green-400 text-sm mt-1">+8.7% this month</p>
                </div>
                
                <div className="card text-center">
                  <AlertTriangle className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">System Alerts</h3>
                  <p className="text-3xl font-bold text-yellow-400">3</p>
                  <p className="text-gray-400 text-sm mt-1">Requires attention</p>
                </div>
              </div>

              <div className="card">
                <h3 className="text-lg font-semibold mb-4 text-white">Recent System Activity</h3>
                <div className="space-y-3">
                  {[
                    { time: '10:30 AM', event: 'New user registration: john.doe@email.com', type: 'info' },
                    { time: '10:15 AM', event: 'High prediction accuracy alert: AAPL model 95%', type: 'success' },
                    { time: '09:45 AM', event: 'System backup completed successfully', type: 'success' },
                    { time: '09:30 AM', event: 'API rate limit exceeded for user ID: 1247', type: 'warning' },
                    { time: '09:00 AM', event: 'Daily model training initiated', type: 'info' }
                  ].map((activity, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-gray-700 rounded-lg">
                      <div className={`w-2 h-2 rounded-full ${
                        activity.type === 'success' ? 'bg-green-400' :
                        activity.type === 'warning' ? 'bg-yellow-400' :
                        'bg-blue-400'
                      }`}></div>
                      <div className="flex-1">
                        <div className="text-white text-sm">{activity.event}</div>
                        <div className="text-gray-400 text-xs">{activity.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  )
}

export default Admin