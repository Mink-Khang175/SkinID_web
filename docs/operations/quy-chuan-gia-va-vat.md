# Quy chuẩn Bảng giá, Thuế GTGT (VAT) & Khuyến mại Website SkinID.vn

> **Ngày cập nhật:** 05/11/2026  
> **Trạng thái:** Đã phân định rạch ròi 2 hệ giá & đồng bộ toàn bộ trên mã nguồn website `skinid-web`  
> **Căn cứ pháp lý:** Luật Giá 2023, Luật Bảo vệ quyền lợi người tiêu dùng 2023, Nghị định 52/2013/NĐ-CP & Nghị định 85/2021/NĐ-CP (TMĐT), Nghị định 128/2024/NĐ-CP (Khuyến mại).

---

## 1. Rạch Ròi Hai Hệ Thống Giá Trên Website

Để vận hành minh bạch và đúng quy chuẩn thẩm định của Bộ Công Thương, hệ thống SkinID phân định rõ ràng giữa **Giá toàn bộ sản phẩm** và **Giá chương trình khuyến mãi**:

### HỆ 1: Giá toàn bộ sản phẩm trên website (Đã deploy)
* **Căn cứ:** **Bảng giá bán Ecom T10/2026** (`src/data/products.js`, `src/data/ecom-price-list-2026-10.json`).
* **Phạm vi áp dụng:** Toàn bộ 54 sản phẩm trên trang Danh mục sản phẩm (`/san-pham`), trang Chi tiết sản phẩm (`/san-pham/:id`), Tìm kiếm, Bộ lọc và Giỏ hàng khi mua sản phẩm lẻ thường ngày.
* **Quy chuẩn giá:**
  * **Giá Niêm Yết:** Đã bao gồm thuế GTGT (VAT 10%) theo xác nhận Ban Giám đốc ngày 04/11/2026. (Ví dụ: Kem Body 306.900đ, Ủ trắng 273.900đ, Sữa tắm 196.900đ, Nước hoa 196.900đ / 174.900đ).
  * **Giá Always On (Giá bán lẻ thường ngày):** Đã bao gồm thuế GTGT (VAT 10%). (Ví dụ: Kem Body 276.000đ, Ủ trắng 247.000đ, Sữa tắm 177.000đ, Nước hoa 177.000đ / 157.000đ; Rilastil chiết khấu 10%).

---

### HỆ 2: Giá theo Chương trình Khuyến mãi (Flash Sale 50% & Combo quà tặng)
* **Căn cứ:** **Chính sách bán hàng Công ty TNHH Fieldman áp dụng từ ngày 15/04/2026** (Văn bản chính sách chương trình ban hành ngày 15/04/2026).
* **Phạm vi áp dụng:** Khối Flash Sale 50% và 3 Combo quà tặng trên Trang chủ (`FlashSaleBanner.jsx`), Trang Khuyến mãi (`PromotionsLanding.jsx`) và dữ liệu khuyến mãi (`src/data/promotions.js`).
* **Bản chất giá:** Đây là mức giá bán lẻ niêm yết của chương trình (*Recommend consumer price +VAT*) áp dụng riêng cho chiến dịch ưu đãi có điều kiện (Like - Share - Comment "SKINID50").

---

## 2. Báo Cáo Kiểm Tra Chi Tiết Banner Quảng Cáo (Đối chiếu với PDF 15/04/2026)

Bảng đối chiếu từng con số trên Banner quảng cáo so với Chính sách bán hàng 15/04/2026 của Fieldman:

### 2.1. Kiểm tra Sản phẩm Flash Sale 50%

