import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getLeaderboard } from "../api/client";

export default function Leaderboard() {
  const { competitionId } = useParams();
  const [entries, setEntries] = useState([]);

  useEffect(() => {
    getLeaderboard(competitionId).then(setEntries);
  }, [competitionId]);

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Leaderboard</h1>
        <Link
          to={`/compete/${competitionId}`}
          className="text-sm bg-emerald-500 hover:bg-emerald-400 text-black font-medium px-4 py-2 rounded-lg transition"
        >
          Submit Strategy
        </Link>
      </div>

      {entries.length === 0 && (
        <div className="text-center py-20 text-gray-500">No submissions yet. Be the first!</div>
      )}

      {entries.length > 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800 text-gray-400 text-xs uppercase tracking-wide">
                <th className="px-5 py-4 text-left">#</th>
                <th className="px-5 py-4 text-left">User</th>
                <th className="px-5 py-4 text-right">Score</th>
                <th className="px-5 py-4 text-right">Return</th>
                <th className="px-5 py-4 text-right">Sharpe</th>
                <th className="px-5 py-4 text-right">Drawdown</th>
                <th className="px-5 py-4 text-right">Win Rate</th>
                <th className="px-5 py-4 text-right">Calmar</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((e) => (
                <tr key={e.rank} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition">
                  <td className="px-5 py-4">
                    {e.rank <= 3 ? (
                      <span className="text-lg">{["🥇", "🥈", "🥉"][e.rank - 1]}</span>
                    ) : (
                      <span className="text-gray-500">{e.rank}</span>
                    )}
                  </td>
                  <td className="px-5 py-4 font-medium text-white">{e.username}</td>
                  <td className="px-5 py-4 text-right font-mono text-white font-bold">
                    {e.score}
                  </td>
                  <td className={`px-5 py-4 text-right font-mono ${e.total_return >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                    {e.total_return >= 0 ? "+" : ""}{e.total_return}%
                  </td>
                  <td className={`px-5 py-4 text-right font-mono ${e.sharpe_ratio >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                    {e.sharpe_ratio.toFixed(2)}
                  </td>
                  <td className="px-5 py-4 text-right font-mono text-red-400">
                    {e.max_drawdown.toFixed(1)}%
                  </td>
                  <td className={`px-5 py-4 text-right font-mono ${e.win_rate >= 50 ? "text-emerald-400" : "text-red-400"}`}>
                    {e.win_rate.toFixed(0)}%
                  </td>
                  <td className={`px-5 py-4 text-right font-mono ${e.calmar_ratio >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                    {e.calmar_ratio.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
