// Shared catalog card; horizontal mode adds routine-specific selection controls.
function createProductCard(p, options = {}) {
        const imgSrc = (p.image.startsWith('http') || p.image.startsWith('data:')) ? p.image : `public${p.image}`;
        
        let tierColor = 'product-badge--neutral';
        if (p.tier === 'Essential') tierColor = 'product-badge--essential';
        if (p.tier === 'Select') tierColor = 'product-badge--select';
        if (p.tier === 'Signature') tierColor = 'product-badge--signature';

        // Badges for main actives
        let activesBadges = '';
        if (p.mainActives && p.mainActives.length > 0) {
            activesBadges = p.mainActives.slice(0, 2).map(act => `<span>${act}</span>`).join('');
        }

        // Promotion / Tag Badge
        let promoBadge = '';
        if (p.originalPrice && p.originalPrice > p.price) {
            const discount = Math.round((1 - p.price / p.originalPrice) * 100);
            promoBadge = `<span class="product-badge product-badge--sale">Giảm ${discount}%</span>`;
        } else if (p.tier === 'Signature') {
            promoBadge = `<span class="product-badge product-badge--popular">Bán chạy</span>`;
        } else if (p.tier === 'Select') {
            promoBadge = `<span class="product-badge product-badge--recommended">Khuyên dùng</span>`;
        }

        const card = document.createElement('div');
        card.className = 'product-card bg-white rounded-2xl flex flex-col h-full relative group overflow-hidden cursor-pointer';
        card.onclick = (e) => {
            if (e.target.closest('button, input, label')) return; // Ignore if clicked on Add to Cart button
            openProductDetailModal(p.id);
        };

        card.innerHTML = `
            <div class="product-badges">
                <span class="product-badge product-badge--line">${p.line || p.brand}</span>
                <span class="product-badge ${tierColor}">${p.tier}</span>
                ${promoBadge}
            </div>
            
            <div class="product-card__media">
                <img src="${imgSrc}" alt="${p.name}" loading="lazy"
                     class="w-full h-full object-contain mix-blend-multiply transition-transform duration-300 ease-in-out group-hover:scale-105"
                     onerror="this.outerHTML='<div class=\\\'w-full h-full missing-image-placeholder text-center px-4 flex items-center justify-center text-xs text-gray-400 font-semibold\\\'>${p.brand}</div>'">
            </div>
            
            <div class="product-card__content">
                <div class="product-card__actives">${activesBadges}</div>
                <div class="flex-grow">
                    <h4 class="product-card__name">${p.name}</h4>
                </div>
                <div class="product-card__footer">
                    <div class="product-card__price-row">
                        <div class="product-card__prices">
                            <span class="product-card__price">${formatPrice(p.price)}</span>
                            ${p.originalPrice && p.originalPrice > p.price ? `<span class="product-card__original-price">${formatPrice(p.originalPrice)}</span>` : ''}
                        </div>
                        <span class="product-card__volume">${p.volume || ''}</span>
                    </div>
                    <button onclick="cartManager.addItem('${p.id}'); showToast('Đã thêm sản phẩm vào giỏ hàng!');" class="product-card__cart-button">
                        <i data-feather="shopping-bag" class="w-4 h-4"></i> Thêm vào giỏ
                    </button>
                </div>
            </div>
        `;

        const detailLink = document.createElement('button');
        detailLink.type = 'button';
        detailLink.className = 'product-card__title-link';
        detailLink.textContent = p.name;
        detailLink.onclick = () => openProductDetailModal(p.id);
        card.querySelector('.product-card__name').replaceChildren(detailLink);

        if (options.variant === 'horizontal') {
            card.classList.add('product-card--horizontal');
            card.querySelector('.product-badges').remove();
            card.querySelector('.product-card__cart-button').remove();
            const content = card.querySelector('.product-card__content');
            const step = document.createElement('div');
            step.className = 'product-card__step';
            const stepText = document.createElement('span');
            stepText.textContent = options.step;
            const match = document.createElement('span');
            match.className = 'product-card__match';
            match.textContent = 'Khớp ' + options.matchScore + '%';
            step.append(stepText, match);
            content.prepend(step);
            content.append(card.querySelector('.product-card__actives'));
            const actions = card.querySelector('.product-card__footer');
            actions.classList.add('product-card__selection');
            card.append(actions);
            const controls = document.createElement('div');
            controls.className = 'product-card__controls';
            const info = document.createElement('button');
            info.type = 'button';
            info.className = 'product-card__info';
            info.setAttribute('aria-label', 'Chi tiết ' + p.name);
            info.innerHTML = '<i data-feather="info"></i>';
            info.onclick = () => openProductDetailModal(p.id);
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.checked = !window.excludedRoutineIds?.has(p.id);
            checkbox.dataset.routineProduct = p.id;
            checkbox.setAttribute('aria-label', 'Chọn ' + p.name + ' vào giỏ');
            checkbox.onchange = () => {
                window.excludedRoutineIds ||= new Set();
                if (checkbox.checked) window.excludedRoutineIds.delete(p.id);
                else window.excludedRoutineIds.add(p.id);
                document.querySelectorAll('[data-routine-product]').forEach(input => {
                    if (input.dataset.routineProduct === p.id) input.checked = checkbox.checked;
                });
            };
            controls.append(info, checkbox);
            actions.append(controls);
        }
        return card;
}
