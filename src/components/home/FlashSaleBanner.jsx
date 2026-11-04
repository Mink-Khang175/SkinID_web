import { useEffect, useRef, useState } from 'react';
import { formatPrice } from '../../features/catalog/index.js';
import { CURATED_COMBOS, RETAIL_50_DEALS, CAMPAIGN_STEPS } from '../../data/promotions.js';
import { assetUrl } from '../../assets/index.js';

const PROMO_URL = '/khuyen-mai';
const TICKER = ['LIKE & SHARE', 'SĂN DEAL GIẢM 50%', 'TWON', "D'VAH", 'SẢN PHẨM CHÍNH HÃNG', 'YÊU THƯƠNG BẢN THÂN'];

const prefersReducedMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/** Counts up to `to` once the element scrolls into view. */
function CountUp({ to }) {
  const ref = useRef(null);
  const [value, setValue] = useState(to);
  useEffect(() => {
    const node = ref.current;
    if (!node || prefersReducedMotion() || typeof IntersectionObserver === 'undefined') return undefined;
    let frame = 0;
    setValue(0);
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      const start = performance.now();
      const tick = (now) => {
        const progress = Math.min(1, (now - start) / 1300);
        setValue(Math.round(to * (1 - Math.pow(1 - progress, 3))));
        if (progress < 1) frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    }, { threshold: 0.4 });
    observer.observe(node);
    return () => { observer.disconnect(); cancelAnimationFrame(frame); };
  }, [to]);
  return <span ref={ref}>{value}</span>;
}

/** Pointer-driven 3D tilt + light spot; writes CSS variables only, no re-render. */
function usePointerSpotlight({ tilt = 7 } = {}) {
  const onPointerMove = (event) => {
    if (event.pointerType === 'touch' || prefersReducedMotion()) return;
    const el = event.currentTarget;
    const rect = el.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;
    el.style.setProperty('--mx', `${(x * 100).toFixed(1)}%`);
    el.style.setProperty('--my', `${(y * 100).toFixed(1)}%`);
    el.style.setProperty('--ry', `${((x - 0.5) * tilt * 2).toFixed(2)}deg`);
    el.style.setProperty('--rx', `${((0.5 - y) * tilt * 2).toFixed(2)}deg`);
  };
  const onPointerLeave = (event) => {
    const el = event.currentTarget;
    el.style.setProperty('--rx', '0deg');
    el.style.setProperty('--ry', '0deg');
  };
  return { onPointerMove, onPointerLeave };
}

/** CTA that leans slightly toward the cursor. */
function MagneticLink({ className, href, children }) {
  const onPointerMove = (event) => {
    if (event.pointerType === 'touch' || prefersReducedMotion()) return;
    const el = event.currentTarget;
    const rect = el.getBoundingClientRect();
    el.style.setProperty('--tx', `${((event.clientX - rect.left) / rect.width - 0.5) * 12}px`);
    el.style.setProperty('--ty', `${((event.clientY - rect.top) / rect.height - 0.5) * 10 - 3}px`);
  };
  const onPointerLeave = (event) => {
    event.currentTarget.style.setProperty('--tx', '0px');
    event.currentTarget.style.setProperty('--ty', '0px');
  };
  return <a className={className} href={href} onPointerMove={onPointerMove} onPointerLeave={onPointerLeave}>{children}</a>;
}

function ComboCard({ combo, index }) {
  const spotlight = usePointerSpotlight({ tilt: 6 });
  return (
    <a
      className="promo-combo"
      href={PROMO_URL}
      data-reveal="soft-scale"
      data-reveal-delay={index * 110}
      aria-label={`${combo.title} — ${formatPrice(combo.price)}, xem toàn bộ chương trình`}
      {...spotlight}
    >
      <span className="promo-combo__glare" aria-hidden="true" />
      <span className="promo-combo__visual">
        <img src={assetUrl(combo.image)} alt={`Bộ quà ${combo.title}`} loading="lazy" />
        <span className="promo-combo__number">0{index + 1}</span>
        <span className="promo-combo__saving">Tiết kiệm {combo.discountPercent}%</span>
      </span>
      <span className="promo-combo__body">
        <span className="promo-eyebrow">{combo.subtitle}</span>
        <strong className="promo-combo__title">{combo.title}</strong>
        <span className="promo-combo__slogan">{combo.slogan}</span>
        <span className="promo-combo__thumbs" aria-hidden="true">
          {combo.products.map((product) => (
            <span key={product.id}><img src={assetUrl(product.image, product.brandSlug)} alt="" loading="lazy" /></span>
          ))}
        </span>
        <span className="promo-combo__foot">
          <span className="promo-price"><b>{formatPrice(combo.price)}</b><del>{formatPrice(combo.originalPrice)}</del></span>
          <span className="promo-combo__go" aria-hidden="true">→</span>
        </span>
      </span>
    </a>
  );
}

