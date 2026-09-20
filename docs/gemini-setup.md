# Gemini backend trên Cloudflare Worker

Frontend không chứa Gemini API key và không gọi Google Generative Language API trực tiếp.

Luồng production:

1. Người dùng đăng nhập bằng Firebase Authentication.
2. Frontend gửi Firebase ID token và đúng ba ảnh tới `/api/analyze-skin`.
3. Worker xác minh chữ ký token bằng public JWK của Firebase.
4. Worker đọc `GEMINI_API_KEY` từ Cloudflare Worker Secret và gọi Gemini 2.5 Flash.
5. Frontend kiểm tra kết quả rồi lưu báo cáo tại `users/{uid}/skinReports`.

Tạo secret production một lần:

```sh
npx wrangler login
npx wrangler secret put GEMINI_API_KEY
```

Không truyền key trong URL, không đặt key trong `src/`, `.env` hoặc GitHub source.
Để kiểm thử local, đặt key trong `.dev.vars`; file này đã được gitignore.

Giới hạn hiện tại:

- Đúng 3 ảnh, tối đa 4 MB mỗi ảnh và 10 MB tổng ảnh.
- Ảnh được gửi tới Gemini nhưng SkinID không chủ động lưu ảnh vào Firestore hoặc Storage.
- Báo cáo mang tính tham khảo và không thay thế chẩn đoán y khoa.
