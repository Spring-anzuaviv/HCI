# API - Laundry Order Coordination System

Tài liệu API phục vụ Software Product, bám theo mô hình trong db.md. Dữ liệu là mô phỏng; API không điều khiển máy giặt/sấy thật.

## 1. Conventions

- Base URL: http://localhost:4000/api
- Content-Type: application/json
- Thời gian: ISO 8601 có timezone.
- Path parameters dùng English names: storeId, orderId, machineId, machineRunId, shiftId, employeeId.
- Field API dùng camelCase; database tables và columns dùng English names.
- Response thành công dùng { data, meta }; lỗi dùng { error: { code, message } }.
- Mã lỗi: VALIDATION_ERROR, NOT_FOUND, WORKFLOW_CONFLICT, DEADLINE_NOT_FEASIBLE, INTERNAL_ERROR.

## Authentication and middleware

Đăng nhập dùng tài khoản cửa hàng lưu trong `STORE`. Phiên bản này không có API đăng ký, không có RBAC và không kiểm tra quyền theo role của nhân viên.

### POST /auth/login

Đăng nhập bằng email và mật khẩu của cửa hàng.

Request:

~~~json
{
  "email": "admin@washtrack.com",
  "password": "your-password"
}
~~~

Response:

~~~json
{
  "data": {
    "accessToken": "<jwt>",
    "tokenType": "Bearer",
    "expiresIn": "8h",
    "store": {
      "storeId": 1,
      "name": "Như Ý",
      "email": "admin@washtrack.com"
    }
  }
}
~~~

Sai email hoặc mật khẩu trả `401 INVALID_CREDENTIALS`. Mật khẩu chỉ được so sánh với `passwordHash`, không lưu hoặc trả về plain text password.

### GET /auth/me

Trả thông tin cửa hàng của access token hiện tại.

Header bắt buộc:

~~~text
Authorization: Bearer <accessToken>
~~~

### POST /auth/logout

Logout phía client bằng cách xóa access token. Server trả thành công mà không cần blacklist token trong prototype.

### Middleware pipeline

Thứ tự middleware chung trong Express:

1. `corsMiddleware` — cho phép origin frontend từ environment variable.
2. `jsonLimitMiddleware` — giới hạn JSON body mặc định 1 MB.
3. `requestIdMiddleware` — tạo hoặc giữ `X-Request-Id` cho log và response.
4. `authMiddleware` — xác thực Bearer JWT và gắn `storeId` vào request context.
5. `validationMiddleware` — kiểm tra body, params và query.
6. `notFoundMiddleware` — chuẩn hóa lỗi endpoint không tồn tại.
7. `errorMiddleware` — chuẩn hóa lỗi, không trả stack trace ở production.

`authMiddleware` trả `401 UNAUTHORIZED` khi thiếu token, `401 INVALID_TOKEN` khi token sai/hết hạn. JWT chứa tối thiểu `sub`, `storeId` và `type: "access"`, hết hạn mặc định sau 8 giờ theo `JWT_EXPIRES_IN`.

### Route protection

Public:

- `GET /health`
- `GET /health/db`
- `POST /auth/login`

Protected:

- `GET /auth/me`
- `POST /auth/logout`
- Tất cả endpoint `/stores/*`, `/orders/*`, `/machines/*`, `/machine-runs/*` và `/shifts/*`.

Các endpoint protected phải giới hạn dữ liệu theo `storeId` trong token. Không triển khai middleware RBAC hoặc role guard.

### Authentication flow

Luồng đăng nhập và gọi API:

~~~text
Login
  ↓
POST /api/auth/login
  ↓
Server tìm STORE theo email
  ↓
So sánh password với passwordHash
  ↓
Tạo access token JWT chứa storeId
  ↓
Frontend lưu accessToken vào sessionStorage
  ↓
Frontend gửi Authorization: Bearer <accessToken>
  ↓
Backend authMiddleware đọc và verify JWT
  ↓
Middleware gắn storeId vào request context
  ↓
Protected route xử lý request theo storeId
~~~

Quy tắc của flow:

- JWT không chứa password hoặc passwordHash.
- Backend không tin `storeId` từ request body; `storeId` phải lấy từ JWT.
- Login sai thông tin trả `401 INVALID_CREDENTIALS`.
- Thiếu token trả `401 UNAUTHORIZED`.
- Token sai hoặc hết hạn trả `401 INVALID_TOKEN`.
- Khi logout, frontend xóa accessToken khỏi `sessionStorage`.
- Không có API đăng ký và không triển khai RBAC.

