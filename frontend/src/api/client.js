const API_URL = "http://localhost:8000";

function getToken() {
  return localStorage.getItem("token");
}

function authHeaders() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function register(email, username, password) {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, username, password }),
  });
  if (!res.ok) throw new Error((await res.json()).detail);
  return res.json();
}

export async function login(email, password) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error((await res.json()).detail);
  const data = await res.json();
  localStorage.setItem("token", data.access_token);
  return data;
}

export function logout() {
  localStorage.removeItem("token");
}

export function isLoggedIn() {
  return !!getToken();
}

export async function getMe() {
  const res = await fetch(`${API_URL}/auth/me`, { headers: authHeaders() });
  if (!res.ok) throw new Error("Not authenticated");
  return res.json();
}

export async function getCompetitions() {
  const res = await fetch(`${API_URL}/competitions/`);
  return res.json();
}

export async function submitStrategy(competitionId, code) {
  const res = await fetch(`${API_URL}/strategies/`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ competition_id: competitionId, code, mode: "code" }),
  });
  if (!res.ok) throw new Error((await res.json()).detail);
  return res.json();
}

export async function getStrategy(id) {
  const res = await fetch(`${API_URL}/strategies/${id}`, { headers: authHeaders() });
  if (!res.ok) throw new Error("Not found");
  return res.json();
}

export async function getResult(strategyId) {
  const res = await fetch(`${API_URL}/strategies/${strategyId}/result`, { headers: authHeaders() });
  if (!res.ok) return null;
  return res.json();
}

export async function getMyStrategies() {
  const res = await fetch(`${API_URL}/strategies/me`, { headers: authHeaders() });
  return res.json();
}

export async function getLeaderboard(competitionId) {
  const res = await fetch(`${API_URL}/leaderboard/${competitionId}`);
  return res.json();
}
