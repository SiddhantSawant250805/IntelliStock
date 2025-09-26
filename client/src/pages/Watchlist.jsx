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
import StockChart from '../components/Charts/StockChart'
import toast from 'react-hot-toast'

const Watchlist = () => {
  const [watchlist, setWatchlist] = useState([])
  const [selectedStock, setSelectedStock] = useState(null)
  const [showAddModal, setShowAddModal] = useState(false)

  useEffect(() => {
    // Mock watchlist data
    const mockWatchlist = [
      {
        id: 1,
        symbol: 'AAPL',
        name: 'Apple Inc.',
        price: 175.43,
        change: 2.34,
        changePercent: 1.35,
        prediction: 'Buy',
        confidence: 85,
        targetPrice: 180,
        sentiment: 'Positive',
        data: [
          { date: '2024-01-01', value: 170 },
          { date: '2024-01-02', value: 172 },
          { date: '2024-01-03', value: 168 },
          { date: '2024-01-04', value: 174 },
          { date: '2024-01-05', value: 176 },
          { date: '2024-01-06', value: 175 },
          { date: '2024-01-07', value: 175.43 }
        ]
      },
      {
        id: 2,
        symbol: 'GOOGL',
        name: 'Alphabet Inc.',
        price: 2847.63,
        change: -15.23,
        changePercent: -0.53,
        prediction: 'Hold',
        confidence: 72,
        targetPrice: 2900,
        sentiment: 'Neutral',
        data: [
          { date: '2024-01-01', value: 2800 },
          { date: '2024-01-02', value: 2820 },
          { date: '2024-01-03', value: 2790 },
          { date: '2024-01-04', value: 2860 },
          { date: '2024-01-05', value: 2880 },
          { date: '2024-01-06', value: 2863 },
          { date: '2024-01-07', value: 2847.63 }
        ]
      },
      {
        id: 3,
        symbol: 'MSFT',
        name: 'Microsoft Corp.',
        price: 378.85,
        change: 5.67,
        changePercent: 1.52,
        prediction: 'Buy',
        confidence: 91,
        targetPrice: 390,
        sentiment: 'Positive',
        data: [
          { date: '2024-01-01', value: 370 },
          { date: '2024-01-02', value: 372 },
          { date: '2024-01-03', value: 368 },
          { date: '2024-01-04', value: 375 },
          { date: '2024-01-05', value: 380 },
          { date: '2024-01-06', value: 373 },
          { date: '2024-01-07', value: 378.85 }
        ]
      },
      {
        id: 4,
        symbol: 'TSLA',
        name: 'Tesla Inc.',
        price: 248.42,
        change: -8.91,
        changePercent: -3.46,
        prediction: 'Sell',
        confidence: 68,
        targetPrice: 230,
        sentiment: 'Negative',
        data: [
          { date: '2024-01-01', value: 260 },
          { date: '2024-01-02', value: 255 },
          { date: '2024-01-03', value: 258 },
          { date: '2024-01-04', value: 252 },
          { date: '2024-01-05', value: 250 },
          { date: '2024-01-06', value: 257 },
          { date: '2024-01-07', value: 248.42 }
        ]
      }
    ]
    setWatchlist(mockWatchlist)
    setSelectedStock(mockWatchlist[0])
  }, [])

  const removeFromWatchlist = (id) => {
    setWatchlist(prev => prev.filter(stock => stock.id !== id))
    if (selectedStock?.id === id) {
      setSelectedStock(watchlist[0] || null)
    }
    toast.success('Stock removed from watchlist')
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

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Watchlist Table */}
            <div className="lg:col-span-2">
              <div className="card">
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
                          key={stock.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5, delay: index * 0.1 }}
                          className={`border-b border-gray-700 hover:bg-gray-800 transition-colors cursor-pointer ${
                            selectedStock?.id === stock.id ? 'bg-primary-900/20' : ''
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
                                removeFromWatchlist(stock.id)
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
              </div>
            </div>

            {/* Stock Details */}
            <div className="lg:col-span-1">
              {selectedStock && (
                <motion.div
                  key={selectedStock.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5 }}
                  className="space-y-6"
                >
                  {/* Stock Info */}
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
                        <span className="text-primary-400 font-semibold">${selectedStock.targetPrice}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Sentiment</span>
                        <span className={`font-semibold ${getSentimentColor(selectedStock.sentiment)}`}>
                          {selectedStock.sentiment}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Mini Chart */}
                  <div className="card">
                    <h4 className="text-lg font-semibold text-white mb-4">7-Day Trend</h4>
                    <div className="h-32">
                      <StockChart 
                        data={selectedStock.data} 
                        title=""
                        color={selectedStock.change >= 0 ? "#10b981" : "#ef4444"}
                      />
                    </div>
                  </div>

                  {/* Prediction Details */}
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
        </motion.div>
      </div>
    </div>
  )
}

export default Watchlist