# Thiết kế UC-SQ-01 — Xem hàng đợi và trạng thái vận hành

## 1. Mục tiêu và phạm vi

Triển khai end-to-end UC-SQ-01 trên backend Node.js/Express/Prisma và frontend React hiện có. Nhân viên vận hành có thể xem trạng thái máy, lịch công đoạn hiện tại, ETA, rủi ro deadline, danh sách cần chú ý và đề xuất công việc tiếp theo có giải thích.

UC này chỉ đọc dữ liệu. Việc mở màn hình, tải lại hàng đợi hoặc xem đề xuất không được thay đổi database, không tự bắt đầu công đoạn và không điều khiển máy thật.

Thiết kế giữ nguyên ngôn ngữ trực quan hiện tại. Chỉ điều chỉnh hoặc thêm thành phần khi cần để hiển thị đúng trạng thái trong đặc tả.

## 2. Vấn đề người dùng và deliverable

- Người dùng chính: nhân viên giặt ủi trực tiếp, gồm cả nhân viên mới và có kinh nghiệm.
- Vấn đề: khó biết việc nào cần làm tiếp, thông tin máy và đơn bị phân tán, khó hiểu lý do ưu tiên và khó phát hiện lịch mâu thuẫn.
- Deliverable được hỗ trợ: Software Product; đồng thời giữ nhất quán với Prototype và Wireframe hiện có.
- Dữ liệu máy, order, stage và deadline trong môi trường chạy là dữ liệu prototype/mô phỏng, không phải bằng chứng nghiên cứu người dùng.

## 3. Nguyên tắc nghiệp vụ

1. `order_stages` là nguồn lịch duy nhất.
2. Chế độ xem queue chỉ đọc các stage hiện tại; không gọi logic tạo lịch mới để thay thế thứ tự đã lưu.
3. Stage máy chỉ gồm `WASH` trên `WASHER` và `DRY` trên `DRYER`.
4. Đề xuất chỉ được đánh dấu có thể bắt đầu khi máy `AVAILABLE`, stage `PLANNED`, máy đúng loại/đủ sức chứa, order không có stage khác `RUNNING` và các stage trước đã hoàn tất.
5. Nếu `OrderStage.status = RUNNING` nhưng `LaundryOrder.status` không khớp, trả `NEEDS_REVIEW` và không dùng order để tạo recommendation.
6. Nếu thiếu `pickupAt` hoặc `estimatedAt`, risk là `UNKNOWN` và chỉ rõ field còn thiếu.
7. Recommendation phải có lý do dễ hiểu và luôn được trình bày là đề xuất cần nhân viên xác nhận ở use case bắt đầu stage sau này.

## 4. Kiến trúc backend

Queue service dựng projection thuần đọc từ orders, `order_stages` và machines. Service không gọi `generateSchedule()` và không ghi Prisma.

`GET /stores/:storeId/queue` trả:

```text
generatedAt
recommendation nullable
recommendations[]
items[]
attentionItems[]
summary
```

Mỗi item gồm rank, order/customer, trạng thái hiện tại, stage/máy kế tiếp, ETA, deadline, risk, field thiếu, lý do ưu tiên, trạng thái kiểm tra và khả năng recommendation.

`GET /stores/:storeId/machines` giữ field máy hiện có và bổ sung `currentStage`, `nextPlannedStage`, `timeLeft`, `operationalState` và lý do cần kiểm tra.

Dashboard dùng cùng queue projection để không hiển thị một đề xuất khác với trang Hàng đợi.

## 5. Luồng dữ liệu frontend

1. Sau khi xác thực store, frontend tải song song orders, machines và queue.
2. `AppContext` lưu riêng loading, error và queue snapshot.
3. Trang Hàng đợi dùng recommendation/rank từ backend, không lấy order đầu tiên trong mảng.
4. Panel máy dùng dữ liệu backend và số order chờ thật.
5. Nhân viên có thể mở chi tiết order ở chế độ chỉ đọc; UC-SQ-01 không gửi lệnh bắt đầu/hoàn tất stage.
6. Không tạo màn hình bàn giao riêng; màn hình vận hành hiện tại phục vụ cả lúc đăng nhập và đổi ca.

## 6. Trạng thái giao diện

- Loading: “Đang tải trạng thái vận hành”.
- Error: thông báo lỗi và nút “Thử lại”.
- Không có order: “Hiện không có đơn cần xử lý.”
- Không có máy trống: không hiển thị recommendation, vẫn hiển thị máy/cảnh báo/queue.
- Không có order rủi ro: không hiển thị khu vực cảnh báo.
- Thiếu deadline/ETA: chỉ rõ `pickupAt` hoặc `estimatedAt` còn thiếu.
- Mâu thuẫn RUNNING/order status: “Trạng thái cần kiểm tra” và “Không dùng để đề xuất”.

Ý nghĩa quan trọng luôn có nhãn chữ hoặc icon, không chỉ dùng màu.

## 7. Kiểm thử và tiêu chí chấp nhận

- Unit test candidate hợp lệ, không máy trống, không rủi ro, queue rỗng, field thiếu và trạng thái mâu thuẫn.
- Không đề xuất sai loại máy hoặc vượt capacity.
- Queue đọc đúng planned stage hiện tại và không thay đổi input/database.
- Backend build/test thành công; frontend build/lint thành công.
- Walkthrough trình duyệt khi môi trường database và DevTools khả dụng.

## 8. Ngoài phạm vi

- Bắt đầu/hoàn tất stage và countdown lấy đồ.
- Đôn order, simulation và reschedule thật.
- Gửi thông báo khách.
- Thiết kế lại toàn bộ giao diện.
