# ADR 001: Dùng React Router cho client routing

- Trạng thái: chấp nhận
- Ngày: 2026-09-27

## Bối cảnh

Ứng dụng từng so sánh trực tiếp `window.location.pathname`, import đồng bộ mọi page
và trả trang chủ cho URL không tồn tại.

## Quyết định

Dùng React Router với browser history, lazy route modules, route aliases, error
boundary và route 404. Cloudflare tiếp tục phục vụ `index.html` theo chế độ SPA.

## Hệ quả

Mỗi màn hình có bundle riêng và routing không còn nằm trong `App.jsx`. Các liên kết
nội bộ mới nên dùng `Link`/`NavLink`; alias cũ được redirect có chủ đích.
