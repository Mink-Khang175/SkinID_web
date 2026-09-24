import { useEffect, useState, useRef } from 'react';
import { assetUrl } from '../../assets/index.js';

const ROUTINE_DATA = {
  'rilastil-525': {
    stepNum: '02',
    stepLabel: 'BƯỚC 02 · TINH CHẤT NGÔI SAO',
    headline: 'Tinh Chất Cấp Ẩm Chuyên Sâu Rilastil Aqua Intense Gel Serum',
    desc: 'Công thức chuẩn dược mỹ phẩm Ý với phức hợp Hyaluronic Acid đa tầng, kích hoạt khả năng ngậm nước tự nhiên và mang lại độ căng mọng 72 giờ.',
    roleTag: 'Star Product · Cấp Ẩm Đa Tầng',
    satelliteLabel: '02 · Điều trị',
  },
  'rilastil-1774': {
    stepNum: '01',
    stepLabel: 'BƯỚC 01 · LÀM SẠCH DỊU LÀNH',
    headline: 'Sữa Rửa Mặt Dưỡng Ẩm Rilastil Aqua Face Cleanser',
    desc: 'Làm sạch sâu từng lỗ chân lông mà vẫn bảo toàn lớp màng lipid sinh học, chuẩn bị nền da hoàn hảo đón nhận dưỡng chất.',
    roleTag: 'Khởi Đầu Dịu Nhẹ · Ceramide',
    satelliteLabel: '01 · Làm sạch',
  },
  'rilastil-2067': {
    stepNum: '03',
    stepLabel: 'BƯỚC 03 · KHÓA ẨM CHUYÊN SÂU',
    headline: 'Kem Cấp Ẩm Chuyên Sâu 72H Rilastil Aqua Intense Gel',
    desc: 'Màng ẩm nhung lụa tạo lớp khiên vô hình chống mất nước qua biểu bì, nuôi dưỡng tế bào da căng tràn sức sống.',
    roleTag: 'Khóa Ẩm 72H · Hydraboost',
    satelliteLabel: '03 · Khóa ẩm',
  },
  'rilastil-1857': {
    stepNum: '04',
    stepLabel: 'BƯỚC 04 · BẢO VỆ MỖI NGÀY',
    headline: 'Kem Chống Nắng Cấp Ẩm Rilastil Sun System Water Touch SPF 50+',
    desc: 'Kết cấu Water Touch mỏng nhẹ như làn sương, bảo vệ tối ưu trước tia UV và ánh sáng xanh, ngăn ngừa đốm nâu sớm.',
    roleTag: 'Phổ Rộng SPF 50+ · Kháng Tia Xanh',
    satelliteLabel: '04 · Bảo vệ',
  },
};

