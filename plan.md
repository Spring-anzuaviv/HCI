# Kế hoạch dự án HCI

## 1. Mục đích

Kế hoạch này điều phối công việc nghiên cứu, thiết kế, prototype, software, presentation và report của dự án HCI. Dự án tập trung vào các vấn đề hằng ngày của nhân viên giặt ủi trực tiếp, những người phải thực hiện công việc vật lý đồng thời theo dõi đơn hàng, công đoạn xử lý, máy móc, thời hạn, sự gián đoạn và việc bàn giao.

Kế hoạch không mặc định một giải pháp từ trước. Mọi quyết định thiết kế hoặc phần mềm phải liên kết với một vấn đề, nhu cầu người dùng hoặc cơ hội đã được ghi nhận và xác thực.

## 2. Nguyên tắc dự án

- Bắt đầu từ bối cảnh làm việc và cách làm hiện tại của nhân viên, không bắt đầu từ một sản phẩm được đề xuất.
- Phân biệt findings, bằng chứng trực tiếp, assumptions, hypotheses, dữ liệu mô phỏng và quyết định thiết kế.
- Không bịa đặt phỏng vấn, quan sát, trích dẫn, số đo, tài liệu tham khảo hoặc phản hồi người dùng.
- Bao gồm cả nhân viên mới và nhân viên có kinh nghiệm, trừ khi bằng chứng hoặc task giới hạn rõ nhóm người dùng.
- Giữ persona, value proposition, scenario, storyboard, wireframe, prototype, software, presentation và report nhất quán.
- Dùng artifact hoặc implementation nhỏ nhất phù hợp để trả lời câu hỏi HCI đã chọn.
- Xem software là prototype phục vụ đánh giá, không phải hệ thống production hoặc bộ điều khiển trực tiếp máy giặt.

## 3. Người dùng mục tiêu và không gian vấn đề

### Người dùng chính

Nhân viên giặt ủi trực tiếp, có thể phải:

- Tiếp nhận và nhận diện các mẻ đồ mới.
- Phân loại quần áo và chuẩn bị mẻ đồ để xử lý.
- Nạp và lấy đồ khỏi máy giặt, máy sấy.
- Chuyển mẻ đồ giữa các công đoạn giặt, sấy, kiểm tra và đóng gói.
- Kiểm tra chất lượng và xử lý đồ phải làm lại.
- Đóng gói đơn hoàn thành và trao đổi việc bàn giao với đồng nghiệp.

### Các vấn đề cần tìm hiểu

- Nhân viên có thể không biết nên xử lý task nào tiếp theo khi nhiều đơn hàng cùng cạnh tranh.
- Thông tin có thể bị phân tán trên giấy ghi chú, trao đổi bằng lời nói, màn hình và đèn báo máy.
- Hàng chờ dài, công việc phải làm lại, thiếu máy hoặc máy hỏng có thể khiến thời hạn khó theo dõi.
- Nhân viên có thể chịu tải nhận thức cao khi chuyển đổi giữa công việc vật lý và theo dõi nhiều đơn hàng hoặc máy móc.
- Nhân viên có thể không hiểu vì sao một task cần được ưu tiên hơn task khác.
- Mẻ đồ có thể bị thất lạc hoặc chuyển sai giữa các công đoạn.
- Nhân viên mới và có kinh nghiệm có thể đưa ra quyết định khác nhau vì kiến thức công việc chưa được chia sẻ nhất quán.

Đây là các chủ đề cần điều tra, chưa phải findings đã được xác nhận. Dùng nhãn evidence trong mọi artifact nghiên cứu.

## 4. Bản đồ deliverables

