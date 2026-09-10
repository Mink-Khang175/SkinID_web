const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');

function storage() {
  const values = new Map();
  return {
    getItem: key => values.has(key) ? values.get(key) : null,
    setItem: (key, value) => values.set(key, String(value)),
    removeItem: key => values.delete(key)
  };
}

const source = fs.readFileSync(path.join(__dirname, '../src/js/account/auth.js'), 'utf8')
  .replace(/const authManager = new AuthManager\(\);\s*window\.authManager = authManager;?/, '');
const localStorage = storage();
const sessionStorage = storage();
const document = {
  readyState: 'loading',
  addEventListener() {},
  getElementById() { return null; }
};
const context = {
  console,
  localStorage,
  sessionStorage,
  document,
  window: {},
  confirm: () => true,
  setTimeout,
  clearTimeout
};
vm.createContext(context);
vm.runInContext(source, context, { filename: 'auth.js' });
vm.runInContext('this.manager = new AuthManager();', context);
const manager = context.manager;

assert.equal(manager.register('A', 'a@example.com', '', '123456', '123456').success, false);
assert.equal(manager.register('Nguyễn An', 'an@example.com', '0901234567', '123456', '123456').success, true);
assert.equal(manager.register('Nguyễn An', 'AN@example.com', '', '123456', '123456').success, false);
assert.equal(manager.login('an@example.com', 'wrong').success, false);
assert.equal(manager.login('AN@example.com', '123456').success, true);
assert.equal(manager.getCurrentUser().email, 'an@example.com');

assert.equal(manager.updateUserProfile({ name: 'Nguyễn An Mới', phone: '0987654321' }).success, true);
assert.equal(manager.getCurrentUser().name, 'Nguyễn An Mới');
assert.equal(manager.changePassword('123456', '654321').success, true);
assert.equal(manager.logout(), undefined);
assert.equal(manager.getCurrentUser(), null);
assert.equal(manager.login('an@example.com', '654321').success, true);

const record = manager.saveScanHistory({
  healthScore: 72,
  skinType: 'Da hỗn hợp',
  skinAge: 28,
  primaryConcerns: ['Mụn'],
  metrics: { moisture: 60 },
  recommendedRoutine: ['rilastil-1805']
});
assert(record);
assert.equal(manager.getScanHistory().length, 1);
manager.clearAllUserHistory();
assert.equal(manager.getScanHistory().length, 0);
console.log('PASS: local profile registration, login, update, password, history and deletion flows.');
