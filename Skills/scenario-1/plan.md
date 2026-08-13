# Scenario 1 Generator — Plan

## Purpose

Generate Scenario 1 (hệ thống hiện tại) cho đồ án HCI: mô tả tường thuật tình huống thực tế của nhân viên giặt ủi trong một ca làm việc điển hình, trước khi có hệ thống hỗ trợ, làm nổi bật các pain points đã xác định từ Persona và Value Proposition Canvas.

## Use this skill when

- Người dùng muốn tạo mới hoặc cập nhật Scenario 1.
- Đã có Persona và Value Proposition Canvas và muốn mô tả lại quy trình làm việc hiện tại dưới dạng tường thuật.
- Người dùng cần deliverable **Scenario 1** theo rubric môn HCI - FIT - HCMUS.
- **Không dùng skill này khi:** chưa có Persona hoặc Value Proposition Canvas; hoặc khi cần viết Scenario 2 (hệ thống tương lai sau khi có giải pháp thiết kế) — đó là skill riêng.

## Required inputs

Một hoặc nhiều trong số:

- Persona hoàn chỉnh (background, goals, tasks, behaviors, pain points, motivations, wishes, quote).
- Value Proposition Canvas (Customer Jobs, Customer Pains, Customer Gains, Pain Relievers).
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

1. Đọc `Agents.md`, `plan.md` cấp project, `skills/scenario-1/skill.md`, `docs/Rubric.md`, Persona, Value Proposition Canvas và kết quả phỏng vấn.
2. Xác định bối cảnh tình huống: ai (Persona), ở đâu, khi nào, tình trạng ban đầu như thế nào.
3. Xác định chuỗi hành động trong ca làm việc điển hình, dựa trên Tasks và Behaviors của Persona, có căn cứ từ phỏng vấn.
4. Viết đoạn văn tường thuật liền mạch: kể theo trình tự thời gian, tập trung vào hành động của người dùng, dùng ngôn ngữ tự nhiên gần với ngôn ngữ người dùng dùng trong phỏng vấn.
5. Xác định các điểm trong tường thuật có Pain Point phát sinh — đánh dấu và kết nối với Pain Points trong Persona.
6. Viết phần phân tích pain points dạng callout bên ngoài tường thuật (không chen vào giữa đoạn văn chính).
7. Gắn nhãn bằng chứng [F] / [S] / [A] cho từng nội dung.
8. Kiểm tra output theo `skills/scenario-1/skill.md` và `docs/Rubric.md`.
9. Lưu kết quả vào `docs/scenario-1.md` và `templates/assets/scenario-1.html`.
