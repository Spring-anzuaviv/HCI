# Agents.md — Dự án "Smart Work Queue"

---

## 1. Tổng quan dự án

Đây là đồ án môn **Tương tác Người - Máy (HCI)**, xây dựng một **prototype mô phỏng** hệ thống **Smart Work Queue — Hệ thống hỗ trợ điều phối công việc cho nhân viên vận hành cửa hàng giặt ủi**.

Dự án **không phát triển một phần mềm quản lý đơn hàng/POS mới**, mà xây dựng một **lớp tính năng tích hợp thêm** vào hệ thống quản lý đơn hàng và máy móc đã có tại cửa hàng giặt ủi, nhằm biến dữ liệu đơn hàng/máy móc sẵn có thành **hướng dẫn hành động cụ thể** cho nhân viên vận hành.

Prototype tập trung đánh giá hiệu quả của thiết kế giao diện, luồng ra quyết định và trải nghiệm người dùng của nhân viên vận hành, không triển khai tích hợp thật với phần mềm bên thứ ba hay phần cứng máy giặt/máy sấy thật.

### Ý tưởng & mục tiêu

Xây dựng **Smart Work Queue** — một hàng chờ công việc chủ động (không chỉ là danh sách hiển thị trạng thái), lấy dữ liệu đơn hàng và máy móc từ hệ thống quản lý sẵn có (mô phỏng bằng dữ liệu mẫu/API giả lập trong phạm vi đồ án), nhằm trả lời câu hỏi: **"Ngay lúc này nhân viên nên xử lý mẻ nào, dùng máy nào và vì sao?"**

4 điểm cải tiến cốt lõi:

- **Tự động xếp hạng công việc**: tính mức ưu tiên dựa trên giờ hẹn trả, thời gian đã chờ, số công đoạn còn lại và nguy cơ trễ hẹn.
- **Đề xuất hành động cụ thể**: không chỉ báo "đơn đang chờ", mà chỉ rõ xử lý mẻ nào, thực hiện công đoạn gì, dùng máy nào, vào thời điểm nào.
- **Giải thích lý do ưu tiên**: mọi thứ hạng/đề xuất đều đi kèm lý do để nhân viên hiểu và có thể phản hồi, không phải "hộp đen".
- **Cập nhật động theo tình trạng thực tế**: khi máy hoàn thành, máy gặp lỗi, xuất hiện đơn gấp hoặc công đoạn kéo dài, hàng chờ được tính lại ngay.

### Người dùng mục tiêu

Hệ thống được thiết kế cho **nhân viên vận hành trực tiếp** tại cửa hàng giặt ủi — những người thực hiện phân loại, vận hành máy, chuyển công đoạn, kiểm tra chất lượng và đóng gói. Đây là nhóm chịu tải nhận thức lớn nhất vì vừa phải thực hiện công việc vật lý, vừa phải theo dõi nhiều đơn hàng và máy móc cùng lúc.

Nhu cầu cốt lõi của nhóm này là: **biết công việc nào cần làm tiếp theo, xử lý đơn nào và dùng máy nào mà không phải tự kiểm tra toàn bộ cửa hàng.** Không cần phân biệt thêm theo cấp bậc/kinh nghiệm (nhân viên mới hay lâu năm) trong thiết kế và phát triển tính năng.

Hệ thống phù hợp nhất với cửa hàng có **nhiều máy, nhiều đơn xử lý đồng thời, từ hai nhân viên vận hành trở lên**.

### Phạm vi đồ án

- Đây là **prototype phần mềm mô phỏng** (web app mô phỏng màn hình/dashboard dùng tại khu vực máy giặt hoặc trên tablet của nhân viên), **không tích hợp thật** với các phần mềm POS bên thứ ba và **không kết nối phần cứng máy giặt/máy sấy thật**.
- Dữ liệu đơn hàng và trạng thái máy được **giả lập** bằng dữ liệu mẫu hoặc API mock, đóng vai trò thay thế cho việc lấy dữ liệu thật từ hệ thống quản lý đơn hàng.
- **Ngoài phạm vi**: quản lý khách hàng, thanh toán, doanh thu, giao nhận, quản lý nhân sự/chấm công — đây là các nghiệp vụ đã được các phần mềm quản lý đơn hàng hiện có xử lý, Smart Work Queue chỉ **bổ sung** lớp điều phối công việc, không thay thế các chức năng đó.

