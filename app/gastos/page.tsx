'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import { useStore } from '@/lib/store';
import {
  getTotalIncome,
  getTotalExpenses,
  formatCurrency,
  getMonthLabel,
  getLast6Months,
  categoryLabels,
  categoryColors,
  getExpensesByCategory,
} from '@/lib/calculations';
import { Expense, ExpenseCategory } from '@/lib/types';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
} from 'recharts';
import { Plus, Trash2, AlertTriangle, TrendingDown, X } from 'lucide-react';

function AddExpenseModal({ onClose, month }: { onClose: () => void; month: string }) {
  const { dispatch } = useStore();
  const [form, setForm] = useState({
    name: '',
    category: 'alimentacao' as ExpenseCategory,
    amount: '',
    type: 'variavel' as 'fixo' | 'variavel',
    notes: '',
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.amount) return;
    dispatch({
      type: 'ADD_EXPENSE',
      payload: {
        id: Date.now().toString(),
        name: form.name,
        category: form.category,
        amount: parseFloat(form.amount),
        type: form.type,
        month,
        notes: form.notes,
      },
    });
    onClose();
  }

  const categories: ExpenseCategory[] = [
    'moradia', 'alimentacao', 'transporte', 'saude', 'educacao',
    'lazer', 'vestuario', 'tecnologia', 'assinaturas', 'dividas', 'outros',
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box slide-in" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-white font-bold text-lg">Novo Gasto</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-slate-400 text-sm mb-1.5">Descrição</label>
            <input
              placeholder="Ex: Supermercado, Conta de Luz..."
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 text-sm mb-1.5">Categoria</label>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as ExpenseCategory })}>
                {categories.map((c) => (
                  <option key={c} value={c}>{categoryLabels[c]}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-slate-400 text-sm mb-1.5">Tipo</label>
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as 'fixo' | 'variavel' })}>
                <option value="fixo">Fixo</option>
                <option value="variavel">Variável</option>
              </select>
            </div>
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
          <div>
            <label className="block text-slate-400 text-sm mb-1.5">Observações (opcional)</label>
            <textarea
              placeholder="Detalhes adicionais..."
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={2}
              style={{ resize: 'none' }}
            />
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

export default function GastosPage() {
  const { state, dispatch } = useStore();
  const { expenses, incomes, currentMonth } = state;
  const [showModal, setShowModal] = useState(false);
  const [filterType, setFilterType] = useState<'todos' | 'fixo' | 'variavel'>('todos');
  const [filterCategory, setFilterCategory] = useState<string>('todas');

  const monthExpenses = expenses.filter((e) => e.month === currentMonth);
  const totalIncome = getTotalIncome(incomes, currentMonth);
  const totalExpenses = getTotalExpenses(expenses, currentMonth);
  const fixedTotal = monthExpenses.filter((e) => e.type === 'fixo').reduce((s, e) => s + e.amount, 0);
  const variableTotal = monthExpenses.filter((e) => e.type === 'variavel').reduce((s, e) => s + e.amount, 0);
  const expenseRatio = totalIncome > 0 ? (totalExpenses / totalIncome) * 100 : 0;

  const last6 = getLast6Months();
  const historyData = last6.map((m) => ({
    name: getMonthLabel(m).split('/')[0],
    Gastos: getTotalExpenses(expenses, m),
  }));

  const expByCategory = getExpensesByCategory(expenses, currentMonth);
  const pieData = Object.entries(expByCategory)
    .filter(([, v]) => v > 0)
    .map(([key, value]) => ({
      name: categoryLabels[key] || key,
      value,
      color: categoryColors[key] || '#94a3b8',
    }))
    .sort((a, b) => b.value - a.value);

  const filtered = monthExpenses.filter((e) => {
    if (filterType !== 'todos' && e.type !== filterType) return false;
    if (filterCategory !== 'todas' && e.category !== filterCategory) return false;
    return true;
  });

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) => {
    if (active && payload?.length) {
      return (
        <div style={{ background: '#0d1425', border: '1px solid rgba(37,99,235,0.3)', borderRadius: 8, padding: '10px 14px' }}>
          <p style={{ color: '#94a3b8', fontSize: 12, marginBottom: 4 }}>{label}</p>
          <p style={{ color: '#ef4444', fontSize: 13, fontWeight: 600 }}>{formatCurrency(payload[0].value)}</p>
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
      {showModal && <AddExpenseModal onClose={() => setShowModal(false)} month={currentMonth} />}
      <Header title="Gastos" subtitle="Controle todos os seus lançamentos" />

      <div className="flex-1 p-4 lg:p-6 space-y-6 max-w-6xl mx-auto w-full">
        {/* Summary cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Gastos', value: totalExpenses, color: '#ef4444', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.25)' },
            { label: 'Gastos Fixos', value: fixedTotal, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.25)' },
            { label: 'Gastos Variáveis', value: variableTotal, color: '#3b82f6', bg: 'rgba(59,130,246,0.1)', border: 'rgba(59,130,246,0.25)' },
            {
              label: '% Comprometido',
              value: null,
              display: `${expenseRatio.toFixed(0)}%`,
              color: expenseRatio > 80 ? '#ef4444' : expenseRatio > 65 ? '#f59e0b' : '#10b981',
              bg: expenseRatio > 80 ? 'rgba(239,68,68,0.1)' : expenseRatio > 65 ? 'rgba(245,158,11,0.1)' : 'rgba(16,185,129,0.1)',
              border: expenseRatio > 80 ? 'rgba(239,68,68,0.25)' : expenseRatio > 65 ? 'rgba(245,158,11,0.25)' : 'rgba(16,185,129,0.25)',
            },
          ].map((m) => (
            <div key={m.label} className="metric-card p-4" style={{ background: m.bg, border: `1px solid ${m.border}` }}>
              <div className="text-slate-400 text-xs mb-2">{m.label}</div>
              <div className="text-xl font-bold" style={{ color: m.color }}>
                {m.display ?? formatCurrency(m.value!)}
              </div>
            </div>
          ))}
        </div>

        {/* Alert if over budget */}
        {expenseRatio > 80 && (
          <div className="alert-card alert-danger flex items-start gap-3">
            <AlertTriangle size={20} color="#ef4444" className="shrink-0 mt-0.5" />
            <div>
              <p className="text-red-300 font-semibold">Atenção! Orçamento comprometido</p>
              <p className="text-slate-400 text-sm mt-1">
                Você já gastou {expenseRatio.toFixed(0)}% da sua renda mensal. Considere revisar seus gastos variáveis para equilibrar o orçamento.
              </p>
            </div>
          </div>
        )}

        {/* Charts */}
        <div className="grid lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3 metric-card p-6">
            <h3 className="text-white font-semibold mb-5">Histórico de Gastos</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={historyData}>
                <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="Gastos" radius={[6, 6, 0, 0]}>
                  {historyData.map((_, i) => (
                    <Cell key={i} fill={i === historyData.length - 1 ? '#ef4444' : 'rgba(239,68,68,0.4)'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="lg:col-span-2 metric-card p-6">
            <h3 className="text-white font-semibold mb-4">Por Categoria</h3>
            {pieData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={140}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={3} dataKey="value">
                      {pieData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<PieTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-1.5 mt-2">
                  {pieData.slice(0, 5).map((d) => (
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
              <div className="flex items-center justify-center h-32 text-slate-500 text-sm">Nenhum gasto</div>
            )}
          </div>
        </div>

        {/* List with filters */}
        <div className="metric-card p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-5">
            <h3 className="text-white font-semibold">Lançamentos — {getMonthLabel(currentMonth)}</h3>
            <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
              <Plus size={16} /> Adicionar Gasto
            </button>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2 mb-4">
            {(['todos', 'fixo', 'variavel'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                style={{
                  background: filterType === t ? 'rgba(59,130,246,0.25)' : 'rgba(30,41,59,0.5)',
                  color: filterType === t ? '#3b82f6' : '#94a3b8',
                  border: `1px solid ${filterType === t ? 'rgba(59,130,246,0.4)' : 'rgba(148,163,184,0.1)'}`,
                }}
              >
                {t === 'todos' ? 'Todos' : t === 'fixo' ? 'Fixos' : 'Variáveis'}
              </button>
            ))}
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              style={{ width: 'auto', padding: '5px 10px', fontSize: '12px' }}
            >
              <option value="todas">Todas categorias</option>
              {Object.entries(categoryLabels).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>

          {filtered.length > 0 ? (
            <div className="space-y-2">
              {filtered
                .sort((a, b) => b.amount - a.amount)
                .map((expense) => (
                  <div
                    key={expense.id}
                    className="flex items-center justify-between p-4 rounded-xl"
                    style={{ background: 'rgba(30,41,59,0.4)', border: '1px solid rgba(148,163,184,0.08)' }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                        style={{ background: `${categoryColors[expense.category] || '#94a3b8'}22` }}
                      >
                        <div className="w-2 h-2 rounded-full" style={{ background: categoryColors[expense.category] || '#94a3b8' }} />
                      </div>
                      <div>
                        <p className="text-slate-200 text-sm font-medium">{expense.name}</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span
                            className="badge"
                            style={{
                              fontSize: '10px',
                              padding: '1px 6px',
                              background: `${categoryColors[expense.category] || '#94a3b8'}22`,
                              color: categoryColors[expense.category] || '#94a3b8',
                            }}
                          >
                            {categoryLabels[expense.category]}
                          </span>
                          <span
                            className={`badge ${expense.type === 'fixo' ? 'badge-yellow' : 'badge-blue'}`}
                            style={{ fontSize: '10px', padding: '1px 6px' }}
                          >
                            {expense.type === 'fixo' ? 'Fixo' : 'Variável'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-red-400 font-bold">{formatCurrency(expense.amount)}</span>
                      <button
                        onClick={() => dispatch({ type: 'REMOVE_EXPENSE', payload: expense.id })}
                        className="btn-danger p-2 rounded-lg"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <TrendingDown size={40} className="text-slate-600" />
              <p className="text-slate-400">Nenhum gasto encontrado</p>
              <button onClick={() => setShowModal(true)} className="btn-primary">Adicionar Gasto</button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
