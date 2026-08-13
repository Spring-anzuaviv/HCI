# Scenario 2 — Hệ thống tương lai

> **Một ca làm việc có hỗ trợ, nhân viên vẫn là người quyết định**

Mô tả cùng tình huống tại cửa hàng giặt ủi Cosmo qua ba cải tiến chính: **hàng đợi công việc thông minh có hỗ trợ bàn giao giữa các ca**, **kiểm tra tính khả thi của giờ hẹn**, và **cập nhật tiến trình–thông báo khách**.

---

## Bối cảnh

|                        |                                      |
| ---------------------- | ------------------------------------ |
| **Persona**            | Nguyễn Mai Anh, 20 tuổi              |
| **Địa điểm**           | Cửa hàng giặt ủi Cosmo               |
| **Thời điểm**          | Chiều thứ Sáu — cuối tuần đông khách |
| **Tình trạng ban đầu** | 6 đơn chờ xử lý, 3 máy đang chạy     |

---

## Mô tả quy trình mới

Trong ca chiều thứ Sáu đông khách, Mai Anh vẫn là người trực tiếp tiếp nhận và quyết định cách xử lý từng đơn, nhưng cô không còn phải tự ghép mọi thông tin trong đầu. Trước khi bắt đầu xử lý, cô mở **hàng đợi công việc thông minh** để xem các đơn trong ca và phần bàn giao từ ca trước. Mỗi đơn cho biết trạng thái, công đoạn/vị trí, người phụ trách, ngoại lệ và việc cần làm tiếp theo. Khi có máy trống, hàng đợi đề xuất đơn phù hợp dựa trên **thời điểm nhận đơn, giờ khách hẹn lấy, mức độ khẩn cấp, trạng thái đơn và loại máy phù hợp**; Mai Anh xem lý do rồi xác nhận hoặc tự đổi thứ tự nếu thực tế phát sinh khác với đề xuất.

Khi khách hỏi giờ lấy đồ, Mai Anh dùng chức năng **kiểm tra tính khả thi của giờ hẹn**. Khoảng hoàn thành được ước tính từ các máy đang hoạt động và thời gian còn lại, số đơn đang chờ, thời gian giặt–sấy–đóng gói, loại đồ hoặc dịch vụ và thời gian dự phòng. Kết quả được trình bày bằng ba mức **“Khả thi”**, **“Có rủi ro”** hoặc **“Không khả thi”**, kèm giờ gần nhất có thể đáp ứng. Nhờ vậy, Mai Anh có cơ sở trao đổi và chỉ xác nhận giờ nhận phù hợp với khả năng của cửa hàng.

Khi một khách bất ngờ muốn lấy đồ sớm hơn, hàng đợi cho Mai Anh xem việc đôn đơn sẽ ảnh hưởng như thế nào đến những đơn đang chờ. Thứ tự chỉ thay đổi sau khi cô kiểm tra tình trạng máy và xác nhận. Trong suốt ca, tiến trình từng đơn được cập nhật trên cùng hàng đợi; đơn có nguy cơ trễ được chỉ ra sớm cùng nguyên nhân, các công đoạn còn lại, khoảng hoàn thành mới và hành động tiếp theo. Việc cần xử lý ngay được nhắc trên điện thoại; nếu sau khoảng 10–15 phút chưa được xác nhận, lời nhắc xuất hiện lại một lần thay vì lặp liên tục.

Khi tiến trình hoặc thời gian dự kiến thay đổi, chức năng **cập nhật tiến trình và thông báo khách** chuẩn bị nội dung tương ứng. Nếu kênh gửi tự động đã được bật, khách nhận cập nhật theo trạng thái đơn; trong phạm vi prototype chưa tích hợp kênh thật, Mai Anh kiểm tra nội dung soạn sẵn rồi nhấn **“Gửi”**. Lịch sử và trạng thái **“Đã gửi/Chưa gửi”** giúp cô biết khách đã nhận thông tin nào. Cuối ca, ngay trong hàng đợi, Mai Anh chuyển sang chế độ **“Bàn giao ca sau”** để rà các đơn chưa hoàn tất và xác nhận người tiếp nhận. Quy trình kết thúc khi khách đã được cập nhật và đồng nghiệp ca sau có thể tiếp tục từ chính hàng đợi, không phải ghép lại thông tin bằng giấy hoặc truyền miệng.

---

## Diễn biến tình huống trong ca

### Bước 1 — Kiểm tra giờ hẹn trước khi xác nhận `Đầu ca · 14:00`

