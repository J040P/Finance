'use client';

import React, { createContext, useContext, useReducer, useEffect, useRef } from 'react';
import { AppState, IncomeSource, Expense, Investment, Goal, UserProfile } from './types';

const currentMonth = new Date().toISOString().slice(0, 7);

const defaultState: AppState = {
  user: {
    name: '',
    age: 0,
    financialProfile: 'moderado',
    objectives: [],
    setupComplete: false,
  },
  incomes: [],
  expenses: [],
  investments: [],
  goals: [],
  currentMonth,
};

type Action =
  | { type: 'SET_USER'; payload: Partial<UserProfile> }
  | { type: 'ADD_INCOME'; payload: IncomeSource }
  | { type: 'REMOVE_INCOME'; payload: string }
  | { type: 'ADD_EXPENSE'; payload: Expense }
  | { type: 'REMOVE_EXPENSE'; payload: string }
  | { type: 'ADD_INVESTMENT'; payload: Investment }
  | { type: 'REMOVE_INVESTMENT'; payload: string }
  | { type: 'ADD_GOAL'; payload: Goal }
  | { type: 'UPDATE_GOAL'; payload: Goal }
  | { type: 'REMOVE_GOAL'; payload: string }
  | { type: 'SET_MONTH'; payload: string }
  | { type: 'LOAD_STATE'; payload: AppState };

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: { ...state.user, ...action.payload } };
    case 'ADD_INCOME':
      return { ...state, incomes: [...state.incomes, action.payload] };
    case 'REMOVE_INCOME':
      return { ...state, incomes: state.incomes.filter((i) => i.id !== action.payload) };
    case 'ADD_EXPENSE':
      return { ...state, expenses: [...state.expenses, action.payload] };
    case 'REMOVE_EXPENSE':
      return { ...state, expenses: state.expenses.filter((e) => e.id !== action.payload) };
    case 'ADD_INVESTMENT':
      return { ...state, investments: [...state.investments, action.payload] };
    case 'REMOVE_INVESTMENT':
      return { ...state, investments: state.investments.filter((i) => i.id !== action.payload) };
    case 'ADD_GOAL':
      return { ...state, goals: [...state.goals, action.payload] };
    case 'UPDATE_GOAL':
      return { ...state, goals: state.goals.map((g) => (g.id === action.payload.id ? action.payload : g)) };
    case 'REMOVE_GOAL':
      return { ...state, goals: state.goals.filter((g) => g.id !== action.payload) };
    case 'SET_MONTH':
      return { ...state, currentMonth: action.payload };
    case 'LOAD_STATE':
      return action.payload;
    default:
      return state;
  }
}

function getToken() {
  return typeof window !== 'undefined' ? localStorage.getItem('finance_token') : null;
}

async function fetchFromAPI(): Promise<AppState | null> {
  const token = getToken();
  if (!token) return null;
  try {
    const res = await fetch('/api/user/data', {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

async function saveToAPI(state: AppState) {
  const token = getToken();
  if (!token) return;
  try {
    await fetch('/api/user/data', {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(state),
    });
  } catch {}
}

const StoreContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<Action>;
  isLoading: boolean;
} | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, defaultState);
  const [isLoading, setIsLoading] = React.useState(true);
  const isInitialized = useRef(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Carrega dados do servidor ao inicializar
  useEffect(() => {
    async function init() {
      const token = getToken();
      if (!token) {
        setIsLoading(false);
        return;
      }
      const data = await fetchFromAPI();
      if (data) {
        dispatch({ type: 'LOAD_STATE', payload: data });
      }
      setIsLoading(false);
      isInitialized.current = true;
    }
    init();
  }, []);

  // Salva no servidor com debounce de 1.5s após qualquer mudança
  useEffect(() => {
    if (!isInitialized.current) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      saveToAPI(state);
    }, 1500);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [state]);

  return (
    <StoreContext.Provider value={{ state, dispatch, isLoading }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}
