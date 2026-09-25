const API_BASE = (
  process.env.NEXT_PUBLIC_API_URL || "https://airesearchassistant-qbli.onrender.com"
).replace(/\/$/, "");

export async function startResearch(topic) {
  const res = await fetch(`${API_BASE}/api/research`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ topic }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || "Failed to start research");
  }
  return res.json();
}

export async function getResearchStatus(sessionId) {
  const res = await fetch(`${API_BASE}/api/research/${sessionId}/status`);
  if (!res.ok) throw new Error("Failed to fetch research status");
  return res.json();
}

export async function getResearchSession(sessionId) {
  const res = await fetch(`${API_BASE}/api/research/${sessionId}`);
  if (!res.ok) throw new Error("Failed to fetch research report");
  return res.json();
}

export async function askFollowUp(sessionId, question) {
  const res = await fetch(`${API_BASE}/api/research/${sessionId}/ask`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || "Failed to answer follow-up");
  }
  return res.json();
}

export async function listSessions() {
  const res = await fetch(`${API_BASE}/api/sessions`);
  if (!res.ok) throw new Error("Failed to fetch research sessions");
  return res.json();
}

export async function deleteSession(sessionId) {
  const res = await fetch(`${API_BASE}/api/sessions/${sessionId}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete session");
  return res.json();
}

export function getEventsUrl(sessionId) {
  return `${API_BASE}/api/research/${sessionId}/events`;
}
