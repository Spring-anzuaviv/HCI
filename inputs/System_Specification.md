# Đặc tả hệ thống — Smart Work Queue

## 0. Phạm vi và nguyên tắc

Smart Work Queue giúp nhân viên biết đơn nào nên xử lý tiếp, máy nào phù hợp,
đơn có kịp giờ hẹn hay không và toàn bộ đơn trong cùng một lần nhận đã sẵn
sàng chưa.

Đây là prototype hỗ trợ quyết định. Hệ thống chỉ đề xuất; nhân viên vẫn kiểm
tra túi đồ và xác nhận trước khi đưa đồ vào máy. Hệ thống không điều khiển máy
giặt hoặc máy sấy thật.

Các quy tắc chính:

- Chỉ có hai loại máy: `WASHER` và `DRYER`.
- Một máy chỉ chạy một order stage trong một khoảng thời gian.
- Chỉ stage chạy máy được lưu trong `order_stages`.
- Sorting, transfer, packing không tạo record riêng; thời lượng của chúng được
  tính bởi scheduler.
- Lịch kế hoạch có thể thay đổi. Stage đã hoàn tất hoặc đang chạy không bị
  reschedule.
- Các order có cùng `groupCode` được xử lý riêng nhưng khách chỉ được báo lấy
  khi toàn bộ nhóm đã `READY`.

## 1. Mô hình nghiệp vụ

### 1.1. Loại dịch vụ

| Dịch vụ | Chuỗi xử lý | Stage chạy máy được lưu |
|---|---|---|
| `WASH` | phân loại → giặt → đóng gói | `WASH` trên `WASHER` |
| `DRY` | phân loại → sấy → đóng gói | `DRY` trên `DRYER` |
| `WASH_DRY` | phân loại → giặt → chuyển đồ → sấy → đóng gói | `WASH` trên `WASHER`, sau đó `DRY` trên `DRYER` |

Không có máy vừa giặt vừa sấy.

### 1.2. Dữ liệu order và quy ước tên

Thuật toán và API dùng tên camelCase của Prisma/API. Tên tiếng Việt chỉ là
nhãn nghiệp vụ tương ứng:

| API/Prisma | Cột database | Nhãn nghiệp vụ | Ý nghĩa |
|---|---|---|---|
| `readyAt` | `ready_at` | `gionhando` | Thời điểm dự kiến khách mang đồ tới; nếu walk-in dùng `createdAt` |
| `pickupAt` | `pickup_at` | `giohenlay` | Giờ khách muốn lấy; có thể rỗng |
| `estimatedAt` | `estimated_at` | `giodukien` | ETA hiện tại của order |
| `groupCode` | `group_code` | `manhom` | Liên kết các order của cùng một lần nhận; có thể rỗng |
| `serviceType` | `service_type` | Loại dịch vụ | `WASH`, `DRY` hoặc `WASH_DRY` |
| `weightKg` | `weight_kg` | Khối lượng | Khối lượng order |

Nếu một lần nhận phải tách đồ trắng/màu hoặc vượt sức chứa máy, nhân viên tạo
nhiều order và gán cùng một `groupCode`. Không dùng một order có khối lượng
vượt sức chứa rồi trông chờ scheduler tự chia mẻ.

### 1.3. Dữ liệu order stage

`OrderStage` là model Prisma của bảng database `order_stages`; quan hệ trên
`LaundryOrder` có tên `stages`. Đây là nguồn lịch duy nhất. Mỗi record có thể
là stage `WASH` hoặc `DRY`; `machineId` bắt buộc với hai stage này.
`machineId` chỉ nullable ở mức schema để giữ khả năng mở rộng, không được để
null khi tạo stage máy.

