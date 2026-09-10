# SkinID — giao diện cửa hàng

HTML + CSS + JavaScript thuần; Tailwind CDN phục vụ các giao diện hiện có.
Không chuyển sang framework, không thêm backend hoặc bước build bắt buộc.

## Chạy local

Mở thư mục này bằng Live Server, hoặc chạy một HTTP static server tại đây.
Trang chính: index.html; soi da: skin-analysis.html; tài khoản: profile.html.
Không mở file:// vì component HTML được tải bằng fetch.
Sau khi cập nhật cấu trúc, tải lại trang để bỏ các script đang còn trong bộ nhớ.

## Cấu trúc

```text
index.html / skin-analysis.html / profile.html  URL trang giữ nguyên
src/
  components/
    layout/       Header, footer, mobile navigation
    home/         Hero, danh mục, catalog, thương hiệu, trợ giúp
    dialogs/      Các modal dùng chung và luồng scan/account hiện có
  styles/         CSS giao diện hiện có, không thay đổi thiết kế
  data/           products.js: dữ liệu local của 54 sản phẩm
  js/
    app/          Bootstrap và cấu hình public không chứa bí mật
    catalog/      Product Card, bộ lọc, tương tác trang chủ
    analysis/     Chụp ảnh, phân tích và dựng báo cáo
    account/      Tài khoản/phiên local hiện có
    cart/         Giỏ hàng và chuyển tiếp Zalo
    services/     Dịch vụ email hiện có
public/images/    Giữ đường dẫn và toàn bộ ảnh hiện có
tests/            Kiểm thử hồi quy chạy bằng Node
scripts/          Đối chiếu catalog GitHub, chỉ đọc
docs/             Kiến trúc, kiểm tra dữ liệu, hướng dẫn tích hợp
tools/legacy/     Script deploy của máy cũ, không dùng cho dự án hiện tại
```

## Chỉnh ở đâu?

- Bố cục trang chủ: src/components/home/.
- Component chung: src/components/layout/ và src/components/dialogs/.
- Màu, khoảng cách, responsive: src/styles/site.css.
- Thẻ sản phẩm: src/js/catalog/product-card.js.
- Quy tắc phân loại/lọc: src/js/catalog/product-filters.js.
- Dữ liệu sản phẩm local: src/data/products.js.
- Cấu hình URL phân tích được bảo vệ: src/js/app/runtime-config.js.

Bootstrap tải dữ liệu trước phần chức năng. Các file JS hiện dùng global scope do có onclick
trong HTML cũ; chưa đổi sang ES module để tránh làm hỏng giao diện/luồng hiện có.
Các trang root giữ HTML dự phòng sẵn có; cập nhật component tương ứng và fallback
nếu cần duy trì chế độ dự phòng. Chưa xóa fallback trong lần tái cấu trúc này.

## Kiểm tra

```sh
npm test
npm run audit:catalog
```

Không cần npm install: các kiểm thử chỉ dùng thư viện chuẩn của Node.
Audit gọi GitHub; kiểm thử còn lại không cần API thật và không gửi ảnh khuôn mặt.
Chưa kiểm thử camera và các dịch vụ bên ngoài trên trình duyệt thực tế.

## Trạng thái tích hợp

- [Kết nối phần mềm bán hàng](docs/sales-api-integration.md): chỉ là thiết kế/hướng dẫn,
  chưa có kết nối nào được triển khai.
- [Gemini và bảo mật](docs/gemini-setup.md): chưa có endpoint hoặc khóa mới hợp lệ.
- [Kiểm tra luồng profile](docs/profile-flow-audit-2026-09-10.md): prototype local,
  chưa phải xác thực production.
- [Báo cáo catalog](docs/catalog-audit-2026-09-10.md).
- Tài khoản/localStorage hiện tại chỉ là nguyên mẫu, không phải xác thực production.
- Dữ liệu phân tích local là mô phỏng, không phải đánh giá da thực từ Gemini.

Không đặt bí mật vào src/, public/, HTML hoặc bất kỳ thư mục nào được static server phục vụ.
Đổi tên thư mục thành config hay dùng Base64 không làm dữ liệu bí mật hơn.
netlify.toml hiện publish root: không đặt .env thật trong thư mục dự án được publish.
