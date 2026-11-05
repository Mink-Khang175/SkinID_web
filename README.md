# SkinID — Storefront & Backend

Repo làm việc chung cho giao diện React/Vite và backend Cloudflare Worker/Firebase đang được nối lại. Giai đoạn hiện tại tận dụng hệ thống đã có để hoàn thiện website; kế hoạch chuyển server Next.js/PostgreSQL thực hiện sau. Anh Danh mới phụ trách cấu hình môi trường và deploy.

Source tham chiếu: [repo Danh cũ](https://github.com/danhhuynh-stack/skinid-web), commit `01e7458958baff941d5bdd9bfe50b89a01fabe3f`. Giữ các cập nhật chức năng, chính sách V2.0 và style homepage local. Carousel, các nút gốc và footer trước đợt đổi style được giữ theo yêu cầu.

## Chạy hệ thống đang kết nối

Node.js 24, npm:

```powershell
cd D:\SkinID\skinid-web
npm ci
npm run check:config
npm run dev -- --host 127.0.0.1 --port 5175 --strictPort
```

Mở http://127.0.0.1:5175. Vite phục vụ frontend và `/api/*` cùng origin. `.env.local` bật `VITE_FRONTEND_PREVIEW=false`; `.dev.vars` chứa cấu hình server. Máy hiện tại đã được trỏ tới file service account người dùng cung cấp và project `skinid-df273`. File khóa không thuộc Git.

Lần checkout mới: dùng `.env.example` làm `.env.local`, `.dev.vars.example` làm `.dev.vars`, bổ sung service account đúng project theo [hướng dẫn môi trường](docs/development/setup.md). Không chép đè cấu hình local đã có.

## Xem admin

- Hệ thống thật: đăng nhập tài khoản Firebase có quyền quản trị, vào `/admin`. Không dùng tham số URL để cấp quyền.
- Xem UI bằng dữ liệu mẫu: `npm run dev:ui -- --host 127.0.0.1 --port 5176 --strictPort`, mở http://127.0.0.1:5176/__preview rồi chọn **Tổng quan & KPI**. Preview không kết nối dữ liệu thật.

Chi tiết: [hướng dẫn admin](docs/development/admin-preview.md).

## Cấu trúc

```text
src/                         Frontend theo tính năng
  app/, pages/               Router, providers và trang
  features/                  Auth, catalog, cart, admin, CMS, hồ sơ, soi da
  infrastructure/            Firebase client và HTTP client
  components/, shared/       Khối UI và tiện ích dùng chung
  assets/, data/, styles/    Tài nguyên, nội dung và style
  preview/                   Adapter dữ liệu mẫu, chỉ bật rõ bằng dev:ui
  js/                        Bridge legacy còn được sử dụng
worker/                      Backend kế thừa
  index.js                   Route, nghiệp vụ, Edge SEO và sitemap
  app/                       Lỗi, CORS, cấu hình và trạng thái tích hợp
  infrastructure/firebase/   Xác minh Firebase ID token
  firestore.js               Firestore REST và Auth quản trị ở server
  services/                  POS, nhật ký chống gửi trùng, Telegram
  *.generated.js             Catalog, blog, chính sách sinh từ nguồn frontend
scripts/dev/                 Adapter API Node/Vite và nạp môi trường server
scripts/backend/             Kiểm tra cấu hình, catalog, phân quyền, ánh xạ POS
scripts/generate-catalog.mjs  Sinh dữ liệu frontend/backend đồng nhất
firestore.rules, storage.rules, firestore.indexes.json
firebase.json, .firebaserc    Cấu hình Firebase
wrangler.jsonc               Entry Worker và static assets
.github/workflows/           Kiểm thử/build; push main phát hành GitHub Pages
tests/, docs/                Kiểm thử và tài liệu đang duy trì
```

Không đưa `node_modules`, `dist`, file môi trường thật hoặc service account lên Git. Không khôi phục thư mục ảnh trùng `public/`, cache hay script hotfix một lần vào source hoạt động.

## Kiểm tra

```powershell
npm run test:all
npm run check:worker
npm run check:config
```

`check:worker` chỉ bundle thử bằng Wrangler, không deploy. `check:config` kiểm tra cấu hình có mặt, không giả báo dịch vụ đã kết nối. Không tự tạo đơn hoặc gửi thông báo thật khi chạy tests.

## Trạng thái tích hợp

- Firebase frontend, CLI và backend cùng project `skinid-df273`; đã xác minh OAuth và đọc Firestore bằng service account, không ghi/nhập dữ liệu.
- Đơn hàng đi qua server; giá/voucher/phí được kiểm tra lại. Đồng bộ POS chỉ ở server, có khóa chống gửi trùng và trạng thái chờ đối soát.
- S3 POS chưa có tài khoản và mã sản phẩm POS thực tế: để tắt, anh Danh bổ sung sau. S3 ở đây là phần mềm bán lẻ ES3, không phải Amazon S3.
- Gemini có cấu hình local nhưng chưa gọi phân tích ảnh thật; Telegram chưa có cấu hình. VietQR hiện chuyển khoản thủ công, chưa có webhook đối soát tự động.
- Rules/Storage/Auth provider, tên miền và môi trường production cần anh Danh kiểm tra khi triển khai; đợt này chưa deploy, cấp quyền tài khoản hoặc migrate dữ liệu.

[Tài liệu](docs/README.md) · [Style](docs/design/style-system.md) · [Kiến trúc backend](docs/architecture/backend.md) · [Bàn giao anh Danh](docs/operations/danh-handover.md) · [Cộng tác GitHub](CONTRIBUTING.md)
