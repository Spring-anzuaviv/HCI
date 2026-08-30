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
- Tất cả stage `SORTING`, `WASH`, `TRANSFER`, `DRY`, `PACKING` đều được lưu
  trong `order_stages`.
- `machineId` là `null` với stage thủ công; thời lượng của stage thủ công lấy
  từ cấu hình scheduler.
- Lịch kế hoạch có thể thay đổi. Stage đã hoàn tất hoặc đang chạy không bị
  reschedule.
- Các order có cùng `groupCode` được xử lý riêng nhưng khách chỉ được báo lấy
  khi toàn bộ nhóm đã `READY`.

## 1. Mô hình nghiệp vụ

### 1.1. Loại dịch vụ

| Dịch vụ | Chuỗi xử lý | Stage được lưu |
|---|---|---|
| `WASH` | phân loại → giặt → đóng gói | `SORTING`, `WASH` trên `WASHER`, `PACKING` |
| `DRY` | phân loại → sấy → đóng gói | `SORTING`, `DRY` trên `DRYER`, `PACKING` |
| `WASH_DRY` | phân loại → giặt → chuyển đồ → sấy → đóng gói | `SORTING`, `WASH` trên `WASHER`, `TRANSFER`, `DRY` trên `DRYER`, `PACKING` |

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

Tất cả order có cùng `groupCode` phải dùng cùng một `pickupAt`. Nếu nhân viên
đổi giờ hẹn của một order trong nhóm, hệ thống áp dụng `pickupAt` mới cho toàn
bộ order cùng `groupCode` để tránh một nhóm có nhiều giờ lấy khác nhau.

### 1.3. Dữ liệu order stage

`OrderStage` là model Prisma của bảng database `order_stages`; quan hệ trên
`LaundryOrder` có tên `stages`. Đây là nguồn lịch duy nhất. Các stage hợp lệ
là `SORTING`, `WASH`, `TRANSFER`, `DRY`, `PACKING`.

- `machineId` bắt buộc với `WASH` và `DRY`.
- `machineId` phải là `null` với `SORTING`, `TRANSFER` và `PACKING`.

- `PLANNED`: có lịch nhưng chưa bắt đầu.
- `RUNNING`: nhân viên đã đưa đồ vào máy.
- `COMPLETED`: máy đã hoàn tất và nhân viên đã lấy đồ ra.
- `CANCELLED`: lịch không còn được sử dụng.
- `plannedStartAt`, `plannedEndAt`: thời gian scheduler đề xuất, có thể null
  trước khi order được lập lịch.
- `actualStartedAt`, `actualEndedAt`: thời gian thực tế; `actualStartedAt`
  bắt buộc khi `status = RUNNING`, `actualEndedAt` bắt buộc khi
  `status = COMPLETED`.

Sorting, transfer và packing được lưu thành stage. `BUFFER_TIME` chỉ là khoảng
dự phòng sau khi `PACKING` hoàn tất và không tạo stage riêng.

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
2. Lập hoặc đọc stage `SORTING`.
3. Tính stage máy đầu tiên còn lại.
4. Nếu stage đang `RUNNING`, giữ nguyên stage và dùng thời điểm kết thúc dự
   kiến từ `actualStartedAt + processingMinutes`.
5. Nếu stage là `PLANNED` và slot còn hợp lệ, giữ nguyên slot.
6. Nếu stage chưa có lịch hoặc slot không còn hợp lệ, gọi
   `findEarliestAvailableSlot()`.
7. Với `WASH_DRY`, lập hoặc đọc stage `TRANSFER`, rồi lập lịch `DRY` sau khi
   transfer hoàn tất.
8. Lập hoặc đọc stage `PACKING` sau stage máy cuối cùng.
9. Cộng `BUFFER_TIME` sau khi `PACKING` hoàn tất.

```text
estimatedAt = packingStage.plannedEndAt + BUFFER_TIME
```

Nếu order đang ở `FOLDING_PACKING`, không được lập thêm stage máy; hệ thống đọc
stage `PACKING` và tính ETA từ `packingStage.plannedEndAt + BUFFER_TIME`.
Nếu order đã `READY`, `estimatedAt` giữ nguyên và không tạo thêm stage máy.

ETA phải tính theo từng máy và từng khoảng trống, không được chỉ cộng một số
phút trễ chung cho mọi order.

### 2.6. Group ETA và deadline

Order không có `groupCode`:

```text
feasible = estimatedAt <= pickupAt
```

Các order có cùng `groupCode` dùng chung một `pickupAt`:

