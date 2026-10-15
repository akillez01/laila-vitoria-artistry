// Libera o navegador para enviar arquivos direto ao bucket R2 (upload com URL pré-assinada).
// Uso: npm run r2:cors -- https://laylavitoria.com.br https://www.laylavitoria.com.br
import 'dotenv/config';
import { PutBucketCorsCommand } from '@aws-sdk/client-s3';
import { getS3, bucket } from '../server/upload.js';

const origins = process.argv.slice(2);
if (origins.length === 0) {
  console.error('Informe as origens permitidas, ex: npm run r2:cors -- https://laylavitoria.com.br');
  process.exit(1);
}

await getS3().send(
  new PutBucketCorsCommand({
    Bucket: bucket(),
    CORSConfiguration: {
      CORSRules: [
        {
          AllowedOrigins: [...origins, 'http://localhost:3000'],
          AllowedMethods: ['PUT', 'GET', 'HEAD'],
          AllowedHeaders: ['Content-Type', 'Cache-Control'],
          MaxAgeSeconds: 3600,
        },
      ],
    },
  }),
);
console.log(`✅ CORS do bucket ${bucket()} liberado para: ${[...origins, 'http://localhost:3000'].join(', ')}`);
