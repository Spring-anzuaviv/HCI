# Persona Generator — Plan

_(Phần "phục vụ Agent": giúp Agent biết khi nào gọi skill này, nhận vào loại dữ liệu gì,
trả về loại dữ liệu gì. Phần lý luận/kiến thức chuyên sâu nằm ở `skills/persona/skill.md`.)_

## Purpose

Generate a user persona for the project (hệ thống hỗ trợ điều phối
công việc cho nhân viên vận hành cửa hàng giặt ủi) from user research findings.

## Use this skill when

- Người dùng muốn tạo mới hoặc cập nhật persona cho đồ án.
- Dữ liệu sẵn có gồm goals, tasks/behaviors, pain points, motivations/wishes, hoặc quotes thu thập được từ phỏng vấn/khảo sát nhân viên vận hành cửa hàng giặt ủi.
- Người dùng đã hoàn thành giai đoạn user discovery (đã có báo cáo phỏng vấn hoặc khảo sát) và muốn tổng hợp dữ liệu đó thành một persona.
- **Không dùng skill này khi:** dữ liệu đầu vào là ý tưởng tính năng/giải pháp thay vì dữ liệu về người dùng — trường hợp đó thuộc phạm vi skill Value Proposition, không phải Persona.

## Required inputs

Một hoặc nhiều trong số:

- Goals (mục tiêu công việc của người dùng)
- Tasks / Behaviors (cách người dùng đang vận hành công việc hiện tại)
- Pain Points (vấn đề, khó khăn thường gặp)
- Wishes / Motivations (mong muốn, định hướng nhu cầu)
- Quotes (câu nói nguyên văn từ phỏng vấn)
- Demographic information (tuổi, vai trò, số năm kinh nghiệm, quy mô cửa hàng)

Ràng buộc bắt buộc: input phải được gắn nhãn theo **nhóm người dùng** (ví dụ: "nhân viên tiệm giặt ủi quy mô lớn" vs. "chủ tiệm nhỏ tự vận hành") để skill lọc đúng phạm vi trước khi tổng hợp — xem quy tắc lọc trong `skills/persona/skill.md`.

## Output

Một persona hoàn chỉnh, dạng Markdown, lưu tại `templates/persona.md`, gồm: tên nhân vật đại diện, quote tiêu biểu, demographic & bối cảnh, goals, pains, behaviors, mức độ sẵn sàng với công nghệ, nhu cầu cốt lõi, và danh sách nguồn dữ liệu đã dùng — theo đúng template quy định trong `skills/persona/skill.md`.

## Workflow

1. Đọc toàn bộ dữ liệu user discovery hiện có (báo cáo tổng hợp + transcript phỏng vấn thô).
2. Lọc dữ liệu theo đúng nhóm người dùng mục tiêu đang cần dựng persona; loại các nguồn thuộc nhóm khác ra khỏi bước tổng hợp (giữ lại chỉ để đối chiếu nếu cần).
3. Áp dụng các quy tắc suy luận (Reasoning) và kiểm tra tính nhất quán (Validation) được định nghĩa trong `skills/persona/skill.md` để tổng hợp thành một nhân vật đại diện duy nhất.
4. Nếu dữ liệu không đủ hoặc phát sinh mâu thuẫn, áp dụng Failure handling trong `skills/persona/skill.md` thay vì tự suy diễn không có căn cứ.
5. Điền kết quả vào template persona chuẩn.
6. Xuất file `persona.md` ở định dạng Markdown vào thư mục templates
