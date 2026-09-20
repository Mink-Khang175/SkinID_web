import useLegacyApplication from '../hooks/useLegacyApplication.js';
import usePageMetadata from '../hooks/usePageMetadata.js';

export default function AdminPage() {
  usePageMetadata({ title: 'Quản trị thương mại điện tử | SkinID.vn', description: 'Quản lý dữ liệu SkinID.' });
  useLegacyApplication('admin');
  return (
    <div className="admin-page min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-20"><div className="container py-4 flex items-center justify-between"><div><span className="section-kicker">SKINID ADMIN</span><h1 className="text-xl font-black">Quản trị thương mại điện tử</h1></div><a href="/" className="btn btn--outline">Về cửa hàng</a></div></header>
      <main className="container py-8">
        <div id="admin-status" className="rounded-2xl bg-white border p-6 text-sm text-gray-500">Đang xác thực quyền quản trị…</div>
        <section id="admin-dashboard" className="hidden space-y-7">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4"><div className="admin-kpi"><span>Người dùng</span><strong id="admin-user-count">0</strong></div><div className="admin-kpi"><span>Đơn hàng</span><strong id="admin-order-count">0</strong></div><div className="admin-kpi"><span>Sản phẩm</span><strong id="admin-product-count">0</strong></div></div>
          <div id="admin-flash" className="admin-flash hidden" role="status"></div>
          <section className="admin-panel"><h2>Đơn hàng</h2><div className="admin-table-wrap"><table><thead><tr><th>Mã đơn</th><th>Khách hàng</th><th>Giao tới</th><th>Sản phẩm</th><th>Tổng tiền</th><th>Thanh toán</th><th>Trạng thái</th><th>Thao tác</th></tr></thead><tbody id="admin-orders-body"></tbody></table></div></section>
          <section className="admin-panel"><h2>Người dùng</h2><p className="admin-panel__hint">Chỉnh sửa hồ sơ Firestore hoặc xóa toàn bộ tài khoản Firebase Authentication và dữ liệu liên quan.</p><div className="admin-table-wrap"><table><thead><tr><th>Email</th><th>Họ tên</th><th>Số điện thoại</th><th>Nhà cung cấp</th><th>Thao tác</th></tr></thead><tbody id="admin-users-body"></tbody></table></div></section>
          <section className="admin-panel"><div className="admin-panel__heading"><div><h2>Sản phẩm Firestore</h2><p className="admin-panel__hint">Thêm, sửa và xóa trực tiếp collection products.</p></div><button id="admin-add-product" type="button" className="btn btn--primary">Thêm sản phẩm</button></div><div className="admin-table-wrap"><table><thead><tr><th>Sản phẩm</th><th>Thương hiệu</th><th>Giá</th><th>Danh mục</th><th>Thao tác</th></tr></thead><tbody id="admin-products-body"></tbody></table></div></section>
        </section>
      </main>
      <dialog id="admin-editor" className="admin-dialog">
        <form id="admin-editor-form" method="dialog">
          <div className="admin-dialog__heading"><div><span className="section-kicker">FIRESTORE</span><h2 id="admin-editor-title">Chỉnh sửa</h2></div><button type="button" className="admin-icon-button" data-admin-close aria-label="Đóng">×</button></div>
          <input id="admin-editor-kind" type="hidden" />
          <input id="admin-editor-id" type="hidden" />
          <div id="admin-user-fields" className="admin-form-grid hidden">
            <label>Email<input id="admin-user-email" type="email" disabled /></label>
            <label>Họ tên<input id="admin-user-name" type="text" /></label>
            <label>Số điện thoại<input id="admin-user-phone" type="tel" /></label>
            <label className="admin-form-grid__wide">Địa chỉ<textarea id="admin-user-address" rows="3"></textarea></label>
          </div>
          <div id="admin-product-fields" className="admin-form-grid hidden">
            <label>Mã sản phẩm<input id="admin-product-id" type="text" required /></label>
            <label>Tên sản phẩm<input id="admin-product-name" type="text" required /></label>
            <label>Thương hiệu<input id="admin-product-brand" type="text" required /></label>
            <label>Giá bán<input id="admin-product-price" type="number" min="0" required /></label>
            <label>Giá gốc<input id="admin-product-original-price" type="number" min="0" /></label>
            <label>Dung tích<input id="admin-product-volume" type="text" /></label>
            <label>Danh mục<select id="admin-product-step"><option value="cleanser">Làm sạch</option><option value="toner">Cân bằng</option><option value="treatment">Đặc trị</option><option value="moisturizer">Dưỡng ẩm</option><option value="sunscreen">Chống nắng</option><option value="special">Cơ thể & nước hoa</option></select></label>
            <label>Dòng sản phẩm<input id="admin-product-line" type="text" /></label>
            <label className="admin-form-grid__wide">Đường dẫn ảnh<input id="admin-product-image" type="text" placeholder="/images/products/..." /></label>
            <label className="admin-form-grid__wide">Công dụng<textarea id="admin-product-uses" rows="3"></textarea></label>
          </div>
          <div className="admin-dialog__actions"><button type="button" className="btn btn--outline" data-admin-close>Hủy</button><button type="submit" className="btn btn--primary">Lưu thay đổi</button></div>
        </form>
      </dialog>
    </div>
  );
}
