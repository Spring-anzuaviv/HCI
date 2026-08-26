# ERD - Laundry Store Management System

~~~mermaid
erDiagram

    STORE {
        INTEGER storeId PK
        VARCHAR_100 name
        VARCHAR_100 address
        VARCHAR_255 email UK
        VARCHAR_255 passwordHash
    }

    CUSTOMER {
        INTEGER customerId PK
        VARCHAR_50 name
        VARCHAR_12 phone
    }

    EMPLOYEE {
        INTEGER employeeId PK
        INTEGER storeId FK
        VARCHAR_50 name
        VARCHAR_50 role
        TIMESTAMPTZ createdAt
    }

    WORK_SHIFT {
        INTEGER shiftId PK
        INTEGER storeId FK
        VARCHAR_50 name
        TIMESTAMPTZ startAt
        TIMESTAMPTZ endAt
        DATE workDate
    }

    EMPLOYEE_WORK_SHIFT {
        INTEGER employeeId PK,FK
        INTEGER shiftId PK,FK
    }

    MACHINE {
        INTEGER machineId PK
        INTEGER storeId FK
        VARCHAR_100 name
        VARCHAR_20 status
        VARCHAR_10 type
        REAL capacityKg
        INTEGER processingMinutes
    }

    LAUNDRY_ORDER {
        INTEGER orderId PK
        INTEGER customerId FK
        NUMERIC_5_2 weightKg
        VARCHAR_50 serviceType
        VARCHAR_50 status
        TIMESTAMPTZ pickupAt "NULLABLE"
        TIMESTAMPTZ estimatedAt "NULLABLE"
        TIMESTAMPTZ completedAt "NULLABLE"
        TIMESTAMPTZ createdAt
    }

    MACHINE_RUN {
        INTEGER machineRunId PK
        INTEGER orderId FK
        INTEGER machineId FK
        VARCHAR_50 stage
        TIMESTAMPTZ startedAt
        TIMESTAMPTZ endedAt "NULLABLE"
        VARCHAR_50 status
    }

    STORE ||--o{ EMPLOYEE : "has"
    STORE ||--o{ WORK_SHIFT : "has"
    STORE ||--o{ MACHINE : "has"

    EMPLOYEE ||--o{ EMPLOYEE_WORK_SHIFT : "assigned to"
    WORK_SHIFT ||--o{ EMPLOYEE_WORK_SHIFT : "includes"

    CUSTOMER ||--o{ LAUNDRY_ORDER : "places"

    LAUNDRY_ORDER ||--o{ MACHINE_RUN : "has"
    MACHINE ||--o{ MACHINE_RUN : "runs"
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

### Machine run

- RUNNING
- COMPLETED

