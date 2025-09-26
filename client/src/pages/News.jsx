import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Newspaper, TrendingUp, TrendingDown, Clock, ExternalLink } from 'lucide-react'

const News = () => {
  const [news, setNews] = useState([])
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    // Mock news data
    const mockNews = [
      {
        id: 1,
        title: "Apple Reports Record Q4 Earnings, Beats Expectations",
        summary: "Apple Inc. reported quarterly earnings that exceeded analyst expectations, driven by strong iPhone sales and services revenue growth.",
        impact: "positive",
        stocks: ["AAPL"],
        timestamp: "2024-01-15T10:30:00Z",
        source: "MarketWatch",
        url: "#"
      },
      {
        id: 2,
        title: "Tesla Faces Production Challenges in China",
        summary: "Tesla's Shanghai factory encounters supply chain disruptions, potentially affecting Q1 delivery targets.",
        impact: "negative",
        stocks: ["TSLA"],
        timestamp: "2024-01-15T09:15:00Z",
        source: "Reuters",
        url: "#"
      },
      {
        id: 3,
        title: "Microsoft Azure Revenue Surges 30% Year-over-Year",
        summary: "Microsoft's cloud computing division continues its strong growth trajectory, boosting overall company performance.",
        impact: "positive",
        stocks: ["MSFT"],
        timestamp: "2024-01-15T08:45:00Z",
        source: "Bloomberg",
        url: "#"
      },
      {
        id: 4,
        title: "Federal Reserve Hints at Interest Rate Stability",
        summary: "Fed officials suggest maintaining current interest rates through Q2, providing market stability signals.",
        impact: "neutral",
        stocks: ["SPY", "QQQ"],
        timestamp: "2024-01-15T07:20:00Z",
        source: "CNBC",
        url: "#"
      },
      {
        id: 5,
        title: "Google Announces Major AI Integration Across Products",
        summary: "Alphabet reveals comprehensive AI strategy, integrating advanced language models into search and productivity tools.",
        impact: "positive",
        stocks: ["GOOGL"],
        timestamp: "2024-01-14T16:30:00Z",
        source: "TechCrunch",
        url: "#"
      },
      {
        id: 6,
        title: "Amazon Prime Membership Reaches New Milestone",
        summary: "Amazon reports significant growth in Prime subscriptions, strengthening its ecosystem and recurring revenue.",
        impact: "positive",
        stocks: ["AMZN"],
        timestamp: "2024-01-14T14:15:00Z",
        source: "Wall Street Journal",
        url: "#"
      }
    ]
    setNews(mockNews)
  }, [])

  const filteredNews = news.filter(item => {
    if (filter === 'all') return true
    return item.impact === filter
  })

  const getImpactIcon = (impact) => {
    switch (impact) {
      case 'positive':
        return <TrendingUp className="h-5 w-5 text-green-400" />
      case 'negative':
        return <TrendingDown className="h-5 w-5 text-red-400" />
      default:
        return <Newspaper className="h-5 w-5 text-gray-400" />
    }
  }

  const getImpactColor = (impact) => {
    switch (impact) {
      case 'positive':
        return 'border-green-500/30 bg-green-900/20'
      case 'negative':
        return 'border-red-500/30 bg-red-900/20'
      default:
        return 'border-gray-500/30 bg-gray-800/20'
    }
  }

  const formatTime = (timestamp) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours}h ago`
    return date.toLocaleDateString()
  }

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
              Market News & Analysis
            </h1>
            <p className="text-gray-400">
              Stay updated with the latest market news and their impact on your watchlist
            </p>
          </div>

          {/* Filter Tabs */}
          <div className="mb-8">
            <div className="flex space-x-1 bg-gray-800 p-1 rounded-lg w-fit">
              {[
                { key: 'all', label: 'All News' },
                { key: 'positive', label: 'Positive' },
                { key: 'negative', label: 'Negative' },
                { key: 'neutral', label: 'Neutral' }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    filter === tab.key
                      ? 'bg-primary-600 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-gray-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* News Grid */}
          <div className="space-y-6">
            {filteredNews.map((item, index) => (
              <motion.article
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`card border ${getImpactColor(item.impact)} hover:border-primary-500 transition-colors duration-300`}
              >
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 mt-1">
                    {getImpactIcon(item.impact)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-400">{item.source}</span>
                        <span className="text-gray-600">•</span>
                        <div className="flex items-center space-x-1 text-sm text-gray-400">
                          <Clock className="h-4 w-4" />
                          <span>{formatTime(item.timestamp)}</span>
                        </div>
                      </div>
                      <a
                        href={item.url}
                        className="text-primary-400 hover:text-primary-300 transition-colors"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </div>
                    
                    <h2 className="text-xl font-semibold text-white mb-3 hover:text-primary-400 transition-colors cursor-pointer">
                      {item.title}
                    </h2>
                    
                    <p className="text-gray-300 mb-4 leading-relaxed">
                      {item.summary}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-400">Affected stocks:</span>
                        <div className="flex space-x-2">
                          {item.stocks.map((stock) => (
                            <span
                              key={stock}
                              className="px-2 py-1 bg-primary-900/30 text-primary-300 text-xs font-medium rounded"
                            >
                              {stock}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                        item.impact === 'positive' ? 'bg-green-900/30 text-green-300' :
                        item.impact === 'negative' ? 'bg-red-900/30 text-red-300' :
                        'bg-gray-700 text-gray-300'
                      }`}>
                        {item.impact === 'positive' ? 'Bullish' :
                         item.impact === 'negative' ? 'Bearish' : 'Neutral'}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>

          {/* Load More Button */}
          <div className="text-center mt-12">
            <button className="btn-secondary">
              Load More News
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default News