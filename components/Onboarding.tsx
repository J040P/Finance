'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import { IncomeSource, Expense, ExpenseCategory } from '@/lib/types';
import { formatCurrency, categoryLabels, incomeTypeLabels } from '@/lib/calculations';
import {
  Wallet, User, TrendingUp, TrendingDown, Target,
  ChevronRight, ChevronLeft, Plus, Trash2, Check, Sparkles
} from 'lucide-react';

const STEPS = [
  { id: 'perfil', label: 'Seu Perfil', icon: User },
  { id: 'renda', label: 'Suas Rendas', icon: TrendingUp },
  { id: 'gastos', label: 'Seus Gastos', icon: TrendingDown },
  { id: 'objetivos', label: 'Objetivos', icon: Target },
  { id: 'pronto', label: 'Tudo pronto!', icon: Check },
];

const OBJECTIVES_OPTIONS = [
  { id: 'reserva_emergencia', label: 'Reserva de Emergência', icon: '🛡️' },
  { id: 'investimentos', label: 'Investir mais', icon: '📈' },
  { id: 'quitar_dividas', label: 'Quitar Dívidas', icon: '💳' },
  { id: 'comprar_imovel', label: 'Comprar Imóvel', icon: '🏠' },
  { id: 'viajar', label: 'Viajar', icon: '✈️' },
  { id: 'aposentadoria', label: 'Aposentadoria', icon: '🏖️' },
  { id: 'abrir_empresa', label: 'Abrir Empresa', icon: '🏢' },
  { id: 'educacao', label: 'Educação/Cursos', icon: '🎓' },
];

const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  'moradia', 'alimentacao', 'transporte', 'saude',
  'educacao', 'lazer', 'vestuario', 'tecnologia',
  'assinaturas', 'dividas', 'outros',
];