---

## 2. Tech Stack

| Thành phần                  | Công nghệ                                                                                                                                                                                 |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Frontend                    | **React** — mô phỏng giao diện Smart Work Queue dạng dashboard/màn hình danh sách công việc, tối ưu cho tablet/màn hình lớn đặt tại khu vực máy giặt                                      |
| Backend                     | **Node.js + Express** — API tính điểm ưu tiên, quản lý đơn hàng/mẻ đồ/máy móc, xử lý cập nhật trạng thái theo thời gian thực                                                              |
| Database                    | **Supabase** — lưu đơn hàng, mẻ đồ, máy móc, công đoạn, lịch sử xử lý, cấu hình quy tắc ưu tiên                                                                                           |
| Thuật toán xếp hạng ưu tiên | tính điểm ưu tiên dựa trên giờ hẹn trả, thời gian chờ, số công đoạn còn lại, nguy cơ trễ                                                                                                  |
| Dữ liệu đơn hàng & máy móc  | **Toàn bộ giả lập** qua dữ liệu mẫu / API mock, đóng vai trò thay thế tích hợp thật với phần mềm quản lý đơn hàng (CleanCloud/Cents/GPOS...) và cảm biến trạng thái máy giặt/máy sấy thật |

**Không tự ý đổi stack** (ví dụ đổi React sang Vue, đổi Supabase sang
Firebase, tự thêm API AI ngoài không cần thiết...) trừ khi người dùng yêu cầu rõ ràng.

---

## 3. Quy tắc thiết kế (UI/UX)

Thiết kế mô phỏng theo trải nghiệm **màn hình điều phối công việc dùng tại xưởng giặt ủi** (dashboard đặt gần khu vực máy giặt/máy sấy, hoặc app trên tablet nhân viên mang theo). Khi tạo bất kỳ màn hình/component nào, tuân theo các nguyên tắc sau:

### Màu sắc chủ đạo

- **Nền sáng, rõ ràng** làm chủ đạo (trắng/xám nhạt), vì môi trường xưởng giặt thường có ánh sáng mạnh và nhân viên cần đọc nhanh, không phải không gian trưng bày kiểu gia dụng.
- **Card/panel** cho từng đơn hàng/mẻ đồ, bo góc vừa phải, có shadow nhẹ để phân tách rõ từng mục trong hàng chờ.
- **Màu nhấn (accent)**: xanh dương làm màu thương hiệu cho nút hành động chính, trạng thái đang chọn.
- **Màu trạng thái mức độ ưu tiên/nguy cơ trễ bắt buộc dùng đúng hệ 3 màu**:
  - Xanh lá — còn nhiều thời gian, chưa cần ưu tiên.
  - Vàng — sắp đến hạn/đang chờ lâu, nên ưu tiên xử lý sớm.
  - Đỏ — nguy cơ trễ hẹn cao, cần xử lý ngay.
    Không dùng màu khác thay thế cho 3 trạng thái này ở bất kỳ đâu trong app.
- Có thể dùng thêm màu riêng (ví dụ xám) để thể hiện trạng thái máy **lỗi/sự cố**, tách biệt với hệ màu ưu tiên ở trên để tránh nhầm lẫn giữa "mức độ ưu tiên của đơn hàng" và "tình trạng vận hành của máy".
- Đảm bảo **độ tương phản cao** giữa chữ/icon và nền (ưu tiên chuẩn WCAG AA trở lên), vì nhân viên thường thao tác nhanh, đôi khi tay còn ướt/bẩn, cần đọc thông tin trong vài giây.

### Font chữ & typography

- Font sans-serif hiện đại, dễ đọc ở khoảng cách xa (mô phỏng đọc trên màn hình lớn đặt tại xưởng) — ví dụ nhóm font kiểu Inter / Roboto / SF Pro.
- Cỡ chữ cơ bản lớn hơn web thông thường (tối thiểu 18–20px cho nội dung chính), đặc biệt với các thông tin quan trọng như mã đơn, tên máy, thời gian còn lại.
- Phân cấp rõ ràng: tiêu đề đậm/lớn (tên mẻ đồ, máy được đề xuất), nội dung phụ nhẹ hơn (lý do ưu tiên, ghi chú), tránh nhiều tầng chữ nhỏ chồng chéo.

