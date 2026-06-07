"""
Backtest engine — replays market data candle-by-candle, calls user strategy, tracks portfolio.
"""
import numpy as np


class Portfolio:
    def __init__(self, initial_cash: float = 100_000.0):
        self.initial_cash = initial_cash
        self.cash = initial_cash
        self.shares = 0
        self.trades = []
        self.equity_curve = []

    @property
    def value(self):
        return self.cash

    def execute(self, action: str, price: float, date: str):
        if action == "BUY" and self.cash >= price:
            qty = int(self.cash // price)
            if qty > 0:
                self.cash -= qty * price
                self.shares += qty
                self.trades.append({"date": date, "action": "BUY", "price": price, "qty": qty})
        elif action == "SELL" and self.shares > 0:
            self.cash += self.shares * price
            self.trades.append({"date": date, "action": "SELL", "price": price, "qty": self.shares})
            self.shares = 0

    def record_equity(self, price: float):
        self.equity_curve.append(self.cash + self.shares * price)


def run_backtest(strategy_fn, data: list[dict]) -> dict:
    """
    Run a strategy against market data.

    Args:
        strategy_fn: callable(candle, indicators, portfolio_info) -> "BUY"|"SELL"|"HOLD"
        data: list of dicts with keys: date, open, high, low, close, volume + indicator columns

    Returns:
        dict with scores and equity curve
    """
    portfolio = Portfolio()

    for i, candle in enumerate(data):
        price = candle["close"]
        portfolio_info = {
            "cash": portfolio.cash,
            "shares": portfolio.shares,
            "portfolio_value": portfolio.cash + portfolio.shares * price,
        }

        lookback = data[max(0, i - 50):i + 1]

        try:
            action = strategy_fn(candle, lookback, portfolio_info)
        except Exception:
            action = "HOLD"

        if action in ("BUY", "SELL", "HOLD"):
            portfolio.execute(action, price, candle["date"])

        portfolio.record_equity(price)

    return compute_scores(portfolio)


def compute_scores(portfolio: Portfolio) -> dict:
    equity = np.array(portfolio.equity_curve)
    if len(equity) < 2:
        return _empty_scores()

    total_return = (equity[-1] / portfolio.initial_cash - 1) * 100
    daily_returns = np.diff(equity) / equity[:-1]

    # Sharpe ratio (annualized, assuming 252 trading days)
    mean_r = np.mean(daily_returns)
    std_r = np.std(daily_returns)
    sharpe = (mean_r / std_r * np.sqrt(252)) if std_r > 0 else 0.0

    # Max drawdown
    peak = np.maximum.accumulate(equity)
    drawdown = (peak - equity) / peak
    max_drawdown = float(np.max(drawdown)) * 100

    # Win rate
    sells = [t for t in portfolio.trades if t["action"] == "SELL"]
    if sells:
        wins = 0
        for j, sell in enumerate(sells):
            buys = [t for t in portfolio.trades if t["action"] == "BUY"]
            if j < len(buys):
                if sell["price"] > buys[j]["price"]:
                    wins += 1
        win_rate = (wins / len(sells)) * 100
    else:
        win_rate = 0.0

    # Calmar ratio
    calmar = (total_return / max_drawdown) if max_drawdown > 0 else 0.0

    return {
        "total_return": round(total_return, 2),
        "sharpe_ratio": round(float(sharpe), 4),
        "max_drawdown": round(max_drawdown, 2),
        "win_rate": round(win_rate, 2),
        "calmar_ratio": round(calmar, 4),
        "equity_curve": equity.tolist(),
        "num_trades": len(portfolio.trades),
    }


def _empty_scores():
    return {
        "total_return": 0.0,
        "sharpe_ratio": 0.0,
        "max_drawdown": 0.0,
        "win_rate": 0.0,
        "calmar_ratio": 0.0,
        "equity_curve": [],
        "num_trades": 0,
    }
