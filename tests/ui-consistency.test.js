const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const root = path.join(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const source = read('src/js/analysis/skin-analysis.js');
for (const page of ['index.html', 'skin-analysis.html']) {
  const html = read(page);
  assert(html.indexOf('cdn.tailwindcss.com') < html.indexOf('tailwind.config'));
  assert(html.includes('data-component-src="src/components/dialogs/product-detail-modal.html"'));
}
const legacy = read('src/components/dialogs/legacy-modals.html');
assert(!legacy.includes(String.raw`</div>\n`));
assert(!legacy.includes('id="product-detail-modal"'));
assert(source.includes('grid.appendChild(createProductCard(p))'));
assert(source.includes('container.appendChild(createProductCard(p))'));
assert(source.includes("variant: 'horizontal'"));
const shared = read('src/js/catalog/product-card.js');
assert(shared.includes('product-card__name'));
assert(shared.includes('product-card__selection'));
assert(shared.includes("checkbox.type = 'checkbox'"));
const checkbox = { checked: false };
const button = { disabled: true, classList: { add() {} } };
const context = {
  document: { getElementById: id => id === 'privacy-consent-checkbox' ? checkbox : button },
  window: { currentRoutineIds: ['a', 'b', 'a'], excludedRoutineIds: new Set(['b']), cartManager: true },
  cartManager: { addItem: (id, quantity) => added.push([id, quantity]) },
  showToast: message => messages.push(message)
};
const added = [], messages = [];
vm.createContext(context);
vm.runInContext(source.slice(source.indexOf('function togglePrivacyButton()'), source.indexOf('async function requestCameraPermissionAndProceed')), context);
context.togglePrivacyButton();
assert.equal(button.disabled, true);
checkbox.checked = true;
context.togglePrivacyButton();
assert.equal(button.disabled, false);
vm.runInContext(source.slice(source.lastIndexOf('function addAllToCart()'), source.indexOf('// BOOTSTRAP INITIALIZATION')), context);
context.addAllToCart();
assert.deepEqual(added, [['a', 1]]);
context.window.excludedRoutineIds.add('a');
context.addAllToCart();
assert.equal(added.length, 1);
assert(messages.at(-1).includes('ít nhất một'));
console.log('PASS: shared components, Tailwind order, consent states, selected routine cart items and empty selection.');
