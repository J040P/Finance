import type { Metadata } from 'next';
import './globals.css';
import { StoreProvider } from '@/lib/store';
import { AuthProvider } from '@/lib/auth';
import AppShell from '@/components/AppShell';

export const metadata: Metadata = {
  title: 'FinanceIA - Personal CFO',
  description: 'Organize toda sua vida financeira com inteligência artificial',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className="h-full">
      <body className="h-full flex" style={{ background: '#0a0f1e' }}>
        <AuthProvider>
          <StoreProvider>
            <AppShell>{children}</AppShell>
          </StoreProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
