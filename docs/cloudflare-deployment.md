# Triển khai miễn phí: GitHub → Cloudflare Workers

SkinID dùng một Cloudflare Worker để phục vụ cả thư mục Vite `dist/` và API `/api/*`.
Mỗi push vào nhánh `main` được GitHub Actions kiểm thử, build và triển khai tự động.
Firebase Authentication và Firestore tiếp tục là hệ thống danh tính và dữ liệu.

## 1. Tạo Worker lần đầu

1. Đăng nhập [Cloudflare Dashboard](https://dash.cloudflare.com/).
2. Mở **Workers & Pages** → **Create** → **Worker** → **Hello World**.
3. Đặt tên Worker là `skinid-web`, sau đó chọn **Deploy**.
4. Trong **Account home**, mở menu tài khoản và sao chép **Account ID**.

## 2. Tạo API token cho GitHub

1. Mở **My Profile** → **API Tokens** → **Create Token**.
2. Chọn template **Edit Cloudflare Workers**.
3. Giới hạn token vào đúng tài khoản chứa Worker rồi tạo token.
4. Không gửi hoặc commit token vào repository.

Trong GitHub repository, mở **Settings → Secrets and variables → Actions → New repository secret** và tạo:

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

Workflow `.github/workflows/cloudflare-deploy.yml` sẽ tự chạy khi push `main`.

## 3. Cấu hình bí mật Worker

Ở máy đã đăng nhập Cloudflare CLI, chạy từng lệnh và dán giá trị tương ứng:

```sh
npx wrangler login
npx wrangler secret put FIREBASE_PROJECT_ID
npx wrangler secret put FIREBASE_CLIENT_EMAIL
npx wrangler secret put FIREBASE_PRIVATE_KEY
npx wrangler secret put GEMINI_API_KEY
npx wrangler secret put ALLOWED_ORIGINS
```

Giá trị Firebase lấy trong file service-account JSON:

- `project_id` → `FIREBASE_PROJECT_ID`
- `client_email` → `FIREBASE_CLIENT_EMAIL`
- `private_key` → `FIREBASE_PRIVATE_KEY`

`ALLOWED_ORIGINS` là URL production, ví dụ `https://skinid-web.<subdomain>.workers.dev`.
Các secret chỉ nằm trong Cloudflare, không được đưa vào `src/`, `.env` hoặc GitHub source.

## 4. Cho phép đăng nhập trên domain Cloudflare

Trong Firebase Console:

1. Mở **Authentication → Settings → Authorized domains**.
2. Chọn **Add domain**.
3. Thêm hostname Cloudflare, ví dụ `skinid-web.<subdomain>.workers.dev`.

Nếu dùng custom domain, thêm cả custom domain đó.

## 5. Firestore Rules

Rules đã tách khỏi hosting và Worker. Khi `firestore.rules` thay đổi, triển khai bằng:

```sh
npm run firestore:deploy-rules
```

Client không được phép tự tạo `orders`. Worker xác minh Firebase ID token, đọc giá thật
từ `products`, tính lại tổng tiền rồi mới ghi đơn, địa chỉ mặc định và activity log.

## 6. Kiểm thử local

`npm run dev` chỉ chạy giao diện Vite. Để chạy cả Worker và API:

1. Tạo `.dev.vars` từ tên biến trong `.env.example`.
2. Chạy `npm run dev:cloudflare`.
3. Mở URL do Wrangler hiển thị.

`.dev.vars` đã nằm trong `.gitignore`.
