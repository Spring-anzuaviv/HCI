# Scenario 2 — Skill

## Purpose

Skill này tạo **Scenario 2 — quy trình tương lai** nối trực tiếp với bản `outputs/assets/scenario-1.png` đã chỉnh sửa và các giá trị được người dùng đánh dấu `//` trong `outputs/value-proposition.md`. Kết quả là câu chuyện sáu mốc xoay quanh ba cải tiến chính, lấy Nguyễn Mai Anh làm nhân vật chính.

Năm mốc đầu giữ đúng tình huống của Scenario 1; mốc 6 tiếp nối đến cuối ca. **Bàn giao là use case con của hàng đợi công việc thông minh**: nhân viên xem “Ca trước bàn giao” khi vào ca và tạo “Bàn giao ca sau” trước khi kết thúc ca.

## Source priority

Khi các nguồn khác nhau, dùng thứ tự sau:

1. `outputs/assets/scenario-1.png` — chuẩn về bối cảnh, số bước, thời gian và pain cần nối tiếp.
2. `outputs/Persona.md` — chuẩn về Persona, goals, needs và quyền kiểm soát.
3. `outputs/value-proposition.md` — chuẩn về mapping pain/need; các dòng `//` là tương tác bắt buộc phải lồng vào Scenario 2.
4. Các file phỏng vấn — chuẩn về bằng chứng trực tiếp.
5. `outputs/scenario-1.md` — tài liệu mô tả hỗ trợ cho bản PNG.

Không lấy cảnh “chuyển công đoạn” từ file Markdown cũ. Cảnh bàn giao được thêm từ `//PR5`, `//GC5`, Persona và bằng chứng phỏng vấn, không sao chép từ Scenario 1 cũ.

## Domain knowledge

### Persona → Scenario → Goal

- **Persona** trả lời “Câu chuyện nói về ai?”
- **Scenario** trả lời “Khi nào, ở đâu và hành vi diễn ra theo trình tự nào?”
- **Goal** trả lời “Mai Anh muốn đạt điều gì và trạng thái nào kết thúc câu chuyện?”

Trong scenario này:

- **Persona:** Nguyễn Mai Anh, 20 tuổi, nhân viên trực tiếp tại cửa hàng giặt ủi Cosmo.
- **When:** Chiều thứ Sáu, thời điểm cuối tuần đông khách, từ 14:00 đến 17:50.
- **Where:** Khu tiếp nhận và khu vận hành của cửa hàng giặt ủi Cosmo.
- **How:** Kiểm tra giờ hẹn → dùng hàng đợi khi máy trống → cân nhắc đơn gấp → xử lý cảnh báo → cập nhật khách → bàn giao ngay trong hàng đợi.
- **Goal kết thúc:** Mai Anh đã cập nhật khách bị ảnh hưởng và ca sau biết đơn đang ở đâu, ai phụ trách, cần làm gì tiếp theo.

### Cấu trúc bắt buộc của mỗi khung

1. **Tác nhân bắt đầu:** điều vừa xảy ra trong cửa hàng.
2. **Hành động của Mai Anh:** điều cô xem, kiểm tra, chọn hoặc trao đổi.
3. **Phản hồi hỗ trợ:** thông tin được đưa ra đúng lúc.
4. **Quyết định/xác nhận:** cách Mai Anh giữ quyền kiểm soát.
5. **Trạng thái kết thúc:** đơn, hàng đợi, giờ hẹn hoặc thông báo chuyển sang trạng thái mới.

Một khung không đạt nếu chủ ngữ chỉ là “hệ thống tự động…” và không thể hiện Mai Anh nhìn thấy, hiểu hoặc quyết định gì.

### Evidence labels

- **`[F]` Finding:** nội dung người tham gia trả lời trực tiếp.
- **`[S]` Synthesis:** tổng hợp thận trọng từ finding hoặc artifact upstream.
- **`[A]` Assumption:** giả định thiết kế cần kiểm thử.
- **`[M]` Mock/Simulated:** thời gian, mã đơn, khoảng hoàn thành hoặc trạng thái dựng để minh họa.

## Continuity contract with Scenario 1

### Bối cảnh phải giữ nguyên