## 2. Resource mapping

| Resource | Database table | Màn hình |
|---|---|---|
| Store | STORE | Dashboard, cài đặt |
| Customer | CUSTOMER | Tạo đơn, chi tiết đơn |
| Employee/shift | EMPLOYEE, WORK_SHIFT, EMPLOYEE_WORK_SHIFT | Dashboard, cấu hình |
| Machine | MACHINE | Dashboard, chi tiết đơn |
| Order | LAUNDRY_ORDER | Queue, Orders, Notifications |
| Machine run | MACHINE_RUN | Timeline, ETA, deadline check |

## 3. Health

### GET /health

Kiểm tra server.

### GET /health/db

Kiểm tra kết nối Supabase/PostgreSQL.

## 4. Dashboard

### GET /stores/:storeId/dashboard

Trả summary, machine availability, risk orders, next task và attention items.

Query tùy chọn: date, shiftId.

Response mẫu:

~~~json
{
  "data": {
    "store": { "storeId": 1, "name": "Như Ý" },
    "summary": {
      "pendingOrders": 4,
      "riskOrders": 2,
      "runningMachines": 2,
      "availableMachines": 1
    },
    "nextTask": {
      "orderId": 123,
      "reason": "Còn 45 phút đến giờ hẹn, còn 2 công đoạn"
    },
    "attentionItems": []
  }
}
~~~

Các trường tổng hợp được suy ra từ LAUNDRY_ORDER và MACHINE_RUN.

## 5. Orders

### GET /stores/:storeId/orders

Lấy danh sách order cho Orders và Queue.

Query: status, from, to, search, sort=priority|deadline|createdAt, page, limit.

Mỗi order nên trả customer, service, status, pickupAt, estimatedAt, priorityReason, riskLevel, currentStage, currentMachine và nextAction.

### GET /orders/:orderId

Lấy order, customer và các MACHINE_RUN của order.

### POST /stores/:storeId/orders

Tạo order mới.

~~~json
{
  "customer": {
    "name": "Nguyễn Văn A",
    "phone": "0900000000"
  },
  "weightKg": 3,
  "serviceType": "COMBO",
  "pickupAt": "2026-08-15T18:00:00+07:00"
}
~~~

API tạo hoặc tìm CUSTOMER, tạo LAUNDRY_ORDER với status WAITING và tính estimatedAt.

### PATCH /orders/:orderId/status

Cập nhật trạng thái sau mỗi stage.

~~~json
{
  "status": "WASHING",
  "machineId": 1,
  "note": "Đã đưa đồ vào máy"
}
~~~

Chuỗi status:

~~~text
RECEIVED -> WAITING -> WASHING -> DRYING -> FOLDING_PACKING -> READY -> NOTIFIED -> COMPLETED
~~~

Response phải có status mới, estimatedAt và nextAction.

## 6. Queue và expedite

### GET /stores/:storeId/queue

Trả order theo thứ tự gợi ý, kèm rank, pickupAt, stage, ETA, riskLevel, priorityReason và nextAction.

Logic v1:

1. Order có nguy cơ trễ.
2. pickupAt gần hơn.
3. Order còn nhiều stage nhưng vẫn có thể hoàn thành.
4. Thời điểm tiếp nhận sớm hơn.

API chỉ đề xuất; nhân viên vẫn quyết định.

### POST /stores/:storeId/queue/recommendation

Tính lại đề xuất mà không thay đổi dữ liệu.

~~~json
{
  "shiftId": 2,
  "excludeOrderIds": [124]
}
~~~

### POST /orders/:orderId/expedite

Kiểm tra tác động khi khách yêu cầu lấy sớm.

~~~json
{
  "newPickupAt": "2026-08-15T14:30:00+07:00",
  "reason": "Khách có việc đột xuất"
}
~~~

Response phải gồm orderId, feasibility, newEstimatedAt, affectedOrders và reason. feasibility nhận FEASIBLE, AT_RISK hoặc NOT_FEASIBLE.

## 7. Deadline check

### POST /stores/:storeId/deadline-check

Kiểm tra giờ hẹn trước khi xác nhận với khách.

