import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Editor from "@monaco-editor/react";
import { submitStrategy } from "../api/client";

const DEFAULT_CODE = `def strategy(candle, lookback, portfolio):
    """
    candle: dict with keys: date, open, high, low, close, volume, rsi_14, sma_20, sma_50
    lookback: list of last 50 candles
    portfolio: dict with keys: cash, shares, portfolio_value
    
    Return: "BUY", "SELL", or "HOLD"
    """
    if candle['rsi_14'] < 30:
        return 'BUY'
    elif candle['rsi_14'] > 70:
        return 'SELL'
    return 'HOLD'
`;

export default function StrategyEditor() {
  const { competitionId } = useParams();
  const [code, setCode] = useState(DEFAULT_CODE);
  const [status, setStatus] = useState(null);
  const navigate = useNavigate();

  async function handleSubmit() {
    setStatus("submitting");
    try {
      const result = await submitStrategy(competitionId, code);
      navigate(`/results/${result.id}`);
    } catch (err) {
      setStatus(`Error: ${err.message}`);
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Strategy Editor</h1>
        <p className="text-gray-400">
          Define a <code className="bg-gray-800 px-2 py-0.5 rounded text-emerald-300 text-sm">strategy(candle, lookback, portfolio)</code> function that returns <code className="bg-gray-800 px-2 py-0.5 rounded text-emerald-300 text-sm">"BUY"</code>, <code className="bg-gray-800 px-2 py-0.5 rounded text-emerald-300 text-sm">"SELL"</code>, or <code className="bg-gray-800 px-2 py-0.5 rounded text-emerald-300 text-sm">"HOLD"</code>.
        </p>
      </div>

      <div className="rounded-xl overflow-hidden border border-gray-800 shadow-2xl">
        <div className="bg-gray-900 px-4 py-2 border-b border-gray-800 flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <span className="ml-3 text-xs text-gray-500 font-mono">strategy.py</span>
        </div>
        <Editor
          height="420px"
          defaultLanguage="python"
          theme="vs-dark"
          value={code}
          onChange={(v) => setCode(v)}
          options={{
            fontSize: 14,
            minimap: { enabled: false },
            padding: { top: 16 },
            scrollBeyondLastLine: false,
          }}
        />
      </div>

      <div className="mt-6 flex items-center gap-4">
        <button
          onClick={handleSubmit}
          disabled={status === "submitting"}
          className="bg-emerald-500 hover:bg-emerald-400 disabled:bg-gray-700 disabled:text-gray-400 text-black font-bold px-8 py-3 rounded-lg transition text-sm"
        >
          {status === "submitting" ? "⏳ Submitting..." : "🚀 Submit Strategy"}
        </button>
        {status && status.startsWith("Error") && (
          <span className="text-red-400 text-sm">{status}</span>
        )}
      </div>

      <div className="mt-8 bg-gray-900 border border-gray-800 rounded-xl p-5">
        <h3 className="text-sm font-bold text-gray-300 mb-3">📖 Available Data</h3>
        <div className="grid grid-cols-3 gap-3 text-xs text-gray-400">
          <div><span className="text-emerald-400 font-mono">candle['open']</span> — Open price</div>
          <div><span className="text-emerald-400 font-mono">candle['high']</span> — High price</div>
          <div><span className="text-emerald-400 font-mono">candle['low']</span> — Low price</div>
          <div><span className="text-emerald-400 font-mono">candle['close']</span> — Close price</div>
          <div><span className="text-emerald-400 font-mono">candle['volume']</span> — Volume</div>
          <div><span className="text-emerald-400 font-mono">candle['rsi_14']</span> — RSI (14)</div>
          <div><span className="text-emerald-400 font-mono">candle['sma_20']</span> — SMA (20)</div>
          <div><span className="text-emerald-400 font-mono">candle['sma_50']</span> — SMA (50)</div>
          <div><span className="text-emerald-400 font-mono">portfolio['cash']</span> — Cash left</div>
        </div>
      </div>
    </div>
  );
}
