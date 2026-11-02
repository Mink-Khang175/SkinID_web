# Lịch sử dọn và khôi phục repo ngày 02/11/2026

**Cập nhật yêu cầu sau cùng:** backend Worker, Firebase config/rules/indexes và tests đã được khôi phục để chạy hệ thống hiện tại. Các mô tả “frontend-only” bên dưới ghi lại bước dọn trước đó, không phải trạng thái cuối. Source hoạt động và hướng dẫn hiện hành nằm trong [README](../README.md) và [bàn giao anh Danh](operations/danh-handover.md).

Repo hoạt động: `D:\SkinID\skinid-web`. Giữ nguyên `.git`, remote và các thay đổi chưa commit. Không push, commit hay deploy trong đợt này.

## Đã đưa ra ngoài Git

Lưu tại `D:\SkinID\archives\repo-cleanup-20261102`, danh mục `moved-files.json`:

- `worker/`, Firebase rules/indexes/config và Wrangler config/cache: backend cũ, không thuộc frontend hiện tại.
- Script cấp quyền, migration, deploy, hotfix, debug và chụp ảnh một lần.
- Tài liệu triển khai/handover lịch sử và export localStorage cũ; thay bằng bộ docs hiện hành.
- `public/` chứa bản sao assets không được Vite sử dụng và `index.source.html` trùng entry.
- File môi trường cũ giữ trong kho lưu trữ local, không đưa vào Git; `.env.local` chỉ bật frontend preview.
- Kiểm thử backend chuyển cùng source backend; giữ và điều chỉnh phần kiểm thử frontend trong các file trước đây kiểm cả hai phía. Bản trước chỉnh được lưu kèm.

Các thư mục lưu trữ có thể chứa cấu hình riêng, chỉ dùng nội bộ và không push sang GitHub.

## Cấu hình hiện hành

- Bỏ plugin proxy Worker khỏi Vite; chỉ frontend và assets.
- Bỏ dependency server/admin/debug không còn dùng; cập nhật lockfile.
- Catalog generator chỉ tạo catalog frontend, không sinh lại `worker/`.
- GitHub workflow chỉ `npm ci` và `npm run test:all`, không tự deploy.
- `node_modules/` và `dist/` vẫn là file local được ignore. Không cần xóa dependency đang dùng để làm sạch Git.
- Không tạo ZIP; gói bàn giao, bản sao source tạm và thư mục giải nén kiểm tra đã chuyển vào `packaging-retired/` trong kho lưu trữ ngoài repo. Không có ZIP trong repo frontend.

## Thiết kế theo yêu cầu mới nhất

Khôi phục HeroBanner, FeaturedProducts và style carousel từ `skinid-web-before-frontend-sync-20261102`. Khôi phục các thay đổi kiểu nút có sẵn; giữ CSS của chức năng mới. Source trước khôi phục lưu tại `before-carousel-restore/` trong kho lưu trữ đợt này.

Các bản sao lưu trước cập nhật vẫn nằm trong `D:\SkinID\archives\source-backups`. Báo cáo/ảnh kiểm tra nằm trong `D:\SkinID\output`, không thuộc repo frontend.

## Xác minh

Sau dọn và khôi phục UI: 67/67 kiểm thử frontend đạt, build thành công. Số lượng không gồm các kiểm thử Worker đã lưu cùng backend cũ.
