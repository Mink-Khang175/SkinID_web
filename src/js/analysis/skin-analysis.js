// GLOBAL CATALOG FILTER STATE
let currentBrandFilter = 'all';
let currentStepFilter = 'all';
let currentBenefitFilter = 'all';
let currentSearchQuery = '';

let currentBudget = 'Essential';
window.currentCaptureStep = 1;
window.capturedImages = []; // stores base64 strings without data prefix
window.webcamStream = null;
window.currentRoutineIds = [];
    window.excludedRoutineIds = new Set();

// Gemini credentials live only in the authenticated Cloud Function.

// UTILS
function formatPrice(price) {
    return price.toLocaleString('vi-VN') + 'đ';
}

function addToCart(productId) {
    cartManager.addItem(productId, 1);
    showToast('Đã thêm sản phẩm vào giỏ hàng!');
}

function addAllToCart() {
    if (window.currentRoutineIds && window.currentRoutineIds.length > 0) {
        window.currentRoutineIds.forEach(id => {
            cartManager.addItem(id, 1);
        });
        showToast(`Đã thêm toàn bộ phác đồ (${window.currentRoutineIds.length} sản phẩm) vào giỏ hàng!`);
    } else {
        showToast('Không có sản phẩm nào trong phác đồ để thêm!');
    }
}

function showToast(message) {
    // Check if toast container exists, if not create it
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'fixed bottom-4 right-4 z-[9999] flex flex-col gap-2';
        document.body.appendChild(container);
    }
    
    // Create toast element
    const toast = document.createElement('div');
    toast.className = 'bg-brand-dark text-white px-6 py-3 rounded-xl shadow-xl font-medium text-sm transform transition-all duration-300 translate-y-10 opacity-0 flex items-center gap-2';
    toast.innerHTML = `<i data-feather="check-circle" class="w-4 h-4 text-brand-primary"></i> ${message}`;
    
    container.appendChild(toast);
    
    // Initialize feather icons for the new element
    if (typeof feather !== 'undefined') feather.replace();
    
    // Animate in
    setTimeout(() => {
        toast.classList.remove('translate-y-10', 'opacity-0');
    }, 10);
    
    // Remove after 3 seconds
    setTimeout(() => {
        toast.classList.add('opacity-0', 'translate-y-2');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// CATALOG

// AUTOMATIC SKINCARE STEP TYPE CLASSIFICATION FOR ALL PRODUCTS
function getProductStepType(p) {
    return getProductCategories(p)[0] || '';
}

function renderCatalog() {
    const grid = document.getElementById('product-grid');
    if (!grid) return;
    grid.innerHTML = '';
    
    const filtered = filterProducts(PRODUCTS, {
        brand: currentBrandFilter,
        step: currentStepFilter,
        benefit: currentBenefitFilter,
        query: currentSearchQuery
    });

    // Update Result Count UI Indicator
    const countEl = document.getElementById('filter-result-count');
    if (countEl) {
        countEl.innerHTML = `Hiển thị <span class="font-extrabold text-brand-primary">${filtered.length}</span> sản phẩm`;
    }

    if (filtered.length === 0) {
        grid.innerHTML = '<div class="col-span-full text-center text-gray-500 py-12 bg-white rounded-2xl border border-gray-100"><i data-feather="package" class="w-10 h-10 mx-auto text-gray-300 mb-2"></i>Không tìm thấy sản phẩm nào phù hợp với bộ lọc.</div>';
        if (window.feather) feather.replace();
        return;
    }

    filtered.forEach(p => grid.appendChild(createProductCard(p)));
    
    if (window.feather) feather.replace();
}


window.filterByBrand = function(brand, el) {
    currentBrandFilter = brand;
    const brandSelect = document.getElementById('brand-filter-select');
    if (brandSelect) brandSelect.value = brand;
    window.syncCatalogDropdown?.(brandSelect);
    const brandBtns = document.querySelectorAll('#brand-filters .filter-btn');
    brandBtns.forEach(b => b.classList.remove('active'));
    if (el) {
        const targetBtn = el.closest ? el.closest('.filter-btn') : el;
        if (targetBtn) {
            targetBtn.classList.add('active');
        }
    }
    renderCatalog();
};

window.filterByStep = function(step, el) {
    currentStepFilter = step;
    window.syncPrimaryNavigation?.(step);
    const stepSelect = document.getElementById('step-filter-select');
    if (stepSelect) stepSelect.value = step;
    window.syncCatalogDropdown?.(stepSelect);
    const stepBtns = document.querySelectorAll('#step-filters .step-filter-btn');
    stepBtns.forEach(b => b.classList.remove('active'));
    if (el) {
        const targetBtn = el.closest ? el.closest('.step-filter-btn') : el;
        if (targetBtn) {
            targetBtn.classList.add('active');
        }
    }
    renderCatalog();
};

window.filterByBenefit = function(benefit, el) {
    currentBenefitFilter = benefit;
    const pills = document.querySelectorAll('#benefit-filters .benefit-filter-pill');
    pills.forEach(p => {
        const isMatch = p.dataset.benefit === benefit;
        p.classList.toggle('is-active', isMatch);
        if (isMatch) {
            p.classList.add('bg-[#E85D75]', 'text-white', 'border-[#E85D75]', 'shadow-xs');
            p.classList.remove('bg-white', 'text-gray-700', 'border-rose-100');
        } else {
            p.classList.remove('bg-[#E85D75]', 'text-white', 'border-[#E85D75]', 'shadow-xs');
            p.classList.add('bg-white', 'text-gray-700', 'border-rose-100');
        }
    });
    renderCatalog();
};

function initCatalog() {
    renderCatalog();

    const brandSelect = document.getElementById('brand-filter-select');
    brandSelect?.addEventListener('change', () => filterByBrand(brandSelect.value));

    const stepSelect = document.getElementById('step-filter-select');
    stepSelect?.addEventListener('change', () => filterByStep(stepSelect.value));
    
    // Setup brand filters
    const brandBtns = document.querySelectorAll('#brand-filters .filter-btn');
    brandBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const targetBtn = e.target.closest('.filter-btn');
            if (!targetBtn) return;
            filterByBrand(targetBtn.dataset.brand, targetBtn);
        });
    });

    // Setup step category filters
    const stepBtns = document.querySelectorAll('#step-filters .step-filter-btn');
    stepBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const targetBtn = e.target.closest('.step-filter-btn');
            if (!targetBtn) return;
            filterByStep(targetBtn.dataset.step, targetBtn);
        });
    });

    // Setup benefit filter pills
    const benefitBtns = document.querySelectorAll('#benefit-filters .benefit-filter-pill');
    benefitBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const targetBtn = e.target.closest('.benefit-filter-pill');
            if (!targetBtn) return;
            filterByBenefit(targetBtn.dataset.benefit, targetBtn);
        });
    });

    // Setup search
    const searchInput = document.getElementById('product-search');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            currentSearchQuery = e.target.value;
            renderCatalog();
        });
    }
}

