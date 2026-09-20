# SkinID ecommerce audit

## Đã có

- Catalog lấy từ Firestore và fallback dữ liệu đóng gói khi offline.
- Tìm kiếm từ Header, lọc thương hiệu/danh mục và sắp xếp giá.
- Chi tiết sản phẩm, giỏ hàng, thay đổi số lượng và xóa sản phẩm.
- Firebase Authentication bằng email/mật khẩu, Google, đặt lại và đổi mật khẩu.
- Hồ sơ người dùng và lịch sử soi da lưu trên Firestore.
- Checkout nhận thông tin giao hàng, COD/chuyển khoản; Cloud Function đọc lại sản phẩm và tính tổng tiền trước khi tạo đơn Firestore.
- Người dùng xem và hủy đơn hợp lệ tại `/profile?tab=orders`.
- Quản trị viên CRUD hồ sơ người dùng, đơn hàng và sản phẩm tại `/admin`; xóa tài khoản qua Cloud Function để xóa đồng thời Firebase Authentication và dữ liệu liên quan.

## Còn thiếu trước khi bán hàng thật

| Mức độ | Chức năng | Trạng thái/việc cần làm |
|---|---|---|
| Bắt buộc | Cổng thanh toán trực tuyến | Chưa tích hợp VNPay/MoMo/Stripe; cần tài khoản merchant, API server tạo giao dịch và webhook xác thực. |
| Bắt buộc | Quản lý tồn kho có khóa giao dịch | Cần trường `stock`, transaction khi đặt/hủy đơn và chặn bán vượt tồn. |
| Bắt buộc | Phí giao hàng | Cần quy tắc nội bộ hoặc API GHN/GHTK/Viettel Post. |
| Bắt buộc | Email/SMS xác nhận đơn | Cần nhà cung cấp email/SMS và template giao dịch. |
| Bắt buộc | Chính sách đổi trả/hoàn tiền | Cần workflow yêu cầu đổi trả, bằng chứng và trạng thái hoàn tiền. |
| Quan trọng | Địa chỉ giao hàng | Chưa có sổ địa chỉ nhiều địa chỉ/mặc định. |
| Quan trọng | Voucher/khuyến mãi | Chưa có collection coupon, điều kiện áp dụng và kiểm tra phía server. |
| Quan trọng | Đánh giá sản phẩm | Chưa có rating/review, kiểm duyệt và xác minh đã mua. |
| Quan trọng | Wishlist | Chưa có danh sách yêu thích đồng bộ tài khoản. |
| Quan trọng | Theo dõi vận chuyển | Chưa có mã vận đơn và đồng bộ trạng thái hãng vận chuyển. |
| Vận hành | Audit log quản trị | Cần ghi lại ai thay đổi giá, đơn hàng và trạng thái thanh toán. |
| Vận hành | Báo cáo doanh thu | Admin hiện chỉ có bảng dữ liệu, chưa có KPI doanh thu/chuyển đổi. |
| Đã xử lý | Backend xác thực giá | `createOrder` Cloud Function lấy giá hiện hành từ Firestore và tính lại tổng tiền; client không có quyền tự tạo document đơn hàng. |
| Bảo mật | Firebase App Check | Chưa bật để giảm request giả mạo từ client không hợp lệ. |

## Collections hiện dùng

- `products/{productId}`: catalog.
- `users/{uid}`: hồ sơ tài khoản.
- `users/{uid}/skinReports/{reportId}`: lịch sử soi da.
- `orders/{orderId}`: đơn hàng, snapshot sản phẩm, giao hàng và thanh toán.

Trạng thái đơn: `pending`, `confirmed`, `shipping`, `completed`, `cancelled`.
Trạng thái thanh toán: `unpaid`, `paid`, `refunded`.
