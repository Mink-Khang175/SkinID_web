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
assert.doesNotMatch(source, /localStorage|sessionStorage/);
assert.doesNotMatch(source, /password:\s*['"]/);

console.log('PASS: Firebase Auth, Firestore profile/history flows replace local credential storage.');
