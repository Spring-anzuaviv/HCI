# Thiết kế API backend hệ thống điều phối giặt ủi

## Phạm vi

Triển khai toàn bộ endpoint được mô tả trong `src/backend/docs/api.md`, ngoại trừ việc gọi Zalo sandbox. Notification preview vẫn hoạt động; notification send giữ adapter/placeholder và trả lỗi chưa triển khai.

## Kiến trúc

- Prisma models bám theo `docs/db.md`: store, customer, employee, work shift, assignment, machine, laundry order và machine run.
- Route chỉ xử lý HTTP; service chứa business rules và transaction; mapper chuẩn hóa response.
- Auth dùng password hash `scrypt` và JWT HS256 từ `node:crypto`, không thêm dependency.
- Dữ liệu notification, expedite và handover không có bảng riêng nên giữ tạm thời trong process theo giới hạn của API doc.

## Quy tắc chính

- Protected routes lấy `storeId` từ JWT, không tin `storeId` từ body.
- Chỉ cho phép status transition tuần tự; machine run phải đúng loại máy, không trùng run đang hoạt động.
- Queue sắp xếp theo risk, pickup gần, số stage còn lại và thời điểm tạo.
- Lỗi dùng `{ error: { code, message } }`; thành công dùng `{ data, meta }`.

## Kiểm tra

Chạy Prisma generate, TypeScript build và smoke checks cho health/auth/workflow khi database test khả dụng. Không sử dụng dữ liệu cá nhân thật trong seed.
