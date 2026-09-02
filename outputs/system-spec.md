# Đặc tả hệ thống — Prototype điều phối công việc giặt ủi

## 0. Mục đích, phạm vi và nguồn bằng chứng

Tài liệu này mô tả hành vi **đang được hiện thực trong code** của prototype hỗ trợ nhân viên cửa hàng giặt ủi theo dõi đơn, máy, deadline, công đoạn và bàn giao. Đây là tài liệu cho deliverable **Software Product** và hỗ trợ **Report**; không phải kết quả nghiên cứu người dùng mới.

Nguồn đối chiếu chính:

- frontend React trong `src/frontend/src`;
- API Express, service và workflow trong `src/backend/src`;
- schema Prisma trong `src/backend/prisma/schema.prisma`;
- các workflow test trong `src/backend/src/services/all.test.ts`.

Prototype chỉ hỗ trợ quyết định và ghi nhận thao tác. Nó không điều khiển máy giặt/máy sấy thật, không gửi Zalo qua API production và không có tài khoản riêng cho từng nhân viên. Phiên đăng nhập hiện đại diện cho một cửa hàng.

## 1. Danh mục use case hiện có

| Mã | Use case | Actor chính | Trạng thái trong code |
|---|---|---|---|
| `UC-AUTH-01` | Đăng nhập, duy trì phiên, đổi mật khẩu và đăng xuất | Tài khoản cửa hàng | Đã hiện thực |
| `UC-SQ-01` | Xem hàng đợi và trạng thái vận hành | Nhân viên vận hành | Đã hiện thực |
| `UC-SQ-02` | Xử lý máy vừa hoàn tất | Nhân viên vận hành | Đã hiện thực |
| `UC-SQ-03` | Đề xuất và bắt đầu công đoạn tiếp theo | Nhân viên vận hành | Đã hiện thực |
| `UC-SQ-04` | Mô phỏng tác động và thay đổi giờ hẹn | Nhân viên vận hành | Đã hiện thực |
| `UC-SQ-05` | Tạo đơn, kiểm tra deadline và tách thành nhiều mẻ | Nhân viên tiếp nhận | Đã hiện thực |
| `UC-SQ-06` | Xem chi tiết, timeline, tìm kiếm và lọc đơn | Nhân viên vận hành | Đã hiện thực |
| `UC-SQ-07` | Thông báo khách và xác nhận giao đồ | Nhân viên vận hành | Đã hiện thực ở mức prototype |
| `UC-ADM-01` | Quản lý máy và khôi phục máy cần kiểm tra | Quản lý/nhân viên được phép | Đã hiện thực, chưa có RBAC |
| `UC-ADM-02` | Quản lý nhân viên và phân ca theo ngày | Quản lý/nhân viên được phép | Đã hiện thực, chưa có RBAC |
| `UC-RPT-01` | Xem thống kê vận hành | Nhân viên/quản lý | Đã hiện thực ở mức prototype |

## 2. Mô hình nghiệp vụ và trạng thái

### 2.1. Workflow dịch vụ

| `serviceType` | Chuỗi `OrderStage` |
|---|---|
| `WASH` | `SORTING → WASH → PACKING` |
| `DRY` | `SORTING → DRY → PACKING` |
| `WASH_DRY` | `SORTING → WASH → TRANSFER → DRY → PACKING` |

`WASH` cần máy `WASHER`; `DRY` cần máy `DRYER`. Các stage `SORTING`, `TRANSFER`, `PACKING` là công việc thủ công và không yêu cầu `machineId`.

### 2.2. Trạng thái đơn

```text
RECEIVED
  → WAITING
  → WASHING hoặc DRYING
  → WAITING nếu WASH_DRY vừa giặt xong
  → FOLDING_PACKING
  → READY
  → NOTIFIED
  → COMPLETED
```

Trạng thái thực tế được suy ra cùng với `OrderStage`; nếu hai nguồn không khớp, queue/machine được đánh dấu `NEEDS_REVIEW` và hệ thống chặn hành động không an toàn.

### 2.3. Trạng thái stage và máy

