'use client';

import { useAuth } from '@/lib/auth';
import { useStore } from '@/lib/store';
import Sidebar from './Sidebar';
import Onboarding from './Onboarding';
import AuthScreen from './AuthScreen';
import { Loader2 } from 'lucide-react';

function LoadingScreen() {
  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: '#0a0f1e' }}
    >
      <div className="flex flex-col items-center gap-4">
        <Loader2 size={36} className="text-blue-400 animate-spin" />
        <p className="text-slate-400 text-sm">Carregando seus dados...</p>
      </div>
    </div>
  );
}

function AppContent({ children }: { children: React.ReactNode }) {
  const { state, isLoading } = useStore();

  if (isLoading) return <LoadingScreen />;
  if (!state.user.setupComplete) return <Onboarding />;

  return (
    <>
      <Sidebar />
      <main className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
        {children}
      </main>
    </>
  );
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <LoadingScreen />;
  if (!isAuthenticated) return <AuthScreen />;

  return <AppContent>{children}</AppContent>;
}