- `PLANNED`: có lịch nhưng chưa bắt đầu.
- `RUNNING`: nhân viên đã đưa đồ vào máy.
- `COMPLETED`: máy đã hoàn tất và nhân viên đã lấy đồ ra.
- `CANCELLED`: lịch không còn được sử dụng.
- `plannedStartAt`, `plannedEndAt`: thời gian scheduler đề xuất, có thể null
  trước khi order được lập lịch.
- `actualStartedAt`, `actualEndedAt`: thời gian thực tế; `actualStartedAt`
  bắt buộc khi `status = RUNNING`, `actualEndedAt` bắt buộc khi
  `status = COMPLETED`.

Sorting, transfer, packing và buffer không lưu thành stage; chúng chỉ là các
khoảng thời gian trong phép tính ETA.

## 2. Thuật toán dùng chung

Mọi use case phải gọi cùng các hàm scheduling service, không tự tính ETA hoặc
priority riêng trong controller.

### 2.1. Thời điểm bắt đầu

```text
readyTime = order.readyAt ?? order.createdAt
```

### 2.2. Thời lượng cấu hình

```text
SORTING_TIME  = 5 phút
TRANSFER_TIME = 5 phút
PACKING_TIME  = 10 phút
BUFFER_TIME   = 5 phút
```

Thời lượng giặt/sấy lấy từ `machine.processingMinutes` của máy được chọn.

### 2.3. Máy phù hợp

`findCompatibleMachines(order, stage)` chỉ trả về máy thỏa cả ba điều kiện:

```text
machine.type === requiredMachineType(stage)
machine.capacityKg >= order.weightKg
machine.status NOT IN (BROKEN, INACTIVE)
```

Máy có `status = RUNNING` vẫn là máy hoạt động và được đưa vào việc tìm slot;
chỉ máy `AVAILABLE` mới được chọn để bắt đầu stage ngay lập tức.

Ánh xạ:

```text
WASH -> WASHER
DRY  -> DRYER
```

### 2.4. Tìm slot sớm nhất

`findEarliestAvailableSlot(order, stage, machines, stages)` đọc các
`order_stages` của từng máy và tìm khoảng trống đủ dài cho một cycle.

- Stage `COMPLETED` không chiếm slot tương lai.
- Stage `RUNNING` chiếm slot từ `actualStartedAt` đến
  `actualStartedAt + machine.processingMinutes`.
- Stage `PLANNED` chiếm slot từ `plannedStartAt` đến `plannedEndAt`.
- Slot được chọn phải bắt đầu không sớm hơn thời điểm order sẵn sàng ở công
  đoạn đó.

Nếu nhiều máy phù hợp, chọn máy có thời điểm hoàn tất sớm nhất. Nếu bằng nhau,
chọn `machineId` nhỏ hơn để kết quả deterministic.

### 2.5. Tính ETA

`calculateETA()` thực hiện theo thứ tự:

1. Bắt đầu từ `readyTime`.
2. Cộng `SORTING_TIME`.
3. Tính stage máy đầu tiên còn lại.
4. Nếu stage đang `RUNNING`, giữ nguyên stage và dùng thời điểm kết thúc dự
   kiến từ `actualStartedAt + processingMinutes`.
5. Nếu stage là `PLANNED` và slot còn hợp lệ, giữ nguyên slot.
6. Nếu stage chưa có lịch hoặc slot không còn hợp lệ, gọi
   `findEarliestAvailableSlot()`.
7. Với `WASH_DRY`, sau khi giặt xong cộng `TRANSFER_TIME`, rồi lập lịch sấy.
8. Sau stage máy cuối cùng, cộng `PACKING_TIME` và `BUFFER_TIME`.

```text
estimatedAt = finishOfLastMachineStage + PACKING_TIME + BUFFER_TIME
```

Nếu order đang ở `FOLDING_PACKING`, không được lập thêm stage máy; ETA là
`max(now, thời điểm stage máy cuối hoàn tất) + PACKING_TIME + BUFFER_TIME`.
Nếu order đã `READY`, `estimatedAt` giữ nguyên và không tạo thêm stage máy.