```text
groupETA = MAX(estimatedAt của mọi order trong nhóm)
feasible = groupETA <= pickupAt chung của nhóm
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
7. Với `WASH_DRY`, sau khi `WASH` hoàn tất, order tiếp tục qua `TRANSFER` rồi
   chờ stage `DRY` theo schedule.
8. Với `WASH`, hoặc sau khi `DRY` cuối cùng hoàn tất, order chuyển sang
   `FOLDING_PACKING` và xử lý stage `PACKING`.
9. Chỉ khi stage `PACKING` đạt `COMPLETED` thì order mới chuyển sang `READY`.
10. Hệ thống chạy `recalculateSchedule()` cho các stage chưa bắt đầu.
11. Hệ thống gọi `getWorkQueue()` để đề xuất việc tiếp theo.

Stage đã `COMPLETED` không bị đổi lịch. Nếu máy lỗi, không chuyển máy thành
`AVAILABLE` và không tự động lập lịch mới trên máy đó.

## 6. UC-SQ-03 — Đề xuất và bắt đầu order tiếp theo

**Trigger:** Một máy trở thành `AVAILABLE`, hoặc nhân viên mở queue khi máy đã
trống sẵn.

Hai chế độ dùng cùng thuật toán:

- **Preview:** chỉ trả recommendation, không ghi database.
- **Active:** sau khi nhân viên xác nhận và đưa đồ vào máy mới ghi stage thật.

### 6.1. Xác định việc tiếp theo

`order_stages` là nguồn lịch duy nhất. Smart Work Queue không tự tạo một thứ tự
khác với schedule hiện tại.

Khi một machine `AVAILABLE`:

1. Tìm stage `PLANNED` sớm nhất đã được gán cho machine đó.
2. Kiểm tra lại machine, capacity, trạng thái order và điều kiện stage trước đó.
3. Nếu stage vẫn hợp lệ, đề xuất chính stage đó.
4. Nếu machine chưa có stage `PLANNED` tiếp theo hoặc slot hiện tại không còn
   hợp lệ, gọi `recalculateSchedule()` rồi đọc lại stage đầu tiên của machine.

Stage máy chỉ hợp lệ khi:

```text
order chưa COMPLETED
stage là WASH hoặc DRY đúng với loại machine
weightKg <= machine.capacityKg
machine đang hoạt động và AVAILABLE
order không có stage máy khác đang RUNNING
các stage trước đó đã đủ điều kiện hoàn tất
```

Với `WASH_DRY`, stage `DRY` chỉ được bắt đầu sau khi `WASH` đã `COMPLETED` và
`TRANSFER` đã hoàn tất theo workflow.

### 6.2. Cách hiển thị đề xuất

Work Queue hiển thị stage `PLANNED` tiếp theo của machine cùng 2–3 lý do dễ hiểu,
ví dụ:

- đây là stage tiếp theo trong schedule hiện tại;
- `pickupAt` đang gần hoặc order có nguy cơ trễ;
- stage trước đã hoàn tất và machine phù hợp.

Nếu thiếu deadline, vẫn có thể đề xuất theo schedule nhưng phải ghi rõ
"Chưa đủ dữ liệu để đánh giá nguy cơ trễ".

Nếu nhân viên muốn chọn một order khác với stage đang được schedule, hệ thống
phải xem đó là thay đổi lịch: chạy simulation/recalculate, hiển thị ảnh hưởng,
rồi chỉ áp dụng sau khi nhân viên xác nhận.

### 6.3. Luồng xác nhận

1. Hệ thống hiển thị candidate và 2–3 lý do dễ hiểu.
2. Nhân viên đối chiếu mã order với túi đồ.
3. Nhân viên có thể chọn order hợp lệ khác.
4. Nhân viên nhấn xác nhận và đưa đồ vào máy.
5. Hệ thống kiểm tra lại machine, capacity và trạng thái order.
6. Hệ thống cập nhật stage `PLANNED` đã được schedule, không tạo stage trùng:

```text
actualStartedAt = thời điểm xác nhận thực tế
status = RUNNING
```

Nếu stage `PLANNED` không còn hợp lệ, không được bắt đầu trực tiếp; phải
`recalculateSchedule()` trước.

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

## 8. Các use case bổ sung

### 8.1. UC-SQ-05 — Tạo order và kiểm tra giờ hẹn

**Actor:** Nhân viên tiếp nhận.

**Trigger:** Khách giao đồ và yêu cầu giờ có thể nhận đồ.

**Tiền điều kiện:** Nhân viên đã đăng nhập; hệ thống có dữ liệu machine và thời
lượng xử lý.

**Luồng cơ bản:**

1. Nhân viên mở "Thêm đơn".
2. Nhân viên nhập tên khách, số điện thoại, khối lượng, loại dịch vụ, giờ hẹn
   và ghi chú nếu có.
3. Hệ thống xác định chuỗi stage theo `serviceType`.
4. Hệ thống tạo schedule tạm trong memory và gọi `calculateETA()` cùng
   `checkDeadlineFeasibility()`.
5. Hệ thống hiển thị khoảng hoàn thành dự kiến, mức `feasible`, thời gian xử lý
   và giờ gần nhất có thể đáp ứng.
6. Nhân viên kiểm tra kết quả, có thể điều chỉnh giờ hẹn hoặc tiếp tục với cảnh
   báo rủi ro.
7. Khi nhân viên xác nhận, hệ thống tạo order và các planned `order_stages`,
   sau đó cập nhật hàng đợi.

**Ngoại lệ:**

- Thiếu tên, số điện thoại, khối lượng hoặc loại dịch vụ: không cho tạo order.
- Không có máy phù hợp hoặc thiếu `pickupAt`: hiển thị `UNKNOWN`, không tự coi
  là khả thi.
- Khối lượng vượt sức chứa mọi máy phù hợp: hiển thị lỗi và không tự chia order.
- Nếu order cần tách theo màu hoặc sức chứa, nhân viên tạo nhiều order với cùng
  `groupCode`.

Không ghi database khi nhân viên mới nhập hoặc thay đổi dữ liệu trong phần kiểm
tra tạm.

### 8.2. UC-SQ-06 — Xem hồ sơ và timeline order

**Actor:** Nhân viên vận hành.

**Trigger:** Nhân viên chọn một order từ dashboard, hàng đợi hoặc danh sách order.

**Luồng cơ bản:**

1. Hệ thống đọc order, customer, machine và toàn bộ `order_stages` liên quan.
2. Hệ thống hiển thị dịch vụ, khối lượng, giờ hẹn, ETA, risk và thông tin liên
   hệ khách.
3. Hệ thống hiển thị timeline từ `SORTING` đến `PACKING`, gồm stage hiện tại,
   stage đã hoàn tất, stage kế tiếp và thời gian còn lại.
4. Hệ thống hiển thị dòng tóm tắt "đang ở đâu, ai phụ trách, làm gì tiếp theo".
5. Nếu order có nguy cơ trễ, hệ thống hiển thị `estimatedAt`, `pickupAt` và
   phần chênh lệch hoặc thời gian dự phòng.
6. Nhân viên chọn hành động phù hợp như bắt đầu stage, hoàn tất công đoạn hoặc
   mở kiểm tra đôn order.

**Ngoại lệ:**

- Không có stage hoặc dữ liệu stage mâu thuẫn với trạng thái order: hiển thị
  "Cần kiểm tra" và không cho bắt đầu stage trực tiếp.
- Order đã `READY`: chỉ hiển thị ETA đã giữ nguyên và hành động thông báo nếu
  chưa gửi.
- Không có dữ liệu deadline: hiển thị rõ "Chưa đủ dữ liệu để đánh giá nguy cơ
  trễ".

Chỉ xem hồ sơ và timeline không làm thay đổi database.

### 8.3. UC-SQ-07 — Cập nhật tiến trình và thông báo khách

**Actor:** Nhân viên vận hành.

**Trigger:** Nhân viên bắt đầu/kết thúc một công đoạn hoặc order chuyển sang
`READY`.

**Luồng cơ bản:**

1. Nhân viên mở order hoặc chọn thông báo máy hoàn tất.
2. Nhân viên xác nhận bắt đầu hoặc hoàn tất công đoạn theo luồng
   `UC-SQ-02` và `UC-SQ-03`.
3. Hệ thống ghi thời điểm thực tế và trạng thái stage, sau đó cập nhật order,
   machine và công đoạn kế tiếp.
4. Hệ thống gọi `recalculateSchedule()` cho các stage chưa bắt đầu và cập nhật
   ETA, risk, countdown cùng recommendation trong hàng đợi.
5. Khi order đạt `READY`, hệ thống đưa order vào danh sách cần thông báo.
6. Hệ thống chọn mẫu tin theo trạng thái; nhân viên xem lại, chỉnh sửa nếu cần
   và xác nhận gửi hoặc hủy.
7. Hệ thống ghi trạng thái gửi, thời điểm và nội dung gần nhất; dashboard, hàng
   đợi và danh sách order cùng hiển thị trạng thái mới.

**Nhắc việc:** Hệ thống hiển thị nhắc khi máy sắp hoàn tất, order cần chuyển
bước, order đứng quá lâu hoặc gần giờ hẹn nhưng chưa hoàn tất. Nếu chưa xử lý,
nhắc lại sau khoảng 10–15 phút và không lặp liên tục.

**Ngoại lệ:**

- Lỗi khi bắt đầu/kết thúc stage xử lý theo ngoại lệ của `UC-SQ-02` và
  `UC-SQ-03`; không ghi nhận một trạng thái chưa được xác nhận.
- Chỉ khi `PACKING` hoàn tất, order mới được chuyển sang `READY`.

**Quy tắc thông báo theo nhóm:**

- Với `groupCode = NULL`, thông báo khi chính order đạt `READY`.
- Với group có nhiều order, chỉ gửi thông báo nhận đồ khi toàn bộ order trong
  group đạt `READY`.
- Nếu còn order chưa `READY`, hiển thị rõ các order còn lại và không gửi thông
  báo hoàn tất nhóm.

- Thiếu thông tin liên hệ: cho phép lưu trạng thái cần xử lý nhưng không giả vờ
  đã gửi thành công.
- Gửi thất bại: giữ order ở `Chưa gửi`, hiển thị lỗi và cho phép thử lại.

### 8.4. UC-SQ-10 — Tìm kiếm và lọc danh sách order

**Actor:** Nhân viên vận hành.

**Trigger:** Nhân viên cần tìm nhanh một order trong màn hình Quản lý đơn hàng.

**Luồng cơ bản:**

1. Nhân viên nhập tên khách hàng hoặc mã order vào ô tìm kiếm.
2. Hệ thống lọc danh sách theo nội dung tìm kiếm.
3. Nhân viên chọn bộ lọc `Tất cả`, `Đang xử lý` hoặc `Hoàn tất`.
4. Hệ thống hiển thị các order phù hợp cùng khách hàng, thời điểm tiếp nhận,
   dịch vụ, khối lượng và trạng thái chữ.
5. Nhân viên mở một dòng để xem UC-SQ-06.

**Ngoại lệ:**

- Không có kết quả: hiển thị "Không tìm thấy order phù hợp" và giữ nguyên bộ
  lọc để nhân viên điều chỉnh.
- Dữ liệu order đang tải hoặc lỗi: hiển thị trạng thái tương ứng, không hiển
  thị danh sách không đầy đủ như thể đó là toàn bộ dữ liệu.

Tìm kiếm và lọc chỉ thay đổi cách hiển thị, không thay đổi dữ liệu order.

## 9. Reschedule khi lịch thực tế thay đổi

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

## 10. Quy tắc thông báo và bàn giao

Chi tiết thao tác cập nhật và gửi thông báo, cùng quy tắc `groupCode`, nằm trong
`UC-SQ-07`.

Màn hình handover đọc order chưa `COMPLETED`, stage hiện tại, machine, pickup,
ETA, risk và next action. Notification preview phải áp dụng cùng quy tắc nhóm.

## 11. Tiêu chí chấp nhận

- Không gán order `WASH` vào `DRYER` hoặc ngược lại.
- Không gán order vượt `capacityKg`.
- Không có hai planned/running stage chồng thời gian trên một máy.
- ETA có xét hàng đợi máy, stage `WASH_DRY`, sorting, transfer, packing và
  buffer.
- ETA nhóm luôn là giá trị lớn nhất của các ETA thành viên.
- Simulation không thay đổi database.
- Reschedule không đổi stage đã hoàn tất hoặc đang chạy.
- Recommendation luôn đọc từ schedule hiện tại; Work Queue không tự tạo thứ tự
  xử lý khác với `order_stages`.
- Recommendation có lý do và luôn yêu cầu nhân viên xác nhận.
- Các order cùng `groupCode` luôn dùng cùng một `pickupAt`.
- Order cùng nhóm chỉ tạo một thông báo khi toàn bộ nhóm `READY`.
- Order chỉ chuyển `READY` sau khi stage `PACKING` đã `COMPLETED`.

## 12. Ngoài phạm vi prototype

- Điều khiển máy giặt/máy sấy thật.
- Tự động chia một order thành nhiều order.
- Gửi Zalo production.
- Lưu lịch sử expedite/audit riêng.
- Tối ưu lịch bằng AI hoặc thuật toán không deterministic.
