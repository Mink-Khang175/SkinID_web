# Việc cần chốt với công ty trước khi đăng ký website

Cập nhật: 03/11/2026. File này chỉ gồm 2 phần: **(1) nội dung/giá/khuyến mãi hiện có đang vi phạm hoặc có rủi ro vi phạm pháp luật**, và **(2) thông tin còn thiếu** mà tôi không tự điền được. Những gì công ty đã quy định thì không hỏi lại.

## Đã chốt (không cần hỏi lại)

- Bảng giá chuẩn: **Bảng giá bán Ecom T10** (`src/data/ecom-price-list-2026-10.json`), giá và chương trình khuyến mãi trên web `skinid.vn` là quy định của công ty. Giá niêm yết = cột "Giá Max", giá bán = cột "Giá Always On".
- 3 bước nhận ưu đãi 50% theo banner: Like & Follow Fanpage → Share công khai → Comment "SKINID50" → Inbox SkinID để được xác nhận. Đã đồng bộ khối "Like · Share · Enjoy" ở trang chủ theo banner này.

> Ghi chú về cách tôi kiểm tra: không đọc được nội dung khuyến mãi trên `skinid.vn` bản đang chạy (trang tải bằng JavaScript nên công cụ chỉ thấy tiêu đề). Tôi dùng dữ liệu trong mã nguồn (`src/data/promotions.js`) làm bản chuẩn. **Nếu bản đang deploy khác mã nguồn, cần báo tôi.**

---

## 1. Nội dung đang vi phạm hoặc có rủi ro vi phạm pháp luật

Căn cứ lấy từ nguồn thứ cấp (không phải văn bản gốc) nên pháp chế cần đối chiếu trước khi kết luận.

### 1.1. Combo: giá quảng cáo khác giá khách phải trả — **rủi ro cao**

- Trang `/khuyen-mai` và trang chủ quảng cáo giá combo **529.000đ / 499.000đ / 499.000đ**.
- Nút "Thêm bộ quà vào giỏ" chỉ thêm từng sản phẩm lẻ; giỏ hàng **không có logic giá combo**, nên khách bị tính theo tổng giá từng sản phẩm trong bảng giá T10:

  | Combo | Giá quảng cáo | Giá khách thực trả trong giỏ (tổng từng SP theo T10) |
  |---|---|---|
  | Nàng Xinh | 529.000đ | 700.000đ (276.000 + 247.000 + 177.000) |
  | Nàng Quyến Rũ | 499.000đ | 610.000đ (276.000 + 177.000 + 157.000) |
  | Nàng Thơm | 499.000đ | 601.000đ (247.000 + 177.000 + 177.000) |

- Căn cứ: quy định về niêm yết/đăng tải giá phải đúng với giá bán thực tế và cấm thông tin gây nhầm lẫn về giá (Luật Giá; Luật Bảo vệ quyền lợi người tiêu dùng 2023).
- Hướng xử lý (chọn 1): (a) lập trình giá combo trong giỏ; (b) chuyển combo sang tư vấn qua Zalo như sản phẩm giảm 50% cho tới khi lập trình xong.

### 1.2. Giá gạch trên banner là giá niêm yết **chưa VAT**, khác giá hiển thị trên web

Giá gạch trên banner (`179.000đ`, `279.000đ`, `249.000đ`) chính là "Giá Max (niêm yết)" của bảng T10 **chia 1,1** (196.900 ÷ 1,1 = 179.000; 306.900 ÷ 1,1 = 279.000; 273.900 ÷ 1,1 = 249.000). Trong khi web hiển thị giá đã nhân VAT:

| Sản phẩm | Giá gạch banner | Niêm yết T10 (đã VAT) | Giá bán web T10 | Giá khuyến mãi | Giảm so với giá bán web |
|---|---|---|---|---|---|
| Sữa tắm TWON 450ml | 179.000 | 196.900 | 177.000 | 89.500 | 49,4% |
| Kem body 250ml | 279.000 | 306.900 | 276.000 | 139.500 | 49,5% |
| Kem ủ trắng 250ml | 249.000 | 273.900 | 247.000 | 124.500 | 49,6% |
| D'VAH Malini, Rakta, Tanmaya | 179.000 | 196.900 | 177.000 | 89.500 | 49,4% |
| D'VAH Kamal, Sarika | 179.000 (**sai**) | 174.900 | 157.000 | 89.500 | 43,0% |

