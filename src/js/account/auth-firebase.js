/** Firebase Authentication, Firestore profile and skin-report manager. */
class AuthManager {
    constructor() {
        this.currentUser = null;
        this.history = [];
        this.orders = [];
        this.cart = [];
        this.firebase = null;
        this.ready = this.init();
        window.SKINID_AUTH_READY = this.ready;
    }

    async init() {
        this.firebase = await window.SKINID_FIREBASE_READY;
        const { onAuthStateChanged } = this.firebase.sdk.auth;
        await new Promise((resolve) => {
            let firstState = true;
            onAuthStateChanged(this.firebase.auth, async (firebaseUser) => {
                try {
                    if (firebaseUser) {
                        await this.loadUser(firebaseUser);
                        await this.loadHistory();
                        await this.loadOrders();
                        await this.loadCart();
                    } else {
                        this.currentUser = null;
                        this.history = [];
                        this.orders = [];
                        this.cart = [];
                    }
                    this.updateHeaderUI();
                    document.dispatchEvent(new CustomEvent('skinid:auth-changed', { detail: this.currentUser }));
                } catch (error) {
                    console.error('[SkinID Auth] Không thể tải dữ liệu người dùng:', error);
                } finally {
                    if (firstState) { firstState = false; resolve(); }
                }
            });
        });
        return this;
    }

    async loadUser(firebaseUser, initialProfile = {}) {
        const { doc, getDoc, serverTimestamp, setDoc } = this.firebase.sdk.firestore;
        const reference = doc(this.firebase.db, 'users', firebaseUser.uid);
        const snapshot = await getDoc(reference);
        const provider = firebaseUser.providerData.some(item => item.providerId === 'google.com') ? 'google' : 'password';
        const defaults = {
            name: firebaseUser.displayName || initialProfile.name || firebaseUser.email?.split('@')[0] || 'Thành viên SkinID',
            email: firebaseUser.email || '',
            phone: initialProfile.phone || firebaseUser.phoneNumber || '',
            picture: firebaseUser.photoURL || null,
            provider
        };
        if (!snapshot.exists()) await setDoc(reference, { ...defaults, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
        const profile = snapshot.data() || {};
        this.currentUser = {
            id: firebaseUser.uid,
            uid: firebaseUser.uid,
            ...defaults,
            ...profile,
            picture: String(profile.picture || '').startsWith('data:image/')
                ? profile.picture
                : (firebaseUser.photoURL || profile.picture || null)
        };
        return this.currentUser;
    }

    async loadHistory() {
        if (!this.currentUser) return [];
        const { collection, getDocs, limit, orderBy, query } = this.firebase.sdk.firestore;
        const result = await getDocs(query(collection(this.firebase.db, 'users', this.currentUser.uid, 'skinReports'), orderBy('createdAt', 'desc'), limit(100)));
        this.history = result.docs.map(snapshot => ({ id: snapshot.id, ...snapshot.data() }));
        return this.history;
    }

    async loadOrders() {
        if (!this.currentUser) return [];
        try {
            const { collection, getDocs, query, where } = this.firebase.sdk.firestore;
            const result = await getDocs(query(collection(this.firebase.db, 'orders'), where('userId', '==', this.currentUser.uid)));
            this.orders = result.docs
                .map(snapshot => ({ id: snapshot.id, ...snapshot.data() }))
                .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
        } catch (error) {
            console.warn('[SkinID Orders] Chưa thể tải đơn hàng:', error.message);
            this.orders = [];
        }
        return this.orders;
    }

    getCurrentUser() { return this.currentUser; }
    getScanHistory() { return this.history; }
    getOrders() { return this.orders; }
    getCart() { return this.cart.map(item => ({ ...item })); }

    async apiRequest(path, options = {}) {
        const firebaseUser = this.firebase.auth.currentUser;
        if (!firebaseUser) throw Object.assign(new Error('Vui lòng đăng nhập trước khi tiếp tục.'), { code: 'unauthenticated' });
        const token = await firebaseUser.getIdToken();
        const baseUrl = String(window.SKINID_CONFIG?.apiBaseUrl || '/api').replace(/\/$/, '');
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 20000);
        let response;
        try {
            response = await fetch(`${baseUrl}${path}`, {
                ...options,
                signal: controller.signal,
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    ...(options.headers || {})
                }
            });
        } catch (error) {
            const code = error?.name === 'AbortError' ? 'request_timeout' : 'network_error';
            throw Object.assign(new Error(code === 'request_timeout'
                ? 'Kết nối quá thời gian. Vui lòng thử lại.'
                : 'Không thể kết nối hệ thống. Vui lòng kiểm tra mạng và thử lại.'), { code });
        } finally {
            clearTimeout(timeout);
        }
        const payload = await response.json().catch(() => ({}));
        if (!response.ok) throw Object.assign(new Error(payload.message || 'Không thể hoàn tất yêu cầu.'), { code: payload.code || `http_${response.status}` });
        return payload;
    }

