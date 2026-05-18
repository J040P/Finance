'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import { useStore } from '@/lib/store';
import {
  generateInsights,
  getTotalIncome,
  getTotalExpenses,
  formatCurrency,
  getExpensesByCategory,
  categoryLabels,
  getBudgetAllocations,
} from '@/lib/calculations';
import { Sparkles, Brain, TrendingUp, AlertTriangle, CheckCircle, Info, ChevronDown, ChevronUp } from 'lucide-react';

const FINANCIAL_TIPS = [
  {
    category: 'Orçamento',
    color: '#3b82f6',
    icon: '💰',
    tips: [
      'A regra 50/30/20 é um bom ponto de partida: 50% para necessidades, 30% para desejos, 20% para poupança.',
      'Pague-se primeiro: assim que receber seu salário, transfira imediatamente o valor destinado a poupança.',
      'Revise suas assinaturas mensalmente. Cancelar apenas 2-3 serviços que não usa pode economizar R$100-200/mês.',
      'Evite compras por impulso. Use a regra das 48 horas: espere 2 dias antes de comprar algo não planejado.',
    ],
  },
  {
    category: 'Investimentos',
    color: '#10b981',
    icon: '📈',
    tips: [
      'Juros compostos é a "8ª maravilha do mundo" (Einstein). Começar cedo, mesmo com pouco, é mais eficiente que começar tarde com muito.',
      'Diversificação é proteção. Não coloque todo o dinheiro em um único ativo ou tipo de investimento.',
      'Tesouro Selic é ideal para reserva de emergência: segurança máxima e liquidez diária.',
      'Fundos Imobiliários (FIIs) pagam dividendos mensais isentos de IR para pessoa física. Excelente para renda passiva.',
      'ETFs como BOVA11 permitem investir em toda a bolsa de valores com uma única compra.',
    ],
  },
  {
    category: 'Dívidas',
    color: '#ef4444',
    icon: '💳',
    tips: [
      'Dívidas com juros acima de 15% ao mês (cartão de crédito) são emergência. Priorize quitá-las antes de investir.',
      'Use a estratégia "bola de neve": quite primeiro a menor dívida para ganhar motivação e momentum.',
      'Negocie sempre. Bancos preferem receber menos do que não receber nada. Busque descontos de 30-50%.',
      'Nunca use o cheque especial. Os juros chegam a 150% ao ano — é a dívida mais cara do mercado.',
    ],
  },
  {
    category: 'Comportamento',
    color: '#8b5cf6',
    icon: '🧠',
    tips: [
      'Vieses cognitivos afetam decisões financeiras. O "viés do presente" nos faz valorizar o prazer imediato mais que o futuro.',
      'Automatize tudo que puder. Decisões automáticas são melhores que decisões emocionais.',
      'Contexto importa. Fazer orçamento com fome é como ir ao mercado com fome — você gasta mais.',
      'Celebre pequenas vitórias. Atingir 25%, 50%, 75% de uma meta merece comemoração (sem gastar muito!).',
    ],
  },
];

const ECONOMIC_SCENARIOS = [
  {
    scenario: 'Alta da Selic',
    description: 'Com a taxa Selic em alta, renda fixa se torna mais atrativa. Momento ideal para Tesouro Selic e CDBs pós-fixados.',
    recommendation: 'Aumente exposição à renda fixa. CDB 110% CDI e Tesouro Selic são as melhores opções.',
    color: '#10b981',
    icon: '📊',
  },
  {
    scenario: 'Inflação Controlada',
    description: 'IPCA dentro da meta permite planejamento de longo prazo com mais previsibilidade real do seu dinheiro.',
    recommendation: 'Mantenha diversificação entre renda fixa e variável. IPCA+ para proteção do poder de compra.',
    color: '#3b82f6',
    icon: '🎯',
  },
  {
    scenario: 'Mercado de Ações',
    description: 'Bolsa em patamar histórico. Oportunidade de entrada com horizonte de 5+ anos para investidores moderados.',
    recommendation: 'ETFs como BOVA11 e IVVB11 para exposição diversificada com menor risco que ações individuais.',
    color: '#8b5cf6',
    icon: '📈',
  },
];

function ExpandableSection({ title, children, defaultOpen = false }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="metric-card overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-5 text-left"
      >
        <span className="text-white font-semibold">{title}</span>
        {open ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
      </button>
      {open && <div className="px-5 pb-5">{children}</div>}
    </div>
  );
}

