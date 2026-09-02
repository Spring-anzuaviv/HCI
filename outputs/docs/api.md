# API - Laundry Work Queue

API phục vụ prototype Smart Work Queue. Dữ liệu mô phỏng và API không điều
khiển máy giặt/sấy thật.

## 1. Quy ước

- Base URL: `http://localhost:4000/api`
- Body và response dùng `application/json`.
- Thời gian dùng ISO 8601, ví dụ `2026-08-15T18:00:00+07:00`.
- Field API dùng camelCase; database dùng lowercase `snake_case`.
- Thành công: `{ "data": ... }` hoặc `{ "data": ..., "meta": ... }`.
- Lỗi: `{ "error": { "code": "...", "message": "..." } }`.
- Protected route lấy `storeId` từ JWT, không tin `storeId` trong body.

Các mã lỗi chính:

```text
VALIDATION_ERROR
UNAUTHORIZED
INVALID_TOKEN
NOT_FOUND
WORKFLOW_CONFLICT
SCHEDULE_CONFLICT
INTERNAL_ERROR
NOTIFICATION_PROVIDER_NOT_IMPLEMENTED
```

## 2. Authentication

### POST `/auth/login`

Request:

```json
{
  "email": "admin@washtrack.com",
  "password": "your-password"
}
```

Response gồm `accessToken`, `tokenType`, `expiresIn` và thông tin store.

### GET `/auth/me`

Trả store của access token hiện tại.

Header:

```text
Authorization: Bearer <accessToken>
```

### POST `/auth/logout`

Prototype logout phía client. Frontend xóa access token; server không
blacklist token.

## 3. Health

### GET `/health`

Kiểm tra server.

### GET `/health/db`

Kiểm tra kết nối PostgreSQL/Supabase.

## 4. Resource và trạng thái

| Resource | Prisma model | Database table |
|---|---|---|
| Store | `Store` | `stores` |
| Customer | `Customer` | `customers` |
| Machine | `Machine` | `machines` |
| Order | `LaundryOrder` | `laundry_orders` |
| Order stage | `OrderStage` | `order_stages` |
| Employee/shift | `Employee`, `WorkShift` | `employees`, `work_shifts` |

### Service type

```text
WASH      -> SORTING -> WASH -> PACKING
DRY       -> SORTING -> DRY -> PACKING
WASH_DRY  -> SORTING -> WASH -> TRANSFER -> DRY -> PACKING
```

`WASH` chạy trên `WASHER`; `DRY` chạy trên `DRYER`. Stage thủ công có
`machineId = null`.

### Order stage status

```text
PLANNED -> RUNNING -> COMPLETED
PLANNED -> CANCELLED
```

Các field quan trọng của `OrderStage`:

```text
orderStageId
orderId
machineId nullable
stage
plannedStartAt nullable
plannedEndAt nullable
actualStartedAt nullable
actualEndedAt nullable
status
```

Các field scheduling của `LaundryOrder`:

```text
storeId
readyAt
pickupAt nullable
estimatedAt nullable
groupCode nullable
```

## 5. Dashboard

### GET `/stores/:storeId/dashboard`

Trả summary, task tiếp theo và danh sách cần chú ý.

Response mẫu:

```json
{
  "data": {
    "store": { "storeId": 1, "name": "Nhu Y" },
    "summary": {
      "pendingOrders": 4,
      "riskOrders": 2,
      "runningMachines": 2,
      "availableMachines": 1
    },
    "nextTask": {
      "orderId": 123,
      "reason": "Sắp đến giờ hẹn"
    },
    "attentionItems": []
  }
}
```

## 6. Orders

### GET `/stores/:storeId/orders`

Query hỗ trợ:

```text
status, search, page, limit
```

Order response gồm customer, stage, machine, `readyAt`, `pickupAt`,
`estimatedAt`, `groupCode`, `riskLevel`, `priorityReason` và `nextAction`.

### GET `/orders/:orderId`

Lấy order thuộc store trong JWT, customer và toàn bộ `stages`.

### POST `/stores/:storeId/orders`

Tạo order và các stage workflow ban đầu. API không tự chọn máy tùy ý; các
planned stage được scheduler gán máy khi lập lịch.

Request:

```json
{
  "customer": {
    "name": "Nguyen Van A",
    "phone": "0900000001"
  },
  "weightKg": 3,
  "serviceType": "WASH_DRY",
  "readyAt": "2026-08-15T14:00:00+07:00",
  "pickupAt": "2026-08-15T18:00:00+07:00",
  "groupCode": "GROUP-001"
}
```

`groupCode` dùng chung cho các order của một lần nhận. Các order cùng group
phải dùng cùng `pickupAt`. Nếu vượt capacity, nhân viên tạo order riêng và
gán chung `groupCode`.

### PATCH `/orders/:orderId/status`

Endpoint legacy để cập nhật chuỗi trạng thái order tuần tự:

```text
RECEIVED -> WAITING -> WASHING -> DRYING -> FOLDING_PACKING
          -> READY -> NOTIFIED -> COMPLETED
```

Request:

```json
{ "status": "WASHING" }
```

Không dùng endpoint này để tạo stage máy. Việc bắt đầu/kết thúc stage phải dùng
API Order Stage bên dưới.

## 7. Smart Work Queue

### GET `/stores/:storeId/queue`

Đọc schedule hiện tại và trả snapshot vận hành chỉ đọc. Endpoint không gọi
reschedule và không thay đổi database.

Response gồm:

```text
generatedAt
recommendation nullable
recommendations[]
items[]
attentionItems[]
summary
```

Mỗi queue item gồm:

```text
rank
orderId
customer
status
currentStage
nextStage
machineId
machineName
plannedStartAt
plannedEndAt
estimatedAt
riskLevel
slackMinutes
missingFields[]
priorityReasons[]
nextAction
operationalState
reviewReasons[]
canStart
```

`riskLevel` nhận `FEASIBLE`, `AT_RISK`, `NOT_FEASIBLE` hoặc `UNKNOWN`.
Nếu thiếu `pickupAt`/`estimatedAt`, `missingFields` nêu rõ field còn thiếu.

Nếu có `OrderStage.status = RUNNING` nhưng `LaundryOrder.status` không khớp,
item có `operationalState = NEEDS_REVIEW`, `canStart = false` và không được dùng
để tạo recommendation.

`recommendations` chỉ chứa planned stage hiện tại đủ điều kiện cho từng máy
`AVAILABLE`. `recommendation` là item có rank cao nhất trong danh sách này.

Thứ tự đề xuất:

1. Order có nguy cơ trễ.
2. `pickupAt` gần hơn.
3. Còn nhiều stage hơn.
4. `createdAt` sớm hơn.
5. `orderId` nhỏ hơn.

Recommendation chỉ là đề xuất. Nhân viên phải xác nhận trước khi bắt đầu.

### POST `/stores/:storeId/queue/recommendation`

Tạo recommendation trong memory, không thay đổi database.

Request tùy chọn:

```json
{
  "excludeOrderIds": [124]
}
```

## 8. Deadline và ETA

### POST `/stores/:storeId/deadline-check`

Kiểm tra deadline trước khi xác nhận order. Scheduler xét:

- `readyAt ?? createdAt`.
- Hàng đợi từng máy.
- `machine.type`, `capacityKg`, `processingMinutes`.
- Các stage `SORTING`, `WASH`, `TRANSFER`, `DRY`, `PACKING`.
- `BUFFER_TIME` sau packing.

Request:

```json
{
  "weightKg": 3,
  "serviceType": "WASH_DRY",
  "pickupAt": "2026-08-15T18:00:00+07:00"
}
```

Response:

```json
{
  "data": {
    "result": "FEASIBLE",
    "estimatedAt": "2026-08-15T17:25:00+07:00",
    "pickupAt": "2026-08-15T18:00:00+07:00",
    "groupETA": null,
    "requiredMinutes": 205,
    "affectedOrders": [],
    "reason": "Đủ thời gian xử lý"
  }
}
```

`result` nhận `FEASIBLE`, `AT_RISK`, `NOT_FEASIBLE` hoặc `UNKNOWN`.

Với order có `groupCode`, deadline phải so sánh với:

```text
groupETA = MAX(estimatedAt của toàn bộ order trong group)
```

## 9. Bắt đầu và hoàn tất stage

### GET `/stores/:storeId/machines`

Trả machine, status, `currentStage`, `nextPlannedStage`, `operationalState`,
`timeLeft`, `finishAt`, `completionDue`, `completionActionAllowed` và
`completionBlockedReason`. Với máy đang chạy:

```text
elapsed = now - currentStage.actualStartedAt
timeLeft = MAX(0, machine.processingMinutes - elapsed)
```

Máy báo `RUNNING` nhưng không có running stage, máy báo `AVAILABLE` trong khi
vẫn có running stage, hoặc trạng thái đơn không khớp stage đang chạy được đánh
dấu `NEEDS_REVIEW`. `completionDue` phản ánh chu trình đã đủ thời gian;
`completionActionAllowed=false` ngăn thay đổi dữ liệu khi phát hiện sai lệch.

### GET `/machines/:machineId`

Trả machine và stage gần nhất.

### PATCH `/machines/:machineId/status`

Đánh dấu lỗi vật lý trong UC-SQ-02. Chỉ nhận `BROKEN` hoặc `INACTIVE`:

```json
{ "status": "BROKEN" }
```

Stage đang chạy vẫn giữ `RUNNING`; endpoint không giải phóng máy thành
`AVAILABLE`.

### POST `/orders/:orderId/stages/:stage/start`

Bắt đầu stage đã được schedule. `stage` nhận `SORTING`, `WASH`, `TRANSFER`,
`DRY`, `PACKING`.

Request với stage máy:

```json
{
  "machineId": 1,
  "startedAt": "2026-08-15T14:15:00+07:00"
}
```

Với stage thủ công, `machineId` không cần gửi.

Backend kiểm tra:

- Stage đang `PLANNED`.
- Các stage trước đã `COMPLETED`.
- Stage `WASH` dùng `WASHER`; `DRY` dùng `DRYER`.
- Capacity đủ.
- Machine không `BROKEN`/`INACTIVE` và đang `AVAILABLE`.
- Order không có stage khác `RUNNING`.

### PATCH `/order-stages/:orderStageId/complete`

Hoàn tất stage. Request không cần body thời gian; backend luôn dùng thời gian
server. Với stage máy, backend kiểm tra
`actualStartedAt + processingMinutes <= now`, trạng thái đơn phải khớp stage và
stage vẫn còn `RUNNING` trong transaction.

Backend cập nhật `actualEndedAt`, chuyển stage thành `COMPLETED`, cập nhật order
status và chỉ chuyển máy thành `AVAILABLE` nếu máy chưa là `BROKEN` hoặc
`INACTIVE`. Sau đó backend gọi `refreshStoreSchedule` và trả recommendation
UC-SQ-03 cho máy vừa trống nếu có.

Ánh xạ trạng thái đơn:

- `WASH` của dịch vụ `WASH` → `FOLDING_PACKING`;
- `WASH` của dịch vụ `WASH_DRY` → `WAITING`;
- `DRY` → `FOLDING_PACKING`;
- `PACKING` → `READY`.

## 10. Expedite

### POST `/orders/:orderId/expedite`

Preview tác động khi đổi giờ lấy. Không ghi database.

Request:

```json
{
  "newPickupAt": "2026-08-15T14:30:00+07:00",
  "reason": "Khách có việc đột xuất"
}
```

Response gồm `newEstimatedAt`, `groupETA`, `feasibility`, `affectedOrders`,
`blockingImpacts`, `canConfirm` và `reason`. `affectedOrders` chỉ gồm các đơn
có ETA hoặc mức tác động thay đổi bởi lần dời; đơn vốn đã trễ nhưng không bị
thay đổi không được tính. `canConfirm` là `false` nếu đơn mục tiêu chưa đúng
giờ hoặc lần dời làm đơn khác trễ hẹn.

### POST `/orders/:orderId/expedite/confirm`

Áp dụng giờ lấy mới sau khi nhân viên đã xem preview. Nếu order thuộc group,
`pickupAt` được cập nhật cho toàn bộ group, sau đó schedule được tính lại.
Backend từ chối nếu preview làm đơn khác chuyển sang trễ hẹn hoặc đơn mục tiêu
vẫn không đúng giờ.

Request:

```json
{ "newPickupAt": "2026-08-15T14:30:00+07:00" }
```

## 11. Employees và shifts

### GET `/stores/:storeId/employees`

Lấy employee của store.

### GET `/stores/:storeId/shifts?date=2026-08-15`

Lấy shift và employee được phân công.

### POST `/stores/:storeId/shifts/:shiftId/assignments`

Request:

```json
{ "employeeId": 1 }
```

## 12. Notifications và handover

### GET `/stores/:storeId/notifications/pending`

Lấy các order có thể thông báo. Order không group được thông báo khi `READY`;
order trong group chỉ được trả khi toàn bộ group `READY`.

### POST `/orders/:orderId/notifications/preview`

Request tùy chọn:

```json
{ "channel": "ZALO" }
```

Tạo nội dung preview. Không gọi provider và không lưu trạng thái gửi.

### POST `/orders/:orderId/notifications/send`

Provider Zalo chưa triển khai trong backend prototype. Endpoint hiện trả
`501 NOTIFICATION_PROVIDER_NOT_IMPLEMENTED`.

### GET `/stores/:storeId/handovers/preview`

Trả order chưa `COMPLETED`, stage hiện tại, machine, pickup, ETA, risk và
next action. Dữ liệu handover không được lưu thành bảng riêng.

## 13. Quy tắc scheduling

- `OrderStage` là nguồn schedule duy nhất.
- Stage `COMPLETED` và `RUNNING` không bị đổi khi reschedule.
- Chỉ stage `PLANNED` chưa bắt đầu được lập lại.
- Không có hai stage `RUNNING` hoặc `PLANNED` chồng thời gian trên một máy.
- Preview và simulation không ghi database.
- `groupETA` luôn là giá trị lớn nhất, không phải trung bình.
- Nếu thiếu `pickupAt` hoặc dữ liệu máy, kết quả là `UNKNOWN`.
- Mọi recommendation phải có lý do và cần nhân viên xác nhận.

## 14. Giới hạn prototype

- Không điều khiển máy thật.
- Không tự chia một order thành nhiều order.
- Không lưu expedite history, audit hoặc notification history.
- Không gửi Zalo production.
- Không dùng AI để xếp lịch.