    async loadCart() {
        if (!this.currentUser) return [];
        try {
            const { doc, getDoc } = this.firebase.sdk.firestore;
            const snapshot = await getDoc(doc(this.firebase.db, 'users', this.currentUser.uid, 'commerce', 'cart'));
            const items = snapshot.data()?.items;
            this.cart = Array.isArray(items)
                ? items.filter(item => typeof item?.productId === 'string' && Number.isInteger(item?.quantity) && item.quantity > 0)
                : [];
        } catch (error) {
            console.warn('[SkinID Cart] Chưa thể tải giỏ hàng:', error.message);
            this.cart = [];
        }
        return this.getCart();
    }

    async saveCart(items) {
        if (!this.currentUser) return { success: false, message: 'Giỏ hàng khách chỉ được giữ trong phiên hiện tại.' };
        try {
            const sanitized = (Array.isArray(items) ? items : [])
                .filter(item => typeof item?.productId === 'string' && Number.isInteger(item?.quantity) && item.quantity > 0)
                .slice(0, 50)
                .map(item => ({ productId: item.productId.slice(0, 160), quantity: Math.min(item.quantity, 20) }));
            const { doc, serverTimestamp, setDoc } = this.firebase.sdk.firestore;
            await setDoc(doc(this.firebase.db, 'users', this.currentUser.uid, 'commerce', 'cart'), {
                items: sanitized,
                updatedAt: serverTimestamp()
            }, { merge: true });
            this.cart = sanitized;
            return { success: true };
        } catch (error) {
            console.error('[SkinID Cart] Không thể lưu giỏ hàng:', error);
            return { success: false, message: this.errorMessage(error) };
        }
    }

    async createOrder(payload) {
        if (!this.currentUser) return { success: false, message: 'Vui lòng đăng nhập trước khi đặt hàng.' };
        try {
            if (!payload.customer?.name?.trim() || !payload.customer?.phone?.trim() || !payload.customer?.shippingAddress?.line1?.trim()
                || !payload.customer?.shippingAddress?.provinceCode || !payload.customer?.shippingAddress?.wardCode || !payload.items?.length) {
                return { success: false, message: 'Vui lòng nhập đủ thông tin nhận hàng.' };
            }
            const response = await this.apiRequest('/orders', {
                method: 'POST',
                headers: { 'Idempotency-Key': payload.idempotencyKey },
                body: JSON.stringify({
                    customer: payload.customer,
                    note: payload.note,
                    paymentMethod: payload.paymentMethod,
                    items: payload.items.map(item => ({ productId: item.productId, quantity: item.quantity }))
                })
            });
            await this.loadOrders();
            await this.loadUser(this.firebase.auth.currentUser);
            this.cart = [];
            return { success: true, orderId: response.orderId, total: response.total };
        } catch (error) {
            console.error('[SkinID Checkout] Không thể tạo đơn hàng:', { code: error?.code, message: error?.message });
            return { success: false, message: this.errorMessage(error) };
        }
    }

    async cancelOrder(orderId) {
        const order = this.orders.find(item => item.id === orderId);
        if (!order || !['pending', 'confirmed'].includes(order.status)) return { success: false, message: 'Đơn hàng không thể hủy.' };
        try {
            await this.apiRequest(`/orders/${encodeURIComponent(orderId)}`, { method: 'PATCH', body: '{}' });
            order.status = 'cancelled';
            return { success: true };
        } catch (error) { return { success: false, message: this.errorMessage(error) }; }
    }

