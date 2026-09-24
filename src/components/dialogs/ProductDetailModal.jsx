import { useEffect } from 'react';

export default function ProductDetailModal() {
  useEffect(() => {
    const openModal = (productId) => {
      const catalog = (Array.isArray(window.PRODUCTS) && window.PRODUCTS.length > 0)
        ? window.PRODUCTS
        : (Array.isArray(window.LOCAL_PRODUCTS) ? window.LOCAL_PRODUCTS : []);
      const p = catalog.find(prod => prod.id === productId);
      if (!p) return;

      const modal = document.getElementById('product-detail-modal');
      if (!modal) return;

      const imgSrc = (p.image?.startsWith('http') || p.image?.startsWith('data:'))
        ? p.image
        : (window.SKINID_ASSET_URL ? window.SKINID_ASSET_URL(p.image, p.brandSlug) : p.image);

      const lineEl = document.getElementById('pmodal-line');
      if (lineEl) lineEl.innerText = p.line || p.brand || 'CHĂM SÓC DA';

      const titleEl = document.getElementById('pmodal-title');
      if (titleEl) titleEl.innerText = (typeof window.productDisplayName === 'function' ? window.productDisplayName(p) : p.name);

      const priceEl = document.getElementById('pmodal-price');
      if (priceEl) priceEl.innerText = Number(p.price).toLocaleString('vi-VN') + '₫';

      const origPriceEl = document.getElementById('pmodal-original-price');
      if (origPriceEl) {
        if (p.originalPrice && p.originalPrice > p.price) {
          origPriceEl.innerText = Number(p.originalPrice).toLocaleString('vi-VN') + '₫';
          origPriceEl.classList.remove('hidden');
        } else {
          origPriceEl.classList.add('hidden');
        }
      }

      const volEl = document.getElementById('pmodal-volume');
      if (volEl) volEl.innerText = p.volume || 'Tiêu chuẩn';

      const usesEl = document.getElementById('pmodal-uses');
      if (usesEl) usesEl.innerText = p.uses || p.description || 'Sản phẩm dược mỹ phẩm chuyên sâu chính hãng.';

      const usageEl = document.getElementById('pmodal-usage');
      if (usageEl) usageEl.innerText = p.usage || 'Sử dụng hàng ngày vào sáng và tối.';

      const activesContainer = document.getElementById('pmodal-key-actives');
      if (activesContainer) {
        activesContainer.innerHTML = '';
        if (p.keyActives && p.keyActives.length > 0) {
          p.keyActives.forEach(act => {
            const parts = act.split(':');
            const title = parts[0] ? parts[0].trim() : '';
            const desc = parts.slice(1).join(':').trim();
            const item = document.createElement('div');
            item.className = 'mb-2.5';
            item.innerHTML = `<span class="font-bold text-gray-900 text-xs sm:text-sm uppercase tracking-wide text-brand-dark">${title}:</span><span class="text-xs sm:text-sm text-gray-700 leading-relaxed"> ${desc}</span>`;
            activesContainer.appendChild(item);
          });
        } else {
          activesContainer.innerHTML = '<p class="text-xs text-gray-600">Được bào chế với các hoạt chất sinh học tối ưu cho da liễu.</p>';
        }
      }

      const fullIngEl = document.getElementById('pmodal-full-ingredients');
      if (fullIngEl) {
        fullIngEl.innerText = p.fullIngredients || 'Được kiểm nghiệm da liễu nghiêm ngặt tại Ý.';
      }

      const certEl = document.getElementById('pmodal-certification-text');
      if (certEl) {
        if (p.brand === 'TWON' || p.brand === 'D\'VAH') {
          certEl.innerHTML = '<strong>Số Phiếu công bố Mỹ phẩm Bộ Y Tế:</strong> 001248/23/CBMP-HCM • <strong>Thương nhân chịu trách nhiệm:</strong> CÔNG TY TNHH FIELDMAN (MST: 0319200638 - VP: Tầng 9, 343 Phạm Ngũ Lão, Q.1, TP.HCM).';
        } else {
          certEl.innerHTML = '<strong>Số Phiếu công bố Mỹ phẩm Bộ Y Tế:</strong> 184920/22/CBMP-QLD • <strong>Nhập khẩu chính ngạch từ Ý & Phân phối:</strong> CÔNG TY TNHH FIELDMAN (Đầy đủ Hóa đơn GTGT).';
        }
      }

      const imgEl = document.getElementById('pmodal-img');
      if (imgEl) {
        imgEl.src = imgSrc;
        imgEl.onerror = () => {
          if (p.originalImageUrl && imgEl.src !== p.originalImageUrl) {
            imgEl.src = p.originalImageUrl;
          }
        };
      }

      const addBtn = document.getElementById('pmodal-add-cart-btn');
      if (addBtn) {
        addBtn.onclick = () => {
          if (window.cartManager) {
            window.cartManager.addItem(p.id);
          }
          if (typeof window.showToast === 'function') {
            window.showToast('Đã thêm sản phẩm vào giỏ hàng!');
          }
          closeModal();
        };
      }

      modal.classList.remove('hidden');
      modal.classList.add('flex');
      modal.style.display = 'flex';
      requestAnimationFrame(() => {
        modal.classList.remove('opacity-0');
        modal.classList.add('opacity-100');
        const content = document.getElementById('product-detail-modal-content');
        if (content) {
          content.classList.remove('scale-95', 'opacity-0');
          content.classList.add('scale-100', 'opacity-100');
        }
        if (window.feather) window.feather.replace();
      });
      window.SkinIDScrollLock?.lock('product-detail');
    };

    const closeModal = () => {
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
        modal.style.display = 'none';
        window.SkinIDScrollLock?.unlock('product-detail');
      }, 250);
    };

    window.openProductDetailModal = openModal;
    window.closeProductDetailModal = closeModal;
  }, []);

  return (
    <>
      <div id="product-detail-modal" className="hidden opacity-0" onClick={(event) => { if (event.target === event.currentTarget) window.closeProductDetailModal?.(); }}>
        <div id="product-detail-modal-content" className="scale-95 opacity-0">
          <div className="pmodal-scroll">
            <button className="modal-close" type="button" onClick={() => window?.closeProductDetailModal?.()} aria-label="Đóng">
              <i data-feather="x"></i>
            </button>
            <div className="pmodal-head">
              <div className="pmodal-image">
                <img id="pmodal-img" alt="" />
              </div>
              <div>
                <span id="pmodal-line" className="modal-kicker"></span>
                <h2 id="pmodal-title"></h2>
                <div className="pmodal-price">
                  <span id="pmodal-price"></span>
                  <span id="pmodal-original-price" className="hidden"></span>
                </div>
                <p id="pmodal-uses"></p>
                <div className="spec">
                  <h4>Dung tích</h4>
                  <p id="pmodal-volume"></p>
                  <h4>Hướng dẫn sử dụng</h4>
                  <p id="pmodal-usage"></p>
                </div>
              </div>
            </div>
            <div className="spec">
              <h4>Thành phần nổi bật</h4>
              <div id="pmodal-key-actives"></div>
            </div>
            <section className="spec">
              <h4>Danh sách thành phần đầy đủ</h4>
              <p id="pmodal-full-ingredients"></p>
            </section>
            <div className="spec">
              <h4>Thông tin sản phẩm & Chứng nhận pháp lý</h4>
              <p id="pmodal-certification-text"></p>
            </div>
          </div>
          <div className="pmodal-actions">
            <button className="btn btn--outline" type="button" onClick={() => window?.closeProductDetailModal?.()}>Tiếp tục xem</button>
            <button id="pmodal-add-cart-btn" className="btn btn--primary" type="button">
              <i data-feather="shopping-bag"></i> Thêm vào giỏ
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
