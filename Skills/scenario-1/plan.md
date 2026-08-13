# Scenario 1 Generator — Plan

## Purpose

Generate Scenario 1 (hệ thống hiện tại) cho đồ án HCI: mô tả tường thuật tình huống thực tế của nhân viên giặt ủi trong một ca làm việc điển hình, trước khi có hệ thống hỗ trợ, làm nổi bật **đúng 4 pain points (P1–P4) đã xác định** tương ứng với **3 tính năng nhóm sẽ thiết kế (Tính năng 1, 3, 4)**.

Không lấy toàn bộ Customer Pains từ Value Proposition Canvas. Chỉ sử dụng phần pain points đã được lọc ra theo phạm vi dự án.

## Use this skill when

- Người dùng muốn tạo mới hoặc cập nhật Scenario 1.
- Đã có Persona và Value Proposition Canvas và muốn mô tả lại quy trình làm việc hiện tại dưới dạng tường thuật.
- Người dùng cần deliverable **Scenario 1** theo rubric môn HCI - FIT - HCMUS.
- **Không dùng skill này khi:** chưa có Persona hoặc Value Proposition Canvas; hoặc khi cần viết Scenario 2 (hệ thống tương lai sau khi có giải pháp thiết kế) — đó là skill riêng.

## Required inputs

Một hoặc nhiều trong số:

- Persona hoàn chỉnh (background, goals, tasks, behaviors, pain points, motivations, wishes, quote).
- Value Proposition Canvas — **chỉ đọc phần Customer Pains tương ứng với 3 tính năng nhóm làm** (Tính năng 1, 3, 4); bỏ qua các pains thuộc Tính năng 2 hoặc ngoài phạm vi.
- Kết quả phỏng vấn / quan sát người dùng thực tế.
- Bối cảnh cụ thể: địa điểm, thời điểm, tình trạng ban đầu (số đơn, máy đang chạy, v.v.).

## Output

Một Scenario 1 hoàn chỉnh, dạng Markdown, gồm:

- Bối cảnh (Persona, địa điểm, thời điểm, tình trạng ban đầu).
- Một đoạn văn tường thuật liền mạch kể lại toàn bộ ca làm việc.
- Các pain points được trích xuất từ tường thuật, kết nối rõ ràng với Persona và Value Proposition Canvas.
- Nhãn bằng chứng [F] / [S] / [A] cho từng nội dung.

Output phải nhất quán với Persona và Value Proposition Canvas, đồng thời phù hợp với deliverable **Scenario 1** trong `docs/Rubric.md`.

## Workflow

1. Đọc `Agents.md`, `plan.md` cấp project, `skills/scenario-1/skill.md`, `docs/Rubric.md`, Persona và kết quả phỏng vấn.
2. **Xác nhận phạm vi pain points:** Đọc bảng **Phạm vi Pain Points của Dự án** trong `skill.md`. Chỉ đưa P1–P4 vào tường thuật — không lấy thêm pain point từ Value Proposition Canvas.
3. Xác định bối cảnh tình huống: ai (Persona), ở đâu, khi nào, tình trạng ban đầu như thế nào.
4. Xác định chuỗi hành động trong ca làm việc điển hình, dựa trên Tasks và Behaviors của Persona, có căn cứ từ phỏng vấn.
5. Viết đoạn văn tường thuật liền mạch: kể theo trình tự thời gian, tập trung vào hành động của người dùng, dùng ngôn ngữ tự nhiên gần với ngôn ngữ người dùng dùng trong phỏng vấn.
6. Xác định các điểm trong tường thuật có Pain Point phát sinh — chỉ đánh dấu các mức P1, P2, P3, P4; bỏ qua các pain points ngoài phạm vi dù xuất hiện trong phỏng vấn.
7. Viết phần phân tích pain points dạng callout bên ngoài tường thuật (không chen vào giữa đoạn văn chính). Mỗi mục ghi rõ tính năng sẽ giải quyết.
8. Gắn nhãn bằng chứng [F] / [S] / [A] cho từng nội dung.
9. Kiểm tra output theo Validation Checklist trong `skills/scenario-1/skill.md` và `docs/Rubric.md`.
10. Lưu kết quả vào `docs/scenario-1.md` và `templates/assets/scenario-1.html`.