ETA phải tính theo từng máy và từng khoảng trống, không được chỉ cộng một số
phút trễ chung cho mọi order.

### 2.6. Group ETA và deadline

Order không có `groupCode`:

```text
feasible = estimatedAt <= pickupAt
```

Các order có cùng `groupCode`:

```text
groupETA = MAX(estimatedAt của mọi order trong nhóm)
feasible = groupETA <= pickupAt
```

Không lấy trung bình ETA. Màn hình phải hiển thị cả `pickupAt` và `groupETA`
khi deadline không khả thi.

Nếu thiếu `pickupAt`, `estimatedAt` hoặc không đủ dữ liệu máy, kết quả là
`UNKNOWN`, không được tự động coi là an toàn. `AT_RISK` chỉ dùng khi ETA chưa
quá giờ hẹn nhưng slack nhỏ hơn hoặc bằng `RISK_THRESHOLD`; `NOT_FEASIBLE`
dùng khi ETA/groupETA đã vượt `pickupAt`.

Hàm dùng chung:

```text
findCompatibleMachines()
findEarliestAvailableSlot()
calculateETA()
calculateGroupETA()
checkDeadlineFeasibility()
generateSchedule()
recalculateSchedule()
simulateInsertion()
findBestInsertion()
getWorkQueue()
```

## 3. Luồng tổng thể

```text
Tạo order hoặc nhận thêm order trong cùng group
    ↓
Tạo schedule tạm trong memory
    ↓
Tính ETA từng order và groupETA
    ↓
Kiểm tra giờ hẹn
    ↓
Nhân viên xác nhận
    ↓
Lưu order và các planned order_stages
    ↓
Máy trống / lịch thực tế thay đổi
    ↓
Recalculate các stage chưa bắt đầu
    ↓
Smart Work Queue đề xuất việc tiếp theo
```

## 4. UC-SQ-01 — Xem hàng đợi và trạng thái vận hành

**Actor:** Nhân viên vận hành.

**Trigger:** Nhân viên đăng nhập, đổi ca hoặc mở màn hình Hàng đợi.

**Tiền điều kiện:** Nhân viên đã đăng nhập; cửa hàng có order và machine.

**Luồng cơ bản:**

1. Hệ thống đọc các machine của cửa hàng.
2. Hệ thống đọc order chưa `COMPLETED` và các `order_stages` liên quan.
3. Hệ thống hiển thị tên, loại, trạng thái và thời gian còn lại của từng máy.
4. Hệ thống xác định stage đang `RUNNING`, stage kế tiếp và ETA của từng order.
5. Hệ thống tính lại risk theo `estimatedAt` và `pickupAt`.
6. Nếu có máy `AVAILABLE` và có candidate phù hợp, hệ thống gọi
   `getWorkQueue()` ở chế độ Preview.
7. Hệ thống hiển thị đề xuất, lý do, các order có nguy cơ trễ và toàn bộ queue.
8. Nhân viên chọn việc muốn kiểm tra.

**Ngoại lệ:**

- Thiếu `pickupAt` hoặc dữ liệu máy: hiển thị "Chưa đủ dữ liệu để đánh giá
  giờ hẹn".
- Không có máy phù hợp: vẫn hiển thị order nhưng không tạo recommendation.
- Dữ liệu stage không khớp `LaundryOrder.status`: hiển thị "Cần kiểm tra" và
  không cho tự động bắt đầu stage đó.
- Không còn order cần xử lý: hiển thị "Hiện không có đơn cần xử lý".

Không có thay đổi database khi chỉ xem queue.

## 5. UC-SQ-02 — Xử lý máy hoàn tất

**Trigger:** Một `order_stage` ở trạng thái `RUNNING` đạt thời điểm kết thúc
dự kiến hoặc nhân viên xác nhận máy đã hoàn tất.

**Luồng cơ bản:**

