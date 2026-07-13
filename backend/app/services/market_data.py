"""
Market Data Service - Aggregates data from yfinance and other financial APIs
Uses run_in_executor to avoid blocking the async event loop.
Implements in-memory TTL cache to avoid redundant network calls.
"""
import yfinance as yf
import asyncio
import time
import logging
from typing import Dict, List, Optional, Any
from dataclasses import dataclass
from concurrent.futures import ThreadPoolExecutor

logger = logging.getLogger(__name__)

# Dedicated thread pool for blocking yfinance calls
_thread_pool = ThreadPoolExecutor(max_workers=4, thread_name_prefix="yfinance")


@dataclass
class MarketDataPoint:
    """Market data point model"""
    symbol: str
    price: float
    change: float
    change_percent: float
    volume: int
    market_cap: Optional[float] = None
    pe_ratio: Optional[float] = None
    dividend_yield: Optional[float] = None


@dataclass
class PortfolioPosition:
    """Portfolio position model"""
    symbol: str
    shares: float
    avg_cost: float
    current_price: float
    market_value: float
    cost_basis: float
    unrealized_pl: float
    unrealized_pl_percent: float
    day_change: float
    day_change_percent: float


class _TTLCache:
    """Simple in-memory TTL cache for market data"""

    def __init__(self, default_ttl: int = 60):
        self._store: Dict[str, tuple] = {}
        self._default_ttl = default_ttl

    def get(self, key: str) -> Optional[Any]:
        if key in self._store:
            value, expiry = self._store[key]
            if time.monotonic() < expiry:
                return value
            del self._store[key]
        return None

    def set(self, key: str, value: Any, ttl: Optional[int] = None):
        self._store[key] = (value, time.monotonic() + (ttl or self._default_ttl))

    def invalidate(self, key: str):
        self._store.pop(key, None)


