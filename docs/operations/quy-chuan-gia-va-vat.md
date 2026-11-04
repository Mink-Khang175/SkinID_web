# Quy chuẩn Bảng giá, Thuế GTGT (VAT) & Khuyến mại Website SkinID.vn

> **Ngày cập nhật:** 04/11/2026  
> **Trạng thái:** Đã chuẩn hóa & đồng bộ trên toàn bộ mã nguồn website `skinid-web`  
> **Căn cứ pháp lý:** Luật Giá 2023, Luật Bảo vệ quyền lợi người tiêu dùng 2023, Nghị định 52/2013/NĐ-CP & Nghị định 85/2021/NĐ-CP (TMĐT), Nghị định 128/2024/NĐ-CP (Khuyến mại).

---

## 1. Căn cứ Pháp lý Bắt buộc khi Đăng ký Website với Bộ Công Thương

Khi nộp hồ sơ thông báo/đăng ký website thương mại điện tử bán hàng với **Bộ Công Thương (online.gov.vn)**, chuyên viên thẩm định kiểm tra rất nghiêm ngặt về tính minh bạch giá:
1. **Khoản 6 Điều 4 Luật Giá 2023:** *"Giá niêm yết là giá hàng hóa, dịch vụ do tổ chức, cá nhân sản xuất, kinh doanh thông báo công khai đến khách hàng... **Giá niêm yết là giá đã bao gồm các loại thuế, phí và lệ phí** (nếu có)."*
2. **Nghị định 52/2013/NĐ-CP & Nghị định 85/2021/NĐ-CP (Điều 31):** Website thương mại điện tử bán hàng phải công bố rõ ràng giá hàng hóa, dịch vụ và **phải nêu rõ giá đã bao gồm hay chưa bao gồm các chi phí liên quan đến việc mua hàng như thuế GTGT, phí đóng gói, phí vận chuyển...**
3. **Nghị định 128/2024/NĐ-CP (sửa đổi Điều 7 Nghị định 81/2018/NĐ-CP):** Mức giảm giá tối đa đối với hàng hóa, dịch vụ được khuyến mại **không được vượt quá 50%** giá hàng hóa, dịch vụ đó ngay trước thời gian khuyến mại.

---

## 2. Bản chất Bảng giá Ecom T10 (`Bảng giá bán Ecom-(T10).xlsx`)

Hệ thống SkinID sử dụng **Bảng giá bán Ecom T10/2026** làm cơ sở dữ liệu gốc duy nhất cho toàn bộ website:

| Cột trong Excel T10 | Tên gọi nghiệp vụ | Định nghĩa & Bản chất | Tình trạng VAT |
| :--- | :--- | :--- | :--- |
| **Cột G** | `Giá Max (Giá Niêm Yết)` | Giá niêm yết chính thức của hãng/công ty. Dùng làm giá gạch (original price) trên web và giá trần. | **ĐÃ BAO GỒM VAT 10%** *(Ban Giám Đốc xác nhận ngày 04/11/2026)* |
| **Cột H** | `Giá Always On` | Giá bán lẻ thực tế thường ngày (selling price) của SkinID trên website và các sàn TMĐT. | **ĐÃ BAO GỒM VAT 10%** |

### Quy tắc định giá giữa các nhãn hàng:
* **Nhãn RILASTIL (46 sản phẩm):**
  $$\text{Giá Always On} = \text{Giá Niêm Yết} \times 90\% \quad (\text{Chiết khấu thường xuyên } 10\%)$$
* **Nhãn TWON (3 sản phẩm) & D'VAH (5 sản phẩm):**
  Có mức giá Always On và giá niêm yết cố định (đều đã bao gồm thuế GTGT).

---

## 3. Giải quyết Vấn đề Giá Gạch Banner & Chương trình Khuyến mãi 50%

### 3.1. Nguồn gốc của sự chênh lệch giá trước đây
* Trước đây, bộ phận Marketing thiết kế banner khuyến mãi 50% đã lấy giá niêm yết **chưa VAT** để chia đôi:
  * Ví dụ Sữa tắm TWON: Giá niêm yết có VAT là `196.900đ`. Nếu chia $1.1$ (chưa VAT) ra `179.000đ` $\rightarrow$ chia đôi thành `89.500đ`. Banner ghi gạch `179.000đ`, bán `89.500đ`.
  * Trong khi đó, trên website hiển thị giá niêm yết là `196.900đ` (giá có VAT).
  * **Đặc biệt với D'VAH Kamal & Sarika:** Giá niêm yết chuẩn T10 là `174.900đ` (chưa VAT là `159.000đ`), nhưng banner lại ghi gạch nhầm thành `179.000đ`.

