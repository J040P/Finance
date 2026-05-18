'use client';

import { Bell, ChevronDown } from 'lucide-react';
import { useStore } from '@/lib/store';
import { generateInsights, getMonthLabel, getTotalIncome, getTotalExpenses } from '@/lib/calculations';
import { useState } from 'react';

const MONTHS = Array.from({ length: 12 }, (_, i) => {
  const now = new Date();
  const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
  return d.toISOString().slice(0, 7);
});

export default function Header({ title, subtitle }: { title: string; subtitle?: string }) {
  const { state, dispatch } = useStore();
  const [showNotif, setShowNotif] = useState(false);
  const insights = generateInsights(state);
  const warnings = insights.filter((i) => i.type === 'warning' || i.type === 'danger');

  const totalIncome = getTotalIncome(state.incomes, state.currentMonth);
  const totalExpenses = getTotalExpenses(state.expenses, state.currentMonth);
  const balance = totalIncome - totalExpenses;

  return (
    <header
      className="sticky top-0 z-30 flex items-center gap-4 px-6 py-4"
      style={{
        background: 'rgba(10,15,30,0.95)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(37,99,235,0.1)',
      }}
    >
      <div className="flex-1 min-w-0 lg:pl-0 pl-10">
        <h1 className="text-white font-bold text-lg leading-tight">{title}</h1>
        {subtitle && <p className="text-slate-400 text-sm mt-0.5">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-3">
        {/* Month selector */}
        <div className="relative">
          <select
            value={state.currentMonth}
            onChange={(e) => dispatch({ type: 'SET_MONTH', payload: e.target.value })}
            className="text-sm pr-8 appearance-none"
            style={{ width: 'auto', padding: '7px 32px 7px 12px' }}
          >
            {MONTHS.map((m) => (
              <option key={m} value={m}>{getMonthLabel(m)}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" size={14} />
        </div>

        {/* Balance pill */}
        <div
          className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-semibold"
          style={{
            background: balance >= 0 ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
            color: balance >= 0 ? '#10b981' : '#ef4444',
            border: `1px solid ${balance >= 0 ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
          }}
        >
          <span>{balance >= 0 ? '+' : ''}{balance.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotif(!showNotif)}
            className="relative w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-white"
            style={{ background: 'rgba(30,41,59,0.6)', border: '1px solid rgba(148,163,184,0.1)' }}
          >
            <Bell size={16} />
            {warnings.length > 0 && (
              <span
                className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-white flex items-center justify-center text-xs font-bold"
                style={{ background: '#ef4444', fontSize: '10px' }}
              >
                {warnings.length}
              </span>
            )}
          </button>

          {showNotif && (
            <div
              className="absolute right-0 top-12 w-80 rounded-xl shadow-2xl z-50 overflow-hidden"
              style={{ background: '#0d1425', border: '1px solid rgba(37,99,235,0.3)' }}
            >
              <div className="px-4 py-3 border-b border-blue-900/30">
                <span className="text-white font-semibold text-sm">Alertas Financeiros</span>
              </div>
              <div className="max-h-72 overflow-y-auto">
                {insights.slice(0, 4).map((insight) => (
                  <div
                    key={insight.id}
                    className="px-4 py-3 border-b border-blue-900/20 hover:bg-blue-900/10 cursor-pointer"
                  >
                    <div className="flex items-start gap-2">
                      <span className="text-sm">
                        {insight.type === 'danger' ? '🔴' : insight.type === 'warning' ? '🟡' : insight.type === 'success' ? '🟢' : 'ℹ️'}
                      </span>
                      <div>
                        <p className="text-slate-200 text-xs font-semibold">{insight.title}</p>
                        <p className="text-slate-400 text-xs mt-0.5 line-clamp-2">{insight.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
                {insights.length === 0 && (
                  <div className="px-4 py-6 text-center text-slate-400 text-sm">Nenhum alerta no momento</div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
