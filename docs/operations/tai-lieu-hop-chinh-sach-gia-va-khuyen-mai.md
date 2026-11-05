# TÀI LIỆU HỌP NỘI BỘ: CHỐNG LỆCH GIÁ, CHUẨN HÓA BANNER & ĐIỀU KIỆN ĐĂNG KÝ BỘ CÔNG THƯƠNG

> **Thời gian họp:** Chiều ngày 05/11/2026  
> **Người chuẩn bị:** Ban Vận hành Kỹ thuật Website SkinID.vn  
> **Mục tiêu cuộc họp:** Chốt phương án xử lý các điểm lệch giá giữa Banner – Website – Hóa đơn để đồng bộ hệ thống và nộp hồ sơ đăng ký website thương mại điện tử với Bộ Công Thương (online.gov.vn).

---

## TỔNG QUAN HIỆN TRẠNG HỆ THỐNG SKINID

Hiện tại website `skinid.vn` đã được thiết lập tách bạch thành **2 hệ thống giá**:
1. **Trang Toàn bộ Sản phẩm (Danh mục /san-pham & Mua lẻ):**
   * Hiển thị: **Giá gạch là Giá Max (niêm yết) và Giá bán giảm 10% (Giá Always On)**.
   * Ví dụ: Sữa tắm TWON gạch `196.900đ` bán `177.000đ` (-10%); Rilastil gạch `495.000đ` bán `445.500đ` (-10%).
   * Đã gắn ghi chú pháp lý: *"Tất cả giá đã bao gồm thuế GTGT (VAT 10%)"*.
2. **Khối Chương trình Khuyến mãi (Banner Trang chủ & Trang /khuyen-mai):**
   * Hiển thị: Khớp 100% theo **Banner Marketing và Chính sách bán hàng 15/04/2026**:
     * Flash Sale 50%: Sữa tắm `89.500đ` (gạch 179k), Kem body `139.500đ` (gạch 279k), Kem ủ trắng `124.500đ` (gạch 249k), Nước hoa `89.500đ` (gạch 179k).
     * Combo 1 (Nàng Xinh): Gốc `707.000đ` $\rightarrow$ Bán `529.000đ` (Tiết kiệm 25%).
     * Combo 2 (Nàng Quyến Rũ): Gốc `637.000đ` $\rightarrow$ Bán `499.000đ` (Tiết kiệm 22%).
     * Combo 3 (Nàng Thơm): Gốc `607.000đ` $\rightarrow$ Bán `499.000đ` (Tiết kiệm 18%).

---

## 4 VẤN ĐỀ CỐT LÕI CẦN HỎI VÀ CHỐT TRONG BUỔI HỌP

### VẤN ĐỀ 1: LỆCH GIÁ GẠCH GIỮA BANNER QUẢNG CÁO VÀ WEBSITE

* **Thực tế:**
  * Trên **Website**: Giá gạch của Sữa tắm là **196.900đ** (theo Bảng giá Ecom T10 đã có VAT).
  * Trên **Banner**: Giá gạch của Sữa tắm lại là **179.000đ** (theo Chính sách 15/04/2026 cũ, bản chất là $196.900 ÷ 1.1$ - tức giá chưa VAT).
  * Tương tự: Kem body trên web gạch **306.900đ** nhưng banner gạch **279.000đ**; Kem ủ trắng web gạch **273.900đ** nhưng banner gạch **249.000đ**.
* **Rủi ro khi Bộ Công Thương thẩm định:**
  * Chuyên viên duyệt web sẽ vào trang chủ thấy banner gạch `179.000đ`, nhưng click vào danh mục sản phẩm lại thấy gạch `196.900đ`. Sẽ bị đánh lỗi **"Niêm yết giá không nhất quán, gây nhầm lẫn cho người tiêu dùng"**.
* **Căn cứ pháp lý:**
  * **Khoản 6 Điều 4 Luật Giá 2023:** *"Giá niêm yết là giá hàng hóa, dịch vụ thông báo công khai đến khách hàng và là giá đã bao gồm các loại thuế, phí..."*
  * **Khoản 1 Điều 10 Luật Bảo vệ quyền lợi người tiêu dùng 2023:** Nghiêm cấm hành vi cung cấp thông tin không đầy đủ, sai lệch, gây nhầm lẫn về giá bán hàng hóa.
