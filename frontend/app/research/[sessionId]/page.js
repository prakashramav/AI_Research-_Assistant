"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { ArrowLeft, Menu, Sparkles, RefreshCw, AlertCircle } from "lucide-react";
import SessionSidebar from "@/components/SessionSidebar";
import ProgressTimeline from "@/components/ProgressTimeline";
import ReportView from "@/components/ReportView";
import { getResearchSession, getResearchStatus, getEventsUrl } from "@/lib/api";

export default function ResearchSessionPage({ params }) {
  // Unwrap Next.js App Router params
  const resolvedParams = use(params);
  const sessionId = resolvedParams.sessionId;

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Live SSE progress states
  const [progressStage, setProgressStage] = useState("planning");
  const [progressPercent, setProgressPercent] = useState(5);
  const [progressMessage, setProgressMessage] = useState("Initializing research...");
  const [subQueries, setSubQueries] = useState([]);
  const [sourcesCount, setSourcesCount] = useState(0);
  const [chunksCount, setChunksCount] = useState(0);

  // Fetch full session details
  const fetchSessionData = async () => {
    try {
      const data = await getResearchSession(sessionId);
      setSession(data);
      if (data.status === "completed") {
        setProgressStage("completed");
        setProgressPercent(100);
      } else if (data.status === "failed") {
        setProgressStage("failed");
        setError(data.error_message || "Research pipeline failed.");
      }
    } catch (err) {
      console.error("Failed to load session:", err);
      setError(err.message || "Failed to load research report.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!sessionId) return;

    // First check initial status
    getResearchStatus(sessionId)
      .then((statusData) => {
        setProgressStage(statusData.status);
        setProgressPercent(statusData.progress_percent || 0);
        setProgressMessage(statusData.progress_message || "Processing...");

        if (statusData.status === "completed") {
          // If already completed, directly fetch full report
          fetchSessionData();
        } else {
          // If in progress, connect to Server-Sent Events (SSE)
          setLoading(false);
          const eventsUrl = getEventsUrl(sessionId);
          const eventSource = new EventSource(eventsUrl);

          eventSource.onmessage = (event) => {
            try {
              const data = JSON.parse(event.data);
              if (data.stage) setProgressStage(data.stage);
              if (data.percent !== undefined) setProgressPercent(data.percent);
              if (data.message) setProgressMessage(data.message);
              if (data.sub_queries) setSubQueries(data.sub_queries);
              if (data.count) setSourcesCount(data.count);
              if (data.chunks_count) setChunksCount(data.chunks_count);

              if (data.stage === "completed") {
                eventSource.close();
                fetchSessionData();
              } else if (data.stage === "failed") {
                eventSource.close();
                setError(data.error || "Research pipeline encountered an error.");
              }
            } catch (err) {
              console.error("Error parsing SSE event:", err);
            }
          };

          eventSource.onerror = (err) => {
            console.warn("SSE connection error or closed:", err);
            eventSource.close();
            // Fallback: poll status once
            setTimeout(fetchSessionData, 2000);
          };

          return () => {
            eventSource.close();
          };
        }
      })
      .catch((err) => {
        console.error("Failed to fetch initial status:", err);
        fetchSessionData();
      });
  }, [sessionId]);

  return (
    <div className="min-h-screen flex flex-col md:pl-80 transition-all">
      {/* Sidebar */}
      <SessionSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Top Navbar */}
      <header
        className="w-full py-3.5 px-6 border-b flex items-center justify-between sticky top-0 z-30 backdrop-blur-md"
        style={{
          borderColor: "var(--border-subtle)",
          backgroundColor: "rgba(251, 249, 245, 0.88)",
        }}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden p-1.5 rounded-lg border text-[var(--text-muted)]"
            style={{ borderColor: "var(--border-subtle)" }}
          >
            <Menu className="w-5 h-5" />
          </button>

          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Search Console</span>
          </Link>
        </div>

        {session && (
          <div className="flex-1 max-w-md mx-4 text-center hidden md:block">
            <span className="text-xs font-editorial font-medium truncate block text-[var(--text-main)]">
              {session.topic}
            </span>
          </div>
        )}

        <div className="flex items-center gap-2">
          {session?.status === "completed" && (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Complete
            </span>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 px-4 py-8">
        {error ? (
          <div className="max-w-xl mx-auto my-12 p-6 rounded-2xl border text-center bg-red-50 border-red-200 text-red-800">
            <AlertCircle className="w-8 h-8 mx-auto mb-2 text-red-600" />
            <h3 className="font-semibold text-base mb-1">Research Execution Error</h3>
            <p className="text-xs mb-4">{error}</p>
            <button
              onClick={() => {
                setError(null);
                fetchSessionData();
              }}
              className="inline-flex items-center gap-1.5 py-2 px-4 rounded-lg bg-red-600 text-white text-xs font-medium hover:bg-red-700 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry Pipeline</span>
            </button>
          </div>
        ) : loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <span className="w-6 h-6 border-2 border-[var(--accent-ink)] border-t-transparent rounded-full animate-spin mb-3" />
            <span className="text-xs text-[var(--text-muted)] font-mono">
              Retrieving documentary session...
            </span>
          </div>
        ) : session && session.status === "completed" && session.report ? (
          /* Render Document-like Editorial Report */
          <ReportView session={session} />
        ) : (
          /* Live Progress State during Research */
          <div className="py-12 px-4">
            <div className="text-center max-w-xl mx-auto mb-8">
              <span className="text-xs font-mono uppercase tracking-widest text-[var(--text-faint)]">
                Active Session: {sessionId.slice(0, 12)}
              </span>
              <h2 className="font-editorial text-2xl md:text-3xl font-bold text-[var(--text-main)] mt-2">
                "{session?.topic || "Autonomous Research Job"}"
              </h2>
            </div>

            <ProgressTimeline
              stage={progressStage}
              percent={progressPercent}
              message={progressMessage}
              subQueries={subQueries}
              sourcesCount={sourcesCount}
              chunksCount={chunksCount}
              error={error}
            />
          </div>
        )}
      </main>
    </div>
  );
}