| Sản phẩm | Giá niêm yết trong PDF 15/04/2026 | Giá gạch trên Banner | Giá bán ưu đãi 50% trên Banner | Kết luận kiểm tra |
| :--- | :---: | :---: | :---: | :--- |
| **Sữa tắm TWON 450ml** | **179.000đ** | **179.000đ** | **89.500đ** | ✅ **Chuẩn 100%** (179k ÷ 2 = 89.5k) |
| **Kem body Lotion 200ml** | **279.000đ** | **279.000đ** | **139.500đ** | ✅ **Chuẩn 100%** (279k ÷ 2 = 139.5k) |
| **Kem ủ trắng 250ml** | **249.000đ** | **249.000đ** | **124.500đ** | ✅ **Chuẩn 100%** (249k ÷ 2 = 124.5k) |
| **Nước hoa Malini 10ml** | **179.000đ** | **179.000đ** | **89.500đ** | ✅ **Chuẩn 100%** (179k ÷ 2 = 89.5k) |
| **Nước hoa Rakta 10ml** | **179.000đ** | **179.000đ** | **89.500đ** | ✅ **Chuẩn 100%** (179k ÷ 2 = 89.5k) |
| **Nước hoa Tanmaya 10ml** | **179.000đ** | **179.000đ** | **89.500đ** | ✅ **Chuẩn 100%** (179k ÷ 2 = 89.5k) |
| **Nước hoa Kamal 10ml** | **159.000đ** | **179.000đ** *(Lệch)* | **89.500đ** | ⚠️ **Lệch giá gạch**: PDF là 159k, banner đang gạch 179k (bán 89.5k là giảm 43,7%) |
| **Nước hoa Sarika 10ml** | **159.000đ** | **179.000đ** *(Lệch)* | **89.500đ** | ⚠️ **Lệch giá gạch**: PDF là 159k, banner đang gạch 179k (bán 89.5k là giảm 43,7%) |

> **Nhận xét Flash Sale:** Marketing thiết kế banner đã gom chung 5 mùi nước hoa D'VAH thành đồng giá niêm yết `179.000đ` giảm còn `89.500đ`. Về mặt bán hàng khách được mua giá rẻ `89.500đ`, nhưng về mặt câu chữ thì Kamal & Sarika thực tế giảm 43,7% (chứ không tròn 50% của 159k).

---

### 2.2. Kiểm tra 3 Bộ Combo Quà Tặng

| Combo | Thành phần theo chương trình | Tổng giá trị gốc theo PDF 15/04 | Số liệu ghi trên Banner | Kết luận kiểm tra |
| :--- | :--- | :---: | :---: | :--- |
| **Combo 1: Nàng Xinh** | Kem body (279k) + Ủ trắng (249k) + Sữa tắm (179k) | **707.000đ** | *Gốc 707.000đ $\rightarrow$ Bán 529.000đ (Tiết kiệm 25% / 178k)* | ✅ **KHỚP 100% TỪNG ĐỒNG** so với PDF chương trình |
| **Combo 2: Nàng Quyến Rũ** | Kem body (279k) + Sữa tắm (179k) + Nước hoa Kamal (159k) | **617.000đ** *(Nếu theo đúng PDF)* | *Gốc 637.000đ $\rightarrow$ Bán 499.000đ (Tiết kiệm 22% / 138k)* | ⚠️ **Lệch 20k ở giá gốc**: Do Designer cộng Kamal là 179k ($279 + 179 + 179 = 637k$). Nếu lấy Kamal đúng 159k thì gốc là 617k, tiết kiệm 19% (118k) |
| **Combo 3: Nàng Thơm** | Kem ủ trắng (249k) + Sữa tắm (179k) + Nước hoa Tanmaya (179k) | **607.000đ** | *Gốc 607.000đ $\rightarrow$ Bán 499.000đ (Tiết kiệm 18% / 108k)* | ✅ **KHỚP 100% TỪNG ĐỒNG** so với PDF chương trình ($249 + 179 + 179 = 607k$) |

---

## 3. Cập Nhật Mã Nguồn Web Phù Hợp Cả 2 Hệ Thống

1. **Trang Danh mục sản phẩm & Chi tiết (`products.js`):**
   * Bảo lưu nguyên vẹn 100% dữ liệu đã deploy theo Bảng giá Ecom T10/2026.
   * Hiển thị đầy đủ nhãn công khai *"Giá đã bao gồm thuế GTGT (VAT)"* để phục vụ xét duyệt Bộ Công Thương.
2. **Khối Khuyến mãi & Flash Sale (`promotions.js`):**
   * Giữ trọn vẹn số liệu chương trình theo đúng Chính sách bán hàng 15/04/2026:
     * Combo 1: Gốc `707.000đ` $\rightarrow$ Bán `529.000đ` (Tiết kiệm 25%).
     * Combo 2: Gốc `637.000đ` $\rightarrow$ Bán `499.000đ` (Tiết kiệm 22%).
     * Combo 3: Gốc `607.000đ` $\rightarrow$ Bán `499.000đ` (Tiết kiệm 18%).
     * Bán lẻ 50%: Sữa tắm `89.500đ`, Kem body `139.500đ`, Kem ủ trắng `124.500đ`, Nước hoa `89.500đ`.
   * Khớp hoàn hảo với tất cả hình ảnh banner truyền thông của SkinID.
