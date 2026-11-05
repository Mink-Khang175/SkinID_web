import { useCallback, useEffect, useRef, useState } from 'react';
import { useCart } from '../../features/cart/index.js';
import { useCatalog, formatPrice } from '../../features/catalog/index.js';
import { fetchAdminPromotions } from '../../features/admin/index.js';
import { useCampaign } from '../../features/content/index.js';
import { CURATED_COMBOS, RETAIL_50_DEALS } from '../../data/promotions.js';
import { COMPANY_INFO } from '../../data/companyInfo.js';
import { assetUrl } from '../../assets/index.js';

/* Contact channels used to confirm the 50% programme. The website cannot verify the 3 social steps,
   so retail 50% items never go to the cart: customers are sent to an advisor instead. Add a Messenger link here when available. */
const CONTACT = {
  zalo: COMPANY_INFO.zaloUrl,
  messenger: '',
  tel: `tel:${COMPANY_INFO.hotline.replace(/\./g, '')}`,
  hotline: COMPANY_INFO.hotlineDisplay,
  hours: COMPANY_INFO.workingHours
};

const STEPS = [
  { id: 'like', icon: '👍', title: 'LIKE & FOLLOW', desc: 'Thích và theo dõi Fanpage chính thức SkinID.' },
  { id: 'share', icon: '↗', title: 'SHARE BÀI VIẾT', desc: 'Chia sẻ bài viết ở chế độ CÔNG KHAI trên trang cá nhân.' },
  { id: 'comment', icon: '💬', title: 'COMMENT “SKINID50”', desc: 'Bình luận đúng cú pháp ngay dưới bài viết.' },
  { id: 'inbox', icon: '✦', title: 'INBOX NHẬN ƯU ĐÃI', desc: 'Nhắn SkinID để được xác nhận và chốt đơn với giá giảm 50%.' }
];

const DEFAULT_VOUCHERS = [
  { code: 'FREESHIP', label: 'Miễn phí vận chuyển', sub: 'Hỗ trợ tối đa 30.000đ phí vận chuyển.' },
  { code: 'SKINID10', label: 'Giảm 10% đơn hàng', sub: 'Đơn từ 200.000đ, giảm tối đa 150.000đ.' },
  { code: 'WELCOME50', label: 'Ưu đãi 50.000đ', sub: 'Dành cho đơn hàng từ 300.000đ.' }
];

function normalizeVouchers(list) {
  return list.filter((v) => v && v.active !== false && v.code).map((v) => {
    const value = Number(v.discountValue || v.value) || 0;
    return {
      code: String(v.code).trim().toUpperCase(),
      label: v.type === 'shipping' ? 'Miễn phí vận chuyển' : ['percent', 'percentage'].includes(v.type) ? `Giảm ${value}% đơn hàng` : `Ưu đãi ${formatPrice(value)}`,
      sub: v.description || (v.minOrderValue ? `Đơn từ ${formatPrice(Number(v.minOrderValue))}.` : 'Áp dụng theo điều kiện chương trình.')
    };
  });
}

const reducedMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
const openProduct = (productId) => document.dispatchEvent(new CustomEvent('skinid:open-product-detail', { detail: { productId } }));

const Thumb = () => <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M7 11v9H4v-9zM7 11l4-8c1.5 0 2.5 1.2 2.2 2.7L12.6 9H19a2 2 0 0 1 2 2.4l-1.3 6.5A2 2 0 0 1 17.7 20H7" /></svg>;
const Chat = () => <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z" /></svg>;
const Share = () => <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m14 4 7 7-7 7v-4c-6 0-9 1.5-11 5 .5-6 4-10 11-10z" /></svg>;
const Globe = () => <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18" /></svg>;

/** Scroll progress (0..1) of a tall section whose child sticks; reports the active stage and writes --p on the node. */
function useStickyStages(count) {
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
      setActive(Math.min(count - 1, Math.floor(p * count)));
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); cancelAnimationFrame(frame); };
  }, [count]);
  const goTo = useCallback((index) => {
    const node = ref.current;
    if (!node) return;
    const total = node.offsetHeight - window.innerHeight;
    const top = node.getBoundingClientRect().top + window.scrollY + total * ((index + 0.5) / count);
    window.scrollTo({ top, behavior: reducedMotion() ? 'auto' : 'smooth' });
  }, [count]);
  return { ref, active, goTo };
}

