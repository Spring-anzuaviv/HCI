# Value Proposition Canvas

> **Deliverable:** Value Proposition  
> **Persona:** Mai Anh Nguyễn, nhân viên vận hành mới tại cửa hàng giặt ủi có nhiều máy, nhiều đơn và làm việc theo ca.  
> **Phạm vi:** Prototype HCI hỗ trợ điều phối và bàn giao đơn; không phải hệ thống production và không điều khiển máy giặt/sấy thật.

## Quy ước bằng chứng

- **[F] Finding:** câu trả lời trực tiếp của người được phỏng vấn.
- **[S] Synthesis:** tổng hợp thận trọng từ finding và Persona.
- **[A] Assumption:** giả định từ định hướng dự án hoặc suy luận chưa được xác nhận.
- **[OQ] Open question:** điểm cần hỏi hoặc quan sát thêm.

## 1. Customer Segment và bối cảnh

**Nhóm người dùng:** Nhân viên trực tiếp tiếp nhận, xử lý, theo dõi và bàn giao đơn giặt ủi; ưu tiên xem xét nhân viên mới như Mai Anh.

**Bối cảnh công việc:** Nhân viên làm theo ca, tiếp nhận các đơn ở nhiều công đoạn, chọn đơn đưa vào máy, theo dõi máy, chuyển đồ, đóng gói và để lại phần việc cho ca sau. Thông tin hiện được xem trên POS/điện thoại, bill dán trên túi, trạng thái thực tế của đồ/máy và giấy bàn giao. [F][S]

**Nhu cầu cốt lõi:** Hoàn thành đúng yêu cầu của khách, giữ từng đơn riêng biệt, biết việc cần tiếp tục và bàn giao đủ thông tin mà vẫn giữ quyền tự điều chỉnh khi tình huống thực tế thay đổi. [S]

## 2. Customer Profile

### Customer Jobs

| Mã | Công việc cần hoàn thành | Kết quả được xem là thành công | Bằng chứng |
| --- | --- | --- | --- |
| J1 | Tiếp nhận và nhận diện đúng đơn, yêu cầu đặc biệt và giờ khách muốn nhận | Đúng thông tin đơn và đúng túi đồ | Bill được in và dán lên túi để xem thông tin; không gộp đồ các đơn khác nhau. [F: PV-01] |
| J2 | Chọn đơn hoặc mẻ tiếp theo khi có nhiều đơn cần xử lý | Đơn đến trước được xử lý trước, đơn gấp được đôn lên khi cần | [F: PV-01, PV-03] |
| J3 | Theo dõi và chuyển đơn qua các công đoạn giặt/sấy/đóng gói | Không bỏ qua bước xử lý; máy hoàn tất thì đồ được lấy và chuyển tiếp | Máy có tiếng báo khi xong; nhân viên thường ngồi trực liên tục. [F: PV-03] |
| J4 | Cập nhật tiến độ và thông báo khi đồ hoàn tất | Khách biết đến lấy khi đơn đã giặt xong | Nhân viên nhắn khách qua Zalo sau khi giặt xong. [F: PV-01] |
| J5 | Kết thúc ca và để ca sau tiếp tục đơn chưa xong | Ca sau biết đơn nào đã làm và cần làm tiếp | Đơn chưa xử lý hết được để bạn ca sau làm; tiến độ được note trên điện thoại và bàn giao bằng giấy. [F: PV-02, PV-03] |

### Customer Pains

