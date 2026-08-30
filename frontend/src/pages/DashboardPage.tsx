import { useState, useEffect } from 'react'
import { getSecurityStats, getSecurityEvents } from '../api'
import type { SecurityStats, SecurityEvent } from '../types'

const EVENT_COLORS: Record<string, string> = {
  PROMPT_INJECTION_DETECTED: 'text-red-400',
  TOOL_DENIED: 'text-red-400',
  SENSITIVE_OUTPUT_BLOCKED: 'text-orange-400',
  TOOL_REQUEST: 'text-yellow-400',
  TOOL_ALLOWED: 'text-green-400',
  CHAT_REQUEST: 'text-blue-400',
  DOCUMENT_RETRIEVED: 'text-gray-400',
  BENCHMARK_RUN: 'text-purple-400',
}

const SEVERITY_MAP: Record<string, string> = {
  PROMPT_INJECTION_DETECTED: 'HIGH',
  TOOL_DENIED: 'HIGH',
  SENSITIVE_OUTPUT_BLOCKED: 'MEDIUM',
  TOOL_REQUEST: 'LOW',
  TOOL_ALLOWED: 'LOW',
  CHAT_REQUEST: 'INFO',
  DOCUMENT_RETRIEVED: 'INFO',
}

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
      <div className="text-gray-400 text-sm mb-1">{label}</div>
      <div className="text-white text-3xl font-bold">{value}</div>
      {sub && <div className="text-gray-500 text-xs mt-1">{sub}</div>}
    </div>
  )
}

export default function DashboardPage() {
  const [stats, setStats] = useState<SecurityStats | null>(null)
  const [events, setEvents] = useState<SecurityEvent[]>([])
  const [loading, setLoading] = useState(true)

  async function refresh() {
    try {
      const [s, e] = await Promise.all([getSecurityStats(), getSecurityEvents(50)])
      setStats(s)
      setEvents(e.events)
    } catch (_) {}
    setLoading(false)
  }

  useEffect(() => { refresh() }, [])
  useEffect(() => {
    const id = setInterval(refresh, 5000)
    return () => clearInterval(id)
  }, [])

  if (loading) return <div className="p-8 text-gray-400">Loading...</div>

  return (
    <div className="p-6 overflow-y-auto h-[calc(100vh-56px)]">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-white text-2xl font-bold">Security Dashboard</h1>
          <div className="flex items-center gap-3">
            {stats && (
              <span className={`text-sm font-bold px-3 py-1 rounded-full border ${
                stats.security_mode === 'protected'
                  ? 'bg-green-900/50 text-green-400 border-green-700'
                  : 'bg-red-900/50 text-red-400 border-red-700'
              }`}>
                {stats.security_mode === 'protected' ? '🛡 PROTECTED' : '⚠️ VULNERABLE'}
              </span>
            )}
            <button onClick={refresh} className="text-sm bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-1.5 rounded border border-gray-700">
              Refresh
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatCard label="Total Requests" value={stats?.total_requests ?? 0} />
          <StatCard label="Suspicious Requests" value={stats?.suspicious_requests ?? 0} sub="injection attempts" />
          <StatCard label="Blocked Tool Calls" value={stats?.blocked_tool_calls ?? 0} sub="unauthorized tool use" />
          <StatCard label="Blocked Outputs" value={stats?.blocked_sensitive_outputs ?? 0} sub="data leakage prevented" />
        </div>

        {/* Recent events */}
        <div className="bg-gray-900 rounded-xl border border-gray-800">
          <div className="px-5 py-4 border-b border-gray-800 flex items-center justify-between">
            <h2 className="text-white font-semibold">Recent Security Events</h2>
            <span className="text-gray-500 text-sm">{events.length} events</span>
          </div>
          <div className="divide-y divide-gray-800 max-h-96 overflow-y-auto">
            {events.length === 0 ? (
              <div className="px-5 py-8 text-center text-gray-500 text-sm">No security events yet. Start chatting to generate activity.</div>
            ) : (
              events.slice(0, 50).map((e, i) => (
                <div key={i} className="px-5 py-3 flex items-start gap-4 hover:bg-gray-800/50">
                  <div className={`text-xs font-bold shrink-0 w-16 text-right ${
                    SEVERITY_MAP[e.event_type] === 'HIGH' ? 'text-red-400' :
                    SEVERITY_MAP[e.event_type] === 'MEDIUM' ? 'text-orange-400' :
                    SEVERITY_MAP[e.event_type] === 'LOW' ? 'text-yellow-400' : 'text-gray-500'
                  }`}>
                    [{SEVERITY_MAP[e.event_type] ?? 'INFO'}]
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={`text-sm font-medium ${EVENT_COLORS[e.event_type] ?? 'text-gray-300'}`}>
                      {e.event_type.replace(/_/g, ' ')}
                    </div>
                    <div className="text-gray-500 text-xs">
                      {e.user_id} ({e.role}) • {e.request_id}
                      {e.tool_name && ` • tool: ${e.tool_name}`}
                      {e.reason && ` • ${e.reason.slice(0, 60)}`}
                    </div>
                  </div>
                  <div className="text-gray-600 text-xs shrink-0">
                    {e.timestamp ? new Date(e.timestamp).toLocaleTimeString() : ''}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Defense architecture diagram */}
        <div className="mt-6 bg-gray-900 rounded-xl border border-gray-800 p-5">
          <h2 className="text-white font-semibold mb-4">Defense Architecture</h2>
          <div className="flex flex-col items-center gap-1 text-sm font-mono text-gray-400 text-center">
            {[
              { label: 'USER', color: 'text-blue-400' },
              { label: '↓', color: 'text-gray-600' },
              { label: 'Input Security (Injection Detector)', color: 'text-yellow-400' },
              { label: '↓', color: 'text-gray-600' },
              { label: 'AI Agent (Gemini)', color: 'text-purple-400' },
              { label: '↓', color: 'text-gray-600' },
              { label: 'Tool Authorization (Policy Engine)', color: 'text-orange-400' },
              { label: '↓', color: 'text-gray-600' },
              { label: 'Output Security (Sensitive Data Filter)', color: 'text-red-400' },
              { label: '↓', color: 'text-gray-600' },
              { label: 'USER', color: 'text-blue-400' },
            ].map((item, i) => (
              <div key={i} className={item.color}>{item.label}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