| Thuộc tính         | Nội dung chuẩn                       |
| ------------------ | ------------------------------------ |
| Persona            | Nguyễn Mai Anh, 20 tuổi              |
| Địa điểm           | Cửa hàng giặt ủi Cosmo               |
| Thời điểm          | Chiều thứ Sáu — cuối tuần đông khách |
| Tình trạng ban đầu | 6 đơn chờ xử lý, 3 máy đang chạy     |

### Đối chiếu năm khung và phần tiếp nối

| Khung | Sự kiện giữ lại từ Scenario 1                          | Điều phải thay đổi trong Scenario 2                               |
| ----: | ------------------------------------------------------ | ----------------------------------------------------------------- |
|     1 | 14:00, khách hỏi khoảng mấy giờ lấy được               | Mai Anh kiểm tra tính khả thi trước khi xác nhận                  |
|     2 | 14:15, máy giặt số 2 trống, còn 5 đơn chờ              | Mai Anh xem đề xuất có lý do và tự xác nhận/chọn khác             |
|     3 | 14:40, khách xin lấy sớm hơn 1 giờ                     | Mai Anh xem tác động lên các đơn khác trước khi đôn               |
|     4 | Hai đơn hẹn 17:30 có nguy cơ trễ                       | Cảnh báo xuất hiện lúc 16:00 thay vì chỉ nhận ra lúc 16:45        |
|     5 | Cần thông báo khách về đơn trễ hoặc đã xong            | Mai Anh duyệt nội dung soạn sẵn và thấy trạng thái gửi            |
|     6 | Tiếp nối cuối ca từ các mục `//` của Value Proposition | Trong hàng đợi, Mai Anh tạo “Bàn giao ca sau”; người tiếp nhận xem tại “Ca trước bàn giao” |

## Ba cải tiến chính

1. **Hàng đợi công việc thông minh:** gồm đề xuất và đổi thứ tự, thông tin đơn hợp nhất, nhắc việc và bàn giao giữa các ca. Bàn giao không đứng thành cải tiến độc lập.
2. **Kiểm tra tính khả thi của giờ khách hẹn:** gồm ba mức khả thi, khoảng hoàn thành, giờ gần nhất và timeline công đoạn.
3. **Cập nhật tiến trình và thông báo khách:** gồm cập nhật theo trạng thái, gửi tự động khi có kênh phù hợp hoặc soạn sẵn để nhân viên duyệt, cùng lịch sử gửi.

## Canonical Scenario 2

# Scenario 2 — Hệ thống tương lai

> **Một ca làm việc có hỗ trợ, nhân viên vẫn là người quyết định**

Mô tả cùng ca chiều thứ Sáu tại cửa hàng giặt ủi Cosmo qua ba cải tiến chính: hàng đợi công việc thông minh có bàn giao giữa các ca, kiểm tra tính khả thi của giờ hẹn, và cập nhật tiến trình–thông báo khách.

## Bối cảnh

| Thuộc tính             | Nội dung                             |
| ---------------------- | ------------------------------------ |
| **Persona**            | Nguyễn Mai Anh, 20 tuổi              |
| **Địa điểm**           | Cửa hàng giặt ủi Cosmo               |
| **Thời điểm**          | Chiều thứ Sáu — cuối tuần đông khách |
| **Tình trạng ban đầu** | 6 đơn chờ xử lý, 3 máy đang chạy     |

## Narrative: cầu nối từ Persona đến Goal

Trong ca chiều thứ Sáu đông khách, Mai Anh dùng hàng đợi thông minh để xem công việc trong ca và phần ca trước bàn giao. Khi máy trống, hàng đợi đề xuất đơn từ thời điểm nhận, giờ hẹn, mức khẩn cấp, trạng thái và loại máy phù hợp; cô xem lý do rồi xác nhận hoặc đổi thứ tự. Khi khách hỏi giờ lấy, Mai Anh xem ba mức khả thi, khoảng hoàn thành và giờ gần nhất trước khi xác nhận. Tiến trình thay đổi được phản ánh vào hàng đợi và nội dung cập nhật khách; thông báo có thể gửi tự động hoặc được soạn sẵn để Mai Anh duyệt. Cuối ca, cô tạo bàn giao ca sau ngay trên hàng đợi để đồng nghiệp tiếp tục từ cùng nguồn thông tin.

