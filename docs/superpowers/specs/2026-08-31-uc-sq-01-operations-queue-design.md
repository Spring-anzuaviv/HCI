# Thiết kế UC-SQ-01 — Xem hàng đợi và trạng thái vận hành

## 1. Mục tiêu và phạm vi

Triển khai end-to-end UC-SQ-01 trên backend Node.js/Express/Prisma và frontend React hiện có. Giao diện hiện tại được giữ lại; chỉ bổ sung dữ liệu và trạng thái còn thiếu để nhân viên có thể xem máy, hàng đợi, rủi ro và đề xuất xử lý tiếp.

UC này là luồng chỉ đọc. Việc mở trang Hàng đợi, tải trạng thái vận hành hoặc mở chi tiết order không được thay đổi database và không tự bắt đầu stage.

Deliverable được hỗ trợ: **Software Product**.

## 2. Vấn đề người dùng được hỗ trợ

- Nhân viên khó biết việc nào nên làm tiếp khi nhiều order cùng cạnh tranh sự chú ý.
- Thông tin máy, stage, deadline và hành động tiếp theo đang phân tán.
- Nhân viên cần hiểu lý do của đề xuất và vẫn giữ quyền quyết định.

Các dữ liệu trong database và seed là dữ liệu mô phỏng; thiết kế không giả định đây là kết quả nghiên cứu người dùng mới.

## 3. Kiến trúc và ranh giới

### Backend

- `OrderStage` tiếp tục là nguồn lịch duy nhất.
- Dịch vụ queue chỉ đọc các stage `PLANNED`, `RUNNING` và `COMPLETED` hiện có; không gọi logic tạo một thứ tự xử lý khác với lịch đã lưu.
- Dịch vụ kiểm tra tính hợp lệ của candidate: đúng loại máy, đủ sức chứa, máy hoạt động, máy đang trống, order chưa hoàn tất, không có stage khác đang chạy và các stage trước đã hoàn tất.
- Dịch vụ máy trả stage đang chạy, thời gian còn lại và stage planned tiếp theo.
- Dashboard lấy `nextTask` và danh sách cần chú ý từ cùng logic queue/risk để tránh hai màn hình hiển thị thứ tự khác nhau.

### Frontend

- `AppContext` tải orders, machines và queue từ API sau khi xác thực.
- `QueuePage` dùng thứ hạng backend thay vì lấy order đầu tiên trong danh sách order.
- `RightPanel` dùng số lượng order đang chờ thật và trạng thái máy thật.
- Giữ bố cục, màu sắc và component hiện tại; bổ sung loading, error, empty, unknown và inconsistent states.

## 4. Contract dữ liệu

Mỗi queue item cung cấp tối thiểu:

- `rank`, `orderId`, customer và trạng thái order;
- `nextStage`, `machineId`, tên máy;
- `plannedStartAt`, `plannedEndAt`;
- `estimatedAt`, `groupETA`, `pickupAt`;
- `riskLevel`, `priorityReason`, `reasons`, `nextAction`;
- `canStart` và `needsReview`.

Mỗi machine item cung cấp:

- thông tin máy và trạng thái hiện tại;
- `currentStage` cùng `timeLeft`;
- `nextPlannedStage` nếu có.

Các field hiện hữu được giữ lại khi có thể để không phá frontend đang hoạt động.

## 5. Luồng dữ liệu và tương tác

1. Nhân viên mở trang Hàng đợi.
2. Frontend hiển thị loading và gọi orders, machines, queue.
3. Backend đọc snapshot hiện tại từ database, kiểm tra schedule và tính risk từ ETA/deadline hiện có.
4. Backend xếp hạng theo đặc tả: risk, deadline, số stage còn lại, thời điểm tạo và order ID.
5. Backend chỉ đánh dấu recommendation có thể bắt đầu khi candidate phù hợp với máy `AVAILABLE`; recommendation luôn có lý do và cần nhân viên xác nhận trong use case bắt đầu stage riêng.
6. Frontend hiển thị đề xuất, máy, order cần chú ý và toàn bộ queue.
7. Nhân viên có thể mở chi tiết order; thao tác xem không ghi database.

## 6. Trạng thái và xử lý lỗi

- Không có order: “Hiện không có đơn cần xử lý”.
- Thiếu deadline/ETA: `UNKNOWN` và “Chưa đủ dữ liệu để đánh giá giờ hẹn”.
- Không có máy phù hợp: vẫn hiển thị order nhưng không cho hiểu nhầm là có thể bắt đầu.
- Stage và trạng thái order mâu thuẫn: `needsReview = true`, hiển thị “Cần kiểm tra”.
- API lỗi: giữ màn hình ổn định, hiển thị lỗi và nút tải lại.
- Dữ liệu đang tải: hiển thị trạng thái loading, không hiển thị dữ liệu cũ như snapshot mới.

## 7. Kiểm thử và tiêu chí thành công

- Unit test logic queue bằng dữ liệu thuần, bao gồm thứ hạng, candidate hợp lệ, thiếu deadline, máy không phù hợp và stage mâu thuẫn.
- Kiểm tra API không thực hiện mutation khi xem queue.
- Backend TypeScript build thành công.
- Frontend lint và build thành công.
- Walkthrough trình duyệt xác nhận loading, dữ liệu thường, empty/error và khả năng đọc ở giao diện hiện có.
- Không có recommendation trái với `order_stages` đã lưu.
- Mọi recommendation hiển thị lý do và không tự bắt đầu stage.

## 8. Ngoài phạm vi

- Bắt đầu hoặc hoàn tất stage.
- Reschedule và ghi planned schedule mới.
- Đôn order và xác nhận simulation.
- Gửi thông báo khách.
- Thay đổi schema database nếu contract hiện tại đã đủ cho UC-SQ-01.
