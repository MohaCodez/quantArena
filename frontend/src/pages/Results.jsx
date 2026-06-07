import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getStrategy, getResult } from "../api/client";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export default function Results() {
  const { strategyId } = useParams();
  const [strategy, setStrategy] = useState(null);
  const [result, setResult] = useState(null);
  const [polling, setPolling] = useState(true);

  useEffect(() => {
    getStrategy(strategyId).then(setStrategy);
  }, [strategyId]);

  useEffect(() => {
    if (!polling) return;
    const interval = setInterval(async () => {
      const s = await getStrategy(strategyId);
      setStrategy(s);
      if (s.status === "done") {
        const r = await getResult(strategyId);
        setResult(r);
        setPolling(false);
      } else if (s.status === "failed") {
        setPolling(false);
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [strategyId, polling]);

  if (!strategy) return <div className="text-center py-20 text-gray-500">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Backtest Results</h1>
          <StatusBadge status={strategy.status} />
        </div>
        <div className="flex gap-3">
          <Link to="/my-strategies" className="text-sm text-gray-400 hover:text-white border border-gray-700 px-4 py-2 rounded-lg transition">
            My Strategies
          </Link>
          <Link to="/competitions" className="text-sm bg-emerald-500 hover:bg-emerald-400 text-black font-medium px-4 py-2 rounded-lg transition">
            New Strategy
          </Link>
        </div>
      </div>

      {strategy.status === "failed" && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-6 py-4 text-red-400 text-sm mb-6">
          <span className="font-bold">Error:</span> {strategy.error_message}
        </div>
      )}

      {(strategy.status === "pending" || strategy.status === "running") && (
        <div className="flex flex-col items-center py-20">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-400">Running your strategy against hidden market data...</p>
        </div>
      )}

      {result && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
            <ScoreCard label="Total Return" value={`${result.total_return}%`} positive={result.total_return >= 0} />
            <ScoreCard label="Sharpe Ratio" value={result.sharpe_ratio.toFixed(2)} positive={result.sharpe_ratio >= 0} />
            <ScoreCard label="Max Drawdown" value={`${result.max_drawdown}%`} positive={false} />
            <ScoreCard label="Win Rate" value={`${result.win_rate}%`} positive={result.win_rate >= 50} />
            <ScoreCard label="Calmar Ratio" value={result.calmar_ratio.toFixed(2)} positive={result.calmar_ratio >= 0} />
          </div>

          {result.equity_curve && result.equity_curve.length > 0 && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h2 className="text-lg font-bold mb-4">Equity Curve</h2>
              <ResponsiveContainer width="100%" height={320}>
                <LineChart data={result.equity_curve.map((v, i) => ({ day: i, value: Math.round(v) }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                  <XAxis dataKey="day" stroke="#6b7280" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#6b7280" tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ background: "#111827", border: "1px solid #374151", borderRadius: 8 }}
                    labelStyle={{ color: "#9ca3af" }}
                    itemStyle={{ color: "#34d399" }}
                  />
                  <Line type="monotone" dataKey="value" stroke="#34d399" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    pending: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    running: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    done: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    failed: "bg-red-500/10 text-red-400 border-red-500/20",
  };
  const labels = { pending: "⏳ Pending", running: "⚙️ Running", done: "✅ Complete", failed: "❌ Failed" };

  return (
    <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}

function ScoreCard({ label, value, positive }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
      <div className="text-[11px] uppercase tracking-wide text-gray-500 mb-1">{label}</div>
      <div className={`text-xl font-bold ${positive ? "text-emerald-400" : "text-red-400"}`}>{value}</div>
    </div>
  );
}