## Diễn biến theo sáu khung

### Khung 1 — Kiểm tra giờ hẹn trước khi xác nhận `14:00`

**Tác nhân bắt đầu:** Một khách mang đồ đến và hỏi: “Khoảng mấy giờ lấy được?” Cửa hàng đang có 6 đơn chờ và 3 máy đang chạy. `[S][M]`

**Hành động của Mai Anh:** Cô ghi nhận loại dịch vụ, yêu cầu của đơn và kiểm tra khả năng đáp ứng giờ 14:30 trước khi trả lời khách.

**Phản hồi hỗ trợ:** Từ tải máy, hàng đợi, thời lượng từng công đoạn và thời gian dự phòng, giờ 14:30 được ghi rõ là **“Không khả thi”**. Khoảng hoàn thành dự kiến là 15:00–15:10; giờ gần nhất có dự phòng là 15:15. Timeline giặt–sấy–hoàn tất giúp Mai Anh kiểm tra cách hình thành deadline; trạng thái có nhãn chữ và màu đỏ. `[A][M]` `//PR9` `//GC9` `//GC10`

**Quyết định/xác nhận:** Mai Anh giải thích ngắn gọn và đề nghị 15:15. Khách đồng ý; cô xác nhận giờ mới.

**Trạng thái kết thúc:** Đơn có giờ nhận đã thống nhất thay vì một lời hẹn dựa trên cảm tính.

**Tương tác mới:** Kiểm tra tính khả thi và đề xuất giờ gần nhất trước khi cam kết.

**Vấn đề → Goal:** P2 → G2, G5.

### Khung 2 — Chọn đơn tiếp theo với lý do rõ ràng `14:15`

**Tác nhân bắt đầu:** Máy giặt số 2 vừa trống; còn 5 đơn đang chờ. `[S][M]`

**Hành động của Mai Anh:** Cô mở hàng đợi, xem mục “Ca trước bàn giao” và danh sách trong ca. Một đơn được đưa lên đầu từ thời điểm nhận, giờ hẹn, mức khẩn cấp, trạng thái và loại máy phù hợp. Mai Anh đối chiếu yêu cầu trước khi chọn. `//PR1`

**Phản hồi hỗ trợ:** Ngay cạnh đề xuất có lý do **“còn 45 phút đến giờ hẹn, còn 2 công đoạn”** và dòng tóm tắt **“đang ở đâu, ai phụ trách, làm gì tiếp theo”**. Trạng thái có nhãn chữ, không chỉ có màu. Lựa chọn **“Chọn đơn khác”** và thao tác kéo đổi thứ tự vẫn hiển thị. `[A]` `//GC1` `//PR3` `//GC3` `//GC4`

**Quyết định/xác nhận:** Mai Anh thấy tình hình phù hợp nên xác nhận đơn được đề xuất và đưa đúng túi đồ vào máy số 2.

**Trạng thái kết thúc:** Hàng đợi cập nhật; đơn vừa chọn có trạng thái và người xử lý rõ ràng, còn phần việc từ ca trước vẫn được theo dõi trên cùng danh sách.

**Tương tác mới:** Đề xuất việc tiếp theo có giải thích, không phải mệnh lệnh bắt buộc.

**Vấn đề → Goal:** P1 → G1, G5.

### Khung 3 — Xem tác động trước khi đôn đơn gấp `14:40`

**Tác nhân bắt đầu:** Một khách gọi xin lấy đồ sớm hơn 1 giờ vì có việc đột xuất. `[F][S]`

**Hành động của Mai Anh:** Cô mở đơn gấp và chọn xem phương án đưa đơn này lên trước.

**Phản hồi hỗ trợ:** Mai Anh thấy giờ hoàn thành dự kiến của đơn gấp, dòng tóm tắt trạng thái của các đơn liên quan và những đơn nào có thể chuyển sang **“Có rủi ro”** nếu thay đổi thứ tự. Lý do và tác động được ghi bằng chữ, không chỉ bằng màu vàng. `[A]` `//PR3` `//GC3` `//GC4`

