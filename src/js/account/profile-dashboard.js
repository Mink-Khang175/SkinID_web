let progressChartInstance = null;
let profileFormSnapshot = '';
let profileDirtyTrackingBound = false;

function getProfileFormSnapshot() {
    const form = document.getElementById('form-edit-profile');
    if (!form) return '';
    return JSON.stringify([...form.querySelectorAll('input:not([type="file"]),select,textarea')].map(field => [field.id, field.value]));
}

function syncProfileSaveBar() {
    document.getElementById('profile-save-bar')?.classList.toggle('hidden', getProfileFormSnapshot() === profileFormSnapshot);
}

function renderProfileAvatar(user) {
    const container = document.getElementById('banner-avatar-container');
    if (!container) return;
    const fallback = () => {
        const avatar = document.createElement('div');
        avatar.className = 'profile-avatar profile-avatar--fallback';
        avatar.textContent = String(user.name || 'U').trim().charAt(0).toUpperCase() || 'U';
        container.replaceChildren(avatar);
    };
    if (!user.picture) return fallback();
    const image = document.createElement('img');
    image.className = 'profile-avatar';
    image.src = user.picture;
    image.alt = `Ảnh đại diện của ${user.name || 'người dùng'}`;
    image.referrerPolicy = 'no-referrer';
    image.addEventListener('error', fallback, { once: true });
    container.replaceChildren(image);
}

        // Switch Tabs
        window.switchProfileTab = function switchProfileTab(tabId) {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.add('hidden'));

            const targetBtn = document.getElementById('tab-btn-' + tabId);
            const targetContent = document.getElementById('tab-content-' + tabId);

            if (targetBtn) targetBtn.classList.add('active');
            if (targetContent) targetContent.classList.remove('hidden');

            if (tabId === 'history') {
                renderProgressChart();
            }

            if (window.feather) feather.replace();
        }

        // Render Dashboard Data
        window.renderProfileDashboard = async function renderProfileDashboard() {
            const previewMode = ['localhost', '127.0.0.1'].includes(window.location.hostname) && new URLSearchParams(window.location.search).get('preview') === '1';
            const user = window.authManager.getCurrentUser() || (previewMode ? {
                name: 'Khang Hồ', email: 'khang@example.com', phone: '', picture: null,
                provider: 'google', createdAt: { toDate: () => new Date('2026-01-01') }
            } : null);
            if (!user) {
                alert("Vui lòng đăng nhập để truy cập trang quản lý hồ sơ cá nhân!");
                window.location.href = '/?auth=1';
                return;
            }

            // Fill Banner
            document.getElementById('banner-user-name').innerText = user.name;
            document.getElementById('banner-user-email').innerText = user.email;

            renderProfileAvatar(user);

            const isGoogle = user.provider === 'google';
            document.getElementById('banner-provider-badge').innerHTML = isGoogle
                ? `<i data-feather="check-circle" class="w-3 h-3"></i> Tài khoản Google`
                : `<i data-feather="user-check" class="w-3 h-3"></i> Thành viên SkinID`;

            const joinDate = user.createdAt?.toDate ? user.createdAt.toDate() : null;
            document.getElementById('banner-join-date').innerText = joinDate ? joinDate.toLocaleDateString('vi-VN', { month: '2-digit', year: 'numeric' }) : 'SkinID';

            const history = window.authManager.getScanHistory();
            document.getElementById('banner-scan-count').innerText = `${history.length} lần`;
            document.getElementById('kpi-total-scans').innerText = history.length;

            if (history.length > 0) {
                const maxScore = Math.max(...history.map(h => h.healthScore || 0));
                document.getElementById('kpi-max-score').innerText = `${maxScore}/100`;
                document.getElementById('kpi-latest-age').innerText = `${history[0].skinAge || 25} tuổi`;
                document.getElementById('kpi-latest-type').innerText = history[0].skinType || 'Da chưa xác định';
            }

            // Fill Form Profile
            document.getElementById('prof-name').value = user.name || '';
            document.getElementById('prof-email').value = user.email || '';
            document.getElementById('prof-phone').value = user.phone || '';
            document.getElementById('prof-birthday').value = user.birthday || '';
            document.getElementById('prof-gender').value = user.gender || 'Nữ';
            const savedAddress = user.shippingAddress || {};
            document.getElementById('prof-address').value = savedAddress.line1 || (!user.shippingAddress ? user.address || '' : '');
            await window.VietnamAddress?.bindForm?.({
                provinceId: 'prof-province',
                wardId: 'prof-ward',
                selectedProvinceCode: savedAddress.provinceCode,
                selectedWardCode: savedAddress.wardCode
            });
            document.getElementById('prof-skintype').value = user.skinTypeBaseline || 'Chưa xác định';
            document.getElementById('prof-main-concern').value = user.mainConcern || 'Lỗ chân lông to & Sợi bã nhờn';
            profileFormSnapshot = getProfileFormSnapshot();
            syncProfileSaveBar();
            if (!profileDirtyTrackingBound) {
                const profileForm = document.getElementById('form-edit-profile');
                profileForm?.addEventListener('input', syncProfileSaveBar);
                profileForm?.addEventListener('change', syncProfileSaveBar);
                profileDirtyTrackingBound = true;
            }

            const passwordForm = document.getElementById('form-change-password');
            const googlePasswordNotice = document.getElementById('google-password-notice');
            passwordForm?.classList.toggle('hidden', isGoogle);
            googlePasswordNotice?.classList.toggle('hidden', !isGoogle);

            // Render Timeline
            renderTimeline(history);
            renderOrders(window.authManager.getOrders?.() || []);

            // URL Tab query check
            const urlParams = new URLSearchParams(window.location.search);
            const tabParam = urlParams.get('tab');
            if (tabParam && ['profile', 'history', 'orders', 'settings'].includes(tabParam)) {
                window.switchProfileTab(tabParam);
            }

            const placedOrder = urlParams.get('placed');
            if (placedOrder) {
                document.getElementById('profile-orders-container')?.insertAdjacentHTML('afterbegin', `<div class="order-success-banner" role="status"><i data-feather="check-circle"></i><div><strong>Đặt hàng thành công</strong><p>Mã đơn #${window.authManager.escapeHtml(placedOrder)} đã được tiếp nhận. SkinID sẽ sớm xác nhận với bạn.</p></div></div>`);
                window.history.replaceState({}, '', '/profile?tab=orders');
            }

            if (window.feather) feather.replace();
        }

        function renderOrders(orders) {
            const container = document.getElementById('profile-orders-container');
            if (!container) return;
            if (!orders.length) {
                container.innerHTML = '<div class="text-center py-10 text-gray-400"><p class="font-bold text-gray-700">Bạn chưa có đơn hàng</p><a href="/#catalog" class="inline-block mt-3 text-brand-primary font-bold text-xs">Bắt đầu mua sắm</a></div>';
                return;
            }
            const labels = { pending: 'Chờ xác nhận', confirmed: 'Đã xác nhận', shipping: 'Đang giao', completed: 'Hoàn tất', cancelled: 'Đã hủy' };
            container.innerHTML = orders.map(order => {
                const canCancel = ['pending', 'confirmed'].includes(order.status);
                const date = order.createdAt?.toDate ? order.createdAt.toDate().toLocaleString('vi-VN') : 'Vừa tạo';
                const address = window.authManager.escapeHtml(order.customer?.address || 'Chưa có địa chỉ');
                return `<article class="rounded-2xl border border-gray-200 p-4"><div class="flex flex-wrap items-center justify-between gap-2"><div><strong class="text-sm">#${order.id.slice(0, 8).toUpperCase()}</strong><p class="text-xs text-gray-400">${date}</p></div><span class="text-xs font-bold px-3 py-1 rounded-full bg-brand-blush text-brand-primary">${labels[order.status] || order.status}</span></div><p class="mt-3 text-xs text-gray-500 flex gap-2"><i data-feather="map-pin" class="w-4 h-4 flex-none text-brand-primary"></i><span>${address}</span></p><div class="mt-3 space-y-1">${(order.items || []).map(item => `<div class="flex justify-between gap-4 text-xs"><span>${item.quantity} × ${window.authManager.escapeHtml(item.name)}</span><b>${formatPrice(item.lineTotal)}</b></div>`).join('')}</div><div class="mt-4 pt-3 border-t flex items-center justify-between"><span class="text-xs text-gray-500">${order.paymentMethod === 'cod' ? 'COD' : 'Chuyển khoản'} · ${order.paymentStatus === 'paid' ? 'Đã thanh toán' : 'Chưa thanh toán'}</span><div class="flex items-center gap-3"><strong>${formatPrice(order.total)}</strong>${canCancel ? `<button onclick="window.cancelProfileOrder('${order.id}')" class="text-xs font-bold text-rose-600">Hủy đơn</button>` : ''}</div></div></article>`;
            }).join('');
        }

        window.cancelProfileOrder = async function cancelProfileOrder(orderId) {
            if (!confirm('Bạn muốn hủy đơn hàng này?')) return;
            const result = await window.authManager.cancelOrder(orderId);
            if (!result.success) return alert(result.message);
            renderOrders(window.authManager.getOrders());
        };

        // Render Scan Timeline
        function renderTimeline(history) {
            const container = document.getElementById('timeline-scan-container');
            if (!container) return;

            if (history.length === 0) {
                container.innerHTML = `
                    <div class="text-center py-7 text-gray-400">
                        <div class="profile-empty-illustration mx-auto" aria-hidden="true"><span class="profile-empty-illustration__face"></span><span class="profile-empty-illustration__spark profile-empty-illustration__spark--one">✦</span><span class="profile-empty-illustration__spark profile-empty-illustration__spark--two">✦</span></div>
                        <p class="font-bold text-sm text-gray-700">Chưa có dữ liệu phiên soi da nào</p>
                        <p class="text-xs text-gray-400 mt-1 mb-4">Hãy thực hiện soi da AI 3 góc để nhận phác đồ chăm sóc cá nhân hóa đầu tiên!</p>
                        <a href="/skin-analysis" class="profile-btn profile-btn--primary">
                            <i data-feather="camera" class="w-4 h-4"></i> Bắt đầu Soi Da AI Ngay
                        </a>
                    </div>
                `;
                return;
            }

            let html = '';
            history.forEach((scan, idx) => {
                let scoreClass = 'profile-score--high';
                if (scan.healthScore < 60) scoreClass = 'profile-score--low';
                else if (scan.healthScore < 75) scoreClass = 'profile-score--mid';

                html += `
                    <div class="p-5 rounded-2xl border border-gray-200 hover:border-brand-primary transition-all bg-white shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div class="flex items-center gap-4">
                            <div class="profile-score ${scoreClass} w-14 h-14 rounded-2xl flex flex-col items-center justify-center font-black flex-shrink-0">
                                <span class="text-lg leading-none">${scan.healthScore}</span>
                                <span class="text-[9px] font-medium opacity-80">ĐIỂM</span>
                            </div>
                            <div>
                                <div class="flex items-center gap-2 mb-1">
                                    <h4 class="font-bold text-gray-900 text-sm sm:text-base">Phiên Soi Da #${history.length - idx}</h4>
                                    <span class="text-xs font-bold text-brand-primary bg-brand-blush px-2.5 py-0.5 rounded-full">${scan.skinType}</span>
                                </div>
                                <p class="text-xs text-gray-400 flex items-center gap-1.5">
                                    <i data-feather="calendar" class="w-3.5 h-3.5"></i> ${scan.dateFormatted} • Tuổi da AI: <strong>${scan.skinAge} tuổi</strong>
                                </p>
                            </div>
                        </div>

                        <div class="flex items-center gap-2 w-full md:w-auto">
                            <a href="/skin-analysis" class="flex-1 md:flex-initial px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 text-xs font-bold text-center transition-colors">
                                Soi Lại
                            </a>
                            <a href="https://zalo.me/" target="_blank" class="flex-1 md:flex-initial px-4 py-2.5 bg-[#0068FF] text-white rounded-xl text-xs font-bold text-center hover:bg-blue-600 transition-colors flex items-center justify-center gap-1.5 shadow-sm">
                                Gửi Dược Sĩ
                            </a>
                        </div>
                    </div>
                `;
            });

            container.innerHTML = html;
        }

        // Render Progress Chart
        function renderProgressChart() {
            const ctx = document.getElementById('progressChart');
            if (!ctx) return;

            const history = window.authManager.getScanHistory().slice().reverse(); // oldest to newest
            const emptyState = document.getElementById('progress-chart-empty');
            ctx.classList.toggle('hidden', history.length === 0);
            emptyState?.classList.toggle('hidden', history.length > 0);
            if (history.length === 0) {
                if (progressChartInstance) { progressChartInstance.destroy(); progressChartInstance = null; }
                return;
            }

            const labels = history.map((h, i) => `Lần #${i + 1} (${h.dateFormatted.split(' ')[0]})`);
            const scores = history.map(h => h.healthScore);
            const ages = history.map(h => h.skinAge);

            if (progressChartInstance) {
                progressChartInstance.destroy();
            }

            progressChartInstance = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [
                        {
                            label: 'Điểm Sức Khỏe Da (0-100)',
                            data: scores,
                            borderColor: '#E87A90',
                            backgroundColor: 'rgba(232, 122, 144, 0.15)',
                            borderWidth: 3,
                            fill: true,
                            tension: 0.4,
                            pointRadius: 6,
                            pointBackgroundColor: '#E87A90'
                        },
                        {
                            label: 'Tuổi Da AI (Tuổi)',
                            data: ages,
                            borderColor: '#4A2E35',
                            backgroundColor: 'transparent',
                            borderWidth: 2,
                            borderDash: [5, 5],
                            tension: 0.3,
                            pointRadius: 4,
                            pointBackgroundColor: '#4A2E35'
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'top',
                            labels: { font: { family: 'Plus Jakarta Sans', weight: 'bold', size: 11 } }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: false,
                            grid: { color: '#F3F4F6' }
                        },
                        x: {
                            grid: { display: false }
                        }
                    }
                }
            });
        }

        window.handleProfileAvatarUpload = async function handleProfileAvatarUpload(event) {
            const file = event.target.files?.[0];
            event.target.value = '';
            if (!file) return;
            if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 8 * 1024 * 1024) {
                alert('Vui lòng chọn ảnh JPG, PNG hoặc WebP nhỏ hơn 8MB.');
                return;
            }
            const objectUrl = URL.createObjectURL(file);
            try {
                const image = new Image();
                image.src = objectUrl;
                await image.decode();
                const size = Math.min(image.naturalWidth, image.naturalHeight);
                const canvas = document.createElement('canvas');
                canvas.width = 256; canvas.height = 256;
                const context = canvas.getContext('2d');
                context.drawImage(image, (image.naturalWidth - size) / 2, (image.naturalHeight - size) / 2, size, size, 0, 0, 256, 256);
                const picture = canvas.toDataURL('image/jpeg', 0.82);
                const result = await window.authManager.updateProfilePicture(picture);
                if (!result.success) return alert(result.message);
                renderProfileAvatar(window.authManager.getCurrentUser());
            } catch (error) {
                alert('Không thể xử lý ảnh đại diện. Vui lòng thử một ảnh khác.');
            } finally {
                URL.revokeObjectURL(objectUrl);
            }
        };

        // Handle Profile Save
        async function handleSaveProfile(e) {
            e.preventDefault();
            const shippingAddress = window.VietnamAddress?.readForm?.({
                provinceId: 'prof-province', wardId: 'prof-ward', line1Id: 'prof-address'
            });
            if ((shippingAddress?.line1 || shippingAddress?.provinceCode || shippingAddress?.wardCode)
                && (!shippingAddress?.line1 || !shippingAddress?.provinceCode || !shippingAddress?.wardCode)) {
                alert('Vui lòng nhập đầy đủ tỉnh/thành, phường/xã và địa chỉ chi tiết.');
                return;
            }
            const updated = {
                name: document.getElementById('prof-name').value.trim(),
                phone: document.getElementById('prof-phone').value.trim(),
                birthday: document.getElementById('prof-birthday').value,
                gender: document.getElementById('prof-gender').value,
                address: shippingAddress?.fullAddress || '',
                shippingAddress,
                skinTypeBaseline: document.getElementById('prof-skintype').value,
                mainConcern: document.getElementById('prof-main-concern').value
            };

            const res = await window.authManager.updateUserProfile(updated);
            if (res.success) {
                alert("✅ Hồ sơ cá nhân đã được lưu thành công!");
                window.renderProfileDashboard();
            } else {
                alert(res.message);
            }
        }

        // Handle Password Change
        async function handleChangePassword(e) {
            e.preventDefault();
            const curr = document.getElementById('pass-current').value;
            const newP = document.getElementById('pass-new').value;
            const conf = document.getElementById('pass-confirm').value;

            if (newP !== conf) {
                alert("Mật khẩu mới và xác nhận mật khẩu không trùng khớp!");
                return;
            }

            const res = await window.authManager.changePassword(curr, newP);
            if (res.success) {
                alert("✅ Mật khẩu đã được thay đổi thành công!");
                document.getElementById('form-change-password').reset();
            } else {
                alert(res.message);
            }
        }

        window.SKINID_AUTH_READY.then(() => window.renderProfileDashboard());
