import React, { useState, useEffect } from 'react'
import { runBenchmark, getBenchmarkResults } from '../api'
import type { BenchmarkResult } from '../types'

const OUTCOME_COLORS: Record<string, string> = {
  BLOCKED: 'text-green-400',
  SAFE_RESPONSE: 'text-blue-400',
  SUCCESS: 'text-red-400',
  ERROR: 'text-gray-400',
  INCONCLUSIVE: 'text-yellow-400',
}

const SEVERITY_COLORS: Record<string, string> = {
  critical: 'text-red-400',
  high: 'text-orange-400',
  medium: 'text-yellow-400',
  low: 'text-blue-400',
}

function MetricCard({ label, value, sub, accent }: { label: string; value: string; sub?: string; accent?: string }) {
  return (
    <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
      <div className="text-gray-400 text-sm mb-1">{label}</div>
      <div className={`text-3xl font-bold ${accent ?? 'text-white'}`}>{value}</div>
      {sub && <div className="text-gray-500 text-xs mt-1">{sub}</div>}
    </div>
  )
}

export default function BenchmarkPage() {
  const [result, setResult] = useState<BenchmarkResult | null>(null)
  const [running, setRunning] = useState(false)
  const [mode, setMode] = useState<'protected' | 'vulnerable'>('protected')
  const [maxCases, setMaxCases] = useState<number | undefined>(undefined)
  const [progress, setProgress] = useState('')
  const [expandedCase, setExpandedCase] = useState<number | null>(null)

  useEffect(() => {
    getBenchmarkResults().then(r => { if (r && r.total_cases) setResult(r) })
  }, [])

  async function handleRun() {
    setRunning(true)
    setProgress(`Running benchmark in ${mode} mode...`)
    try {
      const r = await runBenchmark(mode, maxCases)
      setResult(r)
    } catch (e) {
      setProgress(`Error: ${e instanceof Error ? e.message : 'Unknown error'}`)
    } finally {
      setRunning(false)
      setProgress('')
    }
  }

  return (
    <div className="p-6 overflow-y-auto h-[calc(100vh-56px)]">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-white text-2xl font-bold">Benchmark</h1>
          <div className="flex items-center gap-3">
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
            <input
              type="number"
              placeholder="Max cases"
              value={maxCases ?? ''}
              onChange={e => setMaxCases(e.target.value ? Number(e.target.value) : undefined)}
              className="bg-gray-800 text-white text-sm rounded px-3 py-1.5 border border-gray-700 w-28"
            />
            <button
              onClick={handleRun}
              disabled={running}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-5 py-2 rounded-lg font-medium text-sm"
            >
              {running ? 'Running...' : '▶ Run Benchmark'}
            </button>
          </div>
        </div>

        {progress && (
          <div className="mb-4 bg-blue-900/30 border border-blue-800 text-blue-300 px-4 py-3 rounded-lg text-sm animate-pulse">
            {progress}
          </div>
        )}

        {result && (
          <>
            {/* Summary metrics */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
              <MetricCard label="Total Cases" value={String(result.total_cases)} />
              <MetricCard label="Successful Attacks" value={String(result.successful_attacks)} accent="text-red-400" />
              <MetricCard label="Blocked" value={String(result.blocked_attacks + result.safe_responses)} accent="text-green-400" />
              <MetricCard
                label="Attack Success Rate"
                value={`${(result.attack_success_rate * 100).toFixed(1)}%`}
                sub="lower is better"
                accent={result.attack_success_rate < 0.2 ? 'text-green-400' : result.attack_success_rate < 0.5 ? 'text-yellow-400' : 'text-red-400'}
              />
              <MetricCard
                label="Defense Rate"
                value={`${(result.defense_success_rate * 100).toFixed(1)}%`}
                sub="higher is better"
                accent={result.defense_success_rate > 0.8 ? 'text-green-400' : 'text-yellow-400'}
              />
              <MetricCard label="Avg Latency" value={`${result.average_latency_ms.toFixed(0)}ms`} />
            </div>

            {/* Summary info */}
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-4 mb-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div><span className="text-gray-400">Mode: </span><span className="text-white font-medium">{result.security_mode.toUpperCase()}</span></div>
                <div><span className="text-gray-400">Model: </span><span className="text-white font-medium">{result.model}</span></div>
                <div><span className="text-gray-400">FP Rate: </span><span className="text-white font-medium">{(result.false_positive_rate * 100).toFixed(1)}%</span></div>
                <div><span className="text-gray-400">Errors: </span><span className="text-white font-medium">{result.errors}</span></div>
              </div>
              <div className="mt-2 text-xs text-gray-500">Run at {new Date(result.timestamp).toLocaleString()}</div>
            </div>

            {/* Category breakdown */}
            {Object.keys(result.by_category).length > 0 && (
              <div className="bg-gray-900 rounded-xl border border-gray-800 mb-6">
                <div className="px-5 py-4 border-b border-gray-800">
                  <h2 className="text-white font-semibold">By Category</h2>
                </div>
                <div className="divide-y divide-gray-800">
                  {Object.entries(result.by_category).map(([cat, data]) => (
                    <div key={cat} className="px-5 py-3 flex items-center gap-4">
                      <div className="text-white font-medium w-40">{cat.replace('_', ' ')}</div>
                      <div className="flex-1 bg-gray-800 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-green-500 h-full rounded-full"
                          style={{ width: `${(data.blocked / data.total) * 100}%` }}
                        />
                      </div>
                      <div className="text-gray-400 text-sm w-32 text-right">
                        {data.blocked}/{data.total} blocked ({data.total > 0 ? Math.round((data.blocked / data.total) * 100) : 0}%)
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Cases table */}
            {result.cases && result.cases.length > 0 && (
              <div className="bg-gray-900 rounded-xl border border-gray-800">
                <div className="px-5 py-4 border-b border-gray-800">
                  <h2 className="text-white font-semibold">Case Results ({result.cases.length})</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-800 text-gray-400 text-xs">
                        <th className="px-4 py-3 text-left">ID</th>
                        <th className="px-4 py-3 text-left">Name</th>
                        <th className="px-4 py-3 text-left">Category</th>
                        <th className="px-4 py-3 text-left">Severity</th>
                        <th className="px-4 py-3 text-left">Outcome</th>
                        <th className="px-4 py-3 text-right">Risk Score</th>
                        <th className="px-4 py-3 text-right">Latency</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                      {result.cases.map((c, i) => (
                        <React.Fragment key={i}>
                          <tr
                            className="hover:bg-gray-800/50 cursor-pointer"
                            onClick={() => setExpandedCase(expandedCase === i ? null : i)}
                          >
                            <td className="px-4 py-2 text-gray-300 font-mono text-xs">{c.id}</td>
                            <td className="px-4 py-2 text-gray-300 text-xs">{c.name ?? '—'}</td>
                            <td className="px-4 py-2 text-gray-400">{c.category}</td>
                            <td className={`px-4 py-2 font-medium ${SEVERITY_COLORS[c.severity ?? ''] ?? 'text-gray-400'}`}>{c.severity}</td>
                            <td className={`px-4 py-2 font-bold ${OUTCOME_COLORS[c.outcome] ?? 'text-gray-400'}`}>{c.outcome}</td>
                            <td className="px-4 py-2 text-right text-gray-300">{c.risk_score?.toFixed(2) ?? '—'}</td>
                            <td className="px-4 py-2 text-right text-gray-400">{c.latency_ms ? `${c.latency_ms}ms` : '—'}</td>
                          </tr>
                          {expandedCase === i && (
                            <tr className="bg-gray-800/30">
                              <td colSpan={7} className="px-4 py-3">
                                <div className="text-xs text-gray-400 mb-1 font-semibold uppercase tracking-wide">Prompt</div>
                                <pre className="text-xs text-gray-200 whitespace-pre-wrap font-mono bg-gray-900 rounded p-3 border border-gray-700">
                                  {c.prompt ?? '(not available — re-run benchmark to capture prompts)'}
                                </pre>
                                {c.error && (
                                  <div className="mt-2 text-xs text-red-400 bg-red-900/20 rounded p-2 border border-red-800">
                                    Error: {c.error}
                                  </div>
                                )}
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}

        {!result && !running && (
          <div className="text-center mt-20 text-gray-500">
            <div className="text-4xl mb-4">📊</div>
            <p>Click "Run Benchmark" to evaluate attack success rates</p>
            <p className="text-xs mt-2">This will run all attack cases and measure defense effectiveness</p>
          </div>
        )}
      </div>
    </div>
  )
}
