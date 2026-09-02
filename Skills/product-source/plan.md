# Product Source — Plan

## Purpose

Chuyển các yêu cầu trong `inputs/*.md` và interaction reference trong
`outputs/wireframe.html`, `outputs/frontend.html` thành kế hoạch xây dựng
software product cho đồ án HCI. Product gồm React frontend và Node.js/Express
backend, tập trung vào workflow hỗ trợ nhân viên giặt ủi biết việc tiếp theo,
hiểu trạng thái đơn và phối hợp khi bàn giao.

## Use this skill when

- Cần lập kế hoạch hoặc triển khai software product từ các input Markdown.
- Cần đối chiếu React UI với wireframe/frontend reference.
- Cần thiết kế backend Express, dữ liệu, API và workflow trước khi code.
- Cần tạo hoặc cập nhật các deliverable Software Product, Wireframe và Prototype.

Không dùng skill này để tạo finding nghiên cứu, thay thế POS, điều khiển máy
giặt/sấy thật hoặc thêm tính năng không truy nguyên được về input.

## Required inputs

- `outputs/features.md`.
- Các tài liệu liên quan trong `inputs/`.
- `outputs/wireframe.html`.
- `outputs/frontend.html`. 
- Source hiện tại trong `src/frontend` và `src/backend`.
- `plan.md`, `inputs/Rubric.md`, `rules/*.md` và skill liên quan.

## Output

Kế hoạch implementation gồm:

- Phạm vi và capability được truy nguyên từ input.
- Interaction flow từ hành động nhân viên đến phản hồi và trạng thái kết thúc.
- React pages/components, state và API integration.
- Node.js/Express routes, controllers, services, validation và errors.
- Entity/data contract.
- Test/build/verification checklist và assumptions.

## Workflow

1. Đọc `plan.md`, input Markdown, output HTML và source hiện tại.
2. Lập bảng trace `input → vấn đề → interaction → frontend → API/data`.
3. Xác định capability tối thiểu; loại bỏ feature không có liên kết.
4. Chọn UI structure theo `outputs/wireframe.html`; dùng
   `skills/frontend-design/SKILL.md` khi
   cần tạo hoặc chỉnh visual language, responsive layout và accessibility của
   React frontend.
5. Xác định entity, state transition và API contract trước khi viết backend.
6. Dùng `skills/nodejs-backend-patterns/SKILL.md` khi tạo hoặc chỉnh Express app, middleware,
   validation, error handling, authentication và persistence.
7. Tách domain logic khỏi controller; logic ưu tiên/schedule phải deterministic,
   dễ giải thích và có thể test.
8. Code theo từng vertical slice nhỏ: UI action, API, service, database.
9. Kiểm tra loading, empty, error, disabled, confirmation và completion state.
10. Chạy test/build; kiểm tra responsive và walkthrough frontend nếu có browser.
11. Ghi rõ bằng chứng, giả định, dữ liệu mô phỏng, giới hạn và phần chưa làm.

## Success criteria

- Mỗi implementation item liên kết ít nhất một input hoặc deliverable.
- Frontend giữ nhất quán với wireframe/reference và dùng ngôn ngữ phù hợp nhân viên.
- Backend có API contract rõ, ownership/auth đúng và lỗi nhất quán.
- Workflow chính hoạt động từ đầu đến cuối, không chỉ là màn hình tĩnh.
- Không mô tả prototype như production hoặc tích hợp thiết bị thật.

## Verification

- `npm run build` cho frontend và backend.
- Test domain/workflow và validation API.
- Kiểm tra thủ công desktop, tablet, mobile khi có thay đổi UI.
- Đối chiếu API calls/types giữa React và Express.
- Kiểm tra `git diff` chỉ gồm file thuộc task; không commit nếu chưa được yêu cầu.

## Assumptions and limits

- Dữ liệu là mock/seed của prototype, không dùng dữ liệu cá nhân thật.
- PostgreSQL/Supabase chỉ dùng khi stack hiện tại đã hỗ trợ.
- Notification, reminder hoặc machine integration chỉ là mô phỏng nếu input không
  yêu cầu persistence/provider thật.
