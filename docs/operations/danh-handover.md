# Bàn giao vận hành cho anh Danh mới

## Trạng thái bàn giao

**Cập nhật 05/11/2026:** đã sửa dữ liệu/rules Firestore `skinid-vietnam`, chuyển cấu hình local sang project công ty và bật bảo vệ xóa database. Xem [tài liệu database](../architecture/firestore.md). Mô tả chưa ghi/chưa triển khai bên dưới thuộc đợt phục hồi source trước đó; Worker vẫn do anh Danh triển khai.

Đã phục hồi source backend từ repo Danh cũ cùng Firebase rules/indexes/config; bổ sung bridge local, công cụ bảo trì, các sửa lỗi đơn hàng/POS và kiểm thử. Chưa deploy, import catalog, tạo tài khoản, cấp quyền hoặc gửi đơn/thông báo thật.

Project đang dùng: **skinid-vietnam**, thống nhất ở `.firebaserc`, `src/shared/config/runtime.js`, `.env.example`, `.dev.vars.example` và secret Worker `skinid-web-v2`. Catalog 54 sản phẩm đã chuyển từ `skinid-df273` sang `skinid-vietnam` giữ nguyên document ID; 55 document cũ của vietnam (gồm `test-product`) đã được xoá sau khi backup. File JSON khóa nằm local và được ignore.

## Cấu hình cần bổ sung

| Thành phần | Cấu hình | Trạng thái |
| --- | --- | --- |
| Firebase | Project, client email, private key / service account local | Đã đọc Firestore thành công |
| Firebase Auth | Providers, authorized domains, tài khoản có quyền | Anh Danh kiểm tra trên project mục tiêu |
| Firebase Storage | Bucket, rules và quyền upload/read | Source/config đã phục hồi; chưa upload thử |
| S3 POS | `S3_USERNAME`, `S3_PASSWORD`, base URL, branch/cashier | Chưa có; `S3_SYNC_ENABLED=false` |
| Mapping POS | `s3ProductId` nguyên dương trên từng sản phẩm | Phải đối soát mã thực tế trước bật sync |
| Gemini | `GEMINI_API_KEY`, model khi cần | Có cấu hình local; chưa gọi ảnh thật |
| Telegram | Bot token, chat ID | Chưa có; không gửi thông báo |
| VietQR | Tài khoản ngân hàng, quy trình xác nhận thu tiền | Thủ công, chưa có webhook đối soát |

S3 là **ES3/phần mềm bán lẻ**, không phải bucket Amazon. Các ID branch/cashier 9099/16614 là giá trị kế thừa, cần xác nhận với tài khoản được bàn giao.

## Nhận repo và kiểm tra

```powershell
npm ci
npm run check:config
npm run test:all
npm run check:worker
npm run dev -- --host 127.0.0.1 --port 5175 --strictPort
```

CI chạy test/build/bundle dry-run trên mọi push và PR; riêng push `main` phát hành `dist/` lên GitHub Pages sau khi test xanh (xem [triển khai CI/CD](deployment-cicd.md)). `npm run preview` chỉ là static frontend, không chạy API.

## Catalog, mapping và quyền

Các lệnh dưới mặc định chỉ kiểm tra; chỉ dùng `--apply` sau khi đã xem đúng project/dữ liệu. Đợt xây dựng này không chạy bước ghi.

```powershell
node scripts/backend/catalog.mjs
node scripts/backend/set-role.mjs --uid=FIREBASE_UID --role=super_admin
node scripts/backend/s3-mapping.mjs --file=duong-dan-mapping.json
```

Khi chủ quản đã chọn UID/dữ liệu và đồng ý thực hiện, thêm `--apply --project=skinid-vietnam`. Tài khoản cần đăng ký/đăng nhập website trước khi phân quyền theo email. Sau đổi custom claims, đăng nhập lại. Không cấp quyền dựa vào tham số URL hoặc chỉ có email chưa xác minh.

File mapping có dạng mảng JSON `[{"productId":"id-trong-catalog","s3ProductId":12345}]`; 12345 chỉ là ví dụ cấu trúc, phải thay bằng ID thực của ES3. Script kiểm tra ID catalog, số nguyên dương và trùng lặp; không tự đoán mapping.

## POS và đối soát lỗi

Đơn được lưu trước rồi dispatch POS ở server. `integrationOutbox/s3_<orderId>` ghi một trong `processing`, `completed`, `retryable`, `needs_review`.

- `completed`: trả lại kết quả cũ, không tạo đơn POS thứ hai.
- `retryable`: lỗi trước khi gửi đơn, có thể retry qua admin.
- `processing` hoặc `needs_review`: không tự retry. Kiểm tra ES3 bằng RequestId/mã đơn để biết đã tạo hay chưa; chỉ thay trạng thái nhật ký sau khi xác nhận thực tế.

Không giải phóng khóa chỉ vì đã qua vài giây: POS có thể nhận đơn trước lúc mất kết nối. Bước reconciliation tự động/queue chuyên dụng và giao thức idempotency ES3 cần triển khai thêm nếu mở rộng vận hành; hiện dùng khóa bền và đối soát thủ công cho kết quả chưa rõ.

## Chuẩn bị triển khai

Anh Danh quản lý Worker/Firebase deployment. Cloudflare không đọc được file JSON local: cấu hình các secret Firebase, AI, POS và Telegram qua môi trường server. Không đưa chúng vào Git hoặc biến `VITE_*`. Chốt origin/domain và giữ API chạy trước SPA fallback. Worker đã cấu hình route SEO/sitemap/robots và các tài nguyên sinh từ cùng nguồn nội dung.

Rules và indexes phục hồi trong repo là đầu vào triển khai; cần đối chiếu dữ liệu/quyền hiện tại và kiểm tra trong môi trường phù hợp trước áp dụng. Không có lệnh deploy tự chạy trong scripts/CI. Các ô chính sách V2.0 còn chờ xác nhận cần được chủ quản hoàn thiện trước công bố cam kết tương ứng.