### Phong cách tổng thể

- **Bố cục dạng thẻ/hàng chờ (card-based / queue-based)**, xếp theo thứ tự ưu tiên từ trên xuống, ưu tiên chạm (touch-first) vì nhân viên thao tác khi đang đứng làm việc, có thể đang cầm đồ giặt.
- **Ít bước, dễ chạm**: một thao tác chạm để xem chi tiết đơn/mẻ, một thao tác chạm để đánh dấu đã xử lý/chuyển công đoạn — hạn chế thao tác nhiều tầng menu.
- **Luôn hiển thị hành động đề xuất rõ ràng** ở đầu mỗi mục: "Xử lý mẻ nào – Công đoạn gì – Máy nào – Khi nào", không chỉ hiển thị trạng thái đơn thuần.
- **Mọi đề xuất/xếp hạng ưu tiên đều kèm lý do** và luôn có khả năng **xem chi tiết/điều chỉnh thủ công** — không hiển thị đề xuất của hệ thống như một quyết định bắt buộc tuyệt đối.
- **Bản đồ/trạng thái máy** (trống, đang chạy, sắp xong, gặp sự cố) hiển thị trực quan, cập nhật theo thời gian thực (mô phỏng), giúp nhân viên biết ngay máy nào sẵn sàng.
- Cảnh báo nguy cơ trễ hẹn dùng giọng điệu **rõ ràng nhưng không gây hoảng**, tập trung vào hành động cần làm ("Nên xử lý trong 15 phút tới" thay vì chỉ cảnh báo chung chung).
- Ưu tiên **icon/màu sắc trực quan hơn văn bản dài**; ngôn ngữ đơn giản, không thuật ngữ kỹ thuật ("thuật toán", "điểm số hệ thống") khi hiển thị cho nhân viên — thay bằng ngôn ngữ nghiệp vụ quen thuộc ("sắp trễ hẹn", "còn trống", "đang chạy").

---

## 4. Quy tắc bắt buộc cho OpenCode

### Luôn phải làm

- Đọc kỹ file này và (nếu có) `plan.md`, `skill.md` trước khi bắt đầu bất kỳ task nào trong phiên.
- Thiết kế/code mọi tính năng người dùng phải cân nhắc **cả 2 nhóm đối tượng** (nhân viên mới / nhân viên có kinh nghiệm) trừ khi task nêu rõ chỉ nhắm một nhóm.
- Giữ đúng **hệ màu 3 trạng thái** (xanh/vàng/đỏ) cho mức độ ưu tiên/nguy cơ trễ hẹn của đơn hàng/mẻ đồ; không dùng lẫn hệ màu này cho trạng thái máy.
- Giữ nguyên triết lý "hệ thống hỗ trợ quyết định, con người xác nhận cuối cùng" — mọi đề xuất xếp hạng/ưu tiên/gán máy phải kèm lý do và có thể được nhân viên xem, bỏ qua hoặc điều chỉnh thủ công.
- Viết code frontend bằng React, backend bằng Node.js/Express, dữ liệu qua Supabase, tính điểm ưu tiên bằng logic tự viết trong backend — nhất quán với tech stack đã chọn.
- Giải thích ngắn gọn quyết định thiết kế/kỹ thuật quan trọng khi thực hiện thay đổi lớn, để tôi dễ review.
- Cập nhật `plan.md` (tiến độ) khi hoàn thành một mốc quan trọng, nếu file này tồn tại trong dự án.

### Không được làm

