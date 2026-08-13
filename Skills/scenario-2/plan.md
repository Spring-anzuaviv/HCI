# Scenario 2 — Plan

## Purpose

Tạo Scenario 2 như **phiên bản tương lai của đúng ca làm việc trong `outputs/assets/scenario-1.png`**, để người xem có thể đối chiếu từng mốc “hiện tại → cải thiện” mà không phải suy đoán.

Scenario 2 là cầu nối:

1. **Persona:** Nguyễn Mai Anh, 20 tuổi, nhân viên trực tiếp tại cửa hàng giặt ủi Cosmo.
2. **Scenario:** Chiều thứ Sáu đông khách, Mai Anh tiếp nhận giờ hẹn, chọn đơn khi máy trống, xử lý đơn gấp, theo dõi nguy cơ trễ và báo khách.
3. **Goal:** Mai Anh đạt G1–G5 thông qua ba cải tiến chính: hàng đợi công việc thông minh, kiểm tra tính khả thi của giờ hẹn, và cập nhật tiến trình–thông báo khách.

Kế hoạch này phục vụ deliverable **Scenario 2 (Cải thiện)** và tạo đầu vào trực tiếp cho `outputs/scenario-2.md`, từ đó có thể dựng ảnh PNG cùng ngôn ngữ trình bày với Scenario 1.

## Source of truth and scope

### Nguồn chuẩn

- Nguồn chuẩn để nối tiếp là **bản hình đã chỉnh sửa**: `outputs/assets/scenario-1.png`.
- `outputs/scenario-1.md` chỉ dùng để tham khảo khi khác với bản hình; PNG quyết định số bước và nội dung nối tiếp.
- Persona, Value Proposition, phỏng vấn và rubric được dùng để kiểm tra tính nhất quán và giới hạn bằng chứng.

### Phạm vi câu chuyện

Scenario 1 mới có **5 mốc** và **4 vấn đề cốt lõi**. Năm mốc đầu của Scenario 2 phải giữ đúng phép đối chiếu này; sau đó thêm mốc 6 để lồng nội dung bàn giao đã được người dùng chọn bằng dấu `//` trong Value Proposition:

| Mốc | Scenario 1 — hiện tại                                                 | Vấn đề                          | Scenario 2 — tương lai                                                                                |
| --: | --------------------------------------------------------------------- | ------------------------------- | ----------------------------------------------------------------------------------------------------- |
|   1 | 14:00 — Khách hỏi giờ hẹn lấy đồ; Mai Anh tự ước tính                 | P2 — Hẹn giờ theo cảm tính      | Kiểm tra tính khả thi trước khi xác nhận giờ                                                          |
|   2 | 14:15 — Có máy trống; Mai Anh tự ghép thông tin để chọn đơn           | P1 — Hàng đợi thủ công          | Xem đề xuất có lý do, rồi xác nhận hoặc chọn khác                                                     |
|   3 | 14:40 — Khách xin lấy sớm hơn một giờ; khó biết đơn khác bị ảnh hưởng | P1 — Hàng đợi thủ công          | Xem tác động trước khi đôn đơn và tự quyết định                                                       |
|   4 | 16:45 — Phát hiện hai đơn trễ khi không còn đủ thời gian xử lý        | P3 — Phát hiện trễ muộn         | Nhận cảnh báo sớm, xem lý do và chọn hành động                                                        |
|   5 | 17:00 — Soạn Zalo thủ công, không biết khách nào đã được báo          | P4 — Thông báo thủ công         | Duyệt nội dung soạn sẵn và theo dõi trạng thái gửi                                                    |
|   6 | Tiếp nối sau Scenario 1: cuối ca còn đơn chưa hoàn tất                | VP-P3 — Bàn giao thiếu ngữ cảnh | Trong hàng đợi thông minh, chuyển sang “Bàn giao ca sau”, rà thông tin và xác nhận người tiếp nhận    |

Không thêm lại cảnh chuyển công đoạn của phiên bản cũ. Cảnh bàn giao là **use case con của hàng đợi công việc thông minh**: nhân viên xem mục “Ca trước bàn giao” khi vào ca và tạo “Bàn giao ca sau” trước khi kết thúc ca. Nội dung này bắt nguồn từ `//PR5` và `//GC5` trong `outputs/value-proposition.md`.

### Ba cải tiến chính

| Cải tiến | Các mục `//` được lồng | Phạm vi tương tác |
| --- | --- | --- |
| **1. Hàng đợi công việc thông minh** | PR1, PR3, PR5, PR11, GC1, GC3, GC4, GC5 | Đề xuất đơn có lý do; đổi thứ tự; trạng thái/việc tiếp theo; nhắc việc; xem bàn giao ca trước và tạo bàn giao ca sau |
| **2. Kiểm tra tính khả thi của giờ khách hẹn** | PR9, GC9, GC10 | Ba mức khả thi; khoảng hoàn thành; giờ gần nhất; timeline công đoạn |
| **3. Cập nhật tiến trình và thông báo khách** | PR7, GC8 | Nội dung theo trạng thái; gửi tự động khi có kênh hoặc soạn sẵn để duyệt; lịch sử và trạng thái gửi |

## Use this skill when

- Cần tạo hoặc cập nhật Scenario 2 dựa trên bản Scenario 1 PNG hiện tại.
- Cần tạo sáu khung: năm khung đầu so sánh trực tiếp với Scenario 1 và một khung kết thúc ca.
- Cần kiểm tra ba cải tiến chính có giúp Persona đạt G1–G5 hay không.
- Cần chuẩn bị đầu vào cho storyboard, wireframe hoặc walkthrough prototype của đúng luồng này.

Không dùng skill này để:

- Mô tả lại quy trình hiện tại như một quy trình mới.
- Thêm tính năng hoặc tình huống ngoài năm mốc và các mục `//` đã được chọn trong Value Proposition.
- Bắt đầu từ tên sản phẩm, thương hiệu hoặc chi tiết triển khai kỹ thuật.
- Tuyên bố giải pháp đã giảm thời gian, giảm lỗi hoặc được người dùng chấp nhận khi chưa kiểm thử.

## Required inputs

- `outputs/assets/scenario-1.png`: bối cảnh, năm mốc và P1–P4.
- `outputs/Persona.md`: Goals, Behaviors, Pain Points, Needs và Motivations của Mai Anh.
- `outputs/value-proposition.md`: các mục `//` và mapping pain/need.
- `inputs/phong-van-1.md`, `inputs/phong-van-3.md`, `inputs/phong-van-bo-sung.md`: bằng chứng liên quan.
- `inputs/Rubric.md`: tiêu chí Scenario 2 phải cho thấy cái mới và các bước tương tác mới rõ ràng.

## Goal coverage

- **G1 — Điều phối:** được thể hiện tại mốc 2 và 3 qua đề xuất có lý do, xem tác động và quyền đổi thứ tự.
- **G2 — Đúng hẹn:** được thể hiện tại mốc 1 và 4 qua kiểm tra khả thi và cảnh báo sớm khi dự kiến thay đổi.
- **G4 — Giao tiếp khách hàng:** được thể hiện tại mốc 5 qua nội dung soạn sẵn, bước duyệt và trạng thái gửi.
- **G5 — Chất lượng:** là ràng buộc xuyên suốt; không gộp đơn, không bỏ yêu cầu xử lý và không rút ngắn công đoạn chỉ để giữ giờ hẹn.
- **G3 — Bàn giao:** được thể hiện như use case con của hàng đợi: xem bàn giao ca trước ở mốc 2 và tạo bàn giao ca sau ở mốc 6.

## Output

1. `skills/scenario-2/skill.md`: quy tắc suy luận, nội dung chuẩn, mapping và hướng dẫn vẽ.
2. `outputs/scenario-2.md`: nội dung sáu khung sẵn để chuyển thành ảnh PNG.
3. Cấu trúc hình gồm:
   - nhãn Scenario 2;
   - tiêu đề và mô tả ngắn;
   - bốn thẻ bối cảnh giống Scenario 1;
   - timeline dọc sáu khung;
   - vùng tổng kết ba cải tiến chính;
   - chú thích bằng chứng, giả định và dữ liệu mô phỏng.

## Interaction flow selected for Scenario 2

| Khung | Thời điểm   | Tác nhân bắt đầu                       | Hành động của Mai Anh                                         | Phản hồi hỗ trợ                                                                        | Quyết định và trạng thái kết thúc                                  | Goal       |
| ----: | ----------- | -------------------------------------- | ------------------------------------------------------------- | -------------------------------------------------------------------------------------- | ------------------------------------------------------------------ | ---------- |
|     1 | 14:00       | Khách hỏi khoảng mấy giờ lấy được      | Nhập giờ khách mong muốn và xem khả năng đáp ứng              | Hiển thị “Không khả thi” cho 14:30, khoảng hoàn thành và giờ gần nhất có dự phòng      | Mai Anh đề nghị 15:15; khách đồng ý; giờ mới được xác nhận         | G2, G5     |
|     2 | 14:15       | Máy giặt số 2 vừa trống, còn 5 đơn chờ | Xem ca trước bàn giao, đơn được đề xuất và lý do; xác nhận hoặc chọn khác | Hiển thị thời điểm nhận, giờ hẹn, mức khẩn, trạng thái, máy phù hợp và lựa chọn đổi thứ tự | Một đơn được đưa vào máy; phần việc ca trước vẫn theo dõi trên cùng hàng đợi | G1, G3, G5 |
|     3 | 14:40       | Khách xin lấy sớm hơn 1 giờ            | Xem tác động nếu đôn đơn, kiểm tra tình hình thực tế          | Hiển thị đơn nào có thể bị rủi ro và khoảng hoàn thành sau thay đổi                    | Mai Anh chọn phương án phù hợp hoặc giữ thứ tự; lý do được ghi lại | G1, G2, G5 |
|     4 | 16:00       | Hai đơn hẹn 17:30 có nguy cơ không kịp | Mở cảnh báo, xem lý do và chọn cách xử lý                     | Hiển thị “Có rủi ro”, thời gian còn lại, khoảng hoàn thành mới và hành động đề xuất    | Mai Anh điều chỉnh nếu hợp lý hoặc xác nhận giờ mới để báo khách   | G2, G5     |
|     5 | 16:05–17:00 | Dự kiến thay đổi hoặc đơn đã hoàn tất  | Kiểm tra nội dung soạn sẵn, chỉnh nếu cần rồi gửi             | Hiển thị “Đã gửi/Chưa gửi”, thời điểm và nội dung lần cuối                             | Khách được cập nhật; Mai Anh biết rõ ai đã được báo                | G4         |
|     6 | 17:50       | Cuối ca còn đơn chưa hoàn tất          | Trong hàng đợi, chọn “Bàn giao ca sau”, rà thông tin và người tiếp nhận | Hiển thị trạng thái, công đoạn/vị trí, người phụ trách, ngoại lệ và việc tiếp theo | Ca sau mở “Ca trước bàn giao” và tiếp tục ngay | G3, G5 |

## Workflow

1. Mở và đọc trực tiếp `outputs/assets/scenario-1.png`.
2. Ghi lại chính xác Persona, địa điểm, thời điểm, tình trạng ban đầu, năm mốc và P1–P4.
3. Với mỗi mốc, xác định điều Mai Anh đang cố hoàn thành và trở ngại cụ thể.
4. Chọn đúng một tương tác mới chính để giải quyết trở ngại đó; mốc 2 và 3 có thể cùng dùng hàng đợi có giải thích nhưng phải thể hiện hai quyết định khác nhau.
5. Viết từng khung theo chuỗi: **tác nhân → hành động của Mai Anh → phản hồi → quyết định/xác nhận → trạng thái kết thúc**.
6. Giữ cùng thời gian và tình huống khi có thể; chỉ đổi mốc 16:45 thành 16:00 để thể hiện việc phát hiện trễ sớm hơn.
7. Lồng đầy đủ các mục được đánh dấu `//`: PR1, PR3, PR5, PR7, PR9, PR11, GC1, GC3, GC4, GC5, GC8, GC9 và GC10.
8. Gắn `[F]`, `[S]`, `[A]`, `[M]` trong tài liệu nguồn; trên hình chỉ cần chú thích tổng hợp để tránh làm rối nội dung.
9. Điền nội dung đã rút gọn vào `outputs/scenario-2.md`.
10. So sánh năm khung đầu với Scenario 1 theo thứ tự 1–1, rồi kiểm tra khung 6 tiếp nối hợp lý đến cuối ca.
11. Kiểm tra khả năng đọc, quyền điều chỉnh và mapping pain → ba cải tiến chính → G1–G5 trước khi gen PNG.

## Success criteria

- Scenario 2 có sáu khung; năm khung đầu nối trực tiếp với Scenario 1 và khung 6 nối đến cuối ca.
- Persona hiển thị là **Nguyễn Mai Anh, 20 tuổi**; địa điểm là **Cửa hàng giặt ủi Cosmo**.
- Bối cảnh giữ nguyên **chiều thứ Sáu, cuối tuần đông khách; 6 đơn chờ xử lý, 3 máy đang chạy**.
- Người xem nhận ra đúng ba cải tiến chính; bàn giao và nhắc việc được thể hiện bên trong hàng đợi thông minh, không thành sản phẩm độc lập.
- Mai Anh là người xem, cân nhắc, xác nhận hoặc điều chỉnh; hỗ trợ không quyết định thay cô.
- Các trạng thái “Khả thi/Có rủi ro/Không khả thi” luôn có nhãn chữ, không chỉ dùng màu.
- G3 được kết thúc bằng thao tác “Bàn giao ca sau” trong hàng đợi; ca sau xem lại tại “Ca trước bàn giao”.
- Không có nội dung kỹ thuật, tích hợp thật hoặc tuyên bố hiệu quả chưa kiểm chứng.
- `outputs/scenario-2.md` đủ rõ để dùng trực tiếp làm nguồn gen ảnh PNG.

## Evidence, assumptions and simulated data

### Evidence used

- `[F]` POS, bill dán túi, không gộp đơn, nhắn Zalo và nguyên tắc ưu tiên: `inputs/phong-van-1.md`.
- `[F]` Note điện thoại, tiếng báo máy và cách ưu tiên đơn: `inputs/phong-van-3.md`.
- `[F]` Các yếu tố cần xem khi đôn đơn, nguy cơ trễ và thông tin bàn giao: `inputs/phong-van-bo-sung.md`.
- `[S]` Bốn vấn đề P1–P4 và năm mốc đầu từ `outputs/assets/scenario-1.png`; bàn giao được lồng vào hàng đợi từ các mục `//`.

### Assumptions to validate

- `[A]` Đề xuất có giải thích giúp Mai Anh chọn đơn phù hợp hơn.
- `[A]` Ba mức khả thi giúp Mai Anh xác nhận giờ hẹn có căn cứ hơn.
- `[A]` Cảnh báo lúc 16:00 đủ sớm và không gây thêm gián đoạn.
- `[A]` Nội dung soạn sẵn cùng trạng thái gửi làm giảm thao tác lặp lại và bỏ sót.
- `[A]` Một dòng tóm tắt trạng thái và bản tổng hợp cuối ca giúp người tiếp nhận tiếp tục với ít câu hỏi lại hơn.

### Simulated data

- `[M]` Mã đơn, khoảng hoàn thành, giờ 15:15/16:00/16:05, tác động dự kiến và trạng thái gửi là dữ liệu mô phỏng để kể chuyện.

## Deliverables supported

- **Chính:** Scenario 2 (Cải thiện).
- **Đầu vào tiếp theo:** Storyboard, Wireframe, Prototype, Software Product, Presentation và Report.
