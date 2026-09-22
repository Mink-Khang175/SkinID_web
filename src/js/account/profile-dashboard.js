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

const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(price) || 0);
};
if (typeof window.formatPrice === 'undefined') {
    window.formatPrice = formatPrice;
}

let modalRadarChartInstance = null;

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

    if (tabId === 'orders') {
        const container = document.getElementById('profile-orders-container');
        const cached = window.authManager?.getOrders?.() || [];
        if (cached.length > 0) {
            renderOrders(cached);
        } else if (container && !container.children.length) {
            container.innerHTML = '<div class="text-center py-10 text-gray-400"><div class="w-7 h-7 border-2 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div><p class="text-xs">Đang tải danh sách đơn hàng...</p></div>';
        }
        window.authManager?.loadOrders?.()
            .then(orders => renderOrders(orders || []))
            .catch(() => renderOrders(window.authManager?.getOrders?.() || []));
    }

    if (window.feather) feather.replace();
};

window.handleProfileLogout = async function handleProfileLogout() {
    try {
        if (window.authManager) {
            await window.authManager.logout();
        }
    } catch (err) {
        console.error('[SkinID] Lỗi đăng xuất:', err);
    }
    window.location.href = '/';
};

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
            const nameEl = document.getElementById('banner-user-name');
            const emailEl = document.getElementById('banner-user-email');
            const badgeEl = document.getElementById('banner-provider-badge');
            if (nameEl) nameEl.innerText = user.name || 'Thành viên SkinID';
            if (emailEl) emailEl.innerText = user.email || '';

            renderProfileAvatar(user);

            const isGoogle = user.provider === 'google';
            if (badgeEl) {
                badgeEl.classList.remove('hidden');
                badgeEl.innerHTML = isGoogle
                    ? `<i data-feather="check-circle" class="w-3 h-3"></i> Tài khoản Google`
                    : `<i data-feather="user-check" class="w-3 h-3"></i> Thành viên SkinID`;
            }

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

        const CORE_METRIC_CLINICAL_ADVICE = {
            moisture: {
                name: 'Độ ẩm bề mặt',
                icon: 'droplet',
                why: 'Hàng rào màng ẩm lipid (NMF) ở lớp sừng biểu bì bị tổn thương khiến lượng nước bốc hơi nhanh (hiện tượng TEWL), làm bề mặt da thô ráp và giảm độ căng mọng sinh lý.',
                shouldDo: 'Cấp ẩm đa tầng với Serum Hyaluronic Acid đa trọng lượng phân tử, Vitamin B5 (Panthenol) và khóa ẩm hàng ngày bằng kem dưỡng giàu Ceramide NP.',
                avoid: 'Rửa mặt bằng nước nóng trên 38°C; dùng sữa rửa mặt tạo bọt chứa sulfate mạnh làm mất lớp màng acid mantle bảo vệ tự nhiên của da.'
            },
            sebum: {
                name: 'Kiểm soát bã nhờn',
                icon: 'wind',
                why: 'Tuyến bã nhờn nang lông tăng tiết bã nhờn quá mức do phản xạ bù ẩm khi bề mặt thiếu nước, hoặc do ảnh hưởng của nồng độ Androgen và nhiệt độ môi trường.',
                shouldDo: 'Kiểm soát dầu với Niacinamide 2–5%, làm sạch tế bào chết cổ nang lông bằng BHA (Salicylic Acid 1–2%) và dùng dưỡng ẩm dạng gel không chứa dầu (Oil-free).',
                avoid: 'Dùng giấy thấm dầu liên tục gây kích thích tuyến bã tiết dầu dội ngược; tránh các loại kem dưỡng chứa dầu khoáng nặng (Mineral Oil) dễ gây bít tắc.'
            },
            pores: {
                name: 'Kích thước lỗ chân lông',
                icon: 'maximize',
                why: 'Bã nhờn ứ đọng kết hợp tế bào chết sừng hóa làm giãn nở cơ học miệng nang lông; sợi collagen nâng đỡ quanh thành nang lông bắt đầu suy giảm theo thời gian.',
                shouldDo: 'Áp dụng phương pháp làm sạch kép (Double Cleansing) mỗi tối; tẩy tế bào chết hóa học BHA định kỳ và bổ sung Peptide củng cố độ săn chắc thành lỗ chân lông.',
                avoid: 'Dùng tay tự ý cạy nặn mụn hoặc dùng gel lột mụn cơ học làm tổn thương cơ thắt chân lông, khiến lỗ chân lông phình to vĩnh viễn.'
            },
            pigmentation: {
                name: 'Sắc tố & Sạm nám',
                icon: 'sun',
                why: 'Tế bào Melanocyte ở đáy biểu bì tăng sinh hắc tố Melanin phản ứng lại bức xạ tia cực tím UVA/UVB hoặc tình trạng tăng sắc tố sau viêm (PIH).',
                shouldDo: 'Thoa kem chống nắng phổ rộng SPF 50+ PA++++ mỗi sáng; phối hợp hoạt chất dưỡng sáng ức chế men Tyrosinase như Vitamin C, Tranexamic Acid, Alpha Arbutin.',
                avoid: 'Ra ngoài trời mà không che chắn; sử dụng kem trộn hoặc các sản phẩm lột tẩy trắng cấp tốc làm tổn thương màng đáy và sạm nám dội ngược.'
            },
            elasticity: {
                name: 'Độ đàn hồi & Săn chắc',
                icon: 'activity',
                why: 'Mạng lưới sợi Collagen và Elastin tầng trung bì bị đứt gãy do stress oxy hóa, tác hại của gốc tự do và quá trình suy giảm tự nhiên theo độ tuổi.',
                shouldDo: 'Đưa dẫn xuất Vitamin A (Retinoids / Retinol / Bakuchiol) vào chu trình buổi tối; kết hợp Peptide Matrixyl để kích thích nguyên bào sợi tăng sinh tế bào mới.',
                avoid: 'Thức khuya sau 23h làm gián đoạn chu kỳ tự phục hồi ban đêm; ăn nhiều đường/tinh bột tinh luyện kích hoạt phản ứng đường hóa collagen (Glycation).'
            }
        };

        window.openScanDetailModal = function openScanDetailModal(scanIdentifier) {
            const history = window.authManager?.getScanHistory?.() || [];
            const scanIndex = typeof scanIdentifier === 'number' 
                ? scanIdentifier 
                : history.findIndex(s => String(s.id) === String(scanIdentifier));
            const scan = history[scanIndex >= 0 ? scanIndex : 0];
            if (!scan) return;

            const modal = document.getElementById('scan-detail-modal');
            if (!modal) return;

            const scanNumber = history.length - (scanIndex >= 0 ? scanIndex : 0);
            const titleEl = document.getElementById('modal-scan-title');
            const dateEl = document.getElementById('modal-scan-date');
            if (titleEl) titleEl.textContent = `Phiên Soi Da #${scanNumber}`;
            if (dateEl) dateEl.textContent = `Thời gian: ${scan.dateFormatted || 'Vừa xong'}`;

            // Health score & Ring
            const healthScore = Math.min(100, Math.max(10, parseInt(scan.healthScore) || 70));
            const scoreEl = document.getElementById('modal-health-score');
            const ringEl = document.getElementById('modal-score-ring');
            const glowEl = document.getElementById('modal-score-glow');

            let ringColor = '#10b981', glowColor = 'rgba(16,185,129,0.3)';
            if (healthScore < 60) { ringColor = '#ef4444'; glowColor = 'rgba(239,68,68,0.3)'; }
            else if (healthScore < 75) { ringColor = '#f59e0b'; glowColor = 'rgba(245,158,11,0.3)'; }

            if (scoreEl) scoreEl.textContent = healthScore;
            if (ringEl) {
                ringEl.style.stroke = ringColor;
                ringEl.style.strokeDasharray = `${healthScore}, 100`;
            }
            if (glowEl) glowEl.style.boxShadow = `0 0 25px ${glowColor}`;

            // Skin type & age
            const typeEl = document.getElementById('modal-skin-type');
            const ageEl = document.getElementById('modal-skin-age');
            if (typeEl) typeEl.textContent = scan.skinType || 'Da chưa xác định';
            if (ageEl) ageEl.textContent = `Tuổi da AI: ${scan.skinAge || 25} tuổi`;

            // Grade badge
            const grade = (scan.overallGrade || (healthScore >= 75 ? 'A' : healthScore >= 60 ? 'B' : 'C')).toUpperCase();
            const gradeLetter = document.getElementById('modal-grade-letter');
            const gradeComment = document.getElementById('modal-grade-comment');
            if (gradeLetter) gradeLetter.textContent = grade;
            if (gradeComment) gradeComment.textContent = scan.overallGradeComment || (grade === 'A' ? 'Làn da khỏe mạnh, cấu trúc ổn định' : grade === 'B' ? 'Làn da ở mức ổn định, cần duy trì chu trình' : 'Cần phác đồ phục hồi hàng rào bảo vệ');

            // Assessment
            const fullAnalysis = scan.fullAnalysis || {};
            const assessmentEl = document.getElementById('modal-assessment-text');
            if (assessmentEl) {
                assessmentEl.textContent = scan.analysis3Angles || fullAnalysis.analysis3Angles || `Phân tích AI 3 góc độ cho thấy làn da ${scan.skinType?.toLowerCase() || ''} với chỉ số sức khỏe ${healthScore}/100. Các vùng da cần chú ý bao gồm độ ẩm bề mặt và kiểm soát bã nhờn.`;
            }

            // Metrics reconstruction
            const m = scan.metrics || {};
            const moistureH = parseInt(m.moisture || fullAnalysis.moisture) || 60;
            const sebumH = Math.max(10, 100 - (parseInt(m.sebum || fullAnalysis.sebum) || 60));
            const poresH = Math.max(10, 100 - (parseInt(m.pores || fullAnalysis.pores) || 60));
            const pigmentH = Math.max(10, 100 - (parseInt(m.pigmentation || fullAnalysis.pigmentation) || 50));
            const elasticityH = parseInt(m.elasticity || fullAnalysis.elasticity) || 65;
            const melasmaH = parseInt(m.melasma || fullAnalysis.melasma) || Math.max(15, pigmentH - 10);
            const eyeWrinklesH = parseInt(m.eyeWrinkles || fullAnalysis.eyeWrinkles) || Math.round(elasticityH * 0.95);
            const nasolabialFoldsH = parseInt(m.nasolabialFolds || fullAnalysis.nasolabialFolds) || Math.round(elasticityH * 0.9);
            const rednessH = parseInt(m.redness || fullAnalysis.redness) || Math.round(moistureH * 0.7 + 25);
            const acneBacteriaH = parseInt(m.acneBacteria || fullAnalysis.acneBacteria) || Math.round(sebumH * 0.8 + 15);
            const textureH = parseInt(m.texture || fullAnalysis.texture) || Math.round((moistureH + poresH) / 2);
            const darkCirclesH = parseInt(m.darkCircles || fullAnalysis.darkCircles) || Math.round((healthScore + pigmentH) / 2);

            // 1. SHOW MODAL FIRST so Canvas dimensions can be accurately measured
            modal.classList.remove('hidden');
            requestAnimationFrame(() => modal.classList.remove('opacity-0'));

            // 2. Draw Radar Chart with guaranteed canvas dimensions
            setTimeout(() => {
                const canvasRadar = document.getElementById('profileRadarChart');
                if (canvasRadar && typeof Chart !== 'undefined') {
                    if (modalRadarChartInstance) {
                        modalRadarChartInstance.destroy();
                        modalRadarChartInstance = null;
                    }
                    modalRadarChartInstance = new Chart(canvasRadar, {
                        type: 'radar',
                        data: {
                            labels: [
                                'Độ ẩm', 'Dầu thừa', 'Lỗ chân lông', 'Sắc tố UV', 
                                'Sạm nám', 'Đàn hồi', 'Nhăn mắt', 'Rãnh cười', 
                                'Đỏ da', 'Khuẩn mụn', 'Kết cấu', 'Quầng thâm'
                            ],
                            datasets: [{
                                label: 'Cấu trúc da',
                                data: [
                                    moistureH, sebumH, poresH, pigmentH, 
                                    melasmaH, elasticityH, eyeWrinklesH, nasolabialFoldsH, 
                                    rednessH, acneBacteriaH, textureH, darkCirclesH
                                ],
                                backgroundColor: 'rgba(232, 122, 144, 0.25)',
                                borderColor: 'rgba(232, 122, 144, 1)',
                                pointBackgroundColor: 'rgba(232, 122, 144, 1)',
                                pointBorderColor: '#fff',
                                borderWidth: 2
                            }]
                        },
                        options: {
                            responsive: true,
                            maintainAspectRatio: false,
                            scales: {
                                r: {
                                    angleLines: { color: 'rgba(0,0,0,0.06)' },
                                    grid: { color: 'rgba(0,0,0,0.06)' },
                                    pointLabels: { font: { size: 9, family: "'Plus Jakarta Sans', sans-serif", weight: 'bold' }, color: '#4b5563' },
                                    suggestedMin: 0,
                                    suggestedMax: 100,
                                    ticks: { display: false }
                                }
                            },
                            plugins: { legend: { display: false } }
                        }
                    });
                    modalRadarChartInstance.resize();
                    modalRadarChartInstance.update();
                }
            }, 50);

            // 3. Radar Insights (Cảnh báo vùng co thắt)
            const insightsContainer = document.getElementById('modal-radar-insights');
            if (insightsContainer) {
                const metricRanks = [
                    { name: 'Độ ẩm biểu bì', score: moistureH },
                    { name: 'Tuyến bã nhờn', score: sebumH },
                    { name: 'Lỗ chân lông', score: poresH },
                    { name: 'Sắc tố tia UV', score: pigmentH },
                    { name: 'Độ đàn hồi', score: elasticityH },
                    { name: 'Đỏ da nhạy cảm', score: rednessH },
                    { name: 'Khuẩn mụn nang lông', score: acneBacteriaH }
                ].sort((a, b) => a.score - b.score);
                const w1 = metricRanks[0];
                const w2 = metricRanks[1];
                insightsContainer.innerHTML = `
                    <div class="flex items-center gap-2 p-2.5 bg-rose-50 rounded-xl border border-rose-100 text-xs">
                        <span class="w-2 h-2 rounded-full bg-rose-500 flex-shrink-0"></span>
                        <span class="text-rose-700 font-medium"><strong>${w1.name}</strong> (${w1.score}/100) đang bị co thắt cần can thiệp phục hồi.</span>
                    </div>
                    <div class="flex items-center gap-2 p-2.5 bg-amber-50 rounded-xl border border-amber-100 text-xs">
                        <span class="w-2 h-2 rounded-full bg-amber-500 flex-shrink-0"></span>
                        <span class="text-amber-700 font-medium"><strong>${w2.name}</strong> (${w2.score}/100) có dấu hiệu mất cân bằng màng lipid.</span>
                    </div>
                `;
            }

            // 4. Chi Tiết 12 Chỉ Số Cấu Trúc Grid
            const detailedGridEl = document.getElementById('modal-detailed-metrics-grid');
            if (detailedGridEl) {
                const all12 = [
                    { name: 'Độ ẩm (Hydration)', score: moistureH },
                    { name: 'Dầu thừa (Sebum Control)', score: sebumH },
                    { name: 'Lỗ chân lông (Pore Health)', score: poresH },
                    { name: 'Sắc tố UV (Melanin Shield)', score: pigmentH },
                    { name: 'Sạm nám (Melasma Risk)', score: melasmaH },
                    { name: 'Độ đàn hồi (Firmness)', score: elasticityH },
                    { name: 'Nhăn đuôi mắt (Eye Contour)', score: eyeWrinklesH },
                    { name: 'Rãnh cười (Nasolabial Folds)', score: nasolabialFoldsH },
                    { name: 'Đỏ da (Sensitivity/Redness)', score: rednessH },
                    { name: 'Khuẩn mụn (Acne Barrier)', score: acneBacteriaH },
                    { name: 'Kết cấu da (Skin Smoothness)', score: textureH },
                    { name: 'Quầng thâm (Dark Circles)', score: darkCirclesH }
                ];
                detailedGridEl.innerHTML = all12.map(item => {
                    let barColor = 'bg-rose-500', numColor = 'text-rose-600';
                    if (item.score >= 75) { barColor = 'bg-emerald-500'; numColor = 'text-emerald-600'; }
                    else if (item.score >= 50) { barColor = 'bg-amber-400'; numColor = 'text-amber-600'; }
                    return `
                        <div class="space-y-1">
                            <div class="flex justify-between items-center text-xs">
                                <span class="font-medium text-gray-700">${item.name}</span>
                                <span class="font-bold ${numColor}">${item.score}/100</span>
                            </div>
                            <div class="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                                <div class="${barColor} h-1.5 rounded-full transition-all duration-700" style="width: ${item.score}%"></div>
                            </div>
                        </div>
                    `;
                }).join('');
            }

            // Radar tags
            const tagsContainer = document.getElementById('modal-radar-tags');
            if (tagsContainer) {
                const concerns = Array.isArray(scan.primaryConcerns) && scan.primaryConcerns.length > 0 
                    ? scan.primaryConcerns 
                    : ['Niacinamide', 'Hyaluronic Acid', 'Ceramide'];
                tagsContainer.innerHTML = concerns.map(c => `<span class="bg-brand-blush text-brand-primary text-[11px] font-bold px-2.5 py-1 rounded-full border border-brand-petal">${window.authManager.escapeHtml(c)}</span>`).join('');
            }

            // 5 Core Metrics Accordion (Unique Medical Dermatological Clinical Advice)
            const metricsContainer = document.getElementById('modal-metrics-container');
            if (metricsContainer) {
                const metricDefs = [
                    { id: 'moisture', score: parseInt(m.moisture || fullAnalysis.moisture) || 60, isInverse: false },
                    { id: 'sebum', score: parseInt(m.sebum || fullAnalysis.sebum) || 65, isInverse: true },
                    { id: 'pores', score: parseInt(m.pores || fullAnalysis.pores) || 60, isInverse: true },
                    { id: 'pigmentation', score: parseInt(m.pigmentation || fullAnalysis.pigmentation) || 50, isInverse: true },
                    { id: 'elasticity', score: parseInt(m.elasticity || fullAnalysis.elasticity) || 65, isInverse: false }
                ];
                const rawAdvice = fullAnalysis.detailedAdvice || {};
                metricsContainer.innerHTML = metricDefs.map(md => {
                    const advicePreset = CORE_METRIC_CLINICAL_ADVICE[md.id] || CORE_METRIC_CLINICAL_ADVICE.moisture;
                    const goodScore = md.isInverse ? (100 - md.score) : md.score;
                    let level = "Cần cải thiện", statusClass = "status-danger", textClass = "text-rose-600", bgClass = "bg-rose-50", progressClass = "bg-rose-500";
                    if (goodScore >= 75) { 
                        level = "Tốt"; statusClass = "status-good"; textClass = "text-emerald-600"; bgClass = "bg-emerald-50"; progressClass = "bg-emerald-500"; 
                    } else if (goodScore >= 60) { 
                        level = "Khá"; statusClass = "status-good"; textClass = "text-emerald-600"; bgClass = "bg-emerald-50"; progressClass = "bg-emerald-500"; 
                    } else if (goodScore >= 40) { 
                        level = "Cần chú ý"; statusClass = "status-warning"; textClass = "text-amber-600"; bgClass = "bg-amber-50"; progressClass = "bg-amber-500"; 
                    }

                    const why = rawAdvice[md.id]?.why || advicePreset.why;
                    const shouldDo = rawAdvice[md.id]?.shouldDo || advicePreset.shouldDo;
                    const avoid = rawAdvice[md.id]?.avoid || advicePreset.avoid;

                    return `
                        <div class="border border-gray-100 rounded-2xl overflow-hidden bg-gray-50/50">
                            <div class="p-3.5 flex items-center justify-between cursor-pointer hover:bg-gray-100/60 transition-colors" onclick="this.nextElementSibling.classList.toggle('hidden');">
                                <div class="flex items-center gap-3">
                                    <div class="p-2 rounded-xl ${bgClass} ${textClass}">
                                        <i data-feather="${advicePreset.icon}" class="w-4 h-4"></i>
                                    </div>
                                    <div>
                                        <p class="font-bold text-gray-800 text-xs sm:text-sm">${advicePreset.name}</p>
                                        <p class="${statusClass} text-[11px] font-semibold">${md.score}% - ${level}</p>
                                    </div>
                                </div>
                                <div class="w-1/3 max-w-[140px] px-2 hidden sm:block">
                                    <div class="w-full bg-gray-200 rounded-full h-2">
                                        <div class="${progressClass} h-2 rounded-full" style="width: ${md.score}%"></div>
                                    </div>
                                </div>
                                <i data-feather="chevron-down" class="w-4 h-4 text-gray-400"></i>
                            </div>
                            <div class="hidden border-t border-gray-100 bg-white p-3.5 text-xs space-y-2">
                                <div class="flex gap-2"><strong class="text-gray-700 min-w-[70px]">Vì sao?</strong><span class="text-gray-600 leading-relaxed">${why}</span></div>
                                <div class="flex gap-2"><strong class="text-gray-700 min-w-[70px]">Nên làm:</strong><span class="text-gray-600 leading-relaxed">${shouldDo}</span></div>
                                <div class="flex gap-2"><strong class="text-gray-700 min-w-[70px]">Cần tránh:</strong><span class="text-gray-600 leading-relaxed">${avoid}</span></div>
                            </div>
                        </div>
                    `;
                }).join('');
            }

            // Routine products & Empty State
            const productsContainer = document.getElementById('modal-routine-products');
            if (productsContainer) {
                const routineProducts = (Array.isArray(scan.recommendedRoutineProducts) && scan.recommendedRoutineProducts.length > 0)
                    ? scan.recommendedRoutineProducts
                    : [];
                
                if (routineProducts.length === 0) {
                    productsContainer.innerHTML = `
                        <div class="bg-gradient-to-br from-rose-50/50 via-white to-rose-50/20 border border-rose-100/80 rounded-2xl p-5 text-center space-y-3">
                            <div class="w-11 h-11 mx-auto rounded-2xl bg-rose-50 border border-rose-200/80 flex items-center justify-center text-brand-primary shadow-sm">
                                <i data-feather="clipboard" class="w-5 h-5"></i>
                            </div>
                            <h5 class="text-xs sm:text-sm font-bold text-gray-800">Chưa có phác đồ được gán cho phiên này</h5>
                            <p class="text-xs text-gray-500 max-w-md mx-auto leading-relaxed">
                                Dữ liệu lâm sàng của phiên đã lưu lại. Bấm <strong>"Gửi Dược Sĩ"</strong> để Dược sĩ chuyên khoa SkinID lên phác đồ phục hồi cá nhân hóa miễn phí cho bạn.
                            </p>
                            <div class="flex flex-wrap items-center justify-center gap-2.5 pt-1">
                                <a href="https://zalo.me/" target="_blank" class="btn-gui-duoc-si px-4 py-2 text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm">
                                    <i data-feather="message-circle" class="w-3.5 h-3.5"></i> Gửi Dược Sĩ Tư Vấn
                                </a>
                                <a href="/#catalog" class="px-4 py-2 bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 rounded-xl text-xs font-semibold transition-all">
                                    Khám Phá Sản Phẩm
                                </a>
                            </div>
                        </div>
                    `;
                } else {
                    const productsListHtml = routineProducts.slice(0, 3).map(p => {
                        const imgSrc = (p.image?.startsWith('http') || p.image?.startsWith('data:')) ? p.image : (window.SKINID_ASSET_URL ? window.SKINID_ASSET_URL(p.image) : p.image);
                        return `
                            <div class="flex items-center gap-3 p-3 rounded-2xl border border-gray-100 bg-gray-50/50 hover:bg-white hover:shadow-sm transition-all">
                                <img src="${imgSrc || '/images/products/placeholder.jpg'}" alt="${window.authManager.escapeHtml(p.name)}" class="w-12 h-12 rounded-xl object-contain bg-white p-1 flex-shrink-0 border border-gray-100" />
                                <div class="flex-1 min-w-0">
                                    <p class="text-[10px] font-bold text-brand-primary uppercase truncate">${window.authManager.escapeHtml(p.brand || 'DƯỢC MỸ PHẨM')}</p>
                                    <h5 class="text-xs font-bold text-gray-900 truncate">${window.authManager.escapeHtml(p.name)}</h5>
                                    <p class="text-xs font-black text-brand-dark mt-0.5">${formatPrice(p.price || 0)}</p>
                                </div>
                                <button onclick="if(window.cartManager) { cartManager.addItem('${p.id}', 1); cartManager.openCart(); }" class="px-2.5 py-1.5 bg-[#1E1B1D] text-white text-[11px] font-bold rounded-lg hover:bg-black transition-all flex items-center gap-1 flex-shrink-0 cursor-pointer">
                                    <i data-feather="plus" class="w-3 h-3"></i> Mua
                                </button>
                            </div>
                        `;
                    }).join('');

                    productsContainer.innerHTML = `
                        <div class="space-y-3">
                            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                                ${productsListHtml}
                            </div>
                            <div class="pt-3 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                                <p class="text-xs text-gray-500 flex items-center gap-1.5">
                                    <i data-feather="shield" class="w-3.5 h-3.5 text-teal-600"></i>
                                    Phác đồ chuẩn y khoa phân định nhịp Sáng & Tối.
                                </p>
                                <a href="/skin-analysis" class="btn-xem-phac-do px-5 py-2.5 rounded-xl font-bold text-xs text-white transition-all flex items-center gap-2 shadow-md w-full sm:w-auto justify-center">
                                    <span>Xem Phác Đồ & Bộ Sản Phẩm Chi Tiết</span>
                                    <i data-feather="arrow-right" class="w-3.5 h-3.5"></i>
                                </a>
                            </div>
                        </div>
                    `;
                }
            }

            if (window.feather) feather.replace();
        };

        window.closeScanDetailModal = function closeScanDetailModal() {
            const modal = document.getElementById('scan-detail-modal');
            if (!modal) return;
            modal.classList.add('opacity-0');
            setTimeout(() => {
                modal.classList.add('hidden');
                if (modalRadarChartInstance) {
                    modalRadarChartInstance.destroy();
                    modalRadarChartInstance = null;
                }
            }, 300);
        };

        window.reorderProfileOrder = function reorderProfileOrder(orderId) {
            const orders = window.authManager?.getOrders?.() || [];
            const order = orders.find(o => o.id === orderId);
            if (!order || !order.items || !order.items.length) return;
            if (window.cartManager) {
                for (const item of order.items) {
                    window.cartManager.addItem(item.productId, item.quantity);
                }
                window.cartManager.openCart();
                if (typeof showToast === 'function') showToast('Đã thêm sản phẩm từ đơn hàng vào giỏ!');
            }
        };

        function renderOrders(orders) {
            const container = document.getElementById('profile-orders-container');
            if (!container) return;
            try {
                if (!orders || !orders.length) {
                    container.innerHTML = `
                        <div class="text-center py-12 px-4 rounded-3xl bg-gray-50/50 border border-gray-100">
                            <div class="w-16 h-16 mx-auto mb-4 rounded-3xl bg-brand-blush/60 text-brand-primary flex items-center justify-center shadow-sm">
                                <i data-feather="shopping-bag" class="w-8 h-8"></i>
                            </div>
                            <h4 class="font-black text-gray-800 text-base mb-1">Chưa Có Đơn Hàng Nào</h4>
                            <p class="text-xs text-gray-400 max-w-sm mx-auto mb-6">Bạn chưa thực hiện đơn đặt hàng nào tại SkinID. Khám phá các sản phẩm dược mỹ phẩm chuẩn y khoa ngay!</p>
                            <a href="/#catalog" class="inline-flex items-center gap-2 px-6 py-2.5 bg-[#1E1B1D] text-white text-xs font-bold rounded-xl shadow-sm hover:bg-black transition-all">
                                <i data-feather="grid" class="w-4 h-4"></i> Khám phá sản phẩm
                            </a>
                        </div>
                    `;
                    if (window.feather) feather.replace();
                    return;
                }

                const statusStyles = {
                    pending: { label: 'Chờ xác nhận', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
                    confirmed: { label: 'Đã xác nhận', bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200' },
                    shipping: { label: 'Đang giao hàng', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
                    delivered: { label: 'Đã giao thành công', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
                    completed: { label: 'Hoàn tất', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
                    cancelled: { label: 'Đã hủy', bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' }
                };

                container.innerHTML = orders.map(order => {
                    const canCancel = ['pending', 'confirmed'].includes(order.status);
                    const st = statusStyles[order.status] || statusStyles.pending;
                    const date = order.createdAt?.toDate 
                        ? order.createdAt.toDate().toLocaleString('vi-VN') 
                        : (order.createdAt instanceof Date ? order.createdAt.toLocaleString('vi-VN') : (order.dateFormatted || 'Gần đây'));
                    const address = window.authManager.escapeHtml(order.customer?.address || 'Chưa có địa chỉ');
                    const recipient = window.authManager.escapeHtml(order.customer?.name || 'Khách hàng');
                    const phone = window.authManager.escapeHtml(order.customer?.phone || '');
                    const shortId = (order.id || '').slice(0, 8).toUpperCase();

                    const itemsHtml = (order.items || []).map(item => {
                        const p = window.PRODUCTS ? window.PRODUCTS.find(prod => prod.id === item.productId) : null;
                        const rawImg = item.image || p?.image || '/images/products/placeholder.jpg';
                        const imgSrc = (rawImg.startsWith('http') || rawImg.startsWith('data:')) ? rawImg : (window.SKINID_ASSET_URL ? window.SKINID_ASSET_URL(rawImg) : rawImg);
                        return `
                            <div class="flex items-center justify-between gap-4 py-2 border-b border-gray-50 last:border-0 text-xs">
                                <div class="flex items-center gap-3 min-w-0">
                                    <img src="${imgSrc}" alt="${window.authManager.escapeHtml(item.name || 'Sản phẩm')}" class="w-10 h-10 rounded-xl object-contain bg-gray-50 p-1 flex-shrink-0 border border-gray-100" />
                                    <div class="min-w-0">
                                        <p class="font-bold text-gray-800 truncate">${window.authManager.escapeHtml(item.name || p?.name || 'Sản phẩm')}</p>
                                        <p class="text-gray-400 text-[11px]">SL: ${item.quantity || 1} × ${formatPrice(item.price || ((item.lineTotal || 0) / (item.quantity || 1)))}</p>
                                    </div>
                                </div>
                                <strong class="text-gray-900 flex-shrink-0">${formatPrice(item.lineTotal || (item.price * (item.quantity || 1)) || 0)}</strong>
                            </div>
                        `;
                    }).join('');

                    return `
                        <article class="rounded-3xl border border-gray-200 bg-white p-5 sm:p-6 shadow-sm hover:border-brand-primary/40 transition-all space-y-4">
                            <div class="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-gray-100">
                                <div>
                                    <div class="flex items-center gap-2">
                                        <strong class="text-sm sm:text-base font-black text-gray-900">#${shortId}</strong>
                                        <span class="text-[11px] font-bold px-3 py-0.5 rounded-full border ${st.bg} ${st.text} ${st.border}">
                                            ${st.label}
                                        </span>
                                    </div>
                                    <p class="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                                        <i data-feather="calendar" class="w-3.5 h-3.5"></i> ${date}
                                    </p>
                                </div>
                                <div class="text-right">
                                    <span class="text-[11px] text-gray-400 block">Tổng thanh toán</span>
                                    <span class="text-base sm:text-lg font-black text-brand-primary">${formatPrice(order.total || order.subtotal || 0)}</span>
                                </div>
                            </div>

                            <div class="bg-gray-50/60 rounded-2xl p-3.5 space-y-2">
                                <div class="flex items-start gap-2 text-xs text-gray-600">
                                    <i data-feather="map-pin" class="w-3.5 h-3.5 text-brand-primary flex-shrink-0 mt-0.5"></i>
                                    <span><strong>${recipient}</strong> (${phone}) — ${address}</span>
                                </div>
                                <div class="flex items-center gap-2 text-[11px] text-gray-500">
                                    <i data-feather="credit-card" class="w-3.5 h-3.5 text-brand-primary flex-shrink-0"></i>
                                    <span>${order.paymentMethod === 'cod' ? 'COD (Thanh toán khi nhận hàng)' : 'Chuyển khoản ngân hàng'} · <span class="${order.paymentStatus === 'paid' ? 'text-teal-600 font-bold' : 'text-gray-500'}">${order.paymentStatus === 'paid' ? 'Đã thanh toán' : 'Chưa thanh toán'}</span></span>
                                </div>
                            </div>

                            <div class="space-y-1">
                                ${itemsHtml}
                            </div>

                            <div class="pt-3 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3">
                                <span class="text-xs text-gray-400">Phí vận chuyển: ${order.shippingFee === 0 ? '<strong class="text-teal-600">Miễn phí</strong>' : formatPrice(order.shippingFee || 0)}</span>
                                <div class="flex items-center gap-2">
                                    <button onclick="window.reorderProfileOrder('${order.id}')" class="px-3.5 py-1.5 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer">
                                        <i data-feather="repeat" class="w-3.5 h-3.5"></i> Mua lại
                                    </button>
                                    ${canCancel ? `<button onclick="window.cancelProfileOrder('${order.id}')" class="px-3.5 py-1.5 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 text-xs font-bold transition-colors cursor-pointer">Hủy đơn</button>` : ''}
                                </div>
                            </div>
                        </article>
                    `;
                }).join('');

                if (window.feather) feather.replace();
            } catch (err) {
                console.error('[SkinID Profile] Lỗi render đơn hàng:', err);
                container.innerHTML = `
                    <div class="text-center py-8 text-gray-500">
                        <p class="text-sm font-bold text-gray-700 mb-1">Đã có lỗi khi hiển thị đơn hàng</p>
                        <p class="text-xs text-gray-400 mb-3">${err.message}</p>
                        <button onclick="window.location.reload()" class="px-4 py-2 bg-[#1E1B1D] text-white text-xs font-bold rounded-xl hover:bg-black transition-all">Tải lại trang</button>
                    </div>
                `;
            }
        }

        window.cancelProfileOrder = async function cancelProfileOrder(orderId) {
            if (!confirm('Bạn có chắc chắn muốn hủy đơn hàng này?')) return;
            const result = await window.authManager.cancelOrder(orderId);
            if (!result.success) {
                if (typeof showToast === 'function') showToast(result.message, 'error');
                else alert(result.message);
                return;
            }
            if (typeof showToast === 'function') showToast('Đã hủy đơn hàng thành công.');
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
                let scoreBg = 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-emerald-500/20';
                let cardBorder = 'border-emerald-200/80 hover:border-emerald-400';
                
                if (scan.healthScore < 60) {
                    scoreBg = 'bg-gradient-to-br from-rose-500 to-red-600 text-white shadow-rose-500/20';
                    cardBorder = 'border-rose-200/80 hover:border-rose-400';
                } else if (scan.healthScore < 75) {
                    scoreBg = 'bg-gradient-to-br from-amber-500 to-amber-600 text-white shadow-amber-500/20';
                    cardBorder = 'border-amber-200/80 hover:border-amber-400';
                }

                const scanId = scan.id || idx;
                const isLatest = idx === 0;

                html += `
                    <div onclick="if(!event.target.closest('a') && !event.target.closest('button')) window.openScanDetailModal('${scanId}')" class="p-5 sm:p-6 rounded-2xl border ${cardBorder} transition-all bg-white shadow-sm hover:shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4 cursor-pointer group">
                        <div class="flex items-center gap-4 min-w-0">
                            <div class="${scoreBg} w-14 h-14 rounded-2xl flex flex-col items-center justify-center font-black flex-shrink-0 shadow-md group-hover:scale-105 transition-transform">
                                <span class="text-xl leading-none font-black">${scan.healthScore}</span>
                                <span class="text-[9px] font-semibold tracking-wider opacity-90">ĐIỂM</span>
                            </div>
                            <div class="min-w-0">
                                <div class="flex flex-wrap items-center gap-2 mb-1">
                                    <h4 class="font-bold text-gray-900 text-sm sm:text-base group-hover:text-brand-primary transition-colors">Phiên Soi Da #${history.length - idx}</h4>
                                    ${isLatest ? `<span class="bg-rose-100/90 text-brand-primary text-[10px] font-black px-2 py-0.5 rounded-full border border-rose-200 uppercase tracking-wider">MỚI NHẤT</span>` : ''}
                                    <span class="text-xs font-bold text-brand-primary bg-brand-blush px-2.5 py-0.5 rounded-full">${scan.skinType}</span>
                                </div>
                                <p class="text-xs text-gray-400 flex items-center gap-1.5 truncate">
                                    <i data-feather="calendar" class="w-3.5 h-3.5 flex-shrink-0"></i> ${scan.dateFormatted} • Tuổi da AI: <strong class="text-gray-700">${scan.skinAge} tuổi</strong>
                                </p>
                            </div>
                        </div>

                        <div class="action-group flex items-center justify-between md:justify-end gap-3 w-full md:w-auto pt-2 md:pt-0 border-t md:border-t-0 border-gray-100 flex-shrink-0">
                            <a href="/skin-analysis" class="btn-soi-lai px-3.5 py-2 text-xs font-semibold flex items-center gap-1.5 cursor-pointer whitespace-nowrap shadow-sm">
                                <i data-feather="rotate-cw" class="w-3.5 h-3.5"></i>
                                <span>Soi lại</span>
                            </a>
                            <a href="https://zalo.me/" target="_blank" class="btn-gui-duoc-si px-3.5 py-2 text-xs font-semibold flex items-center gap-1.5 cursor-pointer whitespace-nowrap shadow-sm">
                                <i data-feather="message-circle" class="w-3.5 h-3.5"></i>
                                <span>Gửi Dược Sĩ</span>
                            </a>
                            <button onclick="window.openScanDetailModal('${scanId}')" class="btn-xem-chi-tiet px-4 py-2 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap">
                                <span>Xem Chi Tiết</span>
                                <i data-feather="arrow-right" class="w-3.5 h-3.5"></i>
                            </button>
                        </div>
                    </div>
                `;
            });

            container.innerHTML = html;
            if (window.feather) feather.replace();
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
        document.addEventListener('skinid:auth-changed', (e) => {
            if (e.detail && typeof window.renderProfileDashboard === 'function') {
                window.renderProfileDashboard();
            }
        });
        document.addEventListener('skinid:data-loaded', (e) => {
            if (e.detail && typeof window.renderProfileDashboard === 'function') {
                window.renderProfileDashboard();
            }
        });
