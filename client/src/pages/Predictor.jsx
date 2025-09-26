import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, TrendingUp, Brain, Star, Calendar } from 'lucide-react'
import StockChart from '../components/Charts/StockChart'
import toast from 'react-hot-toast'

const Predictor = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStock, setSelectedStock] = useState(null)
  const [predictionDays, setPredictionDays] = useState(1)
  const [prediction, setPrediction] = useState(null)
  const [loading, setLoading] = useState(false)

  const mockStocks = [
    { symbol: 'AAPL', name: 'Apple Inc.', price: 175.43 },
    { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 2847.63 },
    { symbol: 'MSFT', name: 'Microsoft Corp.', price: 378.85 },
    { symbol: 'TSLA', name: 'Tesla Inc.', price: 248.42 },
    { symbol: 'AMZN', name: 'Amazon.com Inc.', price: 3342.88 },
    { symbol: 'META', name: 'Meta Platforms Inc.', price: 331.26 }
  ]

  const mockHistoricalData = [
    { date: '2024-01-01', value: 170 },
    { date: '2024-01-02', value: 172 },
    { date: '2024-01-03', value: 168 },
    { date: '2024-01-04', value: 174 },
    { date: '2024-01-05', value: 176 },
    { date: '2024-01-06', value: 175 },
    { date: '2024-01-07', value: 175.43 }
  ]

  const filteredStocks = mockStocks.filter(stock =>
    stock.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
    stock.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleStockSelect = (stock) => {
    setSelectedStock(stock)
    setSearchTerm('')
    setPrediction(null)
  }

  const handlePredict = async () => {
    if (!selectedStock) {
      toast.error('Please select a stock first')
      return
    }

    setLoading(true)
    
    // Simulate API call to ML server
    setTimeout(() => {
      const mockPrediction = {
        currentPrice: selectedStock.price,
        predictedPrice: selectedStock.price * (1 + (Math.random() - 0.5) * 0.1),
        confidence: Math.floor(Math.random() * 30) + 70,
        recommendation: Math.random() > 0.5 ? 'Buy' : Math.random() > 0.3 ? 'Hold' : 'Sell',
        sentiment: Math.random() > 0.5 ? 'Positive' : 'Neutral',
        factors: [
          'Strong quarterly earnings',
          'Positive market sentiment',
          'Technical indicators bullish',
          'Sector performance above average'
        ]
      }
      setPrediction(mockPrediction)
      setLoading(false)
      toast.success('Prediction generated successfully!')
    }, 2000)
  }

  const addToWatchlist = () => {
    if (selectedStock) {
      toast.success(`${selectedStock.symbol} added to watchlist!`)
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
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              AI Stock Predictor
            </h1>
            <p className="text-gray-400">
              Get AI-powered predictions for your favorite stocks
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Search and Selection */}
            <div className="lg:col-span-1">
              <div className="card mb-6">
                <h3 className="text-lg font-semibold mb-4 text-white">Search Stocks</h3>
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by symbol or name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                {searchTerm && (
                  <div className="space-y-2 mb-4">
                    {filteredStocks.map((stock) => (
                      <button
                        key={stock.symbol}
                        onClick={() => handleStockSelect(stock)}
                        className="w-full text-left p-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                      >
                        <div className="font-semibold text-white">{stock.symbol}</div>
                        <div className="text-sm text-gray-400">{stock.name}</div>
                        <div className="text-sm text-primary-400">${stock.price}</div>
                      </button>
                    ))}
                  </div>
                )}

                {selectedStock && (
                  <div className="p-4 bg-primary-900/20 border border-primary-500/30 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-semibold text-white">{selectedStock.symbol}</div>
                      <button
                        onClick={addToWatchlist}
                        className="text-primary-400 hover:text-primary-300"
                      >
                        <Star className="h-5 w-5" />
                      </button>
                    </div>
                    <div className="text-sm text-gray-400 mb-1">{selectedStock.name}</div>
                    <div className="text-lg font-bold text-primary-400">${selectedStock.price}</div>
                  </div>
                )}
              </div>

              {/* Prediction Settings */}
              <div className="card">
                <h3 className="text-lg font-semibold mb-4 text-white">Prediction Settings</h3>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Prediction Period
                  </label>
                  <select
                    value={predictionDays}
                    onChange={(e) => setPredictionDays(Number(e.target.value))}
                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value={1}>1 Day</option>
                    <option value={3}>3 Days</option>
                    <option value={5}>5 Days</option>
                    <option value={7}>1 Week</option>
                    <option value={30}>1 Month</option>
                  </select>
                </div>

                <button
                  onClick={handlePredict}
                  disabled={!selectedStock || loading}
                  className="w-full btn-primary flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Analyzing...</span>
                    </>
                  ) : (
                    <>
                      <Brain className="h-5 w-5" />
                      <span>Generate Prediction</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Charts and Results */}
            <div className="lg:col-span-2">
              {selectedStock && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5 }}
                  className="mb-6"
                >
                  <StockChart 
                    data={mockHistoricalData} 
                    title={`${selectedStock.symbol} - Historical Price`}
                    color="#3b82f6"
                  />
                </motion.div>
              )}

              {prediction && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="card"
                >
                  <h3 className="text-lg font-semibold mb-4 text-white flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2 text-primary-400" />
                    AI Prediction Results
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="space-y-4">
                      <div className="p-4 bg-gray-700 rounded-lg">
                        <div className="text-sm text-gray-400 mb-1">Current Price</div>
                        <div className="text-2xl font-bold text-white">${prediction.currentPrice.toFixed(2)}</div>
                      </div>
                      <div className="p-4 bg-gray-700 rounded-lg">
                        <div className="text-sm text-gray-400 mb-1">Predicted Price ({predictionDays} day{predictionDays > 1 ? 's' : ''})</div>
                        <div className="text-2xl font-bold text-primary-400">${prediction.predictedPrice.toFixed(2)}</div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="p-4 bg-gray-700 rounded-lg">
                        <div className="text-sm text-gray-400 mb-1">Confidence Level</div>
                        <div className="text-2xl font-bold text-white">{prediction.confidence}%</div>
                        <div className="w-full bg-gray-600 rounded-full h-2 mt-2">
                          <div 
                            className="bg-primary-500 h-2 rounded-full" 
                            style={{ width: `${prediction.confidence}%` }}
                          ></div>
                        </div>
                      </div>
                      <div className="p-4 bg-gray-700 rounded-lg">
                        <div className="text-sm text-gray-400 mb-1">Recommendation</div>
                        <div className={`text-2xl font-bold ${
                          prediction.recommendation === 'Buy' ? 'text-green-400' :
                          prediction.recommendation === 'Sell' ? 'text-red-400' :
                          'text-yellow-400'
                        }`}>
                          {prediction.recommendation}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-gray-700 pt-6">
                    <h4 className="text-md font-semibold text-white mb-3">Key Factors</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {prediction.factors.map((factor, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-primary-400 rounded-full"></div>
                          <span className="text-gray-300 text-sm">{factor}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-6 p-4 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
                    <div className="text-yellow-400 text-sm font-medium mb-1">Disclaimer</div>
                    <div className="text-yellow-300 text-sm">
                      This prediction is generated by AI and should not be considered as financial advice. 
                      Always do your own research before making investment decisions.
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

export default Predictor