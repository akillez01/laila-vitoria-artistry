import React, { useState } from 'react';
import { Lock, Mail, KeyRound, AlertCircle, ArrowLeft } from 'lucide-react';
import { api, ApiError } from '../lib/api';
import { AdminProfile } from '../types';

interface AdminLoginProps {
  onSuccess: (profile: AdminProfile) => void;
  onBack: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onSuccess, onBack }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { profile } = await api<{ profile: AdminProfile }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      onSuccess(profile);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Falha ao entrar. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-neutral-50 dark:bg-[#121315] px-5 py-16 transition-colors duration-300">
      <div className="w-full max-w-sm flex flex-col items-center">
        <div className="w-16 h-16 rounded-full bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center mb-6 text-neutral-900 dark:text-amber-400 border border-neutral-300 dark:border-neutral-700 shadow-sm">
          <Lock className="w-8 h-8 stroke-[1.75]" />
        </div>

        <span className="text-xs uppercase tracking-[0.25em] text-amber-600 dark:text-amber-400 font-bold block mb-1">
          Acesso Restrito
        </span>
        <h1 className="font-playfair text-2xl sm:text-3xl text-neutral-900 dark:text-white mb-8 font-bold tracking-tight text-center">
          Painel Administrativo
        </h1>

        <form onSubmit={handleSubmit} className="w-full space-y-4">
          <div className="relative">
            <Mail className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 dark:text-amber-400" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              autoComplete="username"
              required
              className="w-full bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 py-3 pl-10 pr-4 text-sm text-neutral-900 dark:text-white focus:outline-none focus:border-amber-500 dark:focus:border-amber-400 transition-colors rounded-md"
            />
          </div>

          <div className="relative">
            <KeyRound className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 dark:text-amber-400" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Senha"
              autoComplete="current-password"
              required
              className="w-full bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 py-3 pl-10 pr-4 text-sm text-neutral-900 dark:text-white focus:outline-none focus:border-amber-500 dark:focus:border-amber-400 transition-colors rounded-md"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 text-xs text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-950/50 p-3 rounded-md text-left border border-red-200 dark:border-red-900">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-neutral-900 dark:bg-amber-500 text-white dark:text-neutral-950 px-6 py-3.5 text-xs font-bold uppercase tracking-widest hover:bg-neutral-800 dark:hover:bg-amber-400 transition-all rounded-md shadow-md disabled:opacity-50"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <button
          onClick={onBack}
          className="mt-8 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-neutral-500 hover:text-neutral-900 dark:hover:text-amber-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar ao Portfólio
        </button>
      </div>
    </div>
  );
};
