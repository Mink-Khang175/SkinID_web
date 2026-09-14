const test = require('node:test');
const assert = require('node:assert/strict');
const { buildPrompt, utcDateKey, validateAnalysis, validateInput } = require('../analysis');

test('validates exactly three bounded base64 images', () => {
  const result = validateInput({ images: ['YWJj', 'ZGVm', 'Z2hp'], skinType: 'Da dầu' });
  assert.equal(result.images.length, 3);
  assert.equal(result.skinType, 'Da dầu');
  assert.throws(() => validateInput({ images: ['YWJj'] }), /đúng 3 ảnh/);
  assert.throws(() => validateInput({ images: ['!', 'ZGVm', 'Z2hp'] }), /base64/);
});

test('normalizes analysis metrics and preserves no-face response', () => {
  assert.deepEqual(validateAnalysis({ isNotFace: true }), { isNotFace: true, reason: 'No human face detected' });
  const value = { isNotFace: false, skinTypeSummary: 'Da dầu', analysis3Angles: 'Mô tả' };
  for (const key of ['healthScore','skinAge','moisture','elasticity','sebum','pigmentation','pores','eyeWrinkles','nasolabialFolds','redness','acneBacteria','texture','darkCircles','melasma']) value[key] = 75.4;
  assert.equal(validateAnalysis(value).healthScore, 75);
});

test('builds a non-diagnostic prompt and stable UTC date key', () => {
  assert.match(buildPrompt('Da khô', null), /không phải bác sĩ/);
  assert.equal(utcDateKey(new Date('2026-09-14T23:59:59Z')), '2026-09-14');
});
