import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Newspaper, TrendingUp, TrendingDown, Clock, ExternalLink } from 'lucide-react'
import axios from 'axios'
import toast from 'react-hot-toast'

const News = () => {
  const [news, setNews] = useState([])
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

  useEffect(() => {
    fetchWatchlistNews()
  }, [])

  const fetchWatchlistNews = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const response = await axios.get(`${API_URL}/api/stocks/news/watchlist`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      setNews(response.data)
    } catch (error) {
      console.error('Fetch news error:', error)
      toast.error('Failed to load news')
    } finally {
      setLoading(false)
    }
  }

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
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
            </div>
          ) : filteredNews.length === 0 ? (
            <div className="text-center py-12 card">
              <Newspaper className="h-16 w-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No news available</h3>
              <p className="text-gray-400">
                {news.length === 0
                  ? 'Add stocks to your watchlist to see relevant news'
                  : 'No news matching the selected filter'}
              </p>
            </div>
          ) : (
            <>
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
            </>
          )}
        </motion.div>
      </div>
    </div>
  )
}

export default News