// PRODUCT DETAIL MODAL (Matching Rilastil Training & Product Spec)
window.openProductDetailModal = function(productId) {
    const p = PRODUCTS.find(prod => prod.id === productId);
    if (!p) return;

    let modal = document.getElementById('product-detail-modal');
    if (!modal) return;

    const imgSrc = (p.image.startsWith('http') || p.image.startsWith('data:'))
        ? p.image
        : (window.SKINID_ASSET_URL ? window.SKINID_ASSET_URL(p.image, p.brandSlug) : p.image);
    
    // Fill data
    document.getElementById('pmodal-line').innerText = p.line || p.brand || 'CHĂM SÓC DA';
    document.getElementById('pmodal-title').innerText = p.name;
    document.getElementById('pmodal-price').innerText = formatPrice(p.price);
    
    const origPriceEl = document.getElementById('pmodal-original-price');
    if (p.originalPrice && p.originalPrice > p.price) {
        origPriceEl.innerText = formatPrice(p.originalPrice);
        origPriceEl.classList.remove('hidden');
    } else {
        origPriceEl.classList.add('hidden');
    }

    // TEMPLATE FOR NOTIFICATION OF COSMETIC PRODUCT (First Page Direct Preview)
    const licenseContainer = document.getElementById('pmodal-license-container');
    const licenseImg = document.getElementById('pmodal-license-img');
    const modalLicenseImg = document.getElementById('license-modal-img');

    let licenseImgPath = p.licenseImageUrl;
    if (!licenseImgPath && p.licenseUrl) {
        const m = p.licenseUrl.match(/\/d\/([a-zA-Z0-9_-]+)/);
        if (m) {
            licenseImgPath = `/images/licenses/${m[1]}.webp`;
        }
    }

    // Reset license drawer to collapsed state
    const licenseDrawer = document.getElementById('pmodal-license-drawer');
    const licenseToggleText = document.getElementById('pmodal-license-toggle-text');
    const licenseArrow = document.getElementById('pmodal-license-arrow');
    if (licenseDrawer) licenseDrawer.classList.add('hidden');
    if (licenseToggleText) licenseToggleText.innerText = 'Xem phiếu';
    if (licenseArrow) licenseArrow.classList.remove('rotate-180');

    if (licenseImgPath) {
        const fullLicenseSrc = window.SKINID_ASSET_URL ? window.SKINID_ASSET_URL(licenseImgPath) : licenseImgPath;
        if (licenseImg) {
            licenseImg.src = fullLicenseSrc;
        }
        if (modalLicenseImg) {
            modalLicenseImg.src = fullLicenseSrc;
        }
        if (licenseContainer) {
            licenseContainer.classList.remove('hidden');
        }
    } else {
        if (licenseContainer) {
            licenseContainer.classList.add('hidden');
        }
    }

    document.getElementById('pmodal-volume').innerText = p.volume || 'Tiêu chuẩn';
    document.getElementById('pmodal-uses').innerText = p.uses || p.description || 'Sản phẩm dược mỹ phẩm chuyên sâu từ Rilastil.';
    document.getElementById('pmodal-usage').innerText = p.usage || 'Sử dụng hàng ngày vào sáng và tối.';
    
    // Key actives formatted list
    const activesContainer = document.getElementById('pmodal-key-actives');
    if (activesContainer) {
        activesContainer.innerHTML = '';
        if (p.keyActives && p.keyActives.length > 0) {
            p.keyActives.forEach(act => {
                const parts = act.split(':');
                const title = parts[0] ? parts[0].trim() : '';
                const desc = parts.slice(1).join(':').trim();
                activesContainer.innerHTML += `
                    <div class="mb-2.5">
                        <span class="font-bold text-gray-900 text-xs sm:text-sm uppercase tracking-wide text-brand-dark">${title}:</span>
                        <span class="text-xs sm:text-sm text-gray-700 leading-relaxed"> ${desc}</span>
                    </div>
                `;
            });
        } else {
            activesContainer.innerHTML = '<p class="text-xs text-gray-600">Được bào chế với các hoạt chất sinh học tối ưu cho da liễu.</p>';
        }
    }

    // Full INCI ingredients
    const fullIngEl = document.getElementById('pmodal-full-ingredients');
    if (fullIngEl) {
        fullIngEl.innerText = p.fullIngredients || 'Được kiểm nghiệm da liễu nghiêm ngặt tại Ý.';
    }

    // Certification & Legal Info (Chuẩn Bộ Y Tế NĐ 181/2013)
    const certEl = document.getElementById('pmodal-certification-text');
    if (certEl) {
        if (p.brand === 'TWON' || p.brand === 'D\'VAH') {
            certEl.innerHTML = '<strong>Số Phiếu công bố Mỹ phẩm Bộ Y Tế:</strong> 001248/23/CBMP-HCM • <strong>Thương nhân chịu trách nhiệm:</strong> CÔNG TY TNHH FIELDMAN (MST: 0319200638 - VP: Tầng 9, 343 Phạm Ngũ Lão, Q.1, TP.HCM).';
        } else {
            certEl.innerHTML = '<strong>Số Phiếu công bố Mỹ phẩm Bộ Y Tế:</strong> 184920/22/CBMP-QLD • <strong>Nhập khẩu chính ngạch từ Ý & Phân phối:</strong> CÔNG TY TNHH FIELDMAN (Đầy đủ Hóa đơn GTGT).';
        }
    }

    if (window.feather) window.feather.replace();

    // Image
    const imgEl = document.getElementById('pmodal-img');
    if (imgEl) {
        imgEl.src = imgSrc;
        imgEl.onerror = () => {
            if (p.originalImageUrl && imgEl.src !== p.originalImageUrl) {
                imgEl.src = p.originalImageUrl;
            }
        };
    }

    // Add to cart action button
    const addBtn = document.getElementById('pmodal-add-cart-btn');
    if (addBtn) {
        addBtn.onclick = () => {
            cartManager.addItem(p.id);
            showToast('Đã thêm sản phẩm vào giỏ hàng!');
            closeProductDetailModal();
        };
    }

    // Open animation
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    setTimeout(() => {
        modal.classList.remove('opacity-0');
        modal.classList.add('opacity-100');
        const content = document.getElementById('product-detail-modal-content');
        if (content) {
            content.classList.remove('scale-95', 'opacity-0');
            content.classList.add('scale-100', 'opacity-100');
        }
        if (typeof feather !== 'undefined') feather.replace();
    }, 10);
    window.SkinIDScrollLock?.lock('product-detail');
};

window.toggleLicensePreview = function() {
    const drawer = document.getElementById('pmodal-license-drawer');
    const toggleText = document.getElementById('pmodal-license-toggle-text');
    const arrow = document.getElementById('pmodal-license-arrow');
    if (!drawer) return;

    const isHidden = drawer.classList.contains('hidden');
    if (isHidden) {
        drawer.classList.remove('hidden');
        if (toggleText) toggleText.innerText = 'Thu gọn';
        if (arrow) arrow.classList.add('rotate-180');
    } else {
        drawer.classList.add('hidden');
        if (toggleText) toggleText.innerText = 'Xem phiếu';
        if (arrow) arrow.classList.remove('rotate-180');
    }
};

window.openLicenseModal = function() {
    const modal = document.getElementById('license-preview-modal');
    if (modal) {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
        window.SkinIDScrollLock?.lock('license-preview');
    }
};

window.closeLicenseModal = function() {
    const modal = document.getElementById('license-preview-modal');
    if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
        window.SkinIDScrollLock?.unlock('license-preview');
    }
};

window.closeProductDetailModal = function() {
    window.closeLicenseModal?.();
    const modal = document.getElementById('product-detail-modal');
    if (!modal) return;
    const content = document.getElementById('product-detail-modal-content');
    if (content) {
        content.classList.remove('scale-100', 'opacity-100');
        content.classList.add('scale-95', 'opacity-0');
    }
    modal.classList.remove('opacity-100');
    modal.classList.add('opacity-0');
    setTimeout(() => {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }, 300);
    window.SkinIDScrollLock?.unlock('product-detail');
};

// SMART AI INGREDIENT & CONCERN MATCHING
function matchProductForStep(stepType, targetConcerns, activeIngredients, budgetTier) {
    let pool = PRODUCTS.filter(p => p.stepType === stepType);
    if (pool.length === 0) pool = PRODUCTS;

    // Score each candidate
    const scored = pool.map(p => {
        let score = 0;
        
        // 1. Budget Tier Match (+30)
        if (p.tier === budgetTier) score += 30;

        // 2. Target Concern Match (+25 per concern)
        if (p.targetConcerns && targetConcerns) {
            targetConcerns.forEach(c => {
                if (p.targetConcerns.includes(c)) score += 25;
            });
        }

        // 3. Active Ingredients Match (+35 per matching active)
        if (activeIngredients && p.keyActives) {
            const productText = (p.name + ' ' + (p.keyActives || []).join(' ') + ' ' + (p.fullIngredients || '')).toLowerCase();
            activeIngredients.forEach(ing => {
                if (productText.includes(ing.toLowerCase())) score += 35;
            });
        }

        // 4. Prefer products with rich key actives
        if (p.keyActives && p.keyActives.length > 0) score += 10;

        return { product: p, score: score };
    });

    scored.sort((a, b) => b.score - a.score);
    return scored[0]?.product || pool[0];
}



// PRIVACY MODAL FLOW
function openPrivacyModal() {
    if (window.authManager && !window.authManager.getCurrentUser()) {
        window.authManager.openAuthModal('Đăng nhập để bắt đầu Soi Da AI và lưu phác đồ riêng của bạn nhé ✨');
        return;
    }
    const modal = document.getElementById('privacy-modal');
    if (!modal) return;
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    
    // Reset state
    const checkbox = document.getElementById('privacy-consent-checkbox');
    if (checkbox) {
        checkbox.checked = false;
        checkbox.onchange = togglePrivacyButton;
    }
    togglePrivacyButton();

    const btn = document.getElementById('btn-privacy-continue');
    if (btn) {
        btn.onclick = function(e) {
            if (e) e.preventDefault();
            requestCameraPermissionAndProceed();
        };
    }

    setTimeout(() => {
        modal.classList.remove('opacity-0');
        modal.classList.add('opacity-100');
        const content = document.getElementById('privacy-modal-content');
        if (content) {
            content.classList.remove('scale-95');
            content.classList.add('scale-100');
        }
    }, 10);
}

