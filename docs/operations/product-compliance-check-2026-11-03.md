# Đối chiếu dữ liệu sản phẩm và phiếu công bố mỹ phẩm — 03/11/2026

Nguồn đối chiếu: `Thông tin chung_Update 08.09.2026_Rilastil (1).xlsx` (45 sản phẩm), `Thông tin chung_TWON_DVAH (1).xlsx` (8 sản phẩm + sheet "Thông tin từ Word"), và ảnh phiếu công bố trong `src/assets/images/licenses/` (đọc trực tiếp từng ảnh).

## 1. Lỗi chính: số phiếu công bố Rilastil

- Website đang hiển thị `184920/22/CBMP-QLD` cho 45/46 sản phẩm Rilastil, **không khớp ảnh phiếu** đi kèm. Mọi ảnh phiếu Rilastil đều ghi **`191712/22/CBMP-QLD`** (ngày cấp 22/12/2022, Cục Quản lý Dược).
- Số `184920/22` còn nằm trong 3 chỗ gõ cứng làm giá trị mặc định (trang sản phẩm, popup sản phẩm, trang tra cứu công bố) và 2 chỗ trong `skin-analysis.js` (cả TWON/D'VAH hiển thị `001248/23/CBMP-HCM`, số này không có trong file dữ liệu). Đã bỏ hết, thiếu số thì hiển thị "Đang cập nhật".

## 2. Đã sửa trong `src/data/products.js`

| Nhóm | Số SP | Thay đổi |
|---|---|---|
| Ảnh phiếu đúng sản phẩm | 33 | `notificationNumber` = `191712/22/CBMP-QLD` |
| Phiếu gắn sai sản phẩm (xem mục 3) | 11 | Xóa số và ảnh phiếu (chờ phiếu đúng) |
| Link phiếu không có ảnh trong repo | 1 | Xóa số và ảnh phiếu (Aqua Intense 72H 15ml) |
| Kích thước đóng gói sai so với file | 4 | `dimensions` theo file: Acnestil Micropeeling 30ml = 5x5x5, Cleansing Mousse = 10x5x10, H-Biome = 10x5x5, Acnestil Micropeeling 100ml = 10x10x10 |

TWON và D'VAH: số công bố, ảnh phiếu, barcode, dung tích, kích thước **đều khớp** file.

## 3. Phiếu công bố gắn sai sản phẩm (ngay trong file của văn phòng)

Cột `VN_CPP License` của các sản phẩm sau trỏ tới phiếu của sản phẩm khác:

| Sản phẩm | Phiếu đang gắn là của |
|---|---|
| Sun System Velvet Touch Cream SPF50+ 50ml | Multirepair Retinol Tech Serum |
| Sun System Water Touch Moisturizing Fluid 50ml | Multirepair Retinol Tech Serum |
| Allergy Protective Fluid SPF50+ 50ml | Age Repair Protective Cream SPF50+ |
| Xerolact PB Balm 50ml / 200ml / 400ml | Xerolact Cleansing Gel |
| Acnestil Cleansing Gel 200ml / 400ml | Acnestil Cleansing Mousse |
| Acnestil H-Biome Moisturizing Cream 40ml | Acnestil Cleansing Mousse |
| Daily Care Rebalancing Soothing Toner 200ml | Daily Care Rebalancing **Astringent** Toner |
| Multirepair Retinol Tech Serum 30ml | Intense C Gel Serum |
| Aqua Intense 72H Gel-Cream 15ml | Link Drive không có ảnh trong repo |

**Cần văn phòng bổ sung phiếu đúng cho 12 sản phẩm này**, sau đó điền lại `notificationNumber` và `licenseImageUrl`.

## 4. Chưa sửa, cần quyết định

1. **Sản phẩm thừa**: "Kem chống rạn Rilastil Stretch Marks 75ml" (`rilastil-stretch-marks-75ml`) có trên web nhưng không có trong file Rilastil 08.09.2026 và chưa có phiếu. Giữ hay ẩn?
2. **Giá Rilastil**: web dùng bảng giá Ecom T10 (giá niêm yết = giá trong file ×1,1; giá bán = ×0,99). File Rilastil chỉ có "Giá niêm yết", cột "Giá bán" trống. Cần xác nhận file giá nào là chuẩn và 10% có phải VAT.
3. **Giá TWON/D'VAH lệch nhẹ** giữa bảng giá T10 (đang dùng) và file mới:
   - Ủ trắng 250ml: 247.000 (web) / 246.000 (file); Sữa tắm TWON: 177.000 / 178.000; Rakta, Tanmaya: 177.000 / 178.000.
   - **Malini và Sarika bị đảo**: web Malini 196.900/177.000 và Sarika 174.900/157.000; file ghi Malini 174.900/157.000 và Sarika 196.900/178.000.
4. **D'VAH Sữa Tắm Hương Hoa Sen Trắng KaaMaa 400ml** (`304/25/CBMP-TN`) có trong sheet "Thông tin từ Word" nhưng chưa có trên web.
5. Giá banner khuyến mãi dùng 179.000đ cho mọi nước hoa D'VAH, khác cả hai nguồn giá trên; cần thống nhất.
6. Cả 4 ảnh phiếu Sarika, Malini, Rakta, Tanmaya hiển thị tên "NƯỚC HOA SARIKA" ở trang đầu (ảnh `17O4…`, `1RT-…`, `1ki3…`, `1u8J…`); cần xem lại có phải đúng phiếu từng sản phẩm không.
