import { COMPANY_INFO } from '../../data/companyInfo.js';
import { useSystemSettings } from '../../features/system/index.js';

function dateLabel(value) {
  const date = value?.toDate ? value.toDate() : value?.seconds ? new Date(value.seconds * 1000) : new Date(value);
  return value && Number.isFinite(date.getTime()) ? date.toLocaleDateString('vi-VN') : '';
}

const StoreIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
    <path d="M3 9.5 4.5 4h15L21 9.5M3 9.5c0 1.4 1.1 2.5 2.5 2.5S8 10.9 8 9.5c0 1.4 1.1 2.5 2.5 2.5S13 10.9 13 9.5c0 1.4 1.1 2.5 2.5 2.5S18 10.9 18 9.5c0 1.4 1.1 2.5 2.5 2.5S21 10.9 21 9.5M5 12v8h14v-8M10 20v-4h4v4" />
  </svg>
);

export default function StorePromotionNotice({ campaign, compact = false }) {
  const settings = useSystemSettings();
  const start = dateLabel(campaign?.startAt);
  const end = dateLabel(campaign?.endAt || campaign?.endsAt);
  const details = [
    ['Địa điểm', settings.showroomAddress || `Liên hệ ${COMPANY_INFO.hotlineDisplay} để xác nhận địa điểm áp dụng.`],
    ['Thời gian', start && end ? `${start} – ${end}` : end ? `Đến ${end}` : 'Liên hệ SkinID để xác nhận thời gian áp dụng.'],
    ['Điều kiện', 'Sản phẩm lẻ: thực hiện các bước của chương trình và được nhân viên xác nhận. Combo: liên hệ xác nhận giá và tình trạng hàng trước khi đến. Giá hiển thị đã gồm VAT.']
  ];
  return (
    <aside className={`store-promotion-notice${compact ? ' store-promotion-notice--compact' : ''}`} id={compact ? undefined : 'dieu-kien-tai-cua-hang'} aria-label="Phạm vi áp dụng ưu đãi">
      <div className="store-promotion-notice__main">
        <span className="store-promotion-notice__badge"><StoreIcon />Tại cửa hàng</span>
        <p>
          <strong>Giá combo và ưu đãi giảm 50% chỉ áp dụng tại cửa hàng</strong>, không áp dụng khi đặt hàng online.
          Giá online được niêm yết riêng tại mục <a href="/products">Tất cả sản phẩm</a>.
        </p>
        {compact && <a className="store-promotion-notice__link" href="/khuyen-mai#dieu-kien-tai-cua-hang">Địa điểm &amp; điều kiện <span aria-hidden="true">→</span></a>}
      </div>
      {!compact && (
        <dl className="store-promotion-notice__details">
          {details.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}
        </dl>
      )}
    </aside>
  );
}