* ❓ **CÂU HỎI CHỐT VỚI BAN GIÁM ĐỐC & MARKETING:**
  > *"Công ty chốt con số giá niêm yết chính thức đã VAT là bao nhiêu? Sữa tắm là 179.000đ hay 196.900đ?*  
  > *Nếu là 196.900đ thì Marketing có đồng ý xuất lại bộ banner mới gạch giá chuẩn có VAT (gạch 196.9k bán 98.5k) để đồng nhất với web không?"*

---

### VẤN ĐỀ 2: SAI LỆCH SỐ HỌC CỦA D'VAH KAMAL & SARIKA TRÊN BANNER VÀ COMBO 2

* **Thực tế:**
  * Theo văn bản **Chính sách bán hàng 15/04/2026**: Nước hoa Kamal và Sarika có giá niêm yết chỉ là **159.000đ** (rẻ hơn 20k so với Rakta, Tanmaya, Malini giá 179.000đ).
  * **Trên Banner quảng cáo đang bị 2 lỗi tính toán:**
    1. **Mục Bán lẻ:** Banner gộp chung cả 5 chai và ghi: Gạch `179.000đ` $\rightarrow$ Bán `89.500đ` (-50%). Nhưng nếu Kamal/Sarika giá gốc 159k mà bán 89.5k thì mức giảm thực tế chỉ là **43,7%** (quảng cáo giảm 50% là sai lệch số học).
    2. **Mục Combo 2:** Banner ghi Tổng giá trị gốc là **637.000đ**. Con số này do Designer cộng chai Kamal giá 179k ($279k + 179k + 179k = 637k$). Nhưng theo chính sách thì Kamal chỉ 159k, nên tổng gốc đúng chỉ là **617.000đ**, và mức tiết kiệm thực tế là 19% (118.000đ) chứ không phải 22% (138.000đ).
* **Rủi ro pháp lý:**
  * Bị coi là hành vi quảng cáo phóng đại giá trị khuyến mại, vi phạm quy định về bảo vệ quyền lợi người tiêu dùng.
* **Căn cứ pháp lý:**
  * **Khoản 5 Điều 8 Luật Quảng cáo 2012:** Cấm quảng cáo sai sự thật hoặc gây nhầm lẫn về giá cả, mức giảm giá, chương trình khuyến mại.
  * **Điểm c Khoản 1 Điều 47 Nghị định 98/2020/NĐ-CP:** Phạt tiền từ **10.000.000đ đến 20.000.000đ** đối với hành vi thực hiện khuyến mại không đúng với chương trình đã công bố.
* ❓ **CÂU HỎI CHỐT VỚI MARKETING & THIẾT KẾ:**
  > *"Nước hoa Kamal & Sarika giá niêm yết là 159.000đ hay 179.000đ?*  
  > *Nếu là 159.000đ thì banner cần sửa lại: Kamal bán 79.500đ (cho tròn 50%), và Combo 2 tổng gốc là 617.000đ.*  
  > *Nếu công ty muốn bán 89.500đ và giữ combo 637k thì công ty cần ra thông báo chính thức điều chỉnh giá niêm yết Kamal/Sarika lên bằng 179.000đ để hợp thức hóa giấy tờ."*

---

### VẤN ĐỀ 3: RỦI RO "GIẢM GIÁ 10% QUANH NĂM" TRÊN TOÀN BỘ SẢN PHẨM (GIÁ GẠCH ẢO)

* **Thực tế:**
  * Trên web, tất cả 46 sản phẩm Rilastil và 8 sản phẩm TWON/DVAH đều đang hiển thị giá gạch (Giá Max) và bán giảm 10% (Giá Always On) quanh năm suốt tháng.
* **Rủi ro pháp lý:**
  * Luật quy định: Giá gạch (giá trước khuyến mại) phải là mức giá **đã thực tế được bán** trước thời gian khuyến mại.
  * Nếu một sản phẩm từ lúc đưa lên web chưa từng bán ở giá Max mà lúc nào cũng gạch giá Max để ghi giảm 10%, khi cơ quan chức năng thanh kiểm tra hóa đơn bán hàng mà không có hóa đơn nào bán ở giá Max, sẽ bị phạt lỗi **"Nâng giá niêm yết để tạo khuyến mại ảo"**.
