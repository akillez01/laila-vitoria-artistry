import { AlertCircle, KeyRound, Lock, Mail } from 'lucide-react';
import React, { useState } from 'react';
import { api, ApiError } from '../lib/api';
import { ClientGallery } from '../types';

interface ClientAccessSectionProps {
  onUnlockGallery: (gallery: ClientGallery) => void;
}

export const ClientAccessSection: React.FC<ClientAccessSectionProps> = ({ onUnlockGallery }) => {
  const [mode, setMode] = useState<'code' | 'email'>('code');
  const [code, setCode] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchGalleryByCode = async (rawCode: string) => {
    const cleanCode = rawCode.trim().toUpperCase();
    if (!cleanCode) {
      setError('Por favor, digite o código da sua galeria.');
      return;
    }
    setLoading(true);
    try {
      const { gallery } = await api<{ gallery: ClientGallery }>(`/api/galleries/${encodeURIComponent(cleanCode)}`);
      setError('');
      onUnlockGallery(gallery);
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) {
        setError(`Código "${cleanCode}" não encontrado. Confira com a fotógrafa o código da sua galeria.`);
      } else {
        setError('Não foi possível acessar a galeria agora. Tente novamente em instantes.');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchGalleryByEmail = async (rawEmail: string) => {
    const cleanEmail = rawEmail.trim();
    if (!cleanEmail) {
      setError('Por favor, digite o e-mail cadastrado na sua galeria.');
      return;
    }
    setLoading(true);
    try {
      const { gallery } = await api<{ gallery: ClientGallery }>('/api/galleries/access-by-email', {
        method: 'POST',
        body: JSON.stringify({ email: cleanEmail }),
      });
      setError('');
      onUnlockGallery(gallery);
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) {
        setError('Nenhuma galeria gratuita encontrada para esse e-mail. Confira com a fotógrafa.');
      } else {
        setError('Não foi possível acessar a galeria agora. Tente novamente em instantes.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAccess = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'code') fetchGalleryByCode(code);
    else fetchGalleryByEmail(email);
  };

  return (
    <section
      className="bg-white dark:bg-[#181a1d] border-t border-neutral-200 dark:border-neutral-800 py-16 text-center transition-colors duration-300"
      id="client-access"
      data-motion="reveal"
    >
      <div className="max-w-2xl mx-auto px-5 sm:px-8 md:px-16 flex flex-col items-center">
        <div className="w-16 h-16 rounded-full bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center mb-6 text-neutral-900 dark:text-amber-400 border border-neutral-300 dark:border-neutral-700 shadow-sm">
          <Lock className="w-8 h-8 stroke-[1.75]" />
        </div>

        <span className="text-xs uppercase tracking-[0.25em] text-amber-600 dark:text-amber-400 font-bold block mb-1">
          Proofing Privado & Seleção
        </span>
        <h2 className="font-playfair text-3xl sm:text-4xl text-neutral-900 dark:text-white mb-4 font-bold tracking-tight">
          Área Exclusiva do Cliente
        </h2>
        <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-300 mb-8 leading-relaxed max-w-xl">
          Acesse suas galerias privadas com alta resolução, selecione suas imagens preferidas e gerencie aprovações de álbuns em um ambiente seguro.
        </p>

        <div className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-900 p-1 rounded-md mb-4 text-xs font-bold uppercase tracking-wider">
          <button
            type="button"
            onClick={() => {
              setMode('code');
              setError('');
            }}
            className={`px-4 py-2 rounded transition-colors ${mode === 'code'
                ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-sm'
                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
              }`}
          >
            Tenho um código
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('email');
              setError('');
            }}
            className={`px-4 py-2 rounded transition-colors ${mode === 'email'
                ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-sm'
                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
              }`}
          >
            Recebi uma galeria gratuita
          </button>
        </div>

        <form onSubmit={handleAccess} className="w-full max-w-sm relative space-y-4" data-motion="reveal">
          {mode === 'code' ? (
            <div className="relative">
              <KeyRound className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 dark:text-amber-400" />
              <input
                type="text"
                value={code}
                onChange={(e) => {
                  setCode(e.target.value);
                  setError('');
                }}
                placeholder="CÓDIGO (ex: FESTIVAL-AM)"
                className="w-full bg-neutral-100 dark:bg-neutral-900 border-b-2 border-neutral-300 dark:border-neutral-700 py-3.5 pl-10 pr-4 text-center text-sm font-bold text-neutral-900 dark:text-white focus:outline-none focus:border-amber-500 dark:focus:border-amber-400 transition-colors placeholder:text-neutral-400 dark:placeholder:text-neutral-500 uppercase tracking-widest rounded-t-md"
              />
            </div>
          ) : (
            <div className="relative">
              <Mail className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 dark:text-amber-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError('');
                }}
                placeholder="seu-email@exemplo.com"
                className="w-full bg-neutral-100 dark:bg-neutral-900 border-b-2 border-neutral-300 dark:border-neutral-700 py-3.5 pl-10 pr-4 text-center text-sm font-bold text-neutral-900 dark:text-white focus:outline-none focus:border-amber-500 dark:focus:border-amber-400 transition-colors placeholder:text-neutral-400 dark:placeholder:text-neutral-500 tracking-wide rounded-t-md"
              />
            </div>
          )}

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
            {loading ? 'Verificando...' : 'Acessar Galeria Protegida'}
          </button>
        </form>
      </div>
    </section>
  );
};

