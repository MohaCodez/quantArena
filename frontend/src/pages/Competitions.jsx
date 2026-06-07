import { useEffect, useState } from "react";
import { getCompetitions, isLoggedIn } from "../api/client";
import { useNavigate } from "react-router-dom";

export default function Competitions() {
  const [competitions, setCompetitions] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    getCompetitions().then(setCompetitions);
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="mb-10">
        <h1 className="text-4xl font-bold mb-3">Competitions</h1>
        <p className="text-gray-400 text-lg">Submit your trading strategy and see how it performs against hidden market data.</p>
      </div>

      {competitions.length === 0 && (
        <div className="text-center py-20 text-gray-500">No active competitions right now.</div>
      )}

      <div className="space-y-4">
        {competitions.map((c) => (
          <div key={c.id} className="group bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-emerald-500/50 transition-all duration-300">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span className="text-xs font-medium text-emerald-400 uppercase tracking-wide">Active</span>
                </div>
                <h2 className="text-xl font-bold text-white mb-2 group-hover:text-emerald-300 transition">{c.title}</h2>
                <p className="text-gray-400 text-sm leading-relaxed">{c.description}</p>
              </div>
              <div className="shrink-0 flex flex-col gap-2">
                <button
                  onClick={() => {
                    if (!isLoggedIn()) return navigate("/login");
                    navigate(`/compete/${c.id}`);
                  }}
                  className="bg-emerald-500 hover:bg-emerald-400 text-black font-bold px-6 py-3 rounded-lg transition text-sm"
                >
                  Compete →
                </button>
                <button
                  onClick={() => navigate(`/leaderboard/${c.id}`)}
                  className="border border-gray-700 hover:border-gray-500 text-gray-300 font-medium px-6 py-3 rounded-lg transition text-sm"
                >
                  Leaderboard
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
