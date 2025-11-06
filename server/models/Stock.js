const mongoose = require('mongoose')

const stockSchema = new mongoose.Schema({
  symbol: {
    type: String,
    required: true,
    uppercase: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  currentPrice: {
    type: Number,
    required: true
  },
  change: {
    type: Number,
    default: 0
  },
  changePercent: {
    type: Number,
    default: 0
  },
  volume: {
    type: Number,
    default: 0
  },
  marketCap: {
    type: Number,
    default: 0
  },
  sector: {
    type: String,
    default: 'Unknown'
  },
  historicalData: [{
    date: Date,
    open: Number,
    high: Number,
    low: Number,
    close: Number,
    volume: Number
  }],
  predictions: [{
    date: Date,
    predictedPrice: Number,
    confidence: Number,
    model: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  sentiment: {
    score: {
      type: Number,
      min: -1,
      max: 1,
      default: 0
    },
    label: {
      type: String,
      enum: ['Positive', 'Negative', 'Neutral'],
      default: 'Neutral'
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  }
}, {
  timestamps: true
})

// Index for better query performance
// stockSchema.index({ symbol: 1 })
stockSchema.index({ sector: 1 })
stockSchema.index({ 'predictions.date': -1 })

module.exports = mongoose.model('Stock', stockSchema)