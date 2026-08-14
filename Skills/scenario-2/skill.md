---
name: scenario-2
description: Dùng để viết Scenario 2 (hệ thống tương lai) cho đồ án HCI — mô tả tường thuật ca làm việc sau khi có hệ thống hỗ trợ, đối chiếu trực tiếp với Scenario 1 để làm nổi bật cách các tính năng mới giải quyết 4 pain points (P1–P4).
---

# Skill Scenario 2 — Hệ thống tương lai

## Purpose

Tạo hoặc cập nhật Scenario 2 dựa trên Scenario 1 hiện có, thể hiện rõ cách các giải pháp thiết kế giúp giải quyết các pain points (P1-P4) đã được xác định.

Skill này giúp Agent:
- Kế thừa bối cảnh chuẩn từ Scenario 1.
- Xây dựng cốt truyện đối chiếu 1-1 với các tình huống khó khăn ở Scenario 1.
- Thể hiện sự tương tác giữa nhân viên và hệ thống (hệ thống hỗ trợ, nhân viên ra quyết định).
- Tránh việc biến Scenario thành bản liệt kê tính năng hoặc tài liệu hướng dẫn sử dụng (User Manual).

## Use This Skill When

- Cần tạo hoặc cập nhật Scenario 2.
- Đã hoàn thiện Scenario 1 và Value Proposition (đặc biệt là phần Pain Relievers và Gain Creators).

## Required Inputs

- `outputs/scenario-1.md` / `outputs/assets/scenario-1.png`: Nguồn chuẩn về bối cảnh, số mốc thời gian và pain points cần nối tiếp.
- `outputs/Persona.md`: Chuẩn về Persona, goals, needs và quyền kiểm soát.
- `outputs/value-proposition.md`: Chuẩn về mapping pain/need; đặc biệt các giải pháp tương ứng với Tính năng 1, 3, 4.

## Output

Đầu ra mặc định là một tài liệu Markdown gồm:

1. Bối cảnh tình huống (Giữ nguyên y hệt Scenario 1).
2. Đoạn văn/các khung tường thuật kể lại ca làm việc với sự hỗ trợ của hệ thống mới.
3. Bảng Traceability đối chiếu Vấn đề (Scenario 1) -> Tương tác mới -> Kết quả đạt được -> Goal.

## Domain Knowledge

### Tương tác giữa Người và Hệ thống trong Scenario 2

- **Người dùng giữ quyền kiểm soát:** Hệ thống đưa ra thông tin, đề xuất, cảnh báo (ví dụ: tính khả thi, đơn khẩn, nguy cơ trễ), nhưng **nhân viên là người ra quyết định cuối cùng**.
- **Không phải tài liệu hướng dẫn sử dụng:** Đừng viết kiểu "Nhấn nút A, màn hình chuyển sang B". Hãy viết theo ngôn ngữ tự nhiên: "Mai Anh kiểm tra tính khả thi trên màn hình trước khi xác nhận giờ lấy đồ với khách".
- **Cấu trúc của một tình huống có hệ thống hỗ trợ:**
  1. Tác nhân (khách hỏi, máy trống, cảnh báo hiện).
  2. Hành động của nhân viên.
  3. Phản hồi hỗ trợ từ hệ thống.
  4. Quyết định/xác nhận của nhân viên.
  5. Trạng thái kết thúc.

### Tính liên tục (Continuity) với Scenario 1

- Phải sử dụng cùng một bối cảnh (cùng ngày, giờ, số lượng máy, số lượng đơn) để so sánh hiệu quả.
- Nếu Scenario 1 có 5 mốc thời gian khó khăn, Scenario 2 cũng nên đi qua các mốc đó để thấy sự cải thiện. Có thể thêm mốc cuối ca để minh họa việc bàn giao (nếu là mục tiêu được chọn).

## Reasoning Rules

1. **Khớp bối cảnh:** Sao chép chính xác bối cảnh (Persona, thời gian, địa điểm, tình trạng ban đầu) từ Scenario 1.
2. **Đối chiếu trực tiếp:** Mỗi pain point (P1-P4) trong Scenario 1 phải có một tình huống tương ứng trong Scenario 2 thể hiện cách giải quyết.
3. **Chỉ minh họa các tính năng trong phạm vi (1, 3, 4):**
   - Hàng đợi công việc thông minh (giải quyết P1, P3).
   - Kiểm tra tính khả thi giờ hẹn (giải quyết P2).
   - Cập nhật tiến trình và thông báo (giải quyết P4).
   - Không sáng tạo thêm tính năng như robot tự giặt, máy tự xếp đồ.
4. **Không nói quá (No overclaiming):** Tránh khẳng định hệ thống giúp tăng doanh thu 300% hay giảm 100% lỗi. Chỉ mô tả nhân viên làm việc trôi chảy hơn, có thông tin rõ ràng hơn.

## Validation Checklist

Trước khi xuất output, kiểm tra:

- [ ] Bối cảnh có giống hệt Scenario 1 không?
- [ ] Các tình huống có tương ứng với P1-P4 từ Scenario 1 không?
- [ ] Người dùng có giữ quyền ra quyết định không (thay vì hệ thống tự động làm hết)?
- [ ] Tường thuật có tự nhiên, tránh giống tài liệu hướng dẫn sử dụng không?
- [ ] Có bảng Traceability (Scenario 1 -> Scenario 2) ở cuối không?

## Failure Handling

- **Scenario 2 biến thành danh sách tính năng:** Viết lại mỗi mục theo chủ thể hành động là nhân viên (Mai Anh). Bổ sung tác nhân và quyết định.
- **Hệ thống tự động quyết định thay nhân viên:** Sửa lại để hệ thống chỉ "đề xuất", "cảnh báo", còn nhân viên "kiểm tra", "xác nhận", "quyết định".
- **Khác bối cảnh với Scenario 1:** Quay lại sao chép đúng bối cảnh ban đầu.
- **Giải quyết các pain points ngoài phạm vi:** Loại bỏ các tính năng không thuộc phạm vi đồ án.

## Scenario 2 Template

```markdown
# Scenario 2 — Hệ thống tương lai

> **[Tiêu đề ngắn gọn mô tả sự cải thiện]**

[Một câu mô tả tổng quan về ca làm việc với sự hỗ trợ của hệ thống mới.]

---

## Bối cảnh (Kế thừa từ Scenario 1)

| | |
|---|---|
|  **Persona** | [Giống Scenario 1] |
|  **Địa điểm** | [Giống Scenario 1] |
|  **Thời điểm** | [Giống Scenario 1] |
|  **Tình trạng ban đầu** | [Giống Scenario 1] |

---

## Diễn biến ca làm việc với hệ thống mới

[Tường thuật hoặc chia theo các khung thời gian tương ứng với Scenario 1. Mỗi mốc mô tả: Tác nhân -> Hành động nhân viên -> Hỗ trợ của hệ thống -> Quyết định/Kết thúc]

---

## Traceability: Scenario 1 → Scenario 2

| Vấn đề trong Scenario 1 (P1-P4) | Tương tác mới (Giải pháp) | Kết quả đạt được | Goal |
|---|---|---|---|
| [P1...] | [...] | [...] | [...] |
| [P2...] | [...] | [...] | [...] |
| [P3...] | [...] | [...] | [...] |
| [P4...] | [...] | [...] | [...] |

```
