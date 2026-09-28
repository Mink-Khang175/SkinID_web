import { useCallback, useEffect, useRef, useState } from 'react';
import { assetUrl } from '../../assets/index.js';
import { useBodyScrollLock } from '../../shared/hooks/useBodyScrollLock.js';
import { useCart } from '../cart/index.js';
import { formatPrice, getProductById, productDisplayName } from './index.js';

function CloseIcon() {
  return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 6 12 12M18 6 6 18" /></svg>;
}

function ShoppingBagIcon() {
  return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 8h12l1 12H5L6 8Z" /><path d="M9 9V6a3 3 0 0 1 6 0v3" /></svg>;
}

function ProductSpecsTable({ product }) {
  const rilastil = product.brand === 'Rilastil';
  const number = product.notificationNumber || (rilastil ? '184920/22/CBMP-QLD' : 'Đang cập nhật');
  const origin = product.origin || (rilastil ? 'Ý (Italy)' : 'Việt Nam');
  const manufacturer = rilastil ? 'Istituto Ganassini S.p.A (Milano, Ý)' : 'Công ty Cổ phần Dược Mỹ Phẩm TWON';
  const distributor = 'CÔNG TY TNHH FIELDMAN (MST: 0319200638)';

  const specs = [
    { label: 'Thương hiệu', value: product.brand || 'Rilastil' },
    { label: 'Dòng sản phẩm', value: product.line ? `${product.brand} ${product.line}` : (product.category || 'Dược mỹ phẩm') },
    { label: 'Xuất xứ thương hiệu', value: origin },
    { label: 'Nhà sản xuất', value: manufacturer },
    { label: 'Thương nhân phân phối', value: distributor },
    { label: 'Dung tích / Quy cách', value: product.volume || 'Tiêu chuẩn' },
    { label: 'Số CBMP tiếp nhận', value: <span className="font-mono text-xs font-bold text-gray-700 bg-gray-100 px-2 py-0.5 rounded border border-gray-200">{number}</span> },
    { label: 'Hạn sử dụng', value: product.expiry || '36 tháng kể từ NSX và 8–12 tháng sau khi mở nắp' },
  ];

  return (
    <div className="space-y-4">
      <div className="border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-2xs">
        <table className="w-full text-xs">
          <tbody>
            {specs.map((spec, i) => (
              <tr key={spec.label} className={i % 2 === 0 ? 'bg-gray-50/70' : 'bg-white'}>
                <td className="py-2.5 px-4 font-bold text-gray-600 w-2/5 border-b border-gray-100">{spec.label}</td>
                <td className="py-2.5 px-4 text-gray-800 font-medium border-b border-gray-100">{spec.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-gradient-to-r from-rose-50/60 to-pink-50/40 border border-rose-100 rounded-2xl p-4 flex items-start gap-3">
        <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center flex-shrink-0 text-sm">
          🛡️
        </div>
        <div className="text-xs space-y-1">
          <strong className="text-gray-900 block font-bold">Cam kết nguồn gốc chính hãng &amp; Đầy đủ tem phụ</strong>
          <p className="text-gray-600 leading-relaxed">
            Sản phẩm được nhập khẩu chính ngạch 100%, có nhãn phụ tiếng Việt hợp quy và hóa đơn giá trị gia tăng (VAT) theo quy định hiện hành của cơ quan quản lý.
          </p>
        </div>
      </div>
    </div>
  );
}

function BenefitsPanel({ product, uses }) {
  return (
    <div className="space-y-4">
      <div>
        <h5 className="font-bold text-gray-900 text-xs uppercase tracking-wider mb-2 text-brand-dark">Mô Tả &amp; Hiệu Quả Sản Phẩm</h5>
        <div className="text-xs sm:text-sm text-gray-700 leading-relaxed bg-white p-4 rounded-2xl border border-gray-100 shadow-2xs">
          {uses}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <div className="bg-[#FFF9F6] border border-[#FFE8DC] p-4 rounded-2xl">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-6 h-6 rounded-lg bg-[#FFE0D0] text-[#C45E28] flex items-center justify-center text-xs">📖</span>
            <strong className="text-xs font-bold text-[#C45E28] uppercase tracking-wide">Hướng Dẫn Sử Dụng</strong>
          </div>
          <p className="text-xs text-gray-700 leading-relaxed">{product.usage || 'Sử dụng 1-2 lần mỗi ngày vào buổi sáng và tối sau bước làm sạch.'}</p>
        </div>

        <div className="bg-[#FDF8FB] border border-[#F4DEE7] p-4 rounded-2xl">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-6 h-6 rounded-lg bg-[#F8E1ED] text-[#8B3D59] flex items-center justify-center text-xs">⏳</span>
            <strong className="text-xs font-bold text-[#8B3D59] uppercase tracking-wide">Hạn Dùng &amp; Bảo Quản</strong>
          </div>
          <p className="text-xs text-gray-700 leading-relaxed">{product.expiry || '36 tháng kể từ NSX và 8-12 tháng sau khi mở nắp. Bảo quản nơi khô thoáng, tránh ánh sáng trực tiếp.'}</p>
        </div>
      </div>
    </div>
  );
}

function IngredientsPanel({ product }) {
  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-gray-100">
          <h5 className="font-bold text-gray-900 text-xs uppercase tracking-wider text-brand-dark">Hoạt Chất Sinh Học Nổi Bật</h5>
          <span className="text-[11px] font-semibold text-gray-400">{product.keyActives?.length || 0} hoạt chất</span>
        </div>
        <div className="space-y-2.5">
          {product.keyActives?.length ? product.keyActives.map((active, idx) => {
            const [title, ...description] = active.split(':');
            const descText = description.join(':').trim();
            return (
              <div key={idx} className="bg-gradient-to-r from-gray-50/80 via-white to-gray-50/40 p-3.5 rounded-2xl border border-gray-100 hover:border-brand-petal transition-all">
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-2 h-2 rounded-full bg-brand-primary flex-shrink-0"></span>
                  <strong className="text-xs font-bold text-brand-dark tracking-wide uppercase">{title || 'Hoạt chất'}</strong>
                </div>
                {descText && <p className="text-xs text-gray-600 pl-4 leading-relaxed">{descText}</p>}
              </div>
            );
          }) : (
            <p className="text-xs text-gray-500 italic p-3 bg-gray-50 rounded-xl">Được bào chế với công thức tối ưu cho độ dung nạp của làn da.</p>
          )}
        </div>
      </div>

      <div className="pt-2">
        <h5 className="font-bold text-gray-900 text-xs uppercase tracking-wider mb-2 text-brand-dark">Danh Sách Thành Phần Đầy Đủ (Full INCI)</h5>
        <div className="p-3.5 bg-gray-50/90 rounded-2xl border border-gray-100 text-[11px] text-gray-500 leading-relaxed font-mono max-h-36 overflow-y-auto">
          {product.fullIngredients || 'Được kiểm nghiệm da liễu nghiêm ngặt tại phòng thí nghiệm Ý.'}
        </div>
      </div>
    </div>
  );
}

export default function ProductDetailModal() {
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [open, setOpen] = useState(false);
  const [fallbackImage, setFallbackImage] = useState(false);
  const [activeTab, setActiveTab] = useState('benefits');
  const [added, setAdded] = useState(false);
  const closeTimer = useRef(null);
  useBodyScrollLock(open, 'product-detail');

  const closeModal = useCallback(() => {
    window.closeLicenseModal?.();
    setOpen(false);
    clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => {
      setProduct(null);
      setActiveTab('benefits');
      setAdded(false);
    }, 250);
  }, []);

  const openModal = useCallback(productId => {
    const selected = getProductById(productId);
    if (!selected) return;
    clearTimeout(closeTimer.current);
    setFallbackImage(false);
    setProduct(selected);
    setActiveTab('benefits');
    setAdded(false);
    requestAnimationFrame(() => setOpen(true));
  }, []);

  useEffect(() => {
    window.openProductDetailModal = openModal;
    window.closeProductDetailModal = closeModal;
    const handleOpen = event => openModal(event.detail?.productId);
    const handleKey = event => { if (event.key === 'Escape') closeModal(); };
    document.addEventListener('skinid:open-product-detail', handleOpen);
    document.addEventListener('keydown', handleKey);
    return () => {
      clearTimeout(closeTimer.current);
      document.removeEventListener('skinid:open-product-detail', handleOpen);
      document.removeEventListener('keydown', handleKey);
      if (window.openProductDetailModal === openModal) delete window.openProductDetailModal;
      if (window.closeProductDetailModal === closeModal) delete window.closeProductDetailModal;
    };
  }, [closeModal, openModal]);

  if (!product) return null;
  const discounted = product.originalPrice && product.originalPrice > product.price;
  const discount = discounted ? Math.round((1 - product.price / product.originalPrice) * 100) : 0;
  const rawUses = product.uses || product.description || 'Sản phẩm dược mỹ phẩm chuyên sâu chính hãng.';
  const uses = typeof rawUses === 'string' ? rawUses.replace(/[_─—–-]{3,}[\s\S]*/g, '').trim() || rawUses : rawUses;
  const image = fallbackImage ? product.originalImageUrl : assetUrl(product.image, product.brandSlug);

  const handleAddToCart = () => {
    addToCart(product.id, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  return (
    <div id="product-detail-modal" role="dialog" aria-modal="true" aria-labelledby="pmodal-title" className={`flex ${open ? 'opacity-100' : 'opacity-0'}`} onClick={event => { if (event.target === event.currentTarget) closeModal(); }}>
      <div id="product-detail-modal-content" className={open ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}>
        <div className="pmodal-scroll">
          <button className="modal-close" type="button" onClick={closeModal} aria-label="Đóng"><CloseIcon /></button>
          
          {/* TOP SECTION: HERO & QUICK INFO */}
          <div className="pmodal-head">
            <div className="pmodal-image relative group">
              <img src={image} alt={product.name} onError={() => { if (!fallbackImage && product.originalImageUrl) setFallbackImage(true); }} />
              <span className="absolute top-3 left-3 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-bold text-emerald-700 border border-emerald-200/80 shadow-xs flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                100% Chính Hãng
              </span>
              {product.volume && (
                <span className="absolute bottom-3 right-3 bg-gray-900/80 backdrop-blur-md text-white px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide">
                  {product.volume}
                </span>
              )}
            </div>

            <div className="space-y-3 min-w-0">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  <span className="text-[11px] font-black tracking-wider uppercase text-brand-primary bg-brand-blush px-2.5 py-0.5 rounded-full border border-brand-petal">
                    {product.brand || 'Rilastil'} {product.line ? `· ${product.line}` : ''}
                  </span>
                  {product.benefitName && (
                    <span className="text-[11px] font-semibold text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full">
                      {product.benefitName}
                    </span>
                  )}
                </div>
                <h2 id="pmodal-title" className="text-lg sm:text-xl font-black text-gray-900 leading-snug">
                  {productDisplayName(product)}
                </h2>
              </div>

              <div className="pmodal-price !my-1 flex items-baseline gap-2.5">
                <span className="text-xl sm:text-2xl font-black text-brand-dark">{formatPrice(product.price)}</span>
                {discounted && <span id="pmodal-original-price" className="text-sm text-gray-400 line-through">{formatPrice(product.originalPrice)}</span>}
                {discounted && <span className="pmodal-discount-tag text-xs font-bold text-rose-600 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-lg">-{discount}%</span>}
              </div>

              {/* Quick Specs Grid */}
              <div className="grid grid-cols-2 gap-2 py-1">
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-gray-50/80 border border-gray-100 text-xs">
                  <span className="text-gray-400">🧴 Dung tích:</span>
                  <strong className="text-gray-800 font-bold truncate">{product.volume || 'Tiêu chuẩn'}</strong>
                </div>
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-gray-50/80 border border-gray-100 text-xs">
                  <span className="text-gray-400">🌍 Xuất xứ:</span>
                  <strong className="text-gray-800 font-bold truncate">{product.origin || 'Ý (Italy)'}</strong>
                </div>
              </div>

              {/* Short summary */}
              <p className="text-xs text-gray-600 leading-relaxed line-clamp-2">
                {uses}
              </p>

              {/* Trust Badges */}
              <div className="pt-2 border-t border-gray-100 flex flex-wrap items-center gap-y-1.5 gap-x-3 text-[11px] text-gray-500 font-medium">
                <span className="flex items-center gap-1 text-emerald-700">✓ Nhập khẩu chính ngạch</span>
                <span className="flex items-center gap-1 text-emerald-700">✓ Đầy đủ tem phụ &amp; VAT</span>
                <span className="flex items-center gap-1 text-emerald-700">✓ Kiểm nghiệm da liễu</span>
              </div>
            </div>
          </div>

          {/* LOWER SECTION: ORGANIZED TABS */}
          <div className="mt-6 border-b border-gray-200 flex items-center gap-2 sm:gap-4 overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveTab('benefits')}
              className={`pb-3 px-1 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'benefits'
                  ? 'border-brand-primary text-brand-dark font-black'
                  : 'border-transparent text-gray-400 hover:text-gray-700'
              }`}
            >
              <span>📋 Công Dụng &amp; Cách Dùng</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('ingredients')}
              className={`pb-3 px-1 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'ingredients'
                  ? 'border-brand-primary text-brand-dark font-black'
                  : 'border-transparent text-gray-400 hover:text-gray-700'
              }`}
            >
              <span>🧪 Thành Phần &amp; Hoạt Chất</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('specs')}
              className={`pb-3 px-1 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'specs'
                  ? 'border-brand-primary text-brand-dark font-black'
                  : 'border-transparent text-gray-400 hover:text-gray-700'
              }`}
            >
              <span>🏷️ Thông Số &amp; Xuất Xứ</span>
            </button>
          </div>

          {/* TAB PANELS */}
          <div className="pt-4 pb-2">
            {activeTab === 'benefits' && <BenefitsPanel product={product} uses={uses} />}
            {activeTab === 'ingredients' && <IngredientsPanel product={product} />}
            {activeTab === 'specs' && <ProductSpecsTable product={product} />}
          </div>
        </div>

        {/* STICKY FOOTER ACTIONS */}
        <div className="pmodal-actions">
          <button className="btn btn--outline" type="button" onClick={closeModal}>Tiếp tục xem</button>
          <button
            className="btn btn--primary !inline-flex !items-center !gap-2 cursor-pointer"
            type="button"
            onClick={handleAddToCart}
          >
            <ShoppingBagIcon />
            <span>{added ? '✓ Đã thêm vào giỏ!' : 'Thêm vào giỏ'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
