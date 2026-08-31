# Scenario 2 Generator — Plan

## Purpose

Generate Scenario 2 (hệ thống tương lai) cho đồ án HCI: mô tả tường thuật tình huống thực tế của nhân viên giặt ủi trong một ca làm việc điển hình, sau khi đã có hệ thống hỗ trợ. Scenario 2 phải đối chiếu trực tiếp với các pain points (P1, P2, P4) từ Scenario 1 và minh họa cách các tính năng mới (Tính năng 1, 2, 3) giúp giải quyết những khó khăn đó.

## Use this skill when

- Người dùng muốn tạo mới hoặc cập nhật Scenario 2.
- Đã có Scenario 1 (hệ thống hiện tại), Persona, và Value Proposition Canvas (phần Customer Gains/Gain Creators và Pain Relievers).
- Người dùng cần deliverable **Scenario 2** theo rubric môn HCI - FIT - HCMUS.
- **Không dùng skill này khi:** chưa có Scenario 1, chưa rõ các tính năng cải thiện là gì.

## Required inputs

- `outputs/scenario-1.md` hoặc `outputs/assets/scenario-1.png`: bối cảnh, các mốc thời gian và 4 pain points (P1–P4) hiện tại.
- `outputs/Persona.md`: Goals, Behaviors, Pain Points, Needs của Persona.
- `outputs/value-proposition.md`: các giải pháp (Pain Relievers, Gain Creators) tương ứng với 3 tính năng: (1) Hàng đợi công việc thông minh, (2) Kiểm tra tính khả thi giờ hẹn, (3) Thông báo khách khi đơn sẵn sàng.
- Cấu trúc và bối cảnh (phải giữ nguyên như Scenario 1): nhân vật, địa điểm, thời điểm, tình trạng ban đầu.

## Output

Một Scenario 2 hoàn chỉnh, dạng Markdown, gồm:

- Bối cảnh (Giữ nguyên từ Scenario 1).
- Tường thuật liền mạch ca làm việc với sự hỗ trợ của hệ thống mới, thể hiện sự cải thiện rõ rệt so với Scenario 1 đối với P1, P2, P4. Các tính năng bao gồm đề xuất ưu tiên, cảnh báo nguy cơ trễ hẹn và tính khả thi giờ nhận.
- Bảng phân tích sự thay đổi (Từ vấn đề P1-P4 ở Scenario 1 -> Tương tác mới -> Kết quả đạt được).
- Đánh dấu rõ các giải pháp thiết kế được áp dụng vào tường thuật.

## Workflow

1. Đọc `Agents.md`, `plan.md` cấp project, `skills/scenario-2/skill.md`, Persona và `outputs/scenario-1.md`.
2. Xác định các pain points (P1-P4) từ Scenario 1 và các tính năng giải quyết tương ứng từ Value Proposition.
3. Kế thừa bối cảnh của Scenario 1: cùng Persona, địa điểm, thời điểm, số lượng đơn chờ.
4. Viết tường thuật mới: theo sát các mốc thời gian của Scenario 1, nhưng thay vì gặp bế tắc, Persona sẽ sử dụng hệ thống mới để ra quyết định tốt hơn, xử lý nhanh hơn.
5. Ở mỗi điểm tương ứng với pain point của Scenario 1, mô tả hành động tương tác với hệ thống mới (tác nhân -> hành động -> phản hồi hệ thống -> quyết định của nhân viên). Không để hệ thống tự động quyết định thay người dùng.
6. Lập bảng so sánh (Traceability) giữa Scenario 1 và Scenario 2.
7. Kiểm tra output theo Validation Checklist trong `skills/scenario-2/skill.md` và `docs/Rubric.md`.
8. Lưu kết quả vào `outputs/scenario-2.md`.
