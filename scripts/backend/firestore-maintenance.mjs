import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createSign } from 'node:crypto';
import { resolve } from 'node:path';
import { buildRepairPlan } from './firestore-model.mjs';

const arg = name => process.argv.find(value => value.startsWith(`--${name}=`))?.slice(name.length + 3);
const project = arg('project');
const credential = arg('service-account');
if (!project || !credential) throw Error('Required: --project=<id> --service-account=<local JSON path>. Default: read-only audit.');
const account = JSON.parse(await readFile(resolve(credential), 'utf8'));
if (account.project_id !== project) throw Error('Service account/project mismatch.');
const now = Math.floor(Date.now() / 1000);
const base64 = value => Buffer.from(JSON.stringify(value)).toString('base64url');
const unsigned = base64({ alg: 'RS256', typ: 'JWT' }) + '.' + base64({
  iss: account.client_email, scope: 'https://www.googleapis.com/auth/cloud-platform https://www.googleapis.com/auth/firebase',
  aud: 'https://oauth2.googleapis.com/token', iat: now, exp: now + 3600
});
const assertion = unsigned + '.' + createSign('RSA-SHA256').update(unsigned).sign(account.private_key, 'base64url');
const authResponse = await fetch('https://oauth2.googleapis.com/token', {
  method: 'POST', body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion })
});
const auth = await authResponse.json();
if (!auth.access_token) throw Error(`Service account authentication failed (${authResponse.status}).`);
async function api(url, method = 'GET', data) {
  const response = await fetch(url, {
    method, headers: { authorization: `Bearer ${auth.access_token}`, 'content-type': 'application/json' },
    body: data ? JSON.stringify(data) : undefined, signal: AbortSignal.timeout(60000)
  });
  const payload = await response.json();
  if (!response.ok) throw Error(`Google API ${response.status}: ${payload.error?.status || 'request_failed'}`);
  return payload;
}
const projectName = `projects/${project}`;
const database = `https://firestore.googleapis.com/v1/${projectName}/databases/(default)`;
const rulesBase = `https://firebaserules.googleapis.com/v1/${projectName}`;
if (process.argv.includes('--verify')) {
  const metadata = await api(database);
  const release = await api(rulesBase + '/releases/cloud.firestore');
  const ruleset = await api('https://firebaserules.googleapis.com/v1/' + release.rulesetName);
  const localRules = await readFile(resolve('firestore.rules'), 'utf8');
  const liveRules = ruleset.source?.files?.find(file => file.name === 'firestore.rules')?.content;
  if (localRules !== liveRules) throw Error('Live Firestore rules differ from the repository.');
  console.log(JSON.stringify({ project, rulesMatch: true, deleteProtection: metadata.deleteProtectionState, pitr: metadata.pointInTimeRecoveryEnablement }, null, 2));
  process.exit(0);
}
const backup = resolve(arg('backup-dir') || '../private-backups', `firestore-${project}-${new Date().toISOString().replace(/[:.]/g, '-')}`);
await mkdir(backup, { recursive: true });
const documents = [];
const inventory = {};
async function walk(parent, depth = 0) {
  if (depth > 8) throw Error('Depth limit reached; no writes performed.');
  let token;
  do {
    const collections = await api(`${parent}:listCollectionIds`, 'POST', { pageSize: 1000, ...(token ? { pageToken: token } : {}) });
    for (const id of collections.collectionIds || []) {
      let page;
      do {
        const url = new URL(`${parent}/${encodeURIComponent(id)}`);
        url.searchParams.set('pageSize', '300'); url.searchParams.set('showMissing', 'true');
        if (page) url.searchParams.set('pageToken', page);
        const result = await api(url);
        for (const doc of result.documents || []) {
          if (doc.fields) {
            documents.push(doc);
            if (documents.length > 5000) throw Error('Audit limit exceeded; no writes performed.');
            const pattern = doc.name.split('/documents/')[1].split('/').map((part, i) => i % 2 ? '{id}' : part).slice(0, -1).join('/');
            inventory[pattern] = (inventory[pattern] || 0) + 1;
          }
          await walk('https://firestore.googleapis.com/v1/' + doc.name, depth + 1);
        }
        page = result.nextPageToken;
      } while (page);
    }
    token = collections.nextPageToken;
  } while (token);
}
await walk(database + '/documents');
const metadata = await api(database);
const indexes = await api(database + '/collectionGroups/-/indexes');
const release = await api(rulesBase + '/releases/cloud.firestore');
const ruleset = await api('https://firebaserules.googleapis.com/v1/' + release.rulesetName);
const plan = buildRepairPlan(documents);
await writeFile(backup + '/documents.json', JSON.stringify(documents, null, 2));
await writeFile(backup + '/configuration.json', JSON.stringify({ metadata, indexes, release, ruleset }, null, 2));
await writeFile(backup + '/repair-plan.json', JSON.stringify(plan, null, 2));
console.log(JSON.stringify({ project, backup, documents: documents.length, inventory, repairs: plan.writes.length, warnings: plan.warnings }, null, 2));
if (process.argv.includes('--apply')) {
  // One atomic commit; fail on concurrent edits instead of overwriting them.
  if (plan.writes.length) await api(database + '/documents:commit', 'POST', { writes: plan.writes });
  console.log(`Applied ${plan.writes.length} document repairs.`);
}
if (process.argv.includes('--apply-rules')) {
  const content = await readFile(resolve('firestore.rules'), 'utf8');
  // Creating a ruleset compiles/validates it before moving the live release.
  const created = await api(rulesBase + '/rulesets', 'POST', { source: { files: [{ name: 'firestore.rules', content }] } });
  await api(rulesBase + '/releases/cloud.firestore', 'PATCH', {
    release: { name: `${projectName}/releases/cloud.firestore`, rulesetName: created.name }, updateMask: 'rulesetName'
  });
  console.log('Published validated Firestore rules; previous release is in the private backup.');
}
if (process.argv.includes('--protect-database')) {
  const operation = await api(database + '?updateMask=deleteProtectionState', 'PATCH', { name: `${projectName}/databases/(default)`, deleteProtectionState: 'DELETE_PROTECTION_ENABLED' });
  if (operation.error) throw Error('Database protection update failed.');
  if ((await api(database)).deleteProtectionState !== 'DELETE_PROTECTION_ENABLED') throw Error('Database protection not yet confirmed; inspect the Google operation before retrying.');
  console.log('Enabled database deletion protection.');
}