    async register(name, email, phone, password, confirmPassword, remember = true) {
        if (!name || name.trim().length < 2) return { success: false, message: 'Vui lòng nhập họ tên hợp lệ.' };
        if (phone?.trim() && !/^(?:\+84|0)(?:3|5|7|8|9)\d{8}$/.test(phone.replace(/[\s.-]/g, ''))) return { success: false, message: 'Số điện thoại Việt Nam chưa đúng định dạng.' };
        if (password !== confirmPassword) return { success: false, message: 'Mật khẩu xác nhận không khớp.' };
        if (!password || password.length < 6) return { success: false, message: 'Mật khẩu phải có tối thiểu 6 ký tự.' };
        try {
            const sdk = this.firebase.sdk.auth;
            await sdk.setPersistence(this.firebase.auth, remember ? sdk.browserLocalPersistence : sdk.browserSessionPersistence);
            const credential = await sdk.createUserWithEmailAndPassword(this.firebase.auth, email.trim(), password);
            await sdk.updateProfile(credential.user, { displayName: name.trim() });
            const { doc, serverTimestamp, setDoc } = this.firebase.sdk.firestore;
            await setDoc(doc(this.firebase.db, 'users', credential.user.uid), {
                name: name.trim(), email: email.trim(), phone: phone.trim(), provider: 'password', updatedAt: serverTimestamp()
            }, { merge: true });
            await this.loadUser(credential.user, { name: name.trim(), phone: phone.trim() });
            this.updateHeaderUI();
            return { success: true, user: this.currentUser };
        } catch (error) { return { success: false, message: this.errorMessage(error) }; }
    }

    async login(email, password, remember = true) {
        try {
            const sdk = this.firebase.sdk.auth;
            await sdk.setPersistence(this.firebase.auth, remember ? sdk.browserLocalPersistence : sdk.browserSessionPersistence);
            const credential = await sdk.signInWithEmailAndPassword(this.firebase.auth, email.trim(), password);
            await this.loadUser(credential.user);
            await this.loadHistory();
            await this.loadOrders();
            await this.loadCart();
            this.updateHeaderUI();
            return { success: true, user: this.currentUser };
        } catch (error) { return { success: false, message: this.errorMessage(error) }; }
    }

    async triggerGoogleSignIn() {
        try {
            const sdk = this.firebase.sdk.auth;
            // Keep Google sessions across refreshes/tabs, matching the checked
            // "remember me" behavior of the email flow.
            await sdk.setPersistence(this.firebase.auth, sdk.browserLocalPersistence);
            const provider = new sdk.GoogleAuthProvider();
            provider.setCustomParameters({ prompt: 'select_account' });
            const credential = await sdk.signInWithPopup(this.firebase.auth, provider);
            await this.loadUser(credential.user);
            await this.loadHistory();
            await this.loadOrders();
            await this.loadCart();
            this.closeAuthModal();
            this.updateHeaderUI();
        } catch (error) { alert(this.errorMessage(error)); }
    }

    async resetPassword(email) {
        try {
            await this.firebase.sdk.auth.sendPasswordResetEmail(this.firebase.auth, email.trim());
            return { success: true, message: 'Đã gửi email đặt lại mật khẩu.' };
        } catch (error) { return { success: false, message: this.errorMessage(error) }; }
    }

    async logout() {
        await this.firebase.sdk.auth.signOut(this.firebase.auth);
        this.currentUser = null;
        this.history = [];
        this.orders = [];
        this.cart = [];
        this.updateHeaderUI();
    }