1. Hệ thống thông báo máy và order cần lấy đồ.
2. Nhân viên xác nhận đã nhận việc.
3. Frontend hiển thị countdown 3 phút để lấy đồ; countdown không cần lưu DB.
4. Nhân viên lấy đồ và xác nhận hoàn tất.
5. Hệ thống cập nhật stage:

```text
actualEndedAt = thời điểm thực tế
status = COMPLETED
```

6. Máy chuyển thành `AVAILABLE` nếu không còn stage thực tế khác.
7. Với `WASH_DRY`, order chuyển sang chờ stage `DRY`.
8. Với `WASH` hoặc sau stage `DRY`, order chuyển sang `FOLDING_PACKING` hoặc
   `READY` theo quy ước workflow của prototype.
9. Hệ thống chạy `recalculateSchedule()` cho các stage chưa bắt đầu.
10. Hệ thống gọi `getWorkQueue()` để đề xuất việc tiếp theo.

Stage đã `COMPLETED` không bị đổi lịch. Nếu máy lỗi, không chuyển máy thành
`AVAILABLE` và không tự động lập lịch mới trên máy đó.

## 6. UC-SQ-03 — Đề xuất và bắt đầu order tiếp theo

**Trigger:** Một máy trở thành `AVAILABLE`, hoặc nhân viên mở queue khi máy đã
trống sẵn.

Hai chế độ dùng cùng thuật toán:

- **Preview:** chỉ trả recommendation, không ghi database.
- **Active:** sau khi nhân viên xác nhận và đưa đồ vào máy mới ghi stage thật.

### 6.1. Lọc candidate

Order là candidate khi:

```text
order chưa COMPLETED
stage kế tiếp cần đúng loại máy
weightKg <= machine.capacityKg
machine đang hoạt động và AVAILABLE
order không có stage khác đang RUNNING
```

Với `WASH_DRY`, order chỉ là candidate cho `DRYER` sau khi stage `WASH` đã
`COMPLETED` và transfer đã đủ thời gian.

### 6.2. Thứ tự đề xuất

Sau khi tính ETA, xếp theo thứ tự:

1. Order có nguy cơ trễ trước.
2. `pickupAt` gần hơn.
3. Còn nhiều stage máy hơn.
4. `createdAt` sớm hơn.
5. `orderId` nhỏ hơn để phá hòa.

Nếu thiếu deadline, order vẫn có thể được đề xuất nhưng phải ghi rõ lý do
"Chưa đủ dữ liệu để đánh giá nguy cơ trễ".

### 6.3. Luồng xác nhận

1. Hệ thống hiển thị candidate và 2–3 lý do dễ hiểu.
2. Nhân viên đối chiếu mã order với túi đồ.
3. Nhân viên có thể chọn order hợp lệ khác.
4. Nhân viên nhấn xác nhận và đưa đồ vào máy.
5. Hệ thống kiểm tra lại machine, capacity và trạng thái order.
6. Hệ thống tạo `order_stage`:

```text
stage = WASH hoặc DRY
machineId = máy được chọn
actualStartedAt = thời điểm xác nhận thực tế
status = RUNNING
```

7. Hệ thống cập nhật order thành `WASHING` hoặc `DRYING` và machine thành
   `RUNNING`.
8. Hệ thống tính lại queue và ETA.

Nếu máy không còn trống hoặc order đã được nhân viên khác nhận, thao tác bị
hủy và queue được tính lại. Nếu capacity không đủ, order tiếp tục `WAITING`;
prototype không tự chia order thành nhiều mẻ.

## 7. UC-SQ-04 — Ưu tiên thủ công và đôn order

**Trigger:** Khách yêu cầu giờ lấy sớm hơn hoặc nhân viên muốn thử một vị trí
ưu tiên khác.

### 7.1. Simulation

Hệ thống không ghi database khi nhân viên mới nhập yêu cầu. Quy trình là:

```text
Lịch hiện tại
  ↓
Clone dữ liệu trong memory
  ↓
Chèn order hoặc thay đổi pickupAt trong bản clone
  ↓
simulateInsertion()
  ↓
Tính lại ETA từng order và groupETA
  ↓
So sánh deadline và delay
```

Các vị trí chèn được thử lần lượt trong queue hiện tại. Chọn phương án theo
thứ tự:

1. Ít order bị trễ nhất.
2. Tổng số phút trễ thấp nhất.
3. Đáp ứng giờ hẹn của order mới.
4. Gây ít delay cho các order khác.
5. Hoàn thành order mới sớm hơn.

### 7.2. Xác nhận

1. Nhân viên nhập `newPickupAt`.
2. Hệ thống trả ETA mới, groupETA, danh sách order bị ảnh hưởng và lý do.
3. Nhân viên chọn "Giữ nguyên" hoặc "Xác nhận đôn order".
4. Nếu giữ nguyên, bỏ bản simulation.
5. Nếu xác nhận, cập nhật `pickupAt` và chạy `recalculateSchedule()` thật.
6. Nếu có order khác bị trễ, hệ thống phải cảnh báo trước khi xác nhận.

Việc đôn order không tự tạo stage đang chạy và không thay đổi stage đã hoàn
tất/đang chạy.

## 8. Reschedule khi lịch thực tế thay đổi

Các trigger gồm máy bắt đầu/kết thúc trễ, máy hỏng, order mới, khách đến trễ,
đổi giờ hẹn hoặc nhân viên xác nhận đôn order.

`recalculateSchedule()` thực hiện:

1. Đọc trạng thái thực tế của machine và `order_stages`.
2. Khóa các stage `COMPLETED` và `RUNNING`.
3. Hủy hoặc bỏ qua các slot `PLANNED` cũ chưa bắt đầu trong bản tính lại.
4. Lập lại slot cho các stage chưa bắt đầu theo từng machine.
5. Tính lại ETA từng order.
6. Tính lại `groupETA` cho mọi group bị ảnh hưởng.
7. Cập nhật risk, queue và lý do recommendation.

Không cộng một khoản delay cố định vào toàn bộ order vì mỗi order có thể dùng
máy khác nhau.

## 9. Thông báo và bàn giao

`groupCode = NULL`:

- Thông báo khi chính order đạt `READY`.

`groupCode` có giá trị:

- Chưa thông báo khi chỉ một order đạt `READY`.
- Chỉ thông báo khi tất cả order cùng `groupCode` đạt `READY`.
- Thời điểm sẵn sàng của nhóm là `groupETA = MAX(estimatedAt)`.

Màn hình handover đọc order chưa `COMPLETED`, stage hiện tại, machine, pickup,
ETA, risk và next action. Notification preview phải áp dụng cùng quy tắc nhóm.

## 10. Tiêu chí chấp nhận

- Không gán order `WASH` vào `DRYER` hoặc ngược lại.
- Không gán order vượt `capacityKg`.
- Không có hai planned/running stage chồng thời gian trên một máy.
- ETA có xét hàng đợi máy, stage `WASH_DRY`, sorting, transfer, packing và
  buffer.
- ETA nhóm luôn là giá trị lớn nhất của các ETA thành viên.
- Simulation không thay đổi database.
- Reschedule không đổi stage đã hoàn tất hoặc đang chạy.
- Recommendation có lý do và luôn yêu cầu nhân viên xác nhận.
- Order cùng nhóm chỉ tạo một thông báo khi toàn bộ nhóm `READY`.

## 11. Ngoài phạm vi prototype

- Điều khiển máy giặt/máy sấy thật.
- Tự động chia một order thành nhiều order.
- Gửi Zalo production.
- Lưu lịch sử expedite/audit riêng.
- Lưu từng stage thủ công vào database.
- Tối ưu lịch bằng AI hoặc thuật toán không deterministic.
