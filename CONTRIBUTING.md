# Làm việc qua GitHub

Frontend và backend Worker/Firebase phát triển trong repo này; anh Danh phụ trách môi trường và deploy. Kế hoạch backend Next.js/PostgreSQL thực hiện sau. Trao đổi thay đổi hợp đồng API trước khi sửa service.

1. Cập nhật nhánh nhóm đang sử dụng sau khi kiểm tra công việc local chưa commit.
2. Tạo nhánh tính năng, ví dụ `git switch -c frontend/product-detail`.
3. Sửa UI trong feature/page tương ứng; kiểm tra dữ liệu mẫu tại `/__preview`.
4. Chạy `npm run test:all`, xem desktop và mobile, kiểm tra `git diff`.
5. Chọn các file cần commit bằng `git add <đường-dẫn>`, commit và push nhánh lên remote đã thống nhất. Mở PR để người còn lại review.

Không commit file môi trường thật, khóa server, dữ liệu khách hàng, dependency hoặc build. Không đổi Git remote chỉ để đồng bộ giao diện từ repo tham chiếu.

## Thiết kế

Mọi giao diện mới tuân theo [style system](docs/design/style-system.md). Dùng homepage local làm chuẩn, không lấy màu sắc/bố cục khuyến mãi của bản deploy làm chuẩn thay thế.

## Quy ước code

- Trang ghép các khối UI; nghiệp vụ và truy cập dữ liệu đặt trong `features/<tên>/services`.
- Component dùng riêng một tính năng đặt cạnh tính năng đó. Chỉ chuyển vào shared khi có nhu cầu dùng chung thực tế.
- Dùng entry `index.js` của feature khi phù hợp, tránh tạo phụ thuộc vòng giữa các feature.
- Chỉ sửa catalog nguồn tại `src/data/products.js`; chạy `npm run catalog:generate`. Không sửa tay file `*.generated.js`.
- Ảnh/video đặt trong `src/assets`; dùng helper `assetUrl`. Không tạo thêm bản sao `public/images`.
- Giữ carousel và kiểu nút local cũ theo quyết định thiết kế hiện tại. Các cập nhật CMS không được âm thầm thay thiết kế này.
- Tài liệu dài đặt trong `docs/` và cập nhật chỉ mục. Không đặt script debug, ảnh kiểm tra hay báo cáo tạm vào repo.

CI bắt buộc test/build và bundle Worker dry-run; nội dung PR nêu hành vi thay đổi, ảnh UI nếu có và kết quả kiểm tra.
