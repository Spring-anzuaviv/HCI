---
name: product-source
description: Lập kế hoạch và xây dựng software product React + Node.js/Express từ input Markdown và output wireframe/frontend của đồ án HCI.
---

# Skill Product Source

## Purpose

Biến nhu cầu và workflow đã được ghi nhận trong input thành một software
prototype có interaction thật. Skill giữ liên kết giữa vấn đề của nhân viên
giặt ủi, wireframe, React frontend, API, database và backend Express.

## Use This Skill When

- Xây dựng Software Product từ `inputs/*.md`.
- Đối chiếu hoặc hiện thực `outputs/wireframe.html` và
  `outputs/frontend.html`.
- Thiết kế API, ERD, DB hoặc workflow backend cho prototype.
- Cần phối hợp các skill chuyên biệt:
  - `skills/frontend-design/SKILL.md`: visual direction, component layout, responsive và
    accessibility cho React.
  - `skills/nodejs-backend-patterns/SKILL.md`: cấu trúc Express, middleware, validation,
    authentication, error handling và persistence.

Không gọi skill để bịa dữ liệu nghiên cứu, làm production deployment hoặc thay
thế hệ thống vận hành thương mại.

## Required Inputs

Ưu tiên đọc theo thứ tự:

1. `inputs/features.md`.
2. `outputs/system-spec.md` và các input domain.
3. `outputs/wireframe.html`.
4. `outputs/frontend.html` và source React thực tế trong `src/frontend`.
5. `src/frontend`, `src/backend`, `plan.md`, `inputs/Rubric.md` và `rules/*.md`.

Mỗi requirement cần ghi nguồn. Phân biệt finding, assumption, hypothesis,
simulated data và design decision.

## Reasoning / Inference Strategy

1. Bắt đầu từ actor, task, context và pain; không bắt đầu từ công nghệ.
2. Chuyển task thành interaction flow: start, action, feedback, decision, end.
3. Chuyển state và thông tin cần hiển thị thành frontend state/data contract.
4. Chuyển data contract thành entity và API, không để controller tự chứa domain logic.
5. Giữ scheduling/priority deterministic; recommendation phải có lý do và quyền
   xác nhận của nhân viên.
6. Preview/simulation không được ghi database; mutation phải có validation và
   conflict handling.
7. Protected API lấy ownership từ auth context, không tin `storeId` tùy ý trong body.
8. Khi reference và source mâu thuẫn, ưu tiên source đang chạy và ghi discrepancy.

## Output Format

### Product plan

Ghi scope, user workflow, capability, dependency, implementation order và criteria.

### Frontend

Ghi page/component, state, action, loading/empty/error/disabled/confirmation
states, API dependency và responsive/accessibility notes. Dùng
`skills/frontend-design/SKILL.md` khi thay đổi visual design đáng kể.

### Backend

Ghi route/controller/service/model, request/response, validation, auth boundary,
error code và side effect. Dùng `skills/nodejs-backend-patterns/SKILL.md`
khi viết Express code.

### Data artifacts

Nếu task yêu cầu, tạo `outputs/docs/erd.md`, `outputs/docs/db.md`,
`outputs/docs/api.md` sau khi workflow và state đã được xác định; không tạo
schema chỉ vì một UI label.

## Rules

- Không thêm feature không liên kết input hoặc deliverable.
- Không tự tạo user research, quote, số đo hoặc kết quả kiểm thử.
- Không dùng màu sắc làm kênh duy nhất cho trạng thái quan trọng.
- Không để frontend hiển thị dữ liệu giả như dữ liệu production.
- Không điều khiển máy thật; chỉ ghi nhận hành động xác nhận của nhân viên.
- Không để API cross-store hoặc bỏ qua validation workflow.
- Không dùng AI cho priority/scheduling nếu không có logic giải thích được.
- Giữ thay đổi nhỏ và bảo toàn code người dùng đã có.

## Validation Rules

- [ ] Requirement trace đến UI/API/data tồn tại.
- [ ] React build/lint đạt.
- [ ] Backend build/test đạt.
- [ ] API response và error envelope nhất quán.
- [ ] Loading, empty, error và success state được xử lý phù hợp.
- [ ] Auth/ownership và input validation được kiểm tra.
- [ ] Workflow chính có mutation thật, không chỉ mock click.
- [ ] Desktop/mobile và touch target được kiểm tra khi có UI change.
- [ ] Assumptions và giới hạn được ghi rõ.

## Failure Handling

- Thiếu input: ghi open question, không tự điền.
- Reference file không tồn tại: dùng file thực tế gần nhất và ghi rõ tên file.
- Mâu thuẫn requirement: giữ nguồn riêng, ưu tiên đặc tả mới nhất được xác nhận.
- Thiếu dữ liệu DB: trả trạng thái chưa đủ dữ liệu, không suy đoán an toàn.
- Workflow conflict: trả lỗi có mã, không ghi mutation một phần.
- Skill chuyên biệt không tồn tại: không giả vờ đã dùng; áp dụng phần hướng dẫn
  tối thiểu và ghi lại giới hạn.

## Boundaries

Skill này không thay thế phỏng vấn/quan sát, không đánh giá product-market fit,
không triển khai production, không tích hợp POS/thanh toán và không điều khiển
thiết bị giặt sấy thật.