| Mã | Khó khăn, rủi ro hoặc cảm xúc tiêu cực | Trạng thái bằng chứng |
| --- | --- | --- |
| P1 | Khi cần đôn đơn gấp, thứ tự xử lý phải được quyết định từ thông tin về đơn và giờ lấy; cách ưu tiên hiện được mô tả ngắn gọn, chưa có lý do hoặc thứ tự được hiển thị tập trung. | [F] Có quy tắc đến trước và đôn đơn gấp. Phần “khó hiểu lý do/thiếu tập trung” là [S]/[A] từ Persona. |
| P2 | Thông tin tiến độ nằm ở nhiều nơi: POS/điện thoại, bill giấy, máy và giấy bàn giao; nhân viên phải đối chiếu giữa các nguồn. | [F] PV-01, PV-02, PV-03; mức độ tốn thời gian chưa được đo. |
| P3 | Khi đơn chưa xong trong ca, ghi chú hoặc một note ngắn có thể chưa cho ca sau biết đầy đủ công đoạn, vị trí, ngoại lệ và việc tiếp theo. | [F] Có note trên điện thoại và giấy bàn giao; phần thiếu ngữ cảnh là [S]/[OQ]. |
| P4 | Cập nhật khách sau khi hoàn tất phụ thuộc vào thao tác nhắn Zalo thủ công; việc gửi muộn hoặc không nhất quán chưa được xác nhận. | [F] Có nhắn Zalo sau khi giặt xong; hậu quả là [A]/[OQ]. |
| P2b | Chưa có bức tranh tổng hợp về máy đang hoạt động, hàng chờ, thời lượng các công đoạn và thời gian dự phòng để biết giờ khách hẹn có khả thi hay không. | [A]/[OQ]. Đây là pain trong Persona, nhưng chưa được người tham gia xác nhận trực tiếp. |
| P5 | Nguy cơ quên máy, làm trùng đơn, bỏ quên đồ hoặc trễ hẹn khi đông đơn/hỏng máy/chờ kéo dài chưa được xác nhận từ ba cuộc phỏng vấn. | [A]/[OQ], không dùng làm finding. PV-03 cho biết hiện thường ngồi trực và chưa thấy làm trùng. |

### Customer Gains

| Mã | Kết quả người dùng mong muốn | Loại | Bằng chứng |
| --- | --- | --- | --- |
| G1 | Biết đơn nào nên xử lý tiếp theo dựa trên quy tắc dễ hiểu, đồng thời có thể tự đổi thứ tự khi khách yêu cầu gấp hoặc tình huống thay đổi. | Expected | [F] Quy tắc hiện tại; [S] từ Goal G1 và Need N1 của Persona. |
| G2 | Xem tiến độ của đơn và thông tin liên quan trong một nơi thay vì phải nhớ hoặc đối chiếu nhiều nguồn. | Desired | [S] từ P2, Goal G2/G3 và Need N3; chưa đo mức tiết kiệm. |
| G3 | Bàn giao nhanh, để ca sau tiếp tục được ngay với trạng thái, công đoạn và việc kế tiếp rõ ràng. | Expected | [F] PV-02/PV-03 cho thấy có bàn giao bằng giấy và bạn ca sau tiếp tục; kết quả “tiếp tục được ngay” là [S]. |
| G4 | Thông báo cho khách nhất quán khi đơn sẵn sàng hoặc thời gian dự kiến thay đổi, với ít thao tác lặp lại hơn. | Desired | [F] Có nhắn Zalo khi giặt xong; phần giảm thao tác là [A]/[OQ]. |
| G5 | Giữ quyền kiểm soát và hiểu vì sao hệ thống gợi ý thứ tự, thay vì bị buộc làm theo một quyết định không giải thích được. | Desired | [S] từ Persona: nhân viên muốn tự xử lý ngoại lệ; cần kiểm chứng trực tiếp với người dùng. |
| G6 | Chốt được giờ nhận đồ có cơ sở, có thể giải thích cho khách và có khoảng dự phòng phù hợp. | Desired | [S]/[A] từ Goal G2, Need N2 và đề xuất kiểm tra tính khả thi; chưa được xác nhận trực tiếp. |

## 3. Value Map

### Products & Services

Đề xuất một **bộ công cụ hỗ trợ điều phối đơn trên điện thoại** cho prototype. Products & Services gồm nhiều thành phần độc lập:

1. **Hàng đợi công việc thông minh:** đề xuất đơn tiếp theo dựa trên thời điểm nhận đơn, giờ hẹn lấy, mức độ khẩn cấp, trạng thái đơn và loại máy phù hợp; hiển thị lý do và cho phép nhân viên chọn khác.
2. **Kiểm tra tính khả thi của giờ hẹn:** đối chiếu máy đang hoạt động, thời gian còn lại, đơn chờ, thời lượng giặt/sấy/đóng gói, loại dịch vụ và thời gian dự phòng; trả về mức khả thi, có rủi ro hoặc không khả thi cùng giờ gần nhất có thể đáp ứng.
3. **Theo dõi tiến trình đơn:** hiển thị trạng thái, công đoạn, người phụ trách, giờ hoàn thành dự kiến và hành động tiếp theo.
4. **Cập nhật tiến trình và thông báo khách:** cập nhật khoảng thời gian hoàn thành; soạn sẵn thông báo qua Zalo/SMS hoặc giao diện theo dõi để nhân viên kiểm tra rồi gửi. Khi chưa tích hợp gửi tự động, đây là luồng bán tự động.
5. **Bàn giao ca:** tạo bản tóm tắt các đơn chưa hoàn tất, gồm trạng thái, công đoạn, vị trí, người phụ trách, ngoại lệ và việc tiếp theo.
6. **Hồ sơ đơn hợp nhất:** tập trung thông tin đơn, giờ hẹn, yêu cầu đặc biệt và lịch sử cập nhật để giảm đối chiếu giữa các nguồn.

Các mục trên chỉ là phương tiện minh họa workflow; dữ liệu trong prototype là dữ liệu mô phỏng và trạng thái máy không được lấy tự động từ thiết bị thật.

### Pain Relievers

| Mã | Giá trị đề xuất | Pain được giải quyết | Cách giảm pain |
| --- | --- | --- | --- |
| PR1 | Gợi ý thứ tự xử lý theo “đến trước” và “gấp/giờ lấy sớm”, hiển thị lý do cạnh từng đơn và cho phép đổi thứ tự. | P1 | Giảm việc tự ghép thông tin khi chọn việc; vẫn giữ quyền quyết định của nhân viên. |
| PR2 | Gom trạng thái đơn, công đoạn, giờ lấy, người phụ trách và lưu ý vào cùng một màn hình chi tiết. | P2 | Giảm đối chiếu giữa note điện thoại, bill, vị trí đồ và trao đổi rời rạc. |
| PR3 | Tạo bản ghi bàn giao có trạng thái, công đoạn, vị trí, người phụ trách, ngoại lệ và bước tiếp theo. | P3 | Truyền ngữ cảnh cần thiết cho ca sau thay vì chỉ dựa vào giải thích miệng hoặc giấy ngắn. |
| PR4 | Cho phép chọn mẫu cập nhật dựa trên trạng thái đơn, xem lại nội dung trước khi gửi và ghi nhận đã thông báo. | P4 | Giảm thao tác soạn lại và làm rõ đơn nào đã được cập nhật khách. |
| PR5 | Ước tính khoảng hoàn thành từ tải máy, hàng chờ, thời lượng từng công đoạn và thời gian dự phòng; gắn nhãn khả thi, có rủi ro hoặc không khả thi. | P2b | Giúp nhân viên nhận ra giờ hẹn không an toàn trước khi chốt với khách; mức hiệu quả thực tế cần kiểm chứng. |
| PR6 | Chưa có Pain Reliever được xác nhận riêng cho việc quên máy, làm trùng hoặc trễ hẹn ngoài tình huống giờ hẹn không khả thi. | P5 | Đưa vào khoảng trống kiểm chứng; không tuyên bố prototype đã giải quyết pain chưa có bằng chứng. |

### Gain Creators

