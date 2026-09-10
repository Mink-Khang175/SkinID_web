# Cấu trúc giao diện trang chủ

- `header.html`: header, tìm kiếm và menu.
- `hero-carousel.html`: ba banner, gồm banner Soi da AI.
- `category-section.html`: khu vực Mua sắm nhanh.
- `catalog-section.html`: bộ lọc và lưới sản phẩm.
- `brand-section.html`: khu vực thương hiệu.
- `help-section.html`: tư vấn chọn sản phẩm.
- `footer.html`, `mobile-nav.html`: footer và điều hướng mobile.
- `legacy-modals.html`: giao diện đầy đủ của luồng chụp 3 góc, phân tích và báo cáo; được dùng bởi `skin-analysis.html`.
- `storefront-modals.html`: các modal tư vấn/chính sách dùng chung giữa trang chủ và trang soi da.

`index.html` là trang bán hàng chính. `skin-analysis.html` là trang chức năng soi da riêng nhưng tái sử dụng `header.html`, `footer.html`, `mobile-nav.html` và hệ thống giỏ hàng. Khi chạy qua web server, `src/js/app/bootstrap.js` nạp component trước rồi mới khởi tạo JavaScript của website.