/** Writes --hp (0..1) while the hero scrolls away, for parallax. */
function useHeroParallax() {
  const ref = useRef(null);
  useEffect(() => {
    const node = ref.current;
    if (!node || reducedMotion()) return undefined;
    let frame = 0;
    const update = () => {
      frame = 0;
      const rect = node.getBoundingClientRect();
      node.style.setProperty('--hp', Math.min(1, Math.max(0, -rect.top / Math.max(1, rect.height))).toFixed(4));
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => { window.removeEventListener('scroll', onScroll); cancelAnimationFrame(frame); };
  }, []);
  return ref;
}

/** Price that visibly drops from the original to the 50% price once `on` becomes true. */
function PriceDrop({ from, to, on }) {
  const [value, setValue] = useState(from);
  useEffect(() => {
    if (!on) { setValue(from); return undefined; }
    if (reducedMotion()) { setValue(to); return undefined; }
    let frame = 0;
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min(1, (now - start) / 1100);
      setValue(Math.round((from - (from - to) * (1 - Math.pow(1 - t, 3))) / 500) * 500);
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [on, from, to]);
  return <b>{formatPrice(value)}</b>;
}

function AdvisorButtons({ className = '', light = false }) {
  return (
    <div className={`pl-advisor ${light ? 'pl-advisor--light' : ''} ${className}`}>
      <a className={`btn pl-btn ${light ? 'pl-btn--white' : 'btn--primary'}`} href={CONTACT.zalo} target="_blank" rel="noopener noreferrer"><span>Nhắn Zalo nhận ưu đãi</span><i aria-hidden="true">↗</i></a>
      {CONTACT.messenger && <a className="btn btn--secondary pl-btn" href={CONTACT.messenger} target="_blank" rel="noopener noreferrer">Inbox Messenger</a>}
      <a className="pl-advisor__tel" href={CONTACT.tel}>Hotline {CONTACT.hotline}</a>
    </div>
  );
}

function Hero({ campaign, retailDeals = RETAIL_50_DEALS }) {
  const ref = useHeroParallax();
  const endDate = campaign?.endsAt || campaign?.endAt ? new Date(campaign.endsAt || campaign.endAt) : null;
  const deals = retailDeals?.length ? retailDeals : RETAIL_50_DEALS;
  const floaters = [deals[0], deals[1], deals[2], deals[3], deals[6] || deals[0], deals[5] || deals[1]].filter(Boolean);
  return (
    <header className="pl-hero" ref={ref}>
      <div className="pl-hero__copy">
        <span className="skinid-editorial-kicker">ĐẶC QUYỀN SKINID · TWON &amp; D'VAH</span>
        <h1 className="skinid-editorial-title">Like &amp; share, <em>săn deal giảm 50%.</em></h1>
        <p>{campaign?.subtitle || 'Yêu thương bản thân – đẹp hơn mỗi ngày cùng SkinID. Hoàn thành 3 bước đơn giản để nhận mức giá giảm 50% cho sản phẩm bán lẻ TWON và D’VAH, hoặc chọn một bộ quà tặng thật xinh.'}</p>
        <div className="pl-hero__cta">
          <a className="btn btn--primary pl-btn" href="#buoc-tham-gia"><span>Xem 3 bước nhận ưu đãi</span><i aria-hidden="true">↓</i></a>
          <a className="collection-text-link" href="#bo-qua-tang">Xem bộ quà tặng <span aria-hidden="true">→</span></a>
        </div>
        {endDate && Number.isFinite(endDate.getTime()) && <small className="pl-hero__deadline">Chương trình đến {endDate.toLocaleDateString('vi-VN')}</small>}
      </div>
      <div className="pl-hero__art" aria-hidden="true">
        <span className="pl-ring pl-ring--a" /><span className="pl-ring pl-ring--b" />
        <div className="pl-medal"><small>GIẢM ĐẾN</small><b>50<sup>%</sup></b><small>SẢN PHẨM LẺ</small></div>
        {floaters.map((product, i) => (
          <span key={product.id || i} className={`pl-float pl-float--${i + 1}`} style={{ '--depth': [60, -40, 90, -70, 50, -30][i] }}>
            <img src={assetUrl(product.image, product.brandSlug)} alt="" loading="lazy" />
          </span>
        ))}
      </div>
    </header>
  );
}

/* ---------- Scrollytelling: 3 steps ---------- */
function StepsStory({ retailDeals = RETAIL_50_DEALS, steps = STEPS }) {
  const { ref, active, goTo } = useStickyStages(steps.length);
  const hero = retailDeals?.[0] || RETAIL_50_DEALS[0];
  return (
    <section className="pl-steps" id="buoc-tham-gia" ref={ref} aria-label="3 bước nhận ưu đãi giảm 50%">
      <div className="pl-steps__sticky">
        <div className="pl-steps__panel">
          <span className="skinid-editorial-kicker">CÁCH NHẬN ƯU ĐÃI 50%</span>
          <h2>Ba bước nhẹ nhàng, <em>một mức giá đáng yêu.</em></h2>
          <ol className="pl-steps__list">
            {STEPS.map((step, i) => (
              <li key={step.id} className={i === active ? 'is-active' : i < active ? 'is-done' : ''}>
                <button type="button" onClick={() => goTo(i)} aria-label={`Bước ${i + 1}: ${step.title}`} aria-current={i === active ? 'step' : undefined}>
                  <span className="pl-steps__num">{i < active ? '✓' : `0${i + 1}`}</span>
                  <span className="pl-steps__text"><strong>{step.title}</strong><span>{step.desc}</span></span>
                </button>
              </li>
            ))}
          </ol>
          <span className="pl-steps__bar" aria-hidden="true"><i /></span>
          <p className="pl-steps__note">Ưu đãi áp dụng cho sản phẩm bán lẻ. Đội ngũ SkinID sẽ kiểm tra bài chia sẻ và bình luận của bạn qua tin nhắn trước khi áp dụng giá.</p>
        </div>

        <div className="pl-phone-wrap" aria-hidden="true">
          <span className="pl-glow" />
          <div className="pl-phone" data-stage={active}>
            <div className="pl-fb__head">
              <span className="pl-fb__avatar"><img src={assetUrl('/images/SkinID_Icon_Monogram_Transparent.png')} alt="" /></span>
              <div className="pl-fb__who">
                <b>SkinID shop</b>
                <small>Vừa xong · <span className={`pl-public ${active >= 1 ? 'is-on' : ''}`}><Globe />{active >= 1 ? ' Công khai' : ''}</span></small>
              </div>
              <span className={`pl-follow ${active >= 0 ? 'is-on' : ''}`}>{active >= 0 ? 'Đang theo dõi' : 'Theo dõi'}</span>
              <span className="pl-fb__more" aria-hidden="true">···</span>
            </div>
            <p className="pl-fb__text">Like &amp; Share săn deal giảm 50% 💗 Yêu thương bản thân – đẹp hơn mỗi ngày cùng SkinID!</p>
            <img className="pl-fb__img" src={assetUrl(CURATED_COMBOS[1].image)} alt="" />
            <div className="pl-fb__react">
              <span className="pl-fb__react-icons"><i className="is-like"><Thumb /></i><i className="is-love">❤</i></span>
              <span className={`pl-fb__react-text ${active >= 0 ? 'is-on' : ''}`}>{active >= 0 ? 'Bạn và những người khác' : 'Hãy là người đầu tiên thích'}</span>
            </div>
            <div className="pl-fb__actions">
              <span className={`pl-act ${active >= 0 ? 'is-on' : ''}`}><Thumb />Thích</span>
              <span className={`pl-act ${active >= 2 ? 'is-on' : ''}`}><Chat />Bình luận</span>
              <span className={`pl-act ${active >= 1 ? 'is-on' : ''}`}><Share />Chia sẻ</span>
            </div>
            <div className={`pl-shared ${active >= 1 ? 'is-on' : ''}`}><Share /> Đã chia sẻ lên trang cá nhân · <Globe /> Công khai</div>
            <div className={`pl-comment ${active >= 2 ? 'is-on' : ''}`}>
              <span className="pl-fb__avatar pl-fb__avatar--you">B</span>
              <div className="pl-comment__main">
                <span className="pl-comment__bubble"><b>Bạn</b><span key={active >= 2 ? 'on' : 'off'} className="pl-comment__text">SKINID50</span></span>
                <small>Thích · Phản hồi · Vừa xong</small>
              </div>
            </div>
            <div className={`pl-deal ${active >= 3 ? 'is-on' : ''}`}>
              <img src={assetUrl(hero.image, hero.brandSlug)} alt="" />
              <div>
                <small>{hero.name}</small>
                <div className="pl-deal__price"><PriceDrop from={hero.originalPrice} to={hero.price} on={active >= 3} /><del>{formatPrice(hero.originalPrice)}</del></div>
                <span className="pl-deal__chip">−50% · Inbox để chốt đơn</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- Retail 50% (advisor CTA instead of cart) ---------- */
function RetailDeals({ retailDeals = RETAIL_50_DEALS }) {
  const deals = retailDeals?.length ? retailDeals : RETAIL_50_DEALS;
  return (
    <section className="pl-retail" id="san-pham-giam-50" aria-label="Sản phẩm bán lẻ giảm 50%">
      <div className="pl-head">
        <div>
          <span className="skinid-editorial-kicker">DAILY LITTLE JOYS</span>
          <h2>Giảm 50% cho điều <em>bạn yêu thích.</em></h2>
        </div>
        <p>Hoàn thành 3 bước, sau đó nhắn SkinID để được tư vấn và áp dụng mức giá ưu đãi dưới đây. Toàn bộ giá niêm yết và giá ưu đãi đã bao gồm thuế GTGT (VAT).</p>
      </div>
      <ul className="pl-retail__grid">
        {deals.map((product) => (
          <li key={product.id} className="pl-card">
            <button type="button" className="pl-card__visual" onClick={() => openProduct(product.id)} aria-label={`Xem chi tiết ${product.name}`}>
              <img src={assetUrl(product.image, product.brandSlug)} alt="" loading="lazy" />
              <em>−{product.discountPercent}%</em>
              <span className="pl-card__hint">Xem chi tiết</span>
            </button>
            <span className="pl-eyebrow">{product.brand}</span>
            <h3>{product.name}</h3>
            <ul className="pl-card__tags">{(product.features || []).slice(0, 2).map((f) => <li key={f}>{f}</li>)}</ul>
            <div className="pl-price"><b>{formatPrice(product.price)}</b><del>{formatPrice(product.originalPrice)}</del></div>
            <a className="btn btn--primary pl-btn pl-card__cta" href={CONTACT.zalo} target="_blank" rel="noopener noreferrer"><span>Nhận ưu đãi 50%</span><i aria-hidden="true">↗</i></a>
            <small className="pl-card__note">Cần hoàn thành 3 bước · SkinID xác nhận qua tin nhắn</small>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ---------- Scrollytelling: gift sets ---------- */
function GiftStory({ combos = CURATED_COMBOS }) {
  const { addToCart } = useCart();
  const { isReady } = useCatalog();
  const list = combos?.length ? combos : CURATED_COMBOS;
  const { ref, active, goTo } = useStickyStages(list.length);
  const [pending, setPending] = useState('');
  const [added, setAdded] = useState('');
  const [message, setMessage] = useState('');
  const add = async (combo) => {
    setPending(combo.id); setMessage('');
    try { for (const productId of combo.productIds) await addToCart(productId); setAdded(combo.id); setMessage('Đã thêm bộ quà vào giỏ hàng.'); }
    catch { setMessage('Chưa thể thêm vào giỏ. Vui lòng thử lại.'); }
    finally { setPending(''); }
  };
  const current = list[active] || list[0] || {};
  return (
    <section className="pl-gifts" id="bo-qua-tang" aria-label="Bộ quà tặng SkinID">
      <div className="pl-head">
        <div><span className="skinid-editorial-kicker">THE GIFT EDIT</span><h2>Ba cách gửi trao <em>yêu thương.</em></h2></div>
        <p>Combo là giá ưu đãi cố định, đặt ngay trên website không cần thực hiện 3 bước.</p>
      </div>
      <div className="pl-story" ref={ref}>
        <div className="pl-story__sticky">
          <div className="pl-story__media" aria-hidden="true">
            {list.map((combo, i) => <img key={combo.id} className={`pl-story__img${i === active ? ' is-active' : i < active ? ' is-past' : ''}`} src={assetUrl(combo.image)} alt="" loading="lazy" />)}
            <span className="pl-story__saving"><small>TIẾT KIỆM</small><b>{current.discountPercent}%</b></span>
          </div>
          <div className="pl-story__panel">
            <span className="skinid-editorial-kicker">{current.code}</span>
            <div className="pl-story__slides">
              {list.map((combo, i) => (
                <div key={combo.id} className={`pl-story__slide${i === active ? ' is-active' : ''}`} aria-hidden={i !== active}>
                  <span className="pl-eyebrow">{combo.subtitle}</span>
                  <h3>{combo.title}</h3>
                  <p>{combo.slogan}</p>
                  <div className="pl-story__items">
                    {(combo.products || []).map((product) => (
                      <button type="button" key={product.id} onClick={() => openProduct(product.id)} tabIndex={i === active ? 0 : -1} title={`Xem ${product.name}`}>
                        <img src={assetUrl(product.image, product.brandSlug)} alt={product.name} /><span>{product.capacity}</span>
                      </button>
                    ))}
                  </div>
                  <ul>{(combo.items || []).map((item) => <li key={item}>{item}</li>)}</ul>
                  <div className="pl-price"><b>{formatPrice(combo.price)}</b><del>{formatPrice(combo.originalPrice)}</del></div>
                  <button type="button" className="btn btn--primary pl-btn" tabIndex={i === active ? 0 : -1} disabled={!isReady || !!pending} onClick={() => add(combo)}>
                    <span>{pending === combo.id ? 'Đang thêm…' : added === combo.id ? 'Đã thêm vào giỏ ✓' : 'Thêm bộ quà vào giỏ'}</span><i aria-hidden="true">+</i>
                  </button>
                </div>
              ))}
            </div>
            <div className="pl-story__nav">
              {list.map((combo, i) => <button type="button" key={combo.id} className={i === active ? 'is-active' : ''} onClick={() => goTo(i)} aria-label={`Xem ${combo.title}`}>0{i + 1}</button>)}
              <span className="pl-story__bar"><i /></span>
            </div>
            <p className="pl-feedback" role="status" aria-live="polite">{message}</p>
          </div>
        </div>
      </div>

      {/* Mobile / reduced motion: plain cards */}
      <div className="pl-gift-cards">
        {list.map((combo, index) => (
          <article key={combo.id} className="pl-gift-card">
            <div className="pl-gift-card__img"><img src={assetUrl(combo.image)} alt={`Bộ quà ${combo.title}`} loading="lazy" /><span>0{index + 1}</span><em>Tiết kiệm {combo.discountPercent}%</em></div>
            <div className="pl-gift-card__body">
              <span className="pl-eyebrow">{combo.subtitle}</span>
              <h3>{combo.title}</h3>
              <p>{combo.slogan}</p>
              <ul>{(combo.items || []).map((item) => <li key={item}>{item}</li>)}</ul>
              <div className="pl-price"><b>{formatPrice(combo.price)}</b><del>{formatPrice(combo.originalPrice)}</del></div>
              <button type="button" className="btn btn--primary pl-btn" disabled={!isReady || !!pending} onClick={() => add(combo)}>
                <span>{pending === combo.id ? 'Đang thêm…' : added === combo.id ? 'Đã thêm vào giỏ ✓' : 'Thêm bộ quà vào giỏ'}</span><i aria-hidden="true">+</i>
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function Vouchers({ vouchers }) {
  const [copied, setCopied] = useState('');
  const [message, setMessage] = useState('');
  const copy = async (code) => {
    try { await navigator.clipboard.writeText(code); setCopied(code); setMessage(`Đã sao chép mã ${code}.`); }
    catch { setMessage(`Bạn có thể nhập mã ${code} tại bước thanh toán.`); }
  };
  if (!vouchers.length) return null;
  return (
    <section className="pl-vouchers" id="vouchers" aria-label="Mã ưu đãi">
      <div className="pl-head"><div><span className="skinid-editorial-kicker">MÃ ƯU ĐÃI</span><h2>Thêm một chút <em>quà nhỏ.</em></h2></div></div>
      <div className="pl-vouchers__grid">
        {vouchers.map((voucher) => (
          <div className="pl-voucher" key={voucher.code}>
            <div><span className="pl-voucher__code">{voucher.code}</span><h3>{voucher.label}</h3><p>{voucher.sub}</p></div>
            <button type="button" className="btn btn--secondary" onClick={() => copy(voucher.code)} aria-label={`Sao chép mã ${voucher.code}`}>{copied === voucher.code ? 'Đã chép ✓' : 'Sao chép'}</button>
          </div>
        ))}
      </div>
      <p className="pl-feedback" role="status" aria-live="polite">{message}</p>
    </section>
  );
}

function FinalCta() {
  return (
    <section className="pl-final" aria-label="Liên hệ nhận ưu đãi">
      <span className="pl-final__orb" aria-hidden="true" />
      <div className="pl-final__copy">
        <span className="skinid-editorial-kicker">INBOX NGAY</span>
        <h2>Hoàn thành 3 bước rồi <em>nhắn SkinID.</em></h2>
        <p>Đội ngũ tư vấn sẽ xác nhận, gợi ý sản phẩm phù hợp và chốt đơn với mức giá giảm 50% cho bạn. Hỗ trợ {CONTACT.hours}.</p>
      </div>
      <AdvisorButtons light />
    </section>
  );
}

export default function PromotionsLanding() {
  const [vouchers, setVouchers] = useState(DEFAULT_VOUCHERS);
  const { campaign: firestoreCampaign, combos, flashSale, steps } = useCampaign();
  const [campaign, setCampaign] = useState(firestoreCampaign);

  useEffect(() => {
    if (firestoreCampaign) setCampaign(firestoreCampaign);
  }, [firestoreCampaign]);

  useEffect(() => {
    let mounted = true;
    const load = () => fetchAdminPromotions().then((data) => {
      if (!mounted) return;
      if (Array.isArray(data?.vouchers)) setVouchers(normalizeVouchers(data.vouchers));
      if (data?.campaign) setCampaign(data.campaign);
    }).catch(() => {});
    const sync = (event) => {
      if (Array.isArray(event.detail?.vouchers)) setVouchers(normalizeVouchers(event.detail.vouchers));
      else if (event.detail?.campaign) setCampaign(event.detail.campaign);
      else load();
    };
    load();
    const events = ['storage', 'skinid:vouchers-updated', 'skinid:campaign-updated'];
    events.forEach((name) => window.addEventListener(name, sync));
    return () => { mounted = false; events.forEach((name) => window.removeEventListener(name, sync)); };
  }, []);

  const activeCombos = combos?.length ? combos : CURATED_COMBOS;
  const activeDeals = flashSale?.length ? flashSale : RETAIL_50_DEALS;
  const activeSteps = steps?.length ? steps : STEPS;

  return (
    <div className="pl-page">
      <Hero campaign={campaign} retailDeals={activeDeals} />
      <StepsStory retailDeals={activeDeals} steps={activeSteps} />
      <RetailDeals retailDeals={activeDeals} />
      <GiftStory combos={activeCombos} />
      <Vouchers vouchers={vouchers} />
      <FinalCta />
    </div>
  );
}
