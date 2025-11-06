const express = require('express')
const User = require('../models/User')
const Stock = require('../models/Stock')
const { adminAuth } = require('../middleware/auth')

const router = express.Router()

// Get admin dashboard stats
router.get('/stats', adminAuth, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments()
    const activeUsers = await User.countDocuments({ status: 'active' })
    const bannedUsers = await User.countDocuments({ status: 'banned' })
    const totalStocks = await Stock.countDocuments()

    // Mock additional stats
    const stats = {
      totalUsers,
      activeUsers,
      bannedUsers,
      totalStocks,
      totalPredictions: 15634,
      averageAccuracy: 76.8,
      dailyActiveUsers: 642,
      revenue: 12450,
      systemAlerts: 3
    }

    res.json(stats)
  } catch (error) {
    console.error('Admin stats error:', error)
    res.status(500).json({ 
      message: 'Error fetching admin stats',
      error: error.message 
    })
  }
})

// Get all users
router.get('/users', adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query
    
    let query = {}
    if (status) query.status = status
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ]
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)

    const total = await User.countDocuments(query)

    res.json({
      users,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    })
  } catch (error) {
    console.error('Get users error:', error)
    res.status(500).json({ 
      message: 'Error fetching users',
      error: error.message 
    })
  }
})

// Update user status
router.put('/users/:userId/status', adminAuth, async (req, res) => {
  try {
    const { userId } = req.params
    const { status } = req.body

    if (!['active', 'banned', 'pending'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' })
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { status },
      { new: true }
    ).select('-password')

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    res.json({ message: 'User status updated', user })
  } catch (error) {
    console.error('Update user status error:', error)
    res.status(500).json({ 
      message: 'Error updating user status',
      error: error.message 
    })
  }
})

// Delete user
router.delete('/users/:userId', adminAuth, async (req, res) => {
  try {
    const { userId } = req.params

    const user = await User.findByIdAndDelete(userId)
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    res.json({ message: 'User deleted successfully' })
  } catch (error) {
    console.error('Delete user error:', error)
    res.status(500).json({ 
      message: 'Error deleting user',
      error: error.message 
    })
  }
})

// Get system analytics
router.get('/analytics', adminAuth, async (req, res) => {
  try {
    // Mock analytics data
    const analytics = {
      userGrowth: [
        { date: '2024-01-01', users: 1000 },
        { date: '2024-01-02', users: 1050 },
        { date: '2024-01-03', users: 1120 },
        { date: '2024-01-04', users: 1180 },
        { date: '2024-01-05', users: 1200 },
        { date: '2024-01-06', users: 1230 },
        { date: '2024-01-07', users: 1247 }
      ],
      predictionAccuracy: [
        { name: 'Excellent (90%+)', value: 25, color: '#10b981' },
        { name: 'Good (80-89%)', value: 35, color: '#3b82f6' },
        { name: 'Average (70-79%)', value: 30, color: '#f59e0b' },
        { name: 'Poor (<70%)', value: 10, color: '#ef4444' }
      ],
      topStocks: [
        { symbol: 'AAPL', predictions: 1234, accuracy: 85 },
        { symbol: 'GOOGL', predictions: 987, accuracy: 78 },
        { symbol: 'MSFT', predictions: 876, accuracy: 82 },
        { symbol: 'TSLA', predictions: 654, accuracy: 71 }
      ]
    }

    res.json(analytics)
  } catch (error) {
    console.error('Analytics error:', error)
    res.status(500).json({ 
      message: 'Error fetching analytics',
      error: error.message 
    })
  }
})

// Get system activity logs
router.get('/activity', adminAuth, async (req, res) => {
  try {
    // Mock activity data
    const activities = [
      {
        id: 1,
        time: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        event: 'New user registration: john.doe@email.com',
        type: 'info'
      },
      {
        id: 2,
        time: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
        event: 'High prediction accuracy alert: AAPL model 95%',
        type: 'success'
      },
      {
        id: 3,
        time: new Date(Date.now() - 75 * 60 * 1000).toISOString(),
        event: 'System backup completed successfully',
        type: 'success'
      },
      {
        id: 4,
        time: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
        event: 'API rate limit exceeded for user ID: 1247',
        type: 'warning'
      },
      {
        id: 5,
        time: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
        event: 'Daily model training initiated',
        type: 'info'
      }
    ]

    res.json(activities)
  } catch (error) {
    console.error('Activity logs error:', error)
    res.status(500).json({ 
      message: 'Error fetching activity logs',
      error: error.message 
    })
  }
})

module.exports = router