import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, X, Bot, User, RefreshCw, MessageSquare } from 'lucide-react';
import { ChatMessage } from '../types';

interface GeminiChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GeminiChatDrawer: React.FC<GeminiChatDrawerProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      content:
        'Olá! Sou a Consultora Virtual de Fotografia da Laila Vitória Artistry. Como posso orientar você hoje sobre nossos pacotes, estúdio no Planalto ou preparação de estilo para seu ensaio?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || loading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newHistory.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Erro ao conectar com a assistente virtual.');
      }

      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: data.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: `Desculpe, ocorreu um erro: ${err.message || 'Tente novamente em instantes.'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const quickPrompts = [
    'Quais os pacotes para casamentos?',
    'Dicas de roupas para ensaio em estúdio',
    'Como funciona o acesso à galeria privada?',
    'Onde fica o estúdio em Manaus?',
  ];

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-[#ffffff] shadow-2xl border-l border-[#c4c7c7] flex flex-col animate-slideLeft">
      {/* Drawer Header */}
      <div className="bg-[#1a1c1c] text-white px-5 py-4 flex items-center justify-between border-b border-[#444748]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center border border-amber-500/40">
            <Sparkles className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <h3 className="font-playfair text-base text-white font-medium">
              Consultora Virtual
            </h3>
            <span className="text-[10px] text-[#c6c6c7] block">Laila Vitória Artistry Assistant</span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="text-[#c6c6c7] hover:text-white p-1 rounded hover:bg-[#2f3131] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages Thread */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#f9f9f9]">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 ${
              msg.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {msg.role === 'model' && (
              <div className="w-7 h-7 rounded-full bg-[#1a1c1c] text-white flex items-center justify-center shrink-0 mt-0.5">
                <Bot className="w-4 h-4 text-amber-400" />
              </div>
            )}

            <div
              className={`max-w-[82%] rounded-lg px-4 py-3 text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-[#000000] text-white rounded-br-none'
                  : 'bg-white text-[#1a1c1c] border border-[#e2e2e2] shadow-xs rounded-bl-none'
              }`}
            >
              <p className="whitespace-pre-line font-inter">{msg.content}</p>
              <span
                className={`text-[10px] block mt-1.5 ${
                  msg.role === 'user' ? 'text-neutral-400 text-right' : 'text-[#747878]'
                }`}
              >
                {msg.timestamp}
              </span>
            </div>

            {msg.role === 'user' && (
              <div className="w-7 h-7 rounded-full bg-[#eeeeee] text-[#1a1c1c] flex items-center justify-center shrink-0 mt-0.5 border border-[#c6c6c7]">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex gap-3 items-center text-xs text-[#747878] bg-white p-3 rounded border border-[#e2e2e2] w-fit">
            <RefreshCw className="w-4 h-4 animate-spin text-amber-600" />
            <span>Consultando assistente virtual...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts */}
      <div className="p-3 bg-white border-t border-[#eeeeee] overflow-x-auto flex gap-2 no-scrollbar">
        {quickPrompts.map((p, i) => (
          <button
            key={i}
            onClick={() => handleSendMessage(p)}
            className="text-[11px] bg-[#f3f3f4] hover:bg-[#e2e2e2] text-[#1a1c1c] px-3 py-1.5 rounded whitespace-nowrap border border-[#c4c7c7]/40 shrink-0 transition-colors"
          >
            {p}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="p-4 bg-white border-t border-[#c4c7c7] flex items-center gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Escreva sua dúvida sobre o ensaio..."
          className="flex-1 bg-[#f9f9f9] border border-[#c6c6c7] text-sm text-[#1a1c1c] px-4 py-2.5 rounded focus:outline-none focus:border-black transition-colors"
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="bg-[#000000] text-white p-2.5 rounded hover:bg-[#2f3131] transition-colors disabled:opacity-40"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
