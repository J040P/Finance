'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import { useStore } from '@/lib/store';
import {
  formatCurrency,
  investmentTypeLabels,
  investmentColors,
  projectInvestment,
} from '@/lib/calculations';
import { Investment, InvestmentType } from '@/lib/types';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Plus, Trash2, TrendingUp, X, AlertTriangle } from 'lucide-react';

const INVESTMENT_SUGGESTIONS = [
  {
    type: 'tesouro',
    name: 'Tesouro Selic 2027',
    why: 'Segurança máxima, liquidez diária. Ideal para reserva de emergência e curto prazo.',
    returnRate: 10.65,
    risk: 'Baixíssimo',
    riskColor: '#10b981',
    minValue: 100,
  },
  {
    type: 'cdb',
    name: 'CDB 110% CDI',
    why: 'Rendimento acima do CDI com proteção do FGC até R$250k. Ótima relação risco/retorno.',
    returnRate: 12.1,
    risk: 'Baixo',
    riskColor: '#3b82f6',
    minValue: 1000,
  },
  {
    type: 'fii',
    name: 'Fundos Imobiliários (FII)',
    why: 'Dividendos mensais isentos de IR. Exposição ao mercado imobiliário com liquidez.',
    returnRate: 11.5,
    risk: 'Médio',
    riskColor: '#f59e0b',
    minValue: 100,
  },
  {
    type: 'etf',
    name: 'ETF BOVA11 (Ibovespa)',
    why: 'Diversificação na bolsa com uma única aplicação. Indicado para horizonte de 5+ anos.',
    returnRate: 14.2,
    risk: 'Médio-Alto',
    riskColor: '#f97316',
    minValue: 100,
  },
  {
    type: 'lci_lca',
    name: 'LCI/LCA',
    why: 'Rendimento isento de IR para pessoa física. Indicado para prazo de 12 a 36 meses.',
    returnRate: 11.8,
    risk: 'Baixo',
    riskColor: '#06b6d4',
    minValue: 5000,
  },
];

