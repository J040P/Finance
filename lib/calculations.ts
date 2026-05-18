import { AppState, BudgetAllocation, AIInsight, Expense, IncomeSource } from './types';

export function getTotalIncome(incomes: IncomeSource[], month: string): number {
  return incomes.filter((i) => i.month === month || i.recurring).reduce((s, i) => s + i.amount, 0);
}

export function getTotalExpenses(expenses: Expense[], month: string): number {
  return expenses.filter((e) => e.month === month).reduce((s, e) => s + e.amount, 0);
}

export function getExpensesByCategory(expenses: Expense[], month: string) {
  const filtered = expenses.filter((e) => e.month === month);
  const map: Record<string, number> = {};
  filtered.forEach((e) => {
    map[e.category] = (map[e.category] || 0) + e.amount;
  });
  return map;
}

export function getHealthScore(totalIncome: number, totalExpenses: number, hasEmergencyFund: boolean): number {
  if (totalIncome === 0) return 0;
  const ratio = totalExpenses / totalIncome;
  let score = 100;

  if (ratio > 0.9) score -= 40;
  else if (ratio > 0.8) score -= 25;
  else if (ratio > 0.7) score -= 15;
  else if (ratio > 0.6) score -= 5;

  if (!hasEmergencyFund) score -= 20;
  if (score < 0) score = 0;
  return Math.round(score);
}

export function getHealthLabel(score: number): { label: string; color: string } {
  if (score >= 80) return { label: 'Excelente', color: '#10b981' };
  if (score >= 60) return { label: 'Boa', color: '#3b82f6' };
  if (score >= 40) return { label: 'Regular', color: '#f59e0b' };
  return { label: 'Crítica', color: '#ef4444' };
}

export function getBudgetAllocations(totalIncome: number, expenses: Expense[], month: string, profile: string): BudgetAllocation[] {
  let allocations: { category: string; label: string; percentage: number; color: string }[] = [];

  if (profile === 'conservador') {
    allocations = [
      { category: 'necessidades', label: 'Necessidades', percentage: 55, color: '#3b82f6' },
      { category: 'investimentos', label: 'Investimentos', percentage: 20, color: '#10b981' },
      { category: 'reserva', label: 'Reserva Emergência', percentage: 15, color: '#8b5cf6' },
      { category: 'lazer', label: 'Lazer', percentage: 5, color: '#f59e0b' },
      { category: 'crescimento', label: 'Crescimento Pessoal', percentage: 5, color: '#06b6d4' },
    ];
  } else if (profile === 'arrojado') {
    allocations = [
      { category: 'necessidades', label: 'Necessidades', percentage: 45, color: '#3b82f6' },
      { category: 'investimentos', label: 'Investimentos', percentage: 30, color: '#10b981' },
      { category: 'reserva', label: 'Reserva Emergência', percentage: 5, color: '#8b5cf6' },
      { category: 'lazer', label: 'Lazer', percentage: 10, color: '#f59e0b' },
      { category: 'crescimento', label: 'Crescimento Pessoal', percentage: 10, color: '#06b6d4' },
    ];
  } else {
    // moderado
    allocations = [
      { category: 'necessidades', label: 'Necessidades', percentage: 50, color: '#3b82f6' },
      { category: 'investimentos', label: 'Investimentos', percentage: 20, color: '#10b981' },
      { category: 'reserva', label: 'Reserva Emergência', percentage: 10, color: '#8b5cf6' },
      { category: 'lazer', label: 'Lazer', percentage: 10, color: '#f59e0b' },
      { category: 'crescimento', label: 'Crescimento Pessoal', percentage: 10, color: '#06b6d4' },
    ];
  }

  const categoryMap: Record<string, string[]> = {
    necessidades: ['moradia', 'alimentacao', 'transporte', 'saude', 'dividas', 'assinaturas'],
    lazer: ['lazer', 'vestuario'],
    crescimento: ['educacao', 'tecnologia'],
    investimentos: [],
    reserva: [],
  };

  const monthExpenses = expenses.filter((e) => e.month === month);

  return allocations.map((a) => {
    const cats = categoryMap[a.category] || [];
    const spent = monthExpenses.filter((e) => cats.includes(e.category)).reduce((s, e) => s + e.amount, 0);
    return {
      ...a,
      amount: (totalIncome * a.percentage) / 100,
      spent,
    };
  });
}

