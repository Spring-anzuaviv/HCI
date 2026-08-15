---
name: prototype-builder
description: Dùng để xây dựng Software Prototype (index.html) cho đồ án HCI, mô phỏng các tính năng giải quyết pain points của nhân viên giặt ủi (Hàng đợi thông minh, Cảnh báo trễ hẹn, Quản lý thông báo).
---

# Skill Prototype Builder

## Purpose
Tạo file HTML/CSS/JS thuần (vanilla) duy nhất đóng vai trò Software Prototype (Phase 4) cho đồ án HCI. 
Prototype tập trung giải quyết 3 pain points chính (P1, P3, P4) thông qua các tương tác:
- Giao diện Tổng quan (Dashboard) với cảnh báo nguy cơ trễ hẹn sớm (P3).
- Hàng đợi thông minh (Smart Queue) tự động sắp xếp đơn theo ETA và độ khẩn cấp (P1).
- Quản lý trạng thái thông báo Zalo cho khách hàng (P4).

## Use This Skill When
- Người dùng yêu cầu tạo hoặc cập nhật file `index.html` cho prototype HCI.
- Đã có Wireframe hoặc kịch bản tương tác (Scenario 2) và cần hiện thực hóa thành UI click được.
- Cần mô phỏng thuật toán hàng đợi (ETA vs Deadline) và theo dõi trạng thái đơn hàng.

## Required Inputs
- Các yêu cầu tính năng cụ thể hoặc phản hồi thay đổi UI từ người dùng.
- Bảng màu chuẩn: Primary teal (`#0891b2`), Warning amber (`#f59e0b`), Danger red (`#ef4444`), Success green (`#22c55e`).
- Ràng buộc: Không sử dụng thư viện bên thứ 3 (như React, Tailwind) để đảm bảo file chạy độc lập.

## Output
- File `index.html` duy nhất chứa toàn bộ HTML, CSS (mobile-first 390px, glassmorphism), và JS.
- Các hành động của người dùng (click, toggle) phải có visual feedback mượt mà (transition 0.3s).

## Domain Knowledge
- **Hàng đợi thông minh:** Tính toán thời gian cần thiết (ETA) dựa trên khối lượng (kg) và dịch vụ (Chỉ Giặt, Chỉ Sấy, Giặt + Sấy). Ưu tiên các đơn có `giờ hiện tại + ETA > giờ hẹn lấy` đưa vào nhóm "Nguy cơ trễ hẹn".
- **Bàn giao ca:** Tổng hợp dữ liệu các đơn Đang xử lý, Chờ xử lý để hiển thị thông tin tóm tắt cho ca sau.
- **Trạng thái quy trình:** Tiếp nhận -> Đang giặt -> Đang sấy -> Gấp đồ -> Gửi thông báo -> Hoàn tất.
- **Lưu ý:** Trang "Thống kê" không thuộc phạm vi Prototype này.

## Reasoning Rules
1. **Không dùng Framework:** Chỉ dùng HTML/CSS/JS thuần.
2. **Dữ liệu hardcode mô phỏng:** Dùng mảng dữ liệu tĩnh hoặc DOM tĩnh để mô phỏng (Nguyễn Minh Tuấn, Trần Thị Hoa, Đặng Quốc Anh...). Chú ý ghi rõ đây là dữ liệu mô phỏng, không gọi API thật.
3. **Cập nhật trạng thái đồng bộ:** Khi một đơn hàng thay đổi trạng thái (ví dụ: bấm "Gửi Zalo" cho Đặng Quốc Anh ở tab Thông báo), trạng thái đó phải được cập nhật đồng loạt ở UI tab Tổng quan, Hàng đợi và Bảng Đơn hàng bằng thao tác DOM.
4. **Phản hồi tương tác (Toast/Alert):** Bất kỳ hành động thay đổi trạng thái nào (Chuyển máy, Hoàn tất công đoạn, Gửi thông báo) đều phải kèm theo Toast thông báo thành công màu xanh lá ở cuối màn hình.
5. **Auto-Scroll:** Bổ sung tính năng điều hướng mượt mà, ví dụ click vào thẻ "Gửi thông báo" phải nhảy sang Tab Thông báo và cuộn lên đầu trang (`scrollTop = 0`).