export default function IAPage() {
  const { state } = useStore();
  const { incomes, expenses, currentMonth, user } = state;

  const totalIncome = getTotalIncome(incomes, currentMonth);
  const totalExpenses = getTotalExpenses(expenses, currentMonth);
  const insights = generateInsights(state);
  const allocations = getBudgetAllocations(totalIncome, expenses, currentMonth, user.financialProfile);
  const expByCategory = getExpensesByCategory(expenses, currentMonth);

  const dangerInsights = insights.filter((i) => i.type === 'danger');
  const warningInsights = insights.filter((i) => i.type === 'warning');
  const successInsights = insights.filter((i) => i.type === 'success');
  const infoInsights = insights.filter((i) => i.type === 'info');

  const insightIcon = {
    danger: { icon: AlertTriangle, color: '#ef4444', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.3)' },
    warning: { icon: AlertTriangle, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.3)' },
    success: { icon: CheckCircle, color: '#10b981', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.3)' },
    info: { icon: Info, color: '#3b82f6', bg: 'rgba(59,130,246,0.1)', border: 'rgba(59,130,246,0.3)' },
  };

  const budgetScore = allocations.filter((a) => a.spent <= a.amount).length;
  const totalAlloc = allocations.length;

  return (
    <>
      <Header title="IA Financeira" subtitle="Análises inteligentes e recomendações personalizadas" />

      <div className="flex-1 p-4 lg:p-6 space-y-6 max-w-6xl mx-auto w-full">
        {/* AI Status Card */}
        <div
          className="p-6 rounded-2xl"
          style={{
            background: 'linear-gradient(135deg, rgba(59,130,246,0.15) 0%, rgba(139,92,246,0.15) 100%)',
            border: '1px solid rgba(59,130,246,0.3)',
          }}
        >
          <div className="flex items-start gap-4">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
              style={{ background: 'rgba(59,130,246,0.2)' }}
            >
              <Brain size={28} color="#3b82f6" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-white font-bold text-lg">Análise do seu CFO Digital</h2>
                <span className="badge badge-blue" style={{ fontSize: '10px' }}>IA Ativa</span>
              </div>
              <p className="text-slate-300 text-sm leading-relaxed">
                Analisei seus dados financeiros de {new Date().toLocaleString('pt-BR', { month: 'long', year: 'numeric' })}.
                Encontrei <span className="text-red-400 font-semibold">{dangerInsights.length} ponto{dangerInsights.length !== 1 ? 's' : ''} crítico{dangerInsights.length !== 1 ? 's' : ''}</span>, {' '}
                <span className="text-yellow-400 font-semibold">{warningInsights.length} alerta{warningInsights.length !== 1 ? 's' : ''}</span> e {' '}
                <span className="text-green-400 font-semibold">{successInsights.length + infoInsights.length} oportunidade{(successInsights.length + infoInsights.length) !== 1 ? 's' : ''}</span> de melhoria.
              </p>
              <div className="flex flex-wrap gap-4 mt-3">
                <div className="text-sm">
                  <span className="text-slate-400">Orçamento no controle: </span>
                  <span className={`font-semibold ${budgetScore === totalAlloc ? 'text-green-400' : budgetScore >= totalAlloc * 0.7 ? 'text-yellow-400' : 'text-red-400'}`}>
                    {budgetScore}/{totalAlloc} categorias
                  </span>
                </div>
                <div className="text-sm">
                  <span className="text-slate-400">Perfil: </span>
                  <span className="text-blue-400 font-semibold capitalize">{user.financialProfile}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* All Insights */}
        <div>
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <Sparkles size={18} color="#8b5cf6" />
            Recomendações Personalizadas
          </h3>
          <div className="space-y-3">
            {insights.map((insight) => {
              const config = insightIcon[insight.type];
              const IconComponent = config.icon;
              return (
                <div
                  key={insight.id}
                  className="p-4 rounded-xl"
                  style={{ background: config.bg, border: `1px solid ${config.border}` }}
                >
                  <div className="flex items-start gap-3">
                    <IconComponent size={18} color={config.color} className="shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-slate-200 font-semibold text-sm mb-1">{insight.title}</p>
                      <p className="text-slate-400 text-sm leading-relaxed">{insight.description}</p>
                      {insight.action && (
                        <p className="text-xs mt-2 font-medium" style={{ color: config.color }}>→ {insight.action}</p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Budget Analysis */}
        <ExpandableSection title="Análise Detalhada do Orçamento" defaultOpen>
          <div className="space-y-4">
            {allocations.map((alloc) => {
              const pct = alloc.amount > 0 ? (alloc.spent / alloc.amount) * 100 : 0;
              const over = alloc.spent > alloc.amount;
              const diff = alloc.spent - alloc.amount;
              return (
                <div key={alloc.category} className="p-4 rounded-xl" style={{ background: 'rgba(30,41,59,0.4)' }}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-slate-200 font-medium text-sm">{alloc.label}</span>
                    <span
                      className="badge"
                      style={{
                        fontSize: '10px',
                        padding: '2px 8px',
                        background: over ? 'rgba(239,68,68,0.2)' : 'rgba(16,185,129,0.2)',
                        color: over ? '#ef4444' : '#10b981',
                      }}
                    >
                      {over ? `${formatCurrency(Math.abs(diff))} acima` : 'No controle'}
                    </span>
                  </div>
                  <div className="progress-bar mb-2">
                    <div
                      className="progress-fill"
                      style={{ width: `${Math.min(pct, 100)}%`, background: over ? '#ef4444' : alloc.color }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>Gasto: {formatCurrency(alloc.spent)}</span>
                    <span>Ideal: {formatCurrency(alloc.amount)} ({alloc.percentage}%)</span>
                  </div>
                  {over && (
                    <p className="text-xs text-red-300 mt-2">
                      💡 Para equilibrar, reduza {formatCurrency(Math.abs(diff))} nesta categoria no próximo mês.
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </ExpandableSection>

        {/* Economic Scenarios */}
        <ExpandableSection title="Cenário Econômico Atual" defaultOpen>
          <div className="grid sm:grid-cols-3 gap-4">
            {ECONOMIC_SCENARIOS.map((s) => (
              <div
                key={s.scenario}
                className="p-4 rounded-xl"
                style={{ background: `${s.color}0f`, border: `1px solid ${s.color}30` }}
              >
                <div className="text-2xl mb-2">{s.icon}</div>
                <p className="text-white font-semibold text-sm mb-2">{s.scenario}</p>
                <p className="text-slate-400 text-xs leading-relaxed mb-3">{s.description}</p>
                <div
                  className="p-2.5 rounded-lg"
                  style={{ background: `${s.color}15` }}
                >
                  <p className="text-xs font-semibold mb-0.5" style={{ color: s.color }}>Recomendação da IA:</p>
                  <p className="text-slate-300 text-xs leading-relaxed">{s.recommendation}</p>
                </div>
              </div>
            ))}
          </div>
        </ExpandableSection>

        {/* Education Tips */}
        <ExpandableSection title="Educação Financeira — Dicas da IA">
          <div className="space-y-6">
            {FINANCIAL_TIPS.map((section) => (
              <div key={section.category}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xl">{section.icon}</span>
                  <h4 className="font-semibold" style={{ color: section.color }}>{section.category}</h4>
                </div>
                <div className="space-y-2">
                  {section.tips.map((tip, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3 p-3 rounded-xl"
                      style={{ background: 'rgba(30,41,59,0.4)' }}
                    >
                      <div
                        className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold"
                        style={{ background: `${section.color}22`, color: section.color }}
                      >
                        {i + 1}
                      </div>
                      <p className="text-slate-300 text-sm leading-relaxed">{tip}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ExpandableSection>

        {/* Profile config */}
        <div className="metric-card p-6">
          <h3 className="text-white font-semibold mb-4">Configure seu Perfil para Melhores Recomendações</h3>
          <div className="grid sm:grid-cols-3 gap-4">
            {(['conservador', 'moderado', 'arrojado'] as const).map((profile) => {
              const active = user.financialProfile === profile;
              const configs = {
                conservador: {
                  label: 'Conservador',
                  desc: 'Prioriza segurança e preservação do patrimônio. Renda fixa como base.',
                  color: '#10b981',
                  alloc: '55% necessidades / 20% investimentos / 15% reserva',
                  icon: '🛡️',
                },
                moderado: {
                  label: 'Moderado',
                  desc: 'Equilíbrio entre segurança e crescimento. Mix de renda fixa e variável.',
                  color: '#3b82f6',
                  alloc: '50% necessidades / 20% investimentos / 10% reserva',
                  icon: '⚖️',
                },
                arrojado: {
                  label: 'Arrojado',
                  desc: 'Busca maximizar retornos com maior tolerância ao risco e volatilidade.',
                  color: '#8b5cf6',
                  alloc: '45% necessidades / 30% investimentos / 5% reserva',
                  icon: '🚀',
                },
              };
              const c = configs[profile];
              return (
                <div
                  key={profile}
                  className="p-4 rounded-xl cursor-pointer transition-all"
                  style={{
                    background: active ? `${c.color}15` : 'rgba(30,41,59,0.4)',
                    border: `2px solid ${active ? c.color : 'transparent'}`,
                  }}
                >
                  <div className="text-2xl mb-2">{c.icon}</div>
                  <p className="text-white font-semibold text-sm mb-1">{c.label}</p>
                  <p className="text-slate-400 text-xs leading-relaxed mb-2">{c.desc}</p>
                  <p className="text-xs font-medium" style={{ color: c.color }}>{c.alloc}</p>
                  {active && (
                    <span className="badge badge-green mt-2" style={{ fontSize: '10px' }}>Ativo</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
