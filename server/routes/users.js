const express = require('express')
const User = require('../models/User')
const { auth } = require('../middleware/auth')

const router = express.Router()

// Get user profile
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('watchlist')
      .populate('predictions')
    
    res.json(user)
  } catch (error) {
    console.error('Get profile error:', error)
    res.status(500).json({ 
      message: 'Error fetching profile',
      error: error.message 
    })
  }
})

// Update user profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { name, email } = req.body
    const user = await User.findById(req.user._id)

    if (name) user.name = name
    if (email) user.email = email

    await user.save()
    res.json({ message: 'Profile updated successfully', user })
  } catch (error) {
    console.error('Update profile error:', error)
    res.status(500).json({ 
      message: 'Error updating profile',
      error: error.message 
    })
  }
})

// Add stock to watchlist
router.post('/watchlist', auth, async (req, res) => {
  try {
    const { symbol, name } = req.body
    const user = await User.findById(req.user._id)

    // Check if stock already in watchlist
    const existingStock = user.watchlist.find(stock => stock.symbol === symbol)
    if (existingStock) {
      return res.status(400).json({ message: 'Stock already in watchlist' })
    }

    user.watchlist.push({ symbol, name })
    await user.save()

    res.json({ message: 'Stock added to watchlist', watchlist: user.watchlist })
  } catch (error) {
    console.error('Add to watchlist error:', error)
    res.status(500).json({ 
      message: 'Error adding to watchlist',
      error: error.message 
    })
  }
})

// Remove stock from watchlist
router.delete('/watchlist/:symbol', auth, async (req, res) => {
  try {
    const { symbol } = req.params
    const user = await User.findById(req.user._id)

    user.watchlist = user.watchlist.filter(stock => stock.symbol !== symbol)
    await user.save()

    res.json({ message: 'Stock removed from watchlist', watchlist: user.watchlist })
  } catch (error) {
    console.error('Remove from watchlist error:', error)
    res.status(500).json({ 
      message: 'Error removing from watchlist',
      error: error.message 
    })
  }
})

// Get user watchlist
router.get('/watchlist', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
    res.json(user.watchlist)
  } catch (error) {
    console.error('Get watchlist error:', error)
    res.status(500).json({ 
      message: 'Error fetching watchlist',
      error: error.message 
    })
  }
})

// Get user predictions
router.get('/predictions', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
    res.json(user.predictions)
  } catch (error) {
    console.error('Get predictions error:', error)
    res.status(500).json({ 
      message: 'Error fetching predictions',
      error: error.message 
    })
  }
})

module.exports = router