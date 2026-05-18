'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { Wallet, Eye, EyeOff, Mail, Lock, User, Loader2 } from 'lucide-react';

export default function AuthScreen() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result =
      mode === 'login'
        ? await login(email, password)
        : await register(email, password, name);

    if (result.error) {
      setError(result.error);
      setLoading(false);
    }
    // Se sucesso, o AuthProvider atualiza o token e o AppShell redireciona
  }

  function switchMode() {
    setMode(mode === 'login' ? 'register' : 'login');
    setError('');
    setName('');
    setEmail('');
    setPassword('');
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-4"
      style={{ background: 'linear-gradient(135deg, #0a0f1e 0%, #0d1a35 60%, #0a0f1e 100%)' }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 mb-10">
        <div className="w-12 h-12 rounded-2xl gradient-blue flex items-center justify-center shadow-lg shadow-blue-900/40">
          <Wallet className="w-6 h-6 text-white" />
        </div>
        <div>
          <div className="text-white font-bold text-2xl tracking-tight">FinanceIA</div>
          <div className="text-blue-400 text-sm">Personal CFO</div>
        </div>
      </div>

      {/* Card */}
      <div
        className="w-full max-w-md rounded-2xl p-8 slide-in"
        style={{ background: '#0d1425', border: '1px solid rgba(37,99,235,0.25)' }}
      >
        <h2 className="text-white font-bold text-xl mb-1">
          {mode === 'login' ? 'Bem-vindo de volta' : 'Crie sua conta'}
        </h2>
        <p className="text-slate-400 text-sm mb-7">
          {mode === 'login'
            ? 'Entre para acessar sua vida financeira'
            : 'Comece a organizar suas finanças agora'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div className="relative">
              <label className="block text-slate-400 text-sm mb-1.5">Seu nome</label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  placeholder="João Pedro"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  style={{ paddingLeft: '36px' }}
                  autoFocus
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-slate-400 text-sm mb-1.5">E-mail</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{ paddingLeft: '36px' }}
                autoFocus={mode === 'login'}
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 text-sm mb-1.5">Senha</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type={showPass ? 'text' : 'password'}
                placeholder={mode === 'register' ? 'Mínimo 6 caracteres' : '••••••••'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ paddingLeft: '36px', paddingRight: '40px' }}
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && (
            <div
              className="p-3 rounded-xl text-sm flex items-center gap-2"
              style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5' }}
            >
              <span>⚠</span> {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-3 text-base flex items-center justify-center gap-2 mt-2"
            style={{ opacity: loading ? 0.7 : 1 }}
          >
            {loading && <Loader2 size={18} className="animate-spin" />}
            {loading ? 'Aguarde...' : mode === 'login' ? 'Entrar' : 'Criar conta'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <span className="text-slate-500 text-sm">
            {mode === 'login' ? 'Não tem conta?' : 'Já tem conta?'}
          </span>{' '}
          <button
            onClick={switchMode}
            className="text-blue-400 text-sm font-semibold hover:text-blue-300"
          >
            {mode === 'login' ? 'Criar conta grátis' : 'Fazer login'}
          </button>
        </div>
      </div>

      <p className="text-slate-600 text-xs mt-6">
        Seus dados ficam salvos com segurança no servidor local.
      </p>
    </div>
  );
}
