// In-browser data adapter for reviewing UI. It has no network or credential access.
export function createLocalBackend({ seed = {}, storage, key = 'skinid-frontend-preview-v1' } = {}) {
  const copy = value => value === undefined ? undefined : JSON.parse(JSON.stringify(value));
  let saved;
  try { saved = JSON.parse(storage?.getItem(key) || 'null'); } catch {}
  let records = { ...copy(seed), ...(saved?.records || {}) };
  let role = ['customer','admin'].includes(saved?.role) ? saved.role : 'guest';
  const listeners = new Set();
  const persist = () => storage?.setItem(key, JSON.stringify({ records, role }));
  const uid = () => role === 'admin' ? 'preview-admin' : 'preview-customer';
  const currentUser = () => role === 'guest' ? null : {
    uid: uid(), email: `${uid()}@example.test`, displayName: role === 'admin' ? 'Quản trị viên mẫu' : 'Khách hàng mẫu',
    photoURL: null, phoneNumber: '0900000000', providerData: [{ providerId: 'password' }],
    getIdToken: async () => 'local-preview-token',
    getIdTokenResult: async () => ({ claims: { role: role === 'admin' ? 'super_admin' : 'customer', admin: role === 'admin' } })
  };
  const auth = { get currentUser() { return currentUser(); } };
  const setRole = value => {
    role = ['customer','admin'].includes(value) ? value : 'guest';
    persist(); listeners.forEach(callback => callback(currentUser()));
  };
  const ref = (...parts) => ({ path: parts.flatMap(p => typeof p === 'string' ? [p] : p?.path ? [p.path] : []).join('/') });
  const snapshot = reference => ({ id: reference.path.split('/').pop(), ref: reference,
    exists: () => records[reference.path] !== undefined, data: () => copy(records[reference.path]) });
  const timestamp = () => ({ seconds: Math.floor(Date.now()/1000), nanoseconds: 0 });
  const comparable = value => value?.seconds !== undefined ? value.seconds * 1000 : value;
  const firestore = {
    collection: ref, doc: ref,
    where: (field, operator, value) => ({ kind: 'where', field, operator, value }),
    orderBy: (field, direction = 'asc') => ({ kind: 'order', field, direction }),
    limit: count => ({ kind: 'limit', count }),
    query: (reference, ...constraints) => ({ ...reference, constraints }),
    getDoc: async reference => snapshot(reference),
    getDocs: async reference => {
      const prefix = reference.path + '/';
      let paths = Object.keys(records).filter(path => path.startsWith(prefix) && !path.slice(prefix.length).includes('/'));
      for (const constraint of reference.constraints || []) {
        if (constraint.kind === 'where') paths = paths.filter(path => {
          const a = comparable(records[path][constraint.field]), b = comparable(constraint.value);
          switch (constraint.operator) {
            case '==': return a === b; case '!=': return a !== b;
            case '>=': return a >= b; case '<=': return a <= b;
            case '>': return a > b; case '<': return a < b;
            case 'in': return Array.isArray(b) && b.includes(a);
            case 'array-contains': return Array.isArray(a) && a.includes(b);
            default: throw new Error(`Preview query chưa hỗ trợ ${constraint.operator}.`);
          }
        });
        if (constraint.kind === 'order') paths.sort((a,b) => {
          const x = comparable(records[a][constraint.field]), y = comparable(records[b][constraint.field]);
          return (x === y ? 0 : x > y ? 1 : -1) * (constraint.direction === 'desc' ? -1 : 1);
        });
        if (constraint.kind === 'limit') paths = paths.slice(0, constraint.count);
      }
      const docs = paths.map(path => snapshot({ path }));
      return { docs, empty: docs.length === 0, size: docs.length, forEach: callback => docs.forEach(callback) };
    },
    setDoc: async (reference, value, options = {}) => {
      records[reference.path] = options.merge ? { ...records[reference.path], ...copy(value) } : copy(value); persist();
    },
    updateDoc: async (reference, value) => { records[reference.path] = { ...records[reference.path], ...copy(value) }; persist(); },
    deleteDoc: async reference => { delete records[reference.path]; persist(); },
    addDoc: async (reference, value) => {
      const target = ref(reference, `DEMO-${globalThis.crypto?.randomUUID?.() || Date.now()}`);
      records[target.path] = copy(value); persist(); return { ...target, id: target.path.split('/').pop() };
    },
    serverTimestamp: timestamp
  };
  const login = async () => { setRole('customer'); return { user: currentUser() }; };
  class GoogleAuthProvider { setCustomParameters() {} }
  const authSdk = {
    browserLocalPersistence: 'local', browserSessionPersistence: 'session', GoogleAuthProvider,
    EmailAuthProvider: { credential: () => ({ preview: true }) },
    onAuthStateChanged: (_, callback) => { listeners.add(callback); queueMicrotask(() => callback(currentUser())); return () => listeners.delete(callback); },
    getIdTokenResult: async () => currentUser()?.getIdTokenResult() || { claims: {} },
    signInWithEmailAndPassword: login, signInWithPopup: login, createUserWithEmailAndPassword: login,
    signOut: async () => setRole('guest'), setPersistence: async () => {},
    updateProfile: async (user, values) => firestore.updateDoc(ref('users', user.uid), { name: values.displayName || user.displayName }),
    reauthenticateWithCredential: async () => ({ user: currentUser() }),
    updatePassword: async () => { throw new Error('Bản xem giao diện không thay đổi mật khẩu thật.'); },
    sendPasswordResetEmail: async () => { throw new Error('Bản xem giao diện không gửi email. Vui lòng nối backend để dùng chức năng này.'); }
  };
  return { auth, db: { preview: true }, sdk: { auth: authSdk, firestore }, setRole, getRole: () => role,
    reset: () => { records = copy(seed); role = 'guest'; persist(); listeners.forEach(callback => callback(null)); },
    getRecords: () => copy(records) };
}
