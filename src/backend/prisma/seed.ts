import { prisma } from "../src/lib/prisma.js";
import { hashPassword } from "../src/lib/auth.js";

async function main() {
  await prisma.machineRun.deleteMany();
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
    ["Mai Anh", "Linh", "Hung", "Thao", "Quan", "Yen"].map((name, index) =>
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
          startAt: new Date(today.getTime() + Number(start) * 3600000),
          endAt: new Date(today.getTime() + Number(end) * 3600000),
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
      ["May giat 1", "WASH", 7, 45, "RUNNING"],
      ["May say 2", "DRY", 10, 50, "RUNNING"],
      ["May giat 3", "WASH", 15, 55, "AVAILABLE"],
      ["May say 4", "DRY", 12, 45, "AVAILABLE"],
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
      "Dinh Quang G",
      "Truong Linh H",
      "Le Van I",
      "Vu Minh K",
      "Doan Ha L",
      "Phan Son M",
    ].map((name, index) =>
      prisma.customer.create({
        data: { name, phone: `09000000${String(index + 1).padStart(4, "0")}` },
      }),
    ),
  );
  const now = Date.now();
  const statuses = [
    "WASHING",
    "DRYING",
    "READY",
    "WAITING",
    "FOLDING_PACKING",
    "NOTIFIED",
    "COMPLETED",
    "RECEIVED",
    "WAITING",
    "READY",
  ];
  for (const [index, status] of statuses.entries()) {
    const machine = machines[index % machines.length];
    const startedAt = new Date(now - (index + 1) * 60 * 60000);
    await prisma.laundryOrder.create({
      data: {
        customerId: customers[index].customerId,
        weightKg: 1.5 + index * 0.6,
        serviceType:
          index % 3 === 0 ? "COMBO" : index % 3 === 1 ? "WASH" : "DRY",
        status,
        pickupAt: new Date(now + (index - 2) * 60 * 60000),
        estimatedAt: new Date(now + (index - 3) * 60 * 60000),
        completedAt: status === "COMPLETED" ? new Date(now - 30 * 60000) : null,
        machineRuns: {
          create: {
            machineId: machine.machineId,
            stage: status,
            startedAt,
            endedAt:
              status === "WASHING" || status === "DRYING"
                ? null
                : new Date(startedAt.getTime() + 45 * 60000),
            status:
              status === "WASHING" || status === "DRYING"
                ? "RUNNING"
                : "COMPLETED",
          },
        },
      },
    });
  }
  console.log(
    `Seed completed: store=${store.storeId}, shifts=${shifts.length}, machines=${machines.length}, customers=${customers.length}`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