/** Combo stack: selection is explicit (tabs, click, auto-rotate), never driven by hover, so crossing overlaps can't flip cards. */
const FAN_ORDER = [1, 0, 2];

function ComboFan() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (paused || prefersReducedMotion()) return undefined;
    const timer = window.setInterval(() => setActive((current) => (current + 1) % FAN_ORDER.length), 4500);
    return () => window.clearInterval(timer);
  }, [paused]);
  const select = (index) => { setActive(index); setPaused(true); };
  return (
    <div className="promo-fan-wrap" onPointerEnter={() => setPaused(true)} onPointerLeave={() => setPaused(false)} onFocus={() => setPaused(true)} onBlur={() => setPaused(false)}>
      <div className="promo-fan">
        {FAN_ORDER.map((comboIndex, index) => {
          const combo = CURATED_COMBOS[comboIndex];
          const pos = (index - active + FAN_ORDER.length) % FAN_ORDER.length;
          return (
            <a
              key={combo.id}
              className="promo-fan__card"
              data-pos={pos}
              href={PROMO_URL}
              aria-label={`${combo.title} — ${formatPrice(combo.price)}`}
              tabIndex={pos === 0 ? 0 : -1}
              onClick={(event) => { if (pos !== 0) { event.preventDefault(); select(index); } }}
            >
              <img src={assetUrl(combo.image)} alt={`Bộ quà ${combo.title}`} loading="lazy" draggable="false" />
              <span className="promo-fan__tag"><b>{combo.title}</b><i>{formatPrice(combo.price)}</i></span>
            </a>
          );
        })}
      </div>
      <div className="promo-fan__tabs" role="tablist" aria-label="Chọn bộ quà">
        {CURATED_COMBOS.map((_, comboIndex) => FAN_ORDER.indexOf(comboIndex)).map((index, comboIndex) => (
          <button type="button" role="tab" aria-selected={index === active} key={comboIndex} className={index === active ? 'is-active' : ''} onClick={() => select(index)}>
            <span>0{comboIndex + 1}</span>{CURATED_COMBOS[comboIndex].title.replace(' ♡', '')}
          </button>
        ))}
      </div>
    </div>
  );
}

