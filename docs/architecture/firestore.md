# Firestore công ty: mô hình dữ liệu và vận hành

Kiểm tra trực tiếp **05/11/2026**: project `skinid-vietnam`, database `(default)`, Native mode, vùng `asia-southeast1`. Đã đối chiếu dữ liệu thật, service frontend, Worker và rules đang phát hành.

## Kết luận

Firestore phù hợp với quy mô hiện tại. Chưa cần đổi toàn bộ document ID hoặc chuyển PostgreSQL ngay. Giữ mỗi nghiệp vụ một nguồn dữ liệu chính, bảo vệ phân quyền và snapshot đơn hàng; khi chuyển backend sau này, thay adapter/API theo từng phần.

## Schema hiện tại

| Đường dẫn | Trách nhiệm / quyền | Số tài liệu trước sửa |
| --- | --- | --- |
| `products/{id}` | Catalog công khai, admin ghi; giá vốn phải ở subcollection `private` | 54 |
| `orders/{id}` | Worker tính giá/tạo đơn, chủ đơn đọc, admin vận hành; bảo vệ snapshot tài chính | 3 |
| `users/{uid}` | UID từ Firebase Auth; chủ hồ sơ chỉ sửa trường hồ sơ được phép | 6 |
| `users/{uid}/commerce/cart` | Giỏ cá nhân, không phải nguồn giá tin cậy khi checkout | 6 |
| `users/{uid}/addresses/{id}` | Địa chỉ cá nhân | 1 |
| `users/{uid}/activities/{id}` | Server ghi lịch sử nghiệp vụ | 1 |
| `users/{uid}/private/{id}` | Quota/dữ liệu server, client không đọc/ghi | 1 |
| `users/{uid}/skinReports/{id}` | Chủ hồ sơ/admin đọc; consultant/dermatologist đọc; sales/editor không đọc | 0 |
| `posts/{id}` | Nguồn ghi bài viết chính, công khai chỉ query `status == published` | 5 |
| `blog_posts/{id}` | Nguồn đọc dự phòng cũ, không tiếp tục ghi đôi | 0 |
| `pages/{id}` | Trang chính sách đã xuất bản; `home` là nội dung trang chủ | 6 |
| `pages/home/versions/{id}` | Lịch sử trang chủ, chỉ admin | 0 |
| `promotions/{CODE}` | Voucher online, mã in hoa làm document ID, Worker xác thực khi tạo đơn | 3 |
| `settings/system_config` | Cấu hình frontend công khai, không chứa secret | 1 |
| `settings/campaign_config` | Nguồn chiến dịch hiện hành mà frontend/admin đọc và ghi | Đã thêm 1 |
| `settings/probe`, `settings/probe2` | Dữ liệu thử nghiệm được giữ nguyên, chỉ admin đọc | 2 |
| `campaigns/{id}` | Dữ liệu chiến dịch kế thừa, giữ đối chiếu; không ghi đồng bộ bản sao nữa | 1 |
| `auditLogs`, `productPriceHistory`, `integrationOutbox` | Nhật ký và dispatch POS do server quản lý | 0 |

## Những gì đã sửa trực tiếp

- Sao lưu logic **90 tài liệu trước sửa**, rules và cấu hình ra `D:\SkinID\private-backups`, ngoài Git. Sau sửa có 91 tài liệu do thêm cấu hình chiến dịch.
- Chuyển thời gian ISO string ở **2 đơn kế thừa** sang Firestore Timestamp (`createdAt`, `updatedAt`, `s3SyncedAt`). Đơn còn lại đã đúng kiểu. Không thay giá, tổng tiền, mã POS, người mua hoặc trạng thái.
- Tạo `settings/campaign_config` từ đúng một chiến dịch active hiện hữu, giữ nguyên combo/deal, ghi rõ `salesChannel: store`. Không nhập giá khuyến mãi offline đè lên catalog online.
- Bật `DELETE_PROTECTION_ENABLED` chống xóa nhầm cả database. Cơ chế này không chống xóa từng document.
- Publish rules đã kiểm thử: email bootstrap phải được xác minh; claim `admin: true, role: admin` không được coi là super admin; khách không tự ghi `role`, `isAdmin`, `isSuperAdmin`, `customClaims`, `permissions` hay field ngoài hồ sơ. Email hồ sơ khi ghi phải khớp Firebase Auth.
- Giới hạn settings công khai theo document ID; chặn công khai bài nháp/hẹn giờ; bổ sung rules lưu lịch sử trang chủ; giới hạn quyền đọc báo cáo soi da; bảo vệ snapshot tài chính khỏi sửa trực tiếp bằng client admin.
- Đổi `.env.local` và `.dev.vars` sang project công ty; khóa JSON vẫn được ignore. Frontend dùng email đã xác minh từ Auth thay vì tin email tự ghi trong hồ sơ.

Sửa dữ liệu dùng `updateMask` + precondition `updateTime`/`exists: false`, cùng một atomic commit. Nếu dữ liệu thay đổi đồng thời, thao tác thất bại thay vì ghi đè. Kiểm tra lại sau sửa cho kết quả **0 sửa chữa cần thiết**. Tổng tiền của cả 3 đơn và thành tiền sản phẩm đều khớp.