| STT | Deliverable            | Mục đích chính                                                                     | Bằng chứng hoặc tiêu chí kiểm tra                                                          |
| --: | ---------------------- | ---------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
|   1 | Persona                | Đại diện cho một nhân viên giặt ủi mục tiêu và bối cảnh công việc.                 | Đủ chín phần theo rubric, có hình đại diện, bố cục rõ, có bằng chứng hoặc ghi rõ giả định. |
|   2 | Value Proposition      | Liên kết vấn đề và nhu cầu của nhân viên với giá trị đề xuất.                      | Mọi giá trị đề xuất đều liên kết với một vấn đề hoặc nhu cầu của persona.                  |
|   3 | Scenario 1 (Hiện tại)  | Thể hiện cách công việc hiện tại được thực hiện và nơi phát sinh vấn đề.           | Hành động, bối cảnh, cách làm hiện tại, sự gián đoạn và khó khăn cụ thể phải dễ đọc.       |
|   4 | Scenario 2 (Cải thiện) | Thể hiện các tương tác được chọn làm thay đổi tình huống công việc.                | Tương tác mới rõ ràng và trực tiếp giải quyết vấn đề trong Scenario 1.                     |
|   5 | Storyboard             | Kể một câu chuyện mạch lạc lấy nhân viên làm trung tâm.                            | Có mở đầu, khó khăn, tương tác và kết quả cùng hình minh họa, chú thích phù hợp.           |
|   6 | Prototype              | Minh họa thiết kế tương tác quan trọng.                                            | Walkthrough ổn định, đủ trạng thái chính, tương tác rõ và ngôn ngữ hình ảnh nhất quán.     |
|   7 | Wireframe              | Xác định bố cục, phân cấp, điều hướng và trạng thái trước khi hoàn thiện hình ảnh. | Wireframe chi tiết, tạo bằng công cụ phù hợp và có cấu trúc tương tác sử dụng được.        |
|   8 | Software Product       | Hiện thực workflow được cải thiện đã chọn dưới dạng prototype tương tác.           | Phần lớn quy trình hoạt động từ đầu đến cuối, không chỉ có màn hình tĩnh.                  |
|   9 | Presentation           | Giải thích bằng chứng, quyết định thiết kế, tương tác và lý do.                    | Câu chuyện rõ, trả lời được câu hỏi “tại sao”, chuẩn bị cho mọi thành viên tham gia.       |
|  10 | Report                 | Ghi lại toàn bộ dự án theo format học thuật yêu cầu.                               | Đủ tiêu đề, nội dung, hình ảnh, định dạng nhất quán và tài liệu tham khảo khi cần.         |

## 5. Các phase và milestone

### Phase 0: Thiết lập dự án và bằng chứng

**Mục tiêu:** Xác lập cơ sở dự án trước khi tạo artifact.

**Hoạt động:**

1. Đọc `Agents.md`, kế hoạch này, `docs/Rubric.md`, các guide liên quan, file hiện tại của dự án và skill phù hợp.
2. Kiểm kê nghiên cứu, ghi chú phỏng vấn, quan sát, design reference, template, tool và implementation hiện có.
3. Tạo evidence register gồm nguồn, ngày, nhóm người dùng, claim và trạng thái bằng chứng.
4. Ghi lại open questions và assumptions cần được xác thực.
5. Xác nhận công nghệ và vị trí artifact được hỗ trợ mà không tự ý đổi stack.

**Tiêu chí kết thúc:** Nhóm biết bằng chứng nào đang có, điều gì là giả định, file nào có tính chuẩn và rubric item nào còn thiếu.

### Phase 1: Phân tích người dùng và công việc

**Mục tiêu:** Mô tả nhân viên, công việc và vấn đề mà không áp đặt giải pháp.

**Hoạt động:**

1. Phân tích workflow hiện tại từ tiếp nhận, phân loại đến xử lý, kiểm tra, đóng gói và bàn giao.
2. Xác định mục tiêu, task, hành vi, sự gián đoạn, nguồn thông tin, quyết định và điểm bàn giao.
3. Xác định pain point và ảnh hưởng của chúng đến thời gian, sự chú ý, phối hợp, sai sót và sự tự tin.
4. Phân biệt findings với hypotheses và ví dụ mô phỏng.
5. Tạo **Persona** với đủ chín phần theo rubric và hình ảnh đại diện.
6. Tạo **Scenario 1 (Hiện tại)** dưới dạng chuỗi hành động, bối cảnh và vấn đề dễ đọc.

**Tiêu chí kết thúc:** Persona và scenario hiện tại nhất quán, có nhãn bằng chứng, dễ đọc và tập trung rõ vào nhân viên giặt ủi.

### Phase 2: Nhu cầu, cơ hội và tình huống cải thiện

