# Kiểm tra dữ liệu và bộ lọc sản phẩm

Nguồn: https://github.com/danhhuynh-stack/skinid-web/tree/8fa91f4878ac8bf73d39063ea03955527e28d29f

## Đối chiếu dữ liệu

- So sánh toàn bộ các trường của từng sản phẩm theo ID trong mảng PRODUCTS với nguồn GitHub.
- Local và nguồn đều có 54 sản phẩm: 46 Rilastil, 3 TWON, 5 DVAH.
- Không thiếu/thừa ID, không trùng ID; không thiếu trường so với nguồn.
- 8 khác biệt đều là đường dẫn ảnh TWON/DVAH chuyển từ URL ngoài sang ảnh local.
- Kiểm tra đường dẫn ảnh sau quy tắc chuyển thư mục: đủ 54 ảnh.
- Các trường tên, thương hiệu, giá, dung tích, ảnh, thành phần đầy đủ, hoạt chất và hướng dẫn sử dụng đều có dữ liệu.
- Không có giá âm/0, giá bán lớn hơn giá gốc hoặc brand khác brandSlug sau chuẩn hóa.
- Đây là kiểm tra tính đầy đủ so với repository, KHÔNG xác nhận giá, INCI, công dụng hoặc chứng nhận đúng với nhà sản xuất. Trường có dữ liệu không đồng nghĩa dữ liệu đã chính xác.

## Hai xung đột có sẵn trong nguồn — chưa sửa

| ID | Dung tích trong tên | Trường volume |
| --- | --- | --- |
| rilastil-2070 — Aqua Intense Gel 72H | 15 ml | 40 ml |
| rilastil-1805 — Acnestil Cleansing Gel | 200 ml | 400 ml |

Cần chủ shop xác nhận SKU trước khi đổi dung tích, giá hoặc nội dung liên quan.

## Lỗi bộ lọc đã sửa

1. Bỏ cơ chế tự reset thương hiệu khi giao giữa brand và danh mục không có kết quả. Bây giờ trả danh sách rỗng, giữ nguyên lựa chọn.
2. Chuẩn hóa DVAH, D'VAH, D’VAH và chữ hoa/thường/khoảng trắng thành cùng brand slug.
3. Tách danh mục mua sắm khỏi stepType của routine; không dùng từ khóa trong công dụng/thành phần để đoán danh mục.
4. rilastil-1856: đưa vào Chống nắng thay vì Dưỡng ẩm.
5. Hai mặt nạ rilastil-2085, rilastil-1125: đưa vào Dưỡng ẩm, không nằm ở Cơ thể & nước hoa.
6. Toàn bộ TWON/DVAH và hai kem ngăn rạn rilastil-1939, rilastil-1936: vào Cơ thể & nước hoa.
7. Ba gel có tên ghi rõ rửa mặt/tắm toàn thân (1872, 1871, 1867): xuất hiện ở cả Làm sạch và Cơ thể & nước hoa.
8. Tìm kiếm hỗ trợ tiếng Việt không dấu; kết hợp với thương hiệu và danh mục bằng điều kiện AND.

## Số lượng theo danh mục sau sửa

| Danh mục | Số sản phẩm |
| --- | --- |
| Làm sạch | 13 |
| Cân bằng | 2 |
| Đặc trị | 11 |
| Dưỡng ẩm | 12 |
| Chống nắng | 5 |
| Cơ thể & nước hoa | 14 |

Tổng theo danh mục là 57 do 3 gel dùng cho mặt và cơ thể được phép thuộc hai nhóm; số sản phẩm duy nhất vẫn là 54.

## Kiểm tra lại

- node scripts/audit-catalog.js — đối chiếu nguồn tại commit nêu trên, chỉ đọc dữ liệu.
- node tests/catalog-filters.test.js — 168 tổ hợp brand/danh mục/từ khóa và các ca hồi quy cụ thể.
- node tests/ui-consistency.test.js — component dùng chung và lựa chọn routine.
- Kiểm tra cú pháp JavaScript đã đạt. Chưa thực hiện kiểm thử giao diện trên trình duyệt.
