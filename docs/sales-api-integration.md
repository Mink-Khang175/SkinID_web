# Hướng dẫn nối phần mềm bán hàng — chưa triển khai

## 1. Phạm vi và cách hiểu

Phần mềm bán hàng là nguồn dữ liệu chính cho SKU, giá, tồn kho, khách hàng và đơn hàng
nếu API của nó hỗ trợ những chức năng đó. Không mặc định rằng nó có thể quản lý
ảnh khuôn mặt, báo cáo da, tài khoản web hay mọi click của người dùng.

Web giữ giao diện, hiển thị dữ liệu và gửi thao tác. Logic giá, ưu đãi, tồn kho,
phân quyền và trạng thái thanh toán phải được quyết định ở server.
Không coi localStorage hoặc dữ liệu gửi từ trình duyệt là bằng chứng đáng tin cậy.
[OWASP: REST Security](https://cheatsheetseries.owasp.org/cheatsheets/REST_Security_Cheat_Sheet.html)

## 2. Kiến trúc đề xuất

```text
Web SkinID
   │ HTTPS, phiên người dùng
   ▼
Firebase Authentication + Cloudflare Worker hiện có
   ├─ Adapter API phần mềm bán hàng (đề xuất): SKU, giá, tồn kho, đơn
   ├─ Gemini: phân tích ảnh, khóa giữ tại Worker
   └─ Firestore: hồ sơ và báo cáo da theo quyền truy cập hiện tại
```

Nếu API công ty đã có endpoint dành cho frontend với xác thực người dùng,
có thể gọi trực tiếp. Nếu API yêu cầu master API key/client secret, bắt buộc giữ
chúng ở server và thêm adapter. Không đưa token quản trị phần mềm bán hàng vào JS.

Adapter phần mềm bán hàng ở trên chỉ là phương án; chưa được thêm vào repository.

## 3. Xin gì từ đội backend trước?

- Tên/version phần mềm, Swagger/OpenAPI hoặc Postman collection.
- Base URL sandbox/production, tài khoản test và SKU test.
- Cách xác thực: cookie session/OAuth hay API key server-to-server; thời hạn và refresh.
- Danh sách endpoint, schema, phân trang, lọc, sắp xếp, giới hạn request.
- Quy ước giá VND (đơn vị đồng hay đơn vị nhỏ hơn), thuế, giảm giá, tồn kho, kho bán.
- ID sản phẩm/biến thể/SKU, ảnh, thương hiệu, danh mục và thuộc tính mỹ phẩm.
- Quy tắc tạo/ghép khách theo điện thoại/email, quyền đọc/sửa dữ liệu khách.
- Trạng thái đơn, thanh toán, giao vận, hủy/hoàn; cơ chế webhook và xác thực chữ ký.
- CORS origin chính xác, cookie/CSRF, môi trường localhost.
- Chính sách ảnh khuôn mặt, consent, retention, xóa dữ liệu và báo cáo da.

Chưa có tài liệu API của công ty nên mọi route bên dưới đều chỉ là ví dụ hợp đồng.

## 4. Ghép dữ liệu hiện tại

| Hiện tại | Khi nối backend | Lưu ý |
| --- | --- | --- |
| `src/data/products.js` — catalog đóng gói, catalog runtime ưu tiên Firestore | API catalog/variants | Map ID hiện tại ↔ SKU thật, không ghép chỉ theo tên |
| brand / brandSlug | brandId + slug chuẩn | DVAH/D'VAH là alias hiển thị |
| stepType / SHOP_CATEGORY_OVERRIDES | categoryIds và thuộc tính routine riêng | Nhóm mua sắm không đồng nhất bước routine |
| price / originalPrice | Giá bán/giá so sánh từ server | Server tính lại khi đặt hàng |
| volume | Thuộc tính biến thể | Xác nhận 2 xung đột dung tích trong báo cáo catalog |
| mainActives / keyActives / fullIngredients / usage | Custom fields/PIM nếu API có | Không tự bịa khi API thiếu; dùng trạng thái chưa cập nhật |
| `src/js/cart/cart.js`: giỏ khách trong bộ nhớ; giỏ đăng nhập trong Firestore | Giỏ API nếu phần mềm bán hàng hỗ trợ | Ghép giỏ khách khi đăng nhập, kiểm tra lại SKU/giá/tồn |
| `src/js/account/auth-firebase.js`: Firebase Authentication | Xác thực liên thông nếu cần | Worker hiện xác minh Firebase ID token; không dùng UID do client tự gửi để cấp quyền |
| `users/{uid}/skinReports` trên Firestore | API báo cáo riêng nếu được duyệt | Người dùng chỉ xem báo cáo được cấp quyền |
| `worker/index.js`: API tạo/hủy/xem đơn trên Firestore | Adapter đồng bộ đơn với phần mềm bán hàng | Chốt nguồn dữ liệu chính và xử lý đồng bộ trước khi tích hợp |
| Chuyển Zalo | Đơn nháp + kênh tư vấn, tùy hợp đồng | Mở Zalo không có nghĩa đã tạo đơn/đã thanh toán |

## 5. Luồng tối thiểu để bán hàng

1. Tải catalog từ endpoint phân trang; adapter chuyển schema backend về định dạng
   ProductCard hiện tại. Giữ nguyên component và CSS.
2. Nếu catalog được phân trang, lọc/tìm kiếm phải áp dụng trên toàn bộ dữ liệu tại API,
   không chỉ lọc những sản phẩm đã tải về trang đầu.
3. Thêm giỏ gửi SKU và số lượng. Server trả giá/tồn khả dụng; UI phản ánh thay đổi.
4. Checkout xin báo giá (quote), hiển thị tổng tiền/phí và yêu cầu người dùng xác nhận
   nếu giá hoặc tồn kho đã thay đổi.
5. Tạo đơn với idempotency key. Retry timeout phải dùng cùng key để không tạo hai đơn.
6. Thanh toán chỉ đổi trạng thái dựa trên xác nhận server/webhook, không dựa vào URL quay về.
7. Trang tài khoản đọc lịch sử của người dùng được server xác thực.

Kiểm tra quyền truy cập phải làm tại server trên từng request, không chỉ ẩn nút ở UI.
[OWASP: Authorization](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html)

## 6. Ví dụ API contract để trao đổi

| Đề xuất | Mục đích |
| --- | --- |
| GET /api/catalog/products?brandId=...&categoryId=...&q=...&cursor=... | Catalog, tổng số, phân trang |
| GET /api/catalog/products/:id | Chi tiết, biến thể, INCI |
| GET /api/me | Hồ sơ từ phiên xác thực |
| POST /api/cart/items | Thêm SKU + quantity |
| POST /api/checkout/quote | Kiểm tra giá/tồn/phí |
| POST /api/orders | Tạo đơn từ quote hợp lệ, kèm Idempotency-Key |
| GET /api/me/orders | Lịch sử đơn đúng quyền |
| POST /api/skin-analysis | Chỉ triển khai nếu công ty duyệt xử lý ảnh |

Response thống nhất lỗi như code/message/fieldErrors/requestId; có quy ước 401, 403,
409 (giá/tồn thay đổi), 422 (dữ liệu sai), 429 (giới hạn request) và lỗi server.
Không hiển thị stack trace hoặc token trong lỗi UI.

## 7. Nơi chỉnh mã sau này

- Thêm adapter API trong src/js/services/ sau khi chốt contract; không fetch phân tán
  trong ProductCard hoặc HTML.
- Điều chỉnh `src/js/catalog/catalog-loader.js` để nạp catalog từ adapter sau khi chốt API. Xem lại fallback catalog đóng gói và cách Worker định giá để dữ liệu giao dịch nhất quán.
- Điều chỉnh `src/js/cart/cart.js`, `src/js/account/auth-firebase.js` và `worker/index.js` theo hợp đồng xác thực, giỏ và đơn đã chốt; hiện các luồng này dùng Firebase/Firestore và Worker.
- ProductCard và modal tiếp tục nhận view model thống nhất; không phải thiết kế lại.
- Các click analytics (xem sản phẩm, lọc, thêm giỏ) là event tùy chọn, không tự động
  gửi hết sang hệ thống bán hàng. Chốt mục đích và danh sách sự kiện trước.

## 8. Thứ tự triển khai khi được duyệt

Catalog read-only → chi tiết/biến thể → xác thực → giỏ/quote → đơn sandbox →
thanh toán/webhook → lịch sử → soi da nếu được duyệt.

Kiểm thử: mất mạng, API chậm, token hết hạn, giá/tồn đổi, SKU ngừng bán, click đặt đơn
hai lần, timeout sau khi server đã tạo đơn, truy cập đơn/báo cáo của tài khoản khác,
ảnh lỗi/quá lớn, rút consent và xóa dữ liệu theo chính sách.

Điều kiện bắt đầu: nhận tài liệu API và sandbox từ công ty, chốt bảng mapping SKU,
quyền dữ liệu và tiêu chí nghiệm thu. Chưa thực hiện bước kết nối nào trong lần này.
