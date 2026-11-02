# Chính sách SkinID V2.0

Nguồn: PDF `SkinID Policy V2.0.pdf` do người dùng cung cấp, 16 trang, SHA-256 `87717c9f01582e092a5a361442949d04d9d7b00235447ee26e46034095e1dff5`. Website lấy thông tin đơn vị vận hành và 10 chương, gồm 54 điều khoản con, 9 bảng. Không đưa ghi chú/phụ lục kiểm tra nội bộ lên web.

- Nội dung: `src/data/legalPolicies.js`.
- Thông tin công ty: `src/data/companyInfo.js`.
- Trang và renderer: `src/pages/PolicyPage.jsx`, `src/components/policies/`.
- Route: [routes.json](../reference/routes.json); đường dẫn khiếu nại cũ tiếp tục tương thích.

## Thông tin kế thừa

Theo yêu cầu dùng thông tin đã có: Fieldman, MST 0319200638, đại diện Trần Long, hotline 0924.093.461, email operation@fieldman.vn, đầu mối dữ liệu Ông Trần Trung Nghĩa. Ngày hiệu lực 14/10/2026 kế thừa chính sách cũ, chưa xác nhận là ngày ban hành mới.

Giữ mốc đổi ý 7 ngày và các thời hạn hỗ trợ từ chính sách cũ. Phí giao tiêu chuẩn khớp checkout hiện tại: 30.000đ, miễn từ 500.000đ; không dùng ví dụ 25.000đ/499.000đ trong PDF để âm thầm đổi checkout.

## Nội dung cần xác nhận

Các ô trong dấu `[ ]` chưa có nguồn tin cậy vẫn để rõ trong nội dung, bao gồm thông tin đối tác AI, quốc gia lưu trữ và chi tiết triển khai dữ liệu. Các mốc lưu/xóa ảnh kế thừa (30 ngày, ảnh lưu chủ động hoặc sau 24 tháng không hoạt động) là nội dung chính sách, chưa chứng minh backend có job thực thi. Consent, xóa ảnh/dữ liệu, xử lý yêu cầu dữ liệu, bảo hành thiết bị/ACIE và các cam kết vận hành phải được xác nhận với backend và chủ quản trước công bố chính thức.

Không đưa PDF gốc chứa ghi chú nội bộ vào tài nguyên public. Bản gốc và báo cáo chuyển đổi lịch sử lưu ngoài repo.
