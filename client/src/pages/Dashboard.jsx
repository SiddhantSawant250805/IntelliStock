import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  BarChart3, 
  Star,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'
import StockChart from '../components/Charts/StockChart'
import { useAuth } from '../contexts/AuthContext'

const Dashboard = () => {
  const { user } = useAuth()
  const [portfolioData, setPortfolioData] = useState([])
  const [watchlistData, setWatchlistData] = useState([])

  useEffect(() => {
    // Mock portfolio data
    const mockPortfolioData = [
      { date: '2024-01-01', value: 10000 },
      { date: '2024-01-02', value: 10200 },
      { date: '2024-01-03', value: 9800 },
      { date: '2024-01-04', value: 10500 },
      { date: '2024-01-05', value: 10800 },
      { date: '2024-01-06', value: 11200 },
      { date: '2024-01-07', value: 11000 }
    ]

    const mockWatchlist = [
      { symbol: 'AAPL', name: 'Apple Inc.', price: 175.43, change: 2.34, changePercent: 1.35 },
      { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 2847.63, change: -15.23, changePercent: -0.53 },
      { symbol: 'MSFT', name: 'Microsoft Corp.', price: 378.85, change: 5.67, changePercent: 1.52 },
      { symbol: 'TSLA', name: 'Tesla Inc.', price: 248.42, change: -8.91, changePercent: -3.46 }
    ]

    setPortfolioData(mockPortfolioData)
    setWatchlistData(mockWatchlist)
  }, [])

  const stats = [
    {
      title: 'Portfolio Value',
      value: '$11,000',
      change: '+10.0%',
      changeType: 'positive',
      icon: DollarSign
    },
    {
      title: 'Total Gain/Loss',
      value: '+$1,000',
      change: '+10.0%',
      changeType: 'positive',
      icon: TrendingUp
    },
    {
      title: 'Active Predictions',
      value: '12',
      change: '+3',
      changeType: 'positive',
      icon: BarChart3
    },
    {
      title: 'Watchlist Items',
      value: '8',
      change: '+2',
      changeType: 'positive',
      icon: Star
    }
  ]

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
              Welcome back, {user?.name}!
            </h1>
            <p className="text-gray-400">
              Here's your portfolio overview and market insights.
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="card hover:border-primary-500 transition-colors duration-300"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">{stat.title}</p>
                      <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
                      <div className="flex items-center mt-2">
                        {stat.changeType === 'positive' ? (
                          <ArrowUpRight className="h-4 w-4 text-green-400 mr-1" />
                        ) : (
                          <ArrowDownRight className="h-4 w-4 text-red-400 mr-1" />
                        )}
                        <span className={`text-sm ${
                          stat.changeType === 'positive' ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {stat.change}
                        </span>
                      </div>
                    </div>
                    <div className="text-primary-400">
                      <Icon className="h-8 w-8" />
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <StockChart 
                data={portfolioData} 
                title="Portfolio Performance" 
                color="#10b981"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="card"
            >
              <h3 className="text-lg font-semibold mb-4 text-white">Recent Predictions</h3>
              <div className="space-y-4">
                {[
                  { stock: 'AAPL', prediction: 'Buy', confidence: 85, target: '$180' },
                  { stock: 'GOOGL', prediction: 'Hold', confidence: 72, target: '$2900' },
                  { stock: 'MSFT', prediction: 'Buy', confidence: 91, target: '$390' },
                  { stock: 'TSLA', prediction: 'Sell', confidence: 68, target: '$230' }
                ].map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="font-semibold text-white">{item.stock}</div>
                      <div className={`px-2 py-1 rounded text-xs font-medium ${
                        item.prediction === 'Buy' ? 'bg-green-900 text-green-300' :
                        item.prediction === 'Sell' ? 'bg-red-900 text-red-300' :
                        'bg-yellow-900 text-yellow-300'
                      }`}>
                        {item.prediction}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-white font-medium">{item.target}</div>
                      <div className="text-gray-400 text-sm">{item.confidence}% confidence</div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Watchlist */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="card"
          >
            <h3 className="text-lg font-semibold mb-4 text-white">Your Watchlist</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-3 text-gray-400 font-medium">Symbol</th>
                    <th className="text-left py-3 text-gray-400 font-medium">Name</th>
                    <th className="text-right py-3 text-gray-400 font-medium">Price</th>
                    <th className="text-right py-3 text-gray-400 font-medium">Change</th>
                    <th className="text-right py-3 text-gray-400 font-medium">%</th>
                  </tr>
                </thead>
                <tbody>
                  {watchlistData.map((stock, index) => (
                    <tr key={index} className="border-b border-gray-700 hover:bg-gray-800 transition-colors">
                      <td className="py-3 font-semibold text-white">{stock.symbol}</td>
                      <td className="py-3 text-gray-300">{stock.name}</td>
                      <td className="py-3 text-right text-white">${stock.price}</td>
                      <td className={`py-3 text-right ${stock.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {stock.change >= 0 ? '+' : ''}{stock.change}
                      </td>
                      <td className={`py-3 text-right ${stock.changePercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}

export default Dashboard