- `OrderStage`: `PLANNED`, `RUNNING`, `COMPLETED` (code cũng nhận biết `CANCELLED` khi đọc queue nhưng không có UI tạo trạng thái này).
- `Machine`: `AVAILABLE`, `RUNNING`, `BROKEN`, `INACTIVE`.
- Một stage máy đang `RUNNING` phải có `actualStartedAt` và `machineId`.
- Khi hoàn tất, stage được ghi `actualEndedAt`; máy chỉ trở về `AVAILABLE` nếu máy không ở `BROKEN` hoặc `INACTIVE`.

### 2.4. Scheduler và ETA

Thời lượng dùng để lập lịch:

```text
SORTING = 5 phút
TRANSFER = 5 phút
PACKING = 10 phút
BUFFER sau workflow = 5 phút
WASH/DRY = Machine.processingMinutes
```

`generateSchedule()` lập lịch order theo:

```text
pickupAt ASC (null xếp cuối)
→ createdAt ASC
→ orderId ASC
```

Máy tương thích phải đúng loại, đủ sức chứa và không `BROKEN`/`INACTIVE`. Scheduler tìm slot kết thúc sớm nhất; nếu hòa, chọn `machineId` nhỏ hơn. Stage `RUNNING` và `COMPLETED` giữ dữ liệu thực tế; `refreshStoreSchedule()` chỉ ghi lại stage `PLANNED` hoặc ETA khi giá trị thay đổi.

Deadline được đánh giá bằng:

```text
slackMinutes = pickupAt - estimatedAt
slackMinutes < 0   → NOT_FEASIBLE
slackMinutes <= 15 → AT_RISK
còn lại            → FEASIBLE
thiếu pickupAt/estimatedAt → UNKNOWN
```

Với đơn tách có cùng `groupCode`, `groupETA` là ETA lớn nhất của các mẻ.

> Lưu ý: thứ tự lập lịch ETA và thứ tự recommendation là hai thuật toán khác nhau. Scheduler dùng `pickupAt → createdAt → orderId`; Smart Queue xếp recommendation theo risk và slack như mô tả tại `UC-SQ-03`.

## 3. Luồng tổng thể đang chạy

```text
Đăng nhập bằng tài khoản cửa hàng
  → tải đồng thời orders + machines + queue qua /operations
  → tải nhân viên/ca và tóm tắt ca
  → tạo đơn hoặc thao tác stage
  → backend cập nhật transaction
  → refreshStoreSchedule
  → frontend tải lại operations
  → queue, ETA, máy và cảnh báo cùng được cập nhật
  → PACKING hoàn tất: order READY
  → mở Zalo/copy nội dung và đánh dấu NOTIFIED
  → giao đồ và đánh dấu COMPLETED
```

## 4. UC-AUTH-01 — Đăng nhập và quản lý phiên

**Actor:** Tài khoản cửa hàng.

**Trigger:** Người dùng mở ứng dụng hoặc gửi form đăng nhập.

**Tiền điều kiện:** Cửa hàng tồn tại và có `passwordHash` hợp lệ.

**Luồng cơ bản:**

1. Ứng dụng gọi `GET /auth/me` để kiểm tra cookie hiện tại.
2. Nếu chưa có phiên, người dùng nhập email và mật khẩu.
3. `POST /auth/login` kiểm tra mật khẩu và tạo JWT thời hạn 8 giờ.
4. Backend lưu JWT trong cookie `accessToken` với `HttpOnly`, `SameSite=Lax`.
5. Frontend khởi tạo `AppProvider`, tải operations, nhân viên/ca và tóm tắt ca.
6. Người dùng có thể đổi tên cửa hàng, đổi mật khẩu hoặc đăng xuất trong Cài đặt.

**Ngoại lệ:** Sai thông tin trả `INVALID_CREDENTIALS`; thiếu/hết hạn cookie trả `UNAUTHORIZED` hoặc `INVALID_TOKEN`. Mật khẩu mới phải có ít nhất 6 ký tự.

**Giới hạn:** Không có đăng nhập theo `Employee` và chưa phân quyền `STAFF/MANAGER`; mọi phiên hợp lệ của cửa hàng có thể gọi các API quản trị.

