import numpy as np
import pandas as pd
from tensorflow import keras
from keras.models import Sequential
from keras.layers import LSTM, Dense, Dropout, BatchNormalization
from keras.callbacks import EarlyStopping
from sklearn.preprocessing import MinMaxScaler
import warnings
warnings.filterwarnings('ignore')

class LSTMStockPredictor:
    def __init__(self, lookback=60, epochs=50, batch_size=32):
        self.lookback = lookback
        self.epochs = epochs
        self.batch_size = batch_size
        self.model = None
        self.scaler = MinMaxScaler(feature_range=(0, 1))

    def prepare_data(self, data, target_col='Close'):
        if len(data) < self.lookback + 1:
            raise ValueError(f"Insufficient data. Need at least {self.lookback + 1} data points.")

        features = ['Open', 'High', 'Low', 'Close', 'Volume']
        data_features = data[features].values

        scaled_data = self.scaler.fit_transform(data_features)

        X, y = [], []
        for i in range(self.lookback, len(scaled_data)):
            X.append(scaled_data[i-self.lookback:i])
            y.append(scaled_data[i, 3])

        X, y = np.array(X), np.array(y)

        split = int(0.8 * len(X))
        X_train, X_test = X[:split], X[split:]
        y_train, y_test = y[:split], y[split:]

        return X_train, X_test, y_train, y_test, scaled_data

    def build_model(self, input_shape):
        model = Sequential([
            LSTM(128, return_sequences=True, input_shape=input_shape),
            Dropout(0.2),
            BatchNormalization(),

            LSTM(64, return_sequences=True),
            Dropout(0.2),
            BatchNormalization(),

            LSTM(32, return_sequences=False),
            Dropout(0.2),

            Dense(32, activation='relu'),
            Dense(16, activation='relu'),
            Dense(1)
        ])

        model.compile(optimizer='adam', loss='mean_squared_error', metrics=['mae'])
        return model

    def train(self, X_train, y_train, X_test, y_test):
        self.model = self.build_model((X_train.shape[1], X_train.shape[2]))

        early_stop = EarlyStopping(monitor='val_loss', patience=10, restore_best_weights=True)

        history = self.model.fit(
            X_train, y_train,
            epochs=self.epochs,
            batch_size=self.batch_size,
            validation_data=(X_test, y_test),
            callbacks=[early_stop],
            verbose=0
        )

        return history

    def predict_next_days(self, data, days=1):
        if self.model is None:
            X_train, X_test, y_train, y_test, scaled_data = self.prepare_data(data)
            self.train(X_train, y_train, X_test, y_test)

        features = ['Open', 'High', 'Low', 'Close', 'Volume']
        data_features = data[features].values
        scaled_data = self.scaler.transform(data_features)

        last_sequence = scaled_data[-self.lookback:]
        predictions = []
        current_sequence = last_sequence.copy()

        for _ in range(days):
            current_batch = current_sequence.reshape((1, self.lookback, current_sequence.shape[1]))
            predicted_price = self.model.predict(current_batch, verbose=0)[0, 0]
            predictions.append(predicted_price)

            new_row = current_sequence[-1].copy()
            new_row[3] = predicted_price
            current_sequence = np.vstack([current_sequence[1:], new_row])

        dummy_array = np.zeros((len(predictions), 5))
        dummy_array[:, 3] = predictions
        predicted_prices = self.scaler.inverse_transform(dummy_array)[:, 3]

        return predicted_prices

    def calculate_confidence(self, data, predictions):
        recent_volatility = data['Close'].pct_change().std()

        if len(data) > 20:
            recent_trend = data['Close'].iloc[-20:].pct_change().mean()
        else:
            recent_trend = data['Close'].pct_change().mean()

        base_confidence = 75

        if recent_volatility < 0.02:
            base_confidence += 10
        elif recent_volatility > 0.05:
            base_confidence -= 15

        if abs(recent_trend) < 0.001:
            base_confidence += 5

        prediction_change = (predictions[-1] - data['Close'].iloc[-1]) / data['Close'].iloc[-1]
        if abs(prediction_change) > 0.1:
            base_confidence -= 10

        return max(60, min(95, base_confidence))
