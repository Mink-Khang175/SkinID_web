# SkinID — React Vite storefront

Trang chủ, trang soi da và hồ sơ tài khoản dùng chung một ứng dụng React + Vite.
Các màn hình được tách thành component JSX và giữ nguyên toàn bộ class giao diện.
Tailwind CSS được Vite biên dịch khi chạy dev/build, không còn phụ thuộc CDN production.

## Chạy local

```sh
npm install
npm run dev
```

Mở `http://localhost:5173`. Các route chính là `/`, `/skin-analysis`, `/profile` và `/admin`.
Không mở dự án bằng `file://`.

## Cấu trúc

```text
index.html                    Shell duy nhất do Vite yêu cầu
src/
  main.jsx                    React entry
  App.jsx                     Chọn page theo URL
  pages/HomePage.jsx          Trang chủ
  pages/SkinAnalysisPage.jsx  Trang soi da
  pages/ProfilePage.jsx       Trang hồ sơ và lịch sử
  assets/images/              Toàn bộ ảnh giao diện và sản phẩm
  components/
    layout/       Header, footer, offer bar, mobile navigation (.jsx)
    home/         Hero, danh mục, catalog, thương hiệu, trợ giúp (.jsx)
    analysis/     Giao diện phác đồ/scan/account được chuyển sang JSX
    dialogs/      Các modal React dùng chung
  styles/         CSS giao diện hiện có, không thay đổi thiết kế
  data/           products.js: dữ liệu local của 54 sản phẩm
  js/
    app/          Bootstrap, Firebase client và cấu hình public không chứa bí mật
    catalog/      Product Card, bộ lọc, tương tác trang chủ
    analysis/     Chụp ảnh, phân tích và dựng báo cáo
    account/      Firebase Authentication, profile và lịch sử Firestore
    cart/         Giỏ hàng và checkout
    services/     Dịch vụ email hiện có
worker/                       Cloudflare Worker: checkout, Gemini và tác vụ admin
tests/            Kiểm thử hồi quy chạy bằng Node
scripts/          Kiểm tra catalog và nhập dữ liệu Firestore
docs/             Kiến trúc, kiểm tra dữ liệu, hướng dẫn tích hợp
dist/             Kết quả build tạm thời, được tạo lại và không lưu trong Git
```

## Chỉnh ở đâu?

- Điều phối route: `src/App.jsx`.
- Thứ tự lắp ráp trang chủ: `src/pages/HomePage.jsx`.
- Bố cục trang chủ: các file `.jsx` trong `src/components/home/`.
- Component chung: `src/components/layout/`, `src/components/dialogs/` và `src/components/analysis/`.
- Màu, khoảng cách, responsive: src/styles/site.css.
- Thẻ sản phẩm: src/js/catalog/product-card.js.
- Quy tắc phân loại/lọc: src/js/catalog/product-filters.js.
- Dữ liệu sản phẩm local: src/data/products.js.
- Cấu hình Firebase client công khai: src/js/app/runtime-config.js.

React render xong DOM trước, sau đó `useLegacyApplication` chỉ tải nhóm script nghiệp
vụ cần cho route hiện tại. Vite quản lý và tạo URL có hash cho ảnh trong `src/assets`.
Cloudflare Workers Static Assets rewrite mọi URL về React SPA, nên các route `/profile`,
`/skin-analysis` và `/admin` vẫn hoạt động khi tải lại trực tiếp.

`npm run dev` chạy giao diện Vite trực tiếp. `npm run dev:cloudflare` build rồi chạy
cả static assets và API Worker; lệnh này cần file `.dev.vars` chứa secret local.

## Kiểm tra

```sh
npm test
npm run test:all
npm run audit:catalog
npm run firestore:import-products
npm run dev:cloudflare
```

`npm run test:all` kiểm tra frontend, Worker và chạy Vite production build.

`dist/` được tạo bởi `npm run build` cho Cloudflare Static Assets. Không sửa trực tiếp file trong
thư mục này vì mọi nội dung sẽ bị thay thế ở lần build tiếp theo.

Lệnh import Firestore mặc định chỉ kiểm tra dữ liệu. Sau khi cấu hình service-account
credential trong `.env`, chạy `npm run firestore:import-products -- --commit` để upsert
collection `products`; script không xóa document ngoài catalog local.

## Trạng thái tích hợp

- [Kết nối phần mềm bán hàng](docs/sales-api-integration.md): chỉ là thiết kế/hướng dẫn,
  chưa có kết nối nào được triển khai.
- [Gemini và bảo mật](docs/gemini-setup.md): Cloudflare Worker dùng
  `GEMINI_API_KEY` từ Worker Secret và Firebase Authentication trước khi gọi Gemini.
- Firebase Auth quản lý Email/Password và Google; profile/lịch sử nằm trong Firestore.
- Checkout gọi Cloudflare Worker để xác minh giá và tạo đơn; trang `/admin` CRUD dữ liệu Firestore theo custom claim `admin`.
- [Triển khai GitHub → Cloudflare](docs/cloudflare-deployment.md): CI/CD tự động cho cả website và API.
- [Thiết lập Firebase ecommerce](docs/firebase-ecommerce-setup.md): Authentication, backend và quyền admin.
- [Báo cáo catalog](docs/catalog-audit-2026-09-10.md).
- Catalog ưu tiên đọc collection `products` từ Firestore và dùng fixture local khi mất mạng.
- Kết quả phân tích da chỉ mang tính tham khảo, không thay thế chẩn đoán y khoa.

Không đặt bí mật vào `src/`, HTML hoặc bất kỳ thư mục nào được static server phục vụ.
Đổi tên thư mục thành config hay dùng Base64 không làm dữ liệu bí mật hơn.
Mỗi push lên `main` được GitHub Actions kiểm thử rồi triển khai Cloudflare Worker và
static assets. Firestore Rules được triển khai riêng khi thay đổi. `.env`, `.dev.vars`,
Worker Secrets và credential CI không được đưa vào static assets hoặc repository.