**Mục tiêu:** Chuyển các vấn đề đã xác thực thành cơ hội thiết kế có thể truy nguyên.

**Hoạt động:**

1. Suy ra nhu cầu người dùng từ persona và scenario hiện tại.
2. Tạo **Value Proposition** với sự tương ứng một-một giữa vấn đề, nhu cầu và giá trị đề xuất.
3. Chọn một số ít cơ hội tương tác có giá trị cao để giải quyết các vấn đề đã ghi nhận.
4. Mô tả interaction flow lấy nhân viên làm trung tâm: điểm bắt đầu, hành động, phản hồi hệ thống, quyết định hoặc xác nhận và trạng thái kết thúc.
5. Tạo **Scenario 2 (Cải thiện)**, thể hiện hành động và kết quả thay đổi của nhân viên.
6. Tạo **Storyboard**, bảo đảm liên kết khó khăn hiện tại với tương tác và kết quả được cải thiện.

**Tiêu chí kết thúc:** Mọi cải thiện đề xuất đều truy nguyên được về một nhu cầu hoặc pain point của persona, và scenario cải thiện không mở rộng phạm vi thiếu căn cứ.

**Trạng thái 2026-08-14:** Scenario 2 đã được cập nhật theo `outputs/assets/scenario-1.png` và các mục `//` trong `outputs/value-proposition.md`. Nội dung tại `outputs/scenario-2.md` được tổ chức thành ba cải tiến chính: hàng đợi công việc thông minh, kiểm tra tính khả thi của giờ hẹn, và cập nhật tiến trình–thông báo khách. Bàn giao ca trước/ca sau là use case con của hàng đợi thông minh. Năm khung đầu nối 1–1 với Scenario 1; khung 6 tiếp nối đến cuối ca. Ảnh Scenario 2 chưa được tạo lại và các tương tác chưa được kiểm thử với người dùng, vì vậy Phase 2 chưa hoàn tất.

### Phase 3: Wireframe và prototype trực quan

**Mục tiêu:** Khám phá và truyền đạt thiết kế tương tác trước hoặc song song với implementation.

**Hoạt động:**

1. Xem xét wireframe, mockup, hình ảnh tham chiếu và ràng buộc thiết kế hiện có.
2. Tạo **Wireframe** cho workflow đã chọn, gồm điều hướng, phân cấp, hành động chính, phản hồi và trạng thái quan trọng.
3. Kiểm tra touch target, khả năng đọc ở kích thước trình bày, responsive behavior và accessibility.
4. Tạo **Prototype** với đủ màn hình và trạng thái để minh họa toàn bộ tương tác đã chọn.
5. Render hoặc mở artifact trực quan ở kích thước trình bày dự kiến.
6. So sánh kết quả với design reference và rubric; ghi nhận và sửa khác biệt.

**Tiêu chí kết thúc:** Prototype hỗ trợ walkthrough ổn định và wireframe giải thích được cấu trúc tương tác độc lập với phần trang trí trực quan.

### Phase 4: Software prototype

**Mục tiêu:** Xây dựng software prototype hoạt động cho workflow đã chọn.

**Hoạt động:**

1. Xác nhận mỗi tính năng implementation hỗ trợ một deliverable trong rubric và giải quyết một vấn đề đã ghi nhận của nhân viên.
2. Dùng React frontend hiện có và Node.js/Express hoặc mock data khi cấu trúc dự án yêu cầu.
3. Dùng logic workflow tường minh, có thể kiểm tra. Không thêm hành vi AI không thể giải thích.
4. Hiện thực workflow chính từ đầu đến cuối, gồm các trạng thái phù hợp như loading, empty, error, confirmation, completion và handover.
5. Ghi rõ dữ liệu mô phỏng; không tạo ấn tượng về tích hợp production hoặc điều khiển máy thật.
6. Kiểm thử các kích thước desktop, tablet và mobile được hỗ trợ.
7. Chạy build, test và walkthrough thủ công phù hợp.

**Tiêu chí kết thúc:** **Software Product** minh họa workflow tương tác đáng kể, phản hồi sau các hành động quan trọng và nhất quán với prototype và scenario.

### Phase 5: Presentation và report

**Mục tiêu:** Chuẩn bị bài nộp đầy đủ và có thể bảo vệ.

**Hoạt động:**

1. Xây dựng **Presentation** xoay quanh vấn đề, bằng chứng, bối cảnh người dùng, tình huống hiện tại, lý do thiết kế, tương tác cải thiện, walkthrough prototype, giới hạn và bước tiếp theo.
2. Chuẩn bị câu trả lời cho các câu hỏi “tại sao” về người dùng mục tiêu, lựa chọn vấn đề, bằng chứng, quyết định thiết kế, trạng thái tương tác và phạm vi.
3. Đảm bảo mỗi thành viên có thể giải thích và bảo vệ một phần liên quan của dự án.
4. Xây dựng **Report** với cấu trúc, tiêu đề, hình ảnh, chú thích, thuật ngữ và tài liệu tham khảo nhất quán.
5. Kiểm tra report không trình bày assumptions hoặc dữ liệu mô phỏng như findings nghiên cứu.

**Tiêu chí kết thúc:** Presentation và report đầy đủ, nhất quán với các artifact còn lại, dễ đọc và sẵn sàng review.

### Trạng thái 2026-08-31

Đã nối prototype React với backend cho đăng nhập bằng JWT trong HttpOnly cookie, tải order/machine sau xác thực, tạo order và kiểm tra deadline, xem chi tiết/timeline order, tìm kiếm và lọc order. Bộ lọc và preview order dùng chung trên các tab Tổng quan, Hàng đợi và Đơn hàng. Frontend/backend build và frontend lint đã qua; walkthrough với database thật còn phụ thuộc biến môi trường PostgreSQL.

Đã bổ sung CRUD nhân viên/máy móc, phân ca, tính lại dữ liệu schedule sau thay đổi máy, và nối Notify/Stats qua API có cookie authentication. Migration thêm số điện thoại nhân viên cần chạy trước khi dùng các API quản trị.

Đã bổ sung tóm tắt ca tự động qua API `GET /stores/:storeId/shift-summary`, hiển thị trực tiếp trong banner Dashboard và đổi mật khẩu qua API `POST /auth/change-password`. Không lưu localStorage, không có ghi chú thủ công; frontend/backend build và frontend lint đã qua.

Đã cải thiện row trong Hàng đợi bằng các trường có nhãn `Đang làm`, `Sắp làm`, `Dự kiến xong` và `Hành động tiếp theo`, sử dụng stage schedule để hiển thị thời điểm hành động và responsive theo desktop/mobile.

Đã áp dụng cùng cấu trúc row cho danh sách hàng đợi rút gọn trên trang Tổng quan, bảo đảm thông tin giữa Dashboard và Hàng đợi nhất quán.

Đã sửa logic phân ca theo ngày: khi mở ngày chưa có ca, backend tạo các khung ca từ mẫu gần nhất nhưng không sao chép phân công; thêm nhân viên phân vào ca của đúng ngày đang xem, còn chỉnh hồ sơ không tự đổi phân ca.

Đã bổ sung luồng tách đơn trong modal thêm đơn: chia khối lượng thành nhiều mẻ, kiểm tra tổng khối lượng, tạo tuần tự các đơn con cùng `groupCode` để giữ logic ETA/thông báo theo nhóm.

Mỗi mẻ trong luồng tách đơn hiện có thể chọn dịch vụ riêng (`Giặt + Sấy`, `Chỉ giặt`, `Chỉ sấy`) và payload tạo đơn gửi đúng dịch vụ của từng mẻ.

Mỗi mẻ cũng có ghi chú riêng; ô chọn dịch vụ đã giới hạn độ rộng phù hợp và tự điều chỉnh trên màn hình nhỏ.

Đã bổ sung `groupETA` cho các đơn cùng nhóm để hiển thị thời gian hoàn tất cả nhóm, đồng thời tăng chiều cao select dịch vụ trong luồng tách mẻ lên 40px.

Đã chặn tạo đơn ở frontend khi giờ hẹn đã qua, nằm ngoài giờ ca hoặc kiểm tra lịch trả về `AT_RISK`/`NOT_FEASIBLE`; với đơn tách mẻ, kiểm tra được thực hiện cho từng mẻ trước khi tạo. Thanh tiến trình chi tiết đơn hiển thị thời gian dự kiến trên từng mốc stage.

