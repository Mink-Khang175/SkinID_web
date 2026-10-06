# Cấu trúc React hiện tại

`src/app/router.jsx` là nguồn khai báo route duy nhất. Mỗi page được lazy-load và
Cloudflare Static Assets trả SPA shell khi người dùng mở URL trực tiếp. `src/App.jsx`
chỉ gắn app providers và `RouterProvider`.

Các route hiện có:

- `/`, `/acie`: trang chủ và landing page.
- `/products`: catalog, tìm kiếm, lọc, sắp xếp và chi tiết sản phẩm.
- `/skin-analysis`: soi da, báo cáo và phác đồ chăm sóc.
- `/profile`: hồ sơ, lịch sử soi da và đơn hàng.
- `/admin`: dashboard quản trị người dùng, đơn hàng và sản phẩm.
- `/tra-cuu-cong-bo` (alias `/compliance`): tra cứu phiếu công bố mỹ phẩm.
- `/chinh-sach-bao-mat`: chính sách; route không tồn tại dùng trang 404.

- `layout/Header.jsx`: header, tìm kiếm và menu.
- `home/HeroBanner.jsx`: ba banner, gồm banner Soi da AI.
- `home/CategorySection.jsx`: khu vực Mua sắm nhanh.
- `features/catalog/ProductCatalog.jsx`: bộ lọc và lưới sản phẩm React theo URL.
- `home/BrandShowcase.jsx`: khu vực thương hiệu.
- `home/HelpSection.jsx`: tư vấn chọn sản phẩm.
- `analysis/SkincareRoutine.jsx`: luồng chụp ba góc, phân tích, báo cáo và phác đồ.
- `layout/Footer.jsx`, `layout/MobileNav.jsx`: footer và điều hướng mobile.
- `dialogs/StorefrontModals.jsx`: modal chính sách/tư vấn dùng chung.
- `features/catalog/ProductDetailModal.jsx`: chi tiết sản phẩm thuộc catalog.
- `features/catalog/services/catalogRepository.js`: lazy-load catalog đóng gói để hiện
  ngay; một truy vấn Firestore dùng chung bổ sung dữ liệu ở nền, không chặn render.
- `features/profile/components/ProfileHistoryTimeline.jsx`: timeline lịch sử soi da lấy dữ liệu
  từ Auth context; không render HTML thủ công trong script legacy.
- `features/profile/components/ProfileHistoryOverview.jsx`: KPI và biểu đồ SVG tiến
  trình sức khỏe da, không phụ thuộc Chart.js.
- `features/profile/components/ProfileOrders.jsx`: danh sách đơn hàng, xác nhận hủy
  và mua lại sản phẩm qua Cart context.
- `features/profile/components/ProfileScanDetailModal.jsx`: báo cáo phiên soi da,
  radar SVG, tư vấn chỉ số và sản phẩm phác đồ.
- `features/profile/components/ProfileHero.jsx`: banner tài khoản và cập nhật avatar.
- `features/profile/components/ProfileIdentityForm.jsx`: form hồ sơ controlled,
  dirty-state và địa chỉ hành chính tải qua service module.
- `features/cart/components/CartDrawer.jsx`: drawer giỏ hàng React dùng chung;
  state và persistence thuộc `CartProvider`.
- `features/cart/components/CheckoutModal.jsx`: checkout React controlled, địa chỉ
  Việt Nam, phí vận chuyển dự kiến và tạo đơn idempotent qua Worker.

`src/app/router.jsx` điều phối route; `src/pages/HomePage.jsx` lắp trang chủ;
`src/pages/SkinAnalysisPage.jsx` lắp trang soi da từ cùng các component dùng chung;
`src/pages/ProfilePage.jsx` chứa hồ sơ và lịch sử người dùng, không nạp bootstrap legacy.
`src/features/` là kiến trúc đích cho auth, cart, catalog, profile, admin và skin
analysis. Trong giai đoạn chuyển đổi, một phần nghiệp vụ vẫn được nạp qua
`src/hooks/useLegacyApplication.js`; hiện chỉ còn phục vụ home và skin-analysis.
Route catalog, profile, admin và tra cứu công bố không tải bootstrap legacy. Không thêm
nghiệp vụ mới vào `src/js/`; hãy đặt UI, state và API client mới trong feature sở hữu nó.
