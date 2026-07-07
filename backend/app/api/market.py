"""
Market Data API Routes
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Optional
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.services.market_data import market_data_service
from pydantic import BaseModel

router = APIRouter(prefix="/api/v1/market", tags=["market"])


class StockQuoteResponse(BaseModel):
    symbol: str
    price: float
    change: float
    change_percent: float
    volume: int
    market_cap: Optional[float] = None
    pe_ratio: Optional[float] = None
    dividend_yield: Optional[float] = None


class HistoricalDataPoint(BaseModel):
    date: str
    open: float
    high: float
    low: float
    close: float
    volume: int


class PortfolioPosition(BaseModel):
    symbol: str
    shares: float
    avg_cost: float


class PortfolioSummaryRequest(BaseModel):
    positions: List[PortfolioPosition]


@router.get("/quote/{symbol}", response_model=StockQuoteResponse)
async def get_stock_quote(
    symbol: str,
    current_user: User = Depends(get_current_user)
):
    """Get real-time quote for a stock"""
    quote = await market_data_service.get_stock_quote(symbol)
    
    if not quote:
        raise HTTPException(status_code=404, detail=f"Quote not found for {symbol}")
    
    return quote


@router.get("/quotes")
async def get_multiple_quotes(
    symbols: str = Query(..., description="Comma-separated list of symbols"),
    current_user: User = Depends(get_current_user)
):
    """Get quotes for multiple stocks"""
    symbol_list = [s.strip().upper() for s in symbols.split(",")]
    quotes = await market_data_service.get_multiple_quotes(symbol_list)
    
    return {"quotes": quotes}


@router.get("/historical/{symbol}", response_model=List[HistoricalDataPoint])
async def get_historical_data(
    symbol: str,
    period: str = Query("1y", description="Period (1d, 5d, 1mo, 3mo, 6mo, 1y, 2y, 5y, 10y, ytd, max)"),
    interval: str = Query("1d", description="Interval (1m, 2m, 5m, 15m, 30m, 60m, 90m, 1h, 1d, 5d, 1wk, 1mo, 3mo)"),
    current_user: User = Depends(get_current_user)
):
    """Get historical price data for a stock"""
    data = await market_data_service.get_historical_data(symbol, period, interval)
    
    if not data:
        raise HTTPException(status_code=404, detail=f"Historical data not found for {symbol}")
    
    return data


@router.post("/portfolio/summary")
async def get_portfolio_summary(
    request: PortfolioSummaryRequest,
    current_user: User = Depends(get_current_user)
):
    """Calculate portfolio summary with current market values"""
    positions = [
        {"symbol": p.symbol, "shares": p.shares, "avg_cost": p.avg_cost}
        for p in request.positions
    ]
    
    summary = await market_data_service.get_portfolio_summary(positions)
    return summary


@router.get("/indices")
async def get_market_indices(
    current_user: User = Depends(get_current_user)
):
    """Get major market indices"""
    indices = await market_data_service.get_market_indices()
    return {"indices": indices}


@router.get("/sectors")
async def get_sector_performance(
    current_user: User = Depends(get_current_user)
):
    """Get sector performance"""
    sectors = await market_data_service.get_sector_performance()
    return {"sectors": sectors}


@router.get("/trending")
async def get_trending_stocks(
    limit: int = Query(10, ge=1, le=50),
    current_user: User = Depends(get_current_user)
):
    """Get trending stocks"""
    stocks = await market_data_service.get_trending_stocks(limit)
    return {"stocks": stocks}


@router.get("/search")
async def search_stocks(
    q: str = Query(..., min_length=1, description="Search query"),
    current_user: User = Depends(get_current_user)
):
    """Search for stocks"""
    results = await market_data_service.search_stocks(q)
    return {"results": results}


@router.get("/dashboard/kpis")
async def get_dashboard_kpis(
    current_user: User = Depends(get_current_user)
):
    """Get key performance indicators for dashboard"""
    # Sample portfolio for demonstration
    sample_positions = [
        {"symbol": "AAPL", "shares": 100, "avg_cost": 150.00},
        {"symbol": "MSFT", "shares": 50, "avg_cost": 300.00},
        {"symbol": "GOOGL", "shares": 30, "avg_cost": 2500.00},
        {"symbol": "TSLA", "shares": 20, "avg_cost": 200.00}
    ]
    
    portfolio = await market_data_service.get_portfolio_summary(sample_positions)
    indices = await market_data_service.get_market_indices()
    
    # Calculate additional KPIs
    return {
        "total_portfolio_value": portfolio["total_value"],
        "daily_pl": portfolio["total_day_change"],
        "daily_pl_percent": portfolio["total_day_change_percent"],
        "total_pl": portfolio["total_pl"],
        "total_pl_percent": portfolio["total_pl_percent"],
        "market_indices": indices,
        "portfolio_positions": len(portfolio["positions"]),
        "timestamp": None  # Will be set by frontend
    }
