# Laundry Scheduling & ETA Requirements

Implement hệ thống lập lịch cho cửa hàng giặt sấy để:

- Xác định đơn chạy máy nào và thời gian nào.
- Tính `giodukien` cho từng đơn.
- Kiểm tra `giohenlay` có khả thi không.
- Tính lại lịch và ETA khi có thay đổi.
- Hiển thị Smart Work Queue để nhân viên biết việc tiếp theo cần làm.

## Quy tắc nghiệp vụ

Cửa hàng chỉ có 2 loại máy:

```text
WASHER = máy giặt
DRYER  = máy sấy
```

Mỗi máy chỉ làm một chức năng.

Dịch vụ:

```text
WASH
→ WASHER
→ đóng gói

DRY
→ DRYER
→ đóng gói

WASH_DRY
→ WASHER
→ chuyển đồ
→ DRYER
→ đóng gói
```

Không tồn tại máy vừa giặt vừa sấy.

Máy được chọn phải:

```text
- đúng loại
- đủ sức chứa: machine.sokg >= order.khoiluong
- đang hoạt động
```

Một máy không được chạy hai đơn trong cùng một khoảng thời gian.

## Tính lịch và ETA

Thời điểm bắt đầu xét đơn:

```text
readyTime = gionhando ?? ngaytao_dh
```

Nếu khách đặt trước, `gionhando` là thời điểm dự kiến mang đồ tới.

Nếu khách walk-in:

```text
gionhando ≈ ngaytao_dh
```

Với mỗi công đoạn:

1. Tìm tất cả máy phù hợp.
2. Đọc `LICHCHAYMAY` của từng máy.
3. Tìm khoảng trống sớm nhất đủ dài cho một cycle.
4. Chọn máy có thể hoàn thành công đoạn sớm nhất.
5. Tiếp tục tính công đoạn sau từ thời điểm công đoạn trước hoàn thành.

Có thể dùng các config:

```text
SORTING_TIME  = 5 phút
TRANSFER_TIME = 5 phút
PACKING_TIME  = 10 phút
BUFFER_TIME   = 5 phút
```

Ví dụ:

```text
14:00 nhận đồ
14:00–14:05 phân loại

14:10–14:40
WASHER 2

14:40–14:45
chuyển đồ

14:50–15:15
DRYER 1

15:15–15:25
đóng gói

+ buffer 5 phút

giodukien = 15:30
```

Nếu có `giohenlay`:

```text
giodukien <= giohenlay
→ khả thi

giodukien > giohenlay
→ không khả thi
```

## Khi lịch thực tế thay đổi

Schedule chỉ là kế hoạch.

Nếu máy bắt đầu trễ, kết thúc trễ/sớm, máy hỏng, có đơn mới, khách đến trễ, đổi giờ hẹn hoặc nhân viên muốn đôn đơn thì phải chạy lại scheduling.

Không thay đổi:

```text
- công đoạn đã hoàn tất
- công đoạn đang chạy
```

Chỉ tính lại các công đoạn chưa bắt đầu.

Không được đơn giản cộng số phút trễ vào tất cả ETA, vì các đơn có thể chạy trên những máy khác nhau.

Ví dụ:

```text
Washer 1:
A 14:00–14:30
B 14:30–15:00
C 15:00–15:30
```

Nếu A thực tế kết thúc 14:45:

```text
A 14:00–14:45
B 14:45–15:15
C 15:15–15:45
```

Sau đó tiếp tục tìm lại lịch sấy của B, C và tính lại `giodukien`.

## Đơn mới hoặc đôn đơn

Không thay đổi DB ngay.

Hãy tạo schedule tạm trong memory và thử các vị trí khả thi.

Ví dụ hiện tại:

```text
A → B → C
```

Có đơn X:

```text
A → X → B → C
A → B → X → C
A → B → C → X
```

Với mỗi phương án:

```text
- tính lại lịch các công đoạn
- tính ETA mới
- kiểm tra giờ hẹn của các đơn bị ảnh hưởng
```

Ưu tiên phương án:

```text
1. Làm ít đơn bị trễ nhất.
2. Tổng số phút trễ thấp nhất.
3. Đáp ứng giờ hẹn của đơn mới.
4. Gây ít delay cho các đơn khác.
5. Hoàn thành đơn mới sớm hơn.
```

Nếu việc đôn đơn làm đơn khác trễ, chỉ cảnh báo và để nhân viên xác nhận trước khi áp dụng.

## Smart Work Queue

Smart Work Queue đọc từ schedule hiện tại.

Ví dụ:

```text
Washer 1

14:00–14:30 #101
14:30–15:00 #103
```

Lúc Washer 1 sắp trống:

```text
Tiếp theo:
Đơn #103
Công đoạn: WASH
Máy: Washer 1
Dự kiến bắt đầu: 14:30
```

Hệ thống chỉ đề xuất. Nhân viên phải xác nhận khi thực sự đưa đồ vào máy.

## Database

Agent được phép chỉnh sửa database nếu schema hiện tại chưa đủ để implement đúng nghiệp vụ.

Trước khi sửa:

```text
1. Kiểm tra schema hiện tại.
2. Chỉ thêm/sửa field hoặc table thật sự cần thiết.
3. Không thay đổi những phần không liên quan.
4. Tạo migration rõ ràng.
5. Cập nhật Prisma/schema/types/API liên quan sau migration.
```

Đặc biệt kiểm tra DB có đủ dữ liệu để lưu:

```text
- thời điểm đơn sẵn sàng: gionhando
- giờ khách muốn lấy: giohenlay nullable
- ETA hiện tại: giodukien
- loại máy WASHER / DRYER
- capacity của máy
- thời gian chạy máy
- lịch chạy từng máy
- trạng thái planned / running / completed nếu cần phân biệt lịch dự kiến và thực tế
```

Nếu `LICHCHAYMAY` hiện tại không đủ để phân biệt lịch dự kiến với công đoạn đang chạy/thực tế, hãy chỉnh schema theo cách đơn giản nhất để hỗ trợ việc reschedule.

## Các service/function chính

```text
findCompatibleMachines()
findEarliestAvailableSlot()
calculateETA()
generateSchedule()
recalculateSchedule()
simulateInsertion()
findBestInsertion()
getWorkQueue()
```

Tách scheduling logic khỏi controller.

Ưu tiên implementation đơn giản, deterministic, dễ test và dễ giải thích cho người dùng.