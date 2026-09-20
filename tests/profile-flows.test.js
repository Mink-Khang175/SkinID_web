const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');

const source = fs.readFileSync(path.join(__dirname, '../src/js/account/auth-firebase.js'), 'utf8');
new vm.Script(source, { filename: 'auth-firebase.js' });

assert.match(source, /createUserWithEmailAndPassword/);
assert.match(source, /signInWithEmailAndPassword/);
assert.match(source, /signInWithPopup/);
assert.match(source, /sendPasswordResetEmail/);
assert.match(source, /reauthenticateWithCredential/);
assert.match(source, /skinReports/);
assert.match(source, /collection\(this\.firebase\.db, 'orders'\)/);
assert.match(source, /async createOrder/);
assert.match(source, /apiRequest\('\/orders'/);
assert.match(source, /async cancelOrder/);
assert.match(source, /GoogleAuthProvider/);
assert.match(source, /async updateProfilePicture/);
assert.match(source, /async loadCart/);
assert.match(source, /async saveCart/);
assert.match(source, /'commerce', 'cart'/);
assert.match(source, /shippingAddress/);
assert.match(source, /firebaseUser\.photoURL \|\| profile\.picture/);
assert.doesNotMatch(source, /localStorage|sessionStorage/);
assert.doesNotMatch(source, /password:\s*['"]/);

console.log('PASS: Firebase Auth, Firestore profile/history flows replace local credential storage.');
