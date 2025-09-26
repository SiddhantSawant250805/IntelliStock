const express = require('express')
const axios = require('axios')
const Stock = require('../models/Stock')
const User = require('../models/User')
const { auth } = require('../middleware/auth')

const router = express.Router()

// Get stock data
router.get('/:symbol', auth, async (req, res) => {
  try {
    const { symbol } = req.params
    let stock = await Stock.findOne({ symbol: symbol.toUpperCase() })

    if (!stock) {
      // Create mock stock data if not found
      stock = new Stock({
        symbol: symbol.toUpperCase(),
        name: `${symbol.toUpperCase()} Inc.`,
        currentPrice: Math.random() * 1000 + 50,
        change: (Math.random() - 0.5) * 20,
        changePercent: (Math.random() - 0.5) * 5,
        volume: Math.floor(Math.random() * 10000000),
        marketCap: Math.floor(Math.random() * 1000000000000),
        sector: 'Technology'
      })
      await stock.save()
    }

    res.json(stock)
  } catch (error) {
    console.error('Get stock error:', error)
    res.status(500).json({ 
      message: 'Error fetching stock data',
      error: error.message 
    })
  }
})

// Search stocks
router.get('/search/:query', auth, async (req, res) => {
  try {
    const { query } = req.params
    
    // Mock stock search results
    const mockStocks = [
      { symbol: 'AAPL', name: 'Apple Inc.', price: 175.43 },
      { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 2847.63 },
      { symbol: 'MSFT', name: 'Microsoft Corp.', price: 378.85 },
      { symbol: 'TSLA', name: 'Tesla Inc.', price: 248.42 },
      { symbol: 'AMZN', name: 'Amazon.com Inc.', price: 3342.88 },
      { symbol: 'META', name: 'Meta Platforms Inc.', price: 331.26 },
      { symbol: 'NVDA', name: 'NVIDIA Corporation', price: 875.28 },
      { symbol: 'NFLX', name: 'Netflix Inc.', price: 445.87 }
    ]

    const filteredStocks = mockStocks.filter(stock =>
      stock.symbol.toLowerCase().includes(query.toLowerCase()) ||
      stock.name.toLowerCase().includes(query.toLowerCase())
    )

    res.json(filteredStocks)
  } catch (error) {
    console.error('Search stocks error:', error)
    res.status(500).json({ 
      message: 'Error searching stocks',
      error: error.message 
    })
  }
})

// Get stock prediction
router.post('/predict', auth, async (req, res) => {
  try {
    const { symbol, days = 1 } = req.body

    // Call ML server for prediction
    try {
      const mlResponse = await axios.post(`${process.env.ML_SERVER_URL}/predict`, {
        symbol,
        days
      }, {
        timeout: 10000
      })

      const prediction = mlResponse.data

      // Save prediction to user's history
      const user = await User.findById(req.user._id)
      user.predictions.push({
        symbol,
        prediction: prediction.recommendation,
        confidence: prediction.confidence,
        targetPrice: prediction.predictedPrice
      })
      await user.save()

      res.json(prediction)
    } catch (mlError) {
      console.log('ML server unavailable, using mock data')
      
      // Mock prediction data
      const currentPrice = Math.random() * 1000 + 50
      const mockPrediction = {
        symbol,
        currentPrice,
        predictedPrice: currentPrice * (1 + (Math.random() - 0.5) * 0.1),
        confidence: Math.floor(Math.random() * 30) + 70,
        recommendation: Math.random() > 0.5 ? 'Buy' : Math.random() > 0.3 ? 'Hold' : 'Sell',
        sentiment: Math.random() > 0.5 ? 'Positive' : 'Neutral',
        factors: [
          'Strong quarterly earnings',
          'Positive market sentiment',
          'Technical indicators bullish',
          'Sector performance above average'
        ],
        days
      }

      // Save mock prediction to user's history
      const user = await User.findById(req.user._id)
      user.predictions.push({
        symbol,
        prediction: mockPrediction.recommendation,
        confidence: mockPrediction.confidence,
        targetPrice: mockPrediction.predictedPrice
      })
      await user.save()

      res.json(mockPrediction)
    }
  } catch (error) {
    console.error('Prediction error:', error)
    res.status(500).json({ 
      message: 'Error generating prediction',
      error: error.message 
    })
  }
})

// Get historical data
router.get('/:symbol/history', auth, async (req, res) => {
  try {
    const { symbol } = req.params
    const { period = '7d' } = req.query

    // Mock historical data
    const days = period === '1m' ? 30 : period === '1y' ? 365 : 7
    const basePrice = Math.random() * 1000 + 50
    const historicalData = []

    for (let i = days; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      
      const price = basePrice + (Math.random() - 0.5) * basePrice * 0.1
      historicalData.push({
        date: date.toISOString().split('T')[0],
        value: Math.round(price * 100) / 100
      })
    }

    res.json(historicalData)
  } catch (error) {
    console.error('Historical data error:', error)
    res.status(500).json({ 
      message: 'Error fetching historical data',
      error: error.message 
    })
  }
})

// Get market news
router.get('/news/:symbol?', auth, async (req, res) => {
  try {
    const { symbol } = req.params

    // Mock news data
    const mockNews = [
      {
        id: 1,
        title: "Apple Reports Record Q4 Earnings, Beats Expectations",
        summary: "Apple Inc. reported quarterly earnings that exceeded analyst expectations, driven by strong iPhone sales and services revenue growth.",
        impact: "positive",
        stocks: ["AAPL"],
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        source: "MarketWatch",
        url: "#"
      },
      {
        id: 2,
        title: "Tesla Faces Production Challenges in China",
        summary: "Tesla's Shanghai factory encounters supply chain disruptions, potentially affecting Q1 delivery targets.",
        impact: "negative",
        stocks: ["TSLA"],
        timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
        source: "Reuters",
        url: "#"
      },
      {
        id: 3,
        title: "Microsoft Azure Revenue Surges 30% Year-over-Year",
        summary: "Microsoft's cloud computing division continues its strong growth trajectory, boosting overall company performance.",
        impact: "positive",
        stocks: ["MSFT"],
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        source: "Bloomberg",
        url: "#"
      }
    ]

    let filteredNews = mockNews
    if (symbol) {
      filteredNews = mockNews.filter(news => 
        news.stocks.includes(symbol.toUpperCase())
      )
    }

    res.json(filteredNews)
  } catch (error) {
    console.error('News error:', error)
    res.status(500).json({ 
      message: 'Error fetching news',
      error: error.message 
    })
  }
})

module.exports = router