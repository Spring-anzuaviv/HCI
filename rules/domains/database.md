# Quy tắc Database

Đọc file này khi task liên quan đến schema, migration, Prisma, PostgreSQL,
Supabase hoặc API persistence.

- Kiểm tra schema hiện tại trước khi chỉnh sửa.
- Chỉ thêm field/table thật sự cần cho requirement đã có nguồn.
- Tạo migration rõ ràng và cập nhật tài liệu ERD/DB/API liên quan.
- Dùng PostgreSQL `snake_case`; Prisma/API giữ camelCase theo convention hiện tại.
- Không commit secret hoặc dữ liệu cá nhân thật; dùng biến môi trường cho credentials.
- Không sửa dữ liệu production hoặc database dùng chung nếu chưa được xác nhận.
