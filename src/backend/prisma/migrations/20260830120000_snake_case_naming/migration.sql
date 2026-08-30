-- Rename the existing physical schema without recreating tables or losing data.

ALTER TABLE "Store" RENAME TO stores;
ALTER TABLE "Customer" RENAME TO customers;
ALTER TABLE "Employee" RENAME TO employees;
ALTER TABLE "WorkShift" RENAME TO work_shifts;
ALTER TABLE "EmployeeWorkShift" RENAME TO employee_work_shifts;
ALTER TABLE "Machine" RENAME TO machines;
ALTER TABLE "LaundryOrder" RENAME TO laundry_orders;
ALTER TABLE "MachineRun" RENAME TO machine_runs;

ALTER TABLE stores RENAME COLUMN "storeId" TO store_id;
ALTER TABLE stores RENAME COLUMN "passwordHash" TO password_hash;

ALTER TABLE customers RENAME COLUMN "customerId" TO customer_id;

ALTER TABLE employees RENAME COLUMN "employeeId" TO employee_id;
ALTER TABLE employees RENAME COLUMN "storeId" TO store_id;
ALTER TABLE employees RENAME COLUMN "createdAt" TO created_at;

ALTER TABLE work_shifts RENAME COLUMN "shiftId" TO shift_id;
ALTER TABLE work_shifts RENAME COLUMN "storeId" TO store_id;
ALTER TABLE work_shifts RENAME COLUMN "startAt" TO start_at;
ALTER TABLE work_shifts RENAME COLUMN "endAt" TO end_at;
ALTER TABLE work_shifts RENAME COLUMN "workDate" TO work_date;

ALTER TABLE employee_work_shifts RENAME COLUMN "employeeId" TO employee_id;
ALTER TABLE employee_work_shifts RENAME COLUMN "shiftId" TO shift_id;

ALTER TABLE machines RENAME COLUMN "machineId" TO machine_id;
ALTER TABLE machines RENAME COLUMN "storeId" TO store_id;
ALTER TABLE machines RENAME COLUMN "capacityKg" TO capacity_kg;
ALTER TABLE machines RENAME COLUMN "processingMinutes" TO processing_minutes;

ALTER TABLE laundry_orders RENAME COLUMN "orderId" TO order_id;
ALTER TABLE laundry_orders RENAME COLUMN "customerId" TO customer_id;
ALTER TABLE laundry_orders RENAME COLUMN "weightKg" TO weight_kg;
ALTER TABLE laundry_orders RENAME COLUMN "serviceType" TO service_type;
ALTER TABLE laundry_orders RENAME COLUMN "pickupAt" TO pickup_at;
ALTER TABLE laundry_orders RENAME COLUMN "estimatedAt" TO estimated_at;
ALTER TABLE laundry_orders RENAME COLUMN "completedAt" TO completed_at;
ALTER TABLE laundry_orders RENAME COLUMN "createdAt" TO created_at;

ALTER TABLE machine_runs RENAME COLUMN "machineRunId" TO machine_run_id;
ALTER TABLE machine_runs RENAME COLUMN "orderId" TO order_id;
ALTER TABLE machine_runs RENAME COLUMN "machineId" TO machine_id;
ALTER TABLE machine_runs RENAME COLUMN "startedAt" TO started_at;
ALTER TABLE machine_runs RENAME COLUMN "endedAt" TO ended_at;

ALTER TABLE stores RENAME CONSTRAINT "Store_pkey" TO stores_pkey;
ALTER TABLE customers RENAME CONSTRAINT "Customer_pkey" TO customers_pkey;
ALTER TABLE employees RENAME CONSTRAINT "Employee_pkey" TO employees_pkey;
ALTER TABLE work_shifts RENAME CONSTRAINT "WorkShift_pkey" TO work_shifts_pkey;
ALTER TABLE employee_work_shifts RENAME CONSTRAINT "EmployeeWorkShift_pkey" TO employee_work_shifts_pkey;
ALTER TABLE machines RENAME CONSTRAINT "Machine_pkey" TO machines_pkey;
ALTER TABLE laundry_orders RENAME CONSTRAINT "LaundryOrder_pkey" TO laundry_orders_pkey;
ALTER TABLE machine_runs RENAME CONSTRAINT "MachineRun_pkey" TO machine_runs_pkey;

ALTER INDEX "Store_email_key" RENAME TO stores_email_key;
ALTER INDEX "Customer_phone_key" RENAME TO customers_phone_key;

ALTER TABLE employees RENAME CONSTRAINT "Employee_storeId_fkey" TO employees_store_id_fkey;
ALTER TABLE work_shifts RENAME CONSTRAINT "WorkShift_storeId_fkey" TO work_shifts_store_id_fkey;
ALTER TABLE employee_work_shifts RENAME CONSTRAINT "EmployeeWorkShift_employeeId_fkey" TO employee_work_shifts_employee_id_fkey;
ALTER TABLE employee_work_shifts RENAME CONSTRAINT "EmployeeWorkShift_shiftId_fkey" TO employee_work_shifts_shift_id_fkey;
ALTER TABLE machines RENAME CONSTRAINT "Machine_storeId_fkey" TO machines_store_id_fkey;
ALTER TABLE laundry_orders RENAME CONSTRAINT "LaundryOrder_customerId_fkey" TO laundry_orders_customer_id_fkey;
ALTER TABLE machine_runs RENAME CONSTRAINT "MachineRun_orderId_fkey" TO machine_runs_order_id_fkey;
ALTER TABLE machine_runs RENAME CONSTRAINT "MachineRun_machineId_fkey" TO machine_runs_machine_id_fkey;
