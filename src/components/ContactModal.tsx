import React, { useState } from 'react';
import { X, Mail, Phone, MapPin, Send, CheckCircle2, Instagram, MessageCircle } from 'lucide-react';
import { BrandLogo } from './BrandLogo';
import { INSTAGRAM_URL, INSTAGRAM_HANDLE, WHATSAPP_LINK } from '../data/photographyData';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ContactModal: React.FC<ContactModalProps> = ({ isOpen, onClose }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [eventType, setEventType] = useState('Festivais & Eventos Culturais');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
    setTimeout(() => {
      setSent(false);
      onClose();
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white dark:bg-[#121315] max-w-lg w-full rounded-lg shadow-2xl border border-neutral-300 dark:border-neutral-800 overflow-hidden flex flex-col transition-colors">
        {/* Header */}
        <div className="px-6 py-4 bg-neutral-50 dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 flex justify-between items-center">
          <div>
            <span className="text-[10px] uppercase tracking-widest text-amber-600 dark:text-amber-400 font-bold block mb-1">
              Atendimento Personalizado
            </span>
            <BrandLogo variant="full" size="sm" />
          </div>
          <button onClick={onClose} className="text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white p-1 rounded-md">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {sent ? (
            <div className="text-center py-8 space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto animate-bounce" />
              <h4 className="font-playfair text-xl text-neutral-900 dark:text-white font-bold">Mensagem Enviada!</h4>
              <p className="text-sm text-neutral-600 dark:text-neutral-300">
                Obrigado pelo contato! Layla Vitória retornará seu agendamento em até 24h úteis.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex gap-2 pb-2 border-b border-neutral-200 dark:border-neutral-800">
                <a
                  href={WHATSAPP_LINK}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 py-2 px-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 rounded-md text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-emerald-100 transition-colors"
                >
                  <MessageCircle className="w-4 h-4 fill-emerald-500/20" />
                  <span>WhatsApp (+55 92 8160-4462)</span>
                </a>
                <a
                  href={INSTAGRAM_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="py-2 px-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800 rounded-md text-rose-800 dark:text-rose-300 text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-rose-100 transition-colors"
                >
                  <Instagram className="w-4 h-4" />
                  <span>{INSTAGRAM_HANDLE}</span>
                </a>
              </div>

              <div>
                <label className="text-xs font-bold uppercase text-neutral-700 dark:text-neutral-300 block mb-1">Seu Nome</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Seu nome completo"
                  className="w-full bg-neutral-100 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-sm text-neutral-900 dark:text-white p-3 rounded-md focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold uppercase text-neutral-700 dark:text-neutral-300 block mb-1">E-mail</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seuemail@exemplo.com"
                    className="w-full bg-neutral-100 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-sm text-neutral-900 dark:text-white p-3 rounded-md focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase text-neutral-700 dark:text-neutral-300 block mb-1">WhatsApp</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+55 92 8160-4462"
                    className="w-full bg-neutral-100 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-sm text-neutral-900 dark:text-white p-3 rounded-md focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase text-neutral-700 dark:text-neutral-300 block mb-1">Tipo de Serviço / Projeto</label>
                <select
                  value={eventType}
                  onChange={(e) => setEventType(e.target.value)}
                  className="w-full bg-neutral-100 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-sm text-neutral-900 dark:text-white p-3 rounded-md focus:outline-none focus:border-amber-500"
                >
                  <option value="Festivais & Eventos Culturais">Festivais & Eventos Culturais (Boi Bumbá, Folclore)</option>
                  <option value="Casamento Fine Art">Casamento Fine Art / Mini Wedding</option>
                  <option value="Retrato Corporativo / Fine Art">Retrato Pessoal / Corporativo</option>
                  <option value="Editorial de Moda">Editorial de Moda & Marcas</option>
                  <option value="Outro Projeto Especial">Outro Projeto Especial</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold uppercase text-neutral-700 dark:text-neutral-300 block mb-1">Mensagem ou Data do Evento</label>
                <textarea
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Conte-nos detalhes sobre o local, data prevista ou conceito desejado..."
                  className="w-full bg-neutral-100 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-sm text-neutral-900 dark:text-white p-3 rounded-md focus:outline-none focus:border-amber-500 resize-none"
                />
              </div>

              <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
                <a
                  href={WHATSAPP_LINK}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-emerald-600 dark:text-emerald-400 font-bold hover:underline flex items-center gap-1.5"
                >
                  <Phone className="w-3.5 h-3.5" /> Chamar no WhatsApp Direto
                </a>

                <button
                  type="submit"
                  className="bg-neutral-900 dark:bg-amber-500 text-white dark:text-neutral-950 px-6 py-2.5 text-xs font-bold uppercase tracking-wider rounded-md hover:bg-neutral-800 dark:hover:bg-amber-400 transition-all flex items-center gap-1.5 shadow"
                >
                  <Send className="w-3.5 h-3.5" /> Enviar Mensagem
                </button>
              </div>
            </form>
          )}

          <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-neutral-600 dark:text-neutral-400">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 shrink-0 text-amber-500" />
              <span>Manaus - AM, Brasil</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 shrink-0 text-amber-500" />
              <span>laaylalopezz@gmail.com</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

