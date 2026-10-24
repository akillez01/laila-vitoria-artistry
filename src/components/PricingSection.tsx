import { AlertCircle, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { api, ApiError } from '../lib/api';
import { Package } from '../types';
import { PaymentOptions } from './PaymentOptions';

const formatPrice = (priceCents: number) => new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
}).format(priceCents / 100);

export const PricingSection: React.FC = () => {
  const [packages, setPackages] = useState<Package[]>([]);
  const [checkoutPackage, setCheckoutPackage] = useState<Package | null>(null);

  useEffect(() => {
    api<{ packages: Package[] }>('/api/packages')
      .then(({ packages }) => setPackages(packages))
      .catch(() => setPackages([]));
  }, []);

  if (packages.length === 0) return null;

  return (
    <section
      className="bg-neutral-50 dark:bg-[#121315] py-16 transition-colors duration-300"
      id="pricing"
      data-motion="reveal"
    >
      <div className="max-w-[1440px] mx-auto px-5 sm:px-8 md:px-16">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="font-playfair text-3xl sm:text-4xl text-neutral-900 dark:text-white mb-4 font-bold tracking-tight">
            Coleções & Pacotes
          </h2>
          <p className="text-sm sm:text-base text-neutral-700 dark:text-neutral-300 leading-relaxed">
            Pagamento seguro via Pix ou Mercado Pago.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {packages.map((pkg) => (
            <div
              key={pkg.id}
              className="flex flex-col bg-white dark:bg-[#181a1d] border border-neutral-200 dark:border-neutral-800 rounded-lg p-6 shadow-sm"
              data-motion="reveal"
            >
              <h3 className="font-playfair text-lg font-bold text-neutral-900 dark:text-white mb-2">{pkg.name}</h3>
              <p className="editorial-package-price">{formatPrice(pkg.priceCents)}</p>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed flex-1 mb-4">
                {pkg.description}
              </p>
              <button
                onClick={() => setCheckoutPackage(pkg)}
                className="w-full bg-neutral-900 dark:bg-amber-500 text-white dark:text-neutral-950 px-4 py-2.5 text-xs font-bold uppercase tracking-widest hover:bg-neutral-800 dark:hover:bg-amber-400 transition-all rounded-md"
              >
                Consultar & Contratar
              </button>
            </div>
          ))}
        </div>

        {checkoutPackage && (
          <CheckoutModal pkg={checkoutPackage} onClose={() => setCheckoutPackage(null)} />
        )}
      </div>
    </section>
  );
};

const CheckoutModal: React.FC<{ pkg: Package; onClose: () => void }> = ({ pkg, onClose }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [orderId, setOrderId] = useState<number | null>(null);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setCreating(true);
    try {
      const { order } = await api<{ order: { id: number } }>('/api/orders', {
        method: 'POST',
        body: JSON.stringify({ packageId: pkg.id, clientName: name, clientEmail: email, clientPhone: phone }),
      });
      setOrderId(order.id);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Não foi possível criar o pedido agora.');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center px-4 animate-fadeIn">
      <div className="bg-white dark:bg-[#181a1d] rounded-lg max-w-md w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="font-playfair text-xl font-bold text-neutral-900 dark:text-white mb-1">{pkg.name}</h3>

        {orderId ? (
          <>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-6">Escolha como prefere pagar.</p>
            <PaymentOptions orderId={orderId} />
          </>
        ) : (
          <>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-6">
              Preencha seus dados para prosseguir com a contratação e o pagamento.
            </p>

            <form onSubmit={handleCreateOrder} className="space-y-3">
              <input
                type="text"
                required
                placeholder="Seu nome completo"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-neutral-100 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-md py-2.5 px-3 text-sm text-neutral-900 dark:text-white focus:outline-none focus:border-amber-500"
              />
              <input
                type="email"
                required
                placeholder="Seu email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-neutral-100 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-md py-2.5 px-3 text-sm text-neutral-900 dark:text-white focus:outline-none focus:border-amber-500"
              />
              <input
                type="tel"
                placeholder="WhatsApp (opcional)"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-neutral-100 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-md py-2.5 px-3 text-sm text-neutral-900 dark:text-white focus:outline-none focus:border-amber-500"
              />

              {error && (
                <div className="flex items-center gap-2 text-xs text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-950/50 p-3 rounded-md border border-red-200 dark:border-red-900">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={creating}
                className="w-full bg-neutral-900 dark:bg-amber-500 text-white dark:text-neutral-950 px-4 py-3 text-xs font-bold uppercase tracking-widest hover:bg-neutral-800 dark:hover:bg-amber-400 transition-all rounded-md disabled:opacity-50"
              >
                {creating ? 'Processando...' : 'Continuar para Pagamento'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};
