# Gemini backend

## Kiến trúc đang dùng

Frontend không chứa hoặc gọi trực tiếp bằng Gemini API key. Luồng phân tích là:

1. Người dùng đăng nhập bằng Firebase Authentication.
2. Frontend lấy Firebase ID token và gọi Netlify Function `analyze-skin`.
3. Function xác minh chữ ký token bằng chứng thư công khai của Google, kiểm tra ba ảnh JPEG base64 và giới hạn dung lượng.
4. Netlify Blobs giới hạn tối đa 10 lần phân tích cho mỗi tài khoản mỗi ngày.
5. Function đọc `GEMINI_API_KEY` từ biến môi trường Netlify và gọi Gemini 2.5 Flash.
6. Frontend lưu báo cáo đã chuẩn hóa vào `users/{uid}/skinReports` trong Firestore.

Mã backend đang chạy nằm tại `netlify/functions/analyze-skin.mjs`; mã gọi client nằm tại `src/js/analysis/skin-analysis.js`. Thư mục `functions/` giữ phương án Firebase Functions để dùng sau nếu project nâng cấp gói Blaze.

## Cấu hình khóa

Tạo một khóa mới tại Google AI Studio và đặt nó trực tiếp trong Netlify với scope `Functions`, context `Production`, tên:

```dotenv
GEMINI_API_KEY=...
```

Có thể dùng `functions/.env` khi kiểm thử local. Các file `.env` đã được gitignore. Không đặt key trong `src/`, `public/`, HTML hoặc `runtime-config.js`, và không dùng lại khóa từng xuất hiện trong terminal/log.

Backend Netlify không cần service-account JSON. Token đăng nhập được xác minh bằng khóa công khai của Firebase, vì vậy không phải duy trì thêm private key dài hạn trên Netlify.

## Deploy

```sh
npx netlify deploy --prod --build
```

Endpoint production là `https://skinid-api.netlify.app/.netlify/functions/analyze-skin` và đã được khai báo trong `src/js/app/runtime-config.js`.

## Giới hạn

- Tối đa 3 ảnh, 4 MB mỗi ảnh và 10 MB tổng cộng.
- Tối đa 10 lần phân tích mỗi tài khoản mỗi ngày.
- Ảnh được chuyển tới Gemini để xử lý nhưng ứng dụng không chủ động lưu ảnh vào Firestore, Netlify Blobs hoặc Cloud Storage.
- Kết quả chỉ mang tính tham khảo và không thay thế chẩn đoán y khoa.