**Quyết định/xác nhận:** Mai Anh kiểm tra tình hình máy thực tế rồi chọn phương án phù hợp. Cô có thể đôn đơn, chọn máy vừa trống hoặc giữ thứ tự cũ; lý do điều chỉnh được ghi lại.

**Trạng thái kết thúc:** Thứ tự mới chỉ được áp dụng sau khi Mai Anh xác nhận; các đơn bị ảnh hưởng vẫn nhìn thấy được.

**Tương tác mới:** So sánh tác động trước khi đổi ưu tiên và giữ quyền quyết định cho nhân viên.

**Vấn đề → Goal:** P1 → G1, G2, G5.

### Khung 4 — Phát hiện nguy cơ trễ khi vẫn còn thời gian hành động `16:00`

**Tác nhân bắt đầu:** Sau thay đổi trong hàng đợi, hai đơn hẹn 17:30 vẫn còn nhiều công đoạn và có nguy cơ không kịp. `[S][M]`

**Hành động của Mai Anh:** Cô mở cảnh báo, xem nguyên nhân và các hành động có thể thực hiện.

**Phản hồi hỗ trợ:** Hai đơn được gắn nhãn **“Có rủi ro”**; timeline công đoạn còn lại và khoảng hoàn thành mới 17:40–18:00 được hiển thị. Việc khẩn được nhắc trên điện thoại; nếu sau 10–15 phút chưa được xác nhận, lời nhắc xuất hiện lại một lần và không lặp liên tục. Cảnh báo xuất hiện sớm hơn thời điểm 16:45 của Scenario 1. `[A][M]` `//PR11` `//GC4` `//GC10`

**Quyết định/xác nhận:** Mai Anh điều chỉnh thứ tự nếu không làm đơn khác trễ hơn; nếu không còn phương án an toàn, cô xác nhận khoảng giờ mới để báo khách. Cô không bỏ công đoạn cần thiết chỉ để giữ lời hẹn cũ.

**Trạng thái kết thúc:** Rủi ro đã có người xử lý và giờ dự kiến mới sẵn sàng để thông báo trước khi khách đến.

**Tương tác mới:** Cảnh báo sớm có lý do, khoảng hoàn thành và hành động tiếp theo.

**Vấn đề → Goal:** P3 → G2, G5.

### Khung 5 — Kiểm tra rồi gửi thông báo cho khách `16:05–17:00`

**Tác nhân bắt đầu:** Giờ dự kiến của hai đơn vừa thay đổi; những đơn khác lần lượt hoàn tất. `[S][M]`

**Hành động của Mai Anh:** Cập nhật được chuẩn bị theo trạng thái “Đã tiếp nhận”, “Đang sấy”, “Thời gian dự kiến thay đổi” hoặc “Sẵn sàng để nhận”. Nếu gửi tự động được bật, khách nhận thông tin theo trạng thái; nếu cần duyệt, Mai Anh kiểm tra, chỉnh rồi nhấn gửi. `//PR7`

**Phản hồi hỗ trợ:** Mỗi đơn hiển thị lịch sử thông báo, **“Đã gửi”** hoặc **“Chưa gửi”**, thời điểm và nội dung cập nhật gần nhất. `[A]` `//GC8`

**Quyết định/xác nhận:** Mai Anh là người duyệt nội dung cuối; cô có thể sửa hoặc chưa gửi nếu thông tin chưa đúng.

**Trạng thái kết thúc:** Khách bị ảnh hưởng biết khoảng thời gian mới, khách có đơn hoàn tất biết đồ sẵn sàng, và Mai Anh không còn phải nhớ ai đã được báo.

**Tương tác mới:** Nội dung soạn sẵn, bước duyệt của nhân viên và trạng thái gửi theo từng đơn.

**Vấn đề → Goal:** P4 → G4.

### Khung 6 — Bàn giao ca ngay trong hàng đợi công việc `17:50`

**Tác nhân bắt đầu:** Cuối ca còn ba đơn chưa hoàn tất. `[S][M]`

**Hành động của Mai Anh:** Trong hàng đợi, cô chọn “Bàn giao ca sau”; các đơn chưa hoàn tất được gom lại để cô rà thông tin, bổ sung ngoại lệ và chọn người tiếp nhận. `//GC5`

