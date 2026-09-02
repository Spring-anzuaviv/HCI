---
name: scenario-1
description: Dùng để viết Scenario 1 (hệ thống hiện tại) cho đồ án HCI — mô tả tường thuật ca làm việc thực tế của nhân viên giặt ủi trước khi có hệ thống hỗ trợ, làm nổi bật đúng 4 pain points (P1–P4) tương ứng với 3 tính năng nhóm sẽ thiết kế (Tính năng 1, 3, 4).
---

# Skill Scenario 1 — Hệ thống hiện tại

## Purpose

Tạo hoặc rà soát Scenario 1 cho đồ án HCI dựa trên bằng chứng từ phỏng vấn, Persona và Value Proposition Canvas.

Skill này giúp Agent:

- Viết tường thuật liền mạch, tự nhiên về ca làm việc thực tế của Persona.
- Đặt đúng bối cảnh (ai, ở đâu, khi nào, tình trạng ban đầu).
- Làm nổi bật **đúng 4 pain points (P1–P4)** phát sinh trong tường thuật — chỉ những pain points tương ứng với tính năng nhóm sẽ thiết kế, không liệt kê thừa.
- Phân biệt rõ finding (từ phỏng vấn), synthesis (tổng hợp) và assumption (giả định chưa xác nhận).
- Giữ tường thuật tập trung vào hành động của người dùng, không mô tả giải pháp hoặc tính năng.

Skill này không dùng để viết Scenario 2 (hệ thống tương lai), Storyboard, hay mô tả giao diện sản phẩm.

## Use This Skill When

- Người dùng muốn tạo hoặc cập nhật Scenario 1.
- Đã có Persona và muốn dựng lại quy trình làm việc hiện tại dưới dạng tường thuật.
- Người dùng cần deliverable **Scenario 1** theo rubric môn HCI - FIT - HCMUS.

Không gọi skill này khi chưa có Persona, hoặc khi cần viết Scenario 2 (hệ thống sau thiết kế).

## Required Inputs

Ưu tiên nhận một hoặc nhiều nguồn sau:

- Persona hoàn chỉnh (background, goals, tasks, behaviors, pain points, motivations, wishes, quote).
- Value Proposition Canvas (Customer Jobs, Customer Pains, Customer Gains) — **chỉ lấy phần tương ứng với 3 tính năng nhóm làm**.
- Ghi chú phỏng vấn hoặc quan sát người dùng thực tế.
- Bối cảnh tình huống cụ thể nếu có (địa điểm, thời điểm, tình trạng ban đầu).

Mỗi nội dung trong tường thuật cần gắn nhãn bằng chứng [F] / [S] / [A]. Nếu dùng dữ liệu mô phỏng (ví dụ số đơn, giờ cụ thể), phải ghi rõ trong chú thích.

## Output

Đầu ra mặc định là một tài liệu Markdown gồm:

1. Bối cảnh tình huống (Persona, địa điểm, thời điểm, tình trạng ban đầu).
2. Một đoạn văn tường thuật liền mạch (narrative) kể lại ca làm việc theo trình tự thời gian.
3. Các pain points được trích xuất và kết nối với Persona — đặt bên ngoài tường thuật (callout hoặc bảng), không chen vào giữa đoạn văn chính.
4. Danh sách nguồn bằng chứng đã dùng.

Đầu ra phải nhất quán với Persona, Value Proposition Canvas và phù hợp với deliverable **Scenario 1** trong `docs/Rubric.md`.

## Domain Knowledge

### Scenario là gì

Theo bài giảng HCI - FIT - HCMUS (Lecture 6):

> "An informal narrative description of how a user performs a task and achieves a goal in a specific context."

Đặc điểm cốt lõi:
- **Tập trung vào hành động của người dùng**, không phải hệ thống hay công nghệ.
- **Dùng ngôn ngữ tự nhiên**, gần với ngôn ngữ người dùng dùng trong phỏng vấn.
- **Đặt người dùng vào bối cảnh cụ thể và thực tế** — ai, ở đâu, khi nào, tình huống như thế nào.
- **Là công cụ giao tiếp** xuyên suốt quá trình thiết kế sản phẩm.

