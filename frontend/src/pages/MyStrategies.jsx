import { useEffect, useState } from "react";
import { getMyStrategies } from "../api/client";
import { Link } from "react-router-dom";

export default function MyStrategies() {
  const [strategies, setStrategies] = useState([]);

  useEffect(() => {
    getMyStrategies().then(setStrategies);
  }, []);

  const statusStyles = {
    pending: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    running: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    done: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    failed: "bg-red-500/10 text-red-400 border-red-500/20",
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold mb-8">My Strategies</h1>

      {strategies.length === 0 && (
        <div className="text-center py-20">
          <p className="text-gray-500 mb-4">You haven't submitted any strategies yet.</p>
          <Link to="/competitions" className="text-emerald-400 hover:text-emerald-300 font-medium">
            Browse Competitions →
          </Link>
        </div>
      )}

      <div className="space-y-3">
        {strategies.map((s) => (
          <Link
            key={s.id}
            to={`/results/${s.id}`}
            className="block bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-emerald-500/50 transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${statusStyles[s.status]}`}>
                  {s.status.toUpperCase()}
                </span>
                <span className="text-sm text-gray-300 font-mono truncate max-w-md">
                  {s.code.split("\n")[0]}
                </span>
              </div>
              <span className="text-xs text-gray-500">
                {new Date(s.submitted_at).toLocaleString()}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
