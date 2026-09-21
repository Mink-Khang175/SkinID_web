/* SkinID storefront presentation layer.
 * Keeps navigation, merchandising and consultation interactions separate from
 * the product catalogue and service prototypes.
 */
(function () {
    const $ = (selector, root = document) => root.querySelector(selector);
    const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

    function productImage(product) {
        if (!product || !product.image) return '';
        return product.image.startsWith('http') || product.image.startsWith('data:')
            ? product.image
            : (window.SKINID_ASSET_URL ? window.SKINID_ASSET_URL(product.image) : product.image);
    }

    function conciseName(name) {
        if (!name) return '';
        return name
            .toLowerCase()
            .replace(/\s+/g, ' ')
            .replace(/rilastil/g, 'Rilastil')
            .replace(/dvah/g, "D'VAH")
            .replace(/twon/g, 'TWON')
            .replace(/(^|[.!?]\s+)([a-zà-ỹ])/g, (match, lead, letter) => lead + letter.toUpperCase());
    }

    function renderFeatured() {
        const grid = $('#featured-grid');
        if (!grid || typeof PRODUCTS === 'undefined') return;

        const desiredSteps = ['cleanser', 'treatment', 'moisturizer', 'sunscreen'];
        const selected = desiredSteps
            .map((step) => PRODUCTS.find((product) => product.stepType === step && product.image && product.price))
            .filter(Boolean);

        grid.innerHTML = selected.map((product, index) => `
            <article class="featured-card" tabindex="0" role="button" aria-label="Xem ${product.name}" data-product-id="${product.id}">
                <div class="featured-media">
                    <span class="badge">Bước ${index + 1}</span>
                    <img src="${productImage(product)}" alt="${product.name}" loading="lazy">
                </div>
                <div class="featured-body">
                    <span class="featured-brand">${product.brand} · ${product.line || product.category}</span>
                    <h3>${conciseName(product.name)}</h3>
                    <p class="featured-use">${product.uses || ''}</p>
                    <div class="price-row">
                        <span class="price">${formatPrice(product.price)}</span>
                        <button class="mini-add" type="button" data-add-id="${product.id}" aria-label="Thêm ${product.name} vào giỏ"><i data-feather="plus"></i></button>
                    </div>
                </div>
            </article>
        `).join('');

        $$('.featured-card', grid).forEach((card) => {
            const open = () => openProductDetailModal(card.dataset.productId);
            card.addEventListener('click', (event) => {
                if (!event.target.closest('[data-add-id]')) open();
            });
            card.addEventListener('keydown', (event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    open();
                }
            });
        });

        $$('[data-add-id]', grid).forEach((button) => {
            button.addEventListener('click', () => {
                cartManager.addItem(button.dataset.addId);
                showToast('Đã thêm sản phẩm vào giỏ hàng');
            });
        });
    }

    function scrollToCatalog() {
        ($('#featured-products') || $('#catalog'))?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    function syncPrimaryNavigation(step = 'all') {
        $$('.desktop-nav [data-nav-step]').forEach((link) => {
            const isActive = link.dataset.navStep === step;
            link.classList.toggle('is-active', isActive);
            if (isActive) link.setAttribute('aria-current', 'true');
            else link.removeAttribute('aria-current');
        });
    }

    function chooseFilterButton(selector, dataName, value) {
        const buttons = $$(selector);
        return buttons.find((button) => button.dataset[dataName] === value) || null;
    }

    function applyCatalogState({ brand = 'all', step = 'all', query = '' } = {}) {
        const brandButton = chooseFilterButton('#brand-filters .filter-btn', 'brand', String(brand).toLowerCase());
        const stepButton = chooseFilterButton('#step-filters .step-filter-btn', 'step', step);
        const searchInput = $('#product-search');
        const brandSelect = $('#brand-filter-select');
        const stepSelect = $('#step-filter-select');

        if (typeof filterByBrand === 'function') filterByBrand(brand, brandButton);
        if (typeof filterByStep === 'function') filterByStep(step, stepButton);
        if (searchInput) searchInput.value = query;
        if (brandSelect) brandSelect.value = String(brand).toLowerCase();
        if (stepSelect) stepSelect.value = step;
        window.syncCatalogDropdown?.(brandSelect);
        window.syncCatalogDropdown?.(stepSelect);
        syncPrimaryNavigation(step);
        if (typeof currentSearchQuery !== 'undefined') currentSearchQuery = query;
        if (typeof renderCatalog === 'function') renderCatalog();
        scrollToCatalog();
    }

    function setupCatalogDropdowns() {
        const dropdowns = $$('[data-catalog-dropdown]');
        const closeAll = (except = null) => dropdowns.forEach((dropdown) => {
            if (dropdown === except) return;
            dropdown.querySelector('.catalog-dropdown__panel')?.setAttribute('hidden', '');
            dropdown.querySelector('.catalog-dropdown__trigger')?.setAttribute('aria-expanded', 'false');
        });
        const sync = (input) => {
            if (!input) return;
            const dropdown = input.closest('[data-catalog-dropdown]');
            if (!dropdown) return;
            const options = $$('[data-dropdown-value]', dropdown);
            const selected = options.find((option) => option.dataset.dropdownValue === input.value) || options[0];
            dropdown.querySelector('[data-dropdown-label]').textContent = selected?.textContent?.replace('✓', '').trim() || '';
            options.forEach((option) => {
                const isActive = option === selected;
                option.classList.toggle('is-active', isActive);
                option.setAttribute('aria-selected', String(isActive));
            });
        };
        window.syncCatalogDropdown = sync;
        dropdowns.forEach((dropdown) => {
            const input = $('input[type="hidden"]', dropdown);
            const trigger = $('.catalog-dropdown__trigger', dropdown);
            const panel = $('.catalog-dropdown__panel', dropdown);
            const options = $$('[data-dropdown-value]', dropdown);
            const open = () => {
                closeAll(dropdown);
                panel.hidden = false;
                trigger.setAttribute('aria-expanded', 'true');
            };
            const close = () => {
                panel.hidden = true;
                trigger.setAttribute('aria-expanded', 'false');
            };
            trigger.addEventListener('click', () => panel.hidden ? open() : close());
            trigger.addEventListener('keydown', (event) => {
                if (!['ArrowDown', 'ArrowUp'].includes(event.key)) return;
                event.preventDefault();
                open();
                (options.find((option) => option.classList.contains('is-active')) || options[0])?.focus();
            });
            panel.addEventListener('keydown', (event) => {
                const current = options.indexOf(document.activeElement);
                if (event.key === 'Escape') { close(); trigger.focus(); return; }
                if (!['ArrowDown', 'ArrowUp'].includes(event.key)) return;
                event.preventDefault();
                const direction = event.key === 'ArrowDown' ? 1 : -1;
                options[(current + direction + options.length) % options.length]?.focus();
            });
            options.forEach((option) => option.addEventListener('click', () => {
                input.value = option.dataset.dropdownValue;
                sync(input);
                input.dispatchEvent(new Event('change', { bubbles: true }));
                close();
                trigger.focus();
            }));
            sync(input);
        });
        document.addEventListener('click', (event) => {
            if (!event.target.closest('[data-catalog-dropdown]')) closeAll();
        });
    }

    function setupMerchandisingLinks() {
        if (!$('#catalog')) return;
        $$('.category-item, [data-nav-step]').forEach((button) => {
            button.addEventListener('click', (event) => {
                event.preventDefault();
                applyCatalogState({ step: button.dataset.step || button.dataset.navStep || 'all' });
            });
        });

        $$('.brand-cards [data-brand]').forEach((button) => {
            button.addEventListener('click', () => {
                applyCatalogState({ brand: button.dataset.brand });
            });
        });

        $$('.concern-card').forEach((button) => {
            button.addEventListener('click', () => {
                applyCatalogState({
                    brand: button.dataset.brand || 'all',
                    step: button.dataset.step || 'all',
                    query: button.dataset.concern || ''
                });
            });
        });

        $$('.routine-step').forEach((button) => {
            button.addEventListener('click', () => {
                $$('.routine-step').forEach((item) => item.classList.remove('active'));
                button.classList.add('active');
                applyCatalogState({ step: button.dataset.step });
            });
        });
    }

    function setupSort() {
        const sort = $('#catalog-sort');
        if (!sort || typeof PRODUCTS === 'undefined') return;
        const initialOrder = new Map(PRODUCTS.map((product, index) => [product.id, index]));

        sort.addEventListener('change', () => {
            PRODUCTS.sort((a, b) => {
                if (sort.value === 'price-asc') return a.price - b.price;
                if (sort.value === 'price-desc') return b.price - a.price;
                return initialOrder.get(a.id) - initialOrder.get(b.id);
            });
            renderCatalog();
        });
    }

    function setupCarousel() {
        const carousel = $('#hero-carousel');
        if (!carousel) return;
        const slides = $$('.hero-slide', carousel);
        const dots = $$('[data-carousel-dot]', carousel);
        const brandTabs = $$('[data-brand-tab]');
        const carouselRotationMs = 5500;
        let activeIndex = 0;
        let timer = null;

        const showSlide = (index) => {
            activeIndex = (index + slides.length) % slides.length;
            slides.forEach((slide, slideIndex) => {
                const isActive = slideIndex === activeIndex;
                slide.classList.toggle('is-active', isActive);
                slide.setAttribute('aria-hidden', String(!isActive));
                $$('a, button', slide).forEach((control) => {
                    control.tabIndex = isActive ? 0 : -1;
                });
            });
            dots.forEach((dot, dotIndex) => {
                const isActive = dotIndex === activeIndex;
                dot.classList.toggle('is-active', isActive);
                dot.setAttribute('aria-selected', String(isActive));
            });
            brandTabs.forEach((tab) => {
                const isActive = Number(tab.dataset.activeSlide) === activeIndex;
                tab.classList.toggle('is-active', isActive);
                tab.setAttribute('aria-pressed', String(isActive));
            });
        };
        const stop = () => {
            if (timer !== null) window.clearTimeout(timer);
            timer = null;
        };

        // Every tab uses the same clock boundary. This prevents two browsers
        // from drifting to different hero banners simply because they opened
        // the page at different times.
        const syncedSlideIndex = () => Math.floor(Date.now() / carouselRotationMs) % slides.length;
        const start = () => {
            stop();
            if (document.hidden || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
            const delayToNextBoundary = carouselRotationMs - (Date.now() % carouselRotationMs) + 16;
            timer = window.setTimeout(() => {
                showSlide(syncedSlideIndex());
                start();
            }, delayToNextBoundary);
        };

        $('[data-carousel-prev]', carousel)?.addEventListener('click', () => { showSlide(activeIndex - 1); start(); });
        $('[data-carousel-next]', carousel)?.addEventListener('click', () => { showSlide(activeIndex + 1); start(); });
        dots.forEach((dot) => dot.addEventListener('click', () => { showSlide(Number(dot.dataset.carouselDot)); start(); }));
        brandTabs.forEach((tab) => tab.addEventListener('click', () => { showSlide(Number(tab.dataset.activeSlide)); start(); }));
        carousel.addEventListener('mouseenter', stop);
        carousel.addEventListener('mouseleave', start);
        carousel.addEventListener('focusin', stop);
        carousel.addEventListener('focusout', start);
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                stop();
                return;
            }
            showSlide(syncedSlideIndex());
            start();
        });
        $$('[data-hero-brand]', carousel).forEach((button) => button.addEventListener('click', () => applyCatalogState({ brand: button.dataset.heroBrand })));
        showSlide(0);
        start();
    }

    window.toggleMobileMenu = function (force) {
        const menu = $('#mobile-menu');
        if (!menu) return;
        const shouldOpen = typeof force === 'boolean' ? force : menu.classList.contains('hidden');
        menu.classList.toggle('hidden', !shouldOpen);
    };

    window.handleHeaderSearch = function (value, submit) {
        const searchInput = $('#product-search');
        if (searchInput) {
            searchInput.value = value;
            if (typeof currentSearchQuery !== 'undefined') currentSearchQuery = value;
            if (typeof renderCatalog === 'function') renderCatalog();
            if (submit) scrollToCatalog();
            return;
        }
        if (submit && value.trim()) {
            window.location.href = `/?search=${encodeURIComponent(value.trim())}#catalog`;
        }
    };

    let selectedConsultationStep = '';

    window.openConsultation = function () {
        $('#consultation-modal')?.classList.add('is-open');
        window.SkinIDScrollLock?.lock('consultation');
        setTimeout(() => $('.consult-option')?.focus(), 20);
    };

    window.closeConsultation = function () {
        $('#consultation-modal')?.classList.remove('is-open');
        window.SkinIDScrollLock?.unlock('consultation');
    };

    function setupConsultation() {
        const cta = $('#consultation-cta');
        const result = $('#consultation-result');
        const copyByStep = {
            treatment: '<strong>Gợi ý cấu trúc:</strong> Làm sạch dịu nhẹ → hoạt chất đặc trị phù hợp → dưỡng phục hồi → chống nắng mỗi sáng.',
            moisturizer: '<strong>Gợi ý cấu trúc:</strong> Làm sạch không khô căng → lớp cấp ẩm → kem dưỡng khóa ẩm → chống nắng.',
            sunscreen: '<strong>Gợi ý cấu trúc:</strong> Làm sạch → sản phẩm hỗ trợ đều màu/đàn hồi → dưỡng ẩm → chống nắng phổ rộng.'
        };

        $$('.consult-option').forEach((button) => {
            button.addEventListener('click', () => {
                $$('.consult-option').forEach((item) => item.classList.remove('active'));
                button.classList.add('active');
                selectedConsultationStep = button.dataset.consult;
                if (result) {
                    result.innerHTML = `<span class="modal-kicker">Routine cho ${button.dataset.label}</span><p>${copyByStep[selectedConsultationStep]}</p>`;
                    result.classList.remove('hidden');
                }
                if (cta) {
                    cta.disabled = false;
                    cta.textContent = 'Xem sản phẩm phù hợp';
                }
            });
        });

        cta?.addEventListener('click', () => {
            if (!selectedConsultationStep) return;
            closeConsultation();
            applyCatalogState({ step: selectedConsultationStep });
        });
    }

    const policies = {
        shipping: {
            eyebrow: 'Mua hàng an tâm',
            title: 'Giao hàng & đổi trả',
            body: '<p>Miễn phí vận chuyển toàn quốc cho đơn hàng từ 500.000₫. Sản phẩm lỗi từ nhà sản xuất hoặc tem niêm phong không còn nguyên vẹn được hỗ trợ đổi trong 7 ngày kể từ khi nhận hàng.</p><p>Vui lòng giữ hóa đơn và quay video khi mở kiện để việc hỗ trợ diễn ra nhanh chóng.</p>'
        },
        privacy: {
            eyebrow: 'Quyền riêng tư',
            title: 'Bảo mật dữ liệu',
            body: '<p>SkinID chỉ sử dụng thông tin khách hàng để hỗ trợ tư vấn, xử lý đơn hàng và cung cấp trải nghiệm đã được khách hàng đồng ý.</p><p>Thông tin cá nhân không được kinh doanh hoặc chia sẻ cho bên thứ ba ngoài phạm vi cần thiết để cung cấp dịch vụ.</p>'
        },
        terms: {
            eyebrow: 'Thông tin sử dụng',
            title: 'Điều khoản & lưu ý',
            body: '<p>Nội dung tư vấn và gợi ý routine trên website mang tính chất tham khảo. Sản phẩm chăm sóc da không phải là thuốc và không thay thế chẩn đoán, điều trị y khoa.</p><p>Với tình trạng da viêm, kích ứng kéo dài hoặc có dấu hiệu bệnh lý, khách hàng nên thăm khám bác sĩ da liễu.</p>'
        }
    };

    window.openPolicy = function (type) {
        const policy = policies[type] || policies.terms;
        const content = $('#policy-content');
        if (content) content.innerHTML = `<span class="modal-kicker">${policy.eyebrow}</span><h2 id="policy-title">${policy.title}</h2>${policy.body}`;
        $('#policy-modal')?.classList.add('is-open');
        window.SkinIDScrollLock?.lock('policy');
    };

    window.closePolicy = function () {
        $('#policy-modal')?.classList.remove('is-open');
        window.SkinIDScrollLock?.unlock('policy');
    };

    function setupModalDismissal() {
        $$('.modal').forEach((modal) => {
            modal.addEventListener('click', (event) => {
                if (event.target !== modal) return;
                modal.classList.remove('is-open');
                window.SkinIDScrollLock?.unlock(modal.id === 'policy-modal' ? 'policy' : 'consultation');
            });
        });
        document.addEventListener('keydown', (event) => {
            if (event.key !== 'Escape') return;
            closeConsultation();
            closePolicy();
            toggleMobileMenu(false);
        });
    }

    function init() {
        window.syncPrimaryNavigation = syncPrimaryNavigation;
        renderFeatured();
        setupMerchandisingLinks();
        setupCatalogDropdowns();
        setupSort();
        setupCarousel();
        setupConsultation();
        setupModalDismissal();
        const incomingSearch = new URLSearchParams(window.location.search).get('search');
        if (incomingSearch && $('#product-search')) {
            window.handleHeaderSearch(incomingSearch, false);
            $('.header-search input')?.setAttribute('value', incomingSearch);
        }
        if (new URLSearchParams(window.location.search).get('auth') === '1') {
            window.authManager?.openAuthModal?.();
        }
        if (window.feather) feather.replace();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
