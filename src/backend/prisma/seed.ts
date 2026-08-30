import { prisma } from "../src/lib/prisma.js";
import { hashPassword } from "../src/lib/auth.js";

const minutesFromNow = (minutes: number) =>
  new Date(Date.now() + minutes * 60_000);

async function main() {
  await prisma.orderStage.deleteMany();
  await prisma.laundryOrder.deleteMany();
  await prisma.employeeWorkShift.deleteMany();
  await prisma.workShift.deleteMany();
  await prisma.machine.deleteMany();
  await prisma.employee.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.store.deleteMany();

  const store = await prisma.store.create({
    data: {
      name: "Nhu Y",
      address: "Khu vuc mo phong",
      email: "admin@washtrack.com",
      passwordHash: hashPassword("your-password"),
    },
  });

  const employees = await Promise.all(
    ["Mai Anh", "Linh", "Hung", "Thao", "Quan", "Yen"].map(
      (name, index) =>
        prisma.employee.create({
          data: {
            storeId: store.storeId,
            name,
            role: index === 0 ? "MANAGER" : "STAFF",
          },
        }),
    ),
  );

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const shifts = await Promise.all(
    [
      ["Ca sang", 6, 14],
      ["Ca chieu", 14, 22],
    ].map(([name, start, end]) =>
      prisma.workShift.create({
        data: {
          storeId: store.storeId,
          name: String(name),
          startAt: new Date(today.getTime() + Number(start) * 3_600_000),
          endAt: new Date(today.getTime() + Number(end) * 3_600_000),
          workDate: today,
          employees: {
            create: employees.map((employee) => ({
              employeeId: employee.employeeId,
            })),
          },
        },
      }),
    ),
  );

  const machines = await Promise.all(
    [
      ["May giat 1", "WASHER", 7, 45, "RUNNING"],
      ["May say 2", "DRYER", 10, 50, "RUNNING"],
      ["May giat 3", "WASHER", 15, 55, "AVAILABLE"],
      ["May say 4", "DRYER", 12, 45, "AVAILABLE"],
    ].map(([name, type, capacityKg, processingMinutes, status]) =>
      prisma.machine.create({
        data: {
          storeId: store.storeId,
          name: String(name),
          type: String(type),
          capacityKg: Number(capacityKg),
          processingMinutes: Number(processingMinutes),
          status: String(status),
        },
      }),
    ),
  );

  const customers = await Promise.all(
    [
      "Nguyen Van A",
      "Tran Thi B",
      "Le Minh C",
      "Pham Thu D",
      "Hoang Mai E",
      "Bui Thanh F",
    ].map((name, index) =>
      prisma.customer.create({
        data: {
          name,
          phone: `090000000${String(index + 1).padStart(3, "0")}`,
        },
      }),
    ),
  );

  const washer1 = machines[0];
  const dryer1 = machines[1];
  const washer2 = machines[2];
  const dryer2 = machines[3];

  const orders = [
    {
      customerId: customers[0].customerId,
      weightKg: 4.5,
      serviceType: "WASH_DRY",
      status: "DRYING",
      readyAt: minutesFromNow(-90),
      pickupAt: minutesFromNow(120),
      estimatedAt: minutesFromNow(35),
      groupCode: "GROUP-001",
      stages: [
        {
          stage: "SORTING",
          plannedStartAt: minutesFromNow(-90),
          plannedEndAt: minutesFromNow(-85),
          actualStartedAt: minutesFromNow(-90),
          actualEndedAt: minutesFromNow(-85),
          status: "COMPLETED",
        },
        {
          machineId: washer1.machineId,
          stage: "WASH",
          plannedStartAt: minutesFromNow(-85),
          plannedEndAt: minutesFromNow(-40),
          actualStartedAt: minutesFromNow(-85),
          actualEndedAt: minutesFromNow(-40),
          status: "COMPLETED",
        },
        {
          stage: "TRANSFER",
          plannedStartAt: minutesFromNow(-40),
          plannedEndAt: minutesFromNow(-35),
          actualStartedAt: minutesFromNow(-40),
          actualEndedAt: minutesFromNow(-35),
          status: "COMPLETED",
        },
        {
          machineId: dryer1.machineId,
          stage: "DRY",
          plannedStartAt: minutesFromNow(-35),
          plannedEndAt: minutesFromNow(15),
          actualStartedAt: minutesFromNow(-30),
          status: "RUNNING",
        },
        {
          stage: "PACKING",
          plannedStartAt: minutesFromNow(15),
          plannedEndAt: minutesFromNow(25),
          status: "PLANNED",
        },
      ],
    },
    {
      customerId: customers[0].customerId,
      weightKg: 3.5,
      serviceType: "WASH",
      status: "WASHING",
      readyAt: minutesFromNow(-80),
      pickupAt: minutesFromNow(120),
      estimatedAt: minutesFromNow(50),
      groupCode: "GROUP-001",
      stages: [
        {
          stage: "SORTING",
          plannedStartAt: minutesFromNow(-80),
          plannedEndAt: minutesFromNow(-75),
          actualStartedAt: minutesFromNow(-80),
          actualEndedAt: minutesFromNow(-75),
          status: "COMPLETED",
        },
        {
          machineId: washer2.machineId,
          stage: "WASH",
          plannedStartAt: minutesFromNow(-35),
          plannedEndAt: minutesFromNow(20),
          actualStartedAt: minutesFromNow(-30),
          status: "RUNNING",
        },
        {
          stage: "PACKING",
          plannedStartAt: minutesFromNow(20),
          plannedEndAt: minutesFromNow(30),
          status: "PLANNED",
        },
      ],
    },
    {
      customerId: customers[1].customerId,
      weightKg: 6,
      serviceType: "DRY",
      status: "WAITING",
      readyAt: minutesFromNow(-20),
      pickupAt: minutesFromNow(180),
      estimatedAt: minutesFromNow(80),
      stages: [
        {
          stage: "SORTING",
          plannedStartAt: minutesFromNow(-20),
          plannedEndAt: minutesFromNow(-15),
          actualStartedAt: minutesFromNow(-20),
          actualEndedAt: minutesFromNow(-15),
          status: "COMPLETED",
        },
        {
          machineId: dryer2.machineId,
          stage: "DRY",
          plannedStartAt: minutesFromNow(5),
          plannedEndAt: minutesFromNow(50),
          status: "PLANNED",
        },
        {
          stage: "PACKING",
          plannedStartAt: minutesFromNow(50),
          plannedEndAt: minutesFromNow(60),
          status: "PLANNED",
        },
      ],
    },
    {
      customerId: customers[2].customerId,
      weightKg: 5,
      serviceType: "WASH_DRY",
      status: "READY",
      readyAt: minutesFromNow(-240),
      pickupAt: minutesFromNow(-10),
      estimatedAt: minutesFromNow(-25),
      stages: [
        {
          stage: "SORTING",
          plannedStartAt: minutesFromNow(-240),
          plannedEndAt: minutesFromNow(-235),
          actualStartedAt: minutesFromNow(-240),
          actualEndedAt: minutesFromNow(-235),
          status: "COMPLETED",
        },
        {
          machineId: washer2.machineId,
          stage: "WASH",
          plannedStartAt: minutesFromNow(-220),
          plannedEndAt: minutesFromNow(-165),
          actualStartedAt: minutesFromNow(-220),
          actualEndedAt: minutesFromNow(-165),
          status: "COMPLETED",
        },
        {
          machineId: dryer2.machineId,
          stage: "DRY",
          plannedStartAt: minutesFromNow(-155),
          plannedEndAt: minutesFromNow(-110),
          actualStartedAt: minutesFromNow(-155),
          actualEndedAt: minutesFromNow(-110),
          status: "COMPLETED",
        },
        {
          stage: "TRANSFER",
          plannedStartAt: minutesFromNow(-110),
          plannedEndAt: minutesFromNow(-105),
          actualStartedAt: minutesFromNow(-110),
          actualEndedAt: minutesFromNow(-105),
          status: "COMPLETED",
        },
        {
          stage: "PACKING",
          plannedStartAt: minutesFromNow(-105),
          plannedEndAt: minutesFromNow(-95),
          actualStartedAt: minutesFromNow(-105),
          actualEndedAt: minutesFromNow(-95),
          status: "COMPLETED",
        },
      ],
    },
    {
      customerId: customers[3].customerId,
      weightKg: 2.5,
      serviceType: "WASH",
      status: "COMPLETED",
      readyAt: minutesFromNow(-360),
      pickupAt: minutesFromNow(-180),
      estimatedAt: minutesFromNow(-240),
      completedAt: minutesFromNow(-250),
      stages: [
        {
          stage: "SORTING",
          plannedStartAt: minutesFromNow(-360),
          plannedEndAt: minutesFromNow(-355),
          actualStartedAt: minutesFromNow(-360),
          actualEndedAt: minutesFromNow(-355),
          status: "COMPLETED",
        },
        {
          machineId: washer1.machineId,
          stage: "WASH",
          plannedStartAt: minutesFromNow(-345),
          plannedEndAt: minutesFromNow(-300),
          actualStartedAt: minutesFromNow(-345),
          actualEndedAt: minutesFromNow(-300),
          status: "COMPLETED",
        },
        {
          stage: "PACKING",
          plannedStartAt: minutesFromNow(-300),
          plannedEndAt: minutesFromNow(-290),
          actualStartedAt: minutesFromNow(-300),
          actualEndedAt: minutesFromNow(-290),
          status: "COMPLETED",
        },
      ],
    },
    {
      customerId: customers[4].customerId,
      weightKg: 8,
      serviceType: "DRY",
      status: "RECEIVED",
      readyAt: minutesFromNow(-5),
      pickupAt: minutesFromNow(240),
      estimatedAt: minutesFromNow(95),
      stages: [
        {
          stage: "SORTING",
          plannedStartAt: minutesFromNow(-5),
          plannedEndAt: minutesFromNow(0),
          status: "PLANNED",
        },
        {
          machineId: dryer1.machineId,
          stage: "DRY",
          plannedStartAt: minutesFromNow(5),
          plannedEndAt: minutesFromNow(55),
          status: "PLANNED",
        },
        {
          stage: "PACKING",
          plannedStartAt: minutesFromNow(55),
          plannedEndAt: minutesFromNow(65),
          status: "PLANNED",
        },
      ],
    },
  ];

  for (const order of orders) {
    await prisma.laundryOrder.create({
      data: {
        storeId: store.storeId,
        customerId: order.customerId,
        weightKg: order.weightKg,
        serviceType: order.serviceType,
        status: order.status,
        readyAt: order.readyAt,
        pickupAt: order.pickupAt,
        estimatedAt: order.estimatedAt,
        groupCode: order.groupCode,
        completedAt: order.completedAt,
        stages: { create: order.stages },
      },
    });
  }

  console.log(
    `Seed completed: store=${store.storeId}, shifts=${shifts.length}, machines=${machines.length}, customers=${customers.length}, orders=${orders.length}`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
