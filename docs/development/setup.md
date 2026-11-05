# Chạy local và cấu hình môi trường

Dùng Node.js 24, npm và thư mục repo `D:\SkinID\skinid-web`. Không thao tác Git ở thư mục cha.

## Môi trường kết nối

Frontend đọc `.env.local`, server Node/Vite đọc `.dev.vars`. Máy hiện tại đã có cấu hình; chỉ copy file mẫu khi checkout mới, tránh ghi đè khóa local.

```powershell
npm ci
npm run check:config
npm run dev -- --host 127.0.0.1 --port 5175 --strictPort
```

Frontend và `/api` cùng ở cổng 5175. API liveness: `/api/health`. Đơn hàng/admin API yêu cầu Firebase ID token, không bỏ qua xác thực khi chạy local. Nếu thiếu khóa server, thao tác trả lỗi cấu hình thay vì ghi đơn vào bộ nhớ và báo thành công.

## Xem UI cách ly

```powershell
npm run dev:ui -- --host 127.0.0.1 --port 5176 --strictPort
```

Mode `ui` lấy `.env.ui` và bật dữ liệu mẫu. `/__preview` chỉ hoạt động ở mode này. Mặc định code là kết nối thật, không tự bật preview khi thiếu biến môi trường. Không đưa `VITE_FRONTEND_PREVIEW=true` vào bản build dùng cho khách hàng.

## API riêng khi cần

`npm run dev:api` mở API Node ở 127.0.0.1:8787. Nếu frontend gọi sang cổng này, cấu hình `VITE_API_BASE_URL` và allowlist origin cụ thể trong `.dev.vars`; Vite cùng origin là cách chạy mặc định đơn giản hơn.

## Các lệnh

| Lệnh | Mục đích |
| --- | --- |
| `npm run catalog:generate` | Sinh catalog frontend/server, metadata blog/chính sách |
| `npm test` | Toàn bộ kiểm thử frontend và backend |
| `npm run build` | Sinh dữ liệu và build frontend có kết nối |
| `npm run build:ui` | Build dữ liệu mẫu; chỉ dùng kiểm tra UI |
| `npm run test:all` | Test rồi build |
| `npm run check:worker` | Bundle Worker dry-run, không triển khai |
| `npm run check:config` | Kiểm tra tên cấu hình còn thiếu, không in giá trị khóa |
| `npm run preview` | Xem static build; không chạy API Worker |

Vite preview không phục vụ backend. Muốn xem toàn hệ thống dùng `dev`, hoặc anh Danh dùng môi trường Worker phù hợp sau build.

## Bảo vệ môi trường

`GOOGLE_APPLICATION_CREDENTIALS` là đường dẫn JSON service account cho Node local. Loader kiểm tra project của khóa trùng `FIREBASE_PROJECT_ID`. Cloudflare Worker dùng các secret `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`, `FIREBASE_PROJECT_ID`; Worker không đọc file khóa trên máy.

Mọi biến `VITE_*` là cấu hình công khai của trình duyệt. Không đưa khóa AI, khóa riêng Firebase, mật khẩu POS, Telegram token hoặc đường dẫn nội bộ vào biến `VITE_*`. Firebase web config là cấu hình client; quyền truy cập vẫn do Auth/rules/backend kiểm soát.

Frontend, `.firebaserc` và server đang dùng `skinid-vietnam`. Trước đây repo trỏ `skinid-df273`; catalog đã được chuyển sang `skinid-vietnam` với cùng document ID. Không trộn token hai project.

Assets có một nguồn tại `src/assets`, `publicDir: false`. Hosting cần chuyển `/api/*` tới Worker trước fallback SPA. Build còn cảnh báo chunk lớn như trước; chưa tối ưu bundle trong đợt nối backend.