**Phản hồi hỗ trợ:** Mỗi đơn hiển thị trạng thái, công đoạn/vị trí, người phụ trách, giờ hẹn, ngoại lệ và bước tiếp theo; một dòng tóm tắt cho biết “đang ở đâu, ai phụ trách, làm gì tiếp theo”. `[A]` `//PR5` `//GC3`

**Quyết định/xác nhận:** Mai Anh kiểm tra lần cuối và xác nhận bàn giao. Đồng nghiệp mở “Ca trước bàn giao” trên cùng hàng đợi khi vào ca.

**Trạng thái kết thúc và điểm kết câu chuyện:** Khách liên quan đã được cập nhật, còn ca sau có đủ ngữ cảnh để tiếp tục các đơn chưa hoàn tất.

**Tương tác mới:** Xem bàn giao ca trước và tạo bàn giao ca sau bên trong hàng đợi công việc thông minh.

**Vấn đề → Goal:** VP-P3 → G3.

## Traceability: Scenario 1 → Scenario 2 → Goal

| Vấn đề trong Scenario 1         | Tương tác mới quan sát được                                                                | Kết quả công việc                                                  | Goal   |
| ------------------------------- | ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------ | ------ |
| P1 — Hàng đợi thủ công          | Đề xuất đơn có lý do; xem tác động và tự đổi thứ tự                                        | Mai Anh chọn việc tiếp theo có căn cứ nhưng vẫn kiểm soát ngoại lệ | G1, G5 |
| P2 — Hẹn giờ theo cảm tính      | Kiểm tra mức khả thi, khoảng hoàn thành và giờ gần nhất trước khi xác nhận                 | Giờ hẹn được thống nhất trên cơ sở tải hiện tại                    | G2     |
| P3 — Phát hiện trễ muộn         | Cảnh báo lúc 16:00 với lý do, khoảng giờ mới và hành động                                  | Mai Anh còn thời gian xử lý hoặc báo khách trước                   | G2, G5 |
| P4 — Thông báo thủ công         | Nội dung soạn sẵn được duyệt; có trạng thái và thời điểm gửi                               | Khách được cập nhật nhất quán; Mai Anh biết ai đã được báo         | G4     |
| VP-P2 — Thông tin phân tán      | Hàng đợi có trạng thái, vị trí, người phụ trách và việc tiếp theo; trạng thái có nhãn chữ | Mai Anh và ca sau dùng cùng một nguồn thông tin | G1, G3 |
| VP-P3 — Bàn giao thiếu ngữ cảnh | Trong hàng đợi: xem “Ca trước bàn giao” và tạo “Bàn giao ca sau” | Ca sau biết ngay phần việc cần tiếp tục | G3 |

## Goal coverage

- G1, G2, G3 và G4 được minh họa trực tiếp bằng quyết định hoặc trạng thái kết thúc.
- G5 là nguyên tắc chất lượng xuyên suốt: giữ riêng từng đơn, kiểm tra yêu cầu và không bỏ công đoạn cần thiết để chạy theo deadline.
- G3 là kết quả của use case bàn giao nằm bên trong hàng đợi công việc thông minh.

## Drawing specification

### Canvas và bố cục

- Dùng tỷ lệ dọc tương đương Scenario 1; có thể tăng chiều cao từ 8552 lên khoảng 10000 px để sáu khung vẫn đọc rõ.
- Nền xám rất nhạt; nội dung nằm trong một cột chính, lề rộng.
- Đầu trang gồm nhãn capsule, tiêu đề lớn, mô tả và bốn thẻ bối cảnh.
- Phần giữa là timeline dọc sáu khung đánh số 1–6.
- Cuối trang là vùng tổng kết ba cải tiến chính; các tương tác con được đặt dưới đúng nhóm.

### Copy đầu trang

- Nhãn: **“SCENARIO 2 · HỆ THỐNG TƯƠNG LAI”**.
- Tiêu đề: **“Một ca làm việc có hỗ trợ, nhân viên vẫn là người quyết định”**.
- Mô tả: **“Cùng tình huống tại cửa hàng giặt ủi Cosmo qua ba cải tiến chính: hàng đợi công việc thông minh có bàn giao giữa các ca, kiểm tra tính khả thi của giờ hẹn, và cập nhật tiến trình–thông báo khách.”**

### Phong cách khung

- Giữ card trắng, góc bo, bóng nhẹ và timeline bên trái giống Scenario 1.
- Mỗi card có: thời gian, tên bước, đoạn diễn biến, một vùng phản hồi hỗ trợ và 1–2 nhãn tương tác mới.
- Mốc 4 dùng điểm nhấn vàng vì “Có rủi ro”, nhưng phải có nhãn chữ.
- Kết quả tích cực dùng xanh lá đi kèm từ như “Đã xác nhận”, “Đã xử lý”, “Đã gửi”.
- Cam dùng cho nhãn đầu trang và điểm nhấn tiêu đề để giữ ngôn ngữ hình ảnh chung.
- Không dùng màu làm dấu hiệu duy nhất.

### Ba thẻ tổng kết

| Cải tiến chính | Nội dung ngắn |
| --- | --- |
| 1 · Hàng đợi công việc thông minh | Đề xuất có lý do, quyền đổi thứ tự, thông tin đơn hợp nhất, nhắc việc, xem bàn giao ca trước và tạo bàn giao ca sau |
| 2 · Kiểm tra tính khả thi của giờ khách hẹn | Ba mức khả thi, khoảng hoàn thành, giờ gần nhất và timeline công đoạn |
| 3 · Cập nhật tiến trình và thông báo khách | Cập nhật theo trạng thái, gửi tự động hoặc duyệt trước khi gửi, lịch sử và trạng thái gửi |

## Reasoning / inference strategy

1. Bắt đầu từ năm cảnh trong Scenario 1 mới và các mục `//` được người dùng chọn trong Value Proposition.
2. Giữ nguyên Persona, cửa hàng, ca làm việc và tình trạng ban đầu.
3. Với mỗi cảnh, xác định pain đang cản Mai Anh hoàn thành việc gì.
4. Chọn tương tác nhỏ nhất giải quyết pain đó và thể hiện bằng hành vi quan sát được.
5. Luôn cho Mai Anh xem lý do và xác nhận ở quyết định có ảnh hưởng đến thứ tự hoặc khách hàng.
6. Không giải quyết trễ hẹn bằng cách bỏ công đoạn hoặc giảm chất lượng.
7. Kết thúc bằng trạng thái công việc có thể kiểm tra, không bằng cảm xúc chung chung.
8. Ghi rõ giả định và dữ liệu mô phỏng; không biến chúng thành finding.
9. Kiểm tra năm khung đầu đối chiếu 1–1; khung 6 phải tiếp nối hợp lý đến cuối ca.
10. Xác nhận cả 13 mục `//` đều xuất hiện bằng hành vi hoặc phản hồi cụ thể.
11. Xác nhận bàn giao và nhắc việc được phân nhóm trong hàng đợi, không đứng thành cải tiến chính độc lập.

## Rules

- Viết bằng tiếng Việt, ngắn gọn và dùng thuật ngữ quen thuộc với nhân viên giặt ủi.
- Không dùng code, thuật toán, kiến trúc, tên công nghệ hoặc chi tiết tích hợp trong scenario.
- Không mô tả hệ thống như đang điều khiển máy thật.
- Không tự tạo quote, số đo hiệu quả, tần suất lỗi hoặc phản hồi người dùng.
- Không biến dữ liệu mô phỏng thành bằng chứng nghiên cứu.
- Không để hỗ trợ tự động tước quyền chọn, sửa hoặc xác nhận của Mai Anh.
- Không thêm cảnh chuyển công đoạn hoặc chức năng ngoài năm cảnh chuẩn và các mục `//` đã chọn.
- Không dùng màu làm tín hiệu duy nhất.
- Không trình bày bản bàn giao như finding về hiệu quả; đây vẫn là đề xuất cần kiểm thử.

## Validation rules

### Continuity

- [ ] Persona là Nguyễn Mai Anh, 20 tuổi.
- [ ] Địa điểm là cửa hàng giặt ủi Cosmo.
- [ ] Thời điểm là chiều thứ Sáu, cuối tuần đông khách.
- [ ] Tình trạng đầu là 6 đơn chờ xử lý, 3 máy đang chạy.
- [ ] Có sáu khung; năm khung đầu nối 1–1 với Scenario 1 và khung 6 tiếp nối đến cuối ca.
- [ ] Không còn cảnh chuyển công đoạn của phiên bản cũ.

### Interaction and goals

- [ ] Khung 1 thể hiện kiểm tra khả thi trước khi xác nhận giờ.
- [ ] Khung 2 thể hiện đề xuất có lý do và quyền chọn khác.
- [ ] Khung 3 thể hiện tác động trước khi đôn đơn.
- [ ] Khung 4 cảnh báo sớm hơn 16:45 và có hành động tiếp theo.
- [ ] Khung 5 có nội dung soạn sẵn, bước duyệt và trạng thái gửi.
- [ ] Khung 6 có bản tóm tắt các đơn chưa hoàn tất và đủ ngữ cảnh bàn giao.
- [ ] Khung 2 cho phép xem ca trước bàn giao; khung 6 tạo bàn giao ca sau trong cùng hàng đợi.
- [ ] G1, G2, G3, G4 được thể hiện trực tiếp; G5 là ràng buộc xuyên suốt.
- [ ] Đã lồng PR1, PR3, PR5, PR7, PR9, PR11, GC1, GC3, GC4, GC5, GC8, GC9 và GC10.
- [ ] Bản tổng kết chỉ có ba cải tiến chính; bàn giao không bị tách thành cải tiến thứ tư.

### Evidence and presentation

- [ ] P1–P4 đều có tương tác mới tương ứng.
- [ ] Trạng thái xanh/vàng/đỏ có nhãn chữ.
- [ ] Giả định và dữ liệu mô phỏng có chú thích.
- [ ] Chữ đọc được ở kích thước trình bày và timeline quét từ trên xuống rõ ràng.
- [ ] Không có tuyên bố hiệu quả chưa kiểm chứng.

## Failure handling

### Scenario 2 không khớp Scenario 1 mới

- Dùng PNG làm nguồn chuẩn.
- Xóa các khung không có đối ứng trong PNG hoặc không bắt nguồn từ các mục `//`.
- Khôi phục đúng tên Persona, địa điểm, năm thời điểm đầu và P1–P4; giữ khung 6 như phần tiếp nối.

### Scenario biến thành danh sách tính năng

- Viết lại mỗi mục theo chủ thể Mai Anh.
- Bổ sung tác nhân, hành động, phản hồi, quyết định và trạng thái kết thúc.
- Loại nội dung không thể minh họa trong đúng ca làm việc.

### Hỗ trợ quyết định thay nhân viên

- Bổ sung lý do, lựa chọn “chọn khác”, bước xem tác động hoặc bước duyệt.
- Chỉ cập nhật trạng thái sau khi Mai Anh xác nhận hành động quan trọng.

### Không đủ chỗ khi gen ảnh

- Giữ thời gian, tên bước, hành động của Mai Anh, phản hồi chính và tương tác mới.
- Rút gọn chi tiết mô phỏng trước.
- Không bỏ quyền quyết định hoặc trạng thái kết thúc.

## Boundaries

Skill này không:

- Thay thế phỏng vấn, quan sát hoặc usability testing.
- Chứng minh giải pháp làm nhanh hơn, ít lỗi hơn hoặc được chấp nhận.
- Thiết kế giao diện chi tiết, triển khai phần mềm hoặc tích hợp kênh thật.
- Điều khiển thiết bị hoặc sử dụng dữ liệu khách hàng thật.
- Tuyên bố bản bàn giao đã được người dùng kiểm thử hoặc đã chứng minh hiệu quả.

## Sources

- `outputs/assets/scenario-1.png`
- `outputs/Persona.md`
- `outputs/value-proposition.md`
- `inputs/phong-van-1.md`
- `inputs/phong-van-2.md`
- `inputs/phong-van-3.md`
- `inputs/phong-van-bo-sung.md`
- `inputs/Rubric.md`
- `rules/HCI.md`
- `rules/quality.md`
- `rules/reasoning.md`
- `rules/style.md`
