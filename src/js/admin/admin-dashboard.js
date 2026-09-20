(async function initAdminDashboard() {
    await window.SKINID_AUTH_READY;
    const firebase = window.SKINID_FIREBASE;
    const user = firebase?.auth?.currentUser;
    const status = document.getElementById('admin-status');
    if (!user) { status.textContent = 'Bạn chưa đăng nhập. Hãy đăng nhập tại cửa hàng trước khi mở trang quản trị.'; return; }
    const token = await firebase.sdk.auth.getIdTokenResult(user, true);
    if (token.claims.admin !== true) { status.textContent = 'Tài khoản này chưa có quyền quản trị.'; return; }

    const { collection, deleteDoc, doc, getDocs, serverTimestamp, setDoc, updateDoc } = firebase.sdk.firestore;
    const editor = document.getElementById('admin-editor');
    const editorForm = document.getElementById('admin-editor-form');
    const usersById = new Map();
    const productsById = new Map();
    const money = value => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(value || 0));
    const escapeHtml = value => String(value ?? '').replace(/[&<>'"]/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character]);
    const slugify = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const flash = (message, error = false) => {
        const element = document.getElementById('admin-flash');
        element.textContent = message;
        element.classList.toggle('admin-flash--error', error);
        element.classList.remove('hidden');
        window.setTimeout(() => element.classList.add('hidden'), 5000);
    };

    async function loadDashboard() {
        const [usersSnapshot, ordersSnapshot, productsSnapshot] = await Promise.all([
            getDocs(collection(firebase.db, 'users')),
            getDocs(collection(firebase.db, 'orders')),
            getDocs(collection(firebase.db, 'products'))
        ]);
        const users = usersSnapshot.docs.map(item => ({ id: item.id, ...item.data() }));
        const orders = ordersSnapshot.docs.map(item => ({ id: item.id, ...item.data() })).sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
        const products = productsSnapshot.docs.map(item => ({ id: item.id, ...item.data() }));
        usersById.clear(); users.forEach(item => usersById.set(item.id, item));
        productsById.clear(); products.forEach(item => productsById.set(item.id, item));
        document.getElementById('admin-user-count').textContent = users.length;
        document.getElementById('admin-order-count').textContent = orders.length;
        document.getElementById('admin-product-count').textContent = products.length;
        renderUsers(users);
        renderOrders(orders);
        renderProducts(products);
    }

    function renderUsers(users) {
        document.getElementById('admin-users-body').innerHTML = users.map(item => `<tr><td>${escapeHtml(item.email)}</td><td>${escapeHtml(item.name)}</td><td>${escapeHtml(item.phone)}</td><td>${escapeHtml(item.provider)}</td><td><div class="admin-actions"><button type="button" data-edit-user="${item.id}">Sửa</button><button type="button" class="is-danger" data-delete-user="${item.id}" ${item.id === user.uid ? 'disabled title="Không thể tự xóa tài khoản đang đăng nhập"' : ''}>Xóa</button></div></td></tr>`).join('');
    }

    function renderOrders(orders) {
        const statuses = ['pending', 'confirmed', 'shipping', 'completed', 'cancelled'];
        document.getElementById('admin-orders-body').innerHTML = orders.map(item => {
            const products = (item.items || []).map(product => `${Number(product.quantity || 0)} × ${escapeHtml(product.name)}`).join('<br>');
            return `<tr><td>#${item.id.slice(0, 8).toUpperCase()}</td><td>${escapeHtml(item.customer?.name)}<br><small>${escapeHtml(item.customer?.phone)}</small></td><td class="admin-cell-wrap">${escapeHtml(item.customer?.address)}</td><td class="admin-cell-wrap">${products}</td><td>${money(item.total)}</td><td><select data-payment="${item.id}"><option value="unpaid" ${item.paymentStatus === 'unpaid' ? 'selected' : ''}>Chưa thanh toán</option><option value="paid" ${item.paymentStatus === 'paid' ? 'selected' : ''}>Đã thanh toán</option><option value="refunded" ${item.paymentStatus === 'refunded' ? 'selected' : ''}>Đã hoàn tiền</option></select></td><td><select data-status="${item.id}">${statuses.map(value => `<option value="${value}" ${item.status === value ? 'selected' : ''}>${value}</option>`).join('')}</select></td><td><div class="admin-actions"><button type="button" class="is-danger" data-delete-order="${item.id}">Xóa</button></div></td></tr>`;
        }).join('');
    }

    function renderProducts(products) {
        document.getElementById('admin-products-body').innerHTML = products.map(item => `<tr><td>${escapeHtml(item.name || item.id)}</td><td>${escapeHtml(item.brand)}</td><td>${money(item.price)}</td><td>${escapeHtml(item.stepType || item.category)}</td><td><div class="admin-actions"><button type="button" data-edit-product="${item.id}">Sửa</button><button type="button" class="is-danger" data-delete-product="${item.id}">Xóa</button></div></td></tr>`).join('');
    }

    function openEditor(kind, item = {}) {
        const isProduct = kind === 'product';
        document.getElementById('admin-editor-kind').value = kind;
        document.getElementById('admin-editor-id').value = item.id || '';
        document.getElementById('admin-editor-title').textContent = `${item.id ? 'Chỉnh sửa' : 'Thêm'} ${isProduct ? 'sản phẩm' : 'người dùng'}`;
        document.getElementById('admin-user-fields').classList.toggle('hidden', isProduct);
        document.getElementById('admin-product-fields').classList.toggle('hidden', !isProduct);
        if (isProduct) {
            const values = { id: item.id, name: item.name, brand: item.brand, price: item.price, 'original-price': item.originalPrice, volume: item.volume, step: item.stepType, line: item.line, image: item.image, uses: item.uses };
            Object.entries(values).forEach(([field, value]) => { document.getElementById(`admin-product-${field}`).value = value ?? ''; });
            document.getElementById('admin-product-id').disabled = Boolean(item.id);
        } else {
            ['email', 'name', 'phone', 'address'].forEach(field => { document.getElementById(`admin-user-${field}`).value = item[field] ?? ''; });
        }
        editor.showModal();
    }

    document.getElementById('admin-add-product').addEventListener('click', () => openEditor('product'));
    document.querySelectorAll('[data-admin-close]').forEach(button => button.addEventListener('click', () => editor.close()));
    editor.addEventListener('click', event => { if (event.target === editor) editor.close(); });

    document.getElementById('admin-dashboard').addEventListener('click', async event => {
        try {
        const button = event.target.closest('button');
        if (!button) return;
        if (button.dataset.editUser) return openEditor('user', usersById.get(button.dataset.editUser));
        if (button.dataset.editProduct) return openEditor('product', productsById.get(button.dataset.editProduct));
        if (button.dataset.deleteProduct && window.confirm('Xóa sản phẩm này khỏi Firestore?')) {
            await deleteDoc(doc(firebase.db, 'products', button.dataset.deleteProduct));
            flash('Đã xóa sản phẩm.'); await loadDashboard();
        }
        if (button.dataset.deleteOrder && window.confirm('Xóa vĩnh viễn đơn hàng này?')) {
            await deleteDoc(doc(firebase.db, 'orders', button.dataset.deleteOrder));
            flash('Đã xóa đơn hàng.'); await loadDashboard();
        }
        if (button.dataset.deleteUser && window.confirm('Xóa tài khoản đăng nhập và toàn bộ dữ liệu người dùng này?')) {
            await window.authManager.apiRequest(`/admin/users/${encodeURIComponent(button.dataset.deleteUser)}`, { method: 'DELETE' });
            flash('Đã xóa tài khoản và dữ liệu người dùng.'); await loadDashboard();
        }
        } catch (error) { flash(`Thao tác thất bại: ${error.message}`, true); }
    });

    document.getElementById('admin-dashboard').addEventListener('change', async event => {
        try {
        const select = event.target.closest('[data-status],[data-payment]');
        if (!select) return;
        const orderId = select.dataset.status || select.dataset.payment;
        const field = select.dataset.status ? 'status' : 'paymentStatus';
        await updateDoc(doc(firebase.db, 'orders', orderId), { [field]: select.value, updatedAt: serverTimestamp() });
        flash('Đã cập nhật đơn hàng.');
        } catch (error) { flash(`Không thể cập nhật đơn hàng: ${error.message}`, true); }
    });

    editorForm.addEventListener('submit', async event => {
        event.preventDefault();
        try {
        const kind = document.getElementById('admin-editor-kind').value;
        const existingId = document.getElementById('admin-editor-id').value;
        if (kind === 'user') {
            await updateDoc(doc(firebase.db, 'users', existingId), {
                name: document.getElementById('admin-user-name').value.trim(),
                phone: document.getElementById('admin-user-phone').value.trim(),
                address: document.getElementById('admin-user-address').value.trim(),
                updatedAt: serverTimestamp()
            });
        } else {
            const id = existingId || slugify(document.getElementById('admin-product-id').value);
            if (!id) throw new Error('Mã sản phẩm không hợp lệ.');
            const brand = document.getElementById('admin-product-brand').value.trim();
            const name = document.getElementById('admin-product-name').value.trim();
            await setDoc(doc(firebase.db, 'products', id), {
                name, slug: slugify(name), brand, brandSlug: slugify(brand),
                price: Number(document.getElementById('admin-product-price').value),
                originalPrice: Number(document.getElementById('admin-product-original-price').value || 0),
                volume: document.getElementById('admin-product-volume').value.trim(),
                stepType: document.getElementById('admin-product-step').value,
                category: document.getElementById('admin-product-step').selectedOptions[0].textContent,
                line: document.getElementById('admin-product-line').value.trim(),
                image: document.getElementById('admin-product-image').value.trim(),
                uses: document.getElementById('admin-product-uses').value.trim(),
                updatedAt: serverTimestamp(),
                ...(existingId ? {} : { createdAt: serverTimestamp(), tier: 'Essential', mainActives: [], keyActives: [], skinTypes: ['all'], targetConcerns: [] })
            }, { merge: true });
        }
        editor.close();
        flash('Đã lưu dữ liệu vào Firestore.');
        await loadDashboard();
        } catch (error) { flash(`Không thể lưu dữ liệu: ${error.message}`, true); }
    });

    status.classList.add('hidden');
    document.getElementById('admin-dashboard').classList.remove('hidden');
    await loadDashboard();
})().catch(error => {
    console.error('[SkinID Admin]', error);
    const status = document.getElementById('admin-status');
    if (status && !status.classList.contains('hidden')) status.textContent = `Không thể tải dữ liệu quản trị: ${error.message}`;
    const flash = document.getElementById('admin-flash');
    if (flash) { flash.textContent = `Thao tác thất bại: ${error.message}`; flash.classList.add('admin-flash--error'); flash.classList.remove('hidden'); }
});
