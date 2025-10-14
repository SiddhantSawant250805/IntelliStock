# IntelliStock - AI Stock Predictor Platform

A comprehensive full-stack application for AI-powered stock market predictions and analysis.

## 🏗️ Architecture

The project is organized into three main folders:

### 📁 client/
React frontend application with modern UI/UX
- **Framework**: React 18 with Vite
- **Styling**: Tailwind CSS with custom design system
- **Routing**: React Router DOM
- **Charts**: Recharts for data visualization
- **Animations**: Framer Motion
- **State Management**: Context API
- **Forms**: React Hook Form
- **HTTP Client**: Axios

### 📁 server/
Node.js backend API server
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT with bcryptjs
- **Security**: Helmet, CORS, Rate limiting
- **Environment**: dotenv configuration

### 📁 ml-server/
Python Flask server for AI predictions
- **Framework**: Flask with Flask-CORS
- **Data**: yfinance for real stock data
- **Analysis**: pandas, numpy for data processing
- **ML**: scikit-learn for predictions
- **Technical Indicators**: RSI, MACD, Moving Averages

## 🚀 Features

### Frontend Features
- **Landing Page**: Engaging hero section with smooth animations
- **Authentication**: Login/Register with form validation
- **Dashboard**: Portfolio overview with interactive charts
- **Stock Predictor**: Search stocks, generate AI predictions
- **News Feed**: Market news with sentiment analysis
- **Watchlist**: Track favorite stocks with predictions
- **Admin Panel**: User management and analytics (admin only)
- **Responsive Design**: Mobile-first approach with Tailwind CSS

### Backend Features
- **User Management**: Registration, authentication, profiles
- **Stock Data**: Search, historical data, predictions
- **Watchlist**: Add/remove stocks, user preferences
- **Admin Controls**: User management, system analytics
- **Security**: JWT authentication, input validation, rate limiting

### ML Server Features
- **Stock Predictions**: 1-30 day price forecasts
- **Technical Analysis**: RSI, MACD, Moving Averages
- **Sentiment Analysis**: Market sentiment scoring
- **Real Data**: Integration with Yahoo Finance API
- **Multiple Models**: Technical, sentiment, and hybrid models

## 🛠️ Setup Instructions

### Prerequisites
- Node.js 16+ and npm
- Python 3.8+ and pip
- MongoDB (local or cloud)

### 1. Client Setup
```bash
cd client
npm install
npm run dev
```
The client will run on http://localhost:3000

### 2. Server Setup
```bash
cd server
npm install

# Create .env file with:
PORT=5000
MONGODB_URI=mongodb://localhost:27017/intellistock
JWT_SECRET=your-super-secret-jwt-key
NODE_ENV=development
ML_SERVER_URL=http://localhost:8000

npm run dev
```
The server will run on http://localhost:5000

### 3. ML Server Setup
```bash
cd ml-server
pip install -r requirements.txt

# Create .env file with:
FLASK_ENV=development
PORT=8000

python app.py
```
The ML server will run on http://localhost:8000

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Stocks
- `GET /api/stocks/:symbol` - Get stock data
- `GET /api/stocks/search/:query` - Search stocks
- `POST /api/stocks/predict` - Generate prediction
- `GET /api/stocks/:symbol/history` - Historical data
- `GET /api/stocks/news/:symbol?` - Market news

### Users
- `GET /api/users/profile` - User profile
- `POST /api/users/watchlist` - Add to watchlist
- `DELETE /api/users/watchlist/:symbol` - Remove from watchlist

### Admin
- `GET /api/admin/stats` - Dashboard statistics
- `GET /api/admin/users` - All users
- `PUT /api/admin/users/:id/status` - Update user status

### ML Server
- `POST /predict` - Generate stock prediction
- `GET /sentiment/:symbol` - Sentiment analysis
- `GET /technical/:symbol` - Technical analysis
- `GET /models` - Available models

## 🎨 Design System

### Colors
- **Primary**: Blue (#3B82F6) - Main brand color
- **Secondary**: Purple (#8B5CF6) - Accent color
- **Success**: Green (#10B981) - Positive indicators
- **Warning**: Yellow (#F59E0B) - Neutral indicators
- **Error**: Red (#EF4444) - Negative indicators
- **Background**: Gray-900 (#111827) - Dark theme

### Typography
- **Font**: Inter (Google Fonts)
- **Headings**: 600-700 weight
- **Body**: 400-500 weight
- **Scale**: Tailwind's default scale

### Components
- **Cards**: Rounded corners, subtle shadows
- **Buttons**: Primary/secondary variants with hover states
- **Forms**: Consistent styling with validation
- **Charts**: Recharts with custom theming

## 🔐 Security Features

- JWT authentication with secure tokens
- Password hashing with bcryptjs
- Rate limiting to prevent abuse
- Input validation and sanitization
- CORS configuration
- Helmet for security headers
- Environment variable protection

## 📱 Responsive Design

- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Flexible grid layouts
- Touch-friendly interactions
- Optimized for all screen sizes

## 🧪 Demo Credentials

### Admin Access
- Email: admin@intellistock.com
- Password: password123

### Regular User
- Email: user@example.com
- Password: password123

## 🚀 Deployment

### Client (Netlify/Vercel)
```bash
cd client
npm run build
# Deploy dist/ folder
```

### Server (Heroku/Railway)
```bash
cd server
# Set environment variables
# Deploy with npm start
```

### ML Server (Railway/Render)
```bash
cd ml-server
# Set environment variables
# Deploy with python app.py
```

## 📈 Future Enhancements

- Real-time stock data streaming
- Advanced ML models (LSTM, Transformer)
- Social trading features
- Mobile app development
- Advanced portfolio analytics
- Options and crypto support
- Paper trading simulation
- Advanced charting tools

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Yahoo Finance for stock data
- Tailwind CSS for styling framework
- Recharts for data visualization
- Framer Motion for animations
- MongoDB for database
- Flask for ML server framework