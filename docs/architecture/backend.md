# Kiến trúc backend hiện tại

## Hai giai đoạn

Project hiện tại là `skinid-vietnam`. Xem [kết quả kiểm tra Firestore 05/11/2026](firestore.md) cho các sửa chữa đã áp dụng lên database/rules thật. Các mô tả chưa triển khai dưới đây thuộc đợt phục hồi source trước đó.

1. Hiện tại: tái sử dụng Cloudflare Worker, Firebase Auth/Firestore/Storage, Gemini và ES3 POS từ source đã có; giữ UI theo style local. Hoàn thiện cấu hình và vận hành website trước kế hoạch chuyển server.
2. Sau này: anh Danh đánh giá chuyển backend sang Next.js/PostgreSQL. Chưa đổi database/framework trong đợt này; service frontend là ranh giới để migration từng phần.

## Luồng dữ liệu

```text
React → Firebase Auth → ID token
React → /api → Worker xác minh token → nghiệp vụ → Firestore REST
                                             → integrationOutbox → ES3 POS
                                             → Gemini / Telegram (khi cấu hình)
React → Firebase SDK → catalog/CMS/hồ sơ/giỏ/Storage theo rules
```

Auth/Firestore/Storage ở trình duyệt tiếp tục dùng Firebase SDK và rules. Đơn hàng, thay đổi vai trò, xóa tài khoản và tác vụ POS chạy qua backend. Không giả định việc đổi URL HTTP đã thay mọi truy cập Firestore trực tiếp.

## Trách nhiệm thư mục

- `worker/index.js`: dispatcher API và các nghiệp vụ kế thừa, Edge SEO, robots/sitemap. Giữ entry tương thích source; không đổi toàn bộ đường dẫn trong một đợt nối lại.
- `worker/app/`: lỗi có mã/status, CORS allowlist, chuẩn hóa cấu hình và trạng thái tích hợp không lộ secret.
- `worker/infrastructure/firebase/auth.js`: kiểm tra chữ ký RS256, issuer/audience của Firebase ID token.
- `worker/firestore.js`: OAuth service account, mã hóa dữ liệu REST, đọc/query/commit và thao tác Auth quản trị. Metadata phiên bản hỗ trợ ghi có precondition.
- `worker/services/s3Service.js`: adapter giao thức ES3, token cache theo tài khoản, mapping payload, timeout toàn chuỗi.
- `worker/services/s3Dispatch.js`: khóa/nền tảng nhật ký dispatch lưu bền để tránh gửi trùng POS.
- `worker/services/telegramService.js`: thông báo khi có cấu hình; chưa bật trên máy hiện tại.
- `scripts/dev/`: nạp secret local và bridge Node Request/Response tới cùng Worker handler; body giới hạn 12 MiB. Không giả lập đơn trong chế độ kết nối.
- `scripts/backend/`: công cụ bảo trì mặc định chỉ validate, thao tác ghi cần `--apply` và project chỉ định rõ.

Không khôi phục cache `.wrangler`, dependency, ảnh trùng hoặc script sửa nóng một lần vào hệ thống hoạt động. Lịch sử source vẫn có trong clone tham chiếu và kho lưu trữ ngoài repo.

## Đơn hàng và tính giá

Server đọc sản phẩm tin cậy, kiểm số lượng, tính lại giá/voucher/phí; bỏ giá client gửi lên. Phí tiêu chuẩn 30.000đ, miễn từ 500.000đ. Voucher freeship không được trừ thêm 30.000đ vào tiền hàng. Khi có Firestore, voucher đã xóa không tự sống lại bằng danh sách demo.

ID đơn xác định từ user + idempotency key; commit tạo mới có precondition, chống tạo trùng khi request đồng thời. Đếm lượt voucher dùng precondition phiên bản trong cùng batch với đơn. Nếu dữ liệu đã đổi, client nhận lỗi xung đột để thử lại; không báo đã lưu nếu commit thất bại.

S3 nhận mapping sản phẩm từ dữ liệu server, không lấy số thứ tự dòng làm mã POS. Chọn chuyển khoản chưa có nghĩa đã thu tiền; trạng thái chờ thanh toán không gửi số tiền đã nhận sang POS.

## Tích hợp chưa bật

POS cần tài khoản thật, branch/cashier và bảng mapping. Storage rules/Auth provider/domain, API Gemini và các cam kết lưu/xóa dữ liệu cần kiểm tra khi triển khai. Đọc Firestore thành công chưa chứng minh mọi tích hợp đã chạy E2E. Không migrate hay cấp quyền production tự động.

Tham khảo chính thức: [Firebase ID token](https://firebase.google.com/docs/auth/admin/verify-id-tokens), [Cloudflare secrets](https://developers.cloudflare.com/workers/configuration/secrets/).