function closePrivacyModal() {
    const modal = document.getElementById('privacy-modal');
    if (!modal) return;
    modal.classList.remove('opacity-100');
    modal.classList.add('opacity-0');
    const content = document.getElementById('privacy-modal-content');
    if (content) {
        content.classList.remove('scale-100');
        content.classList.add('scale-95');
    }
    setTimeout(() => {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }, 300);
}

function togglePrivacyButton() {
    const checkbox = document.getElementById('privacy-consent-checkbox');
    const btn = document.getElementById('btn-privacy-continue');
    if (!btn) return;
    
    btn.classList.add('scan-primary-button');
    btn.disabled = !checkbox?.checked;
    if (checkbox?.checked) {
        if (btn.classList?.remove) btn.classList.remove('bg-gray-300', 'cursor-not-allowed');
        if (btn.classList?.add) btn.classList.add('bg-brand-primary', 'hover:bg-brand-dark', 'cursor-pointer');
    } else {
        if (btn.classList?.remove) btn.classList.remove('bg-brand-primary', 'hover:bg-brand-dark', 'cursor-pointer');
        if (btn.classList?.add) btn.classList.add('bg-gray-300', 'cursor-not-allowed');
    }
}

let isRequestingCamera = false;

async function requestCameraPermissionAndProceed() {
    const checkbox = document.getElementById('privacy-consent-checkbox');
    if (!checkbox || !checkbox.checked) return;
    if (isRequestingCamera) return;
    isRequestingCamera = true;

    const btn = document.getElementById('btn-privacy-continue');
    if (btn) {
        btn.innerHTML = '<i data-feather="loader" class="w-4 h-4 animate-spin"></i> Đang mở giao diện...';
        if (window.feather) feather.replace();
    }

    try {
        if (navigator.mediaDevices && typeof navigator.mediaDevices.getUserMedia === 'function') {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                stream.getTracks().forEach(track => track.stop());
            } catch (e) {
                console.warn("Camera access not available or denied, file upload is supported.", e);
            }
        }
    } catch (err) {
        console.error("Camera permission error:", err);
    } finally {
        closePrivacyModal();
        setTimeout(() => {
            openScanModal();
            isRequestingCamera = false;
            const b = document.getElementById('btn-privacy-continue');
            if (b) {
                b.innerHTML = '<i data-feather="camera" class="w-4 h-4"></i> Cấp quyền Camera';
                togglePrivacyButton();
                if (window.feather) feather.replace();
            }
        }, 300);
    }
}

// AI SCAN FLOW
function openScanModal() {
    const modal = document.getElementById('ai-modal');
    if (!modal) return;
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    setTimeout(() => {
        modal.classList.remove('opacity-0');
        modal.classList.add('opacity-100');
    }, 10);
    
    const isDedicatedPage = document.body.classList.contains('scan-page-body');
    if (!isDedicatedPage) window.SkinIDScrollLock?.lock('skin-analysis');
    
    document.getElementById('capture-flow').classList.remove('hidden');
    document.getElementById('capture-flow').classList.add('flex');
    
    document.getElementById('analyzing-flow').classList.add('hidden');
    document.getElementById('analyzing-flow').classList.remove('flex');
    
    document.getElementById('results-flow').classList.add('hidden');
    document.getElementById('results-flow').classList.remove('flex');
    
    window.currentCaptureStep = 1;
    window.capturedImages = [];
    
    for(let i=1; i<=3; i++) {
        const thumb = document.getElementById('thumb-'+i);
        if (thumb) thumb.innerHTML = '';
    }
    
    const capBtn = document.getElementById('capture-btn');
    if (capBtn) capBtn.classList.remove('hidden');
    const actBtn = document.getElementById('analyze-action');
    if (actBtn) actBtn.classList.add('hidden');
    
    updateStepUI();
    if (typeof window.startWebcam === 'function') {
        window.startWebcam();
    } else {
        startWebcam();
    }
    if (isDedicatedPage) {
        setTimeout(() => modal.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80);
    }
}

function closeScanModal() {
    if (typeof window.stopWebcam === 'function') {
        window.stopWebcam();
    } else {
        stopWebcam();
    }
    if (document.body.classList.contains('scan-page-body')) {
        window.location.href = '/';
        return;
    }
    const modal = document.getElementById('ai-modal');
    if (!modal) return;
    modal.classList.remove('opacity-100');
    modal.classList.add('opacity-0');
    setTimeout(() => {
        modal.classList.remove('flex');
        modal.classList.add('hidden');
    }, 300);
    window.SkinIDScrollLock?.unlock('skin-analysis');
}

window.openPrivacyModal = openPrivacyModal;
window.closePrivacyModal = closePrivacyModal;
window.togglePrivacyButton = togglePrivacyButton;
window.requestCameraPermissionAndProceed = requestCameraPermissionAndProceed;
window.openScanModal = openScanModal;
window.closeScanModal = closeScanModal;

function initScanSetup() {
    const consentCheckbox = document.getElementById('privacy-consent-checkbox');
    if (consentCheckbox) {
        consentCheckbox.addEventListener('change', togglePrivacyButton);
    }
    const privacyBtn = document.getElementById('btn-privacy-continue');
    if (privacyBtn) {
        privacyBtn.addEventListener('click', (e) => {
            e.preventDefault();
            requestCameraPermissionAndProceed();
        });
    }

    const budgetBtns = document.querySelectorAll('.budget-btn');
    if (budgetBtns) {
        budgetBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                budgetBtns.forEach(b => {
                    b.classList.remove('border-brand-primary', 'bg-brand-blush', 'text-brand-primary');
                    b.classList.add('border-gray-200', 'text-gray-600');
                });
                e.target.classList.remove('border-gray-200', 'text-gray-600');
                e.target.classList.add('border-brand-primary', 'bg-brand-blush', 'text-brand-primary');
                currentBudget = e.target.dataset.budget;
            });
        });
    }

    const capBtn = document.getElementById('capture-btn');
    if (capBtn) {
        capBtn.onclick = function(e) {
            if (e) {
                e.preventDefault();
                e.stopPropagation();
            }
            if (typeof window.captureFrame === 'function') {
                window.captureFrame();
            } else if (typeof captureFrame === 'function') {
                captureFrame();
            }
        };
    }

    const startBtn = document.getElementById('start-analysis-btn');
    if (startBtn) {
        startBtn.onclick = function() {
            if (typeof startAnalysis === 'function') startAnalysis();
        };
    }
}

function updateStepUI() {
    const texts = ["Chụp/Tải ảnh chính diện khuôn mặt", "Nghiêng trái 45 độ", "Nghiêng phải 45 độ"];
    if (window.currentCaptureStep <= 3) {
        const inst = document.getElementById('instruction-text');
        if (inst) inst.innerText = texts[window.currentCaptureStep-1];
    }
    
    for (let i = 1; i <= 3; i++) {
        const ind = document.getElementById(`step-${i}-indicator`);
        if (!ind) continue;
        const num = ind.querySelector('div');
        const text = ind.querySelector('span');
        
        if (i < window.currentCaptureStep) {
            num.className = 'w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center font-bold text-sm shadow-md transition-colors border-4 border-white';
            num.innerHTML = '<i data-feather="check" class="w-4 h-4"></i>';
            if (text) text.className = 'text-xs font-semibold text-green-500';
        } else if (i === window.currentCaptureStep) {
            num.className = 'w-8 h-8 rounded-full bg-brand-primary text-white flex items-center justify-center font-bold text-sm shadow-md transition-colors border-4 border-white';
            num.innerHTML = i;
            if (text) text.className = 'text-xs font-semibold text-brand-primary';
        } else {
            num.className = 'w-8 h-8 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center font-bold text-sm transition-colors border-4 border-white';
            num.innerHTML = i;
            if (text) text.className = 'text-xs font-medium text-gray-500';
        }
    }
    if (window.feather) feather.replace();
}

window.updateStepUI = updateStepUI;

let webcamStream = null;

async function startWebcam() {
    const video = document.getElementById('webcam') || document.getElementById('webcam-video');
    if (!video) return;
    try {
        webcamStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } } });
        video.srcObject = webcamStream;
        const loading = document.getElementById('camera-loading');
        if (loading) loading.classList.add('hidden');
    } catch (err) {
        console.warn("Webcam unavailable, file upload is enabled.", err);
    }
}

