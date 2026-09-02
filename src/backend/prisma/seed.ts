import { hashPassword } from "../src/lib/auth.js";
import { disconnectPrisma, prisma } from "../src/lib/prisma.js";

const minutesFrom = (base: Date, minutes: number) =>
  new Date(base.getTime() + minutes * 60_000);

const startOfToday = () => {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
};

async function main() {
  const now = new Date();
  const today = startOfToday();

  const summary = await prisma.$transaction(async (tx) => {
    // Xóa từ bảng con để có thể chạy lại seed trên database demo.
    await tx.orderStage.deleteMany();
    await tx.laundryOrder.deleteMany();
    await tx.employeeWorkShift.deleteMany();
    await tx.workShift.deleteMany();
    await tx.machine.deleteMany();
    await tx.employee.deleteMany();
    await tx.customer.deleteMany();
    await tx.store.deleteMany();

    const store = await tx.store.create({
      data: {
        name: "Tiệm giặt Như Ý",
        address: "Khu vực mô phỏng",
        email: "admin@washtrack.com",
        passwordHash: hashPassword("your-password"),
      },
    });

    const employeeData = [
      ["Mai Anh", "0900000001", "MANAGER"],
      ["Linh", "0900000002", "STAFF"],
      ["Hùng", "0900000003", "STAFF"],
      ["Thảo", "0900000004", "STAFF"],
    ] as const;
    const employees = [];
    for (const [name, phone, role] of employeeData) {
      employees.push(
        await tx.employee.create({
          data: { storeId: store.storeId, name, phone, role },
        }),
      );
    }

    const shifts = [];
    for (const [name, startHour, endHour] of [
      ["Ca sáng", 6, 14],
      ["Ca chiều", 14, 22],
    ] as const) {
      shifts.push(
        await tx.workShift.create({
          data: {
            storeId: store.storeId,
            name,
            startAt: new Date(today.getTime() + startHour * 3_600_000),
            endAt: new Date(today.getTime() + endHour * 3_600_000),
            workDate: today,
            employees: {
              create: employees.map(({ employeeId }) => ({ employeeId })),
            },
          },
        }),
      );
    }

    const machineData = [
      ["Máy giặt 1", "WASHER", 8, 45, "RUNNING"],
      ["Máy giặt 2", "WASHER", 12, 55, "AVAILABLE"],
      ["Máy sấy 1", "DRYER", 10, 50, "RUNNING"],
      ["Máy sấy 2", "DRYER", 15, 45, "AVAILABLE"],
    ] as const;
    const machines = [];
    for (const [name, type, capacityKg, processingMinutes, status] of machineData) {
      machines.push(
        await tx.machine.create({
          data: {
            storeId: store.storeId,
            name,
            type,
            capacityKg,
            processingMinutes,
            status,
          },
        }),
      );
    }

    const customerData = [
      ["Nguyễn Minh An", "0901000001"],
      ["Trần Thu Hà", "0901000002"],
      ["Lê Hoàng Nam", "0901000003"],
      ["Phạm Mai Linh", "0901000004"],
      ["Bùi Thanh Tú", "0901000005"],
      ["Hoàng Gia Hân", "0901000006"],
    ] as const;
    const customers = [];
    for (const [name, phone] of customerData) {
      customers.push(await tx.customer.create({ data: { name, phone } }));
    }

    const [washer1, washer2, dryer1, dryer2] = machines;
    const orders = [
      {
        customerId: customers[0].customerId,
        weightKg: 4.5,
        serviceType: "WASH_DRY",
        status: "DRYING",
        pickupAt: minutesFrom(now, 120),
        estimatedAt: minutesFrom(now, 35),
        stages: [
          { stage: "SORTING", status: "COMPLETED", start: -90, end: -85 },
          { stage: "WASH", machineId: washer1.machineId, status: "COMPLETED", start: -85, end: -40 },
          { stage: "TRANSFER", status: "COMPLETED", start: -40, end: -35 },
          { stage: "DRY", machineId: dryer1.machineId, status: "RUNNING", start: -35, end: 15 },
          { stage: "PACKING", status: "PLANNED", start: 15, end: 25 },
        ],
      },
      {
        customerId: customers[1].customerId,
        weightKg: 6,
        serviceType: "WASH_DRY",
        status: "WASHING",
        pickupAt: minutesFrom(now, 180),
        estimatedAt: minutesFrom(now, 80),
        groupCode: "DEMO-GROUP-001",
        stages: [
          { stage: "SORTING", status: "COMPLETED", start: -60, end: -55 },
          { stage: "WASH", machineId: washer2.machineId, status: "RUNNING", start: -20, end: 35 },
          { stage: "TRANSFER", status: "PLANNED", start: 35, end: 40 },
          { stage: "DRY", machineId: dryer2.machineId, status: "PLANNED", start: 40, end: 85 },
          { stage: "PACKING", status: "PLANNED", start: 85, end: 95 },
        ],
      },
      {
        customerId: customers[1].customerId,
        weightKg: 3.25,
        serviceType: "WASH",
        status: "RECEIVED",
        pickupAt: minutesFrom(now, 240),
        estimatedAt: minutesFrom(now, 100),
        groupCode: "DEMO-GROUP-001",
        stages: [
          { stage: "SORTING", status: "PLANNED", start: 5, end: 10 },
          { stage: "WASH", machineId: washer1.machineId, status: "PLANNED", start: 10, end: 55 },
          { stage: "PACKING", status: "PLANNED", start: 55, end: 65 },
        ],
      },
      {
        customerId: customers[3].customerId,
        weightKg: 5,
        serviceType: "DRY",
        status: "WAITING",
        pickupAt: minutesFrom(now, 210),
        estimatedAt: minutesFrom(now, 90),
        stages: [
          { stage: "SORTING", status: "COMPLETED", start: -25, end: -20 },
          { stage: "DRY", machineId: dryer2.machineId, status: "PLANNED", start: 10, end: 55 },
          { stage: "PACKING", status: "PLANNED", start: 55, end: 65 },
        ],
      },
      {
        customerId: customers[4].customerId,
        weightKg: 2.5,
        serviceType: "WASH",
        status: "COMPLETED",
        pickupAt: minutesFrom(now, -120),
        estimatedAt: minutesFrom(now, -180),
        completedAt: minutesFrom(now, -190),
        stages: [
          { stage: "SORTING", status: "COMPLETED", start: -300, end: -295 },
          { stage: "WASH", machineId: washer1.machineId, status: "COMPLETED", start: -295, end: -250 },
          { stage: "PACKING", status: "COMPLETED", start: -250, end: -240 },
        ],
      },
    ] as const;

    for (const order of orders) {
      await tx.laundryOrder.create({
        data: {
          storeId: store.storeId,
          customerId: order.customerId,
          weightKg: order.weightKg,
          serviceType: order.serviceType,
          status: order.status,
          pickupAt: order.pickupAt,
          estimatedAt: order.estimatedAt,
          completedAt: order.completedAt,
          readyAt: order.status === "COMPLETED" ? order.estimatedAt : null,
          groupCode: order.groupCode,
          stages: {
            create: order.stages.map(({ stage, machineId, status, start, end }) => ({
              stage,
              machineId,
              status,
              plannedStartAt: minutesFrom(now, start),
              plannedEndAt: minutesFrom(now, end),
              actualStartedAt: status === "COMPLETED" || status === "RUNNING" ? minutesFrom(now, start) : null,
              actualEndedAt: status === "COMPLETED" ? minutesFrom(now, end) : null,
            })),
          },
        },
      });
    }

    return {
      storeId: store.storeId,
      employees: employees.length,
      shifts: shifts.length,
      machines: machines.length,
      customers: customers.length,
      orders: orders.length,
    };
  }, { timeout: 30_000 });

  console.log(`Seed completed: ${JSON.stringify(summary)}`);
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(disconnectPrisma);
