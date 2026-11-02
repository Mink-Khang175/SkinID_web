import { getS3Config, isValidFirebasePrivateKey } from './env.js';

export function integrationStatus(env) {
  const firebaseConfigured = Boolean(env.FIREBASE_PROJECT_ID && env.FIREBASE_CLIENT_EMAIL && isValidFirebasePrivateKey(env.FIREBASE_PRIVATE_KEY));
  const s3 = getS3Config(env);
  return {
    firebase: { configured: firebaseConfigured },
    s3: { configured: Boolean(s3.username && s3.password), enabled: s3.enabled },
    ai: { configured: Boolean(env.GEMINI_API_KEY) },
    telegram: { configured: Boolean(env.TELEGRAM_BOT_TOKEN && env.TELEGRAM_CHAT_ID) }
  };
}
