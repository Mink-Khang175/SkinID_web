# Thiết lập Firebase cho SkinID

Firebase chỉ cung cấp Authentication và Firestore trong gói Spark. Website và API chạy
trên Cloudflare Workers, vì vậy không cần nâng cấp Firebase Blaze để tạo đơn.

## Firebase Console

1. Mở project `skinid-df273`.
2. **Authentication → Sign-in method**: bật Email/Password và Google.
3. **Authentication → Settings → Authorized domains**: giữ `localhost`, thêm hostname
   `*.workers.dev` cụ thể của SkinID và custom domain nếu có.
4. **Firestore Database**: bảo đảm database đã được tạo ở Production mode.

## Cấu trúc dữ liệu

- `products/{productId}`: catalog; client chỉ đọc, admin được CRUD.
- `users/{uid}`: hồ sơ và địa chỉ giao hàng mặc định.
- `users/{uid}/addresses/{addressId}`: sổ địa chỉ; `default` là địa chỉ checkout gần nhất.
- `users/{uid}/commerce/cart`: giỏ hàng đăng nhập.
- `users/{uid}/wishlist/{productId}`: sản phẩm yêu thích.
- `users/{uid}/skinReports/{reportId}`: lịch sử soi da.
- `users/{uid}/activities/{activityId}`: audit log các thao tác quan trọng do backend tạo.
- `orders/{orderId}`: Worker tạo sau khi đọc lại giá từ `products`.

Ứng dụng không dùng `localStorage` hoặc `sessionStorage` để lưu dữ liệu nghiệp vụ.
Firebase Auth SDK tự quản lý phiên đăng nhập.

## Rules và backend

Triển khai Rules:

```sh
npm run firestore:deploy-rules
```

`orders` cấm client tạo. Cloudflare Worker xác minh Firebase ID token, tính lại giá,
ghi đơn, địa chỉ mặc định và activity log trong một Firestore commit.

## Cấp quyền quản trị

Sau khi tài khoản quản trị đăng ký ít nhất một lần, đặt credential Admin SDK riêng tư
trên máy quản trị và chạy:

```powershell
$env:GOOGLE_APPLICATION_CREDENTIALS='D:\duong-dan\service-account.json'
npm run firebase:set-admin -- admin@example.com
```

Đăng xuất rồi đăng nhập lại để nhận custom claim mới. Service-account JSON đã được
gitignore và không được đặt trong `src/`, `dist/` hay commit lên GitHub.
