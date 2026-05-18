'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  TrendingUp,
  TrendingDown,
  PieChart,
  Target,
  Sparkles,
  ChevronRight,
  Wallet,
  X,
  Menu,
  LogOut,
} from 'lucide-react';
import { useState } from 'react';
import { useStore } from '@/lib/store';
import { useAuth } from '@/lib/auth';
import { getTotalIncome, getTotalExpenses, getHealthScore, getHealthLabel } from '@/lib/calculations';

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/ganhos', label: 'Ganhos', icon: TrendingUp },
  { href: '/gastos', label: 'Gastos', icon: TrendingDown },
  { href: '/investimentos', label: 'Investimentos', icon: PieChart },
  { href: '/metas', label: 'Metas', icon: Target },
  { href: '/ia', label: 'IA Financeira', icon: Sparkles },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { state } = useStore();
  const { logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const totalIncome = getTotalIncome(state.incomes, state.currentMonth);
  const totalExpenses = getTotalExpenses(state.expenses, state.currentMonth);
  const score = getHealthScore(totalIncome, totalExpenses, state.goals.some((g) => g.type === 'emergencia'));
  const health = getHealthLabel(score);

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-blue-900/30">
        <div className="w-9 h-9 rounded-xl gradient-blue flex items-center justify-center shadow-lg">
          <Wallet className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="text-white font-bold text-base tracking-tight">FinanceIA</div>
          <div className="text-blue-400 text-xs">Personal CFO</div>
        </div>
      </div>

      {/* User Health */}
      <div className="mx-4 my-4 p-4 rounded-xl" style={{ background: 'rgba(30,41,59,0.5)', border: '1px solid rgba(148,163,184,0.1)' }}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-slate-400 text-xs font-medium">Saúde Financeira</span>
          <span className="text-xs font-bold" style={{ color: health.color }}>{health.label}</span>
        </div>
        <div className="progress-bar mb-1">
          <div
            className="progress-fill"
            style={{ width: `${score}%`, background: health.color }}
          />
        </div>
        <div className="text-right text-xs text-slate-500">{score}/100</div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className={`nav-item flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium group ${
                active ? 'active text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Icon className={`w-4.5 h-4.5 ${active ? 'text-blue-400' : 'text-slate-500 group-hover:text-blue-400'}`} size={18} />
              <span>{label}</span>
              {active && <ChevronRight className="ml-auto w-3.5 h-3.5 text-blue-400" size={14} />}
              {label === 'IA Financeira' && !active && (
                <span className="ml-auto badge badge-blue" style={{ fontSize: '10px', padding: '1px 7px' }}>Novo</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="px-4 py-4 border-t border-blue-900/20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full gradient-blue flex items-center justify-center text-white text-xs font-bold shrink-0">
            {state.user.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-slate-200 text-xs font-semibold truncate">{state.user.name}</div>
            <div className="text-slate-500 text-xs capitalize">{state.user.financialProfile}</div>
          </div>
          <button
            onClick={logout}
            title="Sair"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-red-400 hover:bg-red-900/20 transition-colors shrink-0"
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile toggle button */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 w-10 h-10 rounded-xl glass flex items-center justify-center text-white"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X size={18} /> : <Menu size={18} />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <div
        className={`lg:hidden fixed top-0 left-0 h-full w-64 z-40 transition-transform duration-300 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ background: '#0d1425', borderRight: '1px solid rgba(37,99,235,0.15)' }}
      >
        <SidebarContent />
      </div>

      {/* Desktop sidebar */}
      <div
        className="hidden lg:flex flex-col w-64 h-screen sticky top-0 shrink-0"
        style={{ background: '#0d1425', borderRight: '1px solid rgba(37,99,235,0.12)' }}
      >
        <SidebarContent />
      </div>
    </>
  );
}
