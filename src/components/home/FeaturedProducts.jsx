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
  const [heroId, setHeroId] = useState('rilastil-1774');
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
    products.forEach((product) => {
      const image = new Image();
      image.src = assetUrl(product.image, product.brandSlug);
      image.decode?.().catch(() => {});
    });
  }, [products]);

  useEffect(() => {
    const ids = ['rilastil-1774', 'rilastil-525', 'rilastil-2067', 'rilastil-1857'];
    const getCatalog = () => (Array.isArray(window.PRODUCTS) && window.PRODUCTS.length > 0)
      ? window.PRODUCTS
      : (Array.isArray(window.LOCAL_PRODUCTS) ? window.LOCAL_PRODUCTS : []);

    let interval;
    const update = () => {
      const cat = getCatalog();
      if (!cat.length) return;
      const list = ids
        .map(id => cat.find(product => product.id === id && product.image && product.price))
        .filter(Boolean);
      if (list.length > 0) {
        setProducts(list);
        if (list.length === ids.length && interval) {
          clearInterval(interval);
          interval = undefined;
        }
      }
    };

    update();
    interval = setInterval(update, 200);
    document.addEventListener('skinid:ready', update);
    document.addEventListener('skinid:catalog-ready', update);
    return () => {
      if (interval) clearInterval(interval);
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
    document.dispatchEvent(new CustomEvent('skinid:open-product-detail', {
      detail: { productId },
    }));
  };

  const activateProduct = (productId) => {
    if (productId !== heroId) setHeroId(productId);
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
      <div className="container relative z-10 routine-home">
        <header className="routine-home__intro">
          <span className="hero-showcase-tagline" data-reveal data-reveal-delay="0">ROUTINE ĐƯỢC TUYỂN CHỌN</span>
          <div className="routine-home__intro-row">
            <h2 data-reveal data-reveal-delay="90">Chăm da theo nhịp.<br /><em>Nhẹ nhàng mà đúng.</em></h2>
            <p data-reveal data-reveal-delay="180">Một routine bốn bước rõ ràng, được sắp xếp để làn da nhận đúng điều mình cần vào đúng thời điểm.</p>
          </div>
        </header>

        {products.length === 0 ? (
          <div className="borderless-loading">Đang chuẩn bị routine dành cho bạn…</div>
        ) : (
          <div className="routine-stage">
            <div className="routine-stage__copy" aria-live="polite">
              <span className="routine-stage__step" data-reveal data-reveal-delay="0">
                <span key={`step-${heroProduct.id}`} className="routine-swap-text">{heroStory?.stepLabel}</span>
              </span>
              <h3 data-reveal data-reveal-delay="80">
                <span key={`headline-${heroProduct.id}`} className="routine-swap-text">{heroStory?.headline}</span>
              </h3>
              <p data-reveal data-reveal-delay="160">
                <span key={`desc-${heroProduct.id}`} className="routine-swap-text">{heroStory?.desc}</span>
              </p>
              <div className="hero-showcase-meta" data-reveal data-reveal-delay="240">
                <span key={`meta-${heroProduct.id}`} className="routine-swap-meta">
                  <span className="hero-meta-badge">{heroStory?.roleTag}</span>
                  <span className="routine-stage__volume">{heroProduct?.volume}</span>
                </span>
              </div>
              <div className="hero-showcase-actions" data-reveal data-reveal-delay="320">
                <button
                  type="button"
                  className="hero-pill-btn hero-pill-btn--primary"
                  onClick={(e) => handleAddToCart(e, heroProduct.id)}
                  aria-label={`Thêm ${heroProduct.name} vào giỏ hàng`}
                >
                  Thêm vào giỏ · {heroProduct.price?.toLocaleString('vi-VN')}₫
                </button>
                <button
                  type="button"
                  className="routine-text-link"
                  onClick={() => handleOpenDetail(heroProduct.id)}
                >
                  Xem chi tiết <span aria-hidden="true">↗</span>
                </button>
              </div>
            </div>

            <div className="routine-stage__product" data-reveal="soft-scale" data-reveal-delay="220">
              <span className="routine-orbit routine-orbit--one" aria-hidden="true"></span>
              <span className="routine-orbit routine-orbit--two" aria-hidden="true"></span>
              <div className="routine-product-stack">
                {products.map((product) => {
                  const isActive = product.id === heroProduct.id;
                  return (
                    <button
                      type="button"
                      className={`floating-hero-trigger routine-product-layer ${isActive ? 'is-active' : ''}`}
                      key={product.id}
                      onClick={() => handleOpenDetail(product.id)}
                      aria-label={`Xem chi tiết ${product.name}`}
                      aria-hidden={!isActive}
                      tabIndex={isActive ? 0 : -1}
                    >
                      <img
                        className="floating-hero-image"
                        src={assetUrl(product.image, product.brandSlug)}
                        alt={isActive ? product.name : ''}
                        loading="eager"
                        decoding="async"
                      />
                    </button>
                  );
                })}
              </div>
              <span className="routine-stage__focus-label"><i></i>Sản phẩm tâm điểm</span>
            </div>

            <div className="routine-step-rail" aria-label="Các bước trong routine">
              {products.map((product, idx) => {
                const story = ROUTINE_DATA[product.id] || { satelliteLabel: `0${idx + 1} · Routine` };
                const isActive = product.id === heroProduct.id;
                return (
                  <div
                    className={`routine-choice ${isActive ? 'is-active' : ''}`}
                    key={product.id}
                    data-reveal
                    data-reveal-delay={360 + idx * 70}
                    onMouseEnter={() => activateProduct(product.id)}
                    onFocusCapture={() => activateProduct(product.id)}
                  >
                    <button
                      type="button"
                      className="routine-step__select"
                      onClick={() => activateProduct(product.id)}
                      aria-pressed={isActive}
                      aria-label={`Chọn ${product.name} làm tâm điểm`}
                    >
                      <span className="routine-step__number">{story.stepNum || `0${idx + 1}`}</span>
                      <span className="routine-step__visual">
                        <img src={assetUrl(product.image, product.brandSlug)} alt="" loading="lazy" />
                      </span>
                      <span className="routine-step__meta">
                        <small>{story.satelliteLabel}</small>
                        <b>{window.productDisplayName?.(product) || product.name}</b>
                      </span>
                    </button>
                    <button
                      type="button"
                      className="routine-step__add"
                      aria-label={`Thêm ${product.name} vào giỏ`}
                      onClick={(e) => handleAddToCart(e, product.id)}
                    >+</button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
