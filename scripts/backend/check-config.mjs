import { loadServerEnv } from '../dev/server-env.mjs';
import { integrationStatus } from '../../worker/app/integrations.js';

try {
  const env = loadServerEnv();
  const status = integrationStatus(env);
  for (const [service, value] of Object.entries(status)) {
    console.log(`${service}: ${value.configured ? 'configured (connection not probed)' : 'missing credentials'}${'enabled' in value ? `; enabled=${value.enabled}` : ''}`);
  }
  if (!status.firebase.configured) {
    console.log('Required: FIREBASE_CLIENT_EMAIL + FIREBASE_PRIVATE_KEY, or GOOGLE_APPLICATION_CREDENTIALS in .dev.vars.');
    process.exitCode = 1;
  }
} catch {
  console.error('Cannot load server configuration. Check .dev.vars and service-account path. No secret values were printed.');
  process.exitCode = 1;
}