    async updateUserProfile(updatedData) {
        if (!this.currentUser) return { success: false, message: 'Chưa đăng nhập.' };
        const normalizedPhone = String(updatedData.phone || '').replace(/[\s.-]/g, '');
        if (normalizedPhone && !/^(?:\+84|0)(?:3|5|7|8|9)\d{8}$/.test(normalizedPhone)) return { success: false, message: 'Số điện thoại Việt Nam chưa đúng định dạng.' };
        try {
            const { doc, serverTimestamp, updateDoc } = this.firebase.sdk.firestore;
            const safe = {
                name: String(updatedData.name || '').trim(), phone: normalizedPhone,
                birthday: String(updatedData.birthday || ''), gender: String(updatedData.gender || ''),
                address: String(updatedData.shippingAddress?.fullAddress || updatedData.address || '').trim(),
                shippingAddress: updatedData.shippingAddress && {
                    line1: String(updatedData.shippingAddress.line1 || '').trim(),
                    wardCode: Number(updatedData.shippingAddress.wardCode || 0),
                    wardName: String(updatedData.shippingAddress.wardName || '').trim(),
                    provinceCode: Number(updatedData.shippingAddress.provinceCode || 0),
                    provinceName: String(updatedData.shippingAddress.provinceName || '').trim(),
                    fullAddress: String(updatedData.shippingAddress.fullAddress || '').trim()
                },
                skinTypeBaseline: String(updatedData.skinTypeBaseline || ''),
                mainConcern: String(updatedData.mainConcern || ''), updatedAt: serverTimestamp()
            };
            await updateDoc(doc(this.firebase.db, 'users', this.currentUser.uid), safe);
            if (safe.name && safe.name !== this.firebase.auth.currentUser.displayName) await this.firebase.sdk.auth.updateProfile(this.firebase.auth.currentUser, { displayName: safe.name });
            Object.assign(this.currentUser, safe);
            return { success: true, user: this.currentUser };
        } catch (error) { return { success: false, message: this.errorMessage(error) }; }
    }

    async updateProfilePicture(picture) {
        if (!this.currentUser) return { success: false, message: 'Chưa đăng nhập.' };
        if (!/^data:image\/(jpeg|png|webp);base64,/.test(picture) || picture.length > 300000) {
            return { success: false, message: 'Ảnh đại diện không hợp lệ hoặc có dung lượng quá lớn.' };
        }
        try {
            const { doc, serverTimestamp, updateDoc } = this.firebase.sdk.firestore;
            await updateDoc(doc(this.firebase.db, 'users', this.currentUser.uid), { picture, updatedAt: serverTimestamp() });
            this.currentUser.picture = picture;
            return { success: true, user: this.currentUser };
        } catch (error) { return { success: false, message: this.errorMessage(error) }; }
    }

    async changePassword(oldPassword, newPassword) {
        const firebaseUser = this.firebase.auth.currentUser;
        if (!firebaseUser) return { success: false, message: 'Chưa đăng nhập.' };
        if (!firebaseUser.email || firebaseUser.providerData.some(item => item.providerId === 'google.com')) return { success: false, message: 'Tài khoản Google không sử dụng mật khẩu SkinID.' };
        if (newPassword.length < 6) return { success: false, message: 'Mật khẩu mới phải có tối thiểu 6 ký tự.' };
        try {
            const sdk = this.firebase.sdk.auth;
            await sdk.reauthenticateWithCredential(firebaseUser, sdk.EmailAuthProvider.credential(firebaseUser.email, oldPassword));
            await sdk.updatePassword(firebaseUser, newPassword);
            return { success: true };
        } catch (error) { return { success: false, message: this.errorMessage(error) }; }
    }

    async saveScanHistory(reportData) {
        if (!this.currentUser) return null;
        const { addDoc, collection, serverTimestamp } = this.firebase.sdk.firestore;
        const record = {
            dateFormatted: new Date().toLocaleString('vi-VN'), healthScore: Number(reportData.healthScore || 0),
            skinType: String(reportData.skinType || 'Da chưa xác định'), skinAge: Number(reportData.skinAge || 0),
            primaryConcerns: Array.isArray(reportData.primaryConcerns) ? reportData.primaryConcerns : [],
            metrics: reportData.metrics || {}, recommendedRoutine: Array.isArray(reportData.recommendedRoutine) ? reportData.recommendedRoutine : [],
            createdAt: serverTimestamp()
        };
        const reference = await addDoc(collection(this.firebase.db, 'users', this.currentUser.uid, 'skinReports'), record);
        const cached = { id: reference.id, ...record, createdAt: new Date() };
        this.history.unshift(cached);
        this.updateHeaderUI();
        return cached;
    }

    async clearAllUserHistory() {
        if (!this.currentUser || !confirm('Bạn có chắc muốn xóa toàn bộ lịch sử soi da?')) return false;
        const { deleteDoc, doc } = this.firebase.sdk.firestore;
        await Promise.all(this.history.map(item => deleteDoc(doc(this.firebase.db, 'users', this.currentUser.uid, 'skinReports', item.id))));
        this.history = [];
        this.renderHistoryContent();
        this.updateHeaderUI();
        document.dispatchEvent(new CustomEvent('skinid:history-changed'));
        return true;
    }

