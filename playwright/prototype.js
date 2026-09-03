const { chromium } = require("playwright");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { pathToFileURL } = require("url");

// ============================================================
// CẤU HÌNH
// ============================================================
//
// Chạy:
// node frontend.js index.html
//
// Hoặc:
// node frontend.js index.html "D:/Project/HCI/playwright/prototype"
//
// Nếu HTML đang lưu dạng .txt:
// node frontend.js prototype.txt "D:/Project/HCI/playwright/prototype"
// ============================================================

const SOURCE_FILE = process.argv[2] || "prototype.html";
const OUTPUT_DIR = process.argv[3] || "prototype";

const sourcePath = path.resolve(SOURCE_FILE);
const outputPath = path.resolve(OUTPUT_DIR);

if (!fs.existsSync(sourcePath)) {
  console.error(`Không tìm thấy file: ${sourcePath}`);
  process.exit(1);
}

fs.mkdirSync(outputPath, { recursive: true });

// ============================================================
// ĐỌC HTML
// ============================================================

const html = fs.readFileSync(sourcePath, "utf8");

// Cho phép cả .html và .txt chứa HTML
const tempHtmlPath = path.join(
  os.tmpdir(),
  `washtrack-${process.pid}-${Date.now()}.html`
);

fs.writeFileSync(tempHtmlPath, html, "utf8");

// ============================================================
// MAIN
// ============================================================

