import { DEFAULT_BLOG_ARTICLES } from '../data/blogArticles.js';
import { isFrontendPreview, previewBackend } from './runtime.js';
import usePageMetadata from '../hooks/usePageMetadata.js';
import './preview.css';

const groups = [
  ['Website công khai', 'guest', [
    ['Trang chủ','/'], ['Danh mục sản phẩm','/products'], ['Chi tiết sản phẩm','/products/twon-sua-tam'],
    ['Khuyến mãi & combo','/khuyen-mai'], ['Cẩm nang','/blog'], ['Đọc bài viết',`/blog/${DEFAULT_BLOG_ARTICLES[0].id}`],
    ['Soi da AI','/skin-analysis'], ['Thiết bị ACIE','/acie'], ['Tra cứu công bố','/tra-cuu-cong-bo'],
    ['Chính sách PDF V2.0','/thong-tin-don-vi-van-hanh'], ['Trang không tồn tại','/trang-khong-ton-tai']
  ]],
  ['Tài khoản & mua hàng', 'customer', [
    ['Hồ sơ tài khoản','/profile'], ['Lịch sử soi da mẫu','/profile?tab=history'], ['Đơn hàng mẫu','/profile?tab=orders'],
    ['Giỏ hàng & thanh toán','/products/twon-sua-tam'], ['Soi da khi đăng nhập','/skin-analysis']
  ]],
  ['Quản trị — dữ liệu mẫu', 'admin', [
    ['Tổng quan & KPI','/admin'], ['Đơn hàng & S3 POS','/admin?tab=orders'], ['Khối trang chủ / CMS','/admin?tab=cms'],
    ['Khuyến mãi','/admin?tab=promotions'], ['Blog','/admin?tab=blog'], ['Sản phẩm','/admin?tab=products'],
    ['Đội ngũ & khách hàng','/admin?tab=members'], ['Hạ tầng & kết nối','/admin?tab=system'],
    ['Nhật ký','/admin?tab=audit-logs'], ['Cài đặt','/admin?tab=settings']
  ]]
];

export default function PreviewPage() {
  usePageMetadata({ title: 'SkinID — Danh mục giao diện frontend', description: 'Công cụ local để xem và chỉnh sửa giao diện SkinID.' });
  if (!isFrontendPreview) return <main className="frontend-gallery"><h1>Chế độ xem giao diện đang tắt</h1><a href="/">Về website</a></main>;
  const open = (role, url) => { previewBackend.setRole(role); window.location.assign(url); };
  return <main className="frontend-gallery"><span className="frontend-gallery-label">SKINID · FRONTEND WORKSPACE</span><h1>Toàn bộ giao diện, trong một nơi.</h1><p>Source giao diện được đồng bộ từ bản đang deploy tại skinid.vn. Chọn nhóm để mở trang với vai trò mẫu tương ứng.</p><div className="frontend-gallery-note"><b>Chế độ xem giao diện</b><p>Dữ liệu khách hàng, đơn và báo cáo là minh họa, được lưu trong trình duyệt này. Không đăng nhập Firebase thật, không tạo đơn thật, không gửi ảnh lên AI/POS và không thanh toán. Để xem checkout, mở sản phẩm rồi chọn “Mua ngay”.</p></div><div className="frontend-gallery-grid">{groups.map(([title,role,links]) => <section key={title}><h2>{title}</h2>{links.map(([label,url]) => <button key={label} onClick={() => open(role,url)}>{label}<span aria-hidden="true">↗</span></button>)}</section>)}</div><button className="frontend-gallery-reset" onClick={() => { previewBackend.reset(); location.reload(); }}>Đặt lại dữ liệu mẫu và đăng xuất</button><p>Trong website, trở lại <code>/__preview</code> để đổi vai trò hoặc xem nhóm màn hình khác.</p></main>;
}