    checkPasswordStrength(password) {
        let score = 0;
        if (password.length >= 6) score++;
        if (password.length >= 10) score++;
        if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
        if (/\d/.test(password) && /[^A-Za-z0-9]/.test(password)) score++;
        return [
            { label: 'Rất yếu', width: '15%', color: 'bg-rose-500', textClass: 'text-rose-500' },
            { label: 'Yếu', width: '35%', color: 'bg-orange-500', textClass: 'text-orange-500' },
            { label: 'Trung bình', width: '60%', color: 'bg-amber-500', textClass: 'text-amber-600' },
            { label: 'Mạnh', width: '80%', color: 'bg-emerald-500', textClass: 'text-emerald-600' },
            { label: 'Rất mạnh', width: '100%', color: 'bg-emerald-600', textClass: 'text-emerald-700' }
        ][Math.min(score, 4)];
    }

    errorMessage(error) {
        return ({
            'auth/email-already-in-use': 'Email này đã được đăng ký.', 'auth/invalid-email': 'Email không hợp lệ.',
            'auth/invalid-credential': 'Email hoặc mật khẩu không chính xác.', 'auth/weak-password': 'Mật khẩu chưa đủ mạnh.',
            'auth/popup-closed-by-user': 'Cửa sổ đăng nhập Google đã bị đóng.', 'auth/too-many-requests': 'Có quá nhiều lần thử. Vui lòng thử lại sau.'
            , 'auth/operation-not-allowed': 'Phương thức đăng nhập này đang tạm ngưng. Vui lòng chọn cách khác.'
            , 'auth/unauthorized-domain': 'Đăng nhập chưa được hỗ trợ trên địa chỉ website này.'
            , 'functions/unauthenticated': 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.'
            , 'functions/permission-denied': 'Bạn không có quyền thực hiện thao tác này.'
            , 'functions/failed-precondition': error?.message || 'Dữ liệu không còn hợp lệ. Vui lòng tải lại trang.'
            , 'functions/invalid-argument': error?.message || 'Thông tin gửi lên không hợp lệ.'
            , 'functions/unavailable': 'Dịch vụ đặt hàng đang tạm gián đoạn. Vui lòng thử lại.'
            , 'functions/not-found': 'Hệ thống đặt hàng chưa sẵn sàng. Vui lòng liên hệ SkinID.'
            , 'functions/internal': 'Hệ thống chưa thể tạo đơn hàng lúc này. Vui lòng thử lại sau ít phút.'
            , 'unauthenticated': 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.'
            , 'invalid_token': 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn.'
            , 'server_not_configured': 'Hệ thống đặt hàng đang được bảo trì. Vui lòng thử lại sau ít phút.'
            , 'request_timeout': 'Kết nối quá thời gian. Vui lòng thử lại.'
            , 'network_error': 'Không thể kết nối hệ thống. Vui lòng kiểm tra mạng và thử lại.'
            , 'product_unavailable': error?.message || 'Một sản phẩm trong giỏ không còn kinh doanh.'
            , 'invalid_product_price': error?.message || 'Giá sản phẩm đang được cập nhật. Vui lòng thử lại.'
            , 'invalid_address': error?.message || 'Vui lòng chọn đầy đủ địa chỉ giao hàng.'
            , 'invalid_phone': 'Số điện thoại Việt Nam chưa đúng định dạng.'
            , 'daily_limit': 'Bạn đã hết lượt phân tích da hôm nay.'
            , 'gemini_not_configured': 'Tính năng soi da đang được bảo trì. Vui lòng thử lại sau.'
            , 'gemini_unavailable': 'Dịch vụ phân tích đang bận, vui lòng thử lại.'
            , 'internal': 'Hệ thống chưa thể tạo đơn hàng lúc này. Vui lòng thử lại sau ít phút.'
        })[error?.code] || (/internal(?:\s*\[\d+\])?/i.test(error?.message || '')
            ? 'Hệ thống chưa thể hoàn tất yêu cầu lúc này. Vui lòng thử lại sau ít phút.'
            : error?.message || 'Không thể hoàn tất yêu cầu.');
    }

