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

    const allUsers = await User.find()
    const totalPredictions = allUsers.reduce((sum, user) => sum + (user.predictions?.length || 0), 0)

    const usersWithPredictions = allUsers.filter(user => user.predictions && user.predictions.length > 0)
    let averageAccuracy = 0
    if (usersWithPredictions.length > 0) {
      const totalConfidence = usersWithPredictions.reduce((sum, user) => {
        const userAvgConfidence = user.predictions.reduce((pSum, p) => pSum + (p.confidence || 0), 0) / user.predictions.length
        return sum + userAvgConfidence
      }, 0)
      averageAccuracy = Math.round(totalConfidence / usersWithPredictions.length)
    }

    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
    const dailyActiveUsers = await User.countDocuments({ lastLogin: { $gte: oneDayAgo } })

    const stats = {
      totalUsers,
      activeUsers,
      bannedUsers,
      totalStocks,
      totalPredictions,
      averageAccuracy,
      dailyActiveUsers,
      revenue: 0,
      systemAlerts: 0
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
    const users = await User.find().sort({ createdAt: 1 })

    const userGrowthMap = {}
    users.forEach(user => {
      const date = user.createdAt.toISOString().split('T')[0]
      userGrowthMap[date] = (userGrowthMap[date] || 0) + 1
    })

    let cumulativeUsers = 0
    const userGrowth = []
    const last7Days = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      last7Days.push(date)
    }

    last7Days.forEach(date => {
      Object.keys(userGrowthMap).forEach(key => {
        if (key <= date) {
          cumulativeUsers = Object.keys(userGrowthMap)
            .filter(k => k <= date)
            .reduce((sum, k) => sum + userGrowthMap[k], 0)
        }
      })
      userGrowth.push({ date, users: cumulativeUsers })
    })

    const allUsers = await User.find()
    const allPredictions = allUsers.flatMap(user => user.predictions || [])

    const excellentCount = allPredictions.filter(p => p.confidence >= 90).length
    const goodCount = allPredictions.filter(p => p.confidence >= 80 && p.confidence < 90).length
    const averageCount = allPredictions.filter(p => p.confidence >= 70 && p.confidence < 80).length
    const poorCount = allPredictions.filter(p => p.confidence < 70).length

    const total = allPredictions.length || 1
    const predictionAccuracy = [
      { name: 'Excellent (90%+)', value: Math.round((excellentCount / total) * 100), color: '#10b981' },
      { name: 'Good (80-89%)', value: Math.round((goodCount / total) * 100), color: '#3b82f6' },
      { name: 'Average (70-79%)', value: Math.round((averageCount / total) * 100), color: '#f59e0b' },
      { name: 'Poor (<70%)', value: Math.round((poorCount / total) * 100), color: '#ef4444' }
    ]

    const analytics = {
      userGrowth,
      predictionAccuracy
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