Kết quả tạo đơn và chi tiết order hiện hiển thị riêng ETA của từng mẻ và ETA hoàn tất toàn nhóm; API chi tiết order cũng tính lại `groupETA` từ các order cùng `groupCode`.

Form tách đơn hiện hiển thị ETA từng mẻ và ETA hoàn tất nhóm ngay trong lúc nhập, tự cập nhật khi đổi khối lượng, dịch vụ hoặc giờ hẹn.

Đã hoàn thiện chỉnh sửa máy giặt/máy sấy: cập nhật tên, loại, sức chứa, thời gian xử lý và trạng thái; thêm/xóa/chỉnh sửa máy đều gọi tính lại schedule để hàng chờ nhận ETA và phân máy mới nhất. Máy đang chạy không thể đổi loại hoặc chuyển sang trạng thái không hoạt động.

Đã cập nhật quy tắc khóa máy: nếu còn stage/order chưa hoàn thành, frontend khóa tên, loại, sức chứa và thời gian xử lý; backend chỉ cho đổi trạng thái. Mọi thay đổi trạng thái gọi tính lại schedule và tải lại hàng chờ; máy đang chạy chỉ được chuyển sang `Hỏng`, không được chuyển thẳng sang `Sẵn sàng`.

Đã sửa lỗi `P2028` khi tính lại hàng chờ trên cửa hàng có nhiều stage/order: transaction cập nhật schedule được giữ nguyên tính nguyên tử và tăng timeout lên 30 giây, tránh hết hạn giữa chừng.

Đã tách phần ETA nhóm thành hai dòng rõ ràng trong row: `Mẻ này` và `Cả nhóm`, tránh việc thời gian bị gộp hoặc khó nhận biết.

## 6. Dependency giữa các artifact

1. Bằng chứng và phân tích công việc hiện tại hỗ trợ Persona và Scenario 1.
2. Persona và Scenario 1 hỗ trợ Value Proposition.
3. Value Proposition và Scenario 1 hỗ trợ Scenario 2 và Storyboard.
4. Scenario 2 và interaction flow đã chọn hỗ trợ Wireframe.
5. Wireframe hỗ trợ prototype trực quan.
6. Wireframe, Prototype và workflow đã chọn hỗ trợ Software Product.
7. Tất cả artifact đã hoàn thành hỗ trợ Presentation và Report.

Không hoàn thiện artifact ở downstream khi các claim upstream chưa được hỗ trợ hoặc chưa nhất quán.

## 7. Checklist verification

Trước khi đánh dấu milestone hoàn thành:

- Xác nhận người dùng mục tiêu là nhân viên giặt ủi và bối cảnh công việc cụ thể.
- Xác nhận evidence, assumptions, hypotheses và dữ liệu mô phỏng đều được ghi nhãn.
- Xác nhận thuật ngữ và mục tiêu người dùng nhất quán giữa các artifact.
- Xác nhận scenario hiện tại làm cho vấn đề dễ hiểu.
- Xác nhận scenario cải thiện và prototype thể hiện rõ tương tác mới.
- Xác nhận hành động chính, phản hồi, trạng thái và handover dễ dùng, dễ đọc.
- Xác nhận ý nghĩa quan trọng không chỉ được truyền đạt bằng màu sắc.
- Xác nhận artifact trực quan đã được render hoặc mở và kiểm tra ở kích thước trình bày.
- Xác nhận software workflow có tương tác thật và được kiểm thử vượt ngoài việc kiểm tra màn hình tĩnh.
- Xác nhận mỗi deliverable đáp ứng tiêu chí tương ứng trong `docs/Rubric.md`.

## 8. Báo cáo hoàn thành

Kết thúc mỗi task đáng kể bằng câu trả lời tiếng Việt gồm:

- Các file và artifact đã thay đổi.
- Deliverable trong rubric được hỗ trợ hoặc hoàn thành.
- Verification đã thực hiện, gồm render, so sánh, test hoặc walkthrough.
- Evidence đã sử dụng và assumptions đã đưa ra.
- Giới hạn và công việc còn lại.
