# Kế hoạch Hiện thực Wireframe (Đổ màu sắc)

## 1. Context & Goal
Mục tiêu của kế hoạch này là hiện thực hóa giao diện dưới dạng Wireframe.
Trong quy trình học của chúng ta, **Wireframe là bản thiết kế ĐỨNG SAU Prototype**. Nó là phiên bản được đắp màu sắc và chi tiết UI gần hơn với giao diện cuối cùng, nhưng vẫn được làm "xấu hơn" (ít bóng bẩy hơn, thiết kế phẳng hơn) so với giao diện chốt cuối (frontend) để người dùng tập trung đánh giá tính năng thay vì quá sa đà vào tính thẩm mỹ.

## 2. Technical Stack & Ràng buộc
- **Frontend:** Vanilla HTML5, CSS3, JavaScript. Tuyệt đối không dùng thư viện/framework (React, Tailwind) để đảm bảo hệ thống độc lập.
- **Giao diện:** Medium/High-Fidelity. Có sử dụng bảng màu thương hiệu (Teal, Amber, Red, Green) nhưng loại bỏ các hiệu ứng phức tạp (như đổ bóng sâu, glassmorphism, gradient phức tạp) để giữ tính chất của một Wireframe.
- **Dữ liệu:** Dữ liệu cứng (hardcode) mô phỏng chân thực các ca kiểm thử.

## 3. Implementation Steps

### Bước 1: Kế thừa từ Prototype
- Lấy bộ khung cấu trúc (skeleton) từ bước Prototype trước đó.
- Thay thế các khối xám bằng mã màu thực tế (`#0891b2`, `#ef4444`, v.v.).

### Bước 2: Bổ sung chi tiết UI
- Áp dụng font chữ chuẩn (Inter) với các kích cỡ (typography) phân cấp rõ ràng hơn.
- Thiết lập lại các viền (border) và nút bấm (buttons) cho rõ ràng, loại bỏ góc bo tròn quá lớn (dùng border-radius: 4px thay vì 16px).

### Bước 3: Hiện thực Logic Tương tác (Javascript)
- Tích hợp logic Đôn đơn: Cập nhật Giờ hẹn lấy = Dự kiến xong khi bấm xử lý đơn "Nguy cơ trễ".
- Viết Javascript mô phỏng trạng thái Đang giặt / Đang sấy và đếm ngược thời gian.

## 4. Output
- File lưu tại: `outputs/prototype/wireframe.html` (Bản Wireframe có màu, bám sát giao diện cuối nhưng thiết kế phẳng và thô hơn).