export default function Onboarding() {
  const { dispatch } = useStore();
  const currentMonth = new Date().toISOString().slice(0, 7);
  const [step, setStep] = useState(0);

  // Step 0: Perfil
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [financialProfile, setFinancialProfile] = useState<'conservador' | 'moderado' | 'arrojado'>('moderado');

  // Step 1: Rendas
  const [incomes, setIncomes] = useState<Omit<IncomeSource, 'id'>[]>([
    { name: '', type: 'salario', amount: 0, recurring: true, month: currentMonth },
  ]);

  // Step 2: Gastos
  const [expenses, setExpenses] = useState<Omit<Expense, 'id'>[]>([
    { name: '', category: 'moradia', amount: 0, type: 'fixo', month: currentMonth },
  ]);

  // Step 3: Objetivos
  const [objectives, setObjectives] = useState<string[]>([]);

  function addIncome() {
    setIncomes([...incomes, { name: '', type: 'salario', amount: 0, recurring: true, month: currentMonth }]);
  }

  function removeIncome(i: number) {
    setIncomes(incomes.filter((_, idx) => idx !== i));
  }

  function updateIncome(i: number, field: string, value: string | number | boolean) {
    const updated = [...incomes];
    (updated[i] as Record<string, unknown>)[field] = value;
    setIncomes(updated);
  }

  function addExpense() {
    setExpenses([...expenses, { name: '', category: 'alimentacao', amount: 0, type: 'variavel', month: currentMonth }]);
  }

  function removeExpense(i: number) {
    setExpenses(expenses.filter((_, idx) => idx !== i));
  }

  function updateExpense(i: number, field: string, value: string | number) {
    const updated = [...expenses];
    (updated[i] as Record<string, unknown>)[field] = value;
    setExpenses(updated);
  }

  function toggleObjective(id: string) {
    setObjectives((prev) =>
      prev.includes(id) ? prev.filter((o) => o !== id) : [...prev, id]
    );
  }

  function canProceed() {
    if (step === 0) return name.trim().length > 0 && parseInt(age) > 0;
    if (step === 1) return incomes.some((i) => i.name && i.amount > 0);
    if (step === 2) return true; // gastos são opcionais
    if (step === 3) return objectives.length > 0;
    return true;
  }

  function handleFinish() {
    dispatch({
      type: 'SET_USER',
      payload: {
        name: name.trim(),
        age: parseInt(age),
        financialProfile,
        objectives,
        setupComplete: true,
      },
    });

    incomes
      .filter((i) => i.name && i.amount > 0)
      .forEach((income) => {
        dispatch({
          type: 'ADD_INCOME',
          payload: { ...income, id: Date.now().toString() + Math.random() },
        });
      });

    expenses
      .filter((e) => e.name && e.amount > 0)
      .forEach((expense) => {
        dispatch({
          type: 'ADD_EXPENSE',
          payload: { ...expense, id: Date.now().toString() + Math.random() },
        });
      });
  }

  const totalIncome = incomes.reduce((s, i) => s + (i.amount || 0), 0);
  const totalExpenses = expenses.reduce((s, e) => s + (e.amount || 0), 0);
  const balance = totalIncome - totalExpenses;

  const profileOptions = [
    {
      value: 'conservador',
      label: 'Conservador',
      desc: 'Priorizo segurança. Prefiro rendimentos menores com risco baixo.',
      icon: '🛡️',
      color: '#10b981',
    },
    {
      value: 'moderado',
      label: 'Moderado',
      desc: 'Aceito algum risco por melhor retorno. Equilíbrio é o caminho.',
      icon: '⚖️',
      color: '#3b82f6',
    },
    {
      value: 'arrojado',
      label: 'Arrojado',
      desc: 'Foco em crescimento máximo. Aceito volatilidade por retornos maiores.',
      icon: '🚀',
      color: '#8b5cf6',
    },
  ] as const;

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-4"
      style={{ background: 'linear-gradient(135deg, #0a0f1e 0%, #0d1a35 50%, #0a0f1e 100%)' }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl gradient-blue flex items-center justify-center">
          <Wallet className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="text-white font-bold text-xl">FinanceIA</div>
          <div className="text-blue-400 text-xs">Personal CFO</div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full max-w-xl mb-6">
        <div className="flex items-center justify-between mb-3">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center">
              <div
                className="flex flex-col items-center gap-1"
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center transition-all"
                  style={{
                    background: i < step ? '#10b981' : i === step ? '#3b82f6' : 'rgba(30,41,59,0.8)',
                    border: `2px solid ${i < step ? '#10b981' : i === step ? '#3b82f6' : 'rgba(148,163,184,0.2)'}`,
                  }}
                >
                  {i < step ? (
                    <Check size={14} color="white" />
                  ) : (
                    <s.icon size={14} color={i === step ? 'white' : '#475569'} />
                  )}
                </div>
                <span
                  className="text-xs hidden sm:block"
                  style={{ color: i === step ? '#e2e8f0' : '#475569' }}
                >
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className="h-0.5 w-8 sm:w-16 mx-1 sm:mx-2 rounded"
                  style={{ background: i < step ? '#10b981' : 'rgba(30,41,59,0.8)' }}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Card */}
      <div
        className="w-full max-w-xl rounded-2xl p-6 sm:p-8 slide-in"
        style={{ background: '#0d1425', border: '1px solid rgba(37,99,235,0.25)' }}
      >
        {/* STEP 0: Perfil */}
        {step === 0 && (
          <div>
            <h2 className="text-white font-bold text-xl mb-1">Vamos começar!</h2>
            <p className="text-slate-400 text-sm mb-6">Nos conte um pouco sobre você para personalizar sua experiência.</p>

            <div className="space-y-4">
              <div>
                <label className="block text-slate-400 text-sm mb-1.5">Qual é o seu nome?</label>
                <input
                  placeholder="Ex: João Pedro"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-slate-400 text-sm mb-1.5">Sua idade</label>
                <input
                  type="number"
                  placeholder="Ex: 28"
                  min="16"
                  max="99"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-slate-400 text-sm mb-3">Qual é o seu perfil de investidor?</label>
                <div className="space-y-3">
                  {profileOptions.map((p) => (
                    <button
                      key={p.value}
                      type="button"
                      onClick={() => setFinancialProfile(p.value)}
                      className="w-full p-4 rounded-xl text-left transition-all"
                      style={{
                        background: financialProfile === p.value ? `${p.color}15` : 'rgba(30,41,59,0.4)',
                        border: `2px solid ${financialProfile === p.value ? p.color : 'rgba(148,163,184,0.1)'}`,
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{p.icon}</span>
                        <div>
                          <p className="text-slate-200 font-semibold text-sm">{p.label}</p>
                          <p className="text-slate-400 text-xs mt-0.5">{p.desc}</p>
                        </div>
                        {financialProfile === p.value && (
                          <div className="ml-auto w-5 h-5 rounded-full flex items-center justify-center" style={{ background: p.color }}>
                            <Check size={12} color="white" />
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 1: Rendas */}
        {step === 1 && (
          <div>
            <h2 className="text-white font-bold text-xl mb-1">Suas fontes de renda</h2>
            <p className="text-slate-400 text-sm mb-6">Adicione salário, freelas, aluguéis e qualquer outra renda que você tenha.</p>

            <div className="space-y-3 mb-4">
              {incomes.map((income, i) => (
                <div
                  key={i}
                  className="p-4 rounded-xl space-y-3"
                  style={{ background: 'rgba(30,41,59,0.5)', border: '1px solid rgba(148,163,184,0.1)' }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300 text-sm font-medium">Renda {i + 1}</span>
                    {incomes.length > 1 && (
                      <button onClick={() => removeIncome(i)} className="btn-danger p-1.5 rounded-lg">
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                  <input
                    placeholder="Nome (Ex: Salário CLT, Freela de Design...)"
                    value={income.name}
                    onChange={(e) => updateIncome(i, 'name', e.target.value)}
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <select
                      value={income.type}
                      onChange={(e) => updateIncome(i, 'type', e.target.value)}
                    >
                      {Object.entries(incomeTypeLabels).map(([k, v]) => (
                        <option key={k} value={k}>{v}</option>
                      ))}
                    </select>
                    <input
                      type="number"
                      placeholder="Valor (R$)"
                      min="0"
                      step="0.01"
                      value={income.amount || ''}
                      onChange={(e) => updateIncome(i, 'amount', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={income.recurring}
                      onChange={(e) => updateIncome(i, 'recurring', e.target.checked)}
                      style={{ width: 'auto', padding: 0 }}
                    />
                    <span className="text-slate-400 text-xs">Renda mensal recorrente</span>
                  </label>
                </div>
              ))}
            </div>

            <button
              onClick={addIncome}
              className="w-full py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-colors"
              style={{
                background: 'rgba(59,130,246,0.1)',
                border: '2px dashed rgba(59,130,246,0.3)',
                color: '#3b82f6',
              }}
            >
              <Plus size={16} /> Adicionar outra fonte de renda
            </button>

            {totalIncome > 0 && (
              <div
                className="mt-4 p-3 rounded-xl flex items-center justify-between"
                style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)' }}
              >
                <span className="text-slate-400 text-sm">Renda total mensal</span>
                <span className="text-green-400 font-bold text-lg">{formatCurrency(totalIncome)}</span>
              </div>
            )}
          </div>
        )}

        {/* STEP 2: Gastos */}
        {step === 2 && (
          <div>
            <h2 className="text-white font-bold text-xl mb-1">Seus gastos mensais</h2>
            <p className="text-slate-400 text-sm mb-6">Adicione seus principais gastos fixos e variáveis. Você pode adicionar mais depois.</p>

            <div className="space-y-3 mb-4 max-h-80 overflow-y-auto pr-1">
              {expenses.map((expense, i) => (
                <div
                  key={i}
                  className="p-4 rounded-xl space-y-3"
                  style={{ background: 'rgba(30,41,59,0.5)', border: '1px solid rgba(148,163,184,0.1)' }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300 text-sm font-medium">Gasto {i + 1}</span>
                    {expenses.length > 1 && (
                      <button onClick={() => removeExpense(i)} className="btn-danger p-1.5 rounded-lg">
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                  <input
                    placeholder="Descrição (Ex: Aluguel, Supermercado...)"
                    value={expense.name}
                    onChange={(e) => updateExpense(i, 'name', e.target.value)}
                  />
                  <div className="grid grid-cols-3 gap-2">
                    <select
                      value={expense.category}
                      onChange={(e) => updateExpense(i, 'category', e.target.value)}
                    >
                      {EXPENSE_CATEGORIES.map((c) => (
                        <option key={c} value={c}>{categoryLabels[c]}</option>
                      ))}
                    </select>
                    <select
                      value={expense.type}
                      onChange={(e) => updateExpense(i, 'type', e.target.value)}
                    >
                      <option value="fixo">Fixo</option>
                      <option value="variavel">Variável</option>
                    </select>
                    <input
                      type="number"
                      placeholder="R$"
                      min="0"
                      step="0.01"
                      value={expense.amount || ''}
                      onChange={(e) => updateExpense(i, 'amount', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={addExpense}
              className="w-full py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-colors"
              style={{
                background: 'rgba(239,68,68,0.08)',
                border: '2px dashed rgba(239,68,68,0.25)',
                color: '#ef4444',
              }}
            >
              <Plus size={16} /> Adicionar outro gasto
            </button>

            {(totalIncome > 0 || totalExpenses > 0) && (
              <div
                className="mt-4 p-4 rounded-xl space-y-2"
                style={{ background: 'rgba(30,41,59,0.5)', border: '1px solid rgba(148,163,184,0.1)' }}
              >
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Renda total</span>
                  <span className="text-green-400 font-semibold">{formatCurrency(totalIncome)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Total de gastos</span>
                  <span className="text-red-400 font-semibold">{formatCurrency(totalExpenses)}</span>
                </div>
                <div
                  className="h-px"
                  style={{ background: 'rgba(148,163,184,0.1)' }}
                />
                <div className="flex justify-between text-sm">
                  <span className="text-slate-300 font-semibold">Saldo livre</span>
                  <span
                    className="font-bold"
                    style={{ color: balance >= 0 ? '#10b981' : '#ef4444' }}
                  >
                    {formatCurrency(balance)}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 3: Objetivos */}
        {step === 3 && (
          <div>
            <h2 className="text-white font-bold text-xl mb-1">Quais são seus objetivos?</h2>
            <p className="text-slate-400 text-sm mb-6">Selecione um ou mais. A IA vai personalizar as recomendações com base nisso.</p>

            <div className="grid grid-cols-2 gap-3">
              {OBJECTIVES_OPTIONS.map((obj) => {
                const selected = objectives.includes(obj.id);
                return (
                  <button
                    key={obj.id}
                    type="button"
                    onClick={() => toggleObjective(obj.id)}
                    className="p-4 rounded-xl text-left transition-all"
                    style={{
                      background: selected ? 'rgba(59,130,246,0.15)' : 'rgba(30,41,59,0.4)',
                      border: `2px solid ${selected ? '#3b82f6' : 'rgba(148,163,184,0.1)'}`,
                    }}
                  >
                    <div className="text-2xl mb-2">{obj.icon}</div>
                    <p
                      className="text-sm font-medium"
                      style={{ color: selected ? '#e2e8f0' : '#94a3b8' }}
                    >
                      {obj.label}
                    </p>
                    {selected && (
                      <div className="mt-1">
                        <Check size={12} color="#3b82f6" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 4: Pronto */}
        {step === 4 && (
          <div className="text-center">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5"
              style={{ background: 'rgba(16,185,129,0.15)', border: '2px solid rgba(16,185,129,0.4)' }}
            >
              <Sparkles size={36} color="#10b981" />
            </div>
            <h2 className="text-white font-bold text-2xl mb-2">Tudo pronto, {name}! 🎉</h2>
            <p className="text-slate-400 text-sm mb-6 leading-relaxed">
              Seu perfil foi configurado. A IA já está analisando seus dados para gerar recomendações personalizadas.
            </p>

            <div
              className="p-4 rounded-xl text-left mb-6 space-y-2"
              style={{ background: 'rgba(30,41,59,0.5)', border: '1px solid rgba(37,99,235,0.2)' }}
            >
              <p className="text-slate-300 text-sm font-semibold mb-3">Resumo do seu cadastro:</p>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Fontes de renda</span>
                <span className="text-slate-200">{incomes.filter((i) => i.name && i.amount > 0).length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Renda mensal total</span>
                <span className="text-green-400 font-semibold">{formatCurrency(totalIncome)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Gastos cadastrados</span>
                <span className="text-slate-200">{expenses.filter((e) => e.name && e.amount > 0).length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Total de gastos</span>
                <span className="text-red-400 font-semibold">{formatCurrency(totalExpenses)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Saldo livre estimado</span>
                <span className="font-bold" style={{ color: balance >= 0 ? '#10b981' : '#ef4444' }}>
                  {formatCurrency(balance)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Perfil de investidor</span>
                <span className="text-blue-400 font-semibold capitalize">{financialProfile}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Objetivos selecionados</span>
                <span className="text-slate-200">{objectives.length}</span>
              </div>
            </div>

            <button
              onClick={handleFinish}
              className="btn-primary w-full py-3 text-base"
            >
              Entrar no Dashboard →
            </button>
          </div>
        )}

        {/* Navigation */}
        {step < 4 && (
          <div className="flex gap-3 mt-8">
            {step > 0 && (
              <button
                onClick={() => setStep(step - 1)}
                className="btn-secondary flex items-center gap-2"
              >
                <ChevronLeft size={16} /> Voltar
              </button>
            )}
            <button
              onClick={() => setStep(step + 1)}
              disabled={!canProceed()}
              className="btn-primary flex-1 flex items-center justify-center gap-2"
              style={{
                opacity: canProceed() ? 1 : 0.4,
                cursor: canProceed() ? 'pointer' : 'not-allowed',
              }}
            >
              {step === 3 ? 'Finalizar' : 'Continuar'}
              <ChevronRight size={16} />
            </button>
          </div>
        )}

        {step === 2 && (
          <p className="text-center text-slate-500 text-xs mt-3">
            Gastos são opcionais — você pode adicionar depois
          </p>
        )}
      </div>

      <p className="text-slate-600 text-xs mt-6">Seus dados ficam salvos apenas neste dispositivo.</p>
    </div>
  );
}
