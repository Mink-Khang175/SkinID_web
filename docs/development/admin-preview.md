# Xem quản trị: dữ liệu thật và dữ liệu mẫu

## Dữ liệu thật

Chạy `npm run dev -- --host 127.0.0.1 --port 5175 --strictPort`, mở http://127.0.0.1:5175, đăng nhập tài khoản Firebase đúng project, rồi vào `/admin`.

Tài khoản cần quyền phù hợp từ Firebase/Firestore và ID token. Link `/admin?preview=1` không cấp quyền. Bộ dữ liệu mẫu không bổ sung vào danh sách đơn thật. Nếu chưa có admin ở project `skinid-df273`, anh Danh chọn UID hợp lệ và cấp quyền bằng quy trình trong [bàn giao](../operations/danh-handover.md); đợt này không tự cấp quyền tài khoản.

Trong tab **Hạ tầng & Kết nối**, nút kiểm tra gọi API server để xác minh Firebase hoặc đăng nhập POS. Chưa kiểm tra/thiếu cấu hình không được hiển thị “kết nối thành công”. VietQR ghi rõ chuyển khoản thủ công, không giả có đối soát tự động.

## Xem UI bằng dữ liệu mẫu

```powershell
npm run dev:ui -- --host 127.0.0.1 --port 5176 --strictPort
```

Mở http://127.0.0.1:5176/__preview, chọn **Quản trị — dữ liệu mẫu → Tổng quan & KPI**. Không cần tài khoản production; vai trò chỉ trong adapter local. Dữ liệu ghi vào localStorage `skinid-frontend-preview-v1` và có nút reset trên gallery.

| Tab | URL sau khi chọn vai trò |
| --- | --- |
| Tổng quan | `/admin` |
| Đơn hàng & S3 POS | `/admin?tab=orders` |
| CMS | `/admin?tab=cms` |
| Khuyến mãi | `/admin?tab=promotions` |
| Blog | `/admin?tab=blog` |
| Sản phẩm | `/admin?tab=products` |
| Đội ngũ & khách hàng | `/admin?tab=members` |
| Hạ tầng | `/admin?tab=system` |
| Nhật ký | `/admin?tab=audit-logs` |
| Cài đặt | `/admin?tab=settings` |

Để xem hồ sơ/checkout, quay về gallery và chọn nhóm khách hàng. QR, đơn `DEMO-*`, địa chỉ và báo cáo là minh họa. Các thao tác tích hợp chuyên biệt chưa mô phỏng sẽ báo không hỗ trợ, không gọi dịch vụ thật.