export function generateInsights(state: AppState): AIInsight[] {
  const { incomes, expenses, investments, goals, currentMonth, user } = state;
  const insights: AIInsight[] = [];

  const totalIncome = getTotalIncome(incomes, currentMonth);
  const totalExpenses = getTotalExpenses(expenses, currentMonth);
  const balance = totalIncome - totalExpenses;
  const expenseRatio = totalIncome > 0 ? (totalExpenses / totalIncome) * 100 : 0;

  const expByCategory = getExpensesByCategory(expenses, currentMonth);
  const lazerPercent = totalIncome > 0 ? ((expByCategory['lazer'] || 0) / totalIncome) * 100 : 0;
  const alimentacaoPercent = totalIncome > 0 ? ((expByCategory['alimentacao'] || 0) / totalIncome) * 100 : 0;

  const idealLazer = user.financialProfile === 'conservador' ? 5 : 10;
  const idealAlimentacao = 20;

  if (lazerPercent > idealLazer * 1.3) {
    insights.push({
      id: 'lazer-alto',
      type: 'warning',
      title: 'Gastos com lazer acima do ideal',
      description: `Você está gastando ${lazerPercent.toFixed(0)}% da sua renda em lazer. O ideal para seu perfil é até ${idealLazer}%. Reduzir esses gastos pode liberar ${formatCurrency((expByCategory['lazer'] || 0) - (totalIncome * idealLazer) / 100)} por mês para investimentos.`,
      action: 'Ver gastos de lazer',
    });
  }

  if (alimentacaoPercent > idealAlimentacao) {
    insights.push({
      id: 'alimentacao-alto',
      type: 'warning',
      title: 'Gastos com alimentação elevados',
      description: `Alimentação representa ${alimentacaoPercent.toFixed(0)}% da sua renda. Cozinhar mais em casa pode economizar até ${formatCurrency((expByCategory['alimentacao'] || 0) * 0.3)} por mês.`,
    });
  }

  if (expenseRatio > 90) {
    insights.push({
      id: 'fluxo-critico',
      type: 'danger',
      title: 'Fluxo de caixa crítico',
      description: `${expenseRatio.toFixed(0)}% da sua renda está comprometida. Seu saldo livre é apenas ${formatCurrency(balance)}. Urgente: revise seus gastos fixos.`,
      action: 'Ver todos os gastos',
    });
  } else if (expenseRatio > 75) {
    insights.push({
      id: 'fluxo-atencao',
      type: 'warning',
      title: 'Atenção ao orçamento',
      description: `${expenseRatio.toFixed(0)}% da sua renda está comprometida. Você tem ${formatCurrency(balance)} de saldo livre. Considere reduzir gastos variáveis.`,
    });
  }

  if (balance > 500) {
    const suggestion = balance * 0.5;
    insights.push({
      id: 'sobra-investir',
      type: 'success',
      title: 'Oportunidade de investimento',
      description: `Você tem ${formatCurrency(balance)} sobrando este mês. Investir ${formatCurrency(suggestion)} em Tesouro Selic por 5 anos pode gerar ${formatCurrency(suggestion * Math.pow(1.1, 5) - suggestion)} de rentabilidade.`,
      action: 'Ver investimentos',
    });
  }

  const hasInvestments = investments.length > 0;
  if (!hasInvestments) {
    insights.push({
      id: 'sem-investimentos',
      type: 'info',
      title: 'Comece a investir agora',
      description: 'Você ainda não tem investimentos registrados. Mesmo R$200/mês em Tesouro Selic por 10 anos pode gerar mais de R$40.000 com juros compostos.',
      action: 'Adicionar investimento',
    });
  }

  const emergencyGoal = goals.find((g) => g.type === 'emergencia');
  if (!emergencyGoal) {
    insights.push({
      id: 'sem-reserva',
      type: 'danger',
      title: 'Sem reserva de emergência',
      description: `Você não tem uma meta de reserva de emergência. O ideal é ter entre 3 e 6 meses de gastos (${formatCurrency(totalExpenses * 3)} – ${formatCurrency(totalExpenses * 6)}) guardados.`,
      action: 'Criar meta',
    });
  } else {
    const progress = (emergencyGoal.currentAmount / emergencyGoal.targetAmount) * 100;
    if (progress < 50) {
      insights.push({
        id: 'reserva-baixa',
        type: 'warning',
        title: 'Reserva de emergência incompleta',
        description: `Sua reserva está em ${progress.toFixed(0)}% do objetivo. Continue contribuindo com ${formatCurrency(emergencyGoal.monthlyContribution)}/mês para atingir a meta.`,
      });
    }
  }

  if (investments.length > 0) {
    const totalInvested = investments.reduce((s, i) => s + i.amount, 0);
    const avgReturn = investments.reduce((s, i) => s + i.returnRate, 0) / investments.length;
    const projected5y = totalInvested * Math.pow(1 + avgReturn / 100, 5);
    insights.push({
      id: 'projecao-investimentos',
      type: 'info',
      title: 'Projeção da carteira',
      description: `Sua carteira de ${formatCurrency(totalInvested)} com rendimento médio de ${avgReturn.toFixed(1)}% a.a. pode chegar a ${formatCurrency(projected5y)} em 5 anos.`,
    });
  }

  return insights.slice(0, 6);
}

