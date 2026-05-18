export type IncomeSource = {
  id: string;
  name: string;
  type: 'salario' | 'freela' | 'comissao' | 'investimento' | 'aluguel' | 'venda' | 'outro';
  amount: number;
  recurring: boolean;
  month: string; // YYYY-MM
};

export type Expense = {
  id: string;
  name: string;
  category: ExpenseCategory;
  amount: number;
  type: 'fixo' | 'variavel';
  month: string; // YYYY-MM
  date?: string;
  notes?: string;
};

export type ExpenseCategory =
  | 'moradia'
  | 'alimentacao'
  | 'transporte'
  | 'saude'
  | 'educacao'
  | 'lazer'
  | 'vestuario'
  | 'tecnologia'
  | 'assinaturas'
  | 'dividas'
  | 'outros';

export type Investment = {
  id: string;
  name: string;
  type: InvestmentType;
  amount: number;
  returnRate: number; // % ao ano
  startDate: string;
  notes?: string;
};

export type InvestmentType =
  | 'tesouro'
  | 'cdb'
  | 'lci_lca'
  | 'acoes'
  | 'etf'
  | 'fii'
  | 'criptomoedas'
  | 'previdencia'
  | 'poupanca'
  | 'outro';

export type Goal = {
  id: string;
  name: string;
  type: GoalType;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  monthlyContribution: number;
  color: string;
  icon: string;
};

export type GoalType =
  | 'carro'
  | 'viagem'
  | 'imovel'
  | 'educacao'
  | 'empresa'
  | 'aposentadoria'
  | 'divida'
  | 'emergencia'
  | 'outro';

export type UserProfile = {
  name: string;
  age: number;
  financialProfile: 'conservador' | 'moderado' | 'arrojado';
  objectives: string[];
  setupComplete: boolean;
};

export type BudgetAllocation = {
  category: string;
  label: string;
  percentage: number;
  amount: number;
  color: string;
  spent: number;
};

export type AIInsight = {
  id: string;
  type: 'warning' | 'success' | 'info' | 'danger';
  title: string;
  description: string;
  action?: string;
};

export type AppState = {
  user: UserProfile;
  incomes: IncomeSource[];
  expenses: Expense[];
  investments: Investment[];
  goals: Goal[];
  currentMonth: string;
};
