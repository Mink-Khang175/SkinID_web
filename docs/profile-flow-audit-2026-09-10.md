# Kiểm tra luồng profile người dùng (báo cáo lịch sử)

> Báo cáo ngày 2026-09-10 ghi nhận prototype cũ. Các kết luận về tài khoản, mật khẩu và lịch sử lưu trong `localStorage`/`sessionStorage` không còn mô tả mã hiện tại. Giữ file để tra cứu lịch sử, không dùng làm hướng dẫn triển khai.

## Trạng thái hiện tại

- `src/js/account/auth-firebase.js` dùng Firebase Authentication cho Email/Password và Google. Firebase SDK quản lý phiên đăng nhập; ứng dụng không lưu mật khẩu plaintext.
- Hồ sơ tại `users/{uid}` và lịch sử soi da tại `users/{uid}/skinReports/{reportId}` được đọc/ghi qua Firestore. Chức năng xóa lịch sử chỉ xóa báo cáo của người dùng đang đăng nhập, không xóa tài khoản hoặc hồ sơ.
- Giỏ của người dùng đăng nhập lưu tại `users/{uid}/commerce/cart`; giỏ khách tồn tại trong bộ nhớ trang cho tới khi đăng nhập.
- Quyền quản trị dựa trên Firebase custom claim `admin`; API Worker kiểm tra token cho thao tác đặc quyền.
- Ba ảnh đầu vào được gửi tới Cloudflare Worker và Gemini. Ứng dụng lưu báo cáo, không chủ động lưu ảnh chụp vào Firestore hoặc Storage. Kết quả chỉ mang tính tham khảo.

## Phạm vi báo cáo gốc

Bản audit gốc kiểm tra prototype local: đăng ký, đăng nhập, cập nhật hồ sơ, đổi mật khẩu, lịch sử soi da và các tab hồ sơ. Các nhận định về Google giả lập, mật khẩu plaintext, quyền quản trị qua cấu hình local và dữ liệu chỉ nằm trong trình duyệt **chỉ áp dụng cho phiên bản cũ**.

Muốn đánh giá bản hiện tại cần kiểm tra thêm cấu hình triển khai, Firebase Rules và API Worker. Việc đọc mã không xác nhận cấu hình dịch vụ production.