export function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function getMonthLabel(month: string): string {
  const [year, m] = month.split('-');
  const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  return `${months[parseInt(m) - 1]}/${year}`;
}

export function getLast6Months(): string[] {
  const months = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(d.toISOString().slice(0, 7));
  }
  return months;
}

export function calculateGoalMonthsRemaining(goal: { targetAmount: number; currentAmount: number; monthlyContribution: number }): number {
  const remaining = goal.targetAmount - goal.currentAmount;
  if (goal.monthlyContribution <= 0) return Infinity;
  return Math.ceil(remaining / goal.monthlyContribution);
}

export function projectInvestment(principal: number, monthlyContribution: number, annualRate: number, years: number): number[] {
  const monthlyRate = annualRate / 100 / 12;
  const points: number[] = [];
  let balance = principal;
  for (let m = 0; m <= years * 12; m++) {
    if (m % 12 === 0) points.push(Math.round(balance));
    balance = balance * (1 + monthlyRate) + monthlyContribution;
  }
  return points;
}

export const categoryLabels: Record<string, string> = {
  moradia: 'Moradia',
  alimentacao: 'Alimentação',
  transporte: 'Transporte',
  saude: 'Saúde',
  educacao: 'Educação',
  lazer: 'Lazer',
  vestuario: 'Vestuário',
  tecnologia: 'Tecnologia',
  assinaturas: 'Assinaturas',
  dividas: 'Dívidas',
  outros: 'Outros',
};

export const categoryColors: Record<string, string> = {
  moradia: '#3b82f6',
  alimentacao: '#10b981',
  transporte: '#f59e0b',
  saude: '#ef4444',
  educacao: '#8b5cf6',
  lazer: '#06b6d4',
  vestuario: '#ec4899',
  tecnologia: '#6366f1',
  assinaturas: '#84cc16',
  dividas: '#f97316',
  outros: '#94a3b8',
};

export const incomeTypeLabels: Record<string, string> = {
  salario: 'Salário',
  freela: 'Freela',
  comissao: 'Comissão',
  investimento: 'Investimento',
  aluguel: 'Aluguel',
  venda: 'Venda',
  outro: 'Outro',
};

export const investmentTypeLabels: Record<string, string> = {
  tesouro: 'Tesouro Direto',
  cdb: 'CDB',
  lci_lca: 'LCI/LCA',
  acoes: 'Ações',
  etf: 'ETF',
  fii: 'Fundos Imobiliários',
  criptomoedas: 'Criptomoedas',
  previdencia: 'Previdência',
  poupanca: 'Poupança',
  outro: 'Outro',
};

export const investmentColors: Record<string, string> = {
  tesouro: '#10b981',
  cdb: '#3b82f6',
  lci_lca: '#06b6d4',
  acoes: '#f59e0b',
  etf: '#8b5cf6',
  fii: '#ec4899',
  criptomoedas: '#f97316',
  previdencia: '#84cc16',
  poupanca: '#94a3b8',
  outro: '#64748b',
};