- Không tự ý đổi công nghệ nền tảng (React/Node.js/Express/Supabase) sang lựa chọn khác nếu không được yêu cầu.
- Không thêm mô hình AI/API AI ngoài (ví dụ nhận diện hình ảnh) nếu không thực sự cần thiết cho việc xếp hạng ưu tiên — Smart Work Queue vận hành dựa trên dữ liệu có cấu trúc (thời gian, trạng thái), không phải nhận diện thị giác.
- Không thiết kế đề xuất/cảnh báo dưới dạng mệnh lệnh tuyệt đối không thể thay đổi (ví dụ "bắt buộc xử lý đơn này ngay, không được làm khác") — luôn cho phép nhân viên xem lý do và điều chỉnh nếu cần.
- Không hard-code secrets/API key (Supabase...) trực tiếp trong mã nguồn — luôn dùng biến môi trường (`.env`, không commit vào git).
- Không xóa hoặc ghi đè dữ liệu Supabase production/demo mà không xác nhận trước với người dùng.
- Không tạo lại từ đầu các file cấu hình/tài liệu nền tảng (`plan.md`, `skill.md`, `Agents.md`) trừ khi được yêu cầu rõ ràng — ưu tiên chỉnh sửa gia tăng (incremental).
- Không thêm thư viện/dependency mới nếu không cần thiết cho task hiện tại, tránh phình dự án.

---

## 5. Workflow làm việc trong dự án

Dự án được triển khai theo 3 giai đoạn chính; OpenCode nên xác định task hiện tại đang thuộc giai đoạn nào để áp dụng đúng trọng tâm:

### Giai đoạn 1 — Khảo sát & phân tích yêu cầu

Xác định vấn đề từ góc nhìn nhân viên vận hành: nhu cầu, khả năng thao tác, bối cảnh làm việc tại xưởng, khó khăn khi điều phối công việc giữa nhiều đơn hàng và máy móc. Khảo sát các giải pháp hiện có trên thị trường (CleanCloud, Cents, GPOS Laundry POS) để xác định khoảng trống: các giải pháp này trả lời "trạng thái hiện tại là gì", còn Smart Work Queue trả lời "ngay lúc này nên làm gì". Đầu ra: Persona (nhân viên), Value Proposition, Scenario hiện tại và Scenario cải tiến, cùng `plan.md` (kế hoạch theo từng giai đoạn) và `skill.md` (bộ skill AI dùng trong dự án: phân tích yêu cầu, đề xuất luồng tương tác, tạo nội dung giao diện, sinh mã nguồn mẫu, hỗ trợ kiểm thử).

### Giai đoạn 2 — Thiết kế giao diện

Xây dựng Wireframe và Mockup cho các màn hình chính: đăng nhập nhân viên, **trang tổng quan Smart Work Queue** (danh sách đơn/mẻ theo thứ tự ưu tiên), chi tiết đơn hàng/mẻ đồ, bản đồ trạng thái máy (trống/đang chạy/sắp xong/lỗi), màn hình giải thích lý do ưu tiên, màn hình cảnh báo nguy cơ trễ hẹn, màn hình xử lý sự cố máy (đề xuất chuyển mẻ sang máy khác), cài đặt quy tắc ưu tiên. Thiết kế theo hướng mô phỏng dashboard điều phối tại xưởng, ưu tiên trực quan, ít bước, dễ chạm.

### Giai đoạn 3 — Xây dựng phần mềm mô phỏng (prototype)

Hiện thực hóa các tính năng cải tiến.

### Nguyên tắc làm việc chung với OpenCode

1. Trước khi code, xác nhận task thuộc tính năng nào trong 4 điểm cải tiến cốt lõi (xếp hạng, đề xuất hành động, giải thích lý do, cập nhật động) và nhóm nhân viên nào bị ảnh hưởng.
2. Ưu tiên xây incremental: mỗi lần chỉ tập trung hoàn thiện 1 tính năng/1 luồng nghiệp vụ, có thể demo được ngay.
3. Sau khi hoàn thành một phần việc, tóm tắt ngắn gọn thay đổi đã thực hiện và những gì còn lại, để nhóm dễ theo dõi tiến độ.

### Trình tự bắt buộc khi phát triển MỘT TÍNH NĂNG MỚI

Khi nhận một task dạng "thêm tính năng X" / "làm màn hình Y", OpenCode **phải đi qua đủ 8 bước theo đúng thứ tự** dưới đây, không được nhảy thẳng vào viết code. Nếu một bước không áp dụng cho task (ví dụ task chỉ sửa UI, không đụng dữ liệu), OpenCode nêu rõ lý do bỏ qua rồi mới sang bước kế tiếp.

