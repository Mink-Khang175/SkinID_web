import { loadServerEnv } from '../dev/server-env.mjs';
import { setFirebaseCustomUserClaims, commitWrites, documentName, encodeFields } from '../../worker/firestore.js';
import { requiredFirebaseEnv } from '../../worker/app/env.js';
import { VALID_ROLES } from '../../worker/index.js';

const arg = name => process.argv.find(value => value.startsWith(`--${name}=`))?.split('=').slice(1).join('=');
const env = loadServerEnv();
const uid = arg('uid'), role = arg('role');
if (!uid || !VALID_ROLES.includes(role)) throw new Error('Cần --uid=<Firebase UID> và --role=<vai trò hợp lệ>.');
console.log(`Target project: ${env.FIREBASE_PROJECT_ID}; role: ${role}.`);
if (process.argv.includes('--apply')) {
  if (arg('project') !== env.FIREBASE_PROJECT_ID) throw new Error('Cần chỉ định --project trùng cấu hình.');
  requiredFirebaseEnv(env);
  await setFirebaseCustomUserClaims(env, uid, { role, admin: ['admin', 'super_admin'].includes(role) });
  await commitWrites(env, [{ update: { name: documentName(env, `users/${uid}`), fields: encodeFields({ role, updatedAt: new Date() }) }, updateMask: { fieldPaths: ['role', 'updatedAt'] } }]);
  console.log('Role updated. User must sign in again to refresh claims.');
} else console.log('Validation only. No role change. Review --uid, --role, --project before using --apply.');