/** Scrollytelling: the section is tall, the stage sticks, scroll progress picks the combo. */
function ComboStory() {
  const ref = useRef(null);
  const [active, setActive] = useState(0);
  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;
    let frame = 0;
    const update = () => {
      frame = 0;
      const rect = node.getBoundingClientRect();
      const total = Math.max(1, rect.height - window.innerHeight);
      const p = Math.min(1, Math.max(0, -rect.top / total));
      node.style.setProperty('--p', p.toFixed(4));
      setActive(Math.min(CURATED_COMBOS.length - 1, Math.floor(p * CURATED_COMBOS.length)));
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); cancelAnimationFrame(frame); };
  }, []);
  const goTo = (index) => {
    const node = ref.current;
    if (!node) return;
    const total = node.offsetHeight - window.innerHeight;
    const top = node.getBoundingClientRect().top + window.scrollY + total * ((index + 0.5) / CURATED_COMBOS.length);
    window.scrollTo({ top, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
  };
  const current = CURATED_COMBOS[active];
  return (
    <div className="promo-story" ref={ref}>
      <div className="promo-story__sticky">
        <div className="promo-story__media" aria-hidden="true">
          {CURATED_COMBOS.map((combo, i) => (
            <img key={combo.id} className={`promo-story__img${i === active ? ' is-active' : i < active ? ' is-past' : ''}`} src={assetUrl(combo.image)} alt="" loading="lazy" />
          ))}
          <span className="promo-story__saving"><small>TIẾT KIỆM</small><b>{current.discountPercent}%</b></span>
        </div>
        <div className="promo-story__panel">
          <span className="skinid-editorial-kicker">THE GIFT EDIT · {current.code}</span>
          <div className="promo-story__slides">
            {CURATED_COMBOS.map((combo, i) => (
              <div key={combo.id} className={`promo-story__slide${i === active ? ' is-active' : ''}`} aria-hidden={i !== active}>
                <span className="promo-eyebrow">{combo.subtitle}</span>
                <h3>{combo.title}</h3>
                <p>{combo.slogan}</p>
                <ul>{combo.items.map((item) => <li key={item}>{item}</li>)}</ul>
                <span className="promo-price"><b>{formatPrice(combo.price)}</b><del>{formatPrice(combo.originalPrice)}</del></span>
                <a className="btn btn--primary promo-cta" href={PROMO_URL} tabIndex={i === active ? 0 : -1}><span>Xem combo này</span><span className="promo-cta__arrow" aria-hidden="true">↗</span></a>
              </div>
            ))}
          </div>
          <div className="promo-story__nav">
            {CURATED_COMBOS.map((combo, i) => (
              <button type="button" key={combo.id} className={i === active ? 'is-active' : ''} onClick={() => goTo(i)} aria-label={`Xem ${combo.title}`}>0{i + 1}</button>
            ))}
            <span className="promo-story__bar"><i /></span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function FlashSaleBanner() {
  const ticker = [...TICKER, ...TICKER];
  return (
    <section className="skinid-collection-section promo-stage" id="khuyen-mai" aria-label="Khuyến mãi & Combo SkinID">
      <div className="promo-stage__aura" aria-hidden="true" />
      <div className="container">
        <header className="promo-hero">
          <div className="promo-hero__copy">
            <span className="skinid-editorial-kicker" data-reveal>ĐẶC QUYỀN SKINID · TWON & D'VAH</span>
            <h2 className="skinid-editorial-title" data-reveal data-reveal-delay="80">Một chút yêu chiều, <em>dành riêng cho bạn.</em></h2>
            <p data-reveal data-reveal-delay="160">Like &amp; share săn deal giảm đến 50%. Chọn bộ quà tặng TWON – D'VAH hoặc từng sản phẩm yêu thích (giá niêm yết đã bao gồm thuế VAT) để mỗi ngày đều là một dịp yêu thương bản thân.</p>
            <div className="promo-hero__cta" data-reveal data-reveal-delay="240">
              <MagneticLink className="btn btn--primary promo-cta" href={PROMO_URL}>
                <span>Xem toàn bộ chương trình</span><span className="promo-cta__arrow" aria-hidden="true">↗</span>
              </MagneticLink>
              <a className="collection-text-link" href="/products">Xem tất cả sản phẩm <span aria-hidden="true">→</span></a>
            </div>
          </div>
          <div className="promo-hero__art" data-reveal="soft-scale" data-reveal-delay="120">
            <span className="promo-orbit promo-orbit--a" aria-hidden="true" />
            <span className="promo-orbit promo-orbit--b" aria-hidden="true" />
            <ComboFan />
            <div className="promo-medal" aria-hidden="true">
              <small>ĐẾN</small>
              <b><CountUp to={50} /><sup>%</sup></b>
              <small>GIẢM</small>
            </div>
            <span className="promo-spark promo-spark--1" aria-hidden="true">♡</span>
            <span className="promo-spark promo-spark--2" aria-hidden="true">✦</span>
          </div>
        </header>
      </div>

      <div className="promo-ticker" aria-hidden="true" data-reveal="fade">
        <div className="promo-ticker__track">
          {ticker.map((text, i) => <span key={i}>{text}<i>✦</i></span>)}
        </div>
      </div>

      <div className="container">
        <div className="promo-block-head" data-reveal>
          <div><span className="skinid-editorial-kicker">THE GIFT EDIT</span><h3>Ba cách gửi trao <em>yêu thương.</em></h3></div>
          <a className="collection-text-link" href={PROMO_URL}>Xem chi tiết từng bộ <span aria-hidden="true">→</span></a>
        </div>
        <ComboStory />
        <div className="promo-combos">
          {CURATED_COMBOS.map((combo, index) => <ComboCard combo={combo} index={index} key={combo.id} />)}
        </div>

        <div className="promo-block-head promo-block-head--retail" data-reveal>
          <div><span className="skinid-editorial-kicker">DAILY LITTLE JOYS</span><h3>Giảm 50% cho điều bạn <em>yêu thích.</em></h3></div>
          <a className="collection-text-link" href={PROMO_URL}>Tất cả ưu đãi <span aria-hidden="true">→</span></a>
        </div>
        <ul className="promo-rail" aria-label="Sản phẩm giảm 50%">
          {RETAIL_50_DEALS.map((product, index) => (
            <li key={product.id} data-reveal data-reveal-delay={Math.min(index, 5) * 70}>
              <a className="promo-pick" href={PROMO_URL} aria-label={`${product.name}, ${formatPrice(product.price)}`}>
                <span className="promo-pick__visual">
                  <img src={assetUrl(product.image, product.brandSlug)} alt="" loading="lazy" />
                  <em>−{product.discountPercent}%</em>
                </span>
                <span className="promo-eyebrow">{product.brand}</span>
                <span className="promo-pick__name">{product.name}</span>
                <span className="promo-price"><b>{formatPrice(product.price)}</b><del>{formatPrice(product.originalPrice)}</del></span>
              </a>
            </li>
          ))}
        </ul>

        <div className="promo-steps" data-reveal>
          <div className="promo-steps__intro">
            <span className="skinid-editorial-kicker">LIKE · SHARE · ENJOY</span>
            <h3>Ưu đãi nhỏ. <em>Niềm vui mỗi ngày.</em></h3>
          </div>
          <ol>
            {CAMPAIGN_STEPS.map((step) => (
              <li key={step.step}><span>0{step.step}</span><div><strong>{step.title}</strong><p>{step.desc}</p></div></li>
            ))}
          </ol>
          <MagneticLink className="btn btn--primary promo-cta" href={PROMO_URL}>
            <span>Nhận ưu đãi ngay</span><span className="promo-cta__arrow" aria-hidden="true">↗</span>
          </MagneticLink>
        </div>
      </div>
    </section>
  );
}
