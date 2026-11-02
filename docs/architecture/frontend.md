# Kiến trúc frontend

Dự án giữ cách tổ chức theo tính năng để hạn chế ảnh hưởng khi đổi backend. Chưa chuyển framework sang Next.js; React/Vite tiếp tục phục vụ công việc frontend. Giai đoạn hiện tại đã nối lại Worker/Firebase; Next.js/PostgreSQL là kế hoạch sau. Xem [backend](backend.md).

## Luồng phụ thuộc

`app/router → pages → components/features → services → infrastructure hoặc preview`

- `app/`: router, providers và bố cục ứng dụng.
- `pages/`: điểm vào của route, ghép các khối giao diện; tránh chứa truy vấn dữ liệu phức tạp.
- `features/`: UI, context, hooks, dữ liệu và service thuộc từng nghiệp vụ. Giữ các nhóm admin, auth, cart, catalog, content, profile, skin-analysis và system đã có.
- `components/`: khối trang chủ, layout, phân tích, ACIE và renderer chính sách đang dùng chung.
- `shared/`: cấu hình, sự kiện, tiện ích, hooks và UI hạ tầng dùng chung. `config/` và `hooks/` ở cấp src là vị trí còn lại từ source cũ; không tạo thêm tầng tương tự khi thêm code mới.
- `infrastructure/`: Firebase client và HTTP client. Đây là nơi giao tiếp dịch vụ hiện tại, chưa phải backend mới.
- `preview/`: adapter auth/database/API local, dữ liệu công khai đã lọc và dữ liệu giả lập. Không đặt dữ liệu khách hàng thật ở đây.
- `data/`: nguồn sản phẩm, chính sách, công ty; `features/catalog/data/*.generated.js` được sinh từ catalog.
- `assets/`: ảnh/video nguồn duy nhất. `styles/`: CSS theo khu vực, entry import tại `main.jsx`.
- `js/`: cầu nối tương tác DOM/legacy vẫn được bootstrap sử dụng. Không xóa chỉ vì đã có React; chỉ bỏ từng phần sau khi port và kiểm tra tương tác.

Không đổi toàn bộ tên thư mục hoặc di chuyển hàng loạt component đang hoạt động chỉ để làm đẹp cây source. Khi bổ sung chức năng, đặt cạnh tính năng liên quan, dùng entry export của feature và tránh import ngược từ infrastructure vào page.

## Thiết kế đang giữ

Carousel banner (`components/home/HeroBanner.jsx`), carousel sản phẩm (`FeaturedProducts.jsx`, `styles/home-scenes.css`) và kiểu nút có sẵn được phục hồi từ bản local trước đồng bộ ngày 02/11/2026. Component hero cũ dùng nội dung tĩnh, không tự áp dụng banner CMS mới. Nếu cần CMS điều khiển nội dung về sau, bổ sung adapter giữ nguyên thiết kế này.

Màn hình mới, trang chi tiết, blog, khuyến mãi và chính sách V2.0 giữ chức năng/nội dung, được đồng bộ về style homepage local. `components/commerce/PromotionCollection.jsx` dùng chung cho khuyến mãi ở trang chủ và trang ưu đãi; CSS bổ sung ở `styles/brand-alignment.css`. Quyết định giữ UI cũ là ngoại lệ có chủ đích so với skinid.vn.

## Kiểm thử

`tests/` kiểm tra ranh giới tính năng, catalog, điều hướng, giỏ/checkout, nội dung, chính sách, hồ sơ và preview. Kiểm thử Worker đã được khôi phục cùng backend và bổ sung các trường hợp chống gửi trùng/tính giá. CI chạy cùng lệnh `npm run test:all` với local.
