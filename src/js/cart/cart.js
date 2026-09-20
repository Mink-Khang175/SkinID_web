class ShoppingCart {
    constructor() {
        this.items = []; // Array of { productId, quantity }
        this.lastUserId = null;
        this.saveQueue = Promise.resolve();
        this.initDOM();
        this.loadCart();
        document.addEventListener('skinid:auth-changed', () => this.loadCart({ mergeGuest: true }));
    }

    async loadCart({ mergeGuest = false } = {}) {
        const user = window.authManager?.getCurrentUser?.();
        if (!user) {
            if (this.lastUserId) this.items = [];
            this.lastUserId = null;
            this.updateBadge();
            this.renderCartUI();
            return this.items;
        }
        const guestItems = mergeGuest && !this.lastUserId ? this.items : [];
        const remoteItems = window.authManager?.getCart?.() || [];
        const merged = new Map(remoteItems.map(item => [item.productId, { ...item }]));
        guestItems.forEach(item => {
            const existing = merged.get(item.productId);
            merged.set(item.productId, { productId: item.productId, quantity: Math.min(20, (existing?.quantity || 0) + item.quantity) });
        });
        this.items = [...merged.values()];
        this.lastUserId = user.uid;
        this.updateBadge();
        this.renderCartUI();
        if (guestItems.length) await window.authManager.saveCart(this.items);
        return this.items;
    }

    saveCart() {
        this.updateBadge();
        this.renderCartUI();
        if (!window.authManager?.getCurrentUser?.()) return Promise.resolve({ success: true, guest: true });
        const snapshot = this.items.map(item => ({ ...item }));
        this.saveQueue = this.saveQueue.then(() => window.authManager.saveCart(snapshot));
        return this.saveQueue;
    }

    addItem(productId, quantity = 1) {
        const existing = this.items.find(item => item.productId === productId);
        if (existing) {
            existing.quantity += quantity;
        } else {
            this.items.push({ productId, quantity });
        }
        this.saveCart();

        if (typeof window.trackSkinIDEvent === 'function') {
            const prod = this.getProductDetails(productId);
            window.trackSkinIDEvent('add_to_cart', {
                item_id: productId,
                item_name: prod ? prod.name : productId,
                price: prod ? prod.price : 0,
                quantity: quantity
            });
        }
    }

    removeItem(productId) {
        this.items = this.items.filter(item => item.productId !== productId);
        this.saveCart();
    }

    updateQuantity(productId, quantity) {
        const item = this.items.find(item => item.productId === productId);
        if (item) {
            item.quantity = quantity;
            if (item.quantity <= 0) {
                this.removeItem(productId);
            } else {
                this.saveCart();
            }
        }
    }

    clearCart() {
        this.items = [];
        return this.saveCart();
    }

    getTotalItems() {
        return this.items.reduce((total, item) => total + item.quantity, 0);
    }

    updateBadge() {
        const count = this.getTotalItems();
        const mainBadge = document.getElementById('cart-badge');
        const mobileBadge = document.getElementById('mobile-cart-badge');
        
        if (mainBadge) {
            mainBadge.innerText = count;
            count > 0 ? mainBadge.classList.remove('opacity-0') : mainBadge.classList.add('opacity-0');
        }
        if (mobileBadge) {
            mobileBadge.innerText = count;
            count > 0 ? mobileBadge.classList.remove('opacity-0') : mobileBadge.classList.add('opacity-0');
        }
    }

    toggleCartUI(force) {
        const overlay = document.getElementById('cart-overlay');
        const panel = document.getElementById('cart-panel');
        if (!overlay || !panel) return;

        const shouldOpen = typeof force === 'boolean' ? force : overlay.classList.contains('hidden');
        if (shouldOpen) {
            // Open
            overlay.classList.remove('hidden');
            window.SkinIDScrollLock?.lock('cart');
            setTimeout(() => {
                overlay.classList.remove('opacity-0');
                panel.classList.remove('translate-x-full');
            }, 10);
            this.renderCartUI();
        } else {
            // Close
            overlay.classList.add('opacity-0');
            panel.classList.add('translate-x-full');
            window.SkinIDScrollLock?.unlock('cart');
            setTimeout(() => {
                overlay.classList.add('hidden');
            }, 300);
        }
    }

    getProductDetails(productId) {
        // PRODUCTS is available globally from skin-ai.js
        if (typeof PRODUCTS !== 'undefined') {
            return PRODUCTS.find(p => p.id === productId);
        }
        return null;
    }

    renderCartUI() {
        const container = document.getElementById('cart-items-container');
        const subtotalEl = document.getElementById('cart-subtotal');
        if (!container || !subtotalEl) return;

        if (this.items.length === 0) {
            container.innerHTML = `
                <div class="flex flex-col items-center justify-center h-full text-gray-400 py-12">
                    <i data-feather="shopping-bag" class="w-12 h-12 mb-4 opacity-50"></i>
                    <p class="font-medium text-sm">Giỏ hàng của bạn đang trống</p>
                    <button onclick="cartManager.toggleCartUI()" class="mt-4 px-6 py-2 bg-brand-light text-brand-primary rounded-lg text-sm font-semibold hover:bg-brand-petal transition-colors">
                        Tiếp tục mua sắm
                    </button>
                </div>
            `;
            subtotalEl.innerText = '0đ';
            if (typeof feather !== 'undefined') feather.replace();
            return;
        }

        let html = '';
        let subtotal = 0;

        this.items.forEach(item => {
            const product = this.getProductDetails(item.productId);
            if (!product) return; // Skip if product not found

            const itemTotal = product.price * item.quantity;
            subtotal += itemTotal;

            html += `
                <div class="flex gap-3 p-4 border-b border-gray-50 bg-white">
                    <div class="cart-item-image flex items-center justify-center">
                        <img src="${product.image.startsWith('http') || product.image.startsWith('data:') ? product.image : (window.SKINID_ASSET_URL ? window.SKINID_ASSET_URL(product.image) : product.image)}" alt="${product.name}" loading="lazy" onerror="this.style.visibility='hidden';this.parentElement.setAttribute('aria-label','Ảnh sản phẩm ${product.brand}')">
                    </div>
                    <div class="flex-grow flex flex-col justify-between">
                        <div class="flex justify-between items-start gap-2">
                            <div>
                                <p class="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">${product.brand}</p>
                                <h4 class="text-sm font-bold text-gray-800 line-clamp-2 leading-snug">${product.name}</h4>
                            </div>
                            <button onclick="cartManager.removeItem('${item.productId}')" class="text-gray-400 hover:text-red-500 transition-colors p-1 flex-shrink-0">
                                <i data-feather="trash-2" class="w-4 h-4"></i>
                            </button>
                        </div>
                        <div class="flex justify-between items-end mt-2">
                            <div class="flex items-center gap-3 bg-gray-50 px-2 py-1 rounded-lg border border-gray-200">
                                <button onclick="cartManager.updateQuantity('${item.productId}', ${item.quantity - 1})" class="text-gray-500 hover:text-brand-primary p-1">
                                    <i data-feather="minus" class="w-3 h-3"></i>
                                </button>
                                <span class="text-sm font-semibold w-4 text-center">${item.quantity}</span>
                                <button onclick="cartManager.updateQuantity('${item.productId}', ${item.quantity + 1})" class="text-gray-500 hover:text-brand-primary p-1">
                                    <i data-feather="plus" class="w-3 h-3"></i>
                                </button>
                            </div>
                            <div class="text-right">
                                <p class="text-sm font-bold text-brand-primary">${formatPrice(product.price)}</p>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });

        container.innerHTML = html;
        subtotalEl.innerText = formatPrice(subtotal);
        if (typeof feather !== 'undefined') feather.replace();
    }

    checkoutZalo() {
        if (this.items.length === 0) return;
        
        let message = "Xin chào SkinID, mình muốn đặt mua các sản phẩm sau:\n\n";
        let subtotal = 0;

        this.items.forEach((item, index) => {
            const product = this.getProductDetails(item.productId);
            if (product) {
                const itemTotal = product.price * item.quantity;
                subtotal += itemTotal;
                message += `${index + 1}. ${product.name}\n   Số lượng: ${item.quantity} x ${formatPrice(product.price)}\n`;
            }
        });

        message += `\nTổng tạm tính: ${formatPrice(subtotal)}`;

        if (typeof window.trackSkinIDEvent === 'function') {
            window.trackSkinIDEvent('checkout_zalo', {
                total_value: subtotal,
                item_count: this.getTotalItems()
            });
        }
        
        const zaloUrl = `https://zalo.me/0924093461?text=${encodeURIComponent(message)}`;
        window.open(zaloUrl, '_blank');
        
        // Optional: clear cart after redirecting to checkout
        // this.clearCart();
    }

    async openCheckout() {
        if (!this.items.length) return;
        const user = window.authManager?.getCurrentUser?.();
        if (!user) {
            this.toggleCartUI();
            window.authManager?.openAuthModal?.('Vui lòng đăng nhập để đặt hàng và theo dõi đơn.');
            return;
        }
        const modal = document.getElementById('checkout-modal');
        if (!modal) return;
        document.getElementById('checkout-name').value = user.name || '';
        document.getElementById('checkout-phone').value = user.phone || '';
        const savedAddress = user.shippingAddress || {};
        document.getElementById('checkout-address-line').value = savedAddress.line1 || (!user.shippingAddress ? user.address || '' : '');
        document.getElementById('checkout-error').classList.add('hidden');
        document.getElementById('checkout-error').textContent = '';
        await window.VietnamAddress?.bindForm?.({
            provinceId: 'checkout-province',
            wardId: 'checkout-ward',
            selectedProvinceCode: savedAddress.provinceCode,
            selectedWardCode: savedAddress.wardCode
        });
        const subtotal = this.items.reduce((sum, item) => {
            const product = this.getProductDetails(item.productId);
            return sum + (product ? product.price * item.quantity : 0);
        }, 0);
        document.getElementById('checkout-total').textContent = formatPrice(subtotal);
        modal.classList.remove('hidden');
        window.SkinIDScrollLock?.lock('checkout');
        this.toggleCartUI(false);
    }

    closeCheckout() {
        document.getElementById('checkout-modal')?.classList.add('hidden');
        window.SkinIDScrollLock?.unlock('checkout');
    }

    async submitCheckout(event) {
        event.preventDefault();
        const button = document.getElementById('checkout-submit');
        const errorBox = document.getElementById('checkout-error');
        const shippingAddress = window.VietnamAddress?.readForm?.({
            provinceId: 'checkout-province', wardId: 'checkout-ward', line1Id: 'checkout-address-line'
        });
        if (!shippingAddress?.provinceCode || !shippingAddress?.wardCode || !shippingAddress?.line1) {
            errorBox.textContent = 'Vui lòng chọn tỉnh/thành, phường/xã và nhập địa chỉ chi tiết.';
            errorBox.classList.remove('hidden');
            return;
        }
        errorBox.classList.add('hidden');
        button.disabled = true;
        button.textContent = 'Đang tạo đơn…';
        const items = this.items.map(item => {
            const product = this.getProductDetails(item.productId);
            return product ? { productId: product.id, name: product.name, image: product.image, price: product.price, quantity: item.quantity, lineTotal: product.price * item.quantity } : null;
        }).filter(Boolean);
        const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
        const result = await window.authManager.createOrder({
            customer: {
                name: document.getElementById('checkout-name').value,
                phone: document.getElementById('checkout-phone').value,
                shippingAddress
            },
            note: document.getElementById('checkout-note').value,
            paymentMethod: document.querySelector('input[name="payment-method"]:checked')?.value || 'cod',
            items, subtotal, shippingFee: 0, total: subtotal
        });
        if (!result.success) {
            button.disabled = false;
            button.textContent = 'Xác nhận đặt hàng';
            errorBox.textContent = result.message;
            errorBox.classList.remove('hidden');
            return;
        }
        await this.clearCart();
        this.closeCheckout();
        if (typeof showToast === 'function') showToast(`Đặt hàng thành công · #${result.orderId.slice(0, 8).toUpperCase()}`);
        window.location.href = '/profile?tab=orders';
    }

    initDOM() {
        // Create Cart Overlay and Panel if not exists
        if (!document.getElementById('cart-overlay')) {
            const cartHTML = `
                <!-- Cart Overlay -->
                <div id="cart-overlay" class="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-[9999] hidden opacity-0 transition-opacity duration-300" onclick="if(event.target === this) cartManager.toggleCartUI()">
                    
                    <!-- Cart Panel -->
                    <div id="cart-panel" class="absolute right-0 top-0 bottom-0 w-full md:w-[400px] bg-white shadow-2xl transform translate-x-full transition-transform duration-300 flex flex-col">
                        
                        <!-- Header -->
                        <div class="flex items-center justify-between p-4 border-b border-gray-100 bg-white z-10">
                            <div class="flex items-center gap-2">
                                <div class="w-8 h-8 rounded-full bg-brand-light flex items-center justify-center text-brand-primary">
                                    <i data-feather="shopping-bag" class="w-4 h-4"></i>
                                </div>
                                <h3 class="text-lg font-bold text-gray-900">Giỏ hàng</h3>
                            </div>
                            <button onclick="cartManager.toggleCartUI()" class="p-2 text-gray-400 hover:text-gray-800 bg-gray-50 rounded-full transition-colors" type="button" aria-label="Đóng giỏ hàng">
                                <i data-feather="x" class="w-5 h-5"></i>
                            </button>
                        </div>

                        <!-- Items List -->
                        <div id="cart-items-container" class="flex-grow overflow-y-auto bg-gray-50/50">
                            <!-- Items will be rendered here -->
                        </div>

                        <!-- Footer -->
                        <div class="cart-footer border-t border-gray-100 bg-white shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.05)]">
                            <div class="cart-subtotal-row flex justify-between items-center">
                                <span class="text-gray-500 font-medium">Tạm tính</span>
                                <span id="cart-subtotal" class="text-xl font-bold text-brand-primary">0đ</span>
                            </div>
                            <button onclick="cartManager.openCheckout()" class="cart-checkout-button" type="button">
                                <i data-feather="credit-card" class="w-5 h-5"></i>
                                Tiến hành thanh toán
                            </button>
                            <p class="text-[11px] text-gray-400 text-center mt-3">Đơn hàng được lưu trên tài khoản để bạn theo dõi trạng thái.</p>
                        </div>
                    </div>
                </div>
                <div id="checkout-modal" class="fixed inset-0 z-[10000] hidden bg-gray-950/60 backdrop-blur-sm p-4 overflow-y-auto">
                    <form onsubmit="cartManager.submitCheckout(event)" class="checkout-panel mx-auto my-8 max-w-xl rounded-3xl bg-white p-6 shadow-2xl">
                        <div class="flex items-center justify-between mb-5"><div><p class="text-xs font-bold text-brand-primary">CHECKOUT</p><h2 class="text-2xl font-black">Thông tin nhận hàng</h2></div><button type="button" onclick="cartManager.closeCheckout()" class="p-2 rounded-full bg-gray-100" aria-label="Đóng thanh toán"><i data-feather="x"></i></button></div>
                        <div class="grid gap-4 sm:grid-cols-2">
                            <label class="checkout-field"><span>Họ và tên *</span><input id="checkout-name" required></label>
                            <label class="checkout-field"><span>Số điện thoại *</span><input id="checkout-phone" type="tel" required></label>
                            <label class="checkout-field"><span>Tỉnh / Thành phố *</span><select id="checkout-province" required><option value="">Chọn tỉnh/thành</option></select></label>
                            <label class="checkout-field"><span>Phường / Xã *</span><select id="checkout-ward" required disabled><option value="">Chọn tỉnh/thành trước</option></select></label>
                            <label class="checkout-field sm:col-span-2"><span>Địa chỉ chi tiết *</span><input id="checkout-address-line" required autocomplete="street-address" placeholder="Số nhà, tên đường, tòa nhà…"></label>
                            <p class="checkout-address-note sm:col-span-2"><i data-feather="cloud"></i> Địa chỉ này sẽ được lưu vào hồ sơ Firestore để tự động điền cho lần mua sau.</p>
                            <label class="checkout-field sm:col-span-2"><span>Ghi chú</span><textarea id="checkout-note" rows="2"></textarea></label>
                        </div>
                        <div id="checkout-error" class="checkout-message checkout-message--error hidden" role="alert"></div>
                        <fieldset class="mt-5"><legend class="text-sm font-bold mb-2">Phương thức thanh toán</legend><label class="payment-option"><input type="radio" name="payment-method" value="cod" checked> Thanh toán khi nhận hàng (COD)</label><label class="payment-option"><input type="radio" name="payment-method" value="bank_transfer"> Chuyển khoản ngân hàng (CSKH xác nhận)</label></fieldset>
                        <div class="flex items-center justify-between mt-6 pt-5 border-t"><span class="font-semibold text-gray-500">Tổng thanh toán</span><strong id="checkout-total" class="text-xl text-brand-primary">0đ</strong></div>
                        <button id="checkout-submit" type="submit" class="btn btn--primary btn--full mt-4">Xác nhận đặt hàng</button>
                    </form>
                </div>
            `;
            document.body.insertAdjacentHTML('beforeend', cartHTML);
            if (typeof feather !== 'undefined') feather.replace();
        }
    }
}

// Format price helper (duplicate from skin-ai.js in case cart.js is loaded standalone, but we can reuse if global)
if (typeof window.formatPrice === 'undefined') {
    window.formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    };
}

// Initialize global CartManager
const cartManager = new ShoppingCart();
window.cartManager = cartManager;
window.ShoppingCart = ShoppingCart;
