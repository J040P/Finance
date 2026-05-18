'use client';

import Header from '@/components/Header';
import { useStore } from '@/lib/store';
import {
  getTotalIncome,
  getTotalExpenses,
  getHealthScore,
  getHealthLabel,
  getBudgetAllocations,
  generateInsights,
  formatCurrency,
  getMonthLabel,
  getLast6Months,
  categoryColors,
  categoryLabels,
  getExpensesByCategory,
} from '@/lib/calculations';
import {
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from 'recharts';
import { TrendingUp, TrendingDown, Wallet, Shield, Target, ChevronRight, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import Link from 'next/link';

export default function Dashboard() {
  const { state } = useStore();
  const { incomes, expenses, investments, goals, currentMonth, user } = state;

  const totalIncome = getTotalIncome(incomes, currentMonth);
  const totalExpenses = getTotalExpenses(expenses, currentMonth);
  const balance = totalIncome - totalExpenses;
  const expenseRatio = totalIncome > 0 ? (totalExpenses / totalIncome) * 100 : 0;
  const totalInvested = investments.reduce((s, i) => s + i.amount, 0);

  const hasEmergency = goals.some((g) => g.type === 'emergencia');
  const score = getHealthScore(totalIncome, totalExpenses, hasEmergency);
  const health = getHealthLabel(score);

  const allocations = getBudgetAllocations(totalIncome, expenses, currentMonth, user.financialProfile);
  const insights = generateInsights(state);
  const last6 = getLast6Months();

  const flowData = last6.map((m) => ({
    name: getMonthLabel(m).split('/')[0],
    Receitas: getTotalIncome(incomes, m),
    Gastos: getTotalExpenses(expenses, m),
  }));

  const expByCategory = getExpensesByCategory(expenses, currentMonth);
  const pieData = Object.entries(expByCategory)
    .filter(([, v]) => v > 0)
    .map(([key, value]) => ({
      name: categoryLabels[key] || key,
      value,
      color: categoryColors[key] || '#94a3b8',
    }));

  const metrics = [
    {
      label: 'Renda Total',
      value: formatCurrency(totalIncome),
      icon: TrendingUp,
      color: '#10b981',
      bg: 'rgba(16,185,129,0.12)',
      border: 'rgba(16,185,129,0.25)',
      trend: `${incomes.length} fonte${incomes.length !== 1 ? 's' : ''}`,
      up: true,
    },
    {
      label: 'Total Gastos',
      value: formatCurrency(totalExpenses),
      icon: TrendingDown,
      color: '#ef4444',
      bg: 'rgba(239,68,68,0.12)',
      border: 'rgba(239,68,68,0.25)',
      trend: `${expenses.filter(e => e.month === currentMonth).length} lançamentos`,
      up: false,
    },
    {
      label: 'Saldo Livre',
      value: formatCurrency(balance),
      icon: Wallet,
      color: balance >= 0 ? '#3b82f6' : '#ef4444',
      bg: balance >= 0 ? 'rgba(59,130,246,0.12)' : 'rgba(239,68,68,0.12)',
      border: balance >= 0 ? 'rgba(59,130,246,0.25)' : 'rgba(239,68,68,0.25)',
      trend: `${expenseRatio.toFixed(0)}% comprometido`,
      up: balance >= 0,
    },
    {
      label: 'Patrimônio',
      value: formatCurrency(totalInvested),
      icon: Shield,
      color: '#8b5cf6',
      bg: 'rgba(139,92,246,0.12)',
      border: 'rgba(139,92,246,0.25)',
      trend: `${investments.length} investimento${investments.length !== 1 ? 's' : ''}`,
      up: true,
    },
  ];

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ dataKey: string; color: string; value: number }>; label?: string }) => {
    if (active && payload?.length) {
      return (
        <div style={{ background: '#0d1425', border: '1px solid rgba(37,99,235,0.3)', borderRadius: 8, padding: '10px 14px' }}>
          <p style={{ color: '#94a3b8', fontSize: 12, marginBottom: 6 }}>{label}</p>
          {payload.map((p) => (
            <p key={p.dataKey} style={{ color: p.color, fontSize: 13, fontWeight: 600 }}>
              {p.dataKey}: {formatCurrency(p.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const PieTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ name: string; value: number; payload: { color: string } }> }) => {
    if (active && payload?.length) {
      return (
        <div style={{ background: '#0d1425', border: '1px solid rgba(37,99,235,0.3)', borderRadius: 8, padding: '8px 12px' }}>
          <p style={{ color: '#e2e8f0', fontSize: 13, fontWeight: 600 }}>{payload[0].name}</p>
          <p style={{ color: payload[0].payload.color, fontSize: 13 }}>{formatCurrency(payload[0].value)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <>
      <Header
        title={`Olá, ${user.name} 👋`}
        subtitle={`Visão geral de ${getMonthLabel(currentMonth)}`}
      />

      <div className="flex-1 p-4 lg:p-6 space-y-6 max-w-7xl mx-auto w-full">
        {/* Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {metrics.map((m) => (
            <div
              key={m.label}
              className="metric-card card-hover p-4 lg:p-5"
              style={{ background: m.bg, border: `1px solid ${m.border}` }}
            >
              <div className="flex items-start justify-between mb-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: `${m.color}22` }}
                >
                  <m.icon size={20} color={m.color} />
                </div>
                <span
                  className="flex items-center gap-1 text-xs font-medium"
                  style={{ color: m.up ? '#10b981' : '#ef4444' }}
                >
                  {m.up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                  <span className="hidden sm:inline">{m.trend}</span>
                </span>
              </div>
              <div className="text-lg lg:text-xl font-bold text-white mb-1 truncate">{m.value}</div>
              <div className="text-slate-400 text-xs">{m.label}</div>
            </div>
          ))}
        </div>

        {/* Health + Budget Row */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Health Score */}
          <div className="metric-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold">Saúde Financeira</h3>
              <span
                className="badge"
                style={{ background: `${health.color}22`, color: health.color }}
              >
                {health.label}
              </span>
            </div>
            <div className="flex items-center justify-center mb-5">
              <div className="relative w-28 h-28">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                  <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(30,58,95,0.5)" strokeWidth="10" />
                  <circle
                    cx="50" cy="50" r="40" fill="none"
                    stroke={health.color} strokeWidth="10"
                    strokeDasharray={`${(score / 100) * 251.2} 251.2`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold text-white">{score}</span>
                  <span className="text-xs text-slate-400">/ 100</span>
                </div>
              </div>
            </div>
            <div className="space-y-2.5">
              {[
                { label: 'Comprometimento', value: `${expenseRatio.toFixed(0)}%`, ok: expenseRatio < 75 },
                { label: 'Reserva de Emergência', value: hasEmergency ? 'Sim' : 'Não', ok: hasEmergency },
                { label: 'Investimentos Ativos', value: investments.length > 0 ? `${investments.length} ativos` : 'Nenhum', ok: investments.length > 0 },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <span className="text-slate-400 text-xs">{item.label}</span>
                  <span className={`text-xs font-semibold ${item.ok ? 'text-green-400' : 'text-red-400'}`}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Budget Allocations */}
          <div className="lg:col-span-2 metric-card p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-white font-semibold">Divisão Inteligente do Orçamento</h3>
              <span className="text-slate-400 text-xs capitalize badge badge-blue">{user.financialProfile}</span>
            </div>
            <div className="space-y-4">
              {allocations.map((alloc) => {
                const pct = alloc.amount > 0 ? Math.min((alloc.spent / alloc.amount) * 100, 100) : 0;
                const over = alloc.spent > alloc.amount;
                return (
                  <div key={alloc.category}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-slate-300 text-sm">{alloc.label}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400 text-xs">
                          {formatCurrency(alloc.spent)} / {formatCurrency(alloc.amount)}
                        </span>
                        {over && <span className="badge badge-red" style={{ fontSize: '10px', padding: '1px 6px' }}>Acima</span>}
                      </div>
                    </div>
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{ width: `${pct}%`, background: over ? '#ef4444' : alloc.color }}
                      />
                    </div>
                    <div className="flex justify-between mt-0.5">
                      <span className="text-slate-600 text-xs">{alloc.percentage}% da renda</span>
                      <span className="text-xs" style={{ color: over ? '#ef4444' : '#475569' }}>
                        {pct.toFixed(0)}% utilizado
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3 metric-card p-6">
            <h3 className="text-white font-semibold mb-5">Evolução Financeira — Últimos 6 meses</h3>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={flowData}>
                <defs>
                  <linearGradient id="income-grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="expense-grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="Receitas" stroke="#10b981" strokeWidth={2} fill="url(#income-grad)" />
                <Area type="monotone" dataKey="Gastos" stroke="#ef4444" strokeWidth={2} fill="url(#expense-grad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="lg:col-span-2 metric-card p-6">
            <h3 className="text-white font-semibold mb-4">Gastos por Categoria</h3>
            {pieData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={72} paddingAngle={3} dataKey="value">
                      {pieData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<PieTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2 mt-2">
                  {pieData.slice(0, 4).map((d) => (
                    <div key={d.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ background: d.color }} />
                        <span className="text-slate-400 text-xs">{d.name}</span>
                      </div>
                      <span className="text-slate-200 text-xs font-medium">{formatCurrency(d.value)}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-40 text-slate-500 text-sm">
                Nenhum gasto registrado
              </div>
            )}
          </div>
        </div>

        {/* Insights + Goals Row */}
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="metric-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold">Alertas da IA Financeira</h3>
              <Link href="/ia" className="text-blue-400 text-xs flex items-center gap-1 hover:text-blue-300">
                Ver todos <ChevronRight size={12} />
              </Link>
            </div>
            <div className="space-y-3">
              {insights.slice(0, 3).map((insight) => (
                <div key={insight.id} className={`alert-card alert-${insight.type}`}>
                  <div className="flex items-start gap-2">
                    <span className="text-base mt-0.5">
                      {insight.type === 'danger' ? '🔴' : insight.type === 'warning' ? '🟡' : insight.type === 'success' ? '🟢' : 'ℹ️'}
                    </span>
                    <div>
                      <p className="text-slate-200 text-sm font-semibold">{insight.title}</p>
                      <p className="text-slate-400 text-xs mt-1 leading-relaxed">{insight.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="metric-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold">Metas Financeiras</h3>
              <Link href="/metas" className="text-blue-400 text-xs flex items-center gap-1 hover:text-blue-300">
                Gerenciar <ChevronRight size={12} />
              </Link>
            </div>
            {goals.length > 0 ? (
              <div className="space-y-4">
                {goals.slice(0, 3).map((goal) => {
                  const pct = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
                  return (
                    <div key={goal.id}>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <span>{goal.icon}</span>
                          <span className="text-slate-200 text-sm font-medium">{goal.name}</span>
                        </div>
                        <span className="text-xs font-bold" style={{ color: goal.color }}>{pct.toFixed(0)}%</span>
                      </div>
                      <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${pct}%`, background: goal.color }} />
                      </div>
                      <div className="flex justify-between mt-0.5">
                        <span className="text-slate-500 text-xs">{formatCurrency(goal.currentAmount)}</span>
                        <span className="text-slate-500 text-xs">{formatCurrency(goal.targetAmount)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-36 gap-3">
                <Target size={32} className="text-slate-600" />
                <p className="text-slate-400 text-sm">Nenhuma meta definida ainda</p>
                <Link href="/metas" className="btn-primary text-xs px-4 py-2 rounded-lg">Criar Meta</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