- **Sai số học chỉ ở Kamal và Sarika**: niêm yết T10 là 174.900đ, chia 1,1 = 159.000đ, không phải 179.000đ. Banner ghi 179.000đ nên "−50%" của hai sản phẩm này thực chất giảm khoảng 44% so với niêm yết chưa VAT.
- **Điểm cần công ty chốt**: giá 89.500đ, 139.500đ, 124.500đ khách trả **đã gồm VAT hay chưa**? Banner không ghi, web cũng chưa ghi. Nếu đã gồm VAT thì "50%" tính trên giá chưa VAT là cách quảng cáo dễ gây nhầm lẫn; mức giảm so với giá web (đã VAT) thực tế là 49,4–49,6%.
- Combo cũng tính theo giá chưa VAT: "Tổng giá trị" 707.000 = 279.000 + 249.000 + 179.000. Riêng combo 2 dùng 179.000 cho Kamal (đúng ra 159.000), nên "Tổng giá trị" 637.000 và "Tiết kiệm 138.000đ (22%)" bị phóng đại.
- Căn cứ: giá niêm yết phải là giá đã gồm thuế, và quảng cáo mức giảm không đúng giá thực là thông tin gây nhầm lẫn (Luật Giá; Luật Bảo vệ quyền lợi người tiêu dùng 2023; Luật Quảng cáo). Pháp chế cần đối chiếu văn bản gốc.
- Hướng xử lý: ghi rõ "giá đã bao gồm VAT", hoặc quy đổi giá gạch sang giá đã VAT (196.900đ, 306.900đ…); sửa Kamal và Sarika thành 159.000đ (chưa VAT) hoặc 174.900đ (đã VAT).

### 1.3. Mức giảm 50% sát trần luật định

