# Hướng dẫn thao tác Prototype WashTrack (Dành cho Nhóm)

Chào mọi người, đây là tài liệu hướng dẫn các chức năng và kịch bản (scenario) có trong file `index.html`. Mọi người đọc kỹ để biết luồng đi và biết bấm vào đâu để ra kết quả gì nhé!

> **Lưu ý quan trọng:** Tab **Thống kê** hiện tại chưa được triển khai, mọi người cứ lờ nó đi xem như không tồn tại nhé.

---

## 1. Màn hình Tổng quan (Trang chủ / Khởi động)
Đây là màn hình đầu tiên hiển thị khi mở app.
- **Header:** Hiển thị giờ hệ thống thực tế và thông tin ca làm việc (Ca chiều · Mai Anh).
- **Trạng thái máy (Vuốt ngang được):** 
  - Máy 1, Máy 2 đang chạy hiển thị thanh process tròn đếm ngược.
  - Máy 3 hiển thị nút **"Chuyển ngay"** (Mô phỏng máy giặt xong cần chuyển sang sấy). *Bấm thử nút "Chuyển ngay" sẽ hiện thông báo toast màu xanh và Máy 3 chuyển về trạng thái Trống.*
- **Cảnh báo đỏ (Quan trọng):** Phía dưới trạng thái máy có dòng cảnh báo "2 đơn có nguy cơ không kịp giờ hẹn". Bấm vào nút **"Xem ngay"** ở đây sẽ tự động nhảy sang tab Hàng đợi.
- **Hàng đợi thông minh:** Đề xuất đơn hàng tối ưu nhất để xử lý tiếp theo.
- **Danh sách đơn hàng hôm nay:** Các đơn được sắp xếp theo mức độ cấp bách. Đơn có cảnh báo đỏ, đơn đang chạy máy và đơn chờ được phân màu rõ rệt.

## 2. Kịch bản "Xem Chi Tiết Đơn Hàng" (Bottom Sheet)
Bấm vào bất kỳ đơn hàng nào trong các danh sách (Tổng quan, Hàng đợi, Đơn hàng) đều sẽ trượt lên một Popup (Bottom sheet) chi tiết đơn:
- **Tiến trình 5 bước:** Trực quan hóa đơn hàng đang ở công đoạn nào (Tiếp nhận -> Đang giặt -> Đang sấy -> Gấp đồ -> Gửi thông báo).
- **Với đơn đang chạy máy (VD: Nguyễn Minh Tuấn):** Sẽ có một thẻ thông báo màu xanh lá cây với biểu tượng đồng hồ báo: **"Còn ~X phút Giặt/Sấy. Hết đếm ngược, hệ thống sẽ tự động chuyển qua công đoạn tiếp theo."**
- Nút **"Hoàn tất công đoạn"**: Dành cho nhân viên muốn chuyển bước thủ công. (Đã bỏ nút Đôn đơn để tránh rối).
- **Với đơn có nguy cơ trễ (Trần Thị Hoa, Lê Văn Nam):** Trong popup sẽ có cảnh báo đỏ to đùng báo độ chênh lệch thời gian dự kiến và giờ hẹn.

## 3. Tab Hàng đợi (Biểu tượng List)
Tập trung vào giải quyết pain point "tính toán ưu tiên":
- **Đề xuất máy trống:** Báo máy 2 vừa trống, đề xuất Lê Văn Nam vào xử lý ngay.
- **Đơn có nguy cơ trễ hẹn (Cảnh báo đỏ):** Hai đơn là Trần Thị Hoa (ưu tiên số 1 vì cần đến 85 phút) và Lê Văn Nam (ưu tiên 2). Thuật toán (ảo) đã đẩy Trần Thị Hoa lên trên Lê Văn Nam.
- **Toàn bộ hàng đợi:** Liệt kê các đơn còn lại.
- Bấm vào đơn **Đặng Quốc Anh** (có nhãn màu vàng Gửi thông báo) -> Hệ thống sẽ văng ngay sang tab Thông báo và tự động cuộn lên đầu.

## 4. Tab Đơn hàng (Biểu tượng Clipboard)
- Hiển thị toàn bộ dưới dạng Bảng. (Mô phỏng bộ lọc Tất cả / Đang xử lý / Hoàn tất).
- Trạng thái **"Gửi thông báo"** của Đặng Quốc Anh không bị xuống dòng lộn xộn.
- Nhấp vào các dòng để mở chi tiết đơn hàng tương tự các màn hình khác.
- Tương tự Tab Hàng Đợi, bấm vào đơn Đặng Quốc Anh cũng sẽ tự động chuyển sang trang Thông báo.

## 5. Tab Thông báo (Biểu tượng Chuông)
Đây là màn hình giải quyết việc theo dõi đã báo khách hay chưa:
- Có một thẻ của Đặng Quốc Anh ở trạng thái "Đã hoàn tất - cần thông báo". Kèm theo mẫu câu chat có sẵn.
- **Hành động (Click):** Bấm vào nút **"Gửi Zalo"**.
- **Kết quả:** Thẻ của Đặng Quốc Anh sẽ mờ đi, biến mất, và lập tức chuyển xuống nhóm "Đã thông báo" kèm thời gian báo. *Đồng thời, trên toàn bộ các trang khác (Tổng quan, Đơn hàng, Hàng đợi), trạng thái của Đặng Quốc Anh sẽ tự động đổi thành "Hoàn tất ✓" màu xanh lá.*

## 6. Tab Bàn giao (Biểu tượng Xoay vòng)
Mô phỏng chức năng kết thúc ca chiều:
- Hệ thống tự tổng hợp có bao nhiêu đơn đang xử lý, bao nhiêu đơn chờ, và trạng thái các máy để ca tối vào là đọc hiểu ngay, không cần bàn giao miệng hay viết giấy.
- Có ô điền ghi chú. Bấm "Hoàn tất bàn giao" sẽ hiện Modal thành công.

---
**Các bạn cứ bấm thử thoải mái nhé. Giao diện được thiết kế để flow tự nhiên nhất!**
