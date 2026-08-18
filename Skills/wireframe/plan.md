# Wireframe Generator - Plan

## Purpose

Tạo wireframe cho giao diện hỗ trợ nhân viên cửa hàng giặt ủi trong đồ án HCI. Wireframe này được xây dựng mô phỏng sát với thiết kế đã được định hình để hỗ trợ walkthrough trực quan. Mỗi giao diện phải liên kết trực tiếp với một vấn đề đã được xác thực của nhân viên và một tính năng trong Value Proposition. Tuyệt đối tuân thủ ý tưởng, bối cảnh và quy trình hoạt động của dự án.

## Use this skill when

- Người dùng muốn tạo mới hoặc cập nhật wireframe cho một màn hình cụ thể của đồ án.
- Đã có Persona, Value Proposition và ít nhất một Scenario (để hiểu bối cảnh tương tác).
- Người dùng cần deliverable **Wireframe** theo rubric môn HCI - FIT - HCMUS.
- Người dùng muốn kiểm thử ý tưởng thiết kế với luồng tương tác thực tế.
- **Không dùng skill này khi:** chưa rõ vấn đề người dùng cần giải quyết; giao diện tạo ra không liên kết được với bất kỳ pain point nào đã xác thực.

## Required inputs

- `outputs/Persona.md`: Goals, Behaviors, Pain Points, Needs của Persona chính (nhân viên giặt ủi).
- `outputs/value-proposition.md`: Danh sách các tính năng (Pain Relievers, Gain Creators) cần thiết kế giao diện.
- `outputs/scenario-1.md` hoặc `outputs/scenario-2.md`: Bối cảnh tình huống làm việc và các điểm tương tác cụ thể của nhân viên.
- (Tùy chọn) `outputs/storyboard.*`: Luồng tương tác tổng thể nếu đã có để giữ nhất quán.

## Output

Một file HTML độc lập (SPA), có thể mở trực tiếp trên trình duyệt bằng cách click đúp, gồm:

- **Thiết kế Low-Fidelity y hệt layout chuẩn:** Sử dụng ĐÚNG hệ thống CSS Variables (`--pu`, `--bg`, `--tx`, ...), cấu trúc lớp layout `.shell` > `.sidebar` & `.main` > `.pwrap` > `.page.on`, typography Inter siêu chi tiết (cỡ chữ 10px-26px tùy cấp độ).
- **Ít nhất 3 màn hình chính** được liên kết bằng điều hướng có thể click (chuyển đổi qua CSS class `.on` bằng JS thuần):
  - Màn hình 1: Dashboard tổng quan công việc (danh sách đơn hàng, trạng thái máy).
  - Màn hình 2: Chi tiết một đơn hàng / công việc (các bước xử lý, hành động tiếp theo).
  - Màn hình 3: Cập nhật trạng thái / xác nhận hoàn thành công đoạn.
  - (Mở rộng) Màn hình thông báo, phân công, hoặc lịch sử theo yêu cầu.
- **Mỗi màn hình** hiển thị rõ: trạng thái công việc, thời hạn / thời gian còn lại, người phụ trách, và hành động tiếp theo đề xuất.
- Lưu tại `outputs/wireframe.html`.

## Workflow

1. Đọc `AGENTS.md`, `plan.md` cấp project, `skills/wireframe/plan.md` (file này), Persona, Value Proposition và Scenario liên quan.
2. Xác định **vấn đề cụ thể** mà màn hình cần giải quyết (liên kết với pain point và tính năng nào trong Value Proposition).
3. Phác thảo nhanh (mental model): ai dùng màn hình này, đang làm gì, cần thấy thông tin gì đầu tiên, hành động chính là gì.
4. Đảm bảo tuân thủ các quy tắc thiết kế đặc thù cho môi trường giặt ủi:
   - Font Inter, kích thước text được tối ưu chính xác.
   - Các nút bấm (.bp, .bs, .by, .br), nhãn trạng thái sử dụng màu sắc đồng bộ (`--pu`, `--gn`, `--rd`).
   - Giao diện có bố cục card, list hoặc table để đọc lướt nhanh.
   - Ngôn ngữ thuật ngữ giặt ủi thực tế (không dùng Lorem Ipsum).
5. Kiểm tra điều hướng giữa các màn hình (hàm `go(id)` và class `.on`) hoạt động đúng khi mở trên trình duyệt.
6. So sánh giao diện với Scenario và Persona: mọi thông tin hiển thị phải có lý do từ bối cảnh công việc thực tế.
7. Lưu kết quả vào `outputs/wireframe.html`.

## Validation Checklist

Trước khi coi wireframe là hoàn thành, kiểm tra:

- [ ] Có ít nhất 3 màn hình có thể click-through bằng Vanilla JS (không cần server hay thư viện React/Vue).
- [ ] UI sử dụng kiến trúc CSS Variables và HTML cấu trúc CHÍNH XÁC như mẫu (`.shell`, `.sidebar`, `.main`, `.hero`, v.v.).
- [ ] Mỗi màn hình hiển thị đủ: trạng thái công việc, thời hạn, người phụ trách, hành động tiếp theo.
- [ ] Trạng thái quan trọng không chỉ phân biệt bằng màu sắc mà còn bằng Icon (SVG inline) hoặc Text.
- [ ] Font chữ Inter được phân cấp rõ ràng (10px đến 26px).
- [ ] Ngôn ngữ trong UI dùng thuật ngữ giặt ủi thực tế, không dùng placeholder.
- [ ] Mỗi màn hình liên kết được với ít nhất một pain point từ Persona hoặc Scenario.
- [ ] File mở được trực tiếp trên trình duyệt mà không bị lỗi.
- [ ] Thiết kế nhất quán với Scenario 2 (tương tác được cải thiện, không phải hiện trạng).
- [ ] KHÔNG làm thay đổi ý tưởng, bối cảnh, quy trình nghiệp vụ đã được xác định của Đồ án.