## 5. UC-SQ-01 — Xem hàng đợi và trạng thái vận hành

**Actor:** Nhân viên vận hành.

**Trigger:** Đăng nhập thành công, mở Dashboard/Hàng đợi hoặc frontend tải lại operations sau mutation.

**Tiền điều kiện:** Có phiên cửa hàng hợp lệ. Queue vẫn có thể hiển thị trạng thái rỗng nếu chưa có order hoặc machine.

**Luồng cơ bản:**

1. Frontend gọi `GET /stores/:storeId/operations`.
2. Backend đọc orders và machines, sau đó trả cùng một snapshot gồm `orders`, `machines`, `queue`.
3. Queue chỉ lấy các trạng thái đang hoạt động: `RECEIVED`, `WAITING`, `WASHING`, `DRYING`, `FOLDING_PACKING`.
4. Backend xác định stage hiện tại, stage tiếp theo, máy đã lập lịch, ETA, deadline risk và các mâu thuẫn dữ liệu.
5. Với mỗi máy `AVAILABLE`, backend tạo danh sách candidate và recommendation.
6. UI hiển thị đề xuất “Nên xử lý tiếp”, nhóm đơn theo stage, nhãn risk, giờ hẹn, ETA, hành động tiếp theo và trạng thái máy ở panel bên phải.
7. Dashboard dùng cùng `queueSnapshot` để hiển thị cảnh báo, tóm tắt và tối đa năm đơn đang hoạt động.
8. Frontend tự tải lại danh sách máy mỗi 60 giây; các mutation gọi tải lại operations ngay sau khi hoàn tất.

**Hậu điều kiện:** Chỉ xem không ghi database.

**Luồng thay thế và ngoại lệ:**

- Không có order hoạt động: hiển thị “Hiện không có đơn cần xử lý”.
- Không có máy trống/candidate: không có card recommendation; máy vẫn hiển thị.
- Thiếu deadline: risk là `UNKNOWN`, hiển thị trường dữ liệu còn thiếu.
- Order/stage hoặc machine/stage không khớp: đánh dấu `NEEDS_REVIEW`, hiển thị lý do và không cho bắt đầu recommendation đó.
- Lỗi tải: giữ trạng thái lỗi và nút “Thử lại”; không giả vờ danh sách rỗng là dữ liệu hoàn chỉnh.

**Điểm sửa so với bản cũ:** `READY`, `NOTIFIED` và `COMPLETED` không nằm trong `queue.items`; chúng được xử lý ở trang thông báo hoặc danh sách hoàn tất.

## 6. UC-SQ-02 — Xử lý máy vừa hoàn tất

**Actor:** Nhân viên vận hành.

**Trigger:**

```text
Machine.status = RUNNING
OrderStage.status = RUNNING
now >= actualStartedAt + processingMinutes
```

**Luồng cơ bản:**

1. API máy tính `finishAt`, `timeLeft`, `completionDue` và `completionActionAllowed`.
2. Khi frontend nhận thấy máy đến hạn, overlay máy hoàn tất tự mở; không cần người dùng mở một notification riêng.
3. Frontend phát chuông và lặp lại mỗi 5 phút khi máy vẫn nằm trong danh sách đến hạn.
4. Nhân viên nhấn **Xác nhận** để nhận việc.
5. Frontend ghi `acknowledgedAt` vào `localStorage` theo `orderStageId` và chạy countdown 3 phút. Countdown không ghi database nhưng vẫn tiếp tục sau khi reload cùng trình duyệt.
6. Nhân viên lấy đồ và nhấn **Đã lấy đồ xong**. Nút không bị khóa đến khi countdown về 0; backend mới là nơi kiểm tra máy thực sự đã đủ thời lượng.
7. Backend kiểm tra lại stage, order, máy, thời điểm hoàn tất và trạng thái đồng bộ.
8. Trong transaction, backend cập nhật:

```text
OrderStage: RUNNING → COMPLETED, actualEndedAt = now
LaundryOrder:
  WASH của WASH_DRY → WAITING
  WASH của dịch vụ WASH, hoặc DRY của DRY/WASH_DRY → FOLDING_PACKING
  SORTING/TRANSFER → WAITING
  PACKING → READY
Machine: RUNNING → AVAILABLE nếu máy không BROKEN/INACTIVE
```

