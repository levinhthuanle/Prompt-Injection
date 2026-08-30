import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom'
import ChatPage from './pages/ChatPage'
import AttackLabPage from './pages/AttackLabPage'
import DashboardPage from './pages/DashboardPage'
import BenchmarkPage from './pages/BenchmarkPage'

function NavItem({ to, label }: { to: string; label: string }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `px-4 py-2 rounded-md text-sm font-medium transition-colors ${
          isActive
            ? 'bg-blue-600 text-white'
            : 'text-gray-300 hover:bg-gray-700 hover:text-white'
        }`
      }
    >
      {label}
    </NavLink>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-950 flex flex-col">
        <nav className="bg-gray-900 border-b border-gray-800 px-6 py-3 flex items-center gap-4">
          <div className="flex items-center gap-2 mr-6">
            <span className="text-blue-400 text-xl font-bold">🛡</span>
            <span className="text-white font-bold text-lg">UniGuard AI</span>
          </div>
          <NavItem to="/" label="Chat" />
          <NavItem to="/attack-lab" label="Attack Lab" />
          <NavItem to="/dashboard" label="Security Dashboard" />
          <NavItem to="/benchmark" label="Benchmark" />
        </nav>
        <main className="flex-1 overflow-hidden">
          <Routes>
            <Route path="/" element={<ChatPage />} />
            <Route path="/attack-lab" element={<AttackLabPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/benchmark" element={<BenchmarkPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}
