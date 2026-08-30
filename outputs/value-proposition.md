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
| G4  | Thông báo cho khách nhất quán khi đơn sẵn sàng hoặc thời gian dự kiến thay đổi, với ít thao tác lặp lại hơn.                                                                       | Desired  | [F] Có nhắn Zalo khi giặt xong; phần giảm thao tác là [A]/[OQ].                                             |
| G5  | Giữ quyền kiểm soát và hiểu vì sao hệ thống gợi ý thứ tự, thay vì bị buộc làm theo một quyết định không giải thích được.                                                           | Desired  | [S] từ Persona: nhân viên muốn tự xử lý ngoại lệ; cần kiểm chứng trực tiếp với người dùng.                  |
| G6  | Chốt được giờ nhận đồ có cơ sở, biết khi nào deadline có rủi ro và có thể giải thích cho khách.                                                                                    | Desired  | [F] Câu trả lời bổ sung xác nhận nhiều đơn cùng hẹn khiến khó chắc kịp deadline; [S] từ Goal G2 và Need N2. |
| G7  | Nhận được nhắc việc đúng lúc nhưng vẫn có quyền rõ ràng để cập nhật trạng thái, đổi ưu tiên, chuyển người phụ trách và cấu hình quy tắc thông báo.                                 | Desired  | [F] Câu trả lời bổ sung nêu quyền của nhân viên, trưởng ca/quản lý và chủ cửa hàng; [S] cho prototype.      |

## 3. Value Map

### Products & Services

Đề xuất một **bộ công cụ hỗ trợ điều phối đơn trên điện thoại** cho prototype. Products & Services gồm nhiều thành phần độc lập:

1. **Hàng đợi công việc có giải thích:** đề xuất đơn tiếp theo dựa trên giờ hẹn, khối lượng, loại dịch vụ, công đoạn, máy đang chạy, hàng chờ và yêu cầu đặc biệt; hiển thị lý do và cho phép nhân viên chọn khác.
2. **Kiểm tra tính khả thi của deadline:** đối chiếu máy đang hoạt động, thời gian còn lại, đơn chờ, thời lượng giặt/sấy/đóng gói và thời gian dự phòng; trả về mức khả thi hoặc có rủi ro.
3. **Theo dõi tiến trình và nhắc việc:** hiển thị trạng thái, công đoạn, người phụ trách, giờ hoàn thành dự kiến và nhắc khi máy sắp xong, đơn gấp cần chuyển bước, đơn sắp hẹn nhưng chưa hoàn thành hoặc đứng quá lâu.
4. **Cập nhật tiến trình và thông báo khách:** soạn sẵn thông báo theo trạng thái để nhân viên kiểm tra rồi gửi; khi nhân viên không ngồi trước màn hình, thông báo trên điện thoại vẫn được hiển thị.
5. **Bàn giao ca có cấu trúc:** tạo bản tóm tắt gồm mã/tên đơn, trạng thái, vị trí, người phụ trách, giờ hẹn, ngoại lệ và việc tiếp theo.
6. **Hồ sơ đơn hợp nhất:** tập trung thông tin đơn, giờ hẹn, yêu cầu đặc biệt và lịch sử cập nhật để giảm đối chiếu giữa các nguồn.

Các mục trên chỉ là phương tiện minh họa workflow; dữ liệu trong prototype là dữ liệu mô phỏng và trạng thái máy không được lấy tự động từ thiết bị thật.

**Cập nhật từ câu trả lời bổ sung:** Nhắc việc ưu tiên hiển thị trên app/web; chỉ push điện thoại cho việc cần xử lý ngay, nhắc lại sau 10–15 phút nếu chưa xử lý và không nhắc liên tục. Các thay đổi ưu tiên hoặc người phụ trách của trưởng ca/quản lý phải lưu lịch sử và lý do.

### Pain Relievers

Mỗi Pain trong canvas phải có ít nhất 2 Pain Relievers là các giải pháp design khác nhau; mỗi reliever phải giảm pain bằng một cơ chế riêng.

| Mã     | Giá trị đề xuất                                                                                                                                          | Pain được giải quyết | Cách giảm pain                                                                              |
| ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------- | ------------------------------------------------------------------------------------------- |
| //PR1  | Gợi ý thứ tự xử lý từ giờ hẹn, khối lượng, loại dịch vụ, công đoạn, máy, hàng chờ và yêu cầu đặc biệt; hiển thị lý do và cho phép đổi thứ tự.            | P1                   | Giảm việc tự ghép nhiều thông tin khi đôn đơn gấp; vẫn giữ quyền quyết định.                |
| PR2    | Cho phép xem và so sánh các phương án xử lý nếu đôn đơn gấp, gồm ảnh hưởng đến deadline của các đơn khác.                                                | P1                   | Giúp người dùng cân nhắc nhiều thứ tự thay vì chỉ nhận một thứ tự tự động.                  |
| //PR3  | Gom trạng thái đơn, công đoạn, giờ lấy, người phụ trách và lưu ý vào cùng một màn hình chi tiết.                                                         | P2                   | Giảm đối chiếu giữa note điện thoại, bill, vị trí đồ và trao đổi rời rạc.                   |
| PR4    | Có bộ lọc và lịch sử cập nhật để tìm nhanh thông tin đơn, trạng thái và thay đổi gần đây.                                                                | P2                   | Giảm thời gian tìm kiếm giữa nhiều nguồn thông tin.                                         |
| /////PR5  | Tạo bản ghi bàn giao có trạng thái, công đoạn, vị trí, người phụ trách, ngoại lệ và bước tiếp theo.                                                      | P3                   | Truyền đủ ngữ cảnh cho người tiếp nhận thay vì chỉ dựa vào giải thích miệng hoặc giấy ngắn. |
| PR6    | Dùng checklist bàn giao và yêu cầu xác nhận các trường thông tin tối thiểu trước khi kết thúc ca.                                                        | P3                   | Giảm nguy cơ bỏ sót vị trí, ngoại lệ hoặc hành động tiếp theo.                              |
| //PR7  | Cho phép chọn mẫu cập nhật dựa trên trạng thái đơn, xem lại nội dung trước khi gửi và ghi nhận đã thông báo.                                             | P4                   | Giảm thao tác soạn lại và làm rõ đơn nào đã được cập nhật khách.                            |
| PR8    | Hiển thị lịch sử thông báo và trạng thái gửi để người dùng biết khách đã được cập nhật hay chưa.                                                         | P4                   | Giảm nguy cơ gửi thiếu, gửi trùng hoặc không biết lần cập nhật trước.                       |
| //PR9  | Ước tính khoảng hoàn thành từ tải máy, hàng chờ, thời lượng từng công đoạn và thời gian dự phòng; hiển thị deadline có rủi ro.                           | P2b                  | Giúp nhận ra giờ hẹn không an toàn trước khi chốt với khách.                                |
| PR10   | Hiển thị timeline các công đoạn và mô phỏng ảnh hưởng khi chèn một đơn gấp vào hàng chờ.                                                                 | P2b                  | Giúp thấy công suất còn trống nhưng deadline vẫn có thể không khả thi.                      |
| //PR11 | Nhắc việc trên app/web khi phát sinh; chỉ push điện thoại cho việc cần xử lý ngay, nhắc lại sau khoảng 10–15 phút nếu chưa xử lý và không nhắc liên tục. | P5                   | Giảm nguy cơ quên và giúp phát hiện trễ sớm mà không tạo quá nhiều gián đoạn.               |
| PR12   | Tạo danh sách việc cần chú ý theo deadline, trạng thái đứng quá lâu và đổi ca.                                                                           | P5                   | Gom các rủi ro cần xử lý vào một nơi để người dùng rà soát.                                 |

### Gain Creators

Mỗi Gain trong canvas phải có ít nhất 2 Gain Creators là các giải pháp design khác nhau; mỗi creator phải tạo ra gain bằng một cơ chế riêng.

| Mã     | Giá trị đề xuất                                                                                                | Gain được tạo | Cách người dùng nhận biết kết quả                                                                                       |
| ------ | -------------------------------------------------------------------------------------------------------------- | ------------- | ----------------------------------------------------------------------------------------------------------------------- |
| //GC1  | Giải thích ngắn gọn lý do xếp hạng và cho phép xác nhận hoặc kéo đổi thứ tự.                                   | G1, G5, G7    | Người dùng thấy việc đề xuất, lý do và thứ tự mới sau khi điều chỉnh, ví dụ “còn 45 phút đến giờ hẹn, còn 2 công đoạn”. |
| GC2    | Hiển thị nhiều phương án thứ tự cùng tác động dự kiến để người dùng so sánh trước khi chọn.                    | G1, G5        | Người dùng thấy các lựa chọn và hệ quả thay vì chỉ có một phương án.                                                    |
| //GC3  | Hiển thị một dòng tóm tắt “đang ở đâu, ai phụ trách, làm gì tiếp theo” trên mỗi đơn.                           | G2, G3        | Người dùng và người tiếp nhận đọc được trạng thái mà không phải hỏi lại ngay.                                           |
| //GC4  | Dùng trạng thái và nhãn chữ, không chỉ dùng màu, để giúp quét nhanh danh sách.                                 | G2            | Người dùng nhận ra đơn chờ, đang xử lý, cần tiếp tục hoặc đã hoàn tất bằng chữ và trạng thái.                           |
| //GC5  | Tạo bản tóm tắt cuối ca từ các đơn chưa hoàn tất.                                                              | G3            | Người bàn giao có danh sách rõ; người nhận biết việc cần tiếp tục.                                                      |
| GC6    | Hiển thị checklist bàn giao và cho phép người nhận xác nhận đã tiếp nhận thông tin.                            | G3, G7        | Hai bên biết phần bàn giao đã đủ và còn nội dung nào cần bổ sung.                                                       |
| GC7    | Cung cấp mẫu tin nhắn và nhắc việc theo trạng thái nhưng để người dùng kiểm tra và gửi.                        | G4, G5, G7    | Nội dung nhất quán hơn mà người dùng vẫn giữ quyền kiểm soát việc thông báo.                                            |
| //GC8  | Hiển thị lịch sử thông báo và trạng thái gửi theo từng đơn.                                                    | G4            | Người dùng biết khách đã nhận được cập nhật nào và tránh gửi lặp.                                                       |
| //GC9  | Hiển thị khoảng hoàn thành dự kiến, mức rủi ro deadline và giờ gần nhất có thể đáp ứng trước khi chốt giờ hẹn. | G6            | Người dùng có cơ sở giải thích và điều chỉnh giờ hẹn.                                                                   |
| //GC10 | Hiển thị timeline và các mốc thời gian còn lại của từng công đoạn.                                             | G6            | Người dùng thấy deadline được hình thành từ các công đoạn nào và kiểm tra được tính hợp lý.                             |

**Yêu cầu giải thích:** Hệ thống phải hiển thị lý do ưu tiên, ví dụ “còn 45 phút đến giờ hẹn, còn 2 công đoạn”, để người dùng kiểm tra và tự quyết định thay vì chỉ nhận một thứ tự tự động.

## 4. Đối chiếu vấn đề, nhu cầu và giá trị

Bảng này đối chiếu các vấn đề, nhu cầu và giá trị đề xuất. Một vấn đề hoặc nhu cầu có thể có nhiều Pain Relievers hoặc Gain Creators tương ứng.

| Vấn đề hiện tại                                                                                  | Nhu cầu tương ứng                                                                               | Giá trị đề xuất tương ứng                                                                            |
| ------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| P1. Khó xác định thứ tự khi phải đôn đơn gấp và thiếu lý do hiển thị tập trung.                  | N1. Biết việc tiếp theo và lý do ưu tiên, nhưng vẫn được tự điều chỉnh.                         | V1. Bảng điều phối gợi ý thứ tự có giải thích và cho phép đổi thứ tự.                                |
| P2. Thông tin đơn và tiến độ phân tán trên POS/điện thoại, bill, máy và giấy.                    | N2. Xem thông tin xử lý liên quan trong một nơi để giảm đối chiếu.                              | V2. Hồ sơ đơn hợp nhất với trạng thái, công đoạn, giờ lấy, người phụ trách và lưu ý.                 |
| P3. Bàn giao ca có note nhưng chưa chắc đủ ngữ cảnh để tiếp tục.                                 | N3. Bàn giao rõ trạng thái, vị trí/công đoạn, ngoại lệ và bước tiếp theo.                       | V3. Tóm tắt bàn giao ca có cấu trúc, được nhân viên xác nhận trước khi kết thúc ca.                  |
| P4. Thông báo khách sau khi hoàn tất cần nhắn thủ công qua Zalo.                                 | N4. Truyền đạt tiến độ nhất quán với ít thao tác lặp lại, vẫn được kiểm tra trước khi gửi.      | V4. Mẫu thông báo theo trạng thái, có xem lại và ghi nhận đã gửi.                                    |
| P2b. Chưa có cơ sở tổng hợp để biết giờ khách hẹn có khả thi khi tải máy hoặc hàng chờ thay đổi. | N2b. Kiểm tra khả năng hoàn thành và chọn giờ hẹn có khoảng dự phòng phù hợp.                   | V5. Bộ kiểm tra tính khả thi trả về mức khả thi/rủi ro/không khả thi và giờ gần nhất có thể đáp ứng. |
| P5. Có thể quên đồ, bỏ sót đơn hoặc phát hiện nguy cơ trễ quá muộn khi đông đơn hoặc đổi ca.     | N5. Được nhắc đúng lúc về việc có deadline và nguy cơ trễ, nhưng vẫn kiểm soát hành động xử lý. | V6. Nhắc việc chủ động trên điện thoại theo trạng thái, deadline và thời gian đứng yên.              |

P2b và P5 đã có câu trả lời bổ sung làm rõ bối cảnh và rủi ro. V5 và V6 vẫn là các đề xuất prototype cần kiểm chứng về độ chính xác, mức độ hữu ích và khả năng tránh gây gián đoạn.

## 5. FIT assessment

**Đánh giá sơ bộ: Có problem-solution fit ở mức ý tưởng prototype HCI cho các pain/need P1-P5; mức hiệu quả của nhắc việc và kiểm tra deadline vẫn cần kiểm chứng bằng prototype.**

- **Jobs ↔ Products & Services:** bảng điều phối, hồ sơ đơn và bàn giao hỗ trợ các công việc chọn đơn, theo dõi tiến độ và tiếp tục việc qua ca.
- **Pains ↔ Pain Relievers:** PR1-PR12 cung cấp ít nhất 2 giải pháp design cho mỗi pain; việc nhắc deadline và cảnh báo đứng trạng thái cần kiểm tra thêm về độ chính xác và mức gây gián đoạn.
- **Gains ↔ Gain Creators:** GC1-GC10 cung cấp ít nhất 2 giải pháp design cho mỗi gain, gồm giải thích lý do, giảm ghi nhớ, bàn giao rõ hơn, kiểm tra giờ hẹn và thông báo nhất quán.
- **Nguyên tắc kiểm soát:** hệ thống chỉ gợi ý; nhân viên có thể xem lý do, xác nhận hoặc điều chỉnh thứ tự và nội dung gửi.

FIT này chưa chứng minh tính hiệu quả thực tế, mức độ chấp nhận, khả năng giảm lỗi hay product-market fit.

## 6. Nguồn

- `templates/Persona.md`: Persona Mai Anh, goals, tasks, pain points, needs và motivations; các phần tổng hợp được giữ nhãn [S]/[A] theo quy ước của file.
- `docs/phong-van-1.md` (PV-01): POS, bill dán túi, không gộp đơn, nhắn Zalo, một nhân viên/ca và quy tắc ưu tiên.
- `docs/phong-van-2.md` (PV-02): câu trả lời về đôn đơn gấp và ghi giấy bàn giao; các dòng “Mục tiêu”/“Insight cần khai thác” không được dùng như finding.
- `docs/phong-van-3.md` (PV-03): cách ưu tiên, bạn ca sau tiếp tục, note trên điện thoại, máy báo tiếng, ngồi trực, đóng bao và đặt kệ.
- `docs/phong-van-bo-sung.md`: toàn bộ câu hỏi và câu trả lời bổ sung về cao điểm, ưu tiên đơn gấp, bàn giao, quên/bỏ sót/trễ, nhắc việc và phân quyền.
- `docs/Rubric.md`: tiêu chí Value Proposition yêu cầu các mục tương ứng giữa Persona và giá trị đề xuất.