| Mã | Giá trị đề xuất | Gain được tạo | Cách người dùng nhận biết kết quả |
| --- | --- | --- | --- |
| GC1 | Giải thích ngắn gọn lý do xếp hạng và cho phép xác nhận hoặc kéo đổi thứ tự. | G1, G5 | Nhân viên thấy việc đề xuất, lý do và thứ tự mới sau khi điều chỉnh. |
| GC2 | Hiển thị một dòng tóm tắt “đang ở đâu, ai phụ trách, làm gì tiếp theo” trên mỗi đơn. | G2, G3 | Nhân viên và ca sau đọc được trạng thái mà không phải hỏi lại ngay. |
| GC3 | Tạo bản tóm tắt cuối ca từ các đơn chưa hoàn tất. | G3 | Người bàn giao có danh sách rõ; người nhận biết việc cần tiếp tục. |
| GC4 | Dùng trạng thái và nhãn chữ, không chỉ dùng màu, để giúp quét nhanh danh sách. | G2 | Nhân viên nhận ra đơn chờ, đang xử lý, cần tiếp tục hoặc đã hoàn tất bằng chữ và trạng thái. |
| GC5 | Hiển thị khoảng hoàn thành dự kiến, mức khả thi và giờ gần nhất có thể đáp ứng trước khi nhân viên chốt giờ hẹn. | G6 | Nhân viên có cơ sở giải thích và điều chỉnh giờ hẹn; đây là lợi ích đề xuất cần kiểm chứng. |
| GC6 | Cung cấp mẫu tin nhắn theo trạng thái nhưng để nhân viên kiểm tra và gửi. | G4, G5 | Nội dung nhất quán hơn mà nhân viên vẫn giữ quyền kiểm soát việc thông báo. |

## 4. Đối chiếu một-một

Bảng này là liên kết chính để đáp ứng yêu cầu các vấn đề, nhu cầu và giá trị đề xuất tương ứng với nhau.

| Vấn đề hiện tại | Nhu cầu tương ứng | Giá trị đề xuất tương ứng |
| --- | --- | --- |
| P1. Khó xác định thứ tự khi phải đôn đơn gấp và thiếu lý do hiển thị tập trung. | N1. Biết việc tiếp theo và lý do ưu tiên, nhưng vẫn được tự điều chỉnh. | V1. Bảng điều phối gợi ý thứ tự có giải thích và cho phép đổi thứ tự. |
| P2. Thông tin đơn và tiến độ phân tán trên POS/điện thoại, bill, máy và giấy. | N2. Xem thông tin xử lý liên quan trong một nơi để giảm đối chiếu. | V2. Hồ sơ đơn hợp nhất với trạng thái, công đoạn, giờ lấy, người phụ trách và lưu ý. |
| P3. Bàn giao ca có note nhưng chưa chắc đủ ngữ cảnh để tiếp tục. | N3. Bàn giao rõ trạng thái, vị trí/công đoạn, ngoại lệ và bước tiếp theo. | V3. Tóm tắt bàn giao ca có cấu trúc, được nhân viên xác nhận trước khi kết thúc ca. |
| P4. Thông báo khách sau khi hoàn tất cần nhắn thủ công qua Zalo. | N4. Truyền đạt tiến độ nhất quán với ít thao tác lặp lại, vẫn được kiểm tra trước khi gửi. | V4. Mẫu thông báo theo trạng thái, có xem lại và ghi nhận đã gửi. |
| P2b. Chưa có cơ sở tổng hợp để biết giờ khách hẹn có khả thi khi tải máy hoặc hàng chờ thay đổi. | N2b. Kiểm tra khả năng hoàn thành và chọn giờ hẹn có khoảng dự phòng phù hợp. | V5. Bộ kiểm tra tính khả thi trả về mức khả thi/rủi ro/không khả thi và giờ gần nhất có thể đáp ứng. |

