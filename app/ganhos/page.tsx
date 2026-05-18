'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import { useStore } from '@/lib/store';
import {
  getTotalIncome,
  formatCurrency,
  getMonthLabel,
  getLast6Months,
  incomeTypeLabels,
} from '@/lib/calculations';
import { IncomeSource } from '@/lib/types';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { Plus, Trash2, TrendingUp, Repeat, DollarSign, X } from 'lucide-react';

const incomeColors: Record<string, string> = {
  salario: '#10b981',
  freela: '#3b82f6',
  comissao: '#f59e0b',
  investimento: '#8b5cf6',
  aluguel: '#06b6d4',
  venda: '#ec4899',
  outro: '#94a3b8',
};

function AddIncomeModal({ onClose, month }: { onClose: () => void; month: string }) {
  const { dispatch } = useStore();
  const [form, setForm] = useState({
    name: '',
    type: 'salario' as IncomeSource['type'],
    amount: '',
    recurring: false,
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.amount) return;
    dispatch({
      type: 'ADD_INCOME',
      payload: {
        id: Date.now().toString(),
        name: form.name,
        type: form.type,
        amount: parseFloat(form.amount),
        recurring: form.recurring,
        month,
      },
    });
    onClose();
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box slide-in" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-white font-bold text-lg">Nova Fonte de Renda</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-slate-400 text-sm mb-1.5">Nome da fonte</label>
            <input
              placeholder="Ex: Salário Empresa X, Freela Design..."
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-slate-400 text-sm mb-1.5">Tipo</label>
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as IncomeSource['type'] })}>
              {Object.entries(incomeTypeLabels).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-slate-400 text-sm mb-1.5">Valor (R$)</label>
            <input
              type="number"
              placeholder="0,00"
              min="0"
              step="0.01"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              required
            />
          </div>
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="recurring"
              checked={form.recurring}
              onChange={(e) => setForm({ ...form, recurring: e.target.checked })}
              style={{ width: 'auto', padding: 0 }}
            />
            <label htmlFor="recurring" className="text-slate-300 text-sm cursor-pointer">
              Renda recorrente (aparece em todos os meses)
            </label>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancelar</button>
            <button type="submit" className="btn-primary flex-1">Adicionar</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function GanhosPage() {
  const { state, dispatch } = useStore();
  const { incomes, currentMonth } = state;
  const [showModal, setShowModal] = useState(false);

  const monthIncomes = incomes.filter((i) => i.month === currentMonth || i.recurring);
  const totalIncome = getTotalIncome(incomes, currentMonth);
  const last6 = getLast6Months();

  const chartData = last6.map((m) => ({
    name: getMonthLabel(m).split('/')[0],
    total: getTotalIncome(incomes, m),
  }));

  const byType = monthIncomes.reduce<Record<string, number>>((acc, i) => {
    acc[i.type] = (acc[i.type] || 0) + i.amount;
    return acc;
  }, {});

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) => {
    if (active && payload?.length) {
      return (
        <div style={{ background: '#0d1425', border: '1px solid rgba(37,99,235,0.3)', borderRadius: 8, padding: '10px 14px' }}>
          <p style={{ color: '#94a3b8', fontSize: 12, marginBottom: 4 }}>{label}</p>
          <p style={{ color: '#10b981', fontSize: 13, fontWeight: 600 }}>{formatCurrency(payload[0].value)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <>
      {showModal && <AddIncomeModal onClose={() => setShowModal(false)} month={currentMonth} />}
      <Header title="Ganhos" subtitle="Gerencie todas as suas fontes de renda" />

      <div className="flex-1 p-4 lg:p-6 space-y-6 max-w-6xl mx-auto w-full">
        {/* Top cards */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="metric-card p-5" style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)' }}>
            <div className="flex items-center gap-2 mb-3">
              <DollarSign size={18} color="#10b981" />
              <span className="text-slate-400 text-sm">Renda Total</span>
            </div>
            <div className="text-2xl font-bold text-white">{formatCurrency(totalIncome)}</div>
            <div className="text-green-400 text-xs mt-1">{getMonthLabel(currentMonth)}</div>
          </div>

          <div className="metric-card p-5" style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.25)' }}>
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp size={18} color="#3b82f6" />
              <span className="text-slate-400 text-sm">Fontes Ativas</span>
            </div>
            <div className="text-2xl font-bold text-white">{monthIncomes.length}</div>
            <div className="text-blue-400 text-xs mt-1">este mês</div>
          </div>

          <div className="metric-card p-5" style={{ background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.25)' }}>
            <div className="flex items-center gap-2 mb-3">
              <Repeat size={18} color="#8b5cf6" />
              <span className="text-slate-400 text-sm">Recorrentes</span>
            </div>
            <div className="text-2xl font-bold text-white">{incomes.filter((i) => i.recurring).length}</div>
            <div className="text-purple-400 text-xs mt-1">fontes fixas</div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Chart */}
          <div className="lg:col-span-2 metric-card p-6">
            <h3 className="text-white font-semibold mb-5">Histórico de Renda</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData}>
                <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="total" radius={[6, 6, 0, 0]}>
                  {chartData.map((_, i) => (
                    <Cell key={i} fill={i === chartData.length - 1 ? '#10b981' : 'rgba(16,185,129,0.4)'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* By type */}
          <div className="metric-card p-6">
            <h3 className="text-white font-semibold mb-4">Por Tipo</h3>
            <div className="space-y-3">
              {Object.entries(byType).map(([type, amount]) => {
                const pct = totalIncome > 0 ? (amount / totalIncome) * 100 : 0;
                return (
                  <div key={type}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-slate-300 text-sm">{incomeTypeLabels[type] || type}</span>
                      <span className="text-slate-200 text-sm font-semibold">{formatCurrency(amount)}</span>
                    </div>
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{ width: `${pct}%`, background: incomeColors[type] || '#94a3b8' }}
                      />
                    </div>
                    <div className="text-slate-500 text-xs mt-0.5">{pct.toFixed(0)}% da renda</div>
                  </div>
                );
              })}
              {Object.keys(byType).length === 0 && (
                <p className="text-slate-500 text-sm">Nenhuma renda registrada</p>
              )}
            </div>
          </div>
        </div>

        {/* List */}
        <div className="metric-card p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-white font-semibold">Fontes de Renda — {getMonthLabel(currentMonth)}</h3>
            <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
              <Plus size={16} /> Adicionar
            </button>
          </div>

          {monthIncomes.length > 0 ? (
            <div className="space-y-3">
              {monthIncomes.map((income) => (
                <div
                  key={income.id}
                  className="flex items-center justify-between p-4 rounded-xl"
                  style={{ background: 'rgba(30,41,59,0.4)', border: '1px solid rgba(148,163,184,0.08)' }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ background: `${incomeColors[income.type] || '#94a3b8'}22` }}
                    >
                      <DollarSign size={18} color={incomeColors[income.type] || '#94a3b8'} />
                    </div>
                    <div>
                      <p className="text-slate-200 text-sm font-semibold">{income.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span
                          className="badge"
                          style={{
                            fontSize: '10px',
                            padding: '1px 7px',
                            background: `${incomeColors[income.type] || '#94a3b8'}22`,
                            color: incomeColors[income.type] || '#94a3b8',
                          }}
                        >
                          {incomeTypeLabels[income.type] || income.type}
                        </span>
                        {income.recurring && (
                          <span className="badge badge-purple" style={{ fontSize: '10px', padding: '1px 7px' }}>Recorrente</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-green-400 font-bold text-base">{formatCurrency(income.amount)}</span>
                    <button
                      onClick={() => dispatch({ type: 'REMOVE_INCOME', payload: income.id })}
                      className="btn-danger p-2 rounded-lg"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <TrendingUp size={40} className="text-slate-600" />
              <p className="text-slate-400">Nenhuma renda registrada para este mês</p>
              <button onClick={() => setShowModal(true)} className="btn-primary">Adicionar Renda</button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
