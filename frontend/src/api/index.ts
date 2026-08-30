import type { AttackCase, AttackResult, BenchmarkResult, SecurityEvent, SecurityStats } from '../types'

const BASE = '/api'

function headers(userId: string, role: string): HeadersInit {
  return {
    'Content-Type': 'application/json',
    'X-Demo-User-ID': userId,
    'X-Demo-Role': role,
  }
}

export async function sendChat(
  message: string,
  userId: string,
  role: string,
  history?: Array<{ role: string; content: string }>,
) {
  const res = await fetch(`${BASE}/chat`, {
    method: 'POST',
    headers: headers(userId, role),
    body: JSON.stringify({ message, conversation_id: 'demo', history }),
  })
  if (!res.ok) throw new Error(`Chat failed: ${res.status}`)
  return res.json()
}

export async function getAttacks(): Promise<{ attacks: AttackCase[]; count: number }> {
  const res = await fetch(`${BASE}/attacks`)
  if (!res.ok) throw new Error('Failed to load attacks')
  return res.json()
}

export async function runAttack(
  attackId: string,
  securityMode: string,
  userId = 'STU1001',
  userRole = 'student',
): Promise<AttackResult> {
  const res = await fetch(`${BASE}/attacks/run`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ attack_id: attackId, security_mode: securityMode, user_id: userId, user_role: userRole }),
  })
  if (!res.ok) throw new Error('Attack run failed')
  return res.json()
}

export async function runBenchmark(securityMode: string, maxCases?: number): Promise<BenchmarkResult> {
  const res = await fetch(`${BASE}/benchmark/run`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ security_mode: securityMode, max_cases: maxCases }),
  })
  if (!res.ok) throw new Error('Benchmark failed')
  return res.json()
}

export async function getBenchmarkResults(): Promise<BenchmarkResult | null> {
  const res = await fetch(`${BASE}/benchmark/results`)
  if (!res.ok) return null
  return res.json()
}

export async function getSecurityEvents(limit = 50): Promise<{ events: SecurityEvent[]; count: number }> {
  const res = await fetch(`${BASE}/security/events?limit=${limit}`)
  if (!res.ok) throw new Error('Failed to get security events')
  return res.json()
}

export async function getSecurityStats(): Promise<SecurityStats> {
  const res = await fetch(`${BASE}/security/stats`)
  if (!res.ok) throw new Error('Failed to get security stats')
  return res.json()
}

export async function getHealth() {
  const res = await fetch('/health')
  if (!res.ok) return null
  return res.json()
}