export default function FeaturedProducts() {
  const [products, setProducts] = useState([]);
  const [heroId, setHeroId] = useState('rilastil-525');
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);

  // Kích hoạt hiệu ứng Staggered Entrance Animation khi cuộn tới
  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const ids = ['rilastil-525', 'rilastil-1774', 'rilastil-2067', 'rilastil-1857'];
    const getCatalog = () => (Array.isArray(window.PRODUCTS) && window.PRODUCTS.length > 0)
      ? window.PRODUCTS
      : (Array.isArray(window.LOCAL_PRODUCTS) ? window.LOCAL_PRODUCTS : []);

    const update = () => {
      const cat = getCatalog();
      if (!cat.length) return;
      const list = ids
        .map(id => cat.find(product => product.id === id && product.image && product.price))
        .filter(Boolean);
      if (list.length > 0) {
        setProducts(list);
      }
    };

    update();
    const interval = setInterval(update, 200);
    document.addEventListener('skinid:ready', update);
    document.addEventListener('skinid:catalog-ready', update);
    return () => {
      clearInterval(interval);
      document.removeEventListener('skinid:ready', update);
      document.removeEventListener('skinid:catalog-ready', update);
    };
  }, []);

  const handleAddToCart = (e, productId) => {
    e.stopPropagation();
    if (typeof window.addToCart === 'function') {
      window.addToCart(productId);
    } else if (window.cartManager) {
      window.cartManager.addItem(productId, 1);
      if (typeof window.showToast === 'function') {
        window.showToast('Đã thêm sản phẩm vào giỏ hàng!');
      }
    }
  };

  const handleOpenDetail = (productId) => {
    if (typeof window.openProductDetailModal === 'function') {
      window.openProductDetailModal(productId);
    }
  };

  // Xác định sản phẩm Ngôi sao (Hero) và các sản phẩm vệ tinh (Satellites)
  const heroProduct = products.find(p => p.id === heroId) || products[0];
  const satelliteProducts = products.filter(p => p.id !== heroProduct?.id);
  const heroStory = heroProduct ? (ROUTINE_DATA[heroProduct.id] || {
    stepNum: '02',
    stepLabel: 'SẢN PHẨM NỔI BẬT',
    headline: heroProduct.name,
    desc: heroProduct.uses || 'Chăm sóc làn da dịu lành mỗi ngày.',
    roleTag: 'Dược Mỹ Phẩm Ý',
  }) : null;

  return (
    <section
      id="featured-products"
      ref={sectionRef}
      className={`section borderless-hero-showcase ${isVisible ? 'is-visible' : ''}`}
      aria-label="Sản phẩm nổi bật"
    >
      <div className="container relative z-10">
        <div className="borderless-showcase-grid">
          {/* ===============================================================
              CỘT TRÁI (40%): Cụm Typography
              =============================================================== */}
          <div className="borderless-typography-col">
            {/* Tagline nhỏ, font in hoa, tracking rộng */}
            <span className="hero-showcase-tagline hero-anim-item hero-anim-tagline">
              CLINICAL ROUTINE · STAR SELECTION
            </span>

            {/* Tiêu đề chính to, hiện đại */}
            <h2 className="hero-showcase-heading hero-anim-item hero-anim-heading">
              {heroStory?.headline || 'Tinh Chất Cấp Ẩm Chuyên Sâu Rilastil'}
            </h2>

            {/* Đoạn mô tả ngắn màu xám nhạt (#666666) */}
            <p className="hero-showcase-desc hero-anim-item hero-anim-desc">
              {heroStory?.desc || 'Bộ giải pháp phục hồi và cấp ẩm tầng sâu từ Dược mỹ phẩm Ý. Công thức chuẩn y khoa thẩm thấu tức thì, khóa ẩm 72 giờ và nuôi dưỡng hàng rào bảo vệ tự nhiên.'}
            </p>

            {/* Nhãn đặc tính sản phẩm */}
            <div className="hero-showcase-meta hero-anim-item hero-anim-desc">
              <span className="hero-meta-badge">{heroStory?.roleTag}</span>
              <span className="hero-meta-step">{heroStory?.stepLabel}</span>
            </div>

            {/* Call To Action: Nút bấm hình viên thuốc (Pill-shape), nền #E06D81 */}
            <div className="hero-showcase-actions hero-anim-item hero-anim-actions">
              {heroProduct && (
                <>
                  <button
                    type="button"
                    className="hero-pill-btn hero-pill-btn--primary"
                    onClick={(e) => handleAddToCart(e, heroProduct.id)}
                    aria-label={`Thêm ${heroProduct.name} vào giỏ hàng`}
                  >
                    <span>Thêm vào giỏ · {heroProduct.price?.toLocaleString('vi-VN')}₫</span>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width: '15px', height: '15px' }}>
                      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"></path>
                      <line x1="3" y1="6" x2="21" y2="6"></line>
                      <path d="M16 10a4 4 0 01-8 0"></path>
                    </svg>
                  </button>
                  <button
                    type="button"
                    className="hero-pill-btn hero-pill-btn--outline"
                    onClick={() => handleOpenDetail(heroProduct.id)}
                  >
                    <span>Chi tiết sản phẩm ↗</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* ===============================================================
              CỘT PHẢI (60%): Khu vực hiển thị sản phẩm tách nền (trong suốt)
              - Không có thẻ div nào bọc nền màu cứng.
              - Đặt trực tiếp ảnh PNG lên nền trắng.
              =============================================================== */}
          <div className="borderless-products-col hero-anim-item hero-anim-products">
            {products.length === 0 ? (
              <div className="borderless-loading">Đang tải sản phẩm nổi bật…</div>
            ) : (
              <div className="borderless-stage-layout">
                {/* 1. Sản phẩm lớn chính (Centerpiece Hero Product) */}
                {heroProduct && (
                  <div className="floating-hero-wrapper floating-anim-hero">
                    <button
                      type="button"
                      className="floating-hero-trigger"
                      onClick={() => handleOpenDetail(heroProduct.id)}
                      aria-label={`Xem chi tiết ${heroProduct.name}`}
                    >
                      <img
                        className="floating-hero-image"
                        src={assetUrl(heroProduct.image, heroProduct.brandSlug)}
                        alt={heroProduct.name}
                        loading="eager"
                      />
                    </button>
                    <div className="floating-hero-caption">
                      <span className="caption-glow-dot" aria-hidden="true"></span>
                      <span>{heroProduct.volume} · Đang xem tâm điểm</span>
                    </div>
                  </div>
                )}

                {/* 2. Cụm các sản phẩm bổ trợ lơ lửng xung quanh (Satellite Items) */}
                <div className="floating-satellites-group">
                  {satelliteProducts.map((sat, idx) => {
                    const satStory = ROUTINE_DATA[sat.id] || {
                      stepNum: `0${idx + 1}`,
                      satelliteLabel: `0${idx + 1} · Routine`,
                    };
                    const floatAnimClass = `floating-anim-sat-${idx + 1}`;

                    return (
                      <div
                        key={sat.id}
                        className={`floating-satellite-item ${floatAnimClass}`}
                        onClick={() => setHeroId(sat.id)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => { if (e.key === 'Enter') setHeroId(sat.id); }}
                        aria-label={`Chọn ${sat.name} làm tâm điểm`}
                      >
                        <div className="floating-satellite-visual">
                          <img
                            className="floating-satellite-image"
                            src={assetUrl(sat.image, sat.brandSlug)}
                            alt={sat.name}
                            loading="lazy"
                          />
                        </div>
                        <div className="floating-satellite-meta">
                          <span className="satellite-step-pill">{satStory.satelliteLabel}</span>
                          <span className="satellite-name-link">{window.productDisplayName?.(sat) || sat.name}</span>
                          <div className="satellite-bottom-row">
                            <span className="satellite-price">{sat.price?.toLocaleString('vi-VN')}₫</span>
                            <button
                              type="button"
                              className="satellite-add-btn"
                              aria-label={`Thêm ${sat.name} vào giỏ`}
                              onClick={(e) => handleAddToCart(e, sat.id)}
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
