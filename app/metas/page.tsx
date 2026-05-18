'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import { useStore } from '@/lib/store';
import { formatCurrency, calculateGoalMonthsRemaining } from '@/lib/calculations';
import { Goal, GoalType } from '@/lib/types';
import { Plus, Trash2, Target, Edit3, X, Check } from 'lucide-react';

const GOAL_ICONS: Record<GoalType, string> = {
  carro: '🚗',
  viagem: '✈️',
  imovel: '🏠',
  educacao: '🎓',
  empresa: '🏢',
  aposentadoria: '🏖️',
  divida: '💳',
  emergencia: '🛡️',
  outro: '⭐',
};

const GOAL_COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899', '#84cc16'];

const goalTypeLabels: Record<GoalType, string> = {
  carro: 'Carro',
  viagem: 'Viagem',
  imovel: 'Imóvel',
  educacao: 'Educação',
  empresa: 'Empresa',
  aposentadoria: 'Aposentadoria',
  divida: 'Quitar Dívida',
  emergencia: 'Reserva de Emergência',
  outro: 'Outro',
};

function AddGoalModal({ onClose }: { onClose: () => void }) {
  const { dispatch } = useStore();
  const [form, setForm] = useState({
    name: '',
    type: 'viagem' as GoalType,
    targetAmount: '',
    currentAmount: '',
    targetDate: '',
    monthlyContribution: '',
    color: '#3b82f6',
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.targetAmount) return;
    const goal: Goal = {
      id: Date.now().toString(),
      name: form.name,
      type: form.type,
      targetAmount: parseFloat(form.targetAmount),
      currentAmount: parseFloat(form.currentAmount) || 0,
      targetDate: form.targetDate || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      monthlyContribution: parseFloat(form.monthlyContribution) || 0,
      color: form.color,
      icon: GOAL_ICONS[form.type],
    };
    dispatch({ type: 'ADD_GOAL', payload: goal });
    onClose();
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box slide-in" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-white font-bold text-lg">Nova Meta Financeira</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-slate-400 text-sm mb-1.5">Nome da meta</label>
            <input
              placeholder="Ex: Viagem à Europa, Carro Novo..."
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-slate-400 text-sm mb-1.5">Tipo</label>
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as GoalType, icon: GOAL_ICONS[e.target.value as GoalType] } as typeof form)}>
              {Object.entries(goalTypeLabels).map(([k, v]) => (
                <option key={k} value={k}>{GOAL_ICONS[k as GoalType]} {v}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 text-sm mb-1.5">Valor alvo (R$)</label>
              <input
                type="number"
                placeholder="0,00"
                min="0"
                step="0.01"
                value={form.targetAmount}
                onChange={(e) => setForm({ ...form, targetAmount: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-slate-400 text-sm mb-1.5">Já tenho (R$)</label>
              <input
                type="number"
                placeholder="0,00"
                min="0"
                step="0.01"
                value={form.currentAmount}
                onChange={(e) => setForm({ ...form, currentAmount: e.target.value })}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 text-sm mb-1.5">Contribuição mensal (R$)</label>
              <input
                type="number"
                placeholder="0,00"
                min="0"
                step="0.01"
                value={form.monthlyContribution}
                onChange={(e) => setForm({ ...form, monthlyContribution: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-slate-400 text-sm mb-1.5">Data alvo</label>
              <input
                type="date"
                value={form.targetDate}
                onChange={(e) => setForm({ ...form, targetDate: e.target.value })}
              />
            </div>
          </div>
          <div>
            <label className="block text-slate-400 text-sm mb-2">Cor</label>
            <div className="flex gap-2 flex-wrap">
              {GOAL_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setForm({ ...form, color: c })}
                  className="w-7 h-7 rounded-full border-2 flex items-center justify-center transition-transform hover:scale-110"
                  style={{
                    background: c,
                    borderColor: form.color === c ? 'white' : 'transparent',
                    transform: form.color === c ? 'scale(1.2)' : undefined,
                  }}
                >
                  {form.color === c && <Check size={12} color="white" />}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancelar</button>
            <button type="submit" className="btn-primary flex-1">Criar Meta</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function GoalContributeModal({ goal, onClose }: { goal: Goal; onClose: () => void }) {
  const { dispatch } = useStore();
  const [amount, setAmount] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const val = parseFloat(amount);
    if (!val || val <= 0) return;
    dispatch({
      type: 'UPDATE_GOAL',
      payload: { ...goal, currentAmount: Math.min(goal.currentAmount + val, goal.targetAmount) },
    });
    onClose();
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box slide-in" style={{ maxWidth: 380 }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-white font-bold">{goal.icon} Contribuir para a Meta</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1"><X size={18} /></button>
        </div>
        <p className="text-slate-400 text-sm mb-4">{goal.name}</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-slate-400 text-sm mb-1.5">Valor a adicionar (R$)</label>
            <input
              type="number"
              placeholder="0,00"
              min="0"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              autoFocus
              required
            />
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancelar</button>
            <button type="submit" className="btn-primary flex-1">Adicionar</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function MetasPage() {
  const { state, dispatch } = useStore();
  const { goals } = state;
  const [showAdd, setShowAdd] = useState(false);
  const [contributeGoal, setContributeGoal] = useState<Goal | null>(null);

  const totalGoalsTarget = goals.reduce((s, g) => s + g.targetAmount, 0);
  const totalGoalsCurrent = goals.reduce((s, g) => s + g.currentAmount, 0);
  const completedGoals = goals.filter((g) => g.currentAmount >= g.targetAmount).length;

  return (
    <>
      {showAdd && <AddGoalModal onClose={() => setShowAdd(false)} />}
      {contributeGoal && <GoalContributeModal goal={contributeGoal} onClose={() => setContributeGoal(null)} />}
      <Header title="Metas Financeiras" subtitle="Planeje e acompanhe seus objetivos de vida" />

      <div className="flex-1 p-4 lg:p-6 space-y-6 max-w-6xl mx-auto w-full">
        {/* Summary */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="metric-card p-5" style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.25)' }}>
            <div className="text-slate-400 text-xs mb-2">Total em Metas</div>
            <div className="text-2xl font-bold text-blue-400">{formatCurrency(totalGoalsTarget)}</div>
            <div className="text-slate-500 text-xs mt-1">{goals.length} meta{goals.length !== 1 ? 's' : ''} ativas</div>
          </div>
          <div className="metric-card p-5" style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)' }}>
            <div className="text-slate-400 text-xs mb-2">Já Guardado</div>
            <div className="text-2xl font-bold text-green-400">{formatCurrency(totalGoalsCurrent)}</div>
            <div className="text-slate-500 text-xs mt-1">
              {totalGoalsTarget > 0 ? ((totalGoalsCurrent / totalGoalsTarget) * 100).toFixed(0) : 0}% do total
            </div>
          </div>
          <div className="metric-card p-5" style={{ background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.25)' }}>
            <div className="text-slate-400 text-xs mb-2">Concluídas</div>
            <div className="text-2xl font-bold text-purple-400">{completedGoals}</div>
            <div className="text-slate-500 text-xs mt-1">de {goals.length} meta{goals.length !== 1 ? 's' : ''}</div>
          </div>
        </div>

        {/* Goals grid */}
        <div className="flex items-center justify-between">
          <h3 className="text-white font-semibold">Suas Metas</h3>
          <button onClick={() => setShowAdd(true)} className="btn-primary flex items-center gap-2">
            <Plus size={16} /> Nova Meta
          </button>
        </div>

        {goals.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {goals.map((goal) => {
              const pct = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
              const monthsLeft = calculateGoalMonthsRemaining(goal);
              const remaining = goal.targetAmount - goal.currentAmount;
              const isComplete = pct >= 100;
              const targetDate = new Date(goal.targetDate);
              const monthsToTarget = Math.ceil((targetDate.getTime() - Date.now()) / (30 * 24 * 60 * 60 * 1000));

              return (
                <div
                  key={goal.id}
                  className="metric-card p-5 card-hover"
                  style={{ border: `1px solid ${goal.color}30` }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{goal.icon}</span>
                      <div>
                        <p className="text-white font-semibold text-sm">{goal.name}</p>
                        <span
                          className="badge"
                          style={{ fontSize: '10px', padding: '1px 6px', background: `${goal.color}22`, color: goal.color }}
                        >
                          {goalTypeLabels[goal.type]}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => dispatch({ type: 'REMOVE_GOAL', payload: goal.id })}
                      className="btn-danger p-1.5 rounded-lg"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>

                  {/* Progress */}
                  <div className="mb-3">
                    <div className="flex justify-between mb-1.5">
                      <span className="text-slate-400 text-xs">{formatCurrency(goal.currentAmount)}</span>
                      <span className="text-xs font-bold" style={{ color: goal.color }}>{pct.toFixed(0)}%</span>
                    </div>
                    <div className="progress-bar" style={{ height: 8 }}>
                      <div
                        className="progress-fill"
                        style={{ width: `${pct}%`, background: isComplete ? '#10b981' : goal.color, height: 8 }}
                      />
                    </div>
                    <div className="text-right mt-1">
                      <span className="text-slate-500 text-xs">meta: {formatCurrency(goal.targetAmount)}</span>
                    </div>
                  </div>

                  {isComplete ? (
                    <div className="flex items-center gap-2 p-2.5 rounded-lg mb-3" style={{ background: 'rgba(16,185,129,0.15)' }}>
                      <Check size={14} color="#10b981" />
                      <span className="text-green-400 text-xs font-semibold">Meta concluída! 🎉</span>
                    </div>
                  ) : (
                    <div className="space-y-1.5 mb-3">
                      <div className="flex justify-between">
                        <span className="text-slate-400 text-xs">Falta</span>
                        <span className="text-slate-200 text-xs font-medium">{formatCurrency(remaining)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400 text-xs">Aporte mensal</span>
                        <span className="text-slate-200 text-xs font-medium">{formatCurrency(goal.monthlyContribution)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400 text-xs">Estimativa</span>
                        <span
                          className="text-xs font-semibold"
                          style={{ color: monthsLeft <= monthsToTarget ? '#10b981' : '#f59e0b' }}
                        >
                          {isFinite(monthsLeft) ? `${monthsLeft} mes${monthsLeft !== 1 ? 'es' : ''}` : 'Indefinido'}
                        </span>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={() => setContributeGoal(goal)}
                    disabled={isComplete}
                    className="w-full py-2 rounded-lg text-xs font-semibold transition-all"
                    style={{
                      background: isComplete ? 'rgba(30,41,59,0.3)' : `${goal.color}22`,
                      color: isComplete ? '#475569' : goal.color,
                      border: `1px solid ${isComplete ? 'transparent' : `${goal.color}40`}`,
                      cursor: isComplete ? 'default' : 'pointer',
                    }}
                  >
                    {isComplete ? 'Concluído ✓' : '+ Contribuir'}
                  </button>
                </div>
              );
            })}

            {/* Add new */}
            <button
              onClick={() => setShowAdd(true)}
              className="metric-card p-5 card-hover flex flex-col items-center justify-center gap-3 border-dashed"
              style={{ border: '2px dashed rgba(59,130,246,0.2)', minHeight: 200 }}
            >
              <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: 'rgba(59,130,246,0.1)' }}>
                <Plus size={22} color="#3b82f6" />
              </div>
              <span className="text-slate-400 text-sm">Nova Meta</span>
            </button>
          </div>
        ) : (
          <div className="metric-card p-12 flex flex-col items-center justify-center gap-4">
            <Target size={48} className="text-slate-600" />
            <div className="text-center">
              <p className="text-slate-300 font-semibold text-lg">Nenhuma meta definida</p>
              <p className="text-slate-500 text-sm mt-1">Defina seus objetivos e acompanhe seu progresso</p>
            </div>
            <button onClick={() => setShowAdd(true)} className="btn-primary">Criar Primeira Meta</button>
          </div>
        )}

        {/* Tips */}
        {goals.length > 0 && (
          <div className="metric-card p-6">
            <h3 className="text-white font-semibold mb-4">Dicas para Atingir suas Metas</h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { icon: '⚡', title: 'Automatize seus aportes', tip: 'Configure débito automático todo dia 5. Você não gasta o que não vê.' },
                { icon: '📊', title: 'Revise mensalmente', tip: 'Ajuste suas metas conforme sua situação muda. Flexibilidade é chave.' },
                { icon: '🎯', title: 'Regra dos 3 meses', tip: 'Antes de qualquer meta, complete 3 meses de reserva de emergência.' },
                { icon: '🔢', title: 'Quebre em marcos', tip: 'Divida metas grandes em marcos menores para manter a motivação alta.' },
                { icon: '💡', title: 'Renda extra para metas', tip: 'Use freelas, bônus e vendas diretamente nas suas metas prioritárias.' },
                { icon: '📈', title: 'Invista o dinheiro da meta', tip: 'Coloque o dinheiro da meta em CDB ou Tesouro Selic enquanto não usa.' },
              ].map((tip) => (
                <div
                  key={tip.title}
                  className="p-4 rounded-xl"
                  style={{ background: 'rgba(30,41,59,0.4)', border: '1px solid rgba(148,163,184,0.08)' }}
                >
                  <div className="text-xl mb-2">{tip.icon}</div>
                  <p className="text-slate-200 text-sm font-semibold mb-1">{tip.title}</p>
                  <p className="text-slate-400 text-xs leading-relaxed">{tip.tip}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