Khách mang đồ đến và hỏi: **“Khoảng mấy giờ lấy được?”** Mai Anh ghi loại dịch vụ, yêu cầu của đơn và kiểm tra khả năng đáp ứng giờ **14:30** trước khi trả lời.

Thông tin hỗ trợ ước tính từ tải máy, hàng đợi, thời lượng giặt–sấy–hoàn tất và thời gian dự phòng. Giờ 14:30 được ghi rõ là **“Không khả thi”**; đơn dự kiến hoàn thành từ **15:00–15:10** và giờ gần nhất có dự phòng là **15:15**. Một timeline ngắn cho thấy các công đoạn còn lại và thời gian dự kiến của từng mốc, giúp Mai Anh kiểm tra tính hợp lý trước khi giải thích cho khách và xác nhận giờ mới.

> **Phản hồi hiển thị:** Không khả thi · Giặt → Sấy → Hoàn tất · Dự kiến 15:00–15:10 · Đề xuất hẹn 15:15

- **Tương tác mới:** Kiểm tra tính khả thi và đề xuất giờ gần nhất trước khi cam kết.
- **Kết quả:** Giờ nhận được thống nhất trên cơ sở tải hiện tại, không chỉ dựa vào cảm tính.

---

### Bước 2 — Chọn đơn tiếp theo với lý do rõ ràng `14:15`

Máy giặt số 2 vừa trống; còn **5 đơn chờ**. Mai Anh mở hàng đợi công việc, nơi cô có thể chuyển giữa **“Ca trước bàn giao”** và **“Công việc trong ca”**. Hàng đợi đề xuất đơn tiếp theo dựa trên **thời điểm nhận đơn, giờ khách hẹn lấy, mức độ khẩn cấp, trạng thái đơn và loại máy phù hợp**.

Ngay cạnh đề xuất có lý do **“còn 45 phút đến giờ hẹn, còn 2 công đoạn”** và một dòng tóm tắt **“Chờ giặt · Khu tiếp nhận · Mai Anh · Tiếp theo: đưa vào máy số 2”**. Trạng thái luôn có nhãn chữ, không chỉ có màu. Mai Anh vẫn thấy lựa chọn **“Chọn đơn khác”** và có thể kéo đổi thứ tự nếu tình hình thực tế không phù hợp. Sau khi đối chiếu yêu cầu và đúng túi đồ, cô xác nhận đơn được đề xuất rồi đưa vào máy số 2.

> **Phản hồi hiển thị:** Nên xử lý tiếp · Còn 45 phút đến giờ hẹn · Còn 2 công đoạn · Chọn đơn khác

- **Tương tác mới:** Đề xuất việc tiếp theo có giải thích, nhân viên được xác nhận hoặc chọn khác.
- **Kết quả:** Hàng đợi cập nhật; đơn vừa chọn có trạng thái và người xử lý rõ ràng, còn phần việc từ ca trước vẫn được theo dõi trên cùng danh sách.

---

### Bước 3 — Xem tác động trước khi đôn đơn gấp `14:40`

Một khách gọi xin lấy đồ sớm hơn **1 giờ** vì có việc đột xuất. Mai Anh mở đơn gấp và xem phương án đưa đơn này lên trước.

Thông tin hỗ trợ cho biết giờ hoàn thành dự kiến của đơn gấp và những đơn nào có thể chuyển sang **“Có rủi ro”** nếu thay đổi thứ tự. Mỗi đơn bị ảnh hưởng vẫn có dòng tóm tắt trạng thái, người phụ trách và việc tiếp theo. Mai Anh kiểm tra tình hình máy thực tế rồi chọn đôn đơn, kéo đổi vị trí, dùng máy vừa trống hoặc giữ thứ tự cũ. Thay đổi chỉ được áp dụng sau khi cô xác nhận và ghi lý do.

> **Phản hồi hiển thị:** Nếu đôn đơn này · 1 đơn có nguy cơ trễ · Xem tác động trước khi đổi

- **Tương tác mới:** So sánh tác động trước khi đổi ưu tiên; Mai Anh vẫn là người quyết định.
- **Kết quả:** Thứ tự mới và các đơn bị ảnh hưởng đều nhìn thấy được.

---

### Bước 4 — Phát hiện nguy cơ trễ khi vẫn còn thời gian hành động `16:00 · Hai đơn cùng hẹn`

