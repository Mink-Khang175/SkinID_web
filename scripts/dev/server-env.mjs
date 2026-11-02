import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { parseEnv } from 'node:util';

export const serverKeys = [
  'FIREBASE_PROJECT_ID', 'FIREBASE_CLIENT_EMAIL', 'FIREBASE_PRIVATE_KEY',
  'GOOGLE_APPLICATION_CREDENTIALS', 'GEMINI_API_KEY', 'GEMINI_MODEL',
  'S3_BASE_URL', 'S3_USERNAME', 'S3_PASSWORD', 'S3_BRANCH_ID', 'S3_CASHIER_ID',
  'S3_SYNC_ENABLED', 'TELEGRAM_BOT_TOKEN', 'TELEGRAM_CHAT_ID', 'ALLOWED_ORIGINS'
];

export function loadServerEnv(root = process.cwd()) {
  const file = resolve(root, '.dev.vars');
  const values = existsSync(file) ? parseEnv(readFileSync(file, 'utf8')) : {};
  for (const key of serverKeys) if (process.env[key] !== undefined) values[key] = process.env[key];
  if (values.GOOGLE_APPLICATION_CREDENTIALS) {
    const account = JSON.parse(readFileSync(resolve(root, values.GOOGLE_APPLICATION_CREDENTIALS), 'utf8'));
    if (values.FIREBASE_PROJECT_ID && values.FIREBASE_PROJECT_ID !== account.project_id) throw new Error('Firebase project mismatch.');
    values.FIREBASE_PROJECT_ID ||= account.project_id;
    values.FIREBASE_CLIENT_EMAIL ||= account.client_email;
    values.FIREBASE_PRIVATE_KEY ||= account.private_key;
  }
  // Connected development must not silently report an in-memory order as saved.
  values.IS_LOCAL_DEV = false;
  return values;
}
