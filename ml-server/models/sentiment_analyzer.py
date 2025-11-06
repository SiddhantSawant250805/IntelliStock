import numpy as np
import pandas as pd
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
from textblob import TextBlob
import yfinance as yf
from datetime import datetime, timedelta
import warnings
warnings.filterwarnings('ignore')

class SentimentAnalyzer:
    def __init__(self):
        self.vader = SentimentIntensityAnalyzer()

    def get_stock_info(self, symbol):
        try:
            stock = yf.Ticker(symbol)
            info = stock.info
            return info
        except Exception as e:
            print(f"Error fetching stock info: {e}")
            return {}

    def analyze_company_metrics(self, symbol):
        info = self.get_stock_info(symbol)

        sentiment_score = 0
        factors = []

        try:
            pe_ratio = info.get('trailingPE', None)
            if pe_ratio:
                if pe_ratio < 15:
                    sentiment_score += 0.15
                    factors.append('Low P/E ratio indicates undervaluation')
                elif pe_ratio > 30:
                    sentiment_score -= 0.10
                    factors.append('High P/E ratio suggests overvaluation')

            profit_margins = info.get('profitMargins', None)
            if profit_margins:
                if profit_margins > 0.20:
                    sentiment_score += 0.15
                    factors.append('Strong profit margins')
                elif profit_margins < 0.05:
                    sentiment_score -= 0.10
                    factors.append('Weak profit margins')

            revenue_growth = info.get('revenueGrowth', None)
            if revenue_growth:
                if revenue_growth > 0.15:
                    sentiment_score += 0.20
                    factors.append('Strong revenue growth')
                elif revenue_growth < 0:
                    sentiment_score -= 0.15
                    factors.append('Declining revenue')

            recommendation = info.get('recommendationKey', 'hold')
            if recommendation == 'buy' or recommendation == 'strong_buy':
                sentiment_score += 0.15
                factors.append('Positive analyst recommendations')
            elif recommendation == 'sell' or recommendation == 'strong_sell':
                sentiment_score -= 0.15
                factors.append('Negative analyst recommendations')

            target_price = info.get('targetMeanPrice', None)
            current_price = info.get('currentPrice', None)
            if target_price and current_price:
                upside = (target_price - current_price) / current_price
                if upside > 0.15:
                    sentiment_score += 0.10
                    factors.append('Significant upside to analyst price targets')
                elif upside < -0.10:
                    sentiment_score -= 0.10
                    factors.append('Trading above analyst price targets')

        except Exception as e:
            print(f"Error analyzing metrics: {e}")

        if not factors:
            factors.append('Limited fundamental data available')

        return sentiment_score, factors

    def analyze_technical_sentiment(self, data):
        sentiment_score = 0
        factors = []

        try:
            if len(data) < 50:
                return 0, ['Insufficient data for technical analysis']

            current_price = data['Close'].iloc[-1]

            sma_20 = data['Close'].rolling(window=20).mean().iloc[-1]
            sma_50 = data['Close'].rolling(window=50).mean().iloc[-1]

            if current_price > sma_20 > sma_50:
                sentiment_score += 0.15
                factors.append('Price above short and medium-term moving averages')
            elif current_price < sma_20 < sma_50:
                sentiment_score -= 0.15
                factors.append('Price below short and medium-term moving averages')

            delta = data['Close'].diff()
            gain = (delta.where(delta > 0, 0)).rolling(window=14).mean()
            loss = (-delta.where(delta < 0, 0)).rolling(window=14).mean()
            rs = gain / loss
            rsi = 100 - (100 / (1 + rs))
            current_rsi = rsi.iloc[-1]

            if current_rsi < 30:
                sentiment_score += 0.15
                factors.append('RSI indicates oversold conditions (potential upside)')
            elif current_rsi > 70:
                sentiment_score -= 0.15
                factors.append('RSI indicates overbought conditions (potential correction)')

            volume_sma = data['Volume'].rolling(window=20).mean()
            recent_volume = data['Volume'].iloc[-5:].mean()
            if recent_volume > volume_sma.iloc[-1] * 1.5:
                price_change = (data['Close'].iloc[-1] - data['Close'].iloc[-5]) / data['Close'].iloc[-5]
                if price_change > 0:
                    sentiment_score += 0.10
                    factors.append('High volume with price increase indicates strong buying')
                else:
                    sentiment_score -= 0.10
                    factors.append('High volume with price decrease indicates strong selling')

        except Exception as e:
            print(f"Error in technical sentiment: {e}")
            factors.append('Technical analysis incomplete')

        return sentiment_score, factors

    def analyze_market_sentiment(self, symbol, data):
        sentiment_score = 0
        all_factors = []

        fundamental_score, fundamental_factors = self.analyze_company_metrics(symbol)
        sentiment_score += fundamental_score
        all_factors.extend(fundamental_factors)

        technical_score, technical_factors = self.analyze_technical_sentiment(data)
        sentiment_score += technical_score
        all_factors.extend(technical_factors)

        normalized_score = max(-1, min(1, sentiment_score))

        if normalized_score > 0.2:
            overall_sentiment = 'Very Positive'
        elif normalized_score > 0.05:
            overall_sentiment = 'Positive'
        elif normalized_score < -0.2:
            overall_sentiment = 'Very Negative'
        elif normalized_score < -0.05:
            overall_sentiment = 'Negative'
        else:
            overall_sentiment = 'Neutral'

        confidence = min(95, max(60, 70 + abs(normalized_score) * 30))

        return {
            'score': normalized_score,
            'sentiment': overall_sentiment,
            'confidence': confidence,
            'factors': all_factors
        }

    def get_sentiment_adjustment(self, sentiment_score):
        return sentiment_score * 0.05