9. Backend tính lại schedule và trả recommendation cho máy vừa được giải phóng.
10. Frontend xóa acknowledgement, hiển thị toast và tải lại operations.

**Luồng ngoại lệ:**

- Máy chưa đủ thời lượng: `MACHINE_NOT_FINISHED`, không thay đổi dữ liệu.
- Có nhiều stage `RUNNING`, thiếu `actualStartedAt`, sai order status hoặc sai machine status: chặn hoàn tất và hiển thị “Cần kiểm tra”.
- Nhân viên đánh dấu máy `BROKEN`/`INACTIVE`: stage vẫn `RUNNING`, máy không được giải phóng, overlay dừng vì máy không còn `RUNNING`; cần kiểm tra vật lý và xử lý tiếp sau đó.
- Hai phiên cùng hoàn tất: `updateMany` bảo đảm chỉ một phiên thắng; phiên còn lại nhận `WORKFLOW_CONFLICT`.

## 7. UC-SQ-03 — Đề xuất và bắt đầu công đoạn tiếp theo

**Actor:** Nhân viên vận hành.

**Trigger:** Có máy `AVAILABLE`, mở Hàng đợi hoặc hoàn tất một stage.

### 7.1. Candidate filtering

Một order chỉ là candidate của một máy khi đồng thời thỏa:

```text
order.status = WAITING
machine.status = AVAILABLE
stage máy tiếp theo tồn tại và status = PLANNED
stage trước đó trong workflow đều COMPLETED
requiredMachineType(stage) = machine.type
weightKg <= machine.capacityKg
order không có stage RUNNING khác
```

`SORTING`, `TRANSFER`, `PACKING` được thao tác như stage thủ công, không đi qua candidate máy.

### 7.2. Risk và thứ tự recommendation

Candidate của từng máy được xếp theo:

```text
riskRank DESC
→ slackMinutes ASC (null cuối)
→ pickupAt ASC (null cuối)
→ createdAt ASC
→ orderId ASC
```

Trong đó `NOT_FEASIBLE = 2`, `AT_RISK = 1`, còn `FEASIBLE/UNKNOWN = 0`. Lý do hiển thị tối đa ba dòng, ví dụ “Đơn đã vượt giờ hẹn”, “Còn 45 phút đến giờ hẹn”, “Máy Giặt 1 phù hợp”. Không dùng điểm priority bí ẩn.

Snapshot có thể tạo recommendation cho nhiều máy. Danh sách dùng trên UI loại trùng theo `orderId`, nên cùng một order không xuất hiện đồng thời ở nhiều card “Nên xử lý tiếp”.

### 7.3. Bắt đầu stage máy

1. Nhân viên chọn card recommendation hoặc mở chi tiết order.
2. UI chọn máy trống phù hợp; ưu tiên `recommendedMachineId`, nếu không có thì lấy máy trống đầu tiên.
3. Nhân viên nhấn **Bắt đầu/Xử lý ngay**.
4. Backend mở transaction `Serializable` và kiểm tra lại toàn bộ điều kiện candidate để chống hai phiên cùng nhận order/máy.
5. Backend cập nhật nguyên tử:

```text
OrderStage: PLANNED → RUNNING
actualStartedAt = now
machineId = máy được chọn
plannedEndAt = now + processingMinutes
LaundryOrder: WAITING → WASHING hoặc DRYING
Machine: AVAILABLE → RUNNING
```

6. Backend tính lại schedule; frontend tải lại operations.

**Không có countdown 3 phút khi đưa đồ vào máy trong implementation hiện tại.** Nút bắt đầu ghi trạng thái ngay sau request thành công.

### 7.4. Stage thủ công

UI gọi `startRun(..., machineId = 0)` rồi gọi `completeRun()` ngay cho `SORTING`, `TRANSFER`, `PACKING`. Vì vậy thao tác được thể hiện như “Hoàn tất ngay”, không có màn hình đếm thời gian thủ công.

### 7.5. Ngoại lệ

- Máy không còn `AVAILABLE`, stage không còn `PLANNED`, order không còn `WAITING`, công đoạn trước chưa xong, sai loại máy hoặc quá sức chứa: trả `WORKFLOW_CONFLICT`, không ghi một phần dữ liệu.
- Thiếu deadline không chặn candidate; UI ghi rõ không đủ dữ liệu đánh giá risk.
- Không có candidate: máy giữ `AVAILABLE` và không hiển thị recommendation.

## 8. UC-SQ-04 — Mô phỏng tác động và thay đổi giờ hẹn

**Actor:** Nhân viên vận hành.

**Trigger:** Nhân viên mở chi tiết order và chọn **Đôn đơn/Lấy sớm**.

**Tiền điều kiện:** Order thuộc tập đang hoạt động, chưa `READY`, `NOTIFIED` hay `COMPLETED`; có `pickupAt`; giờ mới ở tương lai; dữ liệu máy và workflow đủ để mô phỏng.

**Luồng cơ bản:**

1. Nhân viên chọn nhanh `-15`, `-30`, `-60` phút hoặc nhập giờ trong ngày.
2. Frontend gọi `POST /orders/:orderId/expedite`.
3. Backend tải toàn bộ active orders và machines của cửa hàng.
4. Backend chỉ thay `pickupAt` của order mục tiêu trong bản sao bộ nhớ rồi gọi `generateSchedule()`.
5. Với mỗi order có ETA hoặc risk thay đổi, backend trả `currentEstimatedAt`, `simulatedEstimatedAt`, `etaDeltaMinutes`, slack và impact hiện tại/đề xuất.
6. Impact là `ON_TIME`, `AT_RISK`, `NOT_FEASIBLE` hoặc `UNKNOWN`.
7. Backend tạo `simulationToken` SHA-256 từ snapshot orders, stages, machines, order mục tiêu và giờ mới.
8. UI hiển thị số order bị ảnh hưởng, số trễ và số cảnh báo. Nhân viên nhập lý do rồi xác nhận.
9. Endpoint confirm tải lại dữ liệu trong transaction `Serializable`, tạo lại token và so sánh.
10. Nếu token còn hợp lệ, backend **chỉ cập nhật `pickupAt` của order mục tiêu**, sau đó gọi `refreshStoreSchedule()`.

**Hậu điều kiện:** ETA và recommendation được tính lại từ schedule mới; stage đang `RUNNING`/`COMPLETED` không bị bắt đầu lại.

**Ngoại lệ:**

- Giờ mới không ở tương lai: `VALIDATION_ERROR`.
- Thiếu máy, thời lượng, pickup hoặc stage workflow: `SIMULATION_DATA_INCOMPLETE`.
- Queue thay đổi sau simulation: `QUEUE_CHANGED`; người dùng phải mô phỏng lại.
- Order đã `READY`, `NOTIFIED` hoặc `COMPLETED`: `ORDER_COMPLETED`.

**Điểm sửa so với bản cũ:**

- Simulation không dùng `simulateInsertion()` và không xếp trực tiếp theo `riskRank` của Smart Queue; nó gọi `generateSchedule()` theo thứ tự scheduler.
- Code hiện chỉ đổi order mục tiêu, **không tự đổi tất cả mẻ cùng `groupCode`**.
- `reason` là bắt buộc để xác nhận nhưng schema chưa có trường audit, nên lý do không được lưu lâu dài.

## 9. UC-SQ-05 — Tạo đơn, kiểm tra deadline và tách mẻ

**Actor:** Nhân viên tiếp nhận.

**Trigger:** Nhấn **Thêm đơn hàng mới**.

**Luồng cơ bản:**

1. Nhập tên, số điện thoại, tổng khối lượng, giờ hẹn và dịch vụ.
2. Sau 300 ms không thay đổi, frontend hủy preview cũ và gọi `/deadline-check` cho một order hoặc `/deadline-group-check` cho nhiều mẻ.
3. Backend tạo order giả trong bộ nhớ, chạy `generateSchedule()` và trả ETA, `groupETA` cùng mức khả thi.
4. Frontend chỉ cho gửi flow chuẩn khi giờ hẹn cùng ngày, còn ở tương lai, không quá giờ kết thúc ca muộn nhất và kết quả là `FEASIBLE`.
5. Với đơn tách, nhân viên tạo 2–20 mẻ, chọn khối lượng, dịch vụ và ghi chú riêng; tổng khối lượng phải bằng khối lượng đơn.
6. Frontend gán cùng `groupCode` và gọi endpoint batch. Backend tạo customer, orders và toàn bộ stage `PLANNED` trong một transaction, rồi tính schedule một lần.
7. UI hiển thị ETA từng mẻ và ETA cả nhóm, sau đó tải lại operations.

**Ngoại lệ và giới hạn:**

- Backend kiểm tra tên, điện thoại, khối lượng dương và `serviceType`; batch phải có 2–20 phần.
- Không có máy phù hợp có thể làm preview trả lỗi/không khả thi; không tự chia mẻ ở backend.
- Ràng buộc giờ cùng ngày/giờ ca và yêu cầu `FEASIBLE` hiện chủ yếu ở frontend; gọi API tạo order trực tiếp không tự chạy lại deadline check.
- UI gửi `note` cho từng mẻ nhưng schema hiện không có cột note; nội dung này **không được lưu**.
- `groupCode` được frontend sinh từ thời gian; backend chưa cưỡng chế các thành viên cùng nhóm phải có cùng `pickupAt`.

## 10. UC-SQ-06 — Chi tiết, timeline, tìm kiếm và lọc đơn

**Actor:** Nhân viên vận hành.

**Trigger:** Chọn order từ Dashboard, Hàng đợi hoặc danh sách đơn.

**Luồng cơ bản:**

1. Modal hiển thị dữ liệu context ngay, đồng thời gọi `GET /orders/:orderId`.
2. Backend trả customer, stages, machine, ETA, `groupETA`, risk, current stage và next action.
3. Timeline luôn theo workflow dịch vụ, không dựa vào thứ tự mảng stage trả về.
4. Mỗi mốc hiển thị `plannedStartAt`; đơn nhóm hiển thị riêng “Mẻ này” và “Cả nhóm”.
5. Từ modal, nhân viên có thể bắt đầu/hoàn tất stage hoặc mở `UC-SQ-04` nếu đơn chưa `READY`.
6. Ô tìm kiếm dùng tên, số điện thoại hoặc mã order; bộ lọc dùng `Tất cả`, `Đang xử lý`, `Hoàn tất`. Cùng state tìm kiếm/lọc được dùng ở Dashboard, Hàng đợi và trang đơn.

**Ngoại lệ:** Lỗi detail vẫn giữ dữ liệu tóm tắt đã có và hiển thị lỗi. Không có kết quả lọc hiển thị thông báo rỗng, không thay đổi database.

**Giới hạn hiện tại:** Frontend ánh xạ cả `NOTIFIED` và `COMPLETED` thành trạng thái hiển thị `done`; vì vậy nhóm “Đã hoàn tất” ở một số danh sách có thể chứa đơn mới chỉ được thông báo nhưng chưa giao.

## 11. UC-SQ-07 — Thông báo khách và xác nhận giao đồ

**Actor:** Nhân viên vận hành.

**Trigger:** Order đạt `READY` sau khi `PACKING` hoàn tất hoặc mở trang Thông báo.

**Luồng cơ bản:**

1. Frontend tải song song danh sách `READY` và `NOTIFIED`.
2. Order không nhóm tạo một card. Với `groupCode`, backend chỉ tạo một card đại diện khi **tất cả** thành viên cùng nhóm đang `READY`.
3. Backend tạo nội dung preview từ tên khách, số mẻ và tên cửa hàng.
4. Nhân viên nhấn **Gửi Zalo**.
5. Frontend mở `https://zalo.me/<phone>` trong tab mới và cố copy nội dung vào clipboard.
6. Frontend gọi API `send`; backend kiểm tra cả nhóm `READY` rồi cập nhật tất cả thành viên sang `NOTIFIED`. Gọi lặp khi cả nhóm đã `NOTIFIED` trả kết quả idempotent.
7. Sau khi giao đồ, nhân viên nhấn **Đã giao đồ**. Backend cho phép các trạng thái `READY`, `NOTIFIED`, `COMPLETED`, rồi cập nhật các thành viên còn lại thành `COMPLETED` và ghi `completedAt`.

**Ngoại lệ:** Nếu một mẻ trong nhóm chưa `READY`, không cho gửi. Nếu một mẻ chưa thuộc tập trạng thái có thể giao, không cho hoàn tất nhóm.

**Giới hạn prototype:**

- Không có API Zalo production; backend chỉ ghi nhận trạng thái sau khi frontend mở Zalo/copy nội dung, không xác minh tin đã gửi thành công.
- Không có bảng lưu nội dung, kênh hoặc thời điểm gửi. Sau reload, danh sách `NOTIFIED` không thể khôi phục đầy đủ lịch sử nội dung gửi.
- Endpoint `/handovers/preview` có thể đọc đơn chưa hoàn tất nhưng UI hiện dùng banner `shift-summary`, không có màn hình bàn giao riêng.

## 12. UC-ADM-01 — Quản lý máy và khôi phục trạng thái

**Actor:** Người dùng có phiên cửa hàng hợp lệ.

**Luồng chính:** Xem, thêm, sửa, xóa máy; đổi trạng thái; sau mỗi thay đổi gọi `refreshStoreSchedule()` để cập nhật ETA và queue.

**Quy tắc:**

- Loại chỉ là `WASHER`/`DRYER`; sức chứa và thời gian phải dương.
- Nếu máy còn stage chưa hoàn tất, khóa tên, loại, sức chứa và thời lượng; chỉ cho đổi trạng thái.
- Máy đang `RUNNING` chỉ có thể giữ `RUNNING` hoặc chuyển `BROKEN` qua flow sửa.
- Không thể xóa máy còn stage `RUNNING`/`PLANNED`.
- Nút **Đặt lại** chỉ đổi máy về `AVAILABLE` khi không còn stage `RUNNING` thật.

**Giới hạn:** Không có RBAC; đây là cấu hình prototype, không điều khiển máy thật.

## 13. UC-ADM-02 — Quản lý nhân viên và phân ca

**Actor:** Người dùng có phiên cửa hàng hợp lệ.

**Luồng chính:**

1. Chọn ngày để xem ca.
2. Nếu ngày chưa có ca, backend sao chép khung giờ từ ngày mẫu gần nhất nhưng không sao chép phân công.
3. Thêm/sửa hồ sơ nhân viên; số điện thoại không được trùng trong cửa hàng.
4. Gán hoặc bỏ gán nhân viên cho ca của đúng ngày đang xem.
5. Chỉ xóa hồ sơ nhân viên khi không còn assignment.

**Giới hạn:** Không có UI tạo/sửa khung ca; vai trò `STAFF/MANAGER` được lưu nhưng chưa dùng để phân quyền API. Dashboard lại dùng các khung giờ ca hard-code 06–14, 14–18, 18–22 để hiển thị lời chào, không đọc trực tiếp `WorkShift`.

## 14. UC-RPT-01 — Xem thống kê vận hành

**Actor:** Người dùng có phiên cửa hàng hợp lệ.

**Luồng chính:** Trang Thống kê gọi `/stores/:storeId/stats`, cache kết quả 30 giây và hiển thị số đơn hoàn tất hôm nay, số đơn trễ, tỷ lệ dịch vụ và chỉ số hiệu suất máy.

**Giới hạn dữ liệu mô phỏng/proxy:**

- `machineEfficiency` là tỷ lệ số stage `RUNNING/COMPLETED` trên `machines × 8`, không phải OEE hoặc thời gian sử dụng máy thực.
- `weekChart` backend hiện chỉ đặt số đơn hôm nay vào phần tử đầu; đường biểu đồ và mini chart panel bên phải còn hard-code trang trí.
- Trang này không nên được trình bày như báo cáo production hoặc bằng chứng nghiên cứu.

## 15. Các sai khác đã phát hiện giữa tài liệu cũ và code

| Nội dung cũ | Hành vi hiện tại trong code |
|---|---|
| Ghi “chia thành 5 use case” nhưng chỉ có 4 | Danh mục hiện có 11 use case code-backed |
| Queue chứa mọi order chưa `COMPLETED` | `queue.items` chỉ chứa năm trạng thái active; READY/NOTIFIED xử lý ở trang thông báo |
| Countdown lấy đồ chỉ là state mất khi reload | Acknowledgement được lưu `localStorage`, không lưu DB |
| Countdown 3 phút trước khi bắt đầu máy | Không được hiện thực; request bắt đầu stage ghi trạng thái ngay |
| Người dùng chọn “candidate khác” từ danh sách riêng | UI cho chọn order/card khác và chọn máy trong modal; không có wizard candidate riêng |
| Simulation dùng thứ tự risk của Smart Queue | Simulation dùng `generateSchedule()` theo `pickupAt`, `createdAt`, `orderId` |
| Đôn một mẻ cập nhật cả `groupCode` | Flow hiện tại chỉ cập nhật order mục tiêu |
| Lý do đôn đơn được ghi nhận lâu dài | Lý do chỉ được validate, chưa có cột audit để lưu |
| Gửi Zalo trực tiếp | Chỉ mở Zalo, copy nội dung và cập nhật trạng thái prototype |
| Ghi chú order/mẻ được lưu | Payload có `note` nhưng schema không lưu |
| Thống kê tuần/hiệu suất là dữ liệu thực đầy đủ | Một phần là proxy hoặc dữ liệu hiển thị hard-code |

## 16. Chênh lệch nội bộ code cần lưu ý khi walkthrough

Các mục sau là **hạn chế/technical debt quan sát từ code**, không phải hành vi mong muốn được xác thực:

1. Scheduler dùng `TRANSFER = 5` phút và `PACKING = 10` phút, nhưng flow bắt đầu stage thủ công trong `machine.service.ts` đặt `TRANSFER = 2` phút và `PACKING = 5` phút; UI lại bắt đầu rồi hoàn tất ngay.
2. `NOTIFIED` được frontend ánh xạ thành `done`, dễ gây hiểu nhầm với `COMPLETED`.
3. Backend tạo order không bắt buộc chạy deadline preview; quy tắc chỉ nhận `FEASIBLE` nằm chủ yếu ở frontend.
4. Thông tin ca trên hero Dashboard là hard-code và có thể khác dữ liệu `WorkShift` đang xem.
5. Một số endpoint vẫn tồn tại nhưng không nằm trong luồng UI chính hiện tại: `/stores/:storeId/dashboard`, `/stores/:storeId/queue`, `/stores/:storeId/queue/recommendation`, `/machines/:machineId/recommendations`, `/orders/:orderId/status`, `/orders/:orderId/notifications/preview` và `/stores/:storeId/handovers/preview`. Frontend chính dùng endpoint gộp `/operations`, mutation theo stage và payload preview có sẵn trong danh sách notification.

## 17. Tiêu chí chấp nhận theo implementation hiện tại

- Không bắt đầu `WASH` trên `DRYER` hoặc `DRY` trên `WASHER`.
- Không bắt đầu order vượt `capacityKg` hoặc khi máy không `AVAILABLE`.
- Không bỏ qua stage trước trong workflow.
- Bắt đầu stage máy cập nhật stage, order và machine nguyên tử.
- Hoàn tất stage máy trước thời điểm kết thúc bị backend từ chối.
- Risk dùng ngưỡng 15 phút và hiển thị `UNKNOWN` khi thiếu deadline.
- Recommendation có lý do tường minh và không dùng điểm AI.
- Simulation không ghi database và confirmation bị từ chối nếu snapshot đổi.
- Đơn tách chỉ tạo một card thông báo khi toàn bộ nhóm `READY`.
- Gửi/giao một group cập nhật toàn bộ mẻ và hỗ trợ gọi lặp idempotent.
- Mọi mutation quan trọng tải lại operations/schedule để đồng bộ UI.
- Hành vi được trình bày là prototype dùng dữ liệu database/mock, không phải hệ thống production hay thiết bị điều khiển máy thật.
