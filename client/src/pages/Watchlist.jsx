import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Star,
  TrendingUp,
  TrendingDown,
  Trash2,
  Plus,
  BarChart3,
  AlertCircle
} from 'lucide-react'
import axios from 'axios'
import StockChart from '../components/Charts/StockChart'
import toast from 'react-hot-toast'

const Watchlist = () => {
  const [watchlist, setWatchlist] = useState([])
  const [selectedStock, setSelectedStock] = useState(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [loading, setLoading] = useState(true)

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

  useEffect(() => {
    fetchWatchlist()
  }, [])

  const fetchWatchlist = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const response = await axios.get(`${API_URL}/api/users/watchlist`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setWatchlist(response.data)
      if (response.data.length > 0) {
        setSelectedStock(response.data[0])
      }
    } catch (error) {
      console.error('Fetch watchlist error:', error)
      toast.error('Failed to load watchlist')
    } finally {
      setLoading(false)
    }
  }

  const removeFromWatchlist = async (symbol) => {
    try {
      const token = localStorage.getItem('token')
      await axios.delete(`${API_URL}/api/users/watchlist/${symbol}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setWatchlist(prev => prev.filter(stock => stock.symbol !== symbol))
      if (selectedStock?.symbol === symbol) {
        const remaining = watchlist.filter(stock => stock.symbol !== symbol)
        setSelectedStock(remaining[0] || null)
      }
      toast.success('Stock removed from watchlist')
    } catch (error) {
      console.error('Remove from watchlist error:', error)
      toast.error('Failed to remove stock')
    }
  }

  const getPredictionColor = (prediction) => {
    switch (prediction) {
      case 'Buy':
        return 'text-green-400 bg-green-900/30'
      case 'Sell':
        return 'text-red-400 bg-red-900/30'
      default:
        return 'text-yellow-400 bg-yellow-900/30'
    }
  }

  const getSentimentColor = (sentiment) => {
    switch (sentiment) {
      case 'Positive':
        return 'text-green-400'
      case 'Negative':
        return 'text-red-400'
      default:
        return 'text-gray-400'
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Your Watchlist
              </h1>
              <p className="text-gray-400">
                Monitor your favorite stocks and AI predictions
              </p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="btn-primary flex items-center space-x-2"
            >
              <Plus className="h-5 w-5" />
              <span>Add Stock</span>
            </button>
          </div>

          {/* Main Grid: Watchlist and Details */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Watchlist Table */}
            <div className="lg:col-span-2">
              <div className="card">
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
                  </div>
                ) : watchlist.length === 0 ? (
                  <div className="text-center py-12">
                    <Star className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">No stocks in watchlist</h3>
                    <p className="text-gray-400 mb-6">Add stocks to your watchlist to track them here</p>
                    <button
                      onClick={() => setShowAddModal(true)}
                      className="btn-primary inline-flex items-center space-x-2"
                    >
                      <Plus className="h-5 w-5" />
                      <span>Add Your First Stock</span>
                    </button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-700">
                          <th className="text-left py-4 text-gray-400 font-medium">Stock</th>
                          <th className="text-right py-4 text-gray-400 font-medium">Price</th>
                          <th className="text-right py-4 text-gray-400 font-medium">Change</th>
                          <th className="text-center py-4 text-gray-400 font-medium">Prediction</th>
                          <th className="text-center py-4 text-gray-400 font-medium">Confidence</th>
                          <th className="text-center py-4 text-gray-400 font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {watchlist.map((stock, index) => (
                          <motion.tr
                            key={stock.symbol}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className={`border-b border-gray-700 hover:bg-gray-800 transition-colors cursor-pointer ${
                              selectedStock?.symbol === stock.symbol ? 'bg-primary-900/20' : ''
                            }`}
                            onClick={() => setSelectedStock(stock)}
                          >
                            <td className="py-4">
                              <div className="flex items-center space-x-3">
                                <Star className="h-5 w-5 text-yellow-400 fill-current" />
                                <div>
                                  <div className="font-semibold text-white">{stock.symbol}</div>
                                  <div className="text-sm text-gray-400">{stock.name}</div>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 text-right text-white font-medium">
                              ${stock.price.toFixed(2)}
                            </td>
                            <td className="py-4 text-right">
                              <div className={`${stock.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                <div className="flex items-center justify-end space-x-1">
                                  {stock.change >= 0 ? (
                                    <TrendingUp className="h-4 w-4" />
                                  ) : (
                                    <TrendingDown className="h-4 w-4" />
                                  )}
                                  <span>{stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)}</span>
                                </div>
                                <div className="text-sm">
                                  ({stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%)
                                </div>
                              </div>
                            </td>
                            <td className="py-4 text-center">
                              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPredictionColor(stock.prediction)}`}>
                                {stock.prediction}
                              </span>
                            </td>
                            <td className="py-4 text-center">
                              <div className="text-white font-medium">{stock.confidence}%</div>
                              <div className="w-16 bg-gray-600 rounded-full h-2 mx-auto mt-1">
                                <div
                                  className="bg-primary-500 h-2 rounded-full"
                                  style={{ width: `${stock.confidence}%` }}
                                ></div>
                              </div>
                            </td>
                            <td className="py-4 text-center">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  removeFromWatchlist(stock.symbol)
                                }}
                                className="text-red-400 hover:text-red-300 transition-colors"
                              >
                                <Trash2 className="h-5 w-5" />
                              </button>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            {/* Stock Details (without mini chart) */}
            <div className="lg:col-span-1">
              {!loading && selectedStock && (
                <motion.div
                  key={selectedStock.symbol}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5 }}
                  className="space-y-6"
                >
                  <div className="card">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-white">{selectedStock.symbol}</h3>
                        <p className="text-gray-400">{selectedStock.name}</p>
                      </div>
                      <Star className="h-6 w-6 text-yellow-400 fill-current" />
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Current Price</span>
                        <span className="text-white font-semibold">${selectedStock.price.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Target Price</span>
                        <span className="text-primary-400 font-semibold">
                          {selectedStock.targetPrice > 0 ? `$${selectedStock.targetPrice.toFixed(2)}` : 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Sentiment</span>
                        <span className={`font-semibold ${getSentimentColor(selectedStock.sentiment)}`}>
                          {selectedStock.sentiment}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Prediction Details */}
                  {selectedStock.prediction !== 'N/A' && (
                    <div className="card">
                      <h4 className="text-lg font-semibold text-white mb-4">AI Prediction</h4>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400">Recommendation</span>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPredictionColor(selectedStock.prediction)}`}>
                            {selectedStock.prediction}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400">Confidence</span>
                          <span className="text-white font-semibold">{selectedStock.confidence}%</span>
                        </div>
                        <div className="w-full bg-gray-600 rounded-full h-3">
                          <div
                            className="bg-primary-500 h-3 rounded-full transition-all duration-300"
                            style={{ width: `${selectedStock.confidence}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Quick Actions */}
                  <div className="card">
                    <h4 className="text-lg font-semibold text-white mb-4">Quick Actions</h4>
                    <div className="space-y-3">
                      <button className="w-full btn-primary flex items-center justify-center space-x-2">
                        <BarChart3 className="h-4 w-4" />
                        <span>View Detailed Analysis</span>
                      </button>
                      <button className="w-full btn-secondary flex items-center justify-center space-x-2">
                        <AlertCircle className="h-4 w-4" />
                        <span>Set Price Alert</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </div>

          {/* Trend Section Moves Below Watchlist Table */}
          {selectedStock && selectedStock.data && selectedStock.data.length > 0 && (
            <div className="card mt-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h4 className="text-lg font-semibold text-white mb-4">7-Day Trend for {selectedStock.symbol}</h4>
              <div className="w-full min-h-32 aspect-[2/1]">
                <StockChart
                  data={selectedStock.data}
                  title=""
                  color={selectedStock.change >= 0 ? "#10b981" : "#ef4444"}
                  style={{ width: '100%', height: '100%' }}
                />
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}

export default Watchlist
