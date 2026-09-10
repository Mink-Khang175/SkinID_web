# Kiểm tra luồng profile người dùng

## Đã kiểm tra

- Đăng ký: tên, email, số điện thoại Việt Nam, mật khẩu xác nhận và email trùng.
- Đăng nhập/đăng xuất, chọn lưu phiên local hoặc session.
- Cập nhật hồ sơ: tên, điện thoại, ngày sinh, giới tính, địa chỉ, loại da nền và vấn đề ưu tiên.
- Đổi mật khẩu tài khoản local.
- Lưu, xem và xóa lịch sử soi da theo user ID.
- Tab Hồ sơ / Lịch sử / Cài đặt và truy cập profile khi chưa đăng nhập.

Kiểm thử tự động `tests/profile-flows.test.js` đạt cho các luồng local nêu trên.

## Kết luận quan trọng

Đây là prototype local trên trình duyệt, không phải hệ thống tài khoản production:

1. Users, mật khẩu, session và lịch sử soi da nằm trong localStorage/sessionStorage.
   Người dùng có thể xóa, sửa hoặc sao chép dữ liệu trên thiết bị của họ.
2. Mật khẩu local đang lưu dạng plaintext. Không được dùng cho khách hàng thật.
3. Luồng Google hiện có modal tài khoản mẫu và một nhánh nhập email trực tiếp; chúng không
   phải chứng thực Google phía server. JWT của Google cũng chỉ được decode ở client, không
   được verify chữ ký/audience/issuer tại server.
4. Ô “Cấu hình Quản trị viên Google Client ID” để bất kỳ người dùng trên chính thiết bị đó
   thay đổi cấu hình local. Nó không hề là quyền quản trị thực và không nên hiển thị public.
5. “Xóa toàn bộ dữ liệu” hiện chỉ xóa lịch sử scan của user hiện tại. Nó không xóa profile,
   tài khoản local, dữ liệu trên thiết bị khác hay bất kỳ dữ liệu nào trên server.
6. Các câu “bảo mật chuẩn y tế”, “AI ground-truth”, “bệnh án”, “xóa hình ảnh trên hệ thống”
   không phù hợp với hiện trạng: ảnh chụp không được lưu bởi flow hiện tại, còn số liệu fallback
   là mô phỏng khi endpoint AI không hoạt động.
7. URL triển khai mới là một origin khác nên localStorage/profile từ domain cũ sẽ không tự
   chuyển sang domain mới. Đây là hành vi browser bình thường.

## Điều kiện để đưa profile vào production

- Backend xác thực thật: session cookie HttpOnly/Secure/SameSite hoặc OAuth Authorization Code
  với callback server; server xác minh Google ID token.
- Backend hash mật khẩu bằng Argon2id/bcrypt, reset password qua email đã xác minh; không gửi
  hoặc lưu plaintext.
- API phân quyền theo user server-side cho profile, scan history, export và delete; không dùng
  user ID từ browser để cấp quyền.
- Tách trang/cấu hình quản trị khỏi profile khách hàng; phân quyền admin từ server.
- Chính sách consent, retention/xóa dữ liệu ảnh và audit log được công ty phê duyệt trước khi
  lưu kết quả soi da.
- Bỏ hoặc gắn nhãn rõ ràng các dữ liệu mô phỏng; không gọi chúng là kết quả y tế hay ground truth.

Tài liệu này là review kỹ thuật; chưa thay cơ chế auth vì điều đó cần API/backend công ty.
