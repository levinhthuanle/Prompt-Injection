import { useState, useEffect } from 'react'
import { getAttacks, runAttack } from '../api'
import type { AttackCase, AttackResult } from '../types'

const CATEGORIES = ['all', 'direct', 'indirect', 'tool_hijacking', 'data_exfiltration', 'multi_turn', 'obfuscated']

const SEVERITY_COLORS: Record<string, string> = {
  critical: 'text-red-400 bg-red-900/30 border-red-700',
  high: 'text-orange-400 bg-orange-900/30 border-orange-700',
  medium: 'text-yellow-400 bg-yellow-900/30 border-yellow-700',
  low: 'text-blue-400 bg-blue-900/30 border-blue-700',
}

const OUTCOME_COLORS: Record<string, string> = {
  BLOCKED: 'text-green-400',
  SUCCESS: 'text-red-400',
  SAFE_RESPONSE: 'text-blue-400',
  ERROR: 'text-gray-400',
}

export default function AttackLabPage() {
  const [attacks, setAttacks] = useState<AttackCase[]>([])
  const [category, setCategory] = useState('all')
  const [selected, setSelected] = useState<AttackCase | null>(null)
  const [mode, setMode] = useState<'protected' | 'vulnerable'>('protected')
  const [running, setRunning] = useState(false)
  const [result, setResult] = useState<AttackResult | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getAttacks().then(r => { setAttacks(r.attacks); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  const filtered = category === 'all' ? attacks : attacks.filter(a => a.category === category)

  async function handleRun() {
    if (!selected) return
    setRunning(true)
    setResult(null)
    try {
      const r = await runAttack(selected.id, mode)
      setResult(r)
    } catch (e) {
      console.error(e)
    } finally {
      setRunning(false)
    }
  }

  return (
    <div className="flex h-[calc(100vh-56px)]">
      {/* Left panel — attack list */}
      <div className="w-80 bg-gray-900 border-r border-gray-800 flex flex-col">
        <div className="p-4 border-b border-gray-800">
          <h2 className="text-white font-bold text-lg mb-3">Attack Lab</h2>
          <select
            value={category}
            onChange={e => setCategory(e.target.value)}
            className="w-full bg-gray-800 text-white text-sm rounded px-2 py-2 border border-gray-700"
          >
            {CATEGORIES.map(c => <option key={c} value={c}>{c === 'all' ? 'All Categories' : c.replace('_', ' ')}</option>)}
          </select>
        </div>
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-gray-400 text-sm">Loading...</div>
          ) : (
            filtered.map(a => (
              <button
                key={a.id}
                onClick={() => { setSelected(a); setResult(null) }}
                className={`w-full text-left px-4 py-3 border-b border-gray-800 hover:bg-gray-800 transition-colors ${selected?.id === a.id ? 'bg-gray-800 border-l-2 border-l-blue-500' : ''}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-white text-sm font-medium truncate">{a.name}</div>
                    <div className="text-gray-500 text-xs">{a.id}</div>
                  </div>
                  <span className={`text-xs px-1.5 py-0.5 rounded border shrink-0 ${SEVERITY_COLORS[a.severity] || 'text-gray-400'}`}>
                    {a.severity}
                  </span>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Right panel — attack detail */}
      <div className="flex-1 overflow-y-auto p-6">
        {!selected ? (
          <div className="text-center mt-20 text-gray-500">
            <div className="text-4xl mb-4">⚔️</div>
            <p>Select an attack from the left panel</p>
          </div>
        ) : (
          <div className="max-w-2xl">
            <div className="flex items-center gap-3 mb-6">
              <h1 className="text-white text-2xl font-bold">{selected.name}</h1>
              <span className={`text-sm px-2 py-1 rounded border ${SEVERITY_COLORS[selected.severity] || 'text-gray-400'}`}>
                {selected.severity}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-900 rounded-lg p-4">
                <div className="text-gray-400 text-xs mb-1">Category</div>
                <div className="text-white font-medium">{selected.category.replace('_', ' ')}</div>
              </div>
              <div className="bg-gray-900 rounded-lg p-4">
                <div className="text-gray-400 text-xs mb-1">Target</div>
                <div className="text-white font-medium">{selected.target}</div>
              </div>
            </div>

            {selected.description && (
              <div className="bg-gray-900 rounded-lg p-4 mb-4">
                <div className="text-gray-400 text-xs mb-1">Description</div>
                <div className="text-gray-200 text-sm">{selected.description}</div>
              </div>
            )}

            <div className="bg-gray-900 rounded-lg p-4 mb-6">
              <div className="text-gray-400 text-xs mb-2">Attack Prompt</div>
              <div className="text-yellow-300 text-sm font-mono bg-gray-950 rounded p-3">{selected.prompt}</div>
            </div>

            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center gap-2">
                <span className="text-gray-400 text-sm">Mode:</span>
                <button
                  onClick={() => setMode(m => m === 'protected' ? 'vulnerable' : 'protected')}
                  className={`text-sm font-bold px-3 py-1.5 rounded-full border ${
                    mode === 'protected'
                      ? 'bg-green-900/50 text-green-400 border-green-700'
                      : 'bg-red-900/50 text-red-400 border-red-700'
                  }`}
                >
                  {mode === 'protected' ? '🛡 PROTECTED' : '⚠️ VULNERABLE'}
                </button>
              </div>
              <button
                onClick={handleRun}
                disabled={running}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-2.5 rounded-lg font-medium text-sm"
              >
                {running ? 'Running...' : '▶ Run Attack'}
              </button>
            </div>

            {result && (
              <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-gray-400 text-sm font-medium">Result</div>
                  <div className={`font-bold text-lg ${OUTCOME_COLORS[result.result] || 'text-gray-400'}`}>
                    {result.result === 'BLOCKED' ? '✅ BLOCKED' : result.result === 'SUCCESS' ? '🔴 SUCCESS' : result.result}
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3 mb-4 text-center">
                  <div className="bg-gray-800 rounded p-2">
                    <div className="text-gray-400 text-xs">Mode</div>
                    <div className="text-white text-sm font-bold">{result.security_mode.toUpperCase()}</div>
                  </div>
                  <div className="bg-gray-800 rounded p-2">
                    <div className="text-gray-400 text-xs">Risk Score</div>
                    <div className="text-white text-sm font-bold">{result.risk_score.toFixed(2)}</div>
                  </div>
                  <div className="bg-gray-800 rounded p-2">
                    <div className="text-gray-400 text-xs">Latency</div>
                    <div className="text-white text-sm font-bold">{result.latency_ms}ms</div>
                  </div>
                </div>
                <div className="text-gray-400 text-xs mb-1">AI Response</div>
                <div className="bg-gray-950 rounded p-3 text-gray-200 text-sm whitespace-pre-wrap">{result.response}</div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
