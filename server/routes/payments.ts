import { Router } from 'express';
import QRCode from 'qrcode';
import { MercadoPagoConfig, Preference, Payment } from 'mercadopago';
import { db } from '../db.js';
import { toOrder, type OrderRow } from './orders.js';
import { buildPixPayload } from '../pix.js';

export const paymentsRouter = Router();

function getClient(): MercadoPagoConfig {
  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!accessToken) {
    throw new Error('MERCADOPAGO_ACCESS_TOKEN não configurado.');
  }
  return new MercadoPagoConfig({ accessToken });
}

// Public: create a Mercado Pago Checkout Pro preference (PIX, cartão e boleto habilitados) for an order
paymentsRouter.post('/payments/preference', async (req, res) => {
  const { orderId } = req.body || {};
  if (!orderId) return res.status(400).json({ error: 'orderId é obrigatório.' });

  const order = await db.get('SELECT * FROM orders WHERE id = ?', orderId) as OrderRow | undefined;
  if (!order) return res.status(404).json({ error: 'Pedido não encontrado.' });
  if (order.status === 'approved') return res.status(409).json({ error: 'Pedido já foi pago.' });

  const pkg = await db.get('SELECT name FROM packages WHERE id = ?', order.package_id) as
    | { name: string }
    | undefined;

  const appUrl = (process.env.APP_URL || 'http://localhost:3000').replace(/\/$/, '');

  try {
    const client = getClient();
    const preference = new Preference(client);
    const result = await preference.create({
      body: {
        items: [
          {
            id: String(order.id),
            title: pkg?.name || 'Serviço fotográfico — Laila Vitória Artistry',
            quantity: 1,
            unit_price: order.amount_cents / 100,
            currency_id: 'BRL',
          },
        ],
        payer: {
          name: order.client_name,
          email: order.client_email,
        },
        external_reference: String(order.id),
        back_urls: {
          success: `${appUrl}/?pagamento=sucesso&pedido=${order.id}`,
          pending: `${appUrl}/?pagamento=pendente&pedido=${order.id}`,
          failure: `${appUrl}/?pagamento=falha&pedido=${order.id}`,
        },
        auto_return: 'approved',
        notification_url: `${appUrl}/api/payments/webhook`,
      },
    });

    await db.run('UPDATE orders SET mp_preference_id = ? WHERE id = ?', result.id, order.id);

    res.json({
      preferenceId: result.id,
      initPoint: result.init_point,
      sandboxInitPoint: result.sandbox_init_point,
    });
  } catch (err: any) {
    console.error('Erro ao criar preferência Mercado Pago:', err);
    res.status(500).json({ error: 'Falha ao criar preferência de pagamento.', details: err.message });
  }
});

// Public: generate a static Pix QR Code (BR Code) for an order — no payment gateway involved
paymentsRouter.post('/payments/pix', async (req, res) => {
  const { orderId } = req.body || {};
  if (!orderId) return res.status(400).json({ error: 'orderId é obrigatório.' });

  const pixKey = process.env.PIX_KEY;
  if (!pixKey) {
    return res.status(500).json({ error: 'Chave Pix não configurada.' });
  }

  const order = await db.get('SELECT * FROM orders WHERE id = ?', orderId) as OrderRow | undefined;
  if (!order) return res.status(404).json({ error: 'Pedido não encontrado.' });
  if (order.status === 'approved') return res.status(409).json({ error: 'Pedido já foi pago.' });

  const pkg = await db.get('SELECT name FROM packages WHERE id = ?', order.package_id) as
    | { name: string }
    | undefined;

  try {
    const payload = buildPixPayload({
      pixKey,
      merchantName: process.env.PIX_MERCHANT_NAME || 'Laila Vitoria Artistry',
      merchantCity: process.env.PIX_MERCHANT_CITY || 'Manaus',
      amountCents: order.amount_cents,
      txid: `PEDIDO${order.id}`,
      description: pkg?.name,
    });

    const qrCodeDataUrl = await QRCode.toDataURL(payload, { margin: 1, width: 320 });

    await db.run("UPDATE orders SET payment_method = COALESCE(payment_method, 'pix_estatico') WHERE id = ?", order.id);

    res.json({ payload, qrCodeDataUrl });
  } catch (err: any) {
    console.error('Erro ao gerar QR Code Pix:', err);
    res.status(500).json({ error: 'Falha ao gerar QR Code Pix.', details: err.message });
  }
});

// Mercado Pago webhook: notified on payment status changes
paymentsRouter.post('/payments/webhook', async (req, res) => {
  try {
    const paymentId = req.body?.data?.id || req.query['data.id'];
    const type = req.body?.type || req.query.type;

    if (type !== 'payment' || !paymentId) {
      return res.status(200).send('ignored');
    }

    const client = getClient();
    const payment = new Payment(client);
    const result = await payment.get({ id: String(paymentId) });

    const orderId = result.external_reference ? Number(result.external_reference) : null;
    if (!orderId) return res.status(200).send('no external_reference');

    const status = result.status; // approved | pending | rejected | cancelled | ...
    const paymentMethod = result.payment_method_id || result.payment_type_id || null;
    const installments = typeof result.installments === 'number' ? result.installments : null;
    const paidAt = status === 'approved' ? new Date().toISOString() : null;

    await db.run(
      `UPDATE orders SET status = ?, payment_method = ?, mp_payment_id = ?, installments = COALESCE(?, installments), paid_at = COALESCE(?, paid_at) WHERE id = ?`
    , status, paymentMethod, String(result.id), installments, paidAt, orderId);

    res.status(200).send('ok');
  } catch (err: any) {
    console.error('Erro no webhook do Mercado Pago:', err);
    res.status(200).send('error-logged');
  }
});