### Scenario 1 vs. Scenario 2

| | Scenario 1 | Scenario 2 |
|---|---|---|
| **Hệ thống** | Hiện tại (chưa có hỗ trợ) | Tương lai (sau khi có hệ thống mới) |
| **Mục đích** | Làm nổi bật vấn đề | Minh họa giải pháp trong thực tế |
| **Kết quả** | Người dùng gặp khó khăn | Người dùng hoàn thành tốt hơn |
| **Phụ thuộc** | Persona + phỏng vấn | Persona + Scenario 1 + thiết kế hệ thống |

### Cấu trúc tường thuật tốt

Một Scenario 1 tốt cần có:

1. **Bối cảnh rõ ràng** — đặt ngay từ đầu: ai là người dùng, đang ở đâu, lúc nào, bắt đầu với tình trạng gì.
2. **Chuỗi hành động tự nhiên** — kể theo trình tự thời gian, dùng động từ hành động cụ thể.
3. **Pain points phát sinh tự nhiên** — không liệt kê khô, mà để chúng xuất hiện từ chính diễn biến của câu chuyện.
4. **Kết thúc để lại vấn đề mở** — Scenario 1 không có happy ending; kết thúc ở điểm vẫn còn vấn đề hoặc đã bị ảnh hưởng.

### Nhãn bằng chứng

| Nhãn | Nghĩa | Khi nào dùng |
|---|---|---|
| `[F]` | **Finding** | Nội dung được người phỏng vấn nói trực tiếp hoặc quan sát được |
| `[S]` | **Synthesis** | Tổng hợp thận trọng từ nhiều finding |
| `[A]` | **Assumption** | Giả định chưa được xác nhận qua phỏng vấn |

Dữ liệu số lượng cụ thể (số đơn, giờ, thời gian) thường là `[A]` hoặc mô phỏng minh họa — phải ghi rõ trong chú thích.

## Reasoning Rules

1. **Bắt đầu từ Tasks và Behaviors của Persona** — tường thuật phải phản ánh đúng cách người dùng thực sự làm việc theo phỏng vấn, không phải cách ta tưởng tượng họ làm.
2. **Pain points phát sinh từ hành động, không phải được liệt kê** — trong tường thuật, pain point là hệ quả tự nhiên của một hành động hoặc tình huống cụ thể.
3. **Chỉ biểu hiện đúng 4 pain points (P1–P4) đã định nghĩa** — không thêm pain point khác vào tường thuật dù phỏng vấn có đề cập (ví dụ bàn giao ca, thông tin phân tán — không thuộc phạm vi thiết kế).
4. **Không mô tả giải pháp** — Scenario 1 chỉ mô tả hiện trạng. Không đề cập tính năng, hệ thống mới, hay cách khắc phục.
5. **Mỗi chi tiết trong tường thuật cần có nguồn** — nếu không truy được về finding hoặc synthesis, đánh dấu `[A]` hoặc bỏ đi.
6. **Ngôn ngữ của người dùng** — ưu tiên dùng thuật ngữ, cách diễn đạt mà người dùng dùng trong phỏng vấn (ví dụ: "đôn đơn", "đơn gấp").

## Phạm vi Pain Points của Dự án (Cố định)

Scenario 1 chỉ làm nổi bật **đúng 4 pain points sau**, không thêm, không bớt:

| Mã | Vấn đề | Tính năng giải quyết |
|---|---|---|
| **P1** | Hàng đợi thủ công — tự quyết định thứ tự xử lý không có hỗ trợ | **Tính năng 1** — Hàng đợi công việc thông minh |
| **P2** | Hẹn giờ theo cảm tính — không biết giờ hẹn có khả thi không | **Tính năng 3** — Kiểm tra tính khả thi giờ hẹn |
| **P3** | Phát hiện trễ muộn — nhận ra nguy cơ khi đã không còn kịp xử lý | **Tính năng 1** — Hàng đợi công việc thông minh (cảnh báo sớm) |
| **P4** | Thông báo thủ công — không theo dõi được khách đã báo hay chưa | **Tính năng 4** — Cập nhật tiến trình và thông báo tự động |

