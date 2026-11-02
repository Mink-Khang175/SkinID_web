# API và điểm nối frontend/backend

Hệ thống hiện tái sử dụng backend Worker/Firebase. Kế hoạch Next.js/PostgreSQL là giai đoạn sau. [Kiến trúc hiện tại](../architecture/backend.md).

HTTP client: `src/infrastructure/http/apiClient.js`, mặc định `/api`, gửi Firebase ID token trong Bearer header. Không tự fallback sang domain Worker cũ. Lỗi JSON có `success: false`, `code`, `message`; status 401/403/409/503 được hiển thị thành lỗi thao tác, không giả thành công bằng local override.

| Method / route sau `/api` | Chức năng |
| --- | --- |
| `GET /health` | Liveness công khai, không xác nhận mọi tích hợp |
| `GET /orders` | Đơn của người dùng / theo quyền server |
| `POST /orders` | Tạo đơn, tính lại tiền, idempotency header |
| `PATCH /orders/:id` | Hủy đơn theo chủ sở hữu và trạng thái |
| `POST /admin/orders/:id/transition` | Chuyển trạng thái có kiểm tra vòng đời và audit |
| `POST /admin/orders/:id/resync-s3` | Gửi lại POS có kiểm quyền/khóa chống trùng |
| `POST /analyze-skin` | Phân tích ảnh, cần cấu hình Gemini |
| `GET /admin/staff` | Danh sách nhân sự |
| `POST /admin/staff/roles` | Đồng bộ role và Firebase custom claims |
| `GET, POST /admin/audit-logs` | Nhật ký theo quyền |
| `DELETE /admin/users/:id` | Xóa tài khoản theo nghiệp vụ kế thừa |
| `GET /admin/integrations` | Trạng thái có cấu hình, không lộ secret |
| `POST /admin/integrations/check` | Probe Firebase hoặc S3 từ server, không tạo đơn |

Payload xem trực tiếp service/frontend và handler server. UI quản trị trạng thái đơn dùng route transition; lưu hồ sơ/CMS/catalog vẫn có phần Firestore trực tiếp theo rules. Chỉ đổi URL không chuyển được các phần này sang database khác.

## Ranh giới khi chuyển server sau này

- Thay auth provider và HTTP client nếu dùng cookie session thay Firebase token.
- Thay repository theo tính năng, giữ props/component UI ổn định.
- Giữ server là nguồn quyết định giá/khuyến mãi/trạng thái/quyền; tách POS và thông báo thành adapter server.
- Chuyển dữ liệu bằng kế hoạch migration riêng, không trộn `skinid-df273` với project cũ `skinid-vietnam`.
- Chốt quy trình lưu/xóa ảnh, đối soát thanh toán và đồng bộ tồn kho cùng đơn vị vận hành. Backend đang giữ logic kế thừa; không tự xem KPI demo hoặc điều khoản chính sách là bằng chứng tích hợp.
