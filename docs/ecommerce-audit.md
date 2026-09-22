# SkinID ecommerce audit

## Đã có trong mã hiện tại

- Catalog đọc Firestore, fallback dữ liệu đóng gói khi không tải được; tìm kiếm, lọc, sắp xếp và xem chi tiết sản phẩm.
- Giỏ khách trong bộ nhớ trang; giỏ của tài khoản đăng nhập lưu tại `users/{uid}/commerce/cart`.
- Firebase Authentication bằng email/mật khẩu và Google; hồ sơ, lịch sử soi da, đơn hàng trong Firestore.
- Checkout hiển thị COD và thu thập địa chỉ giao hàng. Cloudflare Worker xác minh Firebase ID token, đọc lại giá từ Firestore (hoặc catalog đóng gói khi sản phẩm chưa có trên Firestore), tính tổng và tạo đơn. Phí giao hàng là 30.000đ; miễn phí khi tạm tính từ 500.000đ.
- Worker ghi địa chỉ checkout gần nhất vào `users/{uid}/addresses/default` và sự kiện tạo đơn vào `users/{uid}/activities/{orderId}`.
- Người dùng xem và hủy đơn đủ điều kiện ở `/profile?tab=orders`. Admin quản lý hồ sơ, đơn hàng và sản phẩm tại `/admin`; xóa tài khoản và dữ liệu liên quan qua Cloudflare Worker.

## Còn thiếu hoặc cần hoàn thiện trước khi bán hàng thật

| Mức độ | Chức năng | Trạng thái/việc cần làm |
| --- | --- | --- |
| Bắt buộc | Thanh toán trực tuyến | UI hiện chỉ cho chọn COD; chưa tích hợp cổng thanh toán và webhook. Worker có nhận `bank_transfer` nhưng giao diện chưa cung cấp lựa chọn này. |
| Bắt buộc | Tồn kho | Chưa có kiểm tra và trừ tồn kho bằng giao dịch khi đặt/hủy đơn. |
| Bắt buộc | Giao hàng | Đã có mức phí theo ngưỡng; cần xác nhận chính sách thực tế hoặc tích hợp hãng vận chuyển. |
| Bắt buộc | Xác nhận đơn | Chưa xác nhận luồng email/SMS giao dịch cho đơn hàng. |
| Bắt buộc | Đổi trả/hoàn tiền | Chưa có quy trình yêu cầu đổi trả và hoàn tiền. |
| Quan trọng | Sổ địa chỉ | Chỉ tự ghi địa chỉ checkout gần nhất vào `addresses/default`; chưa có giao diện quản lý nhiều địa chỉ. |
| Quan trọng | Voucher, đánh giá, wishlist | Chưa có luồng người dùng hoàn chỉnh. Rules đã khai báo đường dẫn wishlist. |
| Quan trọng | Theo dõi vận chuyển | Chưa có mã vận đơn hoặc đồng bộ trạng thái hãng vận chuyển. |
| Vận hành | Audit log quản trị | Worker ghi sự kiện tạo đơn; chưa có log đầy đủ cho thay đổi giá, đơn và thanh toán của admin. |
| Vận hành | Báo cáo doanh thu | Admin có bảng dữ liệu và số lượng, chưa có KPI doanh thu/chuyển đổi. |
| Bảo mật | Firebase App Check | Chưa thấy cấu hình App Check trong mã hiện tại. |

## Collections hiện dùng

- `products/{productId}`: catalog.
- `users/{uid}`: hồ sơ.
- `users/{uid}/commerce/cart`: giỏ của người dùng đăng nhập.
- `users/{uid}/addresses/default`: địa chỉ checkout gần nhất.
- `users/{uid}/activities/{orderId}`: sự kiện tạo đơn.
- `users/{uid}/skinReports/{reportId}`: lịch sử soi da.
- `orders/{orderId}`: đơn hàng, snapshot sản phẩm, giao hàng và thanh toán.

Trạng thái đơn trong giao diện admin: `pending`, `confirmed`, `shipping`, `completed`, `cancelled`. Trạng thái thanh toán: `unpaid`, `paid`, `refunded`.

Đây là rà soát mã trong repository, chưa xác nhận cấu hình dịch vụ hoặc dữ liệu production.
