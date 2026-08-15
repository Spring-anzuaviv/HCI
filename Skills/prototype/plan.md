# Kế hoạch Hiện thực Software Prototype (WashTrack)

## 1. Context & Goal
Mục tiêu của kế hoạch này là hiện thực hóa Scenario 2 và Wireframe thành một Software Prototype (dạng Single Page Application) tại Phase 4 của dự án.
Prototype này đóng vai trò là một minh chứng (proof of concept) trực quan, có thể tương tác được để đánh giá các giải pháp nhằm giải quyết 3 pain points chính của nhân viên giặt ủi:
- **P1 (Hàng đợi thủ công) & P3 (Phát hiện trễ muộn):** Giải quyết bằng tính năng **Hàng đợi thông minh** & **Cảnh báo nguy cơ trễ hẹn**.
- **P4 (Thông báo thủ công):** Giải quyết bằng **Màn hình quản lý Thông báo** liên kết trạng thái toàn hệ thống.

## 2. Technical Stack & Ràng buộc
- **Frontend:** Vanilla HTML5, CSS3, JavaScript. Không sử dụng thư viện/framework (React, Vue, Tailwind) để đảm bảo toàn bộ hệ thống được đóng gói nhẹ nhàng trong file `index.html`.
- **Giao diện:** Mobile-first (390px), phong cách UI bo góc (border-radius 16px), glassmorphism cho Header.
- **Dữ liệu:** Hardcode tĩnh (Mô phỏng dữ liệu của các đơn: Lê Văn Nam, Trần Thị Hoa, Đặng Quốc Anh...).

## 3. Implementation Steps

### Bước 1: Khởi tạo Base UI & Navigation
- Tạo khung container giới hạn kích thước mobile, căn giữa màn hình PC.
- Thiết lập CSS Variables (Màu chủ đạo, Kích thước chuẩn).
- Xây dựng thanh điều hướng (Bottom Navigation Bar) cố định ở đáy, gồm 4 tab chính: Tổng quan, Hàng đợi, Đơn hàng, Thông báo. Tab Bàn giao ca là tùy chọn mở rộng.
- Cài đặt hàm `go(pageId)` trong JS để xử lý việc chuyển trang bằng cách ẩn/hiện các div nội dung.

### Bước 2: Thiết kế Giao diện Tổng quan (Dashboard)
- **Header:** Hiển thị giờ hệ thống lấy theo múi giờ `Asia/Ho_Chi_Minh` để đồng bộ thời gian thực.
- **Thanh trạng thái máy:** Hiển thị các khối máy 1, 2, 3 với các trạng thái Trống, Đang giặt, Đang sấy. Tích hợp thanh process (circular progress bar) cho các máy đang chạy.
- **Cảnh báo đỏ (Proactive Alert):** Banner hiển thị ngay đầu trang khi có đơn nguy cơ trễ hẹn (có nút bấm nhảy sang tab Hàng đợi).
- **Hàng đợi thông minh:** Đề xuất đơn cần xử lý ngay dựa trên sự trống của máy (Ví dụ: Máy 2 trống -> Đề xuất đơn Lê Văn Nam).

### Bước 3: Phân luồng Hàng đợi (Smart Queue)
- Phân tích và nhóm các đơn hàng:
  - **Nhóm 1 (Đơn có nguy cơ trễ hẹn):** Đưa Trần Thị Hoa và Lê Văn Nam vào nhóm cảnh báo viền đỏ. Cấu trúc HTML cố định Trần Thị Hoa ở trên Lê Văn Nam (do cần thời gian xử lý dài hơn).
  - **Nhóm 2 (Toàn bộ hàng đợi):** Danh sách các đơn còn lại chờ xử lý.

### Bước 4: Bảng Đơn hàng & Quản lý Thông báo
- **Tab Đơn hàng:** Bảng table hiển thị chi tiết (Tên, Dịch vụ, Khối lượng, Trạng thái). Cập nhật badge (span class="tb-st") với màu sắc tương ứng.
- **Tab Thông báo:** Tạo khu vực "Đã hoàn tất – cần thông báo".
- **Liên kết trạng thái:** Khi bấm "Gửi Zalo" ở đơn Đặng Quốc Anh:
  - Thẻ của Đặng Quốc Anh mờ đi và di chuyển xuống mục "Đã thông báo".
  - Script JS tự động truy vấn (`getElementById`) các thẻ badge của Đặng Quốc Anh ở Tab Tổng quan, Hàng đợi, Đơn hàng và chuyển từ trạng thái màu vàng "Gửi thông báo" sang màu xanh "Hoàn tất".

### Bước 5: Bottom Sheet & Chi tiết đơn
- Xây dựng modal (BottomSheet) trượt từ dưới lên cho Chi tiết đơn hàng (`openOM(name, ...)`).
- Vẽ thanh tiến trình 5 bước (Tiếp nhận -> Đang giặt -> Đang sấy -> Gấp đồ -> Gửi thông báo).
- Bổ sung khối "Còn ~X phút" cho các đơn Đang chạy máy, chú thích rõ "Hết đếm ngược, hệ thống sẽ tự động chuyển qua công đoạn tiếp theo".
- Thiết lập nút "Hoàn tất công đoạn" phục vụ trường hợp cần thao tác manual.

## 4. Verification Plan
- Chạy thử `index.html` trực tiếp trên trình duyệt.
- **Walkthrough kịch bản:**
  - Kịch bản 1: Mở app -> Bấm vào cảnh báo đỏ -> Chuyển đến Hàng đợi -> Kiểm tra Trần Thị Hoa nằm trên Lê Văn Nam.
  - Kịch bản 2: Bấm vào đơn Đặng Quốc Anh (Đang ở trạng thái Gửi thông báo) -> Chuyển đến trang Thông báo (scroll lên đầu) -> Bấm Gửi Zalo -> Qua bảng Đơn hàng kiểm tra lại thấy đã thành Hoàn tất.
  - Kịch bản 3: Bấm vào đơn Nguyễn Minh Tuấn -> Popup đẩy lên, kiểm tra xem có dòng "Còn ~X phút Giặt" không.
- Xác nhận không có lỗi hiển thị tràn màn hình hoặc bể layout ở kích thước cửa sổ 390px.
