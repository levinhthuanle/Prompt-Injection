export interface SecurityInfo {
  risk_score: number
  blocked: boolean
  reasons: string[]
  event: string | null
}

export interface ToolUsed {
  tool: string
  status: string
  reason?: string
  result_summary?: string
}

export interface Source {
  title: string
  distance: number
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  security?: SecurityInfo
  tools_used?: ToolUsed[]
  sources?: Source[]
  latency_ms?: number
  timestamp: Date
}

export interface AttackCase {
  id: string
  category: string
  name: string
  prompt: string
  target: string
  severity: string
  description?: string
  expected_blocked?: boolean
}

export interface AttackResult {
  attack_id: string
  category: string
  name: string
  security_mode: string
  result: string
  response: string
  risk_score: number
  blocked: boolean
  latency_ms: number
}

export interface SecurityEvent {
  id: number
  request_id: string
  timestamp: string
  user_id: string
  role: string
  event_type: string
  security_mode: string
  risk_score?: number
  tool_name?: string
  allowed?: string
  reason?: string
}

export interface SecurityStats {
  security_mode: string
  total_requests: number
  suspicious_requests: number
  blocked_tool_calls: number
  blocked_sensitive_outputs: number
}

export interface BenchmarkResult {
  timestamp: string
  model: string
  security_mode: string
  total_cases: number
  successful_attacks: number
  blocked_attacks: number
  safe_responses: number
  errors: number
  attack_success_rate: number
  defense_success_rate: number
  false_positive_rate: number
  average_latency_ms: number
  by_category: Record<string, { total: number; blocked: number; success: number }>
  cases: Array<{
    id: string
    category?: string
    name?: string
    severity?: string
    outcome: string
    risk_score?: number
    latency_ms?: number
    blocked?: boolean
    prompt?: string
    error?: string
  }>
}

export type DemoUser = {
  id: string
  name: string
  role: string
}

export const DEMO_USERS: DemoUser[] = [
  { id: 'STU1001', name: 'Alex Nguyen (STU1001)', role: 'student' },
  { id: 'STU1002', name: 'Minh Tran (STU1002)', role: 'student' },
  { id: 'ADMIN001', name: 'Admin User', role: 'admin' },
]
