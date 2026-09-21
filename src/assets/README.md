# HƯỚNG DẪN QUẢN LÝ TÀI NGUYÊN (ASSETS GUIDE)

Để dự án luôn gọn gàng, tối giản và dễ tìm kiếm, **toàn bộ tài nguyên tĩnh (ảnh, video)** của SkinID được quy hoạch tập trung duy nhất tại thư mục:

```
src/assets/
├── images/
│   ├── banners/      # Ảnh banner chính, minh họa AI
│   ├── brands/       # Logo các thương hiệu đối tác (TWON, D'VAH, Rilastil)
│   ├── products/     # Toàn bộ ảnh sản phẩm của hệ thống
│   │   ├── rilastil/ # Ảnh sản phẩm Rilastil
│   │   ├── dvah/     # Ảnh sản phẩm D'VAH
│   │   └── twon/     # Ảnh sản phẩm TWON
│   └── logo.png      # Logo chính SkinID
└── videos/
    └── auth_video.mp4 # Video nền Auth Modal
```

---

### Khi tải ảnh mới về, lưu ở đâu?
- **Ảnh sản phẩm**: Bạn chỉ cần lưu vào thư mục thương hiệu tương ứng:
  - Rilastil: `src/assets/images/products/rilastil/`
  - D'VAH: `src/assets/images/products/dvah/`
  - TWON: `src/assets/images/products/twon/`
  *(Hoặc lưu thẳng vào `src/assets/images/products/` - hệ thống đã có bộ giải quyết tự động nhận diện cả hai cấu trúc).*
- **Video mới**: Lưu vào `src/assets/videos/`.

---

### Cơ chế nhận diện tự động
Hệ thống sử dụng bộ điều hướng tài nguyên thông minh (`assetUrl` & middleware Vite):
1. **Môi trường Dev (`npm run dev`)**: Tự động tìm kiếm ảnh cả ở dạng phẳng (`/images/products/...`) lẫn lồng thương hiệu (`/images/products/rilastil/...`), không bao giờ bị lỗi 404 hay hiển thị placeholder xám.
2. **Môi trường Production (`npm run build`)**: Tự động đóng gói kép cả cấu trúc thư mục thương hiệu và cấu trúc phẳng vào `dist/images/products/`, đảm bảo deploy lên Cloudflare / CDN hoạt động 100% trơn tru.