- Nghị định 128/2024/NĐ-CP (sửa khoản 2 Điều 7 Nghị định 81/2018) quy định mức giảm giá tối đa **không vượt quá 50% giá bán ngay trước thời gian khuyến mại** ([nguồn](https://lsvn.vn/giam-gia-khuyen-mai-hang-hoa-dich-vu-khong-duoc-vuot-qua-50-gia-ban-a148560.html)).
- Giá khuyến mãi hiện tại (89.500đ…) đều ≥ 50% giá bán thực nên **chưa vượt trần**, **nhưng**:
  - **Không được chồng thêm mã giảm giá** (`SKINID10`, `WELCOME50`) lên giá 50% — nếu chồng thì tổng mức giảm vượt 50%. Cần quy định rõ trong thể lệ và hướng dẫn tư vấn viên (mã miễn phí vận chuyển `FREESHIP` không giảm giá hàng nên không tính).
  - Cách tính "50%" trên giá niêm yết chưa VAT (xem 1.2) cần ghi rõ để không gây nhầm lẫn.

### 1.4. Thiếu thể lệ khuyến mại công khai

- Trang `/khuyen-mai` hiện **không công bố thời gian bắt đầu – kết thúc, phạm vi áp dụng, số lượng, cách xác nhận, quyền lợi/nghĩa vụ**; chỉ có 3 bước và nút "Nhận ưu đãi".
- Căn cứ: Luật Thương mại 2005 yêu cầu thương nhân thông báo công khai các nội dung chương trình khuyến mại tại nơi bán và trên phương tiện quảng cáo (số điều: cần pháp chế xác nhận; tôi chưa kiểm chứng văn bản gốc).
- Hướng xử lý: thêm trang/khối "Thể lệ chương trình" (xem mục 2.2).

### 1.5. Giá niêm yết Rilastil luôn hiển thị giảm 10%

- Bảng T10: giá niêm yết = giá bán / 0,9 (ví dụ 495.000 → 445.500). Web hiển thị nhãn "−10%" và giá gạch cho mọi sản phẩm Rilastil, quanh năm.
- Rủi ro: giá gạch phải là mức giá **đã thực sự được niêm yết/bán** trước đó. Nếu chưa từng bán ở giá niêm yết thì bị coi là "giá gốc ảo".
- Hướng xử lý: công ty giữ chứng từ chứng minh giá niêm yết đã áp dụng, hoặc bỏ nhãn "−10%" nếu không chứng minh được.

### 1.6. Điều kiện nhận ưu đãi bằng hành động trên mạng xã hội

- Khuyến mại giảm giá có điều kiện Like/Share/Comment không bị cấm rõ ràng trong các nguồn tôi đọc, **nhưng**: (a) điều kiện phải được công bố rõ trong thể lệ (mục 1.4); (b) việc xác nhận thủ công qua tin nhắn cần quy trình nhất quán để không phân biệt đối xử giữa khách hàng; (c) tuân thủ điều khoản của Meta là việc riêng. Cần pháp chế rà soát.
- Thông báo Sở Công Thương: Nghị định 239/2026/NĐ-CP (có hiệu lực 26/06/2026, sửa Nghị định 81/2018) bỏ giới hạn tổng thời gian khuyến mại giảm giá (trước đây 120 ngày/năm theo nguồn thứ cấp) ([KPMG](https://kpmg.com/vn/en/insights/2026/07/decree-239-on-sales-promotion.html)). Chưa xác định được khuyến mại giảm giá bán qua website của chính doanh nghiệp có phải thông báo hay không, cần hỏi Sở Công Thương.

---

## 2. Thông tin còn thiếu cần công ty cung cấp

### 2.1. Pháp lý và thủ tục đăng ký website

- [ ] **Người phụ trách quản lý, vận hành website** (họ tên, chức danh, số điện thoại, email). Footer mới chỉ ghi người đại diện pháp luật.
- [ ] **Giá khuyến mãi trên banner (89.500đ, 139.500đ, 124.500đ, combo) và giá trên web đã gồm VAT chưa?** Banner dùng giá chưa VAT, web dùng giá đã VAT (xem 1.2); cần công ty xác nhận để ghi "đã bao gồm VAT".
- [ ] **Link/số xác nhận** sẽ điền vào `[SỐ / LINK XÁC NHẬN]` sau khi được xác nhận thông báo (việc cần làm sau, không hỏi ngay).

### 2.2. Thể lệ chương trình giảm 50% (để làm mục 1.4)

- [ ] **Ngày bắt đầu và ngày kết thúc** chương trình; có giới hạn số lượng sản phẩm hoặc số lần mỗi khách không.
- [ ] **Ai và bằng cách nào xác nhận** khách đã Like/Follow, Share công khai, Comment "SKINID50" (tư vấn viên nào, trong bao lâu, lưu bằng chứng ra sao).
- [ ] **Có cho dùng cùng voucher khác không?** (Gợi ý: không, theo mục 1.3.)
- [ ] **Link Fanpage chính thức và link Messenger** để gắn nút "INBOX NGAY" (hiện chỉ có Zalo và hotline). Tên Fanpage ghi chính xác như thế nào ("SkinId shop" hay "SkinID shop")?

### 2.3. Phiếu công bố mỹ phẩm (nhà cung cấp / pháp chế sản phẩm)

- [ ] **Phiếu đúng cho 12 sản phẩm Rilastil** đang bị gắn nhầm phiếu của sản phẩm khác (hiện web để "Đang cập nhật"):

  | Sản phẩm | Link hiện gắn nhầm vào phiếu của |
  |---|---|
  | Sun System Velvet Touch Cream SPF50+ 50ml | Multirepair Retinol Tech Serum |
  | Sun System Water Touch Moisturizing Fluid 50ml | Multirepair Retinol Tech Serum |
  | Allergy Protective Fluid SPF50+ 50ml | Age Repair Protective Cream SPF50+ |
  | Xerolact PB Balm 50ml / 200ml / 400ml | Xerolact Cleansing Gel |
  | Acnestil Cleansing Gel 200ml / 400ml | Acnestil Cleansing Mousse |
  | Acnestil H-Biome Moisturizing Cream 40ml | Acnestil Cleansing Mousse |
  | Daily Care Rebalancing Soothing Toner 200ml | Daily Care Rebalancing Astringent Toner |
  | Multirepair Retinol Tech Serum 30ml | Intense C Gel Serum |
  | Aqua Intense 72H Gel-Cream 15ml | Link Drive không mở được ("Kem 72h.pdf") |

- [ ] **Xác nhận số `191712/22/CBMP-QLD` (22/12/2022)** là số tiếp nhận đúng cho nhiều sản phẩm Rilastil cùng lúc (tất cả ảnh phiếu đều ghi số này).
- [ ] **Stretch Marks 75ml** (có trên web, không có trong file Rilastil 08/09/2026, chưa có phiếu): còn bán không?
- [ ] **D'VAH Sữa tắm KaaMaa 400ml** (`304/25/CBMP-TN`, có trong sheet nhưng chưa có trên web): có bán không?
- [ ] **Ảnh phiếu Sarika, Malini, Rakta, Tanmaya** đều hiện tên "NƯỚC HOA SARIKA" ở trang đầu: xác nhận có đúng phiếu từng sản phẩm không.
- [ ] **Nhà sản xuất của TWON và D'VAH** (đang thiếu; Rilastil đã có Instituto Ganassini S.p.A, Ý).

### 2.3b. Thanh toán và vận chuyển

- [ ] **Tên cổng thanh toán và các ví hỗ trợ** (`[TÊN CỔNG THANH TOÁN]`, `[MoMo / ZaloPay / VNPay]`).
- [ ] **Con số `[5.000.000đ]`** trong Chính sách thanh toán là ngưỡng gì và là bao nhiêu.

### 2.4. Soi da AI, thiết bị và dữ liệu cá nhân

- [ ] **Web có lưu ảnh soi da của khách không?** Popup xin quyền camera đang ghi "không lưu trữ trên bất kỳ máy chủ nào" nhưng hồ sơ khách có "lịch sử soi da". Cần chọn một trong hai `[chỉ phân tích, không lưu ảnh]` / `[lưu ảnh để theo dõi tiến triển]`.
- [ ] **Đối tác ACIE**: tên pháp nhân đầy đủ, quốc gia đặt máy chủ, có chuyển dữ liệu ra nước ngoài không, **thời gian lưu trữ** (`[THỜI GIAN]`).
- [ ] **Tính năng "Tải dữ liệu của tôi"** đã có chưa (chính sách đang nhắc tới).
- [ ] **Có tài liệu kiểm định độ chính xác của AI không?** Nếu không, bỏ mục `[Thông tin độ chính xác/kiểm định nếu có]`.
- [ ] **Thiết bị soi da có bán trên web không?** Nếu có: tên thiết bị, danh sách chỉ số đo, phụ kiện được bảo hành, hotline và địa chỉ bảo hành. Nếu không: bỏ chính sách bảo hành thiết bị khỏi footer.
- [ ] **Công cụ theo dõi đang dùng** (Google Analytics, Meta Pixel…) để quyết định thông báo cookie.

### 2.5. Hình ảnh và vận hành

- [ ] **Quyền sử dụng ảnh**: một số ảnh sản phẩm lấy từ `rilastilvn.com.vn`; công ty có văn bản cho phép sử dụng không?
- [ ] **Tài khoản thử** để kiểm tra luồng đặt hàng đến cùng (checkout bắt buộc đăng nhập): VietQR, thanh toán khi nhận hàng, email xác nhận đơn.

---

### Tài liệu tham chiếu trong dự án

- Báo cáo đối chiếu phiếu công bố: [product-compliance-check-2026-11-03.md](product-compliance-check-2026-11-03.md)
- Giá chuẩn: `src/data/ecom-price-list-2026-10.json`; khuyến mãi: `src/data/promotions.js`
- Chính sách: `src/data/legalPolicies.js`; thông tin công ty: `src/data/companyInfo.js`
