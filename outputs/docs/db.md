# Physical Database ERD - Supabase

~~~mermaid
erDiagram

    STORES {
        INTEGER store_id PK
        VARCHAR_100 name
        VARCHAR_100 address
        VARCHAR_255 email UK
        VARCHAR_255 password_hash
    }

    CUSTOMERS {
        INTEGER customer_id PK
        VARCHAR_50 name
        VARCHAR_12 phone
    }

    EMPLOYEES {
        INTEGER employee_id PK
        INTEGER store_id FK
        VARCHAR_50 name
        VARCHAR_50 role
        TIMESTAMPTZ created_at
    }

    WORK_SHIFTS {
        INTEGER shift_id PK
        INTEGER store_id FK
        VARCHAR_50 name
        TIMESTAMPTZ start_at
        TIMESTAMPTZ end_at
        DATE work_date
    }

    EMPLOYEE_WORK_SHIFTS {
        INTEGER employee_id PK,FK
        INTEGER shift_id PK,FK
    }

    MACHINES {
        INTEGER machine_id PK
        INTEGER store_id FK
        VARCHAR_100 name
        VARCHAR_20 status
        VARCHAR_10 type
        REAL capacity_kg
        INTEGER processing_minutes
    }

    LAUNDRY_ORDERS {
        INTEGER order_id PK
        INTEGER store_id FK
        INTEGER customer_id FK
        NUMERIC_5_2 weight_kg
        VARCHAR_50 service_type
        VARCHAR_50 status
        TIMESTAMPTZ ready_at "NULLABLE"
        TIMESTAMPTZ pickup_at "NULLABLE"
        TIMESTAMPTZ estimated_at "NULLABLE"
        VARCHAR_100 group_code "NULLABLE"
        TIMESTAMPTZ completed_at "NULLABLE"
        TIMESTAMPTZ created_at
    }

    ORDER_STAGES {
        INTEGER order_stage_id PK
        INTEGER order_id FK
        INTEGER machine_id FK "NULLABLE"
        VARCHAR_50 stage
        TIMESTAMPTZ planned_start_at "NULLABLE"
        TIMESTAMPTZ planned_end_at "NULLABLE"
        TIMESTAMPTZ actual_started_at "NULLABLE"
        TIMESTAMPTZ actual_ended_at "NULLABLE"
        VARCHAR_20 status
    }

    STORES ||--o{ EMPLOYEES : "has"
    STORES ||--o{ WORK_SHIFTS : "has"
    STORES ||--o{ MACHINES : "has"
    STORES ||--o{ LAUNDRY_ORDERS : "has"

    EMPLOYEES ||--o{ EMPLOYEE_WORK_SHIFTS : "assigned to"
    WORK_SHIFTS ||--o{ EMPLOYEE_WORK_SHIFTS : "includes"

    CUSTOMERS ||--o{ LAUNDRY_ORDERS : "places"

    LAUNDRY_ORDERS ||--o{ ORDER_STAGES : "has"
    MACHINES ||--o{ ORDER_STAGES : "runs when applicable"
~~~

## Quy ước đặt tên

- Tên bảng và cột PostgreSQL dùng lowercase `snake_case`; tên bảng dùng số nhiều.
- Prisma giữ model và field camelCase bằng `@@map` và `@map`.
- API dùng camelCase; route stage được mô tả trong `api.md`.

## Scheduling notes

- `order_stages` là nguồn dữ liệu duy nhất cho các công đoạn của order.
- `machine_id` là nullable để lưu các công đoạn thủ công như `SORTING`, `TRANSFER` và `PACKING`.
- `planned_*` là lịch do scheduler đề xuất; `actual_*` là thời gian nhân viên thực tế bắt đầu/kết thúc.
- `status` hỗ trợ `PLANNED`, `RUNNING`, `COMPLETED` và `CANCELLED`.
- `ready_at` là thời điểm dự kiến khách giao đồ; `pickup_at` là giờ khách muốn lấy; `group_code` liên kết các order cần lấy cùng nhau.
- `service_type` chỉ nhận `WASH`, `DRY` hoặc `WASH_DRY`.
- `machines.type` chỉ nhận `WASHER` hoặc `DRYER`.
- `order_stages.stage` nhận `SORTING`, `WASH`, `TRANSFER`, `DRY` hoặc `PACKING`.

## Authentication notes

- stores.email is required and unique.
- stores.password_hash stores only a one-way password hash.
- Store accounts are created by seed data or an administrative database operation.
- There is no public registration endpoint.
- Authentication uses the store account; RBAC is out of scope.

## Notification notes

- Notification preview/send state is temporary and is not stored in the database.
- Zalo sandbox results are returned directly to the frontend.
- No real customer personal data is used in prototype seed data.