P2b là pain được nêu trong Persona nhưng chưa được xác nhận trực tiếp qua câu trả lời phỏng vấn, nên V5 hiện là giả định thiết kế cần kiểm chứng. P5 chưa có finding đủ mạnh nên chưa đưa vào một value proposition riêng. Đây là điểm cần kiểm chứng trước khi thiết kế nhắc máy hoặc cảnh báo trễ hẹn.

## 5. FIT assessment

**Đánh giá sơ bộ: Có problem-solution fit ở mức ý tưởng prototype HCI cho bốn pain/need chính P1-P4; V5 cho P2b là hướng đề xuất cần kiểm chứng thêm.**

- **Jobs ↔ Products & Services:** bảng điều phối, hồ sơ đơn và bàn giao hỗ trợ các công việc chọn đơn, theo dõi tiến độ và tiếp tục việc qua ca.
- **Pains ↔ Pain Relievers:** PR1-PR5 giải quyết các pain có liên kết cụ thể; PR5 cho P2b được ghi rõ là giả định và không gán việc quên máy hoặc làm trùng khi chưa đủ bằng chứng.
- **Gains ↔ Gain Creators:** GC1-GC6 tạo khả năng xem lý do, giảm ghi nhớ, bàn giao rõ hơn, kiểm tra giờ hẹn và soạn thông báo nhất quán.
- **Nguyên tắc kiểm soát:** hệ thống chỉ gợi ý; nhân viên có thể xem lý do, xác nhận hoặc điều chỉnh thứ tự và nội dung gửi.

FIT này chưa chứng minh tính hiệu quả thực tế, mức độ chấp nhận, khả năng giảm lỗi hay product-market fit.

## 6. Assumptions và open questions

### Assumptions

- Cửa hàng có thể duy trì trạng thái đơn và công đoạn trên một danh sách chung trong prototype. [A]
- Nhân viên thấy việc xem lý do ưu tiên và xác nhận trước khi thay đổi là phù hợp với cách làm hiện tại. [A]
- Mẫu thông báo theo trạng thái có thể giảm thao tác lặp lại mà không làm mất quyền kiểm tra của nhân viên. [A]

### Open questions cần kiểm chứng

1. Trong những thời điểm nào cửa hàng thật sự có nhiều đơn và không còn máy trống?
2. Khi đôn một đơn gấp, nhân viên cần xem thêm thông tin nào để quyết định có khả thi không?
3. Một bản bàn giao tối thiểu phải có vị trí đồ, người phụ trách và ngoại lệ nào?
4. Nhân viên có từng quên đồ trong máy, làm trùng đơn, bỏ quên đơn hoặc phát hiện nguy cơ trễ hẹn không? Tần suất và hậu quả là gì?
5. Nhân viên muốn hệ thống chỉ ghi nhận trạng thái hay cũng muốn nhắc việc khi đang không ngồi trực?
6. Ai có quyền sửa thứ tự, trạng thái và nội dung thông báo trong ca?

## 7. Nguồn

- `templates/Persona.md`: Persona Mai Anh, goals, tasks, pain points, needs và motivations; các phần tổng hợp được giữ nhãn [S]/[A] theo quy ước của file.
- `docs/phong-van-1.md` (PV-01): POS, bill dán túi, không gộp đơn, nhắn Zalo, một nhân viên/ca và quy tắc ưu tiên.
- `docs/phong-van-2.md` (PV-02): câu trả lời về đôn đơn gấp và ghi giấy bàn giao; các dòng “Mục tiêu”/“Insight cần khai thác” không được dùng như finding.
- `docs/phong-van-3.md` (PV-03): cách ưu tiên, bạn ca sau tiếp tục, note trên điện thoại, máy báo tiếng, ngồi trực, đóng bao và đặt kệ.
- `docs/Rubric.md`: tiêu chí Value Proposition yêu cầu các mục tương ứng giữa Persona và giá trị đề xuất.