**Pain points không thuộc phạm vi (không đưa vào Scenario 1):**
- Thông tin phân tán (POS / bill giấy / note điện thoại) → Thuộc Tính năng 2 — nhóm không làm.
- Bàn giao ca thiếu cấu trúc → Không có tính năng giải quyết.
- Bỏ sót / quên đồ trong máy → Thuộc Tính năng 2 — nhóm không làm.

## Validation Checklist

Trước khi xuất output, kiểm tra:

- [ ] Tường thuật tập trung vào hành động của người dùng, không mô tả giao diện hoặc tính năng hệ thống?
- [ ] Chỉ có đúng **4 pain points P1–P4** trong bảng tóm tắt, không thêm bàn giao ca / thông tin phân tán / bỏ sót máy?
- [ ] Mỗi pain point có thể truy về ít nhất một chi tiết cụ thể trong tường thuật không?
- [ ] Mỗi pain point có ghi rõ tính năng sẽ giải quyết (Tính năng 1 / 3 / 4) không?
- [ ] Nhãn bằng chứng [F] / [S] / [A] được gắn đúng không?
- [ ] Dữ liệu số lượng mô phỏng (số đơn, giờ cụ thể) có được ghi chú là mô phỏng minh họa không?
- [ ] Tường thuật có kết thúc ở điểm vẫn còn vấn đề (không có happy ending) không?
- [ ] Bối cảnh (Persona, địa điểm, thời điểm, tình trạng ban đầu) có được ghi rõ ở đầu không?

## Failure Handling

- **Thừa pain point ngoài phạm vi (bàn giao ca, thông tin phân tán, bỏ sót máy):** xóa khỏi bảng tóm tắt và lượt bỏ trong tường thuật — không giữ lại dù phỏng vấn có đề cập.
- **Thiếu bằng chứng cho một chi tiết tường thuật:** đánh dấu `[A]` hoặc bỏ chi tiết đó; không tự bịa nội dung.
- **Tường thuật vô tình mô tả giải pháp:** xóa hoặc viết lại để chỉ mô tả vấn đề và hiện trạng.
- **Pain points trong callout không khớp với bảng phạm vi trên:** quay lại bảng **Phạm vi Pain Points của Dự án** và đối chiếu trước khi xuất.
- **Tường thuật quá dài / quá ngắn:** Scenario 1 không có giới hạn từ cứng, nhưng phải đủ để người đọc hiểu được một ca làm việc điển hình từ đầu đến cuối với các vấn đề nổi bật.

## Scenario Template

Template canonical của dự án là `templates/scenario-1.md`. Dùng file này làm cấu trúc xuất output; khung dưới đây là quy định nội dung tương ứng.

Khung chuẩn cho deliverable Scenario 1:

```markdown
# Scenario 1 — Hệ thống hiện tại

> **[Tiêu đề ngắn gọn mô tả tình huống]**

[Một câu mô tả tổng quan về tình huống.]

---

## Bối cảnh

| | |
|---|---|
| 👤 **Persona** | [Tên, tuổi, vai trò] |
| 📍 **Địa điểm** | [Nơi xảy ra] |
| 🕐 **Thời điểm** | [Khi nào] |
| 📦 **Tình trạng ban đầu** | [Trạng thái lúc bắt đầu] |

---

## Tình huống

[Đoạn văn tường thuật liền mạch — kể lại ca làm việc theo trình tự thời gian.
Các cụm từ phản ánh pain point có thể in đậm hoặc highlight để dễ nhận ra.
Không chen callout vào giữa đoạn văn.]

---

## Vấn đề phát sinh

[Callout / bảng phân tích các pain points trích xuất từ tường thuật,
kết nối với Pain Points trong Persona và Customer Pains trong Value Proposition Canvas.
Mỗi mục ghi rõ nhãn bằng chứng [F] / [S] / [A].]

---

## Nguồn bằng chứng

[Liệt kê các nguồn đã dùng: phỏng vấn nào, tổng hợp nào, giả định nào.]

---

*Dữ liệu số lượng đơn/giờ trong scenario là mô phỏng minh họa [A]*
```
