import { useEffect, useMemo, useState, useRef } from 'react';
import { assetUrl } from '../../assets/index.js';
import { useCart } from '../../features/cart/index.js';
import { useCatalog } from '../../features/catalog/index.js';
import { FEATURED_PRODUCT_IDS } from '../../features/catalog/featuredProducts.js';
import useMotionAwareVisibility from '../../hooks/useMotionAwareVisibility.js';

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

const ROUTINE_STEPS = [
  { id: 'cleanser', number: '01', shortLabel: 'Làm sạch', title: 'Làm sạch dịu lành' },
  { id: 'treatment', number: '02', shortLabel: 'Điều trị', title: 'Tinh chất & đặc trị' },
  { id: 'moisturizer', number: '03', shortLabel: 'Khóa ẩm', title: 'Dưỡng ẩm chuyên sâu' },
  { id: 'sunscreen', number: '04', shortLabel: 'Bảo vệ', title: 'Chống nắng mỗi ngày' },
];

function formatProductHeadline(raw) {
  if (!raw || typeof raw !== 'string') return { title: raw || '', subtitle: null };

  // 1. If separated by dash: "Công dụng – Thương hiệu & Dòng sản phẩm"
  const dashMatch = raw.split(/\s+[–—―-]\s+/);
  if (dashMatch.length === 2) {
    const [p1, p2] = dashMatch;
    const brandRegex = /\b(rilastil|twon|d'vah|dvah)\b/i;
    if (brandRegex.test(p2) && !brandRegex.test(p1)) {
      return { title: p2.trim(), subtitle: p1.trim() };
    }
    if (brandRegex.test(p1)) {
      return { title: p1.trim(), subtitle: p2.trim() };
    }
    return { title: p2.trim(), subtitle: p1.trim() };
  }

  // 2. If contains brand name without dash: "Tinh Chất Cấp Ẩm Chuyên Sâu Rilastil Aqua..."
  const brandIndex = raw.search(/\b(Rilastil|TWON|D’VAH|D'VAH)\b/i);
  if (brandIndex > 0) {
    const funcPart = raw.slice(0, brandIndex).trim();
    const brandPart = raw.slice(brandIndex).trim();
    if (funcPart && brandPart) {
      return { title: brandPart, subtitle: funcPart };
    }
  }

  return { title: raw, subtitle: null };
}

const FEATURED_PRIORITY = new Map(FEATURED_PRODUCT_IDS.map((id, index) => [id, index]));

export default function FeaturedProducts() {
  const { products: catalog } = useCatalog();
  const [heroId, setHeroId] = useState('rilastil-1774');
  const [activeStepId, setActiveStepId] = useState('cleanser');
  const [isOrbitPaused, setIsOrbitPaused] = useState(false);
  const sectionRef = useRef(null);
  const isVisible = useMotionAwareVisibility(sectionRef);

  const productsByStep = useMemo(() => Object.fromEntries(ROUTINE_STEPS.map((step) => {
    const products = catalog
      .filter(product => product.brandSlug === 'rilastil' && product.stepType === step.id && product.image && product.price)
      .sort((a, b) => {
        const aPriority = FEATURED_PRIORITY.has(a.id) ? FEATURED_PRIORITY.get(a.id) : 99;
        const bPriority = FEATURED_PRIORITY.has(b.id) ? FEATURED_PRIORITY.get(b.id) : 99;
        return aPriority - bPriority;
      })
      .slice(0, 4);
    return [step.id, products];
  })), [catalog]);

  const featuredProducts = useMemo(
    () => ROUTINE_STEPS.flatMap(step => productsByStep[step.id] || []),
    [productsByStep]
  );
  const activeStep = ROUTINE_STEPS.find(step => step.id === activeStepId) || ROUTINE_STEPS[0];
  const activeStepProducts = productsByStep[activeStep.id] || [];

  useEffect(() => {
    if (!isVisible) return;
    activeStepProducts.forEach((product) => {
      const image = new Image();
      image.src = assetUrl(product.image, product.brandSlug);
      image.decode?.().catch(() => {});
    });
  }, [activeStepProducts, isVisible]);

  const { addToCart } = useCart();

  // Ref to the arc container for triggering the rotation animation
  const arcRef = useRef(null);
  const prevHeroIdRef = useRef(heroId);
  useEffect(() => {
    if (prevHeroIdRef.current === heroId) return;
    prevHeroIdRef.current = heroId;
    const arc = arcRef.current;
    if (!arc) return;
    arc.classList.add('is-rotating');
    const timer = window.setTimeout(() => arc.classList.remove('is-rotating'), 600);
    return () => window.clearTimeout(timer);
  }, [heroId]);

  const handleAddToCart = (e, productId) => {
    e.stopPropagation();
    addToCart(productId);
  };

  const handleOpenDetail = (productId) => {
    document.dispatchEvent(new CustomEvent('skinid:open-product-detail', {
      detail: { productId },
    }));
  };

  const activateProduct = (productId) => {
    const product = featuredProducts.find(item => item.id === productId);
    if (product?.stepType) setActiveStepId(product.stepType);
    if (productId !== heroId) setHeroId(productId);
  };

  const activateStep = (stepId) => {
    setActiveStepId(stepId);
    const firstProduct = productsByStep[stepId]?.[0];
    if (firstProduct && firstProduct.id !== heroId) setHeroId(firstProduct.id);
  };

  useEffect(() => {
    if (!isVisible || isOrbitPaused || activeStepProducts.length < 2) return undefined;

    const timer = window.setInterval(() => {
      setHeroId((currentId) => {
        const currentIndex = activeStepProducts.findIndex(product => product.id === currentId);
        return activeStepProducts[(currentIndex + 1 + activeStepProducts.length) % activeStepProducts.length].id;
      });
    }, 3600);

    return () => window.clearInterval(timer);
  }, [activeStepProducts, isOrbitPaused, isVisible]);

  // Xác định sản phẩm Ngôi sao (Hero) và các sản phẩm vệ tinh (Satellites)
  const heroProduct = featuredProducts.find(p => p.id === heroId) || featuredProducts[0];
  const heroStep = ROUTINE_STEPS.find(step => step.id === heroProduct?.stepType) || activeStep;
  const heroStory = heroProduct ? (ROUTINE_DATA[heroProduct.id] || {
    stepNum: heroStep.number,
    stepLabel: `BƯỚC ${heroStep.number} · ${heroStep.title.toUpperCase()}`,
    headline: window.productDisplayName?.(heroProduct) || heroProduct.name,
    desc: heroProduct.uses || 'Chăm sóc làn da dịu lành mỗi ngày.',
    roleTag: [heroProduct.line, heroProduct.tier].filter(Boolean).join(' · ') || 'Dược Mỹ Phẩm Ý',
    satelliteLabel: `${heroStep.number} · ${heroStep.shortLabel}`,
  }) : null;
  const formattedHeadline = formatProductHeadline(heroStory?.headline);

  return (
    <section
      id="featured-products"
      ref={sectionRef}
      className={`section home-anchor-scene borderless-hero-showcase ${isVisible ? 'is-visible' : ''}`}
      aria-label="Sản phẩm nổi bật"
    >
      <div className="container relative z-10 routine-home">
        <header className="routine-home__intro">
          <span className="hero-showcase-tagline skinid-editorial-kicker" data-reveal data-reveal-delay="0">ROUTINE ĐƯỢC TUYỂN CHỌN</span>
          <div className="routine-home__intro-row">
            <h2 className="skinid-editorial-title skinid-editorial-title--routine" data-reveal data-reveal-delay="90">Chăm da theo nhịp. <em>Nhẹ nhàng mà đúng.</em></h2>
            <p data-reveal data-reveal-delay="180">Một routine bốn bước rõ ràng, được sắp xếp để làn da nhận đúng điều mình cần vào đúng thời điểm.</p>
          </div>
        </header>

        {featuredProducts.length === 0 ? (
          <div className="borderless-loading">Đang chuẩn bị routine dành cho bạn…</div>
        ) : (
          <>
            <div className="routine-step-nav" role="tablist" aria-label="Chọn bước chăm sóc">
              {ROUTINE_STEPS.map((step) => (
                <button
                  type="button"
                  role="tab"
                  aria-selected={step.id === activeStep.id}
                  className={`routine-step-nav__item ${step.id === activeStep.id ? 'is-active' : ''}`}
                  key={step.id}
                  onMouseEnter={() => activateStep(step.id)}
                  onFocus={() => activateStep(step.id)}
                  onClick={() => activateStep(step.id)}
                >
                  <small>{step.number}</small>
                  <span><b>{step.shortLabel}</b><em>{step.title}</em></span>
                </button>
              ))}
            </div>

            <div className="routine-stage routine-stage--focused">
            <div className="routine-stage__copy" aria-live="polite">
              <span className="routine-stage__step" data-reveal data-reveal-delay="0">
                <span key={`step-${heroProduct.id}`} className="routine-swap-text">{heroStory?.stepLabel}</span>
              </span>
              <h3 data-reveal data-reveal-delay="80">
                <span key={`headline-${heroProduct.id}`} className="routine-swap-text">
                  {formattedHeadline.subtitle ? (
                    <span className="routine-headline-wrap">
                      <span className="routine-headline__title">{formattedHeadline.title}</span>
                      <span className="routine-headline__subtitle">{formattedHeadline.subtitle}</span>
                    </span>
                  ) : (
                    formattedHeadline.title
                  )}
                </span>
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
              <div className="routine-product-stack">
                {featuredProducts.map((product) => {
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
                        src={isActive ? assetUrl(product.image, product.brandSlug) : undefined}
                        alt={isActive ? product.name : ''}
                        loading={isActive && isVisible ? 'eager' : 'lazy'}
                        decoding="async"
                      />
                    </button>
                  );
                })}
              </div>
              <span className="routine-stage__focus-label"><i></i>Sản phẩm tâm điểm</span>
              <div
                ref={arcRef}
                className="routine-product-arc"
                aria-label={`Các sản phẩm tiếp theo trong bước ${activeStep.title}`}
                onMouseEnter={() => setIsOrbitPaused(true)}
                onMouseLeave={() => setIsOrbitPaused(false)}
                onFocusCapture={() => setIsOrbitPaused(true)}
                onBlurCapture={(event) => {
                  if (!event.currentTarget.contains(event.relatedTarget)) {
                    setIsOrbitPaused(false);
                  }
                }}
              >
                <svg
                  className="routine-product-arc__stroke"
                  viewBox="0 0 240 360"
                  preserveAspectRatio="none"
                  aria-hidden="true"
                  focusable="false"
                >
                  <defs>
                    <linearGradient id={`routine-arc-${activeStep.id}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0" stopColor="#e06d81" stopOpacity="0" />
                      <stop offset="0.22" stopColor="#e06d81" stopOpacity="0.28" />
                      <stop offset="0.5" stopColor="#76b9dc" stopOpacity="0.34" />
                      <stop offset="0.78" stopColor="#e06d81" stopOpacity="0.28" />
                      <stop offset="1" stopColor="#e06d81" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M 88 6 C 250 70 250 290 88 354"
                    fill="none"
                    stroke={`url(#routine-arc-${activeStep.id})`}
                    strokeWidth="1.25"
                    strokeLinecap="round"
                    vectorEffect="non-scaling-stroke"
                  />
                </svg>
                {activeStepProducts.filter(product => product.id !== heroProduct?.id).map((product, index) => (
                  <button
                    type="button"
                    className="routine-product-arc__item"
                    key={product.id}
                    onMouseEnter={() => activateProduct(product.id)}
                    onFocus={() => activateProduct(product.id)}
                    onClick={() => activateProduct(product.id)}
                    aria-pressed="false"
                    aria-label={`Hiển thị ${product.name}`}
                    title={window.productDisplayName?.(product) || product.name}
                    style={{ '--arc-index': index }}
                  >
                    <img src={assetUrl(product.image, product.brandSlug)} alt="" loading="lazy" />
                  </button>
                ))}
              </div>
            </div>
          </div>
          </>
        )}
      </div>
    </section>
  );
}
