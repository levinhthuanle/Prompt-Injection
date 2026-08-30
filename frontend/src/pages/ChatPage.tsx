import { useState, useRef, useEffect } from 'react'
import { sendChat } from '../api'
import type { ChatMessage, DemoUser } from '../types'
import { DEMO_USERS } from '../types'

const SUGGESTED = [
  'What courses are available in Computer Science?',
  'What is the library borrowing policy?',
  'What are the exam rules?',
  'Tell me about the cybersecurity program.',
  'How do I appeal a grade?',
]

function SecurityBadge({ score, blocked, reasons }: { score: number; blocked: boolean; reasons: string[] }) {
  if (blocked) {
    return (
      <div className="mt-2 flex items-center gap-2 text-xs text-red-400 bg-red-900/30 border border-red-800 rounded px-2 py-1">
        <span>🚫 Blocked</span>
        {reasons.length > 0 && <span className="text-red-300">• {reasons.join(', ')}</span>}
      </div>
    )
  }
  if (score > 0.3) {
    return (
      <div className="mt-2 flex items-center gap-2 text-xs text-yellow-400 bg-yellow-900/30 border border-yellow-800 rounded px-2 py-1">
        <span>⚠️ Suspicious (score: {score.toFixed(2)})</span>
        {reasons.length > 0 && <span className="text-yellow-300">• {reasons.join(', ')}</span>}
      </div>
    )
  }
  return null
}

function Message({ msg }: { msg: ChatMessage }) {
  const isUser = msg.role === 'user'
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-2xl rounded-xl px-4 py-3 ${isUser ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-100'}`}>
        <p className="whitespace-pre-wrap text-sm">{msg.content}</p>
        {msg.security && (
          <SecurityBadge score={msg.security.risk_score} blocked={msg.security.blocked} reasons={msg.security.reasons} />
        )}
        {msg.tools_used && msg.tools_used.length > 0 && (
          <div className="mt-2 text-xs text-gray-400">
            {msg.tools_used.map((t, i) => (
              <span key={i} className={`mr-2 ${t.status === 'denied' ? 'text-red-400' : 'text-green-400'}`}>
                🔧 {t.tool}: {t.status}
                {t.status === 'denied' && t.reason ? ` (${t.reason.slice(0, 60)}...)` : ''}
              </span>
            ))}
          </div>
        )}
        {msg.sources && msg.sources.length > 0 && (
          <div className="mt-1 text-xs text-gray-500">
            📄 Sources: {msg.sources.map(s => s.title).join(', ')}
          </div>
        )}
        {msg.latency_ms !== undefined && (
          <div className="mt-1 text-xs text-gray-600">{msg.latency_ms}ms</div>
        )}
      </div>
    </div>
  )
}

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [currentUser, setCurrentUser] = useState<DemoUser>(DEMO_USERS[0])
  const [securityMode, setSecurityMode] = useState<'protected' | 'vulnerable'>('protected')
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function handleSend(text?: string) {
    const msg = (text ?? input).trim()
    if (!msg || loading) return

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: msg,
      timestamp: new Date(),
    }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const history = messages.map(m => ({ role: m.role, content: m.content }))
      const res = await sendChat(msg, currentUser.id, currentUser.role, history)
      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: res.response,
        security: res.security,
        tools_used: res.tools_used,
        sources: res.sources,
        latency_ms: res.latency_ms,
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, aiMsg])
    } catch (e: unknown) {
      const errMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Error: ${e instanceof Error ? e.message : 'Unknown error'}`,
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, errMsg])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-56px)]">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800 px-6 py-3 flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-gray-400 text-sm">User:</span>
          <select
            value={currentUser.id}
            onChange={e => setCurrentUser(DEMO_USERS.find(u => u.id === e.target.value)!)}
            className="bg-gray-800 text-white text-sm rounded px-2 py-1 border border-gray-700"
          >
            {DEMO_USERS.map(u => (
              <option key={u.id} value={u.id}>{u.name}</option>
            ))}
          </select>
          <span className="text-xs text-gray-500">({currentUser.role})</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-400 text-sm">Security:</span>
          <button
            onClick={() => setSecurityMode(m => m === 'protected' ? 'vulnerable' : 'protected')}
            className={`text-xs font-bold px-3 py-1 rounded-full border ${
              securityMode === 'protected'
                ? 'bg-green-900/50 text-green-400 border-green-700'
                : 'bg-red-900/50 text-red-400 border-red-700'
            }`}
          >
            {securityMode === 'protected' ? '🛡 PROTECTED' : '⚠️ VULNERABLE'}
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {messages.length === 0 && (
          <div className="text-center mt-12">
            <div className="text-5xl mb-4">🛡</div>
            <h2 className="text-2xl font-bold text-white mb-2">UniGuard AI</h2>
            <p className="text-gray-400 mb-6">University AI Assistant with Security Controls</p>
            <div className="flex flex-wrap justify-center gap-2">
              {SUGGESTED.map(s => (
                <button
                  key={s}
                  onClick={() => handleSend(s)}
                  className="text-sm bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-2 rounded-lg border border-gray-700"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map(m => <Message key={m.id} msg={m} />)}
        {loading && (
          <div className="flex justify-start mb-4">
            <div className="bg-gray-800 rounded-xl px-4 py-3 text-gray-400 text-sm">
              <span className="animate-pulse">Thinking...</span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="bg-gray-900 border-t border-gray-800 px-6 py-4">
        <div className="flex gap-3 max-w-4xl mx-auto">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder="Type your message..."
            className="flex-1 bg-gray-800 text-white rounded-lg px-4 py-3 border border-gray-700 focus:outline-none focus:border-blue-500 text-sm"
          />
          <button
            onClick={() => handleSend()}
            disabled={loading || !input.trim()}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-6 py-3 rounded-lg font-medium text-sm transition-colors"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  )
}