Hai đơn hẹn lúc **17:30** vẫn còn nhiều công đoạn. Thay vì chỉ nhận ra lúc 16:45 như quy trình cũ, Mai Anh nhận cảnh báo từ **16:00** và mở xem nguyên nhân.

Hai đơn được ghi rõ **“Có rủi ro”**, kèm timeline công đoạn còn lại, người phụ trách, việc tiếp theo và khoảng hoàn thành mới **17:40–18:00**. Vì đây là việc cần xử lý ngay, Mai Anh cũng nhận một lời nhắc trên điện thoại. Nếu sau khoảng **10–15 phút** chưa có xác nhận, lời nhắc xuất hiện lại một lần và không lặp liên tục. Mai Anh điều chỉnh thứ tự nếu không làm đơn khác trễ hơn; nếu không còn phương án an toàn, cô xác nhận giờ mới để báo khách. Cô không bỏ công đoạn cần thiết chỉ để giữ lời hẹn cũ.

> **Phản hồi hiển thị:** Có rủi ro · Timeline công đoạn còn lại · Dự kiến mới 17:40–18:00 · Nhắc lại sau 10–15 phút nếu chưa xử lý

- **Tương tác mới:** Cảnh báo sớm có lý do, khoảng hoàn thành và hành động tiếp theo.
- **Kết quả:** Rủi ro được xử lý khi vẫn còn thời gian cập nhật khách.

---

### Bước 5 — Kiểm tra rồi gửi thông báo cho khách `16:05–17:00`

Giờ dự kiến của hai đơn vừa thay đổi; những đơn khác lần lượt hoàn tất. Nội dung cập nhật được chuẩn bị theo trạng thái **“Đã tiếp nhận”**, **“Đang sấy”**, **“Thời gian dự kiến thay đổi”** hoặc **“Sẵn sàng để nhận”**. Nếu kênh gửi tự động đã được bật, cập nhật được gửi theo trạng thái đơn; trong phương án cần nhân viên duyệt, Mai Anh kiểm tra tên khách, giờ dự kiến và lời nhắn, chỉnh nếu cần rồi nhấn gửi.

Mỗi đơn hiển thị lịch sử thông báo, trạng thái **“Đã gửi”** hoặc **“Chưa gửi”**, thời điểm và nội dung cập nhật gần nhất. Mai Anh biết khách đã nhận nội dung nào và là người duyệt lần cuối, nên vẫn có thể sửa hoặc chưa gửi nếu thông tin chưa đúng.

> **Phản hồi hiển thị:** Đã gửi 16:05 · Chưa gửi · Nội dung cập nhật gần nhất

- **Tương tác mới:** Cập nhật theo tiến trình; hỗ trợ gửi tự động hoặc soạn sẵn để nhân viên duyệt, kèm trạng thái gửi theo từng đơn.
- **Kết quả:** Khách biết giờ dự kiến mới hoặc biết đồ đã sẵn sàng; Mai Anh biết rõ ai đã được báo.

---

### Bước 6 — Bàn giao ca ngay trong hàng đợi công việc `17:50 · Cuối ca`

Trước khi kết thúc ca, Mai Anh vẫn ở màn hình hàng đợi và chuyển sang chế độ **“Bàn giao ca sau”**. Hàng đợi tự gom các đơn chưa hoàn tất; mỗi đơn cho biết **trạng thái hiện tại, công đoạn/vị trí, người phụ trách, giờ hẹn, ngoại lệ và việc cần làm tiếp theo**.

Mai Anh rà lại thông tin thực tế, bổ sung lưu ý nếu cần. Khi vào ca, đồng nghiệp mở mục **“Ca trước bàn giao”** trên chính hàng đợi và đọc ngay dòng tóm tắt **“đang ở đâu, ai phụ trách, làm gì tiếp theo”**.

> **Phản hồi hiển thị:** Hàng đợi › Bàn giao ca sau · 3 đơn chưa hoàn tất · Chọn người tiếp nhận · Xác nhận bàn giao

- **Tương tác mới:** Xem bàn giao ca trước và tạo bàn giao ca sau ngay trong hàng đợi công việc thông minh.
- **Kết quả:** Ca sau biết rõ phần việc cần tiếp tục; G3 — Bàn giao được hoàn thành trong câu chuyện.

---

## Ba cải tiến chính của quy trình mới

| Cải tiến chính                                  | Các tương tác được lồng từ Value Proposition                            | Giá trị đối với Mai Anh                                                                                                                                                                             |
| ----------------------------------------------- | ----------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **1 · Hàng đợi công việc thông minh**           | `//PR1`, `//PR3`, `//PR5`, `//PR11`, `//GC1`, `//GC3`, `//GC4`, `//GC5` | Đề xuất đơn có lý do; cho phép đổi thứ tự; hiển thị trạng thái, vị trí, người phụ trách và việc tiếp theo; nhắc việc cần chú ý; cho xem bàn giao ca trước và tạo bàn giao ca sau trên cùng hàng đợi |
| **2 · Kiểm tra tính khả thi của giờ khách hẹn** | `//PR9`, `//GC9`, `//GC10`                                              | Ước tính từ tải máy, hàng chờ, thời lượng công đoạn, loại dịch vụ và thời gian dự phòng; hiển thị ba mức khả thi, khoảng hoàn thành, giờ gần nhất và timeline công đoạn                             |
| **3 · Cập nhật tiến trình và thông báo khách**  | `//PR7`, `//GC8`                                                        | Cập nhật theo trạng thái đơn; gửi tự động khi có kênh phù hợp hoặc soạn sẵn để nhân viên duyệt; lưu lịch sử và trạng thái gửi                                                                       |

---

## Liên kết với Scenario 1 và Goal

| Nguồn vấn đề                                                 | Cải tiến chính trong Scenario 2                                                           | Goal được hỗ trợ                |
| ------------------------------------------------------------ | ----------------------------------------------------------------------------------------- | ------------------------------- |
| **S1-P1 — Hàng đợi thủ công / VP-P1**                        | **1 — Hàng đợi thông minh:** đề xuất có lý do, quyền đổi thứ tự và thông tin đơn hợp nhất | G1 — Điều phối; G5 — Chất lượng |
| **VP-P2/P3 — Thông tin phân tán và bàn giao thiếu ngữ cảnh** | **1 — Hàng đợi thông minh:** xem ca trước bàn giao và tạo bàn giao cho ca sau             | G3 — Bàn giao; G5 — Chất lượng  |
| **S1-P3 — Phát hiện trễ muộn / VP-P5**                       | **1 + 2:** hàng đợi cảnh báo việc cần chú ý; thời gian khả thi được tính lại              | G2 — Đúng hẹn; G5 — Chất lượng  |
| **S1-P2 — Hẹn giờ theo cảm tính / VP-P2b**                   | **2 — Kiểm tra giờ hẹn:** ba mức khả thi, khoảng hoàn thành, giờ gần nhất và timeline     | G2 — Đúng hẹn                   |
| **S1-P4 — Thông báo thủ công / VP-P4**                       | **3 — Cập nhật và thông báo:** nội dung theo tiến trình, gửi hoặc duyệt, lưu lịch sử      | G4 — Giao tiếp khách hàng       |

---

## Chú thích bằng chứng

- **Finding:** quy tắc ưu tiên đơn đến trước/đơn gấp, không gộp đồ, nhắn Zalo thủ công và nguy cơ phát hiện trễ muộn được lấy từ tài liệu phỏng vấn trong `inputs/`.
- **Giả định thiết kế cần kiểm thử:** mức hữu ích của ba cải tiến chính; cách xem bàn giao ca trước/ca sau trong hàng đợi; độ chính xác của ba mức khả thi; thời điểm/nhịp nhắc; và lựa chọn gửi tự động hay yêu cầu nhân viên duyệt.
- **Dữ liệu mô phỏng:** giờ 15:15, 16:00, 16:05 và 17:50; khoảng hoàn thành 15:00–15:10 và 17:40–18:00; số đơn bị ảnh hưởng, số đơn bàn giao và trạng thái gửi.

## Gợi ý gen ảnh PNG

- Dùng bố cục dọc; có thể tăng chiều cao lên khoảng **3916 × 10000 px** để sáu bước vẫn dễ đọc.
- Giữ bốn thẻ bối cảnh; năm bước đầu so sánh 1–1 với Scenario 1, bước 6 thể hiện bàn giao như một phần của hàng đợi công việc thông minh.
- Màu trạng thái: xanh lá — **Khả thi/Đã gửi**; vàng — **Có rủi ro**; đỏ — **Không khả thi**. Luôn kèm nhãn chữ.
- Dùng card trắng, bo góc, bóng nhẹ, nền xám nhạt và điểm nhấn cam giống ảnh tham chiếu.
- Nếu cần rút gọn để vừa ảnh, ưu tiên giữ: thời gian, tên bước, hành động của Mai Anh, phản hồi chính, tương tác mới và kết quả.
