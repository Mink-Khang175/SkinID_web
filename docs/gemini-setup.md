# Gemini: kết quả kiểm tra và cách nối an toàn

## Phát hiện ngày 10/09/2026

- Trong js/skin-ai.js của nhánh main GitHub được kiểm tra có biểu thức GEMINI_API_KEY
  không rỗng sử dụng atob (Base64).
- Không in, lưu hoặc đưa giá trị đó vào frontend. Chưa gọi Google bằng khóa này,
  chưa xác minh khóa còn hoạt động, quyền sở hữu, quota hoặc billing.
- Kiểm tra tĩnh giá trị sau một lần giải mã không thấy chuỗi khớp mẫu khóa Google
  thông dụng; vì vậy cấu hình không rỗng không phải bằng chứng có khóa Gemini dùng được.
- Bản local hiện giữ GEMINI_API_KEY trống. Không có analysisEndpoint mặc định.
- Không thể tuyên bố soi da đã nối Gemini thành công.

Google khuyến cáo không đưa API key vào mã client và dùng backend proxy để bảo vệ khóa.
Khóa từng xuất hiện trong repository public nên được thu hồi và thay mới bởi người quản trị.
[Google: Using Gemini API keys](https://ai.google.dev/gemini-api/docs/api-key)

## Cần đội backend thực hiện

1. Kiểm tra và thu hồi khóa đã công khai trong Google AI Studio/Cloud; kiểm tra usage/billing.
2. Tạo khóa mới giới hạn phù hợp, lưu trong secret manager/biến môi trường SERVER.
3. Cung cấp endpoint HTTPS phân tích ảnh, có xác thực, giới hạn dung lượng/tần suất,
   timeout và chính sách lưu/xóa ảnh. Không ghi base64 ảnh hoặc API key vào log.
4. Server giữ prompt, lựa chọn model và kiểm tra schema JSON trả về từ Gemini.
5. Trả về schema tương thích hàm renderResults trong src/js/analysis/skin-analysis.js.
6. Kiểm thử ảnh không có mặt, ảnh lỗi, lỗi quota, timeout, CORS và quyền truy cập.

Tên endpoint dưới đây chỉ là đề xuất, chưa có dịch vụ thực:

```http
POST /api/skin-analysis
Content-Type: application/json

{
  "images": ["<base64 chính diện>", "<base64 trái>", "<base64 phải>"],
  "skinType": "<giá trị biểu mẫu hiện tại>"
}
```

Frontend hiện chấp nhận { "analysis": ... } hoặc object kết quả trực tiếp.
Adapter hiện mới kiểm tra cơ bản skinTypeSummary/isNotFace; backend cần thống nhất
schema đầy đủ theo renderResults và validate chặt hơn trước khi dùng production.
Sau khi server có sẵn, đặt analysisEndpoint trong src/js/app/runtime-config.js
thành URL được duyệt. File này PUBLIC, chỉ đặt URL, không đặt API key.

Luồng hiện tại gửi POST JSON; nếu endpoint khác origin hoặc dùng cookie, cần thống nhất
CORS/credentials/CSRF với backend trước khi đấu nối. Chưa triển khai phần này.

## Giới hạn của bản hiện tại — không được nhầm với AI thật

createLocalSkinAnalysis tạo số liệu từ dữ liệu đầu vào bằng phép tính xác định.
Nó KHÔNG đo tình trạng da từ ảnh. Khi thiếu cấu hình hoặc endpoint lỗi, mã hiện tại
có thể dùng kết quả này thay thế. Lần sắp xếp thư mục giữ nguyên hành vi cũ theo yêu cầu.
Trước production cần tắt fallback mô phỏng, hiển thị lỗi có nút thử lại; nếu cần demo,
gắn nhãn demo rõ ràng và không lưu/gửi nó như báo cáo phân tích thật.

Không thu hồi khóa, chỉnh GitHub, triển khai server hoặc gửi ảnh người dùng trong lần làm này.
