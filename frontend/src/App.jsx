import { BrowserRouter, Routes, Route, Navigate, Link, useNavigate } from "react-router-dom";
import { isLoggedIn, logout } from "./api/client";
import Login from "./pages/Login";
import Competitions from "./pages/Competitions";
import StrategyEditor from "./pages/StrategyEditor";
import Results from "./pages/Results";
import MyStrategies from "./pages/MyStrategies";
import Leaderboard from "./pages/Leaderboard";

function Navbar() {
  const navigate = useNavigate();
  const loggedIn = isLoggedIn();

  return (
    <nav className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-8">
        <Link to="/competitions" className="text-xl font-bold text-emerald-400 hover:text-emerald-300 transition">
          ⚡ QuantArena
        </Link>
        <div className="flex gap-5 text-sm">
          <Link to="/competitions" className="text-gray-400 hover:text-white transition">Competitions</Link>
          {loggedIn && <Link to="/my-strategies" className="text-gray-400 hover:text-white transition">My Strategies</Link>}
        </div>
      </div>
      <div className="flex gap-4 items-center">
        {loggedIn ? (
          <button
            onClick={() => { logout(); navigate("/login"); }}
            className="text-sm text-gray-400 hover:text-white transition"
          >
            Logout
          </button>
        ) : (
          <Link to="/login" className="text-sm bg-emerald-500 hover:bg-emerald-400 text-black px-4 py-2 rounded-lg font-medium transition">
            Login
          </Link>
        )}
      </div>
    </nav>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-950 text-white">
        <Navbar />
        <Routes>
          <Route path="/" element={<Navigate to="/competitions" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/competitions" element={<Competitions />} />
          <Route path="/compete/:competitionId" element={<StrategyEditor />} />
          <Route path="/results/:strategyId" element={<Results />} />
          <Route path="/my-strategies" element={<MyStrategies />} />
          <Route path="/leaderboard/:competitionId" element={<Leaderboard />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
