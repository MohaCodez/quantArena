"""
Generate sample market data for testing.
Run: python -m app.engine.generate_sample_data
"""
import json
import random
from pathlib import Path


def generate_sample_data(days=500, start_price=100.0):
    data = []
    price = start_price

    for i in range(days):
        change = random.gauss(0.0005, 0.02)
        open_price = price
        close_price = price * (1 + change)
        high = max(open_price, close_price) * (1 + abs(random.gauss(0, 0.005)))
        low = min(open_price, close_price) * (1 - abs(random.gauss(0, 0.005)))
        volume = random.randint(100000, 5000000)

        # Precompute simple indicators
        data.append({
            "date": f"2020-01-{(i % 28) + 1:02d}",
            "open": round(open_price, 2),
            "high": round(high, 2),
            "low": round(low, 2),
            "close": round(close_price, 2),
            "volume": volume,
        })
        price = close_price

    # Add RSI and SMA after all candles generated
    closes = [d["close"] for d in data]
    for i, d in enumerate(data):
        d["sma_20"] = round(sum(closes[max(0, i-19):i+1]) / min(i+1, 20), 2)
        d["sma_50"] = round(sum(closes[max(0, i-49):i+1]) / min(i+1, 50), 2)
        d["rsi_14"] = round(_compute_rsi(closes[:i+1], 14), 2)

    return data


def _compute_rsi(closes, period=14):
    if len(closes) < period + 1:
        return 50.0
    deltas = [closes[i] - closes[i-1] for i in range(1, len(closes))]
    recent = deltas[-period:]
    gains = sum(d for d in recent if d > 0) / period
    losses = -sum(d for d in recent if d < 0) / period
    if losses == 0:
        return 100.0
    rs = gains / losses
    return 100 - (100 / (1 + rs))


if __name__ == "__main__":
    random.seed(42)
    data = generate_sample_data()
    out_path = Path(__file__).parent.parent.parent / "data" / "sample_dataset.json"
    out_path.parent.mkdir(exist_ok=True)
    with open(out_path, "w") as f:
        json.dump(data, f)
    print(f"Generated {len(data)} candles → {out_path}")
