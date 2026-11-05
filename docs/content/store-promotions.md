# Giá online và ưu đãi tại cửa hàng

Cập nhật 05/11/2026 theo xác nhận của chủ quản: giá combo và chương trình giảm 50% là giá kênh cửa hàng, không phải giá bán online.

## Hiển thị và thao tác

- Giữ khu vực quảng bá trên trang chủ và `/khuyen-mai`; nhãn kênh đặt ngay cạnh giá, có thông báo địa điểm/điều kiện ở đầu trang chương trình.
- Giá online tiếp tục lấy từ catalog. Modal/trang chi tiết sản phẩm ghi rõ “Giá bán online”.
- Combo và sản phẩm giảm 50% dùng CTA tư vấn tại cửa hàng; không thêm bộ giá offline vào giỏ hoặc checkout online. Không đổi các con số để tự tạo mức giảm mới.
- Giữ dữ liệu chương trình từ `useCampaign`/Firestore và fallback tại `src/data/promotions.js`. Phạm vi hiển thị của khu vực này được cố định là cửa hàng theo quyết định hiện tại, không tự suy ra từ việc giá trùng hay khác catalog.
- Địa điểm lấy từ cấu hình showroom; thời gian lấy từ campaign nếu có. Chưa có thời gian thì yêu cầu liên hệ xác nhận, không tự đặt lịch hoặc đồng hồ đếm ngược giả.
- Mã voucher online có nhãn riêng; không hiểu giá offline là mức tiền dùng trong giỏ online.

## Nội dung chủ quản cần duy trì

Xác nhận địa điểm thực tế, thời gian, tồn kho, điều kiện Like/Share và căn cứ giá trước ưu đãi của kênh cửa hàng. Nhãn kênh không thay thế thể lệ chương trình hoặc bảo đảm hồ sơ TMĐT được duyệt. Đợt này chỉ sửa source/UI, không ghi campaign lên Firestore.

## Giao diện sản phẩm nổi bật

`FeaturedProducts.jsx` dùng quỹ đạo ngang theo ảnh tham chiếu mới nhất: sản phẩm chính lớn, ba sản phẩm phụ, crop theo bounds ảnh để bỏ vùng trong suốt. Chọn ảnh hoặc dùng phím mũi tên để đổi sản phẩm, vuốt ngang trên mobile. Nút thêm giỏ ở đây vẫn là sản phẩm catalog với giá online.

Style bổ sung: `src/styles/routine-orbit.css`, `src/styles/promotion-scope.css`. Giữ banner đầu trang và các primitive nút gốc.
