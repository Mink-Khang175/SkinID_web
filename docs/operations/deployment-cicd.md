# Triển khai tự động: GitHub → GitHub Pages

Mỗi push vào `main` chạy kiểm thử, build rồi phát hành `dist/` lên GitHub Pages.
Pull request chỉ chạy kiểm thử, không phát hành.

## Luồng chạy

`.github/workflows/frontend-ci.yml`

| Job | Điều kiện | Nội dung |
| --- | --- | --- |
| `test-build` | mọi push `main` và pull request | `npm ci` → `npm run test:all` → `npm run check:worker` |
| `deploy-pages` | chỉ push `main` | `npm ci` → `npm run build` → tạo `404.html`/`CNAME` → `deploy-pages` |

`deploy-pages` phụ thuộc `test-build`, nên không có bản phát hành nào khi test đỏ.

Bước "Prepare GitHub Pages bundle" tạo thêm trong `dist/`:

- `404.html` = bản sao `index.html` — để các route SPA như `/products`, `/chinh-sach-bao-mat`
  vẫn tải được khi mở trực tiếp hoặc F5.
- `.nojekyll` — tắt xử lý Jekyll, tránh bỏ qua thư mục bắt đầu bằng `_`.

Custom domain **không** ghi bằng `CNAME` trong artifact: nếu `skinid.vn` vẫn đang bị repo cũ giữ,
deploy sẽ thất bại với lỗi domain đã được dùng. Gắn domain qua Settings như mục dưới.

## Bật Pages lần đầu

Trong repo `Mink-Khang175/SkinID_web`:

1. **Settings → Pages → Build and deployment → Source: GitHub Actions.**
2. Push lên `main` để job `deploy-pages` chạy.
3. Sau khi xong, site tạm chạy tại `https://mink-khang175.github.io/SkinID_web/`.

Không chọn source "Deploy from a branch": `index.html` ở root là Vite shell trỏ `/src/main.jsx`,
phục vụ thẳng sẽ không có bundle và trang sẽ trắng.

## Gắn domain skinid.vn

Hiện `skinid.vn` đang gắn với Pages của repo cũ `danhhuynh-stack/skinid-web`. Một domain chỉ gắn
được với **một** Pages site, nên phải gỡ ở repo cũ trước:

1. Repo cũ → **Settings → Pages → Custom domain** → xoá `skinid.vn` (hoặc xoá file `CNAME`).
2. Repo mới → **Settings → Pages → Custom domain** → nhập `skinid.vn` → Save.
3. Bật **Enforce HTTPS** sau khi DNS xác thực xong.

DNS tại Matbao đã trỏ sẵn về GitHub Pages, không cần đổi nameserver:

| Bản ghi | Host | Giá trị |
| --- | --- | --- |
| A | `@` | `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153` |
| CNAME | `www` | `mink-khang175.github.io` |

`www.skinid.vn` **chưa có bản ghi nào** — cần thêm CNAME ở trên, nếu không subdomain này không phân giải.

Bước 1 làm site cũ ngừng phục vụ `skinid.vn` ngay khi lưu. Chỉ thực hiện khi đã sẵn sàng thay thế.

## Firebase cần cấu hình thêm

Project `skinid-df273` đã có `skinid.vn` trong **Authentication → Settings → Authorized domains**,
nhưng **chưa có `www.skinid.vn`**. Thêm vào trước khi dùng `www`, nếu không đăng nhập Google sẽ báo
`auth/unauthorized-domain`.

## Backend API: Worker riêng trên Cloudflare

GitHub Pages chỉ phục vụ file tĩnh nên không chạy được `worker/index.js`. Backend được deploy
riêng thành Worker **`skinid-web-v2`**:

```
https://skinid-web-v2.fieldman-vn.workers.dev
```

Worker tên `skinid-web` hiện có thuộc repo cũ `danhhuynh-stack/skinid-web` và do CI của repo đó
deploy. Không dùng lại tên này để tránh hai repo ghi đè lẫn nhau.

Build frontend nhận địa chỉ API qua biến trong job `deploy-pages`:

```yaml
env:
  VITE_API_BASE_URL: https://skinid-web-v2.fieldman-vn.workers.dev/api
```

`src/shared/config/runtime.js` đọc `VITE_API_BASE_URL` trước mọi suy luận khác, nên request
`/api/*` đi thẳng tới Worker thay vì same-origin `/api` trên Pages.

### Deploy Worker khi backend thay đổi

Worker không tự deploy trong CI. Chạy tay sau khi đã đăng nhập Cloudflare:

```sh
npm run build
npx wrangler deploy
```

Secret bắt buộc trên Worker (đặt bằng `npx wrangler secret put <TÊN>`):

- `FIREBASE_PROJECT_ID` = `skinid-df273`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY`
- `GEMINI_API_KEY` — thiếu thì `/api/analyze-skin` trả `503 gemini_not_configured`

S3 POS để trống (`S3_SYNC_ENABLED=false`) cho tới khi có tài khoản ES3 và mapping mã hàng.

`ALLOWED_ORIGINS` không bắt buộc: `worker/app/http.js` đã cho phép sẵn mọi host `*.skinid.vn`.

### Phần chỉ có trên Worker

`sitemap.xml`, `robots.txt` và meta SEO động do Worker render. Trên Pages các đường dẫn đó trả về
SPA, nên canonical/OG vẫn lấy từ `index.html` tĩnh.

## Kiểm thử local

```sh
npm run test:all        # test + build production
npm run check:worker    # bundle thử Worker bằng Wrangler, không deploy
npm run preview         # xem bản build; không có API
```

Firestore/Storage rules không tự triển khai. Khi `firestore.rules`, `firestore.indexes.json` hoặc
`storage.rules` thay đổi, chạy riêng `npx firebase-tools deploy --project skinid-df273`.

## Kiểm thử local

```sh
npm run test:all        # test + build production
npm run check:worker    # bundle thử Worker bằng Wrangler, không deploy
npm run preview         # xem bản build; không có API
```

Firestore/Storage rules không tự triển khai. Khi `firestore.rules`, `firestore.indexes.json` hoặc
`storage.rules` thay đổi, chạy riêng `npx firebase-tools deploy --project skinid-df273`.
