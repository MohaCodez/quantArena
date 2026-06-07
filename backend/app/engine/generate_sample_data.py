"""
Generate volatile market data with regime changes.
Run: python -m app.engine.generate_sample_data
"""
import json
import random
import math
from pathlib import Path


def generate_sample_data(days=500, start_price=100.0):
    data = []
    price = start_price
    regime_length = 0
    regime = random.choice(["bull", "bear", "sideways", "crash", "pump"])

    for i in range(days):
        # Switch regime every 30-80 days
        regime_length += 1
        if regime_length > random.randint(30, 80):
            regime = random.choice(["bull", "bear", "sideways", "crash", "pump"])
            regime_length = 0

        # Base drift + volatility per regime
        if regime == "bull":
            drift = random.gauss(0.003, 0.005)
            vol = random.gauss(0, 0.025)
        elif regime == "bear":
            drift = random.gauss(-0.003, 0.005)
            vol = random.gauss(0, 0.03)
        elif regime == "crash":
            drift = random.gauss(-0.008, 0.01)
            vol = random.gauss(0, 0.05)
        elif regime == "pump":
            drift = random.gauss(0.008, 0.01)
            vol = random.gauss(0, 0.05)
        else:  # sideways
            drift = random.gauss(0, 0.001)
            vol = random.gauss(0, 0.02)

        # Add random spikes/gaps
        spike = 0
        if random.random() < 0.03:  # 3% chance of gap
            spike = random.choice([-1, 1]) * random.uniform(0.03, 0.08)

        change = drift + vol + spike
        open_price = price
        close_price = price * (1 + change)

        # Intraday volatility
        high = max(open_price, close_price) * (1 + abs(random.gauss(0, 0.015)))
        low = min(open_price, close_price) * (1 - abs(random.gauss(0, 0.015)))
        volume = int(random.gauss(2000000, 1500000))
        volume = max(100000, volume)

        data.append({
            "date": f"2020-01-{(i % 28) + 1:02d}",
            "open": round(open_price, 2),
            "high": round(high, 2),
            "low": round(low, 2),
            "close": round(close_price, 2),
            "volume": volume,
        })
        price = max(close_price, 1.0)  # prevent going to 0

    # Add indicators
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
    random.seed(99)
    data = generate_sample_data()
    out_path = Path(__file__).parent.parent.parent / "data" / "sample_dataset.json"
    out_path.parent.mkdir(exist_ok=True)
    with open(out_path, "w") as f:
        json.dump(data, f)
    print(f"Generated {len(data)} candles → {out_path}")
    # Print price range
    prices = [d["close"] for d in data]
    print(f"Price range: {min(prices):.2f} — {max(prices):.2f}")
    print(f"Start: {prices[0]:.2f}, End: {prices[-1]:.2f}")
