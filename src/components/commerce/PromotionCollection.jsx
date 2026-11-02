import { useEffect, useState } from 'react';
import { useCart } from '../../features/cart/index.js';
import { useCatalog, formatPrice } from '../../features/catalog/index.js';
import { fetchAdminPromotions } from '../../features/admin/index.js';
import { CURATED_COMBOS, RETAIL_50_DEALS, CAMPAIGN_STEPS } from '../../data/promotions.js';
import { assetUrl } from '../../assets/index.js';

const DEFAULT_VOUCHERS = [
  { code: 'FREESHIP', label: 'Miễn phí vận chuyển', sub: 'Hỗ trợ tối đa 30.000đ phí vận chuyển.' },
  { code: 'SKINID10', label: 'Giảm 10% đơn hàng', sub: 'Đơn từ 200.000đ, giảm tối đa 150.000đ.' },
  { code: 'WELCOME50', label: 'Ưu đãi 50.000đ', sub: 'Dành cho đơn hàng từ 300.000đ.' }
];
function normalizeVouchers(list) {
  return list.filter(v => v && v.active !== false && v.code).map(v => {
    const value = Number(v.discountValue || v.value) || 0;
    return { code: String(v.code).trim().toUpperCase(),
      label: v.type === 'shipping' ? 'Miễn phí vận chuyển' : ['percent', 'percentage'].includes(v.type) ? `Giảm ${value}% đơn hàng` : `Ưu đãi ${formatPrice(value)}`,
      sub: v.description || (v.minOrderValue ? `Đơn từ ${formatPrice(Number(v.minOrderValue))}.` : 'Áp dụng theo điều kiện chương trình.') };
  });
}

export default function PromotionCollection({ full = false }) {
  const { addToCart } = useCart();
  const { isReady } = useCatalog();
  const [vouchers, setVouchers] = useState(DEFAULT_VOUCHERS);
  const [campaign, setCampaign] = useState(null);
  const [copied, setCopied] = useState('');
  const [pending, setPending] = useState('');
  const [added, setAdded] = useState('');
  const [message, setMessage] = useState('');
  useEffect(() => {
    let mounted = true;
    const load = () => fetchAdminPromotions().then(data => {
      if (!mounted) return;
      if (Array.isArray(data?.vouchers)) setVouchers(normalizeVouchers(data.vouchers));
      if (data?.campaign) setCampaign(data.campaign);
    }).catch(() => {});
    const sync = event => {
      if (Array.isArray(event.detail?.vouchers)) setVouchers(normalizeVouchers(event.detail.vouchers));
      else if (event.detail?.campaign) setCampaign(event.detail.campaign);
      else load();
    };
    load();
    const events = ['storage', 'skinid:vouchers-updated', 'skinid:campaign-updated'];
    events.forEach(name => window.addEventListener(name, sync));
    return () => { mounted = false; events.forEach(name => window.removeEventListener(name, sync)); };
  }, []);
  const copy = async code => {
    try { await navigator.clipboard.writeText(code); setCopied(code); setMessage(`Đã sao chép mã ${code}.`); }
    catch { setMessage(`Bạn có thể nhập mã ${code} tại bước thanh toán.`); }
  };
  const add = async (id, productIds) => {
    setPending(id); setMessage('');
    try { for (const productId of productIds) await addToCart(productId); setAdded(id); setMessage('Đã thêm sản phẩm vào giỏ hàng.'); }
    catch { setMessage('Chưa thể thêm vào giỏ. Vui lòng thử lại.'); }
    finally { setPending(''); }
  };
  const openProduct = productId => document.dispatchEvent(new CustomEvent('skinid:open-product-detail', { detail: { productId } }));
  const Heading = full ? 'h1' : 'h2';
  const deadline = campaign?.endsAt || campaign?.endAt;
  const endDate = deadline ? new Date(deadline) : null;
  return <div className="promotion-collection">
    <header className="collection-intro">
      <div className="collection-intro__copy">
        <span className="skinid-editorial-kicker">ĐẶC QUYỀN SKINID · TWON & D'VAH</span>
        <Heading className="skinid-editorial-title">Một chút yêu chiều, <em>dành riêng cho bạn.</em></Heading>
        {campaign?.title && <p className="collection-campaign-name">{campaign.title}</p>}
        <p>{campaign?.subtitle || 'Chăm sóc làn da, chọn một hương thơm yêu thích. Khám phá những bộ quà tặng và ưu đãi để mỗi ngày đều là một dịp yêu thương bản thân.'}</p>
        <div className="collection-intro__links"><a className="btn btn--primary" href={full ? '#gift-sets' : '/khuyen-mai'}>{full ? 'Khám phá bộ quà tặng' : 'Khám phá ưu đãi'} <span aria-hidden="true">↗</span></a><a className="collection-text-link" href={full ? '#vouchers' : '/products'}>{full ? 'Chọn mã ưu đãi' : 'Xem tất cả sản phẩm'} <span aria-hidden="true">→</span></a></div>
        {endDate && Number.isFinite(endDate.getTime()) && <small className="collection-deadline">Thời gian chương trình: đến {endDate.toLocaleDateString('vi-VN')}</small>}
      </div>
      <div className="collection-art" aria-hidden="true"><div className="collection-art__orbit" /><img src={assetUrl('/images/products/combos/combo-1-nang-xinh.jpg')} alt="" /><span className="collection-art__note">A LITTLE GIFT. A LITTLE SELF-LOVE.</span><span className="collection-art__badge"><small>ƯU ĐÃI ĐẾN</small><b>50<sup>%</sup></b><small>TWON · D'VAH</small></span></div>
    </header>
    {vouchers.length > 0 && <div className="collection-vouchers" id={full ? 'vouchers' : undefined} aria-label="Mã ưu đãi">{(full ? vouchers : vouchers.slice(0, 3)).map(voucher => <div className="collection-voucher" key={voucher.code}><div><span className="collection-voucher__code">{voucher.code}</span><h3>{voucher.label}</h3><p>{voucher.sub}</p></div><button type="button" className="btn btn--secondary" onClick={() => copy(voucher.code)} aria-label={`Sao chép mã ${voucher.code}`}>{copied === voucher.code ? 'Đã chép ✓' : 'Sao chép'}</button></div>)}</div>}
    <section className="collection-gifts" id={full ? 'gift-sets' : undefined} aria-label="Bộ quà tặng SkinID">
      <div className="collection-section-heading"><div><span className="skinid-editorial-kicker">THE GIFT EDIT</span><h2>Ba cách gửi trao <em>yêu thương.</em></h2></div><span className="collection-section-note">Chọn một bộ quà, dành cho bạn hoặc người thương.</span></div>
      <div className="collection-combos">{CURATED_COMBOS.map((combo, index) => <article className="collection-combo" key={combo.id}>
        <div className="collection-combo__visual"><img src={assetUrl(combo.image)} alt={`Bộ quà ${combo.title}`} loading="lazy" /><span className="collection-combo__number">0{index + 1}</span><span className="collection-combo__saving">Tiết kiệm {combo.discountPercent}%</span></div>
        <div className="collection-combo__body"><span className="collection-eyebrow">{combo.subtitle}</span><h3>{combo.title}</h3><p>{combo.slogan}</p><div className="collection-combo__products">{combo.products.map(product => <button key={product.id} type="button" onClick={() => openProduct(product.id)} title={`Xem ${product.name}`}><img src={assetUrl(product.image, product.brandSlug)} alt={product.name} loading="lazy" /><span>{product.capacity}</span></button>)}</div><details className="collection-combo__details"><summary>Trong bộ quà có gì? <span aria-hidden="true">+</span></summary><ul>{combo.items.map(item => <li key={item}>{item}</li>)}</ul></details><div className="collection-price"><strong>{formatPrice(combo.price)}</strong><del>{formatPrice(combo.originalPrice)}</del></div><button type="button" className="btn btn--secondary collection-combo__cta" disabled={!isReady || !!pending} onClick={() => add(combo.id, combo.productIds)}>{pending === combo.id ? 'Đang thêm…' : added === combo.id ? 'Đã thêm vào giỏ ✓' : 'Thêm bộ quà vào giỏ'} <span aria-hidden="true">↗</span></button></div>
      </article>)}</div>
    </section>
    <section className="collection-retail" aria-label="Sản phẩm ưu đãi">
      <div className="collection-section-heading"><div><span className="skinid-editorial-kicker">DAILY LITTLE JOYS</span><h2>Chọn điều bạn <em>yêu thích.</em></h2></div>{!full && <a className="collection-text-link" href="/khuyen-mai">Tất cả ưu đãi →</a>}</div>
      <div className="collection-products">{(full ? RETAIL_50_DEALS : RETAIL_50_DEALS.slice(0, 4)).map(product => <article className="collection-product" key={product.id}><button type="button" className="collection-product__visual" onClick={() => openProduct(product.id)} aria-label={`Xem ${product.name}`}><img src={assetUrl(product.image, product.brandSlug)} alt={product.name} loading="lazy" /><span>−{product.discountPercent}%</span></button><span className="collection-eyebrow">{product.brand}</span><h3><button type="button" onClick={() => openProduct(product.id)}>{product.name}</button></h3><div className="collection-price"><strong>{formatPrice(product.price)}</strong><del>{formatPrice(product.originalPrice)}</del></div><button type="button" className="btn btn--secondary" disabled={!isReady || !!pending} onClick={() => add(product.id, [product.id])}>{pending === product.id ? 'Đang thêm…' : added === product.id ? 'Đã thêm ✓' : 'Thêm vào giỏ'} <span aria-hidden="true">+</span></button></article>)}</div>
    </section>
    <div className="collection-how"><div><span className="skinid-editorial-kicker">LIKE · SHARE · ENJOY</span><h2>Ưu đãi nhỏ. <em>Niềm vui mỗi ngày.</em></h2></div><ol>{CAMPAIGN_STEPS.map(step => <li key={step.step}><span>0{step.step}</span><div><h3>{step.title}</h3><p>{step.desc}</p></div></li>)}</ol></div>
    <p className="collection-feedback" role="status" aria-live="polite">{message}</p>
  </div>;
}
