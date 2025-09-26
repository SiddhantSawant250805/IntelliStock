import { Routes, Route } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Navbar from './components/Layout/Navbar'
import Footer from './components/Layout/Footer'
import ProtectedRoute from './components/Auth/ProtectedRoute'
import AdminRoute from './components/Auth/AdminRoute'

// Pages
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Predictor from './pages/Predictor'
import News from './pages/News'
import Watchlist from './pages/Watchlist'
import Admin from './pages/Admin'

function App() {
  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <Navbar />
      
      <AnimatePresence mode="wait">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/predictor" element={
            <ProtectedRoute>
              <Predictor />
            </ProtectedRoute>
          } />
          
          <Route path="/news" element={
            <ProtectedRoute>
              <News />
            </ProtectedRoute>
          } />
          
          <Route path="/watchlist" element={
            <ProtectedRoute>
              <Watchlist />
            </ProtectedRoute>
          } />
          
          <Route path="/admin" element={
            <AdminRoute>
              <Admin />
            </AdminRoute>
          } />
        </Routes>
      </AnimatePresence>

      <Footer />
    </div>
  )
}

export default App