~~~json
{
  "pickupAt": "2026-08-15T15:00:00+07:00",
  "weightKg": 3,
  "serviceType": "COMBO"
}
~~~

Response:

~~~json
{
  "data": {
    "result": "FEASIBLE",
    "availableAt": "2026-08-15T14:40:00+07:00",
    "latestSafePickup": "2026-08-15T15:10:00+07:00",
    "requiredMinutes": 115,
    "bufferMinutes": 30,
    "affectedOrders": [],
    "reason": "Đủ thời gian cho các stage và khoảng dự phòng"
  }
}
~~~

result nhận FEASIBLE, AT_RISK hoặc NOT_FEASIBLE; không chỉ trả boolean hoặc màu.

## 8. Machines và machine runs

### GET /stores/:storeId/machines

Lấy machine, status và thời gian còn lại.

### GET /machines/:machineId

Lấy machine và machine run gần nhất.

### POST /orders/:orderId/machine-runs

Tạo MACHINE_RUN khi bắt đầu stage.

~~~json
{
  "machineId": 1,
  "stage": "WASHING",
  "startedAt": "2026-08-15T14:15:00+07:00"
}
~~~

Từ chối nếu machine đang có run chưa kết thúc hoặc không phù hợp type.

### PATCH /machine-runs/:machineRunId/complete

Đánh dấu run hoàn tất.

~~~json
{
  "endedAt": "2026-08-15T14:45:00+07:00"
}
~~~

## 9. Employees và shifts

### GET /stores/:storeId/employees

Lấy employee của store.

### GET /stores/:storeId/shifts?date=2026-08-15

Lấy work shift và employee được phân công.

### POST /stores/:storeId/shifts/:shiftId/assignments

Gán employee vào shift.

~~~json
{ "employeeId": 1 }
~~~

Nhóm này chủ yếu phục vụ màn hình cấu hình.

## 10. Customer notifications

### GET /stores/:storeId/notifications/pending

Lấy order READY chưa được thông báo.

### POST /orders/:orderId/notifications/preview

Tạo content để employee kiểm tra trước khi gửi.

~~~json
{ "channel": "ZALO" }
~~~

Response gồm orderId, channel, recipient và content; content tự điền customer name, order code, status và pickup time.

### POST /orders/:orderId/notifications/send

Mô phỏng gửi notification.

~~~json
{
  "channel": "ZALO",
  "content": "Chào chị Lan, đơn L-123 đã hoàn tất và sẵn sàng để nhận từ 15:00 hôm nay."
}
~~~

API trả sentAt và status; không gọi Zalo thật.

## 11. Shift handover

### GET /stores/:storeId/handovers/preview?shiftId=2

Xem các order chưa hoàn tất, gồm status, stage, machine/location, pickupAt, ETA, riskLevel và nextAction.

### POST /stores/:storeId/handovers/confirm

~~~json
{
  "fromShiftId": 2,
  "toShiftId": 3,
  "fromEmployeeId": 1,
  "toEmployeeId": 2,
  "orderIds": [123, 124],
  "note": "Ưu tiên lấy đồ máy 2 trước 18:00"
}
~~~

## 12. Database limitations

db.md hiện chưa có bảng/cột riêng cho email/passwordHash nếu chưa cập nhật STORE, priority, expedite reason, order assignee, special requirements, bag location, status history, NOTIFICATION, SHIFT_HANDOVER, audit hoặc reminder configuration.

Vì vậy expedite, notification, handover và reminder chỉ nên dùng state tạm thời hoặc mock trong phiên bản HCI. Không mô tả chúng là dữ liệu lưu bền vững cho production.

## 13. Business rules

1. Một MACHINE không có hai MACHINE_RUN đang hoạt động.
2. Một LAUNDRY_ORDER không có hai stage chạy đồng thời.
3. MACHINE_RUN phải phù hợp với machine type.
4. Status update phải trả ETA và nextAction.
5. Deadline check phải trả result, reason và giờ đề xuất.
6. Expedite phải trả affected orders trước khi xác nhận.
7. Notification phải preview trước khi mô phỏng send.
8. Dữ liệu machine chỉ là mô phỏng.

## 14. Implementation priority

Nên làm thật bằng API: dashboard, orders, queue recommendation, create order, status update, deadline check, machines và machine runs.

Có thể mock ở frontend: gửi Zalo thật, push notification, notification history, persistent handover và expedite history.
