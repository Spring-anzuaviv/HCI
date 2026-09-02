# ERD - Laundry Store Management System

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

## Status values

### Laundry order

- RECEIVED
- WAITING
- WASHING
- DRYING
- FOLDING_PACKING
- READY
- NOTIFIED
- COMPLETED

### Order stage

- PLANNED
- RUNNING
- COMPLETED
- CANCELLED

## Scheduling values

- Machine type: `WASHER`, `DRYER`.
- Service type: `WASH`, `DRY`, `WASH_DRY`.
- Stage: `SORTING`, `WASH`, `TRANSFER`, `DRY`, `PACKING`.
- `machine_id` is null for `SORTING`, `TRANSFER` and `PACKING`.