function AddInvestmentModal({ onClose }: { onClose: () => void }) {
  const { dispatch } = useStore();
  const [form, setForm] = useState({
    name: '',
    type: 'tesouro' as InvestmentType,
    amount: '',
    returnRate: '',
    startDate: new Date().toISOString().slice(0, 10),
    notes: '',
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.amount) return;
    dispatch({
      type: 'ADD_INVESTMENT',
      payload: {
        id: Date.now().toString(),
        name: form.name,
        type: form.type,
        amount: parseFloat(form.amount),
        returnRate: parseFloat(form.returnRate) || 10,
        startDate: form.startDate,
        notes: form.notes,
      },
    });
    onClose();
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box slide-in" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-white font-bold text-lg">Novo Investimento</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-slate-400 text-sm mb-1.5">Nome do investimento</label>
            <input
              placeholder="Ex: Tesouro Selic 2027, CDB Nubank..."
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-slate-400 text-sm mb-1.5">Tipo</label>
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as InvestmentType })}>
              {Object.entries(investmentTypeLabels).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 text-sm mb-1.5">Valor investido (R$)</label>
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
              <label className="block text-slate-400 text-sm mb-1.5">Rendimento % a.a.</label>
              <input
                type="number"
                placeholder="Ex: 10.65"
                min="0"
                step="0.01"
                value={form.returnRate}
                onChange={(e) => setForm({ ...form, returnRate: e.target.value })}
              />
            </div>
          </div>
          <div>
            <label className="block text-slate-400 text-sm mb-1.5">Data de início</label>
            <input
              type="date"
              value={form.startDate}
              onChange={(e) => setForm({ ...form, startDate: e.target.value })}
            />
          </div>
          {form.type === 'criptomoedas' && (
            <div className="alert-card alert-warning flex items-center gap-2">
              <AlertTriangle size={16} color="#f59e0b" />
              <span className="text-yellow-200 text-xs">Criptomoedas possuem alto risco e volatilidade. Invista apenas o que pode perder.</span>
            </div>
          )}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancelar</button>
            <button type="submit" className="btn-primary flex-1">Adicionar</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function InvestimentosPage() {
  const { state, dispatch } = useStore();
  const { investments } = state;
  const [showModal, setShowModal] = useState(false);
  const [simulMonthly, setSimulMonthly] = useState(500);
  const [simulYears, setSimulYears] = useState(10);
  const [simulRate, setSimulRate] = useState(10.65);

  const totalInvested = investments.reduce((s, i) => s + i.amount, 0);
  const avgReturn = investments.length > 0 ? investments.reduce((s, i) => s + i.returnRate, 0) / investments.length : 0;
  const projected1y = totalInvested * Math.pow(1 + avgReturn / 100, 1);
  const projected5y = totalInvested * Math.pow(1 + avgReturn / 100, 5);

  const pieData = investments.map((inv) => ({
    name: inv.name,
    value: inv.amount,
    color: investmentColors[inv.type] || '#94a3b8',
  }));

  const simulData = projectInvestment(0, simulMonthly, simulRate, simulYears).map((v, i) => ({
    year: `Ano ${i}`,
    Patrimônio: v,
    Aportado: simulMonthly * 12 * i,
  }));

  const totalSimulated = projectInvestment(0, simulMonthly, simulRate, simulYears).at(-1) || 0;
  const totalContributed = simulMonthly * 12 * simulYears;
  const totalGain = totalSimulated - totalContributed;

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
      {showModal && <AddInvestmentModal onClose={() => setShowModal(false)} />}
      <Header title="Investimentos" subtitle="Sua carteira e simulações financeiras" />

      <div className="flex-1 p-4 lg:p-6 space-y-6 max-w-6xl mx-auto w-full">
        {/* Summary */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Investido', value: formatCurrency(totalInvested), color: '#10b981', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.25)' },
            { label: 'Rendimento Médio', value: `${avgReturn.toFixed(1)}% a.a.`, color: '#3b82f6', bg: 'rgba(59,130,246,0.1)', border: 'rgba(59,130,246,0.25)' },
            { label: 'Projeção 1 ano', value: formatCurrency(projected1y), color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)', border: 'rgba(139,92,246,0.25)' },
            { label: 'Projeção 5 anos', value: formatCurrency(projected5y), color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.25)' },
          ].map((m) => (
            <div key={m.label} className="metric-card p-4" style={{ background: m.bg, border: `1px solid ${m.border}` }}>
              <div className="text-slate-400 text-xs mb-2">{m.label}</div>
              <div className="text-lg lg:text-xl font-bold" style={{ color: m.color }}>{m.value}</div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Portfolio */}
          <div className="lg:col-span-2 metric-card p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-white font-semibold">Minha Carteira</h3>
              <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2 text-sm">
                <Plus size={15} /> Adicionar
              </button>
            </div>
            {investments.length > 0 ? (
              <div className="space-y-3">
                {investments.map((inv) => {
                  const pct = totalInvested > 0 ? (inv.amount / totalInvested) * 100 : 0;
                  const color = investmentColors[inv.type] || '#94a3b8';
                  const gain1y = inv.amount * (inv.returnRate / 100);
                  return (
                    <div
                      key={inv.id}
                      className="p-4 rounded-xl"
                      style={{ background: 'rgba(30,41,59,0.4)', border: '1px solid rgba(148,163,184,0.08)' }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                            style={{ background: `${color}22` }}
                          >
                            <TrendingUp size={16} color={color} />
                          </div>
                          <div>
                            <p className="text-slate-200 text-sm font-semibold">{inv.name}</p>
                            <span
                              className="badge"
                              style={{ fontSize: '10px', padding: '1px 6px', background: `${color}22`, color }}
                            >
                              {investmentTypeLabels[inv.type]}
                            </span>
                          </div>
                        </div>
                        <div className="text-right flex items-start gap-3">
                          <div>
                            <p className="text-white font-bold">{formatCurrency(inv.amount)}</p>
                            <p className="text-green-400 text-xs">+{formatCurrency(gain1y)}/ano</p>
                          </div>
                          <button
                            onClick={() => dispatch({ type: 'REMOVE_INVESTMENT', payload: inv.id })}
                            className="btn-danger p-2 rounded-lg mt-0.5"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 progress-bar">
                          <div className="progress-fill" style={{ width: `${pct}%`, background: color }} />
                        </div>
                        <span className="text-slate-400 text-xs w-10 text-right">{pct.toFixed(0)}%</span>
                        <span className="text-slate-400 text-xs w-16 text-right">{inv.returnRate}% a.a.</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 gap-4">
                <TrendingUp size={40} className="text-slate-600" />
                <p className="text-slate-400">Nenhum investimento cadastrado</p>
                <button onClick={() => setShowModal(true)} className="btn-primary">Adicionar Investimento</button>
              </div>
            )}
          </div>

          {/* Pie */}
          <div className="metric-card p-6">
            <h3 className="text-white font-semibold mb-4">Alocação</h3>
            {pieData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                      {pieData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<PieTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2 mt-3">
                  {pieData.map((d) => (
                    <div key={d.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-2 h-2 rounded-full shrink-0" style={{ background: d.color }} />
                        <span className="text-slate-400 text-xs truncate">{d.name}</span>
                      </div>
                      <span className="text-slate-200 text-xs font-medium ml-2">{formatCurrency(d.value)}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-40 text-slate-500 text-sm">Sem investimentos</div>
            )}
          </div>
        </div>

        {/* Simulator */}
        <div className="metric-card p-6">
          <h3 className="text-white font-semibold mb-2">Simulador de Juros Compostos</h3>
          <p className="text-slate-400 text-sm mb-5">Veja quanto seu dinheiro pode render ao longo do tempo</p>

          <div className="grid sm:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-slate-400 text-sm mb-1.5">Aporte mensal (R$)</label>
              <input
                type="number"
                value={simulMonthly}
                onChange={(e) => setSimulMonthly(parseFloat(e.target.value) || 0)}
                min={0}
              />
            </div>
            <div>
              <label className="block text-slate-400 text-sm mb-1.5">Taxa anual (%)</label>
              <input
                type="number"
                value={simulRate}
                onChange={(e) => setSimulRate(parseFloat(e.target.value) || 0)}
                min={0}
                step={0.1}
              />
            </div>
            <div>
              <label className="block text-slate-400 text-sm mb-1.5">Período (anos)</label>
              <input
                type="number"
                value={simulYears}
                onChange={(e) => setSimulYears(parseInt(e.target.value) || 1)}
                min={1}
                max={40}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-5">
            <div className="p-4 rounded-xl text-center" style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)' }}>
              <p className="text-slate-400 text-xs mb-1">Total Aportado</p>
              <p className="text-blue-400 font-bold text-lg">{formatCurrency(totalContributed)}</p>
            </div>
            <div className="p-4 rounded-xl text-center" style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)' }}>
              <p className="text-slate-400 text-xs mb-1">Juros Ganhos</p>
              <p className="text-green-400 font-bold text-lg">{formatCurrency(totalGain)}</p>
            </div>
            <div className="p-4 rounded-xl text-center" style={{ background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)' }}>
              <p className="text-slate-400 text-xs mb-1">Patrimônio Final</p>
              <p className="text-purple-400 font-bold text-lg">{formatCurrency(totalSimulated)}</p>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={simulData}>
              <defs>
                <linearGradient id="pat-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="apt-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="year" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="Aportado" stroke="#3b82f6" strokeWidth={1.5} fill="url(#apt-grad)" />
              <Area type="monotone" dataKey="Patrimônio" stroke="#8b5cf6" strokeWidth={2} fill="url(#pat-grad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* AI suggestions */}
        <div className="metric-card p-6">
          <h3 className="text-white font-semibold mb-2">Sugestões da IA para sua Carteira</h3>
          <p className="text-slate-400 text-sm mb-5">Baseado no cenário econômico atual e perfil {state.user.financialProfile}</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {INVESTMENT_SUGGESTIONS.map((s) => (
              <div
                key={s.type}
                className="p-4 rounded-xl card-hover"
                style={{ background: 'rgba(30,41,59,0.4)', border: `1px solid ${investmentColors[s.type] || '#94a3b8'}30` }}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-slate-200 text-sm font-semibold">{s.name}</p>
                    <span
                      className="badge mt-1"
                      style={{ fontSize: '10px', padding: '1px 6px', background: `${investmentColors[s.type]}22`, color: investmentColors[s.type] }}
                    >
                      {investmentTypeLabels[s.type as InvestmentType]}
                    </span>
                  </div>
                  <span
                    className="badge"
                    style={{ fontSize: '10px', padding: '1px 8px', background: `${s.riskColor}22`, color: s.riskColor, whiteSpace: 'nowrap' }}
                  >
                    {s.risk}
                  </span>
                </div>
                <p className="text-slate-400 text-xs leading-relaxed mb-3">{s.why}</p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-400 font-bold text-sm">{s.returnRate}% a.a.</p>
                    <p className="text-slate-500 text-xs">a partir de {formatCurrency(s.minValue)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
