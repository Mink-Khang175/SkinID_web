# Tổng quan kiến trúc

## Ranh giới runtime

```text
Browser (React + Vite)
  ├─ routes: ghép màn hình theo URL
  ├─ features: UI, state và API client theo nghiệp vụ
  └─ shared: layout, UI primitive, config và utility dùng chung
                 │ HTTPS + Firebase ID token
                 ▼
Cloudflare Worker
  ├─ orders
  ├─ skin analysis / Gemini
  └─ admin operations
                 │
                 ▼
Firebase Authentication + Firestore
```

Cloudflare Worker là trust boundary. Trình duyệt không quyết định giá cuối cùng,
quyền quản trị hoặc trạng thái thanh toán.

## Quy tắc phụ thuộc frontend

- `app` có thể import `routes`, `features` và `shared`.
- `routes` ghép feature và shared component, không chứa business rule.
- Một feature không import file nội bộ của feature khác; chỉ import public API từ
  `index.js`.
- `shared` không import `features` hoặc `routes`.
- Code mới dùng ES modules; không công bố thêm API qua `window`.

## Trạng thái chuyển đổi

Routing và app providers đã nằm trong `src/app`. Các route được code-split. Route
`/products` là route React thuần trong `src/features/catalog`: URL là nguồn state cho
tìm kiếm/bộ lọc/sắp xếp, card và modal không sửa DOM thủ công. Catalog repository đọc
Firestore bằng npm SDK và dynamic-import fixture đầy đủ khi cần fallback, nên dữ liệu
55 sản phẩm không nằm trong app shell. Route này không gọi `useLegacyApplication` và
không tải bootstrap, auth, cart, checkout, MediaPipe hoặc Chart.js legacy.

Auth dialog và lịch sử soi da được mount một lần bởi `AppProviders` từ
`src/features/auth`. Legacy code chỉ yêu cầu mở/đóng qua event
`skinid:auth-dialog-*` và `skinid:history-dialog-*`; page và component phân tích
không còn sở hữu markup xác thực.

Firebase Web SDK được bundle từ package npm trong `src/infrastructure/firebase`
và được Vite tách thành các vendor chunk riêng. `src/infrastructure/http/apiClient.js` chịu trách
nhiệm gắn Firebase ID token, timeout và chuẩn hóa lỗi cho các feature service.
Bridge `SKINID_FIREBASE_READY` chỉ tồn tại để giữ tương thích với checkout,
cart và skin-analysis legacy trong thời gian chuyển đổi; không thêm
feature mới phụ thuộc bridge này.

`AuthProvider`, auth dialogs và `Header` sử dụng `features/auth/services/authService`
trực tiếp. `window.authManager` không còn được dùng trong runtime hiện tại; các luồng
đăng nhập, hồ sơ và lưu báo cáo đều đi qua Auth context và feature service.

Route `/profile` gọi `features/profile` cho các mutation tài khoản: lưu hồ sơ, đổi
ảnh đại diện, đổi mật khẩu, xuất dữ liệu, xóa lịch sử và đăng xuất. Các thao tác này
không còn gọi `window.authManager`. Timeline lịch sử do
`features/profile/components/ProfileHistoryTimeline.jsx` render từ Auth context và
gửi sự kiện khi cần mở modal chi tiết. KPI và biểu đồ tiến trình cũng do
`ProfileHistoryOverview.jsx` render bằng SVG responsive, không còn mutation DOM hay
Chart.js cho phần này. Danh sách đơn hàng do `ProfileOrders.jsx` render; hủy đơn đi
qua API client có Firebase ID token và mua lại dùng public API của Cart feature.
Modal chi tiết phiên soi da nằm trong `ProfileScanDetailModal.jsx`; vòng điểm và
radar 12 chỉ số đều là SVG, còn accordion tư vấn và phác đồ là JSX an toàn. Banner,
tab theo URL và form hồ sơ có dirty-state cũng đã thuộc React; địa chỉ dùng service
module thay vì DOM global. `profile-dashboard.js` đã bị xóa và route profile không
còn tải Chart.js, Feather hoặc bất kỳ bootstrap legacy nào.

`CartProvider` là nguồn state giỏ hàng duy nhất của React. Dữ liệu được chuẩn hóa và
đồng bộ trực tiếp với `users/{uid}/commerce/cart` qua Firebase npm SDK; guest cart
được hợp nhất sau đăng nhập. `CartDrawer` được mount một lần tại app scope, còn header,
mobile navigation, catalog và profile chỉ dùng public Cart API. `CheckoutModal` sở hữu
form nhận hàng, địa chỉ hành chính, idempotency key và gọi Worker `/orders` qua API
client có Firebase ID token. Worker vẫn tính lại giá và phí vận chuyển trước khi tạo
đơn; React không đọc hoặc ghi state qua `window.cartManager`.

`src/js` và `useLegacyApplication` vẫn là lớp tương thích tạm thời cho home skin
advisor, skin analysis và các widget storefront cũ. Cart/checkout legacy chỉ còn được
tải trong nhóm storefront này, không còn phục vụ `/products`, `/profile` hay `/admin`.
Legacy catalog renderer vẫn
được giữ cho các card phác đồ trong skin analysis nhưng không còn phục vụ `/products`.
Mỗi lần chuyển xong một feature phải xóa script, global và structural test tương ứng;
không duy trì hai implementation lâu dài.

Các modal React dùng `shared/hooks/useBodyScrollLock.js`, với lock registry riêng để
nhiều overlay không mở khóa cuộn của nhau. Storefront dialog giao tiếp qua DOM event
định danh trong `shared/events`, không công bố thêm hàm điều khiển trên `window`.

## Kiểm thử

- Unit test đặt cạnh module khi test business rule thuần.
- `tests/integration` dành cho luồng qua nhiều feature hoặc Worker repository.
- `tests/contract` kiểm tra request/response giữa frontend và Worker.
- E2E test kiểm tra hành vi người dùng; không khóa cứng tên file hoặc thứ tự script.

## Ma trận chuyển đổi hiện tại

| Khu vực | Nguồn runtime hiện tại | Trạng thái legacy |
| --- | --- | --- |
| Catalog `/products` | `features/catalog` + Firestore/fixture lazy | Không tải bootstrap |
| Hồ sơ `/profile` | `features/profile` + Auth context | Không tải bootstrap |
| Quản trị `/admin` | `features/admin` + Firestore/API Worker | Không tải bootstrap |
| Tra cứu công bố | `CompliancePage` + `useCatalog` | Không tải bootstrap |
| Trang chủ | React components + compatibility scripts | Còn catalog/storefront legacy |
| Soi da | React shell + `SkinAnalysisBridge` + camera scripts | Còn renderer/catalog legacy |

Mục tiêu của các bước tiếp theo là đưa catalog renderer và camera flow còn lại vào
feature `skin-analysis`, sau đó xóa `src/js/catalog/catalog-loader.js` và các global
`PRODUCTS`/`LOCAL_PRODUCTS`. Không tạo thêm global mới trong thời gian chuyển đổi.
