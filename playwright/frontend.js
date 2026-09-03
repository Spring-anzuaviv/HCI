const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");
const { pathToFileURL } = require("url");

// ============================================================
// CẤU HÌNH
// ============================================================
//
// Chạy:
// node frontend.js
//
// Chỉ định HTML:
// node frontend.js index.html
//
// Chỉ định HTML + folder lưu ảnh:
// node frontend.js index.html "D:/HCI/WashTrackScreenshots"
// ============================================================

const HTML_FILE = process.argv[2] || "frontend.html";
const OUTPUT_DIR = process.argv[3] || "frontend";

const htmlPath = path.resolve(HTML_FILE);
const outputPath = path.resolve(OUTPUT_DIR);

if (!fs.existsSync(htmlPath)) {
  console.error(`Không tìm thấy HTML: ${htmlPath}`);
  console.error("");
  console.error("Ví dụ:");
  console.error("node frontend.js index.html");
  console.error('node frontend.js index.html "D:/HCI/anh"');
  process.exit(1);
}

fs.mkdirSync(outputPath, { recursive: true });

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

  // Không để alert/confirm/prompt làm treo Playwright
  page.on("dialog", async (dialog) => {
    await dialog.dismiss();
  });

  await page.goto(pathToFileURL(htmlPath).href, {
    waitUntil: "domcontentloaded",
  });

  await page.waitForTimeout(500);

  // Tắt animation để screenshot ổn định
  await page.addStyleTag({
    content: `
      *,
      *::before,
      *::after {
        animation: none !important;
        transition: none !important;
        scroll-behavior: auto !important;
      }
    `,
  });

  let count = 0;

  // ============================================================
  // HELPERS
  // ============================================================

  function slug(text) {
    return String(text)
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/Đ/g, "D")
      .replace(/[^a-zA-Z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .toLowerCase();
  }

  async function screenshot(name) {
    count++;

    const file =
      `${String(count).padStart(2, "0")}-${slug(name)}.png`;

    await page.screenshot({
      path: path.join(outputPath, file),
      fullPage: false,
    });

    console.log(`✓ ${file}`);
  }

  async function wait(ms = 120) {
    await page.waitForTimeout(ms);
  }

  async function closeEverything() {
    await page.evaluate(() => {
      document.querySelectorAll(".mov").forEach((el) => {
        el.classList.remove("open");
      });

      document
        .querySelectorAll(".completion-overlay")
        .forEach((el) => {
          el.classList.remove("open");
        });

      const toast = document.getElementById("toast-container");

      if (toast) {
        toast.innerHTML = "";
      }
    });

    await wait();
  }

  async function switchTo(id) {
    await closeEverything();

    await page.evaluate((pageId) => {
      if (typeof switchPage === "function") {
        switchPage(pageId);
      }
    }, id);

    await page.evaluate(() => {
      const wrap = document.querySelector(".pwrap");

      if (wrap) {
        wrap.scrollTop = 0;
      }

      const rp = document.querySelector(".rp");

      if (rp) {
        rp.scrollTop = 0;
      }

      window.scrollTo(0, 0);
    });

    await wait();
  }

  async function openModal(id, ctx = null) {
    await closeEverything();

    await page.evaluate(
      ({ id, ctx }) => {
        if (typeof window.openModal === "function") {
          window.openModal(id, ctx);
        }
      },
      { id, ctx }
    );

    await wait();
  }

  async function getOrder(id) {
    return await page.evaluate((orderId) => {
      if (typeof state === "undefined") return null;

      const order = state.orders.find(
        (o) => o.id === orderId
      );

      return order
        ? JSON.parse(JSON.stringify(order))
        : null;
    }, id);
  }

  async function getCompletedOrder() {
    return await page.evaluate(() => {
      if (
        typeof state === "undefined" ||
        !state.completedOrders ||
        !state.completedOrders.length
      ) {
        return null;
      }

      return JSON.parse(
        JSON.stringify(state.completedOrders[0])
      );
    });
  }

  // ============================================================
  // 01. TỔNG QUAN
  // ============================================================

  console.log("\n=== TỔNG QUAN ===");

  await switchTo("db");

  await screenshot("tong-quan");

  // Cảnh báo trễ
  await page.evaluate(() => {
    const alert = document.getElementById("db-alert");

    if (alert) {
      alert.style.display = "flex";
    }

    const text =
      document.getElementById("db-alert-text");

    if (text) {
      text.innerHTML =
        "<strong>Cảnh báo:</strong> Có đơn có nguy cơ trễ giờ hẹn.";
    }

    const risk =
      document.getElementById("db-risk-card");

    if (risk) {
      risk.style.display = "block";
    }
  });

  await wait();

  await screenshot("tong-quan-canh-bao-tre");

  // ============================================================
  // 02. HÀNG ĐỢI
  // ============================================================

  console.log("\n=== HÀNG ĐỢI ===");

  await switchTo("q");

  await screenshot("hang-doi-tat-ca");

  const filterTabs =
    page.locator("#filter-tabs-wrap .filter-tab");

  // Đang xử lý
  if ((await filterTabs.count()) >= 2) {
    try {
      await filterTabs.nth(1).click({
        timeout: 3000,
      });

      await wait();

      await screenshot("hang-doi-dang-xu-ly");
    } catch {
      console.log("! Không click được filter Đang xử lý");
    }
  }

  // Hoàn tất
  if ((await filterTabs.count()) >= 3) {
    try {
      await filterTabs.nth(2).click({
        timeout: 3000,
      });

      await wait();

      await screenshot("hang-doi-hoan-tat");
    } catch {
      console.log("! Không click được filter Hoàn tất");
    }
  }

  // Quay lại tất cả
  await page.evaluate(() => {
    const tabs = document.querySelectorAll(
      "#filter-tabs-wrap .filter-tab"
    );

    if (
      tabs[0] &&
      typeof setFilter === "function"
    ) {
      setFilter(tabs[0], "all");
    }
  });

  await wait();

  // ============================================================
  // 03. THÔNG BÁO
  // ============================================================

  console.log("\n=== THÔNG BÁO ===");

  await switchTo("n");

  await screenshot("thong-bao");

  // ============================================================
  // 04. THỐNG KÊ
  // ============================================================

  console.log("\n=== THỐNG KÊ ===");

  await switchTo("stats");

  await screenshot("thong-ke");

  // ============================================================
  // 05. THÊM ĐƠN
  // ============================================================

  console.log("\n=== THÊM ĐƠN ===");

  await switchTo("db");

  await openModal("add-order");

  await screenshot("them-don-ban-dau");

  // ------------------------------------------------------------
  // Giờ khả thi
  // ------------------------------------------------------------

  await page.evaluate(() => {
    const kg = document.getElementById("add-kg");
    const time = document.getElementById("add-time");
    const svc = document.getElementById("add-svc");

    if (kg) kg.value = "3";
    if (time) time.value = "18:00";
    if (svc) svc.value = "Giặt + Sấy";

    if (typeof simulateCalc === "function") {
      simulateCalc();
    }
  });

  await wait();

  await screenshot("them-don-gio-kha-thi");

  // ------------------------------------------------------------
  // Giờ không khả thi
  // ------------------------------------------------------------

  await page.evaluate(() => {
    const time =
      document.getElementById("add-time");

    if (time) {
      time.value = "14:00";
    }

    if (typeof simulateCalc === "function") {
      simulateCalc();
    }
  });

  await wait();

  await screenshot("them-don-gio-khong-kha-thi");

  // ------------------------------------------------------------
  // Chuyển giờ sang 20:00
  // ------------------------------------------------------------

  await page.evaluate(() => {
    const time =
      document.getElementById("add-time");

    if (time) {
      time.value = "20:00";
    }

    if (typeof simulateCalc === "function") {
      simulateCalc();
    }
  });

  await wait();

  await screenshot("them-don-doi-sang-20h");

  // ------------------------------------------------------------
  // Điền thông tin khách
  // ------------------------------------------------------------

  await page.evaluate(() => {
    const name =
      document.getElementById("add-name");

    const phone =
      document.getElementById("add-phone");

    const note =
      document.getElementById("add-note");

    if (name) {
      name.value = "Nguyễn Thị Lan";
    }

    if (phone) {
      phone.value = "0901 234 567";
    }

    if (note) {
      note.value =
        "Khách ghé lấy sau giờ làm";
    }
  });

  await screenshot("them-don-da-nhap-thong-tin");

  // ============================================================
  // 06. TÁCH ĐƠN
  // ============================================================

  console.log("\n=== TÁCH ĐƠN ===");

  await page.evaluate(() => {
    const chk =
      document.getElementById("add-split-chk");

    if (chk) {
      chk.checked = true;
    }

    if (typeof toggleSplit === "function") {
      toggleSplit(true);
    }
  });

  await wait();

  await screenshot("them-don-tach-me");

  // Thêm mẻ thứ 3
  await page.evaluate(() => {
    if (typeof addSplitPart === "function") {
      addSplitPart();
    }
  });

  await wait();

  await screenshot("tach-don-them-me-thu-3");

  await closeEverything();

  // ============================================================
  // 07. CHI TIẾT ĐƠN PHÂN LOẠI
  // ============================================================

  console.log("\n=== CHI TIẾT ĐƠN ===");

  await switchTo("q");

  let order15 = await getOrder(15);

  if (order15) {
    await openModal(
      "order-detail",
      order15
    );

    await screenshot(
      "chi-tiet-don-phan-loai"
    );
  }

  // ============================================================
  // 08. CHỜ ĐƯA VÀO MÁY GIẶT
  // ============================================================

  let order14 = await getOrder(14);

  if (order14) {
    await openModal(
      "order-detail",
      order14
    );

    await screenshot(
      "chi-tiet-don-cho-may-giat"
    );
  }

  // ============================================================
  // 09. ĐƠN NGUY CƠ TRỄ
  // ============================================================

  let order11 = await getOrder(11);

  if (order11) {
    await openModal(
      "order-detail",
      order11
    );

    await screenshot(
      "chi-tiet-don-nguy-co-tre"
    );
  }

  // ============================================================
  // 10. ĐÔN ĐƠN CƠ BẢN
  // ============================================================

  console.log("\n=== ĐÔN ĐƠN ===");

  order15 = await getOrder(15);

  if (order15) {
    await openModal(
      "expedite",
      order15
    );

    await screenshot(
      "don-don-chon-ly-do"
    );
  }

  // ============================================================
  // 11. ĐÔN ĐƠN CHI TIẾT
  // ============================================================

  if (order15) {
    const expeditedOrder = {
      ...order15,
      showExpedite: true,
    };

    await openModal(
      "order-detail",
      expeditedOrder
    );

    await screenshot(
      "don-don-chi-tiet"
    );

    await page.evaluate(() => {
      const time =
        document.getElementById(
          "dl-new-time-inp"
        );

      if (time) {
        time.value = "16:30";

        time.dispatchEvent(
          new Event("input", {
            bubbles: true,
          })
        );
      }

      const reason =
        document.getElementById(
          "exp-reason-inp"
        );

      if (reason) {
        reason.value =
          "Khách cần lấy sớm hơn dự kiến";
      }

      if (
        typeof updateExpediteUI ===
        "function"
      ) {
        updateExpediteUI("16:30");
      }
    });

    await wait();

    await screenshot(
      "don-don-nhap-gio-moi-va-anh-huong"
    );
  }

  // ============================================================
  // 12. ĐỔI GIỜ HẸN
  // ============================================================

  console.log("\n=== ĐỔI GIỜ HẸN ===");

  order15 = await getOrder(15);

  if (order15) {
    await openModal(
      "deadline",
      order15
    );

    await screenshot(
      "doi-gio-hen-ban-dau"
    );

    await page.evaluate(() => {
      const input =
        document.getElementById(
          "dl-new-time"
        );

      if (input) {
        input.value = "14:30";
      }
    });

    await wait();

    await screenshot(
      "doi-gio-hen-14h30"
    );
  }

  // ============================================================
  // 13. XỬ LÝ ĐƠN / CHUYỂN CÔNG ĐOẠN
  // ============================================================

  console.log("\n=== XỬ LÝ CÔNG ĐOẠN ===");

  order14 = await getOrder(14);

  if (order14) {
    await openModal(
      "order-detail",
      order14
    );

    await screenshot(
      "truoc-khi-dua-don-vao-may-giat"
    );

    await page.evaluate(() => {
      if (typeof processAction === "function") {
        processAction(14);
      }
    });

    await wait();

    await switchTo("q");

    await screenshot(
      "sau-khi-dua-don-vao-may-giat"
    );

    order14 = await getOrder(14);

    if (order14) {
      await openModal(
        "order-detail",
        order14
      );

      await screenshot(
        "chi-tiet-don-dang-giat"
      );
    }
  }

  // ============================================================
  // 14. NHẮC MÁY HOÀN TẤT
  // ============================================================

  console.log("\n=== NHẮC MÁY ===");

  await closeEverything();

  await page.evaluate(() => {
    if (
      typeof openMachineReminder ===
      "function"
    ) {
      openMachineReminder();
    }
  });

  await wait();

  await screenshot(
    "may-giat-hoan-tat-can-lay-do"
  );

  // ============================================================
  // 15. HẸN NHẮC LẠI
  // ============================================================

  await page.evaluate(() => {
    if (
      typeof snoozeMachineReminder ===
      "function"
    ) {
      snoozeMachineReminder(5);
    }
  });

  await wait();

  await screenshot(
    "may-giat-da-hen-nhac-lai"
  );

  // Reset reminder
  await page.evaluate(() => {
    const fab =
      document.getElementById(
        "machine-reminder-fab"
      );

    if (fab) {
      fab.classList.remove(
        "is-snoozed"
      );

      fab.disabled = false;
    }

    if (
      typeof openMachineReminder ===
      "function"
    ) {
      openMachineReminder();
    }
  });

  await wait();

  // ============================================================
  // 16. XÁC NHẬN ĐÃ LẤY ĐỒ
  // ============================================================

  await page.evaluate(() => {
    if (
      typeof confirmMachinePickup ===
      "function"
    ) {
      confirmMachinePickup();
    }
  });

  await wait();

  await screenshot(
    "xac-nhan-da-lay-do-khoi-may"
  );

  // ============================================================
  // 17. CÀI ĐẶT
  // ============================================================

  console.log("\n=== CÀI ĐẶT ===");

  await openModal("settings");

  await screenshot("cai-dat");

  // ============================================================
  // 18. THÔNG BÁO ZALO
  // ============================================================

  console.log("\n=== THÔNG BÁO KHÁCH ===");

  // Nếu chưa có completed order thì tạo dữ liệu demo
  // chỉ trong browser để chụp UI.
  await page.evaluate(() => {
    if (
      typeof state === "undefined"
    ) {
      return;
    }

    if (!state.completedOrders) {
      state.completedOrders = [];
    }

    if (
      state.completedOrders.length === 0
    ) {
      state.completedOrders.push({
        id: 99,
        name: "Nguyễn Thị Lan",
        phone: "0901 234 567",
        service: "Giặt + Sấy",
        kg: 3,
        pickup: "18:00",
        time: "17:20",
        notified: false,
        stage: "done",
        statusText: "HOÀN TẤT",
      });

      if (typeof render === "function") {
        render();
      }
    }
  });

  await switchTo("n");

  await screenshot(
    "thong-bao-co-don-cho-gui"
  );

  const completed =
    await getCompletedOrder();

  if (completed) {
    await openModal(
      "notify-zalo",
      completed
    );

    await screenshot(
      "xem-truoc-thong-bao-zalo"
    );
  }

  // ============================================================
  // 19. SAU KHI GỬI ZALO
  // ============================================================

  if (completed) {
    await page.evaluate((order) => {
      if (
        typeof openModal === "function"
      ) {
        openModal(
          "notify-zalo",
          order
        );
      }

      if (
        typeof confirmZalo ===
        "function"
      ) {
        confirmZalo();
      }
    }, completed);

    await wait();

    await switchTo("n");

    await screenshot(
      "sau-khi-gui-thong-bao-khach"
    );
  }

  // ============================================================
  // 20. TÌM KIẾM
  // ============================================================

  console.log("\n=== TÌM KIẾM ===");

  await switchTo("q");

  const search =
    page.locator("#search-input");

  if (await search.count()) {
    try {
      await search.fill("Trần");

      await wait();

      await screenshot(
        "tim-kiem-don-hang"
      );

      await search.fill("");
    } catch {
      console.log(
        "! Không thao tác được ô tìm kiếm"
      );
    }
  }

  // ============================================================
  // 21. PANEL MÁY + NHÂN VIÊN
  // ============================================================

  console.log("\n=== PANEL MÁY / NHÂN VIÊN ===");

  await switchTo("db");

  // Đảm bảo panel đang mở
  await page.evaluate(() => {
    const panel =
      document.getElementById(
        "right-panel"
      );

    if (panel) {
      panel.classList.remove(
        "collapsed"
      );
    }
  });

  await wait();

  await screenshot(
    "tong-quan-may-va-nhan-vien"
  );

  // ============================================================
  // 22. THU GỌN RIGHT PANEL
  //
  // FIX:
  // KHÔNG dùng rpToggle.click()
  // vì .pwrap đang intercept pointer event.
  // Gọi trực tiếp logic của onclick.
  // ============================================================

  const hasRightPanel =
    await page
      .locator("#right-panel")
      .count();

  if (hasRightPanel) {
    await page.evaluate(() => {
      const panel =
        document.getElementById(
          "right-panel"
        );

      if (panel) {
        panel.classList.add(
          "collapsed"
        );
      }
    });

    await wait();

    await screenshot(
      "thu-gon-panel-may-nhan-vien"
    );

    // Mở lại
    await page.evaluate(() => {
      const panel =
        document.getElementById(
          "right-panel"
        );

      if (panel) {
        panel.classList.remove(
          "collapsed"
        );
      }
    });

    await wait();
  }

  // ============================================================
  // 23. FALLBACK — MODAL TĨNH CHƯA ĐƯỢC CHỤP
  // ============================================================

  console.log("\n=== KIỂM TRA MODAL CÒN LẠI ===");

  const modalIds =
    await page.locator(
      '[id^="modal-"]'
    ).evaluateAll((els) => {
      return els
        .map((el) => el.id)
        .filter(Boolean);
    });

  const handled = new Set([
    "modal-add-order",
    "modal-order-detail",
    "modal-expedite",
    "modal-deadline",
    "modal-notify-zalo",
    "modal-settings",
    "modal-machine-reminder",
  ]);

  for (const modalId of modalIds) {
    if (handled.has(modalId)) {
      continue;
    }

    await closeEverything();

    const opened =
      await page.evaluate((id) => {
        const el =
          document.getElementById(id);

        if (!el) {
          return false;
        }

        el.classList.add("open");

        return true;
      }, modalId);

    if (opened) {
      await wait();

      await screenshot(
        `modal-con-lai-${modalId}`
      );
    }
  }

  // ============================================================
  // DONE
  // ============================================================

  await closeEverything();

  console.log("");
  console.log(
    "===================================="
  );

  console.log(
    `HOÀN TẤT: ${count} SCREENSHOT`
  );

  console.log(
    `Folder: ${outputPath}`
  );

  console.log(
    "===================================="
  );

  await browser.close();

})().catch((error) => {
  console.error("");
  console.error(
    "LỖI KHI CHỤP SCREENSHOT:"
  );

  console.error(error);

  process.exit(1);
});