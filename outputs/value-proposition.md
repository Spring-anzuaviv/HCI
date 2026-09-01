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

| Mã  | Công việc cần hoàn thành                                                 | Kết quả được xem là thành công                                                                                                                                | Bằng chứng                                                                                                                            |
| --- | ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| J1  | Tiếp nhận và nhận diện đúng đơn, yêu cầu đặc biệt và giờ khách muốn nhận | Đúng thông tin đơn và đúng túi đồ                                                                                                                             | Bill được in và dán lên túi để xem thông tin; không gộp đồ các đơn khác nhau. [F: PV-01]                                              |
| J2  | Chọn đơn hoặc mẻ tiếp theo khi có nhiều đơn cần xử lý                    | Đơn được ưu tiên dựa trên giờ hẹn, khối lượng, loại dịch vụ, công đoạn, máy, hàng chờ và yêu cầu đặc biệt; đơn gấp không làm các đơn khác trễ không kiểm soát | Khi đôn đơn gấp cần xem nhiều yếu tố cùng lúc, không chỉ thứ tự đơn. [F: Câu trả lời bổ sung]                                         |
| J3  | Theo dõi và chuyển đơn qua các công đoạn giặt/sấy/đóng gói               | Không bỏ qua bước xử lý; máy hoàn tất thì đồ được lấy và chuyển tiếp đúng lúc                                                                                 | Máy có tiếng báo khi xong; thông báo chủ động được mong muốn khi nhân viên không ngồi trước màn hình. [F: PV-03, Câu trả lời bổ sung] |
| J4  | Cập nhật tiến độ và thông báo khi đồ hoàn tất                            | Khách biết đến lấy khi đơn đã giặt xong                                                                                                                       | Nhân viên nhắn khách qua Zalo sau khi giặt xong. [F: PV-01]                                                                           |
| J5  | Kết thúc ca và để ca sau tiếp tục đơn chưa xong                          | Ca sau có thể tiếp tục ngay từ mã/tên đơn, trạng thái, vị trí, người phụ trách, giờ hẹn, ngoại lệ và việc cần làm                                             | Bản bàn giao tối thiểu cần các trường thông tin và ngoại lệ cụ thể. [F: PV-02, PV-03, Câu trả lời bổ sung]                            |

### Customer Pains

| Mã  | Khó khăn, rủi ro hoặc cảm xúc tiêu cực                                                                                                                                                | Trạng thái bằng chứng                                                                                                                                         |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P1  | Khi cần đôn đơn gấp, nhân viên phải tự đối chiếu giờ lấy, khối lượng, loại dịch vụ, công đoạn, máy đang chạy, hàng chờ và yêu cầu đặc biệt để biết có làm các đơn khác trễ hay không. | [F] Câu trả lời bổ sung cho biết không thể chỉ nhìn thứ tự đơn; các thông tin cần xem đã được nêu cụ thể.                                                     |
| P2  | Thông tin tiến độ nằm ở nhiều nơi: POS/điện thoại, bill giấy, máy và giấy bàn giao; nhân viên phải đối chiếu giữa các nguồn.                                                          | [F] PV-01, PV-02, PV-03; mức độ tốn thời gian chưa được đo.                                                                                                   |
| P3  | Khi đơn chưa xong trong ca, ghi chú hoặc một note ngắn có thể chưa cho ca sau biết đầy đủ công đoạn, vị trí, ngoại lệ và việc tiếp theo.                                              | [F] Có note trên điện thoại và giấy bàn giao; phần thiếu ngữ cảnh là [S]/[OQ].                                                                                |
| P4  | Cập nhật khách sau khi hoàn tất phụ thuộc vào thao tác nhắn Zalo thủ công; việc gửi muộn hoặc không nhất quán chưa được xác nhận.                                                     | [F] Có nhắn Zalo sau khi giặt xong; hậu quả là [A]/[OQ].                                                                                                      |
| P2b | Nhiều đơn có cùng giờ hẹn khiến công suất máy còn nhưng không chắc kịp deadline; nhân viên phải ước lượng từ máy đang chạy, hàng chờ và thời lượng các công đoạn.                     | [F] Thường đông vào cuối tuần, buổi tối, ngày mưa kéo dài và sau lễ/Tết; vấn đề deadline trong khoảng thời gian ngắn được xác nhận trong câu trả lời bổ sung. |
| P5  | Khi đông đơn hoặc đổi ca, có thể quên đồ trong máy, bỏ sót đơn hoặc phát hiện nguy cơ trễ quá muộn; làm trùng chưa được ghi nhận vì đồ đã giặt xong được để nơi khác.                 | [F] Có thể xảy ra quên, bỏ sót và phát hiện trễ muộn; làm trùng không có trong câu trả lời bổ sung.                                                           |

### Customer Gains

| Mã  | Kết quả người dùng mong muốn                                                                                                                                                       | Loại     | Bằng chứng                                                                                                  |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ----------------------------------------------------------------------------------------------------------- |
| G1  | Biết đơn nào nên xử lý tiếp theo dựa trên giờ hẹn, khối lượng, loại dịch vụ, công đoạn, máy, hàng chờ và yêu cầu đặc biệt; đồng thời có thể tự đổi thứ tự khi tình huống thay đổi. | Expected | [F] Câu trả lời bổ sung; [S] từ Goal G1 và Need N1 của Persona.                                             |
| G2  | Xem tiến độ của đơn và thông tin liên quan trong một nơi thay vì phải nhớ hoặc đối chiếu nhiều nguồn.                                                                              | Desired  | [S] từ P2, Goal G2/G3 và Need N3; chưa đo mức tiết kiệm.                                                    |
| G3  | Bàn giao nhanh, để ca sau tiếp tục được ngay với trạng thái, công đoạn và việc kế tiếp rõ ràng.                                                                                    | Expected | [F] PV-02/PV-03 cho thấy có bàn giao bằng giấy và bạn ca sau tiếp tục; kết quả “tiếp tục được ngay” là [S]. |
| G4  | Thông báo cho khách nhất quán khi đơn hoàn tất, với ít thao tác lặp lại hơn.                                                                                                       | Desired  | [F] Có nhắn Zalo khi giặt xong; phần giảm thao tác là [A]/[OQ].                                             |
| G5  | Giữ quyền kiểm soát và hiểu vì sao hệ thống gợi ý thứ tự, thay vì bị buộc làm theo một quyết định không giải thích được.                                                           | Desired  | [S] từ Persona: nhân viên muốn tự xử lý ngoại lệ; cần kiểm chứng trực tiếp với người dùng.                  |
| G6  | Chốt được giờ nhận đồ có cơ sở, biết khi nào deadline có rủi ro và có thể giải thích cho khách.                                                                                    | Desired  | [F] Câu trả lời bổ sung xác nhận nhiều đơn cùng hẹn khiến khó chắc kịp deadline; [S] từ Goal G2 và Need N2. |
| G7  | Nhận được nhắc việc đúng lúc nhưng vẫn có quyền quyết định, không cần phải nhớ nhiều thông tin                                 | Desired  | [F] Câu trả lời bổ sung nêu quyền của nhân viên, trưởng ca/quản lý và chủ cửa hàng; [S] cho prototype.      |

## 3. Value Map

### Products & Services

Đề xuất một **bộ công cụ hỗ trợ điều phối đơn trên điện thoại** cho prototype. Products & Services gồm nhiều thành phần độc lập:

1. **Hàng đợi công việc thông minh:** Hỗ trợ nhân viên xác định và tổ chức thứ tự các đơn cần xử lý.
2. **Quản lý đơn hàng và tiến độ:** Cung cấp thông tin tập trung về đơn hàng và quá trình xử lý.
3. **Lập lịch và dự kiến thời gian hoàn thành:** Hỗ trợ tổ chức lịch sử dụng máy, ước tính thời gian hoàn thành và quản lý giờ hẹn.
4. **Nhắc việc và cảnh báo:** Hỗ trợ theo dõi các công việc cần xử lý và các trường hợp cần chú ý.
5. **Hỗ trợ bàn giao ca:** Cung cấp thông tin về công việc và các đơn chưa hoàn tất giữa các ca làm việc.
6. **Hỗ trợ thông báo khách hàng:** Hỗ trợ nhân viên chuẩn bị và thực hiện việc thông báo tình trạng đơn cho khách hàng.

Các mục trên chỉ là phương tiện minh họa workflow; dữ liệu trong prototype là dữ liệu mô phỏng và trạng thái máy không được lấy tự động từ thiết bị thật.

**Cập nhật từ câu trả lời bổ sung:** Nhắc việc ưu tiên hiển thị trên app/web; chỉ push điện thoại cho việc cần xử lý ngay, nhắc lại sau 10–15 phút nếu chưa xử lý và không nhắc liên tục. Các thay đổi ưu tiên hoặc người phụ trách của trưởng ca/quản lý phải lưu lịch sử và lý do.

### Pain Relievers
| Mã         | Giá trị đề xuất                                                                                                                                          | Pain | Cách giảm pain                                                                           |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | ---- | ---------------------------------------------------------------------------------------- |
| **//PR1** | Hệ thống gợi ý thứ tự xử lý dựa trên các yếu tố liên quan, hiển thị lý do và cho phép nhân viên đổi thứ tự. | P1 | Giảm việc phải tự tổng hợp nhiều thông tin. |
| PR2 | Hiển thị thời gian còn lại đến giờ hẹn trên từng đơn để nhân viên tự xác định đơn nào đang gần deadline. | P1 | Hỗ trợ nhận biết đơn gần deadline. |
| PR3 | Cho nhân viên tự gắn mức ưu tiên Cao / Vừa / Thấp để chủ động tổ chức thứ tự. | P1 | Hỗ trợ nhân viên tự tổ chức thứ tự. |
| PR4 | Chia danh sách thành các nhóm cần xử lý Ngay / Sắp tới / Có thể chờ dựa trên nguy cơ trễ. | P1 | Hỗ trợ nhận biết mức độ khẩn cấp. |
| **//PR5** | Gom trạng thái, công đoạn, giờ lấy, người phụ trách và lưu ý của đơn vào cùng một màn hình. | P2 | Tập trung thông tin đơn và tiến độ. |
| PR6 | Gắn QR trên túi đồ để nhân viên quét và mở trực tiếp thông tin, tiến độ của đơn. | P2 | Hỗ trợ mở nhanh thông tin đúng đơn. |
| **//PR7** | Hiển thị tóm tắt tình trạng các đơn chưa hoàn tất để ca sau nắm được ngay. | P3 | Hỗ trợ ca sau nắm tình trạng đơn. |
| PR8 | Cho nhân viên đánh dấu những đơn cần chú ý và để lại ghi chú ngắn. | P3 | Hỗ trợ nhận diện đơn cần chú ý. |
| PR9 | Cho phép ghi voice note đối với các đơn có tình huống đặc biệt. | P3 | Hỗ trợ truyền đạt tình huống đặc biệt. |
| **//PR10** | Hiển thị mẫu thông báo sẵn để nhân viên kiểm tra qua preview và gửi; đồng thời ghi nhận đã thông báo. | P4 | Hỗ trợ chuẩn bị và ghi nhận thông báo. |
| PR11 | Hiển thị nút mở nhanh Zalo để nhân viên tự nhắn. | P4 | Hỗ trợ mở nhanh kênh nhắn tin. |
| PR12 | Tự động gửi thông báo cho khách khi đơn hoàn tất. | P4 | Hỗ trợ gửi thông báo tự động. |
| PR13 | Tạo sẵn nội dung và sao chép vào clipboard để nhân viên dán vào ứng dụng nhắn tin. | P4 | Hỗ trợ chuẩn bị nội dung thông báo. |
| **//PR14** | Ước tính khoảng hoàn thành dựa trên tải máy, hàng chờ, thời lượng từng công đoạn, thời gian dự phòng, thời gian khách hẹn và hiển thị kết quả khả thi cùng thời gian khả thi. | P2b | Hỗ trợ đánh giá tính khả thi của giờ hẹn. |
| PR15 | Chỉ cho phép chọn giờ hẹn từ các slot mà hệ thống xác định còn đủ công suất. | P2b | Hỗ trợ chọn giờ hẹn còn khả năng đáp ứng. |
| **//PR16** | Nhắc việc chủ động trên app/web, chỉ nhắc những việc cần xử lý và nhắc lại sau khoảng 10-15 phút nếu chưa xử lý. | P5 | Hỗ trợ nhắc việc đúng lúc. |
| PR17 | Làm nổi bật hoặc đưa các đơn sắp deadline hay đứng quá lâu lên đầu danh sách. Tạo một danh sách Cần chú ý riêng, tự động đưa vào các đơn sắp trễ, đứng quá lâu hoặc máy đã hoàn tất nhưng chưa được xử lý. | P5 | Hỗ trợ nhận biết các trường hợp cần chú ý. |
                                                                                                                               

### Gain Creators

Mỗi Gain trong canvas phải có ít nhất 2 Gain Creators là các giải pháp design khác nhau; mỗi creator phải tạo ra gain bằng một cơ chế riêng.

| Mã         | Giá trị đề xuất                                                                         | Gain   | Cách người dùng nhận biết kết quả                                     |
| ---------- | --------------------------------------------------------------------------------------- | ------ | --------------------------------------------------------------------- |
| **//GC1** | Hiển thị danh sách có thứ tự các đơn hàng, công việc cần giải quyết tiếp theo và lý do ưu tiên. | G1 | Hỗ trợ biết đơn nào nên xử lý tiếp theo. |
| GC2 | Chỉ hiển thị một Next task duy nhất cho từng máy đang hoặc sắp trống. | G1 | Hỗ trợ tập trung vào một công việc tiếp theo. |
| **//GC3** | Hiển thị ngay trên mỗi đơn các thông tin quan trọng: công đoạn hiện tại, việc cần làm tiếp theo và thời gian dự kiến hoàn thành. | G2 | Hỗ trợ nắm nhanh tình trạng đơn. |
| GC4 | Cho phép nhân viên quét QR trên túi đồ để mở nhanh màn hình tiến độ và thông tin hiện tại của đúng đơn đó. | G2 | Hỗ trợ tra cứu đúng đơn. |
| **//GC5** | Hiển thị sơ đồ tiến trình của đơn theo chuỗi (ví dụ: Nhận đồ → Giặt → Sấy → Đóng gói → Sẵn sàng), đánh dấu công đoạn hiện tại và các công đoạn đã hoàn tất. | G2 | Hỗ trợ hiểu trực quan tiến trình. |
| **//GC6** | Có dashboard hiển thị tóm tắt tình trạng các đơn chưa hoàn tất. | G3 | Hỗ trợ bàn giao nhanh. |
| GC7 | Cho phép đánh dấu và ghi chú ngắn những đơn cần ca sau chú ý. | G3 | Hỗ trợ nhận diện đơn cần chú ý. |
| GC8 | Sinh tự động một bản Shift Summary cuối ca gồm đơn đang chạy, đơn đang chờ và đơn có nguy cơ trễ. | G3 | Hỗ trợ tổng hợp công việc cuối ca. |
| **//GC9** | Hiển thị mẫu thông báo sẵn để nhân viên kiểm tra và gửi. | G4 | Hỗ trợ thông báo khách với ít thao tác hơn. |
| GC10 | Cho phép gửi nhanh bằng một nút với nội dung được hệ thống tạo sẵn, không hiển thị bước preview. | G4 | Hỗ trợ gửi nhanh thông báo. |
| GC11 | Tự động gửi thông báo khi đơn hoặc toàn bộ nhóm đơn đạt trạng thái Đã hoàn thành. | G4 | Hỗ trợ tự động thông báo. |
| **//GC12** | Hiển thị khoảng hoàn thành dự kiến, mức rủi ro deadline và giờ gần nhất có thể đáp ứng. | G6 | Hỗ trợ chốt hoặc điều chỉnh giờ nhận. |
| GC13 | Chỉ cho phép nhân viên chọn giờ nhận trong các khung giờ mà hệ thống còn nhận thêm đơn, dựa trên giới hạn công suất của từng khung giờ. | G6 | Hỗ trợ chọn giờ nhận còn công suất. |
| **//GC14** | Hệ thống nhắc việc qua thông báo đúng thời điểm nhưng để nhân viên quyết định hành động xác nhận. | G7 | Hỗ trợ mà vẫn giữ quyền kiểm soát. |
| GC15 | Chỉ hiển thị cảnh báo và thông tin vận hành, không đưa ra yêu cầu bắt buộc hành động cụ thể. | G7 | Hỗ trợ theo dõi mà không bắt buộc hành động. |

## 4. Đối chiếu vấn đề, nhu cầu và giá trị

Bảng này đối chiếu các vấn đề, nhu cầu và giá trị đề xuất. Một vấn đề hoặc nhu cầu có thể có nhiều Pain Relievers hoặc Gain Creators tương ứng.

| Vấn đề hiện tại                                                                                  | Nhu cầu tương ứng                                                                                                   | Giá trị đề xuất tương ứng                                                                            |
| ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| P1. Khó xác định thứ tự khi phải đôn đơn gấp và thiếu lý do hiển thị tập trung.                  | N1. Biết việc tiếp theo và lý do ưu tiên, nhưng vẫn được tự điều chỉnh.                                             | V1. Bảng điều phối gợi ý thứ tự có giải thích và cho phép đổi thứ tự.                                |
| P2. Thông tin đơn và tiến độ phân tán trên POS/điện thoại, bill, máy và giấy.                    | N2. Xem thông tin xử lý liên quan trong một nơi để giảm đối chiếu.                                                  | V2. Hồ sơ đơn hợp nhất với trạng thái, công đoạn, giờ lấy, người phụ trách và lưu ý.                 |
| P3. Bàn giao ca có note nhưng chưa chắc đủ ngữ cảnh để tiếp tục.                                 | N3. Bàn giao rõ trạng thái, vị trí/công đoạn, ngoại lệ và bước tiếp theo.                                           | V3. Tóm tắt bàn giao ca có cấu trúc, được nhân viên xác nhận trước khi kết thúc ca.                  |
| P4. Thông báo khách sau khi hoàn tất cần nhắn thủ công qua Zalo.                                 | N4. Thông báo cho khách nhất quán khi đơn hoàn tất, với ít thao tác lặp lại hơn và vẫn được kiểm tra trước khi gửi. | V4. Mẫu thông báo khi đơn hoàn tất, có xem lại và ghi nhận đã gửi.                                   |
| P2b. Chưa có cơ sở tổng hợp để biết giờ khách hẹn có khả thi khi tải máy hoặc hàng chờ thay đổi. | N2b. Kiểm tra khả năng hoàn thành và chọn giờ hẹn có khoảng dự phòng phù hợp.                                       | V5. Bộ kiểm tra tính khả thi trả về mức khả thi/rủi ro/không khả thi và giờ gần nhất có thể đáp ứng. |
| P5. Có thể quên đồ, bỏ sót đơn hoặc phát hiện nguy cơ trễ quá muộn khi đông đơn hoặc đổi ca.     | N5. Được nhắc đúng lúc về việc có deadline và nguy cơ trễ, nhưng vẫn kiểm soát hành động xử lý.                     | V6. Nhắc việc chủ động trên điện thoại theo trạng thái, deadline và thời gian đứng yên.              |

P2b và P5 đã có câu trả lời bổ sung làm rõ bối cảnh và rủi ro. V5 và V6 vẫn là các đề xuất prototype cần kiểm chứng về độ chính xác, mức độ hữu ích và khả năng tránh gây gián đoạn.

## 5. FIT assessment

**Đánh giá sơ bộ: Có problem-solution fit ở mức ý tưởng prototype HCI cho các pain/need P1-P5; mức hiệu quả của nhắc việc và kiểm tra deadline vẫn cần kiểm chứng bằng prototype.**

- **Jobs ↔ Products & Services:** bảng điều phối, hồ sơ đơn và bàn giao hỗ trợ các công việc chọn đơn, theo dõi tiến độ và tiếp tục việc qua ca.
- **Pains ↔ Pain Relievers:** PR1-PR17 cung cấp các phương án thiết kế được nêu cho mỗi pain, trong đó các dòng có `//` là hướng được chọn.
- **Gains ↔ Gain Creators:** GC1-GC15 cung cấp các phương án thiết kế được nêu cho mỗi gain, trong đó các dòng có `//` là hướng được chọn.
- **Nguyên tắc kiểm soát:** hệ thống chỉ gợi ý; nhân viên có thể xem lý do, xác nhận hoặc điều chỉnh thứ tự và nội dung gửi.

FIT này chưa chứng minh tính hiệu quả thực tế, mức độ chấp nhận, khả năng giảm lỗi hay product-market fit.

## 6. Nguồn

- `templates/Persona.md`: Persona Mai Anh, goals, tasks, pain points, needs và motivations; các phần tổng hợp được giữ nhãn [S]/[A] theo quy ước của file.
- `docs/phong-van-1.md` (PV-01): POS, bill dán túi, không gộp đơn, nhắn Zalo, một nhân viên/ca và quy tắc ưu tiên.
- `docs/phong-van-2.md` (PV-02): câu trả lời về đôn đơn gấp và ghi giấy bàn giao; các dòng “Mục tiêu”/“Insight cần khai thác” không được dùng như finding.
- `docs/phong-van-3.md` (PV-03): cách ưu tiên, bạn ca sau tiếp tục, note trên điện thoại, máy báo tiếng, ngồi trực, đóng bao và đặt kệ.
- `docs/phong-van-bo-sung.md`: toàn bộ câu hỏi và câu trả lời bổ sung về cao điểm, ưu tiên đơn gấp, bàn giao, quên/bỏ sót/trễ, nhắc việc và phân quyền.
- `docs/Rubric.md`: tiêu chí Value Proposition yêu cầu các mục tương ứng giữa Persona và giá trị đề xuất.
