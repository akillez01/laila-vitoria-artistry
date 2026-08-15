import React, { useState } from 'react';
import { CreditCard, QrCode, AlertCircle, Copy, Check } from 'lucide-react';
import { api, ApiError } from '../lib/api';

interface PaymentOptionsProps {
  orderId: number;
}

export const PaymentOptions: React.FC<PaymentOptionsProps> = ({ orderId }) => {
  const [pixData, setPixData] = useState<{ payload: string; qrCodeDataUrl: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState<'mp' | 'pix' | null>(null);
  const [error, setError] = useState('');

  const handleMercadoPago = async () => {
    setError('');
    setLoading('mp');
    try {
      const { initPoint, sandboxInitPoint } = await api<{ initPoint?: string; sandboxInitPoint?: string }>(
        '/api/payments/preference',
        { method: 'POST', body: JSON.stringify({ orderId }) }
      );
      const redirectUrl = initPoint || sandboxInitPoint;
      if (!redirectUrl) throw new Error('Mercado Pago não retornou um link de pagamento.');
      window.location.href = redirectUrl;
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'Pagamento com Mercado Pago ainda não está configurado. Tente o Pix ou fale com a Laila pelo WhatsApp.'
      );
      setLoading(null);
    }
  };

  const handlePix = async () => {
    setError('');
    setLoading('pix');
    try {
      const data = await api<{ payload: string; qrCodeDataUrl: string }>('/api/payments/pix', {
        method: 'POST',
        body: JSON.stringify({ orderId }),
      });
      setPixData(data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Não foi possível gerar o QR Code Pix agora.');
    } finally {
      setLoading(null);
    }
  };

  const handleCopyPayload = () => {
    if (!pixData) return;
    navigator.clipboard.writeText(pixData.payload);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (pixData) {
    return (
      <div className="text-center">
        <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
          Abra o app do seu banco, escaneie o QR Code ou use o "Pix Copia e Cola".
        </p>
        <img
          src={pixData.qrCodeDataUrl}
          alt="QR Code Pix"
          className="mx-auto mb-4 rounded-md border border-neutral-200 dark:border-neutral-700"
        />
        <button
          onClick={handleCopyPayload}
          className="w-full flex items-center justify-center gap-2 bg-neutral-100 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white px-4 py-2.5 text-xs font-bold uppercase tracking-widest rounded-md hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
          {copied ? 'Copiado!' : 'Copiar código Pix'}
        </button>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-4">
          Assim que o pagamento for confirmado pela Laila, seu pedido é atualizado automaticamente.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {error && (
        <div className="flex items-center gap-2 text-xs text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-950/50 p-3 rounded-md border border-red-200 dark:border-red-900">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
          <span>{error}</span>
        </div>
      )}

      <button
        type="button"
        onClick={handlePix}
        disabled={loading !== null}
        className="w-full bg-emerald-600 text-white px-4 py-3 text-xs font-bold uppercase tracking-widest hover:bg-emerald-700 transition-all rounded-md flex items-center justify-center gap-2 disabled:opacity-50"
      >
        <QrCode className="w-4 h-4" />
        {loading === 'pix' ? 'Gerando QR Code...' : 'Pagar com Pix (QR Code)'}
      </button>

      <button
        type="button"
        onClick={handleMercadoPago}
        disabled={loading !== null}
        className="w-full bg-neutral-900 dark:bg-amber-500 text-white dark:text-neutral-950 px-4 py-3 text-xs font-bold uppercase tracking-widest hover:bg-neutral-800 dark:hover:bg-amber-400 transition-all rounded-md flex items-center justify-center gap-2 disabled:opacity-50"
      >
        <CreditCard className="w-4 h-4" />
        {loading === 'mp' ? 'Redirecionando...' : 'Pagar com Mercado Pago (Cartão/Boleto)'}
      </button>
    </div>
  );
};
