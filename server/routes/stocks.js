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
        summary: "Apple Inc. reported quarterly earnings that exceeded analyst expectations, driven by strong iPhone sales and services revenue growth. The company posted revenue of $94.9 billion, up 6% year-over-year.",
        impact: "positive",
        stocks: ["AAPL"],
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        source: "MarketWatch",
        url: "https://www.marketwatch.com"
      },
      {
        id: 2,
        title: "Apple's Services Division Hits All-Time High",
        summary: "Apple's services segment, including Apple Music, iCloud, and App Store, reached a new quarterly record with strong growth across all geographic segments.",
        impact: "positive",
        stocks: ["AAPL"],
        timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
        source: "Bloomberg",
        url: "https://www.bloomberg.com"
      },
      {
        id: 3,
        title: "Tesla Faces Production Challenges in China",
        summary: "Tesla's Shanghai factory encounters supply chain disruptions, potentially affecting Q1 delivery targets. The company is working with local suppliers to resolve bottlenecks in component availability.",
        impact: "negative",
        stocks: ["TSLA"],
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        source: "Reuters",
        url: "https://www.reuters.com"
      },
      {
        id: 4,
        title: "Tesla Expands Supercharger Network Across Europe",
        summary: "Despite production challenges, Tesla continues aggressive expansion of its charging infrastructure, opening 500 new Supercharger stations across European markets this quarter.",
        impact: "positive",
        stocks: ["TSLA"],
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        source: "Financial Times",
        url: "https://www.ft.com"
      },
      {
        id: 5,
        title: "Microsoft Azure Revenue Surges 30% Year-over-Year",
        summary: "Microsoft's cloud computing division continues its strong growth trajectory, boosting overall company performance. Azure gains market share as enterprises accelerate cloud migration.",
        impact: "positive",
        stocks: ["MSFT"],
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        source: "Bloomberg",
        url: "https://www.bloomberg.com"
      },
      {
        id: 6,
        title: "Microsoft Announces Enterprise AI Solutions",
        summary: "Microsoft unveils new enterprise AI tools integrated with Azure, targeting the growing demand for business intelligence and automation solutions across Fortune 500 companies.",
        impact: "positive",
        stocks: ["MSFT"],
        timestamp: new Date(Date.now() - 7 * 60 * 60 * 1000).toISOString(),
        source: "TechCrunch",
        url: "https://www.techcrunch.com"
      },
      {
        id: 7,
        title: "Google Announces Major AI Integration Across Products",
        summary: "Alphabet reveals comprehensive AI strategy, integrating advanced language models into search and productivity tools. Google's AI investments expected to drive long-term growth.",
        impact: "positive",
        stocks: ["GOOGL"],
        timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
        source: "The Verge",
        url: "https://www.theverge.com"
      },
      {
        id: 8,
        title: "Alphabet Faces Regulatory Scrutiny in EU Markets",
        summary: "European regulators launch investigation into Google's advertising practices, potentially impacting the company's revenue streams in the region.",
        impact: "negative",
        stocks: ["GOOGL"],
        timestamp: new Date(Date.now() - 9 * 60 * 60 * 1000).toISOString(),
        source: "Wall Street Journal",
        url: "https://www.wsj.com"
      },
      {
        id: 9,
        title: "Federal Reserve Hints at Interest Rate Stability",
        summary: "Fed officials suggest maintaining current interest rates through Q2, providing market stability signals. Economic indicators show moderate growth without triggering inflation concerns.",
        impact: "neutral",
        stocks: ["SPY", "QQQ"],
        timestamp: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(),
        source: "CNBC",
        url: "https://www.cnbc.com"
      },
      {
        id: 10,
        title: "Amazon Prime Membership Reaches New Milestone",
        summary: "Amazon reports significant growth in Prime subscriptions, strengthening its ecosystem and recurring revenue. Prime members show 3x higher spending compared to non-members.",
        impact: "positive",
        stocks: ["AMZN"],
        timestamp: new Date(Date.now() - 11 * 60 * 60 * 1000).toISOString(),
        source: "Wall Street Journal",
        url: "https://www.wsj.com"
      },
      {
        id: 11,
        title: "Amazon Web Services Gains Cloud Market Share",
        summary: "AWS continues to dominate cloud infrastructure market, posting 13% revenue growth and expanding its lead over competitors with new AI and machine learning services.",
        impact: "positive",
        stocks: ["AMZN"],
        timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        source: "Forbes",
        url: "https://www.forbes.com"
      },
      {
        id: 12,
        title: "Market Analysis: Tech Stocks Show Strong Performance",
        summary: "Technology sector continues to outperform broader market indices as investors bet on AI and cloud computing growth. Tech sector up 15% year-to-date compared to S&P 500's 8% gain.",
        impact: "positive",
        stocks: ["AAPL", "GOOGL", "MSFT", "META"],
        timestamp: new Date(Date.now() - 13 * 60 * 60 * 1000).toISOString(),
        source: "MarketWatch",
        url: "https://www.marketwatch.com"
      },
      {
        id: 13,
        title: "Nvidia's AI Chip Demand Exceeds Supply Expectations",
        summary: "Nvidia reports unprecedented demand for its AI chips, with orders backlogged through next quarter. Stock surges on strong guidance and expanding market opportunity.",
        impact: "positive",
        stocks: ["NVDA"],
        timestamp: new Date(Date.now() - 14 * 60 * 60 * 1000).toISOString(),
        source: "Reuters",
        url: "https://www.reuters.com"
      },
      {
        id: 14,
        title: "Meta Platforms Invests Heavily in Metaverse Development",
        summary: "Meta announces $10 billion investment in Reality Labs despite short-term losses. Company remains committed to long-term vision of immersive computing experiences.",
        impact: "neutral",
        stocks: ["META"],
        timestamp: new Date(Date.now() - 15 * 60 * 60 * 1000).toISOString(),
        source: "Bloomberg",
        url: "https://www.bloomberg.com"
      },
      {
        id: 15,
        title: "Banking Sector Sees Increased M&A Activity",
        summary: "Regional banks explore consolidation opportunities amid changing regulatory landscape. Analysts predict wave of mergers in coming quarters as institutions seek scale.",
        impact: "neutral",
        stocks: ["JPM", "BAC", "WFC"],
        timestamp: new Date(Date.now() - 16 * 60 * 60 * 1000).toISOString(),
        source: "Financial Times",
        url: "https://www.ft.com"
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
