const express = require('express')
const axios = require('axios')
const yahooFinance = require('yahoo-finance2').default
const Stock = require('../models/Stock')
const User = require('../models/User')
const { auth } = require('../middleware/auth')

const router = express.Router()

router.get('/:symbol', auth, async (req, res) => {
  try {
    const { symbol } = req.params

    const quote = await yahooFinance.quote(symbol.toUpperCase())

    if (!quote) {
      return res.status(404).json({ message: 'Stock not found' })
    }

    const stockData = {
      symbol: quote.symbol,
      name: quote.longName || quote.shortName || quote.symbol,
      currentPrice: quote.regularMarketPrice,
      change: quote.regularMarketChange,
      changePercent: quote.regularMarketChangePercent,
      volume: quote.regularMarketVolume,
      marketCap: quote.marketCap,
      sector: quote.sector || 'N/A',
      high: quote.regularMarketDayHigh,
      low: quote.regularMarketDayLow,
      open: quote.regularMarketOpen,
      previousClose: quote.regularMarketPreviousClose
    }

    res.json(stockData)
  } catch (error) {
    console.error('Get stock error:', error)
    res.status(500).json({
      message: 'Error fetching stock data',
      error: error.message
    })
  }
})

router.get('/search/:query', auth, async (req, res) => {
  try {
    const { query } = req.params

    const searchResults = await yahooFinance.search(query)

    const stocks = await Promise.all(
      searchResults.quotes
        .filter(result => result.quoteType === 'EQUITY')
        .slice(0, 10)
        .map(async (result) => {
          try {
            const quote = await yahooFinance.quote(result.symbol)
            return {
              symbol: result.symbol,
              name: result.longname || result.shortname || result.symbol,
              price: quote.regularMarketPrice,
              exchange: result.exchDisp
            }
          } catch (err) {
            console.error(`Error fetching quote for ${result.symbol}:`, err)
            return {
              symbol: result.symbol,
              name: result.longname || result.shortname || result.symbol,
              price: null,
              exchange: result.exchDisp
            }
          }
        })
    )

    res.json(stocks.filter(stock => stock.price !== null))
  } catch (error) {
    console.error('Search stocks error:', error)
    res.status(500).json({
      message: 'Error searching stocks',
      error: error.message
    })
  }
})

router.post('/predict', auth, async (req, res) => {
  try {
    const { symbol, days = 1 } = req.body

    try {
      const mlResponse = await axios.post(`${process.env.ML_SERVER_URL}/predict`, {
        symbol,
        days
      }, {
        timeout: 10000
      })

      const prediction = mlResponse.data

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
      console.log('ML server error:', mlError.message)
      return res.status(503).json({
        message: 'ML prediction service is currently unavailable. Please ensure the ML server is running.',
        error: mlError.message
      })
    }
  } catch (error) {
    console.error('Prediction error:', error)
    res.status(500).json({
      message: 'Error generating prediction',
      error: error.message
    })
  }
})

router.get('/:symbol/history', auth, async (req, res) => {
  try {
    const { symbol } = req.params
    const { period = '1mo' } = req.query

    const periodMap = {
      '7d': { period1: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      '1mo': { period1: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      '3mo': { period1: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) },
      '1y': { period1: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) }
    }

    const queryOptions = {
      period1: periodMap[period]?.period1 || periodMap['1mo'].period1,
      interval: '1d'
    }

    const history = await yahooFinance.historical(symbol.toUpperCase(), queryOptions)

    const historicalData = history.map(item => ({
      date: item.date.toISOString().split('T')[0],
      value: item.close,
      open: item.open,
      high: item.high,
      low: item.low,
      volume: item.volume
    }))

    res.json(historicalData)
  } catch (error) {
    console.error('Historical data error:', error)
    res.status(500).json({
      message: 'Error fetching historical data',
      error: error.message
    })
  }
})

router.get('/news/watchlist', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
    const watchlistSymbols = user.watchlist.map(stock => stock.symbol.toUpperCase())

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
      },
      {
        id: 4,
        title: "Google Announces Major AI Integration Across Products",
        summary: "Alphabet reveals comprehensive AI strategy, integrating advanced language models into search and productivity tools.",
        impact: "positive",
        stocks: ["GOOGL"],
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        source: "TechCrunch",
        url: "#"
      },
      {
        id: 5,
        title: "Federal Reserve Hints at Interest Rate Stability",
        summary: "Fed officials suggest maintaining current interest rates through Q2, providing market stability signals.",
        impact: "neutral",
        stocks: ["SPY", "QQQ"],
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        source: "CNBC",
        url: "#"
      },
      {
        id: 6,
        title: "Amazon Prime Membership Reaches New Milestone",
        summary: "Amazon reports significant growth in Prime subscriptions, strengthening its ecosystem and recurring revenue.",
        impact: "positive",
        stocks: ["AMZN"],
        timestamp: new Date(Date.now() - 7 * 60 * 60 * 1000).toISOString(),
        source: "Wall Street Journal",
        url: "#"
      },
      {
        id: 7,
        title: "Market Analysis: Tech Stocks Show Strong Performance",
        summary: "Technology sector continues to outperform broader market indices as investors bet on AI and cloud computing growth.",
        impact: "positive",
        stocks: ["AAPL", "GOOGL", "MSFT", "META"],
        timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
        source: "MarketWatch",
        url: "#"
      }
    ]

    const watchlistNews = mockNews.filter(news =>
      news.stocks.some(stock => watchlistSymbols.includes(stock))
    )

    res.json(watchlistNews)
  } catch (error) {
    console.error('Watchlist news error:', error)
    res.status(500).json({
      message: 'Error fetching watchlist news',
      error: error.message
    })
  }
})

router.get('/news/:symbol?', auth, async (req, res) => {
  try {
    const { symbol } = req.params

    const mockNews = [
      {
        id: 1,
        title: "Market Analysis: Tech Stocks Show Strong Performance",
        summary: "Technology sector continues to outperform broader market indices as investors bet on AI and cloud computing growth.",
        impact: "positive",
        stocks: ["AAPL", "GOOGL", "MSFT", "META"],
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        source: "MarketWatch",
        url: "#"
      },
      {
        id: 2,
        title: "Federal Reserve Signals Potential Rate Changes",
        summary: "Economic indicators suggest possible monetary policy adjustments in upcoming quarters, impacting market sentiment.",
        impact: "neutral",
        stocks: ["SPY", "QQQ"],
        timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
        source: "Reuters",
        url: "#"
      },
      {
        id: 3,
        title: "Energy Sector Faces Headwinds Amid Global Concerns",
        summary: "Oil and gas companies navigate challenging market conditions with volatility in commodity prices.",
        impact: "negative",
        stocks: ["XOM", "CVX"],
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