* **Căn cứ pháp lý:**
  * **Khoản 2 Điều 7 Nghị định 81/2018/NĐ-CP (sửa đổi bởi Nghị định 128/2024/NĐ-CP):** Giá bán làm căn cứ giảm giá khuyến mại phải là giá bán hàng hóa ngay trước thời gian khuyến mại của thương nhân.
* ❓ **CÂU HỎI CHỐT VỚI KẾ TOÁN & BAN GIÁM ĐỐC:**
  > *"Bên kế toán có lưu trữ hóa đơn, chứng từ nào từng xuất bán ở mức Giá Max (chưa giảm 10%) không?*  
  > *Nếu có chứng từ: Web tiếp tục để giá gạch giảm 10% hoàn toàn an tâm.*  
  > *Nếu từ trước đến nay chỉ bán ở giá Always On: Để an toàn 100% khi nộp Bộ Công Thương, công ty có đồng ý hiển thị thẳng giá Always On là giá bán chính thức, chỉ gạch giá trong các đợt chiến dịch có thời hạn?"*

---

### VẤN ĐỀ 4: THỂ LỆ CHƯƠNG TRÌNH KHUYẾN MẠI 50% & THÔNG BÁO SỞ CÔNG THƯƠNG

* **Thực tế:**
  * Chương trình Flash Sale 50% trên banner có đặt điều kiện: *1. Like & Follow; 2. Share bài viết công khai; 3. Comment "SKINID50" rồi Inbox nhận mã*.
  * Tuy nhiên, trên website và banner **chưa có Thể lệ chi tiết**: Ngày bắt đầu, Ngày kết thúc, Giới hạn số lượng bao nhiêu suất.
* **Căn cứ pháp lý:**
  * **Điều 101 Luật Thương mại 2005 & Điều 17 Nghị định 81/2018/NĐ-CP:** Thương nhân thực hiện chương trình khuyến mại phải công bố công khai, đầy đủ thể lệ tại nơi bán và phải thông báo với Sở Công Thương trước khi thực hiện.
  * **Nghị định 128/2024/NĐ-CP:** Mức giảm giá tối đa không được vượt quá 50% giá bán ngay trước khuyến mại. Vì vậy, **không được cho khách cộng dồn voucher giảm giá khác (như voucher 10%, voucher 50k) lên các sản phẩm đã giảm 50%**.
* ❓ **CÂU HỎI CHỐT VỚI MARKETING & PHÁP CHẾ:**
  > *1. "Chương trình Flash Sale 50% và 3 Combo này áp dụng từ ngày nào đến ngày nào? Có giới hạn số lượng mỗi khách chỉ được mua 1 sản phẩm không?"*  
  > *2. "Công ty đã nộp thông báo chương trình khuyến mại này lên Sở Công Thương TP.HCM chưa?"*  
  > *3. "Xác nhận thể lệ: Các deal 50% không áp dụng đồng thời với mã voucher giảm giá khác."*

---

## TỔNG KẾT BẢNG CHECKLIST HÀNH ĐỘNG SAU CUỘC HỌP

| Hạng mục | Người chịu trách nhiệm | Phương án đề xuất |
| :--- | :---: | :--- |
| **Giá gạch Banner** | Marketing / Designer | Xuất lại banner với giá gạch đã gồm VAT (196.9k, 306.9k, 273.9k) hoặc có văn bản giải trình giá chương trình riêng. |
| **Giá Kamal / Sarika** | Ban Giám đốc | Quyết định giữ giá 159k (sửa banner giảm còn 79.5k, combo 617k) HOẶC tăng giá niêm yết lên 179k để hợp thức hóa banner. |
| **Chứng từ Giá Max** | Kế toán trưởng | Rà soát hóa đơn xuất bán giá Max làm căn cứ đối chiếu giảm giá 10%. |
| **Thời hạn khuyến mại** | Marketing | Cung cấp ngày bắt đầu – kết thúc và giới hạn suất để đưa vào chân trang thể lệ khuyến mãi. |
| **Hồ sơ Bộ Công Thương** | Vận hành Web / Pháp chế | Sau khi chốt các điểm trên, tiến hành nộp hồ sơ trực tuyến tại `online.gov.vn`. |