function stopWebcam() {
    if (webcamStream) {
        webcamStream.getTracks().forEach(track => track.stop());
        webcamStream = null;
    }
}

let isCapturing = false;

function captureFrame() {
    if (isCapturing) return;
    isCapturing = true;
    setTimeout(() => { isCapturing = false; }, 800);

    if (typeof window.captureFrameAndPreProcess === 'function') {
        window.captureFrameAndPreProcess();
        return;
    }

    const video = document.getElementById('webcam') || document.getElementById('webcam-video');
    const canvas = document.createElement('canvas');
    if (video && video.videoWidth > 0) {
        const maxDim = 800;
        let w = video.videoWidth;
        let h = video.videoHeight;
        if (w > maxDim || h > maxDim) {
            if (w > h) {
                h = Math.round((h * maxDim) / w);
                w = maxDim;
            } else {
                w = Math.round((w * maxDim) / h);
                h = maxDim;
            }
        }
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(video, 0, 0, w, h);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.82);
        saveCapturedImage(dataUrl.split(',')[1]);
    } else {
        let fileInput = document.getElementById('file-upload-input');
        if (!fileInput) {
            fileInput = document.createElement('input');
            fileInput.id = 'file-upload-input';
            fileInput.type = 'file';
            fileInput.accept = 'image/*';
            fileInput.style.display = 'none';
            fileInput.onchange = handleFileUpload;
            document.body.appendChild(fileInput);
        }
        fileInput.click();
    }
}

window.startWebcam = startWebcam;
window.stopWebcam = stopWebcam;
window.captureFrame = captureFrame;

window.openScanFilePicker = function() {
    let fileInput = document.getElementById('file-upload-input');
    if (!fileInput) {
        fileInput = document.createElement('input');
        fileInput.id = 'file-upload-input';
        fileInput.type = 'file';
        fileInput.accept = 'image/*';
        fileInput.style.display = 'none';
        fileInput.onchange = handleFileUpload;
        document.body.appendChild(fileInput);
    }
    fileInput.value = '';
    fileInput.click();
};

function compressImageFile(file, maxDimension = 800, quality = 0.82) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                let w = img.naturalWidth || img.width;
                let h = img.naturalHeight || img.height;
                if (w > maxDimension || h > maxDimension) {
                    if (w > h) {
                        h = Math.round((h * maxDimension) / w);
                        w = maxDimension;
                    } else {
                        w = Math.round((w * maxDimension) / h);
                        h = maxDimension;
                    }
                }
                const canvas = document.createElement('canvas');
                canvas.width = w;
                canvas.height = h;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, w, h);
                resolve(canvas.toDataURL('image/jpeg', quality).split(',')[1]);
            };
            img.onerror = () => reject(new Error('Không thể đọc file ảnh này.'));
            img.src = e.target.result;
        };
        reader.onerror = () => reject(new Error('Lỗi khi đọc file ảnh.'));
        reader.readAsDataURL(file);
    });
}

async function handleFileUpload(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    try {
        const base64Data = await compressImageFile(file, 1280, 0.85);
        saveCapturedImage(base64Data);
    } catch (err) {
        console.error('[SkinID Upload]', err);
        showToast(err.message || 'Không thể tải ảnh này.');
    } finally {
        event.target.value = '';
    }
}

let isSavingCapturedImage = false;

function saveCapturedImage(base64Image) {
    if (isSavingCapturedImage) return;
    isSavingCapturedImage = true;
    setTimeout(() => { isSavingCapturedImage = false; }, 800);

    if (!window.capturedImages) window.capturedImages = [];
    window.capturedImages.push(base64Image);
    
    const thumb = document.getElementById('thumb-' + window.currentCaptureStep);
    if (thumb) {
        thumb.innerHTML = `<img src="data:image/jpeg;base64,${base64Image}" class="w-full h-full object-cover rounded-xl border border-brand-petal shadow-sm">`;
    }
    
    window.currentCaptureStep++;
    if (window.currentCaptureStep > 3) {
        document.getElementById('capture-btn')?.classList.add('hidden');
        document.getElementById('analyze-action')?.classList.remove('hidden');
        const inst = document.getElementById('instruction-text');
        if (inst) inst.innerText = 'Đã hoàn tất 3 góc chụp! Hãy nhấn nút Phân tích da.';
        if (typeof window.stopWebcam === 'function') {
            window.stopWebcam();
        } else if (typeof stopWebcam === 'function') {
            stopWebcam();
        }
    } else {
        updateStepUI();
    }
}

window.saveCapturedImage = saveCapturedImage;

// Helper string hash for deterministic Report ID
function stringHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) - hash) + str.charCodeAt(i);
        hash |= 0;
    }
    return Math.abs(hash).toString(16).toUpperCase().padStart(4, '0');
}

// --- Scan step animation helper ---
function activateScanStep(stepNum, totalSteps) {
    const steps = document.querySelectorAll('#scan-steps-list .scan-step');
    const titles = [
        { title: '🔍 Đang nhận diện khuôn mặt...', desc: 'Xác định vùng da từ 3 góc chụp' },
        { title: '🧬 Phân tích cấu trúc biểu bì...', desc: 'Quét lớp biểu bì và hạ bì' },
        { title: '💧 Đo lường chỉ số da...', desc: 'Đo độ ẩm, dầu, sắc tố melanin' },
        { title: '📊 Tổng hợp 12 chỉ số...', desc: 'Kết xuất biểu đồ cấu trúc da' },
        { title: '✨ Hoàn tất phân tích!', desc: 'Đang tạo báo cáo cá nhân hóa' }
    ];

    steps.forEach((s, i) => {
        s.classList.remove('active', 'done');
        if (i + 1 < stepNum) s.classList.add('done');
        else if (i + 1 === stepNum) s.classList.add('active');
    });

    const titleEl = document.getElementById('scan-step-title');
    const descEl = document.getElementById('scan-step-desc');
    if (titleEl && titles[stepNum - 1]) {
        titleEl.textContent = titles[stepNum - 1].title;
        descEl.textContent = titles[stepNum - 1].desc;
    }

    const progressBar = document.getElementById('analysis-progress');
    if (progressBar) {
        progressBar.style.width = Math.round((stepNum / totalSteps) * 100) + '%';
    }

    if (window.feather) feather.replace();
}