**Bước 1 — Đối chiếu phạm vi (Scope check)**

- Tính năng này có nằm trong nhóm tính năng cải tiến của Smart Work Queue không (xếp hạng, đề xuất hành động, giải thích lý do, cập nhật động), hay thực chất là chức năng quản lý đơn hàng/POS/thanh toán đã có sẵn ở phần mềm khác?
- Nếu là tính năng phát sinh ngoài phạm vi gốc: xác nhận lại với người dùng trước khi làm, không tự ý mở rộng phạm vi đồ án.

**Bước 2 — Xác định người dùng & ngữ cảnh sử dụng**

- Tính năng phục vụ nhóm nào trong 2 nhóm (nhân viên mới / nhân viên có kinh nghiệm), hay cả hai?
- Ngôn ngữ, mức độ chi tiết, số bước thao tác, mức độ giải thích lý do phải điều chỉnh theo đúng đặc điểm nhóm đó (xem mục 1 và mục 3).

**Bước 3 — Thiết kế luồng thao tác (UX flow) trước khi code UI**

- Vẽ/liệt kê luồng thao tác từng bước: điểm bắt đầu → hành động nhân viên → phản hồi hệ thống → điểm kết thúc.
- Xác định input/output của mỗi bước: cái gì đến từ dữ liệu đơn hàng/máy móc mô phỏng, cái gì nhân viên nhập/chọn tay, cái gì hệ thống tự tính toán và đề xuất.
- Đảm bảo có bước xác nhận/con người kiểm soát cuối nếu tính năng liên quan đến xếp hạng ưu tiên hoặc cảnh báo nguy cơ trễ hẹn.

**Bước 4 — Thiết kế dữ liệu & API**

- Xác định schema Supabase cần thêm/sửa (bảng đơn hàng, mẻ đồ, máy móc, công đoạn, lịch sử xử lý, cấu hình ưu tiên...).
- Xác định endpoint Express cần thêm/sửa (method, route, request/response).
- Nếu cần tính điểm ưu tiên: xác định rõ công thức/tiêu chí đầu vào (giờ hẹn trả, thời gian chờ, số công đoạn còn lại, trạng thái máy) và định dạng kết quả trả về (điểm ưu tiên, lý do, hành động đề xuất).

**Bước 5 — Hiện thực Backend**

- Implement/migrate schema Supabase.
- Implement route + logic Express (bao gồm logic tính điểm ưu tiên), kèm xử lý lỗi cơ bản (dữ liệu đơn hàng thiếu công đoạn, máy không xác định trạng thái...).
- Không hard-code API key; đọc từ biến môi trường.

**Bước 6 — Hiện thực Frontend (React)**

- Xây UI theo đúng "Quy tắc thiết kế" (mục 3): màu trạng thái ưu tiên xanh/vàng/đỏ, bố cục dạng hàng chờ/card, chữ lớn, tương phản cao.
- Kết nối API đã tạo ở bước 5.
- Với mọi đề xuất/xếp hạng hiển thị ra: kèm lý do + khả năng xem chi tiết/điều chỉnh thủ công, không hiển thị như quyết định bắt buộc tuyệt đối.

**Bước 7 — Kiểm thử**

- Kiểm tra tính năng có dùng được với thao tác tối thiểu cho nhân viên/
- Kiểm tra luồng chính chạy mượt khi có nhiều đơn/mẻ đồng thời (tốc độ, số bước).
- Kiểm tra các trường hợp biên: máy gặp sự cố, đơn gấp/VIP phát sinh giữa chừng, dữ liệu đơn hàng thiếu thông tin công đoạn hoặc giờ hẹn trả, nhiều đơn cùng mức ưu tiên.

**Bước 8 — Cập nhật tài liệu & báo cáo tiến độ**

- Cập nhật `plan.md` (nếu có) với trạng thái tính năng vừa hoàn thành.
- Tóm tắt ngắn gọn cho người dùng: đã làm gì, những giả định đã đưa ra, phần nào còn giả lập/chưa hoàn thiện, bước tiếp theo đề xuất.
