import test from 'node:test';
import assert from 'node:assert/strict';
import { buildRepairPlan } from '../scripts/backend/firestore-model.mjs';
import { normalizeBlogPost } from '../src/features/content/services/contentModel.js';

const doc = (path, fields) => ({ name: `projects/test/databases/(default)/documents/${path}`, fields, updateTime: '2026-11-05T10:00:00Z' });
test('Firestore repair changes only ISO timestamp fields and guards concurrent writes', () => {
  const order = doc('orders/order1', {
    userId: { stringValue: 'user1' }, createdAt: { stringValue: '2026-11-01T10:00:00Z' },
    updatedAt: { timestampValue: '2026-11-02T10:00:00Z' }, total: { integerValue: '247000' }
  });
  const input = [order, doc('users/user1', {})];
  const original = JSON.stringify(input);
  const plan = buildRepairPlan(input);
  assert.equal(JSON.stringify(input), original);
  assert.deepEqual(plan.warnings, []);
  assert.equal(plan.writes.length, 1);
  assert.deepEqual(plan.writes[0].updateMask.fieldPaths, ['createdAt']);
  assert.equal(plan.writes[0].currentDocument.updateTime, order.updateTime);
  assert.equal(plan.writes[0].update.fields.createdAt.timestampValue, '2026-11-01T10:00:00.000Z');
  assert.equal(buildRepairPlan([doc('orders/order1', { ...order.fields, ...plan.writes[0].update.fields }), input[1]]).writes.length, 0);
});
test('Firestore repair leaves ambiguous dates and missing customer accounts for review', () => {
  const plan = buildRepairPlan([doc('orders/legacy', { createdAt: { stringValue: '01/02/2026' }, userId: { stringValue: 'missing' } })]);
  assert.equal(plan.writes.length, 0);
  assert.deepEqual(plan.warnings.map(w => w.issue), ['invalid_timestamp:createdAt', 'missing_user_profile']);
});
test('Campaign repair creates canonical config once without rewriting prices', () => {
  const fields = { active: { booleanValue: true }, combos: { arrayValue: { values: [{ mapValue: { fields: { price: { integerValue: '123000' } } } }] } } };
  const campaign = doc('campaigns/active', fields);
  const plan = buildRepairPlan([campaign]);
  assert.equal(plan.writes.length, 1);
  assert.equal(plan.writes[0].update.fields.combos, fields.combos);
  assert.equal(plan.writes[0].update.fields.salesChannel.stringValue, 'store');
  assert.deepEqual(plan.writes[0].currentDocument, { exists: false });
  assert.equal(buildRepairPlan([campaign, doc('settings/campaign_config', fields)]).writes.length, 0);
  assert.equal(buildRepairPlan([campaign, doc('campaigns/another', fields)]).writes.length, 0);
});
test('Blog boundary handles company Firestore structured fields without losing article sections', () => {
  const content = [{ heading: 'Heading', text: 'Text' }];
  const post = normalizeBlogPost({ author: { name: 'SkinID', title: 'Advisor' }, publishedAt: '05/11/2026', relatedProductIds: ['product1'], content });
  assert.equal(post.author, 'SkinID');
  assert.equal(post.date, '05/11/2026');
  assert.equal(post.content, content);
  assert.deepEqual(post.featuredProductIds, ['product1']);
});
