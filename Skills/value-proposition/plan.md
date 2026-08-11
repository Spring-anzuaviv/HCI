# Value Proposition Canvas — Plan

## Purpose

Generate a Value Proposition Canvas từ một Persona và dữ liệu user research, sau đó chuyển các goals, tasks, pain points và needs của Persona thành Customer Profile và Value Map.

## Use this skill when

- Người dùng muốn tạo mới hoặc cập nhật Value Proposition Canvas.
- Đã có Persona và muốn xác định Customer Jobs, Customer Pains và Customer Gains của Persona đó.
- Người dùng muốn phát triển hoặc kiểm tra Products & Services, Pain Relievers và Gain Creators.
- Người dùng muốn đánh giá một đề xuất tương tác có phù hợp với nhu cầu của người dùng không.
- Người dùng cần chuẩn bị deliverable **Value Proposition** theo rubric.
- **Không dùng skill này khi:** chưa có Persona hoặc dữ liệu về người dùng; input chỉ là danh sách tính năng mà chưa có bối cảnh và nhu cầu.

## Required inputs

Một hoặc nhiều trong số:

- Persona gồm background, goals, tasks, behaviors, pain points, motivations, wishes và quote.
- Phỏng vấn, quan sát, scenario, workflow hoặc ghi chú user research dùng để xây dựng Persona.
- Customer Jobs / Tasks / Behaviors đã được xác định.
- Customer Pains / Pain Points / Frustrations đã được xác định.
- Customer Gains / Needs / Wishes / Motivations đã được xác định.
- Danh sách Products & Services hoặc ý tưởng thiết kế cần kiểm tra.

Input cần có bối cảnh sử dụng và nhóm người dùng mục tiêu. Nếu thông tin là giả định hoặc dữ liệu mô phỏng, phải ghi rõ trong output.

## Output

Một Value Proposition Canvas hoàn chỉnh, dạng Markdown, gồm:

- Customer Segment và bối cảnh sử dụng.
- Customer Jobs.
- Customer Pains.
- Customer Gains.
- Products & Services.
- Pain Relievers.
- Gain Creators.
- FIT assessment.
- Assumptions, open questions và các khoảng trống cần kiểm chứng.

Output phải bắt đầu từ Persona, nhất quán với Persona và Scenario 1, đồng thời phù hợp với deliverable **Value Proposition** trong `docs/Rubric.md`. Kết luận chỉ nằm trong phạm vi problem-solution fit của prototype HCI.

## Workflow

1. Đọc `Agents.md`, `plan.md` cấp project, `skills/value-proposition/skill.md`, `rules/domain.md`, `docs/Rubric.md`, Persona và user research.
2. Đọc Persona trước, xác định bối cảnh sử dụng, goals, tasks, behaviors, pain points, motivations, wishes và kết quả mong muốn.
3. Xác định Customer Jobs từ các công việc Persona đang cố hoàn thành, vấn đề đang cố giải quyết hoặc nhu cầu đang cố đáp ứng; dùng các câu hỏi về công việc cốt lõi, task chiếm nhiều thời gian, kết quả cuối cùng và tiêu chí thành công.
4. Xác định Customer Pains từ các khó khăn, chi phí, rủi ro, trở ngại, sai sót và cảm xúc tiêu cực của Persona.
5. Xác định Customer Gains từ các lợi ích Persona mong đợi, mong muốn hoặc có thể thấy bất ngờ.
6. Kiểm tra Customer Profile có phản ánh đúng Persona và không biến tính năng thành job, pain hoặc gain.
7. Sau khi Customer Profile ổn định, lập Value Map gồm Products & Services, Pain Relievers và Gain Creators; không phân loại Products & Services theo loại hình.
8. Kiểm tra mỗi Pain có ít nhất 2 Pain Relievers khác nhau và mỗi Gain có ít nhất 2 Gain Creators khác nhau; mỗi giải pháp design phải có cơ chế riêng.
9. Đánh giá FIT bằng cách đối chiếu Customer Profile với Value Map.
10. Ghi rõ assumptions, open questions và giới hạn nếu Persona hoặc dữ liệu user research chưa đủ.
11. Điền kết quả theo các phần trong canvas vào file Markdown `value-proposition.md` và lưu vào   `/templates`
12. Kiểm tra output theo `skills/value-proposition/skill.md`, `rules/domain.md` và `docs/Rubric.md`.
