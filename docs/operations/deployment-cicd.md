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

## Giới hạn: GitHub Pages chỉ phục vụ file tĩnh

Repo này có backend Cloudflare Worker (`worker/index.js`) cho `/api/*`. GitHub Pages không chạy
được Worker, nên sau khi chuyển sang Pages:

- **Chạy được:** duyệt trang, xem catalog (đọc Firestore trực tiếp bằng Firebase client), trang chính sách.
- **Không chạy được:** tạo đơn/checkout, trang quản trị, soi da AI (Gemini), đồng bộ POS S3.

`src/shared/config/runtime.js` trả `apiBaseUrl = '/api'` khi chạy trên `skinid.vn`, nên các request
này sẽ nhận `404` từ Pages. Muốn giữ các chức năng đó phải có backend chạy ở domain khác và trỏ
`VITE_API_BASE_URL` hoặc `VITE_WORKER_API_URL` vào đó lúc build.

Ngoài ra Worker đang xử lý sitemap.xml, robots.txt và meta SEO phía server. Trên Pages các đường
dẫn đó trả về SPA, nên mất phần SEO render động (canonical/OG vẫn có trong `index.html` tĩnh).

## Kiểm thử local

```sh
npm run test:all        # test + build production
npm run check:worker    # bundle thử Worker bằng Wrangler, không deploy
npm run preview         # xem bản build; không có API
```

Firestore/Storage rules không tự triển khai. Khi `firestore.rules`, `firestore.indexes.json` hoặc
`storage.rules` thay đổi, chạy riêng `npx firebase-tools deploy --project skinid-df273`.