// --- Weather API (Open-Meteo, no key needed) ---
async function fetchWeatherData() {
    try {
        const pos = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, () => reject('no-geo'), { timeout: 5000 });
        });
        const lat = pos.coords.latitude.toFixed(2);
        const lon = pos.coords.longitude.toFixed(2);
        const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,uv_index&timezone=auto`);
        const data = await res.json();
        return {
            temp: Math.round(data.current.temperature_2m),
            humidity: Math.round(data.current.relative_humidity_2m),
            uvIndex: Math.round(data.current.uv_index)
        };
    } catch (e) {
        console.warn('Weather fallback to defaults', e);
        return { temp: 31, humidity: 78, uvIndex: 7 };
    }
}

function showAnalysisError(message, isNotFace = false) {
    const errorCard = document.getElementById('analysis-error-card');
    const errorMsgEl = document.getElementById('analysis-error-message');
    const retryBtn = document.getElementById('analysis-retry-btn');
    const recaptureBtn = document.getElementById('analysis-recapture-btn');

    if (errorMsgEl) errorMsgEl.textContent = message;
    if (errorCard) {
        errorCard.classList.remove('hidden');
        if (window.feather) feather.replace();
    }
    if (retryBtn) {
        if (isNotFace) {
            retryBtn.classList.add('hidden');
        } else {
            retryBtn.classList.remove('hidden');
            retryBtn.onclick = () => {
                if (errorCard) errorCard.classList.add('hidden');
                startAnalysis();
            };
        }
    }
    if (recaptureBtn) {
        recaptureBtn.onclick = () => {
            if (errorCard) errorCard.classList.add('hidden');
            resetToCaptureFlow();
        };
    }
}

async function startAnalysis() {
    if (!window.capturedImages || window.capturedImages.length < 3) {
        showToast('Vui lòng hoàn tất đủ 3 góc chụp trước khi phân tích.');
        resetToCaptureFlow();
        return;
    }
    // switch UI
    document.getElementById('capture-flow').classList.add('hidden');
    document.getElementById('capture-flow').classList.remove('flex');
    
    document.getElementById('analyzing-flow').classList.remove('hidden');
    document.getElementById('analyzing-flow').classList.add('flex');

    const errorCard = document.getElementById('analysis-error-card');
    if (errorCard) errorCard.classList.add('hidden');

    // Show scan thumbnails with captured images
    if (window.capturedImages) {
        for (let i = 0; i < Math.min(3, window.capturedImages.length); i++) {
            const thumb = document.getElementById('scan-thumb-' + (i + 1));
            if (thumb) {
                const existingImg = thumb.querySelector('img');
                if (existingImg) existingImg.remove();
                const img = document.createElement('img');
                img.src = 'data:image/jpeg;base64,' + window.capturedImages[i];
                img.className = 'w-full h-full object-cover';
                thumb.prepend(img);
            }
        }
    }

    if (window.feather) feather.replace();

    // Smooth step progression timers
    const stepTimers = [];
    activateScanStep(1, 5);
    stepTimers.push(setTimeout(() => activateScanStep(2, 5), 1500));
    stepTimers.push(setTimeout(() => activateScanStep(3, 5), 4500));
    stepTimers.push(setTimeout(() => activateScanStep(4, 5), 8500));

    const skinType = document.getElementById('user-skin-type')?.value || 'Da hỗn hợp';
    
    try {
        if (!window.authManager?.getCurrentUser()) throw new Error('Bạn cần đăng nhập trước khi phân tích da.');
        await window.SKINID_FIREBASE_READY;
        const [response, weatherData] = await Promise.all([
            window.authManager.apiRequest('/analyze-skin', {
                method: 'POST',
                body: JSON.stringify({ images: window.capturedImages, skinType }),
                timeoutMs: 60000
            }),
            fetchWeatherData()
        ]);
        stepTimers.forEach(clearTimeout);

        const resultJson = response?.analysis;
        if (resultJson?.isNotFace) {
            showAnalysisError('Không nhận diện được khuôn mặt người rõ ràng trong đủ 3 ảnh. Vui lòng chụp lại ở nơi đủ sáng.', true);
            return;
        }
        if (!resultJson?.skinTypeSummary) throw new Error('Máy chủ trả về kết quả không hợp lệ.');
        activateScanStep(5, 5);
        await new Promise(resolve => setTimeout(resolve, 400));
        renderResults(resultJson, weatherData);
    } catch (error) {
        stepTimers.forEach(clearTimeout);
        console.error('[SkinID AI]', error);
        const message = window.authManager?.errorMessage?.(error)
            || error.message
            || 'Không thể hoàn tất phân tích da. Vui lòng thử lại.';
        showAnalysisError(message, false);
    }
}

window.startAnalysis = startAnalysis;

function resetToCaptureFlow() {
    const errorCard = document.getElementById('analysis-error-card');
    if (errorCard) errorCard.classList.add('hidden');
    document.getElementById('analyzing-flow').classList.add('hidden');
    document.getElementById('analyzing-flow').classList.remove('flex');
    document.getElementById('capture-flow').classList.remove('hidden');
    document.getElementById('capture-flow').classList.add('flex');
    // Reset scan thumbnails
    for (let i = 1; i <= 3; i++) {
        const thumb = document.getElementById('scan-thumb-' + i);
        if (thumb) {
            const img = thumb.querySelector('img');
            if (img) img.remove();
        }
    }
}

function scrollScanWorkspaceToTop() {
    const modal = document.getElementById('ai-modal');
    if (!modal) return;
    if (document.body.classList.contains('scan-page-body')) {
        window.scrollTo({ top: Math.max(0, modal.offsetTop - 110), behavior: 'smooth' });
    } else {
        modal.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

function renderResults(data, weatherData) {
    document.getElementById('analyzing-flow').classList.add('hidden');
    document.getElementById('analyzing-flow').classList.remove('flex');
    
    document.getElementById('results-flow').classList.remove('hidden');
    document.getElementById('results-flow').classList.add('flex');
    
    // Header
    const now = new Date();
    document.getElementById('report-date').innerText = `Ngày: ${now.toLocaleDateString('vi-VN')}`;
    
    const reportSeed = (data.skinTypeSummary || '') + (data.healthScore || '') + (data.analysis3Angles || '').substring(0, 20);
    document.getElementById('report-id').innerText = `ID: SKN-${stringHash(reportSeed)}`;
    document.getElementById('result-skin-type').innerText = data.skinTypeSummary;
    
    // Text
    document.getElementById('result-assessment').innerText = data.analysis3Angles;
    
    // Tags (Keywords/Ingredients)
    const tagsContainer = document.getElementById('result-tags');
    if (tagsContainer) {
        tagsContainer.innerHTML = '';
        if (data.activeIngredients && Array.isArray(data.activeIngredients)) {
            data.activeIngredients.forEach(ing => {
                tagsContainer.innerHTML += `<span class="bg-brand-blush text-brand-primary px-3 py-1 rounded-full text-xs font-bold border border-brand-petal">${ing}</span>`;
            });
        }
    }

    // --- B1: Overall Grade Badge ---
    const gradeBadge = document.getElementById('overall-grade-badge');
    const gradeLetter = document.getElementById('overall-grade-letter');
    const gradeText = document.getElementById('overall-grade-text');
    if (gradeBadge && data.overallGrade) {
        const gradeColors = {
            'A': { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700' },
            'B': { bg: 'bg-teal-50', border: 'border-teal-200', text: 'text-teal-700' },
            'C': { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700' },
            'D': { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700' },
            'F': { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700' }
        };
        const gc = gradeColors[data.overallGrade.toUpperCase()] || gradeColors['C'];
        gradeBadge.className = `inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold mb-3 border transition-all duration-500 ${gc.bg} ${gc.border} ${gc.text}`;
        gradeBadge.style.display = 'inline-flex';
        gradeLetter.textContent = data.overallGrade.toUpperCase();
        gradeText.textContent = data.overallGradeComment || 'Đánh giá tổng thể';
    }
    
    // Animate health score with GLOW effect
    let score = 0;
    const targetScore = Math.min(100, Math.max(10, parseInt(data.healthScore) || 72));
    const scoreText = document.getElementById('health-score-text');
    const scoreRing = document.getElementById('health-score-ring');
    const scoreGlow = document.getElementById('score-glow');
    
    // Determine color based on score
    let ringColor, glowColor;
    if (targetScore >= 75) {
        ringColor = '#10b981'; glowColor = 'rgba(16,185,129,0.4)';
    } else if (targetScore >= 55) {
        ringColor = '#f59e0b'; glowColor = 'rgba(245,158,11,0.4)';
    } else {
        ringColor = '#ef4444'; glowColor = 'rgba(239,68,68,0.4)';
    }

    if (scoreText && scoreRing) {
        scoreRing.style.stroke = ringColor;
        const interval = setInterval(() => {
            if(score >= targetScore) { 
                clearInterval(interval);
                // Apply glow after animation completes
                if (scoreGlow) {
                    scoreGlow.style.boxShadow = `0 0 30px ${glowColor}, 0 0 60px ${glowColor}`;
                }
                // Confetti for good scores
                if (targetScore >= 80) triggerConfetti();
                return; 
            }
            score++;
            scoreText.innerText = score;
            scoreRing.style.strokeDasharray = `${score}, 100`;
        }, 20);
    }

    // Render Metrics Accordion
    const metricsContainer = document.getElementById('metrics-container');
    if (metricsContainer) {
        metricsContainer.innerHTML = '';
        const metricDefs = [
            { id: 'moisture', name: 'Độ ẩm', score: parseInt(data.moisture) || 60, isInverse: false, icon: 'droplet' },
            { id: 'sebum', name: 'Dầu thừa', score: parseInt(data.sebum) || 60, isInverse: true, icon: 'wind' },
            { id: 'pores', name: 'Lỗ chân lông', score: parseInt(data.pores) || 60, isInverse: true, icon: 'maximize' },
            { id: 'pigmentation', name: 'Sắc tố', score: parseInt(data.pigmentation) || 50, isInverse: true, icon: 'sun' },
            { id: 'elasticity', name: 'Độ đàn hồi', score: parseInt(data.elasticity) || 65, isInverse: false, icon: 'activity' }
        ];

        metricDefs.forEach(m => {
            let goodScore = m.isInverse ? (100 - m.score) : m.score;
            let level = "Cần cải thiện";
            let textClass = "text-rose-600";
            let bgClass = "bg-rose-100";
            let progressClass = "bg-rose-500";
            
            if (goodScore >= 80) {
                level = "Tốt"; textClass = "text-teal-600"; bgClass = "bg-teal-100"; progressClass = "bg-teal-400";
            } else if (goodScore >= 60) {
                level = "Khá"; textClass = "text-pink-400"; bgClass = "bg-pink-50"; progressClass = "bg-pink-300";
            } else if (goodScore >= 40) {
                level = "Cần chú ý"; textClass = "text-pink-600"; bgClass = "bg-pink-100"; progressClass = "bg-pink-500";
            }

            const html = `
            <div class="border border-gray-100 rounded-xl overflow-hidden transition-all duration-300">
                <div class="p-4 flex flex-col sm:flex-row sm:items-center justify-between cursor-pointer hover:bg-gray-50 gap-4" onclick="this.nextElementSibling.classList.toggle('hidden'); const icon = this.querySelector('.chevron-icon'); icon.style.transform = icon.style.transform === 'rotate(180deg)' ? 'rotate(0deg)' : 'rotate(180deg)';">
                    <div class="flex items-center gap-3 sm:w-2/5">
                        <div class="p-2 rounded-lg ${bgClass} ${textClass}">
                            <i data-feather="${m.icon}" class="w-4 h-4"></i>
                        </div>
                        <div>
                            <p class="font-bold text-gray-800 text-sm">${m.name}</p>
                            <p class="${textClass} text-xs font-semibold">${m.score}% - ${level}</p>
                        </div>
                    </div>
                    <div class="sm:w-2/5 px-2">
                        <div class="w-full bg-gray-100 rounded-full h-2">
                            <div class="${progressClass} h-2 rounded-full transition-all duration-1000" style="width: 0%" data-target="${m.score}"></div>
                        </div>
                    </div>
                    <div class="sm:w-1/5 text-right flex justify-end">
                        <i data-feather="chevron-down" class="w-5 h-5 text-gray-400 transition-transform chevron-icon"></i>
                    </div>
                </div>
                <div class="hidden border-t border-gray-100 bg-gray-50 p-4 text-sm space-y-3">
                    <div class="flex gap-2">
                        <span class="font-bold text-gray-700 min-w-[80px]">Vì sao?</span>
                        <span class="text-gray-600 leading-relaxed">${(data.detailedAdvice && data.detailedAdvice[m.id] && data.detailedAdvice[m.id].why) || `Chỉ số ${m.name.toLowerCase()} ở mức ${m.score}% cho thấy tình trạng thực tế từ phân tích hình ảnh AI.`}</span>
                    </div>
                    <div class="flex gap-2">
                        <span class="font-bold text-gray-700 min-w-[80px]">Nên làm:</span>
                        <span class="text-gray-600 leading-relaxed">${(data.detailedAdvice && data.detailedAdvice[m.id] && data.detailedAdvice[m.id].shouldDo) || 'Sử dụng sản phẩm chứa thành phần đặc trị phù hợp với chỉ số này.'}</span>
                    </div>
                    <div class="flex gap-2">
                        <span class="font-bold text-gray-700 min-w-[80px]">Cần tránh:</span>
                        <span class="text-gray-600 leading-relaxed">${(data.detailedAdvice && data.detailedAdvice[m.id] && data.detailedAdvice[m.id].avoid) || 'Hạn chế tiếp xúc trực tiếp tia UV và các thói quen gây hại cho da.'}</span>
                    </div>
                </div>
            </div>
            `;
            metricsContainer.innerHTML += html;
        });

        if(window.feather) { feather.replace(); }

        setTimeout(() => {
            metricsContainer.querySelectorAll('[data-target]').forEach(bar => {
                bar.style.width = bar.getAttribute('data-target') + '%';
            });
        }, 100);
    }

    window.currentActiveIngredients = Array.isArray(data.activeIngredients) ? data.activeIngredients : [];
    window.currentWorstMetrics = [
        { id: 'sebum', score: parseInt(data.sebum) || 60, health: 100 - (parseInt(data.sebum) || 60) },
        { id: 'pores', score: parseInt(data.pores) || 60, health: 100 - (parseInt(data.pores) || 60) },
        { id: 'pigmentation', score: parseInt(data.pigmentation) || 50, health: 100 - (parseInt(data.pigmentation) || 50) },
        { id: 'moisture', score: parseInt(data.moisture) || 60, health: parseInt(data.moisture) || 60 },
        { id: 'elasticity', score: parseInt(data.elasticity) || 65, health: parseInt(data.elasticity) || 65 }
    ].sort((a, b) => a.health - b.health).slice(0, 2);
    window.currentRoutineIds = [];
    window.excludedRoutineIds = new Set();

    buildRoutine('routine-morning', true);
    buildRoutine('routine-evening', false);
    
    renderProductRecommendations();
    
    const skinAgeText = document.getElementById('skin-age-text');
    if (skinAgeText) {
        let skinAge = parseInt(data.skinAge);
        if (!skinAge || isNaN(skinAge)) {
            const health = targetScore;
            const elasticity = parseInt(data.elasticity) || 65;
            skinAge = Math.round(38 - (health * 0.1) - (elasticity * 0.1));
        }
        skinAgeText.innerText = skinAge;
    }

    const concernTitle = document.getElementById('concern-title');
    const concernDesc = document.getElementById('concern-desc');
    
    let m = [
        { id: 'sebum', score: parseInt(data.sebum) || 60 },
        { id: 'pigment', score: parseInt(data.pigmentation) || 50 },
        { id: 'pores', score: parseInt(data.pores) || 60 },
        { id: 'moisture', score: parseInt(data.moisture) || 60 },
        { id: 'elasticity', score: parseInt(data.elasticity) || 65 }
    ];
    let sortedMetrics = [...m].sort((a,b) => {
        let healthA = (a.id === 'sebum' || a.id === 'pores' || a.id === 'pigment') ? (100 - a.score) : a.score;
        let healthB = (b.id === 'sebum' || b.id === 'pores' || b.id === 'pigment') ? (100 - b.score) : b.score;
        return healthA - healthB; 
    });
    
    let worst1 = sortedMetrics[0] || {id: 'sebum'};
    let worst2 = sortedMetrics[1] || {id: 'pigment'};
    
    const translateConcern = (id) => {
        if(id === 'sebum') return "Bã nhờn vùng chữ T";
        if(id === 'pigment') return "Sắc tố ẩn UV";
        if(id === 'pores') return "Lỗ chân lông to";
        if(id === 'moisture') return "Thiếu ẩm bề mặt";
        if(id === 'elasticity') return "Độ đàn hồi suy giảm";
        return id;
    };
    
    if (concernTitle && concernDesc) {
        concernTitle.innerHTML = `⚠️ Phát hiện ${translateConcern(worst1.id)} & ${translateConcern(worst2.id)}`;
        concernDesc.innerText = `Điểm da tổng thể của bạn là ${targetScore}/100. AI phát hiện rủi ro cao ở ${translateConcern(worst1.id).toLowerCase()} và ${translateConcern(worst2.id).toLowerCase()}. Vui lòng tuân thủ phác đồ bên dưới để cải thiện.`;
    }

    const ctxRadar = document.getElementById('radarChart');
    if (ctxRadar && typeof Chart !== 'undefined') {
        if (window.skinRadarChart) window.skinRadarChart.destroy();
        
        const moistureH = parseInt(data.moisture) || 60;
        const sebumH = Math.max(10, 100 - (parseInt(data.sebum) || 60));
        const poresH = Math.max(10, 100 - (parseInt(data.pores) || 60));
        const pigmentH = Math.max(10, 100 - (parseInt(data.pigmentation) || 50));
        const elasticityH = parseInt(data.elasticity) || 65;
        const melasmaH = parseInt(data.melasma) || Math.max(15, pigmentH - 10);
        const eyeWrinklesH = parseInt(data.eyeWrinkles) || Math.round(elasticityH * 0.95);
        const nasolabialFoldsH = parseInt(data.nasolabialFolds) || Math.round(elasticityH * 0.9);
        const rednessH = parseInt(data.redness) || Math.round(moistureH * 0.7 + 25);
        
        // smooth scroll to top of modal
        scrollScanWorkspaceToTop();

        // Automatically Save Scan History & Dispatch Email Report to Logged-in User
        if (window.authManager && window.authManager.getCurrentUser()) {
            const currentUser = window.authManager.getCurrentUser();
            const routineProducts = (window.currentRoutineProducts && window.currentRoutineProducts.length > 0) 
                ? window.currentRoutineProducts 
                : (window.currentRoutineIds ? PRODUCTS.filter(p => window.currentRoutineIds.includes(p.id)) : []);

            window.authManager.saveScanHistory({
                userName: currentUser.name,
                healthScore: targetScore,
                skinType: data.skinTypeSummary || 'Da hỗn hợp',
                skinAge: parseInt(data.skinAge) || 25,
                primaryConcerns: data.activeIngredients || [],
                overallGrade: data.overallGrade || 'B',
                overallGradeComment: data.overallGradeComment || 'Làn da ở mức ổn định',
                analysis3Angles: data.analysis3Angles || '',
                fullAnalysis: data,
                metrics: {
                    moisture: data.moisture,
                    sebum: data.sebum,
                    pores: data.pores,
                    pigmentation: data.pigmentation,
                    elasticity: data.elasticity,
                    melasma: data.melasma,
                    eyeWrinkles: data.eyeWrinkles,
                    nasolabialFolds: data.nasolabialFolds,
                    redness: data.redness,
                    acneBacteria: data.acneBacteria,
                    texture: data.texture,
                    darkCircles: data.darkCircles
                },
                recommendedRoutine: window.currentRoutineIds || [],
                recommendedRoutineProducts: routineProducts
            }).then((savedRecord) => {
                if (!savedRecord || !window.emailService || !currentUser.email) return;
                window.emailService.sendSkinReportEmail(currentUser.email, {
                    userName: currentUser.name,
                    healthScore: targetScore,
                    skinType: data.skinTypeSummary || 'Da hỗn hợp',
                    skinAge: parseInt(data.skinAge) || 25,
                    recommendedRoutineProducts: routineProducts
                });
            }).catch(error => console.error('[SkinID history]', error));
        }
        
        const acneBacteriaH = parseInt(data.acneBacteria) || Math.round(sebumH * 0.8 + 15);
        const textureH = parseInt(data.texture) || Math.round((moistureH + poresH) / 2);
        const darkCirclesH = parseInt(data.darkCircles) || Math.round((targetScore + pigmentH) / 2);

        const radarData = {
            labels: [
                'Độ ẩm (Hydration)', 'Dầu thừa (Sebum)', 'Lỗ chân lông (Pores)', 'Sắc tố UV', 
                'Sạm nám', 'Đàn hồi (Elasticity)', 'Nhăn đuôi mắt', 'Rãnh cười', 
                'Đỏ da (Redness)', 'Khuẩn mụn', 'Kết cấu (Texture)', 'Quầng thâm'
            ],
            datasets: [{
                label: 'Sức khỏe cấu trúc da',
                data: [
                    moistureH, sebumH, poresH, pigmentH, 
                    melasmaH, elasticityH, eyeWrinklesH, nasolabialFoldsH, 
                    rednessH, acneBacteriaH, textureH, darkCirclesH
                ],
                backgroundColor: 'rgba(232, 122, 144, 0.2)',
                borderColor: 'rgba(232, 122, 144, 1)',
                pointBackgroundColor: 'rgba(232, 122, 144, 1)',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: 'rgba(232, 122, 144, 1)',
                borderWidth: 2,
            }]
        };

        window.skinRadarChart = new Chart(ctxRadar, {
            type: 'radar',
            data: radarData,
            options: {
                scales: {
                    r: {
                        angleLines: { color: 'rgba(0,0,0,0.05)' },
                        grid: { color: 'rgba(0,0,0,0.05)' },
                        pointLabels: {
                            font: { size: 10, family: "'Inter', sans-serif", weight: '600' },
                            color: '#4A5568'
                        },
                        ticks: { display: false, min: 0, max: 100 }
                    }
                },
                plugins: { legend: { display: false } },
                elements: { line: { tension: 0.3 } }
            }
        });
        
        const envMetrics = document.getElementById('environment-metrics');
        if (envMetrics) {
            const temp = (weatherData && weatherData.temp) || 31;
            const humidity = (weatherData && weatherData.humidity) || 78;
            const uvIndex = (weatherData && weatherData.uvIndex) || 7;
            const isRealtime = weatherData && weatherData.temp;
            
            envMetrics.innerHTML = `
                <div class="bg-white p-2 rounded-xl text-center shadow-sm border border-blue-50">
                    <p class="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Nhiệt độ</p>
                    <p class="font-bold text-gray-800 text-lg">${temp}°C</p>
                </div>
                <div class="bg-white p-2 rounded-xl text-center shadow-sm border border-blue-50">
                    <p class="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Độ ẩm</p>
                    <p class="font-bold text-gray-800 text-lg">${humidity}%</p>
                </div>
                <div class="bg-white p-2 rounded-xl text-center shadow-sm border border-orange-200 bg-orange-50/30">
                    <p class="text-[10px] text-orange-500 uppercase tracking-wider font-semibold">Tia UV</p>
                    <p class="font-bold text-orange-600 text-lg">${uvIndex}</p>
                </div>
            `;
            
            let impactText = "Thời tiết ổn định, phù hợp để duy trì chu trình dưỡng da hiện tại.";
            if (uvIndex > 7 && humidity > 75) {
                impactText = "Tác động: Tia UV và độ ẩm cao đang kích thích tuyến bã nhờn hoạt động mạnh, làm tăng nguy cơ bít tắc lỗ chân lông và sạm nám ẩn.";
            } else if (uvIndex > 5 && temp > 30) {
                impactText = "Tác động: Nắng nóng và tia UV ở mức trung bình-cao. Cần chống nắng SPF50+ và tăng cấp ẩm.";
            } else if (temp > 32) {
                impactText = "Tác động: Nhiệt độ cao làm da mất nước nhanh, cần tăng cường cấp ẩm và chống nắng.";
            } else if (humidity < 50) {
                impactText = "Tác động: Độ ẩm thấp khiến da dễ khô, cần tăng cường serum cấp ẩm và kem dưỡng khóa ẩm.";
            }
            document.getElementById('environment-impact').innerText = impactText;
        }


        // --- NEW: ROOT CAUSE & FORECAST ---
        const METRIC_DETAILS = {
            'sebum': {
                name: 'Dầu thừa (Sebum)',
                cause: 'Tuyến bã nhờn hoạt động quá mức do màng lipid bề mặt bị tổn thương, khiến da mất nước và cơ thể phải tiết dầu để bù ẩm.',
                forecast: 'Lỗ chân lông sẽ phình to vĩnh viễn, tạo môi trường yếm khí cho vi khuẩn P.Acnes bùng phát thành mụn viêm sưng nang.'
            },
            'pigment': {
                name: 'Sắc tố UV',
                cause: 'Hắc sắc tố Melanin dưới đáy hạ bì bị kích thích đẩy lên liên tục do bức xạ mặt trời phá hủy tế bào.',
                forecast: 'Sẽ hình thành nám chân sâu và tàn nhang mảng lớn khó trị. Cấu trúc DNA biểu bì suy yếu khiến da lão hóa cực nhanh.'
            },
            'pores': {
                name: 'Lỗ chân lông to',
                cause: 'Sự tích tụ tế bào chết và bã nhờn lâu ngày làm bít tắc cổ nang lông, kết hợp với sự suy giảm collagen quanh nang lông.',
                forecast: 'Bề mặt da sẽ sần sùi vĩnh viễn (sẹo rỗ li ti), mất khả năng hấp thụ dưỡng chất từ các sản phẩm skincare đắt tiền.'
            },
            'moisture': {
                name: 'Độ ẩm bề mặt',
                cause: 'Hàng rào bảo vệ da (Skin Barrier) bị nứt gãy khiến nước bốc hơi nhanh chóng (TEWL) ra ngoài môi trường.',
                forecast: 'Da sẽ chuyển sang trạng thái bong tróc, nhạy cảm kích ứng với mọi loại mỹ phẩm. Nếp nhăn li ti lan rộng toàn mặt.'
            },
            'elasticity': {
                name: 'Độ đàn hồi',
                cause: 'Mạng lưới sợi Collagen và Elastin bị đứt gãy do tuổi tác, tia UV hoặc gốc tự do phá hoại mà không được tổng hợp bù đắp.',
                forecast: 'Da sẽ chảy xệ thành nếp gấp sâu ở rãnh cười và khóe mắt, form dáng V-line ban đầu sẽ bị phá vỡ hoàn toàn.'
            }
        };

        const rcaContainer = document.getElementById('root-cause-analysis');
        const forecastText = document.getElementById('skin-forecast-text');
        
        if (rcaContainer && forecastText) {
            const getDetail = (id) => METRIC_DETAILS[id] || { 
                name: translateConcern(id), 
                cause: 'Rối loạn chức năng tế bào hoặc tổn thương do môi trường.', 
                forecast: 'Trở ngại lớn cho việc hấp thụ dưỡng chất, khiến da xỉn màu và nhanh lão hóa.' 
            };
            
            const detail1 = getDetail(worst1.id);
            const detail2 = getDetail(worst2.id);

            rcaContainer.innerHTML = `
                <div class="p-4 bg-red-50 rounded-xl border-l-4 border-red-500">
                    <h5 class="font-bold text-red-800 mb-1 flex items-center gap-2">
                        <i data-feather="alert-triangle" class="w-4 h-4"></i> ${detail1.name}
                    </h5>
                    <p class="text-sm text-red-700 leading-relaxed"><span class="font-semibold">Cơ chế:</span> ${detail1.cause}</p>
                </div>
                <div class="p-4 bg-orange-50 rounded-xl border-l-4 border-orange-500">
                    <h5 class="font-bold text-orange-800 mb-1 flex items-center gap-2">
                        <i data-feather="alert-circle" class="w-4 h-4"></i> ${detail2.name}
                    </h5>
                    <p class="text-sm text-orange-700 leading-relaxed"><span class="font-semibold">Cơ chế:</span> ${detail2.cause}</p>
                </div>
            `;
            
            forecastText.innerHTML = `Nếu tiếp tục duy trì thói quen hiện tại: <br><br> 1. ${detail1.forecast} <br> 2. ${detail2.forecast} <br><br> Bạn bắt buộc phải sử dụng các hoạt chất đặc trị ngay từ bây giờ để thiết lập lại trật tự tế bào trước khi quá muộn.`;
            
            if (typeof feather !== 'undefined') {
                setTimeout(() => feather.replace(), 100);
            }
        }

        // --- NEW: DETAILED METRICS GRID ---
        const detailedGrid = document.getElementById('detailed-metrics-grid');
        if (detailedGrid && typeof radarData !== 'undefined') {
            let detailedHtml = '';
            const labels = radarData.labels;
            const values = radarData.datasets[0].data;
            
            for (let i = 0; i < labels.length; i++) {
                const label = labels[i];
                const score = Math.round(values[i]);
                
                // Determine color based on score
                let colorClass = 'bg-brand-primary';
                let textClass = 'text-brand-primary';
                if (score < 50) {
                    colorClass = 'bg-rose-500';
                    textClass = 'text-rose-600';
                } else if (score < 75) {
                    colorClass = 'bg-orange-400';
                    textClass = 'text-orange-500';
                } else {
                    colorClass = 'bg-emerald-500';
                    textClass = 'text-emerald-600';
                }

                detailedHtml += `
                    <div class="flex flex-col gap-1.5">
                        <div class="flex justify-between items-center text-sm">
                            <span class="font-semibold text-gray-700">${label}</span>
                            <span class="font-bold ${textClass}">${score}/100</span>
                        </div>
                        <div class="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                            <div class="${colorClass} h-2 rounded-full transition-all duration-1000" style="width: ${score}%"></div>
                        </div>
                    </div>
                `;
            }
            detailedGrid.innerHTML = detailedHtml;
        }




        const radarInsights = document.getElementById('radar-insights');
        if(radarInsights) {
            radarInsights.innerHTML = `
                <div class="flex items-center gap-3 p-3 bg-red-50 rounded-xl border border-red-100 mb-2">
                    <div class="w-2 h-2 rounded-full bg-red-500"></div>
                    <span class="text-sm text-red-700 font-medium">${translateConcern(worst1.id)} bị co thắt trầm trọng dưới mức 30%.</span>
                </div>
                <div class="flex items-center gap-3 p-3 bg-orange-50 rounded-xl border border-orange-100">
                    <div class="w-2 h-2 rounded-full bg-orange-500"></div>
                    <span class="text-sm text-orange-700 font-medium">${translateConcern(worst2.id)} mất cân bằng, cần can thiệp hạ bì.</span>
                </div>
            `;
        }
    }

    // smooth scroll to top of modal
    scrollScanWorkspaceToTop();
}


function calcMatchScore(product, targetConcerns) {
    let score = 88;
    if (product && product.targetConcerns && targetConcerns) {
        product.targetConcerns.forEach(c => {
            if (targetConcerns.includes(c)) score += 3;
        });
    }
    if (product && product.mainActives && window.currentActiveIngredients) {
        product.mainActives.forEach(act => {
            if (window.currentActiveIngredients.some(ai => ai.toLowerCase().includes(act.toLowerCase()))) score += 2;
        });
    }
    return Math.min(99, Math.max(86, score));
}

function buildRoutine(containerId, isMorning) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';
    
    // Target concerns from worst metrics
    const targetConcerns = [];
    if (window.currentWorstMetrics) {
        window.currentWorstMetrics.forEach(m => {
            if (m.id === 'sebum' || m.id === 'acne') targetConcerns.push('acne', 'sebum');
            if (m.id === 'pores') targetConcerns.push('pores', 'sebum');
            if (m.id === 'pigmentation' || m.id === 'uv_spots') targetConcerns.push('pigmentation', 'uv_spots');
            if (m.id === 'moisture') targetConcerns.push('moisture', 'dehydration');
            if (m.id === 'elasticity' || m.id === 'wrinkles') targetConcerns.push('aging', 'elasticity', 'wrinkles');
            if (m.id === 'redness') targetConcerns.push('redness', 'sensitivity');
        });
    }
    if (targetConcerns.length === 0) targetConcerns.push('moisture', 'aging');

    const activeIngredients = window.currentActiveIngredients || ['Hyaluronic Acid', 'Niacinamide'];

    let steps = [];
    if (isMorning) {
        steps = [
            { stepType: 'cleanser', title: "Bước 1: Làm sạch & Cân bằng", desc: "Loại bỏ dầu thừa đêm qua và ổn định độ pH" },
            { stepType: 'treatment', title: "Bước 2: Tinh chất đặc trị", desc: "Thẩm thấu sâu khắc phục vấn đề da hàng đầu" },
            { stepType: 'sunscreen', title: "Bước 3: Bảo vệ phổ rộng (SPF 50+)", desc: "Bảo vệ màng tế bào trước tia UVA/UVB và gốc tự do" }
        ];
    } else {
        steps = [
            { stepType: 'cleanser', title: "Bước 1: Làm sạch sâu & Tẩy trang", desc: "Hút sạch bụi mịn PM2.5 và bã nhờn tích tụ" },
            { stepType: 'treatment', title: "Bước 2: Đặc trị & Phục hồi chuyên sâu", desc: "Tái tạo liên kết tế bào trong giấc ngủ" },
            { stepType: 'moisturizer', title: "Bước 3: Khóa ẩm & Tái thiết lập màng Lipid", desc: "Chống mất nước qua biểu bì và củng cố hàng rào bảo vệ" }
        ];
    }
    
    steps.forEach((step, idx) => {
        const product = matchProductForStep(step.stepType, targetConcerns, activeIngredients, currentBudget);
        if (product) {
            window.currentRoutineIds.push(product.id);
            const matchScore = calcMatchScore(product, targetConcerns);
            container.appendChild(createProductCard(product, {
                variant: 'horizontal', step: step.title, matchScore
            }));
        }
    });
    
    if (window.feather) feather.replace();
}



function renderProductRecommendations() {
    const container = document.getElementById('product-recommendations');
    if (!container) return;
    container.innerHTML = '';
    
    const uniqueIds = [...new Set(window.currentRoutineIds)];
    
    uniqueIds.forEach(id => {
        const p = PRODUCTS.find(prod => prod.id === id);
        if (!p) return;
        
        container.appendChild(createProductCard(p));
    });
    
    if(window.feather) { feather.replace(); }
}


function addAllToCart() {
    const uniqueIds = [...new Set(window.currentRoutineIds)].filter(id => !window.excludedRoutineIds?.has(id));
    if (!uniqueIds.length) {
        showToast('Vui lòng chọn ít nhất một sản phẩm trong phác đồ.');
        return;
    }
    uniqueIds.forEach(id => {
        if(window.cartManager) {
            cartManager.addItem(id, 1);
        }
    });
    showToast(`Đã thêm ${uniqueIds.length} sản phẩm vào giỏ hàng!`);
}


// BOOTSTRAP INITIALIZATION
function bootstrapApp() {
    console.log("SkinID App Bootstrapping with", PRODUCTS.length, "products...");
    initCatalog();
    initScanSetup();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootstrapApp);
} else {
    bootstrapApp();
}