## Hợp đồng dữ liệu

- Giá là số nguyên VND; Worker xác thực sản phẩm/voucher và tính tổng. Không tính lại đơn lịch sử theo giá catalog mới.
- Thời gian giao dịch là Firestore Timestamp. Ngày hiển thị bài viết có thể là chuỗi; adapter chuẩn hóa `author.name → author`, `publishedAt → date`, `relatedProductIds → featuredProductIds`. Nội dung bài dạng mảng được render thành các mục, không ép thành HTML string.
- `posts` là nguồn ghi bài mới; `blog_posts` chỉ đọc dự phòng. `settings/campaign_config` là nguồn ghi chiến dịch; `sync-campaign.mjs` không tạo ba bản sao không được ứng dụng đọc nữa.
- Rules không áp dụng cho service account. IAM và kiểm tra nghiệp vụ ở Worker vẫn bắt buộc. Không cấp quyền bằng tham số URL hay localStorage.
- Index hiện tại chỉ cần đơn trường cho các query đang dùng. `firestore.indexes.json` trống không phải lỗi; khi thêm query lọc + sắp xếp/phân trang phải bổ sung index tương ứng.

## Bảo trì

Chạy tại thư mục repo, thay `DUONG_DAN_JSON_LOCAL` bằng đường dẫn khóa trên máy:

```powershell
# Mặc định chỉ đọc, sao lưu và lập repair-plan.json
node scripts/backend/firestore-maintenance.mjs --project=skinid-vietnam --service-account=DUONG_DAN_JSON_LOCAL

# Chỉ áp dụng sau khi đã xem kế hoạch trong thư mục backup
node scripts/backend/firestore-maintenance.mjs --project=skinid-vietnam --service-account=DUONG_DAN_JSON_LOCAL --apply

# Thao tác cấu hình tách riêng khi được chủ quản yêu cầu
node scripts/backend/firestore-maintenance.mjs --project=skinid-vietnam --service-account=DUONG_DAN_JSON_LOCAL --apply-rules
node scripts/backend/firestore-maintenance.mjs --project=skinid-vietnam --service-account=DUONG_DAN_JSON_LOCAL --protect-database
```

Không đưa backup vào Git. Đây là bản sao logic phục vụ đối soát/khôi phục chọn lọc, không thay thế managed backup/PITR và không bảo đảm cùng một thời điểm nếu đang có ghi đồng thời. Ruleset trước sửa nằm trong `configuration.json`; rollback rules bằng cách chuyển release `cloud.firestore` về ruleset đó sau khi kiểm tra đúng project. Không khôi phục đè đơn đang vận hành từ bản sao cũ.

Kiểm thử rules cần Java 21+; runner chỉ chấp nhận localhost và project `demo-skinid`, không dùng khóa production:

```powershell
npm exec --yes --package=firebase-tools@15.35.0 -- firebase emulators:exec --project demo-skinid --only firestore "node tests/firestore-rules.emulator.mjs"
```

Kết quả đợt này: 97 test dự án, 38 tình huống rules trên emulator, build và bundle Worker dry-run đạt. Đã kiểm tra website đọc project công ty bằng kết nối thật, không tạo đơn/tài khoản/thông báo thử.

## Còn cần đối soát

1. **2 đơn kế thừa thiếu document hồ sơ người dùng tương ứng.** Giữ nguyên để đối chiếu Auth/đợt chuyển dữ liệu; không đoán UID, tạo tài khoản hoặc xóa đơn. Chi tiết nằm trong báo cáo private ngoài Git.
2. PITR/managed backup chưa bật: cần công ty chọn thời gian lưu, ngân sách và lịch thử khôi phục. Không tự bật dịch vụ có thêm phí.
3. Dashboard admin đọc toàn bộ users/orders/products; phù hợp lượng dữ liệu hiện tại, cần API thống kê + cursor pagination khi mở rộng.
4. Staff vẫn đọc hồ sơ khách hàng để dashboard hiện hữu hoạt động. Khi mở rộng đội ngũ cần tách quyền/API theo nhiệm vụ; App Check/chống spam và audit CMS phía server cần làm tiếp. Không mở quyền client ghi `auditLogs` để sửa các audit event frontend đang bị từ chối.
5. Công ty cần chốt chính sách giữ/xóa hồ sơ và đơn. API xóa tài khoản kế thừa có thao tác xóa đơn; đợt này không chạy thao tác đó.
6. Worker vẫn do anh Danh triển khai. Local/rules dùng project công ty không chứng minh toàn bộ secret trên Worker đang triển khai đã đúng. POS, Telegram và các tích hợp khác chưa kiểm thử bằng giao dịch thật.

Tham chiếu: [rules theo field](https://firebase.google.com/docs/firestore/security/rules-fields), [query và rules](https://firebase.google.com/docs/firestore/security/rules-query), [emulator](https://firebase.google.com/docs/firestore/security/test-rules-emulator), [Firestore best practices](https://firebase.google.com/docs/firestore/best-practices).