### 3.2. Chuẩn hóa đồng bộ trên Website (`skinid-web`)
Để đảm bảo **hồ sơ đăng ký Bộ Công Thương được duyệt 100% không bị trả về yêu cầu giải trình**, hệ thống web đã được chuẩn hóa kỹ thuật như sau:

1. **Quy chuẩn 100% giá hiển thị là Giá Đã Bao Gồm VAT:**
   * Mọi con số khách hàng nhìn thấy và thanh toán (Giá niêm yết, Giá Always On, Giá Flash Sale, Giá Combo, Tổng tiền giỏ hàng) đều là **giá cuối cùng đã có thuế GTGT (VAT 10%)**.
   * Khách hàng thanh toán đúng số tiền hiển thị, không bị cộng thêm phụ phí thuế lúc checkout.

2. **Công khai thông báo VAT tại 6 vị trí chiến lược:**
   * **Footer (Chân trang):** Hiển thị cam kết công khai: *"Tất cả giá sản phẩm trên website đều đã bao gồm thuế giá trị gia tăng (VAT) theo luật định."*
   * **Trang Chi tiết sản phẩm (`ProductDetailPage`):** Huy hiệu *"Giá đã bao gồm thuế VAT"*.
   * **Popup Chi tiết sản phẩm (`ProductDetailModal`):** Dòng ghi chú *"Giá đã bao gồm thuế VAT"*.
   * **Giỏ hàng & Đặt hàng (`CheckoutModal`):** Ghi rõ tổng tiền *"Đã bao gồm thuế GTGT (VAT)"*.
   * **Trang Khuyến mãi (`PromotionsLanding`):** Ghi chú công khai điều kiện giá đã VAT.
   * **Banner Flash Sale (`FlashSaleBanner`):** Ghi chú giá ưu đãi đã bao gồm VAT.

3. **Kiểm soát trần khuyến mại 50% (Tuân thủ Nghị định 128/2024/NĐ-CP):**
   * Các sản phẩm giảm 50% Flash Sale (`89.500đ`, `139.500đ`, `124.500đ`) được tính trực tiếp từ giá bán thực tế.
   * Hệ thống **chặn không cho cộng dồn thêm voucher giảm giá** (`SKINID10`, `WELCOME50`) vào các sản phẩm Flash Sale 50% để tránh tổng mức chiết khấu vượt quá 50% giá bán.

---

## 4. Bảng Tra cứu Giá Chuẩn Ecom T10 (Đã có VAT 10%)

### Nhóm TWON & D'VAH:
| Mã Hàng (SKU) | Tên sản phẩm | Dung tích | Giá Niêm Yết (đã VAT) | Giá Always On (đã VAT) | Giá Flash Sale 50% (đã VAT) |
| :--- | :--- | :---: | :---: | :---: | :---: |
| `TWON-BODY-LOTION-200ML` | Kem Body Lotion | 200ml | **306.900đ** | **276.000đ** | **139.500đ** |
| `TWON-U-TRANG-250ML` | Kem Ủ Trắng | 250g | **273.900đ** | **247.000đ** | **124.500đ** |
| `TWON-SUA-TAM-450ML` | Sữa Tắm TWON | 450ml | **196.900đ** | **177.000đ** | **89.500đ** |
| `DVAH-SARIKA-10ML` | Nước hoa Sarika | 10ml | **174.900đ** | **157.000đ** | **89.500đ** |
| `DVAH-KAMAL-10ML` | Nước hoa Kamal | 10ml | **174.900đ** | **157.000đ** | **89.500đ** |
| `DVAH-MALINI-10ML` | Nước hoa Malini | 10ml | **196.900đ** | **177.000đ** | **89.500đ** |
| `DVAH-TANMAYA-10ML` | Nước hoa Tanmaya | 10ml | **196.900đ** | **177.000đ** | **89.500đ** |
| `DVAH-RAKTA-10ML` | Nước hoa Rakta | 10ml | **196.900đ** | **177.000đ** | **89.500đ** |

*(46 sản phẩm RILASTIL áp dụng theo đúng Cột G và Cột H của file `Bảng giá bán Ecom-(T10).xlsx`, toàn bộ đã đồng bộ trong `src/data/products.js` và `src/data/ecom-price-list-2026-10.json`).*

---

## 5. Kết luận cho Vận hành & Marketing
* **Website:** Đã hoàn toàn tuân thủ pháp luật về giá, thuế và khuyến mại. Sẵn sàng 100% cho bước nộp hồ sơ lên Cổng thông tin Quản lý hoạt động TMĐT của Bộ Công Thương.
* **Marketing / Thiết kế banner:** Khi làm các chiến dịch truyền thông tiếp theo, thống nhất lấy con số **Giá Niêm Yết có VAT** làm giá gạch để đồng nhất thông tin giữa hình ảnh banner, fanpage và website, tránh gây thắc mắc cho khách hàng và đoàn kiểm tra liên ngành.
