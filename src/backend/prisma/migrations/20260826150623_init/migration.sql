-- CreateTable
CREATE TABLE "Store" (
    "storeId" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "address" VARCHAR(100),
    "email" VARCHAR(255) NOT NULL,
    "passwordHash" VARCHAR(255) NOT NULL,

    CONSTRAINT "Store_pkey" PRIMARY KEY ("storeId")
);

-- CreateTable
CREATE TABLE "Customer" (
    "customerId" SERIAL NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "phone" VARCHAR(12) NOT NULL,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("customerId")
);

-- CreateTable
CREATE TABLE "Employee" (
    "employeeId" SERIAL NOT NULL,
    "storeId" INTEGER NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "role" VARCHAR(50) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Employee_pkey" PRIMARY KEY ("employeeId")
);

-- CreateTable
CREATE TABLE "WorkShift" (
    "shiftId" SERIAL NOT NULL,
    "storeId" INTEGER NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "startAt" TIMESTAMP(3) NOT NULL,
    "endAt" TIMESTAMP(3) NOT NULL,
    "workDate" DATE NOT NULL,

    CONSTRAINT "WorkShift_pkey" PRIMARY KEY ("shiftId")
);

-- CreateTable
CREATE TABLE "EmployeeWorkShift" (
    "employeeId" INTEGER NOT NULL,
    "shiftId" INTEGER NOT NULL,

    CONSTRAINT "EmployeeWorkShift_pkey" PRIMARY KEY ("employeeId","shiftId")
);

-- CreateTable
CREATE TABLE "Machine" (
    "machineId" SERIAL NOT NULL,
    "storeId" INTEGER NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "status" VARCHAR(20) NOT NULL,
    "type" VARCHAR(10) NOT NULL,
    "capacityKg" DOUBLE PRECISION NOT NULL,
    "processingMinutes" INTEGER NOT NULL,

    CONSTRAINT "Machine_pkey" PRIMARY KEY ("machineId")
);

-- CreateTable
CREATE TABLE "LaundryOrder" (
    "orderId" SERIAL NOT NULL,
    "customerId" INTEGER NOT NULL,
    "weightKg" DECIMAL(5,2) NOT NULL,
    "serviceType" VARCHAR(50) NOT NULL,
    "status" VARCHAR(50) NOT NULL,
    "pickupAt" TIMESTAMP(3),
    "estimatedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LaundryOrder_pkey" PRIMARY KEY ("orderId")
);

-- CreateTable
CREATE TABLE "MachineRun" (
    "machineRunId" SERIAL NOT NULL,
    "orderId" INTEGER NOT NULL,
    "machineId" INTEGER NOT NULL,
    "stage" VARCHAR(50) NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL,
    "endedAt" TIMESTAMP(3),
    "status" VARCHAR(50) NOT NULL,

    CONSTRAINT "MachineRun_pkey" PRIMARY KEY ("machineRunId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Store_email_key" ON "Store"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_phone_key" ON "Customer"("phone");

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("storeId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkShift" ADD CONSTRAINT "WorkShift_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("storeId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeWorkShift" ADD CONSTRAINT "EmployeeWorkShift_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("employeeId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeWorkShift" ADD CONSTRAINT "EmployeeWorkShift_shiftId_fkey" FOREIGN KEY ("shiftId") REFERENCES "WorkShift"("shiftId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Machine" ADD CONSTRAINT "Machine_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("storeId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LaundryOrder" ADD CONSTRAINT "LaundryOrder_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("customerId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MachineRun" ADD CONSTRAINT "MachineRun_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "LaundryOrder"("orderId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MachineRun" ADD CONSTRAINT "MachineRun_machineId_fkey" FOREIGN KEY ("machineId") REFERENCES "Machine"("machineId") ON DELETE RESTRICT ON UPDATE CASCADE;
