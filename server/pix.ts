// Gera o payload "Pix Copia e Cola" (BR Code) no padrão EMV do Banco Central,
// sem depender de nenhum gateway de pagamento — só a chave Pix do recebedor.

function sanitize(text: string, maxLength: number): string {
  return text
    .normalize('NFD')
    .replace(new RegExp('[\\u0300-\\u036f]', 'g'), '')
    .replace(/[^a-zA-Z0-9 ]/g, '')
    .toUpperCase()
    .trim()
    .slice(0, maxLength);
}

function tlv(id: string, value: string): string {
  const length = value.length.toString().padStart(2, '0');
  return `${id}${length}${value}`;
}

function crc16(payload: string): string {
  let crc = 0xffff;
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let bit = 0; bit < 8; bit++) {
      crc = crc & 0x8000 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

export interface PixPayloadOptions {
  pixKey: string;
  merchantName: string;
  merchantCity: string;
  amountCents: number;
  txid: string;
  description?: string;
}

export function buildPixPayload({ pixKey, merchantName, merchantCity, amountCents, txid, description }: PixPayloadOptions): string {
  const merchantAccountInfo =
    tlv('00', 'BR.GOV.BCB.PIX') +
    tlv('01', pixKey) +
    (description ? tlv('02', sanitize(description, 40)) : '');

  const additionalData = tlv('05', sanitize(txid, 25) || '***');

  const amount = (amountCents / 100).toFixed(2);

  const fields =
    tlv('00', '01') + // Payload Format Indicator
    tlv('01', '12') + // Point of Initiation Method (12 = dinâmico/uma vez)
    tlv('26', merchantAccountInfo) +
    tlv('52', '0000') + // Merchant Category Code
    tlv('53', '986') + // BRL
    tlv('54', amount) +
    tlv('58', 'BR') +
    tlv('59', sanitize(merchantName, 25)) +
    tlv('60', sanitize(merchantCity, 15)) +
    tlv('62', additionalData);

  const withCrcPlaceholder = `${fields}6304`;
  return `${withCrcPlaceholder}${crc16(withCrcPlaceholder)}`;
}