    escapeHtml(value) { return String(value ?? '').replace(/[&<>'"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[c]); }

    updateHeaderUI() {
        const section = document.getElementById('header-auth-section');
        if (!section) return;
        if (!this.currentUser) {
            section.innerHTML = `<button onclick="window.authManager.openAuthModal()" class="flex items-center gap-1.5 bg-white text-brand-dark border border-brand-petal px-4 py-2 rounded-full text-xs font-bold hover:bg-brand-blush hover:border-brand-primary transition-all shadow-sm"><i data-feather="user" class="w-3.5 h-3.5 text-brand-primary"></i>Đăng nhập / Đăng ký</button>`;
        } else {
            const name = this.escapeHtml(this.currentUser.name), email = this.escapeHtml(this.currentUser.email), initial = this.escapeHtml(name.charAt(0).toUpperCase() || 'U');
            section.innerHTML = `<div class="flex items-center gap-2 sm:gap-3"><button onclick="window.authManager.openHistoryModal()" class="flex items-center gap-1.5 bg-brand-blush text-brand-dark px-3 py-2 rounded-full text-xs font-bold border border-brand-petal"><i data-feather="clock" class="w-3.5 h-3.5"></i><span class="hidden sm:inline">Lịch sử</span><span class="bg-brand-primary text-white text-[10px] px-1.5 rounded-full">${this.history.length}</span></button><div class="relative group"><button class="flex items-center gap-2 bg-gray-900 text-white pl-2 pr-3 py-1.5 rounded-full text-xs font-bold"><span class="w-7 h-7 rounded-full bg-brand-primary flex items-center justify-center">${initial}</span><span class="max-w-[120px] truncate">${name}</span></button><div class="absolute right-0 top-full mt-1.5 w-60 bg-white rounded-2xl shadow-2xl border border-gray-100 p-2 hidden group-hover:block z-50"><div class="px-3 py-2 border-b"><p class="text-xs font-bold truncate">${name}</p><p class="text-[11px] text-gray-500 truncate">${email}</p></div><button onclick="window.authManager.openProfileModal()" class="w-full text-left px-3 py-2 text-xs font-semibold">Thông tin cá nhân</button><button onclick="window.authManager.logout()" class="w-full text-left px-3 py-2 text-xs font-bold text-rose-600">Đăng xuất</button></div></div></div>`;
        }
        if (window.feather) feather.replace();
    }

    openAuthModal(message = '') {
        const modal = document.getElementById('auth-modal'); if (!modal) return;
        const notice = document.getElementById('auth-modal-notice'), text = document.getElementById('auth-notice-text');
        if (notice) notice.classList.toggle('hidden', !message); if (text) text.textContent = message;
        window.SkinIDScrollLock?.lock('auth');
        modal.classList.remove('hidden'); setTimeout(() => { modal.classList.remove('opacity-0'); document.getElementById('auth-modal-content')?.classList.remove('scale-95'); }, 10);
    }

    closeAuthModal() { const modal = document.getElementById('auth-modal'); if (!modal) return; modal.classList.add('opacity-0'); window.SkinIDScrollLock?.unlock('auth'); setTimeout(() => modal.classList.add('hidden'), 300); }
    openHistoryModal() { if (!this.currentUser) return this.openAuthModal('Vui lòng đăng nhập để xem lịch sử soi da.'); const modal = document.getElementById('history-modal'); if (!modal) return; this.renderHistoryContent(); window.SkinIDScrollLock?.lock('history'); modal.classList.remove('hidden'); setTimeout(() => modal.classList.remove('opacity-0'), 10); }
    closeHistoryModal() { const modal = document.getElementById('history-modal'); if (!modal) return; modal.classList.add('opacity-0'); window.SkinIDScrollLock?.unlock('history'); setTimeout(() => modal.classList.add('hidden'), 300); }

    renderHistoryContent() {
        const container = document.getElementById('history-list-container'); if (!container) return;
        if (!this.history.length) { container.innerHTML = '<div class="text-center py-12 text-gray-400"><p class="font-bold text-sm text-gray-600">Chưa có lịch sử soi da nào</p><p class="text-xs mt-1">Hãy thực hiện soi da để lưu báo cáo đầu tiên.</p></div>'; return; }
        container.innerHTML = `<div class="flex justify-end mb-3"><button onclick="window.authManager.clearAllUserHistory()" class="text-xs font-bold text-rose-600 underline">Xóa toàn bộ dữ liệu</button></div>` + this.history.map((item, index) => `<div class="bg-white border rounded-2xl p-4 mb-3"><div class="flex justify-between mb-2"><strong class="text-xs">Lần #${this.history.length - index}</strong><span class="text-xs text-gray-500">${this.escapeHtml(item.dateFormatted)}</span></div><div class="grid grid-cols-3 gap-2 text-xs"><span>Điểm: <b>${Number(item.healthScore)}</b></span><span>${this.escapeHtml(item.skinType)}</span><span>${Number(item.skinAge)} tuổi</span></div></div>`).join('');
    }

    exportUserDataJSON() { if (!this.currentUser) return; const blob = new Blob([JSON.stringify({ profile: this.currentUser, scanHistory: this.history, orders: this.orders, exportedAt: new Date().toISOString() }, null, 2)], { type: 'application/json' }); const url = URL.createObjectURL(blob), anchor = document.createElement('a'); anchor.href = url; anchor.download = 'skinid-profile.json'; anchor.click(); URL.revokeObjectURL(url); }
    openProfileModal() { window.location.href = '/profile'; }
}

window.togglePasswordVisibility = window.togglePasswordVisibility || function (id, button) {
    const input = document.getElementById(id); if (!input) return;
    input.type = input.type === 'password' ? 'text' : 'password';
    const icon = button?.querySelector('i'); if (icon) icon.setAttribute('data-feather', input.type === 'password' ? 'eye' : 'eye-off');
    if (window.feather) feather.replace();
};
window.handleConfirmPasswordInput = window.handleConfirmPasswordInput || function () {
    const password = document.getElementById('reg-password')?.value || '', confirmation = document.getElementById('reg-confirm-password')?.value || '', message = document.getElementById('reg-confirm-msg');
    if (!message) return; message.classList.toggle('hidden', !confirmation); if (!confirmation) return;
    message.className = `text-[10px] font-bold mt-1 ${password === confirmation ? 'text-emerald-600' : 'text-rose-500'}`;
    message.textContent = password === confirmation ? '✓ Khớp' : '✗ Không khớp';
};
window.handlePasswordStrengthInput = window.handlePasswordStrengthInput || function (value) {
    const result = window.authManager.checkPasswordStrength(value), bar = document.getElementById('reg-strength-bar'), label = document.getElementById('reg-strength-label');
    if (bar && label) { bar.className = `h-full ${result.color} transition-all duration-300`; bar.style.width = result.width; label.className = `text-[10px] font-bold ${result.textClass}`; label.textContent = result.label; }
    window.handleConfirmPasswordInput();
};
window.toggleAuthForm = window.toggleAuthForm || function (mode) {
    const forms = { login: document.getElementById('form-login'), register: document.getElementById('form-register'), forgot: document.getElementById('form-forgot') };
    Object.values(forms).forEach(form => form?.classList.add('hidden')); forms[mode]?.classList.remove('hidden');
};
window.handleLoginSubmit = window.handleLoginSubmit || async function (event) {
    event.preventDefault(); const result = await window.authManager.login(document.getElementById('login-email').value, document.getElementById('login-password').value, document.getElementById('login-remember')?.checked ?? true);
    if (result.success) window.authManager.closeAuthModal(); else alert(result.message);
};
window.handleRegisterSubmit = window.handleRegisterSubmit || async function (event) {
    event.preventDefault(); const result = await window.authManager.register(document.getElementById('reg-name').value, document.getElementById('reg-email').value, document.getElementById('reg-phone').value, document.getElementById('reg-password').value, document.getElementById('reg-confirm-password').value, true);
    if (result.success) window.authManager.closeAuthModal(); else alert(result.message);
};
window.handleForgotSubmit = window.handleForgotSubmit || async function (event) {
    event.preventDefault(); const email = document.getElementById('forgot-email').value, result = await window.authManager.resetPassword(email);
    alert(result.message); if (result.success) window.toggleAuthForm('login');
};

const authManager = new AuthManager();
window.authManager = authManager;