class MarketDataService:
    """Service to fetch and process market data"""

    def __init__(self):
        self._cache = _TTLCache(default_ttl=60)

    def _fetch_quote_sync(self, symbol: str) -> Optional[MarketDataPoint]:
        """Blocking fetch for a single stock quote (runs in thread pool)"""
        try:
            ticker = yf.Ticker(symbol)
            info = ticker.info
            hist = ticker.history(period="2d")

            if hist.empty:
                return None

            current_price = hist['Close'].iloc[-1]
            prev_close = hist['Close'].iloc[-2] if len(hist) > 1 else current_price

            change = current_price - prev_close
            change_percent = (change / prev_close) * 100 if prev_close != 0 else 0

            return MarketDataPoint(
                symbol=symbol,
                price=float(current_price),
                change=float(change),
                change_percent=float(change_percent),
                volume=int(hist['Volume'].iloc[-1]) if 'Volume' in hist else 0,
                market_cap=info.get('marketCap'),
                pe_ratio=info.get('trailingPE'),
                dividend_yield=info.get('dividendYield'),
            )
        except Exception as e:
            logger.error(f"Error fetching quote for {symbol}: {e}")
            return None

    def _fetch_historical_sync(self, symbol: str, period: str, interval: str) -> List[Dict[str, Any]]:
        """Blocking fetch for historical data (runs in thread pool)"""
        try:
            ticker = yf.Ticker(symbol)
            hist = ticker.history(period=period, interval=interval)

            if hist.empty:
                return []

            hist.reset_index(inplace=True)

            return [
                {
                    "date": str(row['Date'].date()) if hasattr(row['Date'], 'date') else str(row['Date']),
                    "open": float(row['Open']),
                    "high": float(row['High']),
                    "low": float(row['Low']),
                    "close": float(row['Close']),
                    "volume": int(row['Volume']) if 'Volume' in hist.columns else 0,
                }
                for _, row in hist.iterrows()
            ]
        except Exception as e:
            logger.error(f"Error fetching historical data for {symbol}: {e}")
            return []

    def _search_stock_sync(self, query: str) -> List[Dict[str, str]]:
        """Blocking stock search (runs in thread pool)"""
        try:
            ticker = yf.Ticker(query.upper())
            info = ticker.info

            if info:
                return [{
                    "symbol": query.upper(),
                    "name": info.get("longName", query.upper()),
                    "exchange": info.get("exchange", ""),
                    "type": info.get("quoteType", ""),
                }]
            return []
        except Exception as e:
            logger.error(f"Error searching stocks for '{query}': {e}")
            return []

    async def get_stock_quote(self, symbol: str) -> Optional[MarketDataPoint]:
        """Get real-time stock quote (non-blocking)"""
        cache_key = f"quote:{symbol}"
        cached = self._cache.get(cache_key)
        if cached is not None:
            return cached

        loop = asyncio.get_running_loop()
        result = await loop.run_in_executor(_thread_pool, self._fetch_quote_sync, symbol)

        if result is not None:
            self._cache.set(cache_key, result, ttl=60)
        return result

    async def get_multiple_quotes(self, symbols: List[str]) -> Dict[str, MarketDataPoint]:
        """Get quotes for multiple symbols concurrently"""
        tasks = [self.get_stock_quote(symbol) for symbol in symbols]
        results = await asyncio.gather(*tasks)
        return {
            symbol: data
            for symbol, data in zip(symbols, results)
            if data is not None
        }

    async def get_historical_data(
        self,
        symbol: str,
        period: str = "1y",
        interval: str = "1d",
    ) -> List[Dict[str, Any]]:
        """Get historical price data (non-blocking)"""
        cache_key = f"historical:{symbol}:{period}:{interval}"
        cached = self._cache.get(cache_key)
        if cached is not None:
            return cached

        loop = asyncio.get_running_loop()
        result = await loop.run_in_executor(
            _thread_pool, self._fetch_historical_sync, symbol, period, interval
        )

        if result:
            self._cache.set(cache_key, result, ttl=300)
        return result

    async def get_portfolio_summary(
        self,
        positions: List[Dict[str, Any]],
    ) -> Dict[str, Any]:
        """Calculate portfolio summary from positions"""
        try:
            symbols = [p['symbol'] for p in positions]
            quotes = await self.get_multiple_quotes(symbols)

            portfolio_positions = []
            total_value = 0
            total_cost = 0
            total_day_change = 0

            for pos in positions:
                symbol = pos['symbol']
                shares = pos['shares']
                avg_cost = pos['avg_cost']

                quote = quotes.get(symbol)
                if not quote:
                    continue

                current_price = quote.price
                market_value = shares * current_price
                cost_basis = shares * avg_cost
                unrealized_pl = market_value - cost_basis
                unrealized_pl_percent = (unrealized_pl / cost_basis) * 100 if cost_basis != 0 else 0
                day_change = shares * quote.change
                day_change_percent = quote.change_percent

                portfolio_positions.append(PortfolioPosition(
                    symbol=symbol,
                    shares=shares,
                    avg_cost=avg_cost,
                    current_price=current_price,
                    market_value=market_value,
                    cost_basis=cost_basis,
                    unrealized_pl=unrealized_pl,
                    unrealized_pl_percent=unrealized_pl_percent,
                    day_change=day_change,
                    day_change_percent=day_change_percent,
                ))

                total_value += market_value
                total_cost += cost_basis
                total_day_change += day_change

            total_pl = total_value - total_cost
            total_pl_percent = (total_pl / total_cost) * 100 if total_cost != 0 else 0
            total_day_change_percent = (total_day_change / total_value) * 100 if total_value != 0 else 0

            return {
                "total_value": round(total_value, 2),
                "total_cost": round(total_cost, 2),
                "total_pl": round(total_pl, 2),
                "total_pl_percent": round(total_pl_percent, 2),
                "total_day_change": round(total_day_change, 2),
                "total_day_change_percent": round(total_day_change_percent, 2),
                "positions": [
                    {
                        "symbol": p.symbol,
                        "shares": p.shares,
                        "avg_cost": round(p.avg_cost, 2),
                        "current_price": round(p.current_price, 2),
                        "market_value": round(p.market_value, 2),
                        "cost_basis": round(p.cost_basis, 2),
                        "unrealized_pl": round(p.unrealized_pl, 2),
                        "unrealized_pl_percent": round(p.unrealized_pl_percent, 2),
                        "day_change": round(p.day_change, 2),
                        "day_change_percent": round(p.day_change_percent, 2),
                    }
                    for p in portfolio_positions
                ],
            }
        except Exception as e:
            logger.error(f"Error calculating portfolio summary: {e}")
            return {
                "total_value": 0,
                "total_cost": 0,
                "total_pl": 0,
                "total_pl_percent": 0,
                "total_day_change": 0,
                "total_day_change_percent": 0,
                "positions": [],
            }

    async def get_market_indices(self) -> Dict[str, MarketDataPoint]:
        """Get major market indices"""
        indices = {
            "^GSPC": "S&P 500",
            "^DJI": "Dow Jones",
            "^IXIC": "NASDAQ",
            "^RUT": "Russell 2000",
        }

        quotes = await self.get_multiple_quotes(list(indices.keys()))
        return {
            indices[symbol]: data
            for symbol, data in quotes.items()
        }

    async def get_sector_performance(self) -> List[Dict[str, Any]]:
        """Get sector performance using sector ETFs"""
        sectors = {
            "XLK": "Technology",
            "XLF": "Financials",
            "XLV": "Healthcare",
            "XLE": "Energy",
            "XLI": "Industrials",
            "XLY": "Consumer Discretionary",
            "XLP": "Consumer Staples",
            "XLU": "Utilities",
            "XLRE": "Real Estate",
            "XLB": "Materials",
            "XLC": "Communications",
        }

        quotes = await self.get_multiple_quotes(list(sectors.keys()))

        return [
            {
                "name": sectors[symbol],
                "symbol": symbol,
                "change_percent": round(data.change_percent, 2),
                "price": round(data.price, 2),
            }
            for symbol, data in quotes.items()
        ]

    async def get_trending_stocks(self, limit: int = 10) -> List[Dict[str, Any]]:
        """Get trending stocks (using popular stocks as proxy)"""
        trending = ["AAPL", "MSFT", "GOOGL", "AMZN", "TSLA", "META", "NVDA", "AMD", "NFLX", "DIS"]

        quotes = await self.get_multiple_quotes(trending[:limit])

        return [
            {
                "symbol": symbol,
                "name": symbol,
                "price": round(data.price, 2),
                "change": round(data.change, 2),
                "change_percent": round(data.change_percent, 2),
                "volume": data.volume,
            }
            for symbol, data in quotes.items()
        ]

    async def search_stocks(self, query: str) -> List[Dict[str, str]]:
        """Search for stocks by symbol or name"""
        cache_key = f"search:{query.upper()}"
        cached = self._cache.get(cache_key)
        if cached is not None:
            return cached

        loop = asyncio.get_running_loop()
        result = await loop.run_in_executor(_thread_pool, self._search_stock_sync, query)

        if result:
            self._cache.set(cache_key, result, ttl=300)
        return result


# Global instance
market_data_service = MarketDataService()