(async () => {
  let browser = null;

  let count = 0;

  const failures = [];

  // ==========================================================
  // HELPERS
  // ==========================================================

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

  async function safeStep(name, fn) {
    try {
      console.log(`\n→ ${name}`);

      await fn();
    } catch (error) {
      failures.push({
        name,
        error: error.message,
      });

      console.log(`! BỎ QUA [${name}]`);
      console.log(`  ${error.message}`);
    }
  }

  try {
    // ========================================================
    // BROWSER
    // ========================================================

    browser = await chromium.launch({
      headless: true,
    });

    const page = await browser.newPage({
      viewport: {
        width: 1440,
        height: 1000,
      },
      deviceScaleFactor: 1,
    });

    // ========================================================
    // KHÔNG ĐỂ DIALOG LÀM TREO
    // ========================================================

    page.on("dialog", async (dialog) => {
      try {
        await dialog.dismiss();
      } catch (_) {}
    });

    // ========================================================
    // LOG PAGE ERROR
    //
    // Không làm script dừng.
    // ========================================================

    page.on("pageerror", (error) => {
      console.log(
        `! PAGE ERROR (bỏ qua): ${error.message}`
      );
    });

    // ========================================================
    // LOAD HTML
    // ========================================================

    await page.goto(
      pathToFileURL(tempHtmlPath).href,
      {
        waitUntil: "domcontentloaded",
      }
    );

    await page.waitForTimeout(400);

    // ========================================================
    // TẮT ANIMATION
    // ========================================================

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

    // ========================================================
    // HELPER FUNCTIONS
    // ========================================================

    async function wait(ms = 150) {
      await page.waitForTimeout(ms);
    }

    async function shot(name) {
      count++;

      const filename =
        `${String(count).padStart(2, "0")}-${slug(name)}.png`;

      await page.screenshot({
        path: path.join(
          outputPath,
          filename
        ),

        fullPage: false,
      });

      console.log(`✓ ${filename}`);
    }

    async function closeAll() {
      await page.evaluate(() => {
        // Đóng tất cả modal
        document
          .querySelectorAll(".mov")
          .forEach((el) => {
            el.classList.remove("open");
          });

        // Đóng overlay nếu có
        document
          .querySelectorAll(
            ".completion-overlay"
          )
          .forEach((el) => {
            el.classList.remove("open");
          });

        // Xóa toast
        document
          .querySelectorAll(".toast")
          .forEach((el) => {
            el.remove();
          });
      });

      await wait(50);
    }

    async function call(
      functionName,
      ...args
    ) {
      return await page.evaluate(
        ({ functionName, args }) => {
          const fn =
            window[functionName];

          if (
            typeof fn !== "function"
          ) {
            return {
              ok: false,
              reason:
                `Không tìm thấy ${functionName}()`,
            };
          }

          try {
            return {
              ok: true,
              result: fn(...args),
            };
          } catch (error) {
            return {
              ok: false,
              reason: error.message,
            };
          }
        },
        {
          functionName,
          args,
        }
      );
    }

    async function setValue(
      id,
      value,
      dispatch = false
    ) {
      await page.evaluate(
        ({
          id,
          value,
          dispatch,
        }) => {
          const el =
            document.getElementById(id);

          if (!el) {
            return;
          }

          el.value = value;

          if (dispatch) {
            el.dispatchEvent(
              new Event("input", {
                bubbles: true,
              })
            );

            el.dispatchEvent(
              new Event("change", {
                bubbles: true,
              })
            );
          }
        },
        {
          id,
          value,
          dispatch,
        }
      );
    }

    // ========================================================
    // CHUYỂN PAGE
    //
    // Không click vật lý.
    // Tránh lỗi element intercept pointer events.
    // ========================================================

    async function go(pageId) {
      await closeAll();

      await page.evaluate(
        (pageId) => {
          const target =
            document.getElementById(
              `p-${pageId}`
            );

          if (!target) {
            return;
          }

          document
            .querySelectorAll(".page")
            .forEach((el) => {
              el.classList.remove("on");
            });

          target.classList.add("on");

          // Sidebar
          document
            .querySelectorAll(".ni")
            .forEach((el) => {
              el.classList.remove("on");
            });

          // Nếu có nav id
          const possibleIds = [
            `nav-${pageId}`,
            `n-${pageId}`,
          ];

          for (
            const id of possibleIds
          ) {
            const nav =
              document.getElementById(
                id
              );

            if (nav) {
              nav.classList.add("on");
              break;
            }
          }

          // Scroll về đầu
          const pwrap =
            document.querySelector(
              ".pwrap"
            );

          if (pwrap) {
            pwrap.scrollTop = 0;
          }

          window.scrollTo(0, 0);
        },
        pageId
      );

      await wait();
    }

    // ========================================================
    // MỞ MODAL TRỰC TIẾP
    // ========================================================

    async function openModalDirect(id) {
      await closeAll();

      await page.evaluate((id) => {
        const candidates = [
          id,
          `modal-${id}`,
        ];

        for (
          const candidate of candidates
        ) {
          const modal =
            document.getElementById(
              candidate
            );

          if (modal) {
            modal.classList.add(
              "open"
            );

            return;
          }
        }
      }, id);

      await wait();
    }

    // ========================================================
    // 01 - TỔNG QUAN
    // ========================================================

    await safeStep(
      "Tổng quan",
      async () => {
        await go("db");

        await shot(
          "tong-quan"
        );
      }
    );

    // ========================================================
    // 02 - KIỂM TRA GIỜ
    // ========================================================

    await safeStep(
      "Kiểm tra giờ",
      async () => {
        await go("db");

        // Chụp trạng thái ban đầu
        await shot(
          "kiem-tra-gio-ban-dau"
        );
      }
    );

    // ========================================================
    // 03 - HÀNG ĐỢI
    // ========================================================

    await safeStep(
      "Hàng đợi",
      async () => {
        await go("q");

        await shot(
          "hang-doi"
        );
      }
    );

    // ========================================================
    // 04 - ĐƠN HÀNG TẤT CẢ
    // ========================================================

    await safeStep(
      "Đơn hàng tất cả",
      async () => {
        await go("orders");

        await page.evaluate(() => {
          const tabs =
            document.querySelectorAll(
              "#p-orders .filter-tab"
            );

          if (
            tabs.length > 0 &&
            typeof window.filterOrd ===
              "function"
          ) {
            try {
              window.filterOrd(
                tabs[0],
                "all"
              );
            } catch (_) {}
          }
        });

        await wait();

        await shot(
          "don-hang-tat-ca"
        );
      }
    );

    // ========================================================
    // 05 - ĐANG XỬ LÝ
    // ========================================================

    await safeStep(
      "Đơn hàng đang xử lý",
      async () => {
        await go("orders");

        await page.evaluate(() => {
          const tabs =
            document.querySelectorAll(
              "#p-orders .filter-tab"
            );

          if (
            tabs.length > 1 &&
            typeof window.filterOrd ===
              "function"
          ) {
            try {
              window.filterOrd(
                tabs[1],
                "pending"
              );
            } catch (_) {}
          }
        });

        await wait();

        await shot(
          "don-hang-dang-xu-ly"
        );
      }
    );

    // ========================================================
    // 06 - HOÀN TẤT
    // ========================================================

    await safeStep(
      "Đơn hàng hoàn tất",
      async () => {
        await go("orders");

        await page.evaluate(() => {
          const tabs =
            document.querySelectorAll(
              "#p-orders .filter-tab"
            );

          if (
            tabs.length > 2 &&
            typeof window.filterOrd ===
              "function"
          ) {
            try {
              window.filterOrd(
                tabs[2],
                "done"
              );
            } catch (_) {}
          }
        });

        await wait();

        await shot(
          "don-hang-hoan-tat"
        );
      }
    );

    // ========================================================
    // 07 - THÔNG BÁO
    // ========================================================

    await safeStep(
      "Thông báo",
      async () => {
        await go("n");

        await shot(
          "thong-bao"
        );
      }
    );

    // ========================================================
    // 08 - THỐNG KÊ
    // ========================================================

    await safeStep(
      "Thống kê",
      async () => {
        await go("stats");

        await shot(
          "thong-ke"
        );
      }
    );

    // ========================================================
    // 09 - TÌM KIẾM
    // ========================================================

    await safeStep(
      "Tìm kiếm",
      async () => {
        await go("orders");

        await page.evaluate(() => {
          const input =
            document.querySelector(
              ".searchbar input"
            );

          if (!input) {
            return;
          }

          input.value =
            "Lê Văn Nam";

          // Không dispatch event để tránh
          // gọi handler lỗi trong prototype.
        });

        await wait();

        await shot(
          "tim-kiem-le-van-nam"
        );

        await page.evaluate(() => {
          const input =
            document.querySelector(
              ".searchbar input"
            );

          if (input) {
            input.value = "";
          }
        });
      }
    );

    // ========================================================
    // 10 - THÊM ĐƠN BAN ĐẦU
    // ========================================================

    await safeStep(
      "Thêm đơn ban đầu",
      async () => {
        await go("db");

        const result =
          await call(
            "openM",
            "am"
          );

        if (!result.ok) {
          await openModalDirect(
            "am"
          );
        }

        await wait();

        await shot(
          "them-don-ban-dau"
        );
      }
    );

    // ========================================================
    // 11 - THÊM ĐƠN 14:00
    //
    // QUAN TRỌNG:
    // KHÔNG gọi updateAddCalc()
    // ========================================================

    await safeStep(
      "Thêm đơn giờ 14h",
      async () => {
        await setValue(
          "add-name",
          "Nguyễn Thị Lan"
        );

        await setValue(
          "add-phone",
          "0901234567"
        );

        await setValue(
          "add-kg",
          "3"
        );

        await setValue(
          "add-time",
          "14:00"
        );

        await setValue(
          "add-note",
          "Khách muốn lấy lúc 14:00"
        );

        await wait();

        await shot(
          "them-don-hen-14h"
        );
      }
    );

    // ========================================================
    // 12 - HIỂN THỊ KHÔNG KHẢ THI
    //
    // Tạo phần kết quả trực tiếp trong modal.
    // Không dùng updateAddCalc().
    // ========================================================

    await safeStep(
      "Giờ 14h không khả thi",
      async () => {
        await page.evaluate(() => {
          const modal =
            document.querySelector(
              "#am .modal"
            ) ||
            document.querySelector(
              "#modal-add-order .modal"
            );

          if (!modal) {
            return;
          }

          let result =
            document.getElementById(
              "pw-feasibility-result"
            );

          if (!result) {
            result =
              document.createElement(
                "div"
              );

            result.id =
              "pw-feasibility-result";

            result.style.cssText = `
              margin-top: 14px;
              border: 2px solid #333;
              padding: 14px;
              background: #fff;
            `;

            modal.appendChild(result);
          }

          result.innerHTML = `
            <div style="
              font-size:13px;
              font-weight:800;
              margin-bottom:8px;
            ">
              GIỜ HẸN CHƯA KHẢ THI
            </div>

            <div style="
              font-size:13px;
              line-height:1.6;
            ">
              Không thể hoàn thành lúc
              <strong>14:00</strong>.
              <br>
              Thời gian sớm nhất có thể hoàn thành:
              <strong>14:30</strong>.
            </div>

            <div style="
              margin-top:10px;
              border:2px solid #333;
              padding:10px;
              font-weight:700;
            ">
              Gợi ý giờ nhận: từ 14:30
            </div>
          `;
        });

        await wait();

        await shot(
          "them-don-14h-khong-kha-thi"
        );
      }
    );

    // ========================================================
    // 13 - KHÁCH CHỌN 20:00
    // ========================================================

    await safeStep(
      "Khách chọn 20h",
      async () => {
        await setValue(
          "add-time",
          "20:00"
        );

        await setValue(
          "add-note",
          "Khách đi làm về và ghé lấy lúc 20:00"
        );

        await page.evaluate(() => {
          const result =
            document.getElementById(
              "pw-feasibility-result"
            );

          if (!result) {
            return;
          }

          result.innerHTML = `
            <div style="
              font-size:13px;
              font-weight:800;
              margin-bottom:8px;
            ">
              GIỜ HẸN KHẢ THI
            </div>

            <div style="
              font-size:13px;
              line-height:1.6;
            ">
              Có đủ thời gian xử lý đơn trước
              <strong>20:00</strong>.
            </div>
          `;
        });

        await wait();

        await shot(
          "them-don-hen-20h-kha-thi"
        );

        await closeAll();
      }
    );

    // ========================================================
    // 14 - CHI TIẾT ĐƠN ĐANG GIẶT
    // ========================================================

    await safeStep(
      "Chi tiết đơn đang giặt",
      async () => {
        await go("q");

        const result =
          await call(
            "openOM",
            "Nguyễn Minh Tuấn",
            "17:30",
            false,
            "wash",
            false
          );

        if (result.ok) {
          await wait();

          await shot(
            "chi-tiet-don-dang-giat"
          );
        }

        await closeAll();
      }
    );

    // ========================================================
    // 15 - CHI TIẾT ĐƠN NGUY CƠ TRỄ
    // ========================================================

    await safeStep(
      "Chi tiết đơn nguy cơ trễ",
      async () => {
        await go("q");

        const result =
          await call(
            "openOM",
            "Trần Thị Hoa",
            "17:30",
            true,
            "combo",
            true
          );

        if (result.ok) {
          await wait();

          await shot(
            "chi-tiet-don-nguy-co-tre"
          );
        }

        await closeAll();
      }
    );

    // ========================================================
    // 16 - CHI TIẾT ĐƠN CHỜ MÁY
    // ========================================================

    await safeStep(
      "Chi tiết đơn chờ máy",
      async () => {
        await go("q");

        const result =
          await call(
            "openOM",
            "Lê Văn Nam",
            "18:00",
            true,
            "dry",
            true
          );

        if (result.ok) {
          await wait();

          await shot(
            "chi-tiet-don-cho-may"
          );
        }
      }
    );

    // ========================================================
    // 17 - CHỌN MÁY ĐANG BẬN
    // ========================================================

    await safeStep(
      "Chọn máy đang bận",
      async () => {
        await page.evaluate(() => {
          const select =
            document.getElementById(
              "om-mach"
            );

          if (!select) {
            return;
          }

          const options =
            [...select.options];

          let index =
            options.findIndex(
              (option) =>
                option.dataset.busy ===
                "true"
            );

          if (index < 0) {
            index =
              options.findIndex(
                (option) =>
                  /bận|đang/i.test(
                    option.textContent
                  )
              );
          }

          if (index >= 0) {
            select.selectedIndex =
              index;
          }

          if (
            typeof window
              .checkMachStatus ===
            "function"
          ) {
            try {
              window.checkMachStatus();
            } catch (_) {}
          }
        });

        await wait();

        await shot(
          "chon-may-dang-ban"
        );
      }
    );

    // ========================================================
    // 18 - CHỌN MÁY TRỐNG
    // ========================================================

    await safeStep(
      "Chọn máy trống",
      async () => {
        await page.evaluate(() => {
          const select =
            document.getElementById(
              "om-mach"
            );

          if (!select) {
            return;
          }

          const options =
            [...select.options];

          let index =
            options.findIndex(
              (option) =>
                option.dataset.busy ===
                "false"
            );

          if (index < 0) {
            index =
              options.findIndex(
                (option) =>
                  /trống|sẵn sàng/i.test(
                    option.textContent
                  )
              );
          }

          if (index >= 0) {
            select.selectedIndex =
              index;
          }

          if (
            typeof window
              .checkMachStatus ===
            "function"
          ) {
            try {
              window.checkMachStatus();
            } catch (_) {}
          }
        });

        await wait();

        await shot(
          "chon-may-trong"
        );

        await closeAll();
      }
    );

    // ========================================================
    // 19 - ĐÔN ĐƠN
    // ========================================================

    await safeStep(
      "Đôn đơn",
      async () => {
        const result =
          await call(
            "openDonDon",
            "Lê Văn Nam",
            "18:00"
          );

        if (result.ok) {
          await wait();

          await shot(
            "don-don-ban-dau"
          );
        }
      }
    );

    // ========================================================
    // 20 - ĐÔN 17:30
    // ========================================================

    await safeStep(
      "Đôn 17h30",
      async () => {
        await setValue(
          "pm-new-time",
          "17:30"
        );

        const result =
          await call(
            "checkDonDon"
          );

        await wait();

        await shot(
          "don-don-17h30"
        );
      }
    );

    // ========================================================
    // 21 - ĐÔN 16:30
    // ========================================================

    await safeStep(
      "Đôn 16h30",
      async () => {
        await setValue(
          "pm-new-time",
          "16:30"
        );

        await call(
          "checkDonDon"
        );

        await wait();

        await shot(
          "don-don-16h30-xung-dot"
        );
      }
    );

    // ========================================================
    // 22 - ĐỔI 20:00
    // ========================================================

    await safeStep(
      "Đổi giờ 20h",
      async () => {
        await setValue(
          "pm-new-time",
          "20:00"
        );

        await call(
          "checkDonDon"
        );

        await wait();

        await shot(
          "doi-gio-hen-20h"
        );

        await closeAll();
      }
    );

    // ========================================================
    // 23 - NHẮC MÁY
    // ========================================================

    await safeStep(
      "Nhắc máy hoàn tất",
      async () => {
        await call(
          "openMachineReminder"
        );

        await wait();

        await shot(
          "nhac-may-hoan-tat"
        );
      }
    );

    // ========================================================
    // 24 - HẸN LẠI 5 PHÚT
    // ========================================================

    await safeStep(
      "Hẹn nhắc lại",
      async () => {
        await call(
          "snoozeMachineReminder",
          5
        );

        await wait();

        await shot(
          "hen-nhac-lai-5-phut"
        );

        // Reset FAB
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
        });
      }
    );

    // ========================================================
    // 25 - XÁC NHẬN LẤY ĐỒ
    // ========================================================

    await safeStep(
      "Xác nhận lấy đồ",
      async () => {
        await call(
          "openMachineReminder"
        );

        await wait(50);

        await call(
          "confirmMachinePickup"
        );

        await wait();

        await shot(
          "xac-nhan-da-lay-do"
        );
      }
    );

    // ========================================================
    // 26 - CÀI ĐẶT
    // ========================================================

    await safeStep(
      "Cài đặt",
      async () => {
        const result =
          await call(
            "openM",
            "sm"
          );

        if (!result.ok) {
          await openModalDirect(
            "sm"
          );
        }

        await wait();

        await shot(
          "cai-dat"
        );
      }
    );

    // ========================================================
    // 27 - THÊM CA
    // ========================================================

    await safeStep(
      "Thêm ca làm",
      async () => {
        await call(
          "addShiftCfg"
        );

        await wait();

        await shot(
          "them-ca-lam"
        );

        await closeAll();
      }
    );

    // ========================================================
    // 28 - THÊM NHÂN VIÊN
    // ========================================================

    await safeStep(
      "Thêm nhân viên",
      async () => {
        const result =
          await call(
            "openStaffModal"
          );

        if (result.ok) {
          await wait();

          await shot(
            "them-nhan-vien"
          );
        }

        await closeAll();
      }
    );

    // ========================================================
    // 29 - CHI TIẾT NHÂN VIÊN
    // ========================================================

    await safeStep(
      "Chi tiết nhân viên",
      async () => {
        const result =
          await call(
            "showStaffDetails",
            1
          );

        if (result.ok) {
          await wait();

          await shot(
            "chi-tiet-nhan-vien"
          );
        }

        await closeAll();
      }
    );

    // ========================================================
    // 30 - SỬA NHÂN VIÊN
    // ========================================================

    await safeStep(
      "Sửa nhân viên",
      async () => {
        const result =
          await call(
            "openStaffModal",
            1
          );

        if (result.ok) {
          await wait();

          await shot(
            "sua-nhan-vien"
          );
        }

        await closeAll();
      }
    );

    // ========================================================
    // 31 - THÔNG BÁO KHÁCH
    // ========================================================

    await safeStep(
      "Thông báo khách",
      async () => {
        await go("n");

        await shot(
          "thong-bao-truoc-khi-gui"
        );
      }
    );

    // ========================================================
    // 32 - GỬI ZALO
    // ========================================================

    await safeStep(
      "Gửi Zalo",
      async () => {
        await page.evaluate(() => {
          if (
            typeof window.sendN !==
            "function"
          ) {
            return;
          }

          try {
            window.sendN(
              "nc-dqa",
              "Đặng Quốc Anh",
              "ĐA"
            );
          } catch (_) {}
        });

        await wait(500);

        await shot(
          "sau-khi-gui-zalo"
        );
      }
    );

    // ========================================================
    // 33 - RIGHT PANEL MỞ
    // ========================================================

    await safeStep(
      "Right panel mở",
      async () => {
        await go("db");

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

        await shot(
          "panel-may-va-nhan-vien"
        );
      }
    );

    // ========================================================
    // 34 - RIGHT PANEL THU GỌN
    //
    // KHÔNG CLICK .rp-toggle
    // ========================================================

    await safeStep(
      "Thu gọn right panel",
      async () => {
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

        await shot(
          "panel-thu-gon"
        );

        // mở lại
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
      }
    );

    // ========================================================
    // 35 - CHỤP CÁC MODAL CHƯA ĐỤNG TỚI
    // ========================================================

    await safeStep(
      "Modal còn lại",
      async () => {
        const modalIds =
          await page.evaluate(() => {
            return [
              ...document.querySelectorAll(
                ".mov[id]"
              ),
            ].map(
              (el) => el.id
            );
          });

        const alreadyHandled =
          new Set([
            "am",
            "om",
            "pm",
            "sm",
            "sm-staff",
            "sm-staff-details",
            "modal-machine-reminder",
          ]);

        for (
          const id of modalIds
        ) {
          if (
            alreadyHandled.has(id)
          ) {
            continue;
          }

          await closeAll();

          const opened =
            await page.evaluate(
              (id) => {
                const modal =
                  document.getElementById(
                    id
                  );

                if (!modal) {
                  return false;
                }

                modal.classList.add(
                  "open"
                );

                return true;
              },
              id
            );

          if (!opened) {
            continue;
          }

          await wait();

          await shot(
            `modal-${id}`
          );
        }

        await closeAll();
      }
    );

    // ========================================================
    // DONE
    // ========================================================

    console.log("");
    console.log(
      "========================================"
    );

    console.log(
      `HOÀN TẤT: ${count} SCREENSHOT`
    );

    console.log(
      `Folder: ${outputPath}`
    );

    if (
      failures.length === 0
    ) {
      console.log(
        "Không có bước nào làm script dừng."
      );
    } else {
      console.log("");
      console.log(
        `${failures.length} bước bị bỏ qua:`
      );

      failures.forEach(
        (failure) => {
          console.log(
            `- ${failure.name}: ${failure.error}`
          );
        }
      );
    }

    console.log(
      "========================================"
    );
  } catch (error) {
    console.error("");
    console.error(
      "LỖI PLAYWRIGHT:"
    );

    console.error(error);

    process.exitCode = 1;
  } finally {
    // ========================================================
    // CLEANUP
    // ========================================================

    if (browser) {
      try {
        await browser.close();
      } catch (_) {}
    }

    try {
      fs.unlinkSync(
        tempHtmlPath
      );
    } catch (_) {}
  }
})();