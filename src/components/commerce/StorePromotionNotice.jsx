import { COMPANY_INFO } from '../../data/companyInfo.js';
import { useSystemSettings } from '../../features/system/index.js';

function dateLabel(value) {
  const date = value?.toDate ? value.toDate() : value?.seconds ? new Date(value.seconds * 1000) : new Date(value);
  return value && Number.isFinite(date.getTime()) ? date.toLocaleDateString('vi-VN') : '';
}

export default function StorePromotionNotice({ campaign, compact = false }) {
  const settings = useSystemSettings();
  const start = dateLabel(campaign?.startAt);
  const end = dateLabel(campaign?.endAt || campaign?.endsAt);
  return <aside className={`store-promotion-notice${compact ? ' store-promotion-notice--compact' : ''}`} id={compact ? undefined : 'dieu-kien-tai-cua-hang'} aria-label="Phạm vi áp dụng ưu đãi">
    <span className="store-promotion-notice__icon" aria-hidden="true">↗</span>
    <div>
      <strong>Ưu đãi tại cửa hàng</strong>
      <p>Giá combo và ưu đãi giảm 50% trong khu vực này áp dụng tại cửa hàng, không áp dụng khi đặt hàng online. Giá bán online được niêm yết riêng trong mục <a href="/products">Tất cả sản phẩm</a>.</p>
      {!compact && <dl><div><dt>Địa điểm</dt><dd>{settings.showroomAddress || `Liên hệ ${COMPANY_INFO.hotlineDisplay} để xác nhận địa điểm áp dụng.`}</dd></div><div><dt>Thời gian</dt><dd>{start && end ? `${start} – ${end}` : end ? `Đến ${end}` : 'Liên hệ SkinID để xác nhận thời gian áp dụng.'}</dd></div><div><dt>Điều kiện</dt><dd>Ưu đãi sản phẩm lẻ: thực hiện các bước của chương trình và được nhân viên xác nhận. Combo: liên hệ xác nhận giá và tình trạng hàng trước khi đến. Các mức giá hiển thị đã gồm VAT.</dd></div></dl>}
      {compact && <a className="store-promotion-notice__link" href="/khuyen-mai#dieu-kien-tai-cua-hang">Xem địa điểm & điều kiện áp dụng →</a>}
    </div>
  </aside>;
}
