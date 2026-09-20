# Cấu trúc React

- `layout/Header.jsx`: header, tìm kiếm và menu.
- `home/HeroBanner.jsx`: ba banner, gồm banner Soi da AI.
- `home/CategorySection.jsx`: khu vực Mua sắm nhanh.
- `home/ProductList.jsx`: bộ lọc và lưới sản phẩm.
- `home/BrandShowcase.jsx`: khu vực thương hiệu.
- `home/HelpSection.jsx`: tư vấn chọn sản phẩm.
- `analysis/SkincareRoutine.jsx`: luồng chụp ba góc, phân tích, báo cáo và phác đồ.
- `layout/Footer.jsx`, `layout/MobileNav.jsx`: footer và điều hướng mobile.
- `dialogs/StorefrontModals.jsx`, `dialogs/ProductDetailModal.jsx`: modal React dùng chung.

`src/App.jsx` điều phối route; `src/pages/HomePage.jsx` lắp trang chủ;
`src/pages/SkinAnalysisPage.jsx` lắp trang soi da từ cùng các component dùng chung;
`src/pages/ProfilePage.jsx` chứa hồ sơ và lịch sử người dùng.
`index.html` là shell duy nhất do Vite yêu cầu. Sau khi React mount,
`src/hooks/useLegacyApplication.js` nạp đúng nhóm nghiệp vụ cho route hiện tại.
