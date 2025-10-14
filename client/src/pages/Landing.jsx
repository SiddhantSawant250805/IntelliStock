import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  TrendingUp,
  Brain,
  BarChart3,
  Shield,
  Zap,
  Users,
  ArrowRight,
  CheckCircle
} from 'lucide-react'

const Landing = () => {
  const features = [
    {
      icon: Brain,
      title: "AI-Powered Predictions",
      description: "Advanced machine learning algorithms analyze market patterns to provide accurate stock predictions."
    },
    {
      icon: BarChart3,
      title: "Interactive Charts",
      description: "Visualize stock performance with beautiful, responsive charts and real-time data updates."
    },
    {
      icon: Shield,
      title: "Secure Platform",
      description: "Bank-level security with encrypted data transmission and secure user authentication."
    },
    {
      icon: Zap,
      title: "Real-time Analysis",
      description: "Get instant market insights and sentiment analysis for informed investment decisions."
    }
  ]

  const stats = [
    { number: "10K+", label: "Active Users" },
    { number: "95%", label: "Accuracy Rate" },
    { number: "500+", label: "Stocks Tracked" },
    { number: "24/7", label: "Market Monitoring" }
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden gradient-bg">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
              Predict the Future of
              <span className="block gradient-text">Stock Markets</span>
            </h1>
            <p className="text-xl text-gray-200 mb-8 max-w-3xl mx-auto">
              Harness the power of artificial intelligence to make smarter investment decisions.
              Our advanced ML algorithms analyze market trends to provide accurate stock predictions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.a
              href='/register'
                whileHover={{
                  scale: 1.06,
                  boxShadow: "0 8px 32px rgba(100,50,240,0.14)",
                  background: "linear-gradient(45deg, rgb(147, 51, 234), rgb(236, 72, 153))"
                }}
                whileTap={{ scale: 0.96 }}
                onClick={() => navigate("/register")}
                className="btn-primary text-lg px-8 py-4 cursor-pointer flex items-center justify-center rounded-xl font-semibold"
              >
                Start Predicting <ArrowRight className="ml-2 h-5 w-5" />
              </motion.a>

              <motion.a
                href='/login'
                whileHover={{
                  scale: 1.05,
                  boxShadow: "0 8px 24px rgba(0,0,0,0.15)"
                }}
                whileTap={{ scale: 0.96 }}
                onClick={() => navigate("/login")}
                className="btn-secondary text-lg px-8 py-4 cursor-pointer flex items-center justify-center rounded-xl font-semibold"
              >
                Sign In
              </motion.a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-3xl md:text-4xl font-bold text-primary-400 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-400">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-white mb-4">
              Why Choose IntelliStock?
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Our platform combines cutting-edge AI technology with intuitive design
              to deliver the most accurate stock market predictions.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="card hover:border-primary-500 transition-colors duration-300"
                >
                  <div className="text-primary-400 mb-4">
                    <Icon className="h-12 w-12" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-400">
                    {feature.description}
                  </p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 gradient-bg">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl font-bold text-white mb-6">
              Ready to Transform Your Trading?
            </h2>
            <p className="text-xl text-gray-200 mb-8">
              Join thousands of investors who trust IntelliStock for their market predictions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="btn-primary text-lg px-8 py-4"
              >
                Get Started Free
              </Link>
              <div className="flex items-center justify-center space-x-2 text-gray-200">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <span>No credit card required</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

export default Landing