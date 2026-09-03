const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");
const { pathToFileURL } = require("url");

// Chạy:
// node screenshot.js
//
// Hoặc:
// node screenshot.js washtrack.html

const htmlArg = process.argv[2] || "wireframe.html";
const htmlPath = path.resolve(htmlArg);
const outDir = path.resolve("wireframe");

if (!fs.existsSync(htmlPath)) {
  console.error(`Không tìm thấy HTML: ${htmlPath}`);
  console.error("Đặt HTML thành index.html hoặc chạy:");
  console.error("node screenshot.js ten-file.html");
  process.exit(1);
}

fs.mkdirSync(outDir, { recursive: true });

(async () => {
  const browser = await chromium.launch({
    headless: true,
  });

  const page = await browser.newPage({
    viewport: {
      width: 1440,
      height: 1000,
    },
    deviceScaleFactor: 1,
  });

  await page.goto(pathToFileURL(htmlPath).href, {
    waitUntil: "domcontentloaded",
  });

  await page.waitForTimeout(500);

  // Tắt animation để ảnh ổn định
  await page.addStyleTag({
    content: `
      *, *::before, *::after {
        animation: none !important;
        transition: none !important;
        scroll-behavior: auto !important;
      }
    `,
  });

  let counter = 0;

  function cleanName(text) {
    return String(text)
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/Đ/g, "D")
      .replace(/[^a-zA-Z0-9_-]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .toLowerCase();
  }

  async function shot(name) {
    counter++;

    const filename = `${String(counter).padStart(2, "0")}-${cleanName(name)}.png`;

    await page.screenshot({
      path: path.join(outDir, filename),
      fullPage: false,
    });

    console.log("✓", filename);
  }

  async function closeAllModals() {
    await page.evaluate(() => {
      document.querySelectorAll(".mov").forEach((m) => {
        m.classList.remove("open");
      });
    });

    await page.waitForTimeout(50);
  }

  async function showApp() {
    await page.evaluate(() => {
      const login = document.getElementById("login-shell");
      const app = document.getElementById("app-shell");

      if (login) login.style.display = "none";
      if (app) app.style.display = "flex";
    });
  }

  async function showPage(pageId) {
    await showApp();
    await closeAllModals();

    await page.evaluate((id) => {
      document.querySelectorAll(".page").forEach((p) => {
        p.classList.remove("on");
      });

      const target = document.getElementById(id);

      if (target) {
        target.classList.add("on");
      }

      document.querySelectorAll(".pwrap, .page, .rp").forEach((el) => {
        try {
          el.scrollTop = 0;
        } catch {}
      });
    }, pageId);

    await page.waitForTimeout(100);
  }

  // =========================================================
  // 1. LOGIN
  // =========================================================

  const hasLogin = await page.locator("#login-shell").count();

  if (hasLogin) {
    await page.evaluate(() => {
      const login = document.getElementById("login-shell");
      const app = document.getElementById("app-shell");

      if (login) login.style.display = "flex";
      if (app) app.style.display = "none";

      const loginPanel = document.getElementById("login-panel");

      const registerPanel = document.getElementById("register-panel");

      if (loginPanel) loginPanel.style.display = "block";
      if (registerPanel) registerPanel.style.display = "none";
    });

    await shot("login");

    // REGISTER
    await page.evaluate(() => {
      const loginPanel = document.getElementById("login-panel");

      const registerPanel = document.getElementById("register-panel");

      if (loginPanel) loginPanel.style.display = "none";
      if (registerPanel) registerPanel.style.display = "block";
    });

    await shot("register");
  }

  // =========================================================
  // 2. CHỤP TẤT CẢ PAGE
  // =========================================================

  await showApp();

  const pageIds = await page.locator(".page").evaluateAll((els) => {
    return els.map((el) => el.id).filter(Boolean);
  });

  console.log("\nPages:", pageIds);

  for (const id of pageIds) {
    await showPage(id);

    await shot(id);
  }

  // =========================================================
  // 3. HÀNG CHỜ - MỞ HOÀN TẤT
  // =========================================================

  if (pageIds.includes("p-q")) {
    await showPage("p-q");

    const hasToggle = await page.evaluate(() => {
      return typeof window.toggleCompleted === "function";
    });

    if (hasToggle) {
      await page.evaluate(() => {
        window.toggleCompleted();
      });

      await page.waitForTimeout(100);

      await shot("hang-cho-mo-don-hoan-tat");
    }
  }

  // =========================================================
  // 4. POPUP THÊM ĐƠN
  // =========================================================

  await showPage(pageIds.includes("p-db") ? "p-db" : pageIds[0]);

  const hasAddOrder = await page.locator("#am").count();

  if (hasAddOrder) {
    await page.evaluate(() => {
      if (typeof window.openM === "function") {
        window.openM("am");
      } else {
        document.getElementById("am")?.classList.add("open");
      }
    });

    await page.waitForTimeout(100);

    await shot("popup-them-don");

    await closeAllModals();
  }

  // =========================================================
  // 5. SETTINGS
  // =========================================================

  const hasSettings = await page.locator("#sm").count();

  if (hasSettings) {
    await page.evaluate(() => {
      if (typeof window.openM === "function") {
        window.openM("sm");
      } else {
        document.getElementById("sm")?.classList.add("open");
      }
    });

    await page.waitForTimeout(100);

    await shot("popup-cai-dat");

    await closeAllModals();
  }

  // =========================================================
  // 6. ĐỔI MẬT KHẨU
  // =========================================================

  const hasPasswordModal = await page.locator("#pwd-modal").count();

  if (hasPasswordModal) {
    await page.evaluate(() => {
      if (typeof window.openM === "function") {
        window.openM("pwd-modal");
      } else {
        document.getElementById("pwd-modal")?.classList.add("open");
      }
    });

    await page.waitForTimeout(100);

    await shot("popup-doi-mat-khau");

    await closeAllModals();
  }

  // =========================================================
  // 7. NHÂN VIÊN
  // =========================================================

  const hasStaffFunction = await page.evaluate(() => {
    return typeof window.openStaffModal === "function";
  });

  if (hasStaffFunction) {
    // Thêm nhân viên
    await page.evaluate(() => {
      window.openStaffModal();
    });

    await page.waitForTimeout(100);

    await shot("popup-them-nhan-vien");

    await closeAllModals();

    // Chi tiết nhân viên
    const hasDetails = await page.evaluate(() => {
      return typeof window.showStaffDetails === "function";
    });

    if (hasDetails) {
      try {
        await page.evaluate(() => {
          window.showStaffDetails(1);
        });

        await page.waitForTimeout(100);

        await shot("popup-chi-tiet-nhan-vien");

        await closeAllModals();
      } catch (e) {
        console.log("Bỏ qua chi tiết nhân viên:", e.message);
      }
    }

    // Sửa nhân viên
    try {
      await page.evaluate(() => {
        window.openStaffModal(1);
      });

      await page.waitForTimeout(100);

      await shot("popup-sua-nhan-vien");

      await closeAllModals();
    } catch (e) {
      console.log("Bỏ qua sửa nhân viên:", e.message);
    }
  }

  // =========================================================
  // 8. MÁY
  // =========================================================

  const hasMachineFunction = await page.evaluate(() => {
    return typeof window.openMachineModal === "function";
  });

  if (hasMachineFunction) {
    // Thêm máy
    try {
      await page.evaluate(() => {
        window.openMachineModal();
      });

      await page.waitForTimeout(100);

      await shot("popup-them-may");

      await closeAllModals();
    } catch (e) {
      console.log("Bỏ qua thêm máy:", e.message);
    }

    // Sửa máy
    try {
      await page.evaluate(() => {
        window.openMachineModal(3);
      });

      await page.waitForTimeout(100);

      await shot("popup-sua-may");

      await closeAllModals();
    } catch (e) {
      console.log("Bỏ qua sửa máy:", e.message);
    }
  }

  // =========================================================
  // 9. CHI TIẾT ĐƠN
  // =========================================================

  const hasOrderFunction = await page.evaluate(() => {
    return typeof window.openOM === "function";
  });

  if (hasOrderFunction) {
    // -----------------------------
    // Đơn đang chờ
    // -----------------------------

    try {
      await page.evaluate(() => {
        window.openOM("Lê Văn Nam", "18:00", false, "dry", true);
      });

      await page.waitForTimeout(100);

      await shot("don-dang-cho");

      await closeAllModals();
    } catch (e) {
      console.log("Bỏ qua đơn đang chờ:", e.message);
    }

    // -----------------------------
    // Đơn đang xử lý
    // -----------------------------

    try {
      await page.evaluate(() => {
        window.openOM("Nguyễn Minh Tuấn", "17:30", false, "wash", false);
      });

      await page.waitForTimeout(100);

      await shot("don-dang-xu-ly");

      await closeAllModals();
    } catch (e) {
      console.log("Bỏ qua đơn đang xử lý:", e.message);
    }

    // -----------------------------
    // Đơn nguy cơ trễ
    // -----------------------------

    try {
      await page.evaluate(() => {
        window.openOM("Trần Thị Hoa", "17:30", true, "combo", false);
      });

      await page.waitForTimeout(100);

      await shot("don-nguy-co-tre");

      await closeAllModals();
    } catch (e) {
      console.log("Bỏ qua đơn nguy cơ trễ:", e.message);
    }
  }

  // =========================================================
  // 10. ĐÔN ĐƠN
  // =========================================================

  const hasDonDon = await page.evaluate(() => {
    return typeof window.openDonDon === "function";
  });

  if (hasDonDon) {
    // Popup ban đầu
    try {
      await page.evaluate(() => {
        window.openDonDon("Lê Văn Nam", "18:00");
      });

      await page.waitForTimeout(100);

      await shot("don-don-ban-dau");

      await closeAllModals();
    } catch (e) {
      console.log("Bỏ qua đôn đơn:", e.message);
    }

    // -----------------------------
    // Đôn từ 18:00 -> 17:30
    // -----------------------------

    const hasCheckDonDon = await page.evaluate(() => {
      return typeof window.checkDonDon === "function";
    });

    if (hasCheckDonDon) {
      try {
        await page.evaluate(() => {
          window.openDonDon("Lê Văn Nam", "18:00");

          const input = document.getElementById("pm-new-time");

          if (input) {
            input.value = "17:30";
          }

          window.checkDonDon();
        });

        await page.waitForTimeout(100);

        await shot("don-don-17-30");

        await closeAllModals();
      } catch (e) {
        console.log("Bỏ qua kiểm tra đôn đơn:", e.message);
      }

      // -----------------------------
      // Đôn mạnh hơn -> test xung đột
      // -----------------------------

      try {
        await page.evaluate(() => {
          window.openDonDon("Lê Văn Nam", "18:00");

          const input = document.getElementById("pm-new-time");

          if (input) {
            input.value = "16:30";
          }

          window.checkDonDon();
        });

        await page.waitForTimeout(100);

        await shot("don-don-xung-dot");

        await closeAllModals();
      } catch (e) {
        console.log("Bỏ qua đôn đơn xung đột:", e.message);
      }
    }
  }

  // =========================================================
  // 11. FALLBACK
  // Chụp các modal còn lại mà script chưa biết
  // =========================================================

  const modalIds = await page.locator(".mov").evaluateAll((els) => {
    return els.map((el) => el.id).filter(Boolean);
  });

  console.log("\nModals:", modalIds);

  const alreadyHandled = new Set([
    "am",
    "sm",
    "pwd-modal",
    "sm-staff",
    "sm-staff-details",
    "sm-machine",
    "om",
    "pm",
  ]);

  for (const id of modalIds) {
    if (alreadyHandled.has(id)) {
      continue;
    }

    await closeAllModals();

    await page.evaluate((modalId) => {
      const modal = document.getElementById(modalId);

      if (modal) {
        modal.classList.add("open");
      }
    }, id);

    await page.waitForTimeout(100);

    await shot(`popup-${id}`);
  }

  // =========================================================
  // DONE
  // =========================================================

  await closeAllModals();

  await browser.close();

  console.log("");
  console.log("==========================");
  console.log(`HOÀN TẤT: ${counter} ảnh`);
  console.log(`Thư mục: ${outDir}`);
  console.log("==========================");
})().catch((error) => {
  console.error("\nLỖI:");
  console.error(error);

  process.exit(1);
});
