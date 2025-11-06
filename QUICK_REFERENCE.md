# Yahoo Finance Fixes - Quick Reference

## What Was Fixed

| Error | Cause | Solution |
|-------|-------|----------|
| **Timeout (10000ms)** | No retry logic | Added p-retry with exponential backoff (3 attempts) |
| **HTML parsing error** | Yahoo returns error page | Detect HTML responses, return safe defaults |
| **historical() deprecated** | Library maintenance | Replaced with stable chart() API |

## Files Changed

```
server/
├── utils/
│   └── yahooFinanceClient.js          ← NEW: Wrapper with retries
├── routes/
│   ├── stocks.js                      ← UPDATED: Uses new client
│   └── users.js                       ← UPDATED: Uses new client
└── package.json                       ← UPDATED: Added p-retry
```

## How to Use

### 1. Initialize Client (top of any route file)
```javascript
const createYahooFinanceClient = require('../utils/yahooFinanceClient')

const yahooFinance = createYahooFinanceClient({
  timeout: 5000,
  maxRetries: 3,
  retryDelay: 1000
})
```

### 2. Use Stable API Methods
```javascript
// GOOD ✓
const quote = await yahooFinance.quote('AAPL')
const chart = await yahooFinance.chart('AAPL', { period1: new Date(...) })
const search = await yahooFinance.search('Apple')

// BAD ✗
const history = await yahooFinance.historical('AAPL', options) // DEPRECATED
```

### 3. Handle Errors Gracefully
```javascript
try {
  const data = await yahooFinance.quote('AAPL')
} catch (error) {
  console.error('Failed after retries:', error.message)
  // Return fallback data instead of crashing
  res.json({ price: 0, error: 'Service unavailable' })
}
```

## Key Improvements

✅ **Automatic Retries** - 3 attempts with exponential backoff
✅ **Timeout Protection** - Won't hang indefinitely
✅ **HTML Detection** - Gracefully handles service errors
✅ **Stable API** - Uses chart() instead of deprecated historical()
✅ **Safe Defaults** - Missing data returns 0/'N/A' instead of undefined

## Configuration

```javascript
// Retry up to 3 times, 5s per attempt, 1s initial delay
createYahooFinanceClient({
  timeout: 5000,      // Milliseconds per request
  maxRetries: 3,      // Number of retries
  retryDelay: 1000    // Initial delay between retries
})
```

## Testing

```bash
# Check syntax
node -c server/utils/yahooFinanceClient.js

# Test endpoints
curl http://localhost:5000/api/stocks/AAPL
curl http://localhost:5000/api/stocks/AAPL/history
curl http://localhost:5000/api/stocks/news/watchlist
```

## Logs You'll See

### Success
```
quote(AAPL) request successful
```

### Retry
```
quote(AAPL) failed (attempt 1/3): timeout
quote(AAPL) failed (attempt 2/3): timeout
quote(AAPL) succeeded (attempt 3/3)
```

### Final Failure
```
quote(AAPL) failed (attempt 1/3): HTML response
quote(AAPL) failed (attempt 2/3): HTML response
quote(AAPL) failed (attempt 3/3): HTML response
Quote error for AAPL: Yahoo Finance returned HTML instead of JSON
```

## Breaking Changes

None! This is backward compatible.

- Existing endpoints work the same
- Error handling is better
- Timeouts are handled automatically
- chart() returns data in same format as historical()

## Dependencies

```bash
npm install p-retry  # Already done for you
```

Only adds p-retry (2.5KB, well-maintained package)

## Where to Read More

- **Error Explanation**: See `YAHOO_FINANCE_ERRORS.md`
- **Full Implementation**: See `YAHOO_FINANCE_IMPLEMENTATION.md`
- **Source Code**: `/server/utils/yahooFinanceClient.js`

## Still Having Issues?

1. Check logs for error messages
2. Verify Yahoo Finance isn't rate-limiting you (wait 5 min)
3. Test with different stock symbols
4. Increase timeout: `timeout: 10000`
5. Increase retries: `maxRetries: 5`

## Code Example: Complete Endpoint

```javascript
router.get('/:symbol', auth, async (req, res) => {
  try {
    const quote = await yahooFinance.quote(req.params.symbol)
    res.json({
      symbol: quote.symbol,
      price: quote.regularMarketPrice || 0,
      change: quote.regularMarketChange || 0
    })
  } catch (error) {
    res.status(503).json({
      message: 'Unable to fetch stock data',
      error: error.message
    })
  }
})
```

That's it! Your code now:
- Retries automatically on timeout ✓
- Handles HTML responses gracefully ✓
- Uses stable APIs ✓
- Returns safe defaults on error ✓
