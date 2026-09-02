# Storyboard tường thuật — Plan

## Purpose

Tạo một storyboard tường thuật từ Persona, Scenario và Value Proposition, kết hợp **kể chuyện + phác thảo** để mô tả rõ bối cảnh sử dụng, hành động, động lực, cảm xúc của người dùng, tương tác với sản phẩm và giá trị được tạo ra.

Plan này tạo đầu vào chi tiết cho việc vẽ storyboard. Kết quả không chỉ liệt kê màn hình mà phải mô tả đầy đủ người, vật thể, thiết bị, môi trường, góc máy, chuyển động và diễn tiến câu chuyện trong từng frame.

## Use this skill when

- Người dùng muốn tạo mới hoặc cập nhật storyboard từ Persona, Scenario và Value Proposition.
- Người dùng muốn chuyển một scenario viết thành chuỗi frame có thể vẽ được.
- Người dùng cần xác định rõ người, vật, bối cảnh, hành động, cảm xúc, góc máy và nội dung xuất hiện trong từng frame.
- Người dùng muốn thể hiện tương tác người dùng–hệ thống và nhìn rõ sản phẩm/màn hình sản phẩm tại các thời điểm quan trọng.
- Người dùng muốn kiểm tra storyboard có truyền đạt đúng pain/gain và quyết định thiết kế hay không.
- Người dùng cần chuẩn bị deliverable **Storyboard** theo rubric.
- **Không dùng skill này khi:** chỉ cần tạo UI flow, task flow hoặc chuỗi screenshot không có câu chuyện, bối cảnh và cảm xúc của người dùng.

## Required inputs

Ba input bắt buộc:

- **Persona:** người dùng chính, goals, tasks, behaviors, pain points, needs, motivations, frustrations, môi trường và bối cảnh sử dụng. Nguồn mặc định là `outputs/Persona.md`.
- **Scenario:** diễn tiến tình huống, hành động, vấn đề, tương tác và kết quả. Dùng `outputs/scenario-1.md` để hiểu hiện trạng và pain; dùng `outputs/scenario-2.md` để xác định tương tác mới và quyết định thiết kế.
- **Value Proposition:** pain, gain, pain relievers, gain creators và giá trị đề xuất cần được thể hiện trong câu chuyện. Nguồn mặc định là `outputs/value-proposition.md` hoặc `outputs/value-proposition-canvas.md`.

Pain/gain phải lấy từ các input trên và có thể truy nguyên về nguồn. Các tương tác mới và quyết định thiết kế phải lấy từ hoặc được suy ra trực tiếp từ Scenario 2. Nếu input thiếu, mâu thuẫn hoặc chứa giả định, phải ghi rõ trong output thay vì tự tạo thông tin để lấp khoảng trống.

## Output

Một file Markdown hoàn chỉnh tại `outputs/storyboard.md`, mô tả storyboard theo mạch truyện:

**Mở đầu → Câu chuyện phát triển → Cao trào → Kết thúc**

Output gồm:

- Tóm tắt Persona, mục tiêu, bối cảnh và tình huống bắt đầu.
- Pain/gain được lấy từ các input và sẽ được thể hiện trong câu chuyện.
- Mạch truyện tổng thể và vai trò của từng giai đoạn.
- Chuỗi frame được đánh số theo đúng thứ tự.
- Mapping giữa frame, pain/gain, tương tác mới và quyết định thiết kế.
- Giả định, khoảng trống thông tin và open questions cần kiểm chứng.

Mỗi frame phải mô tả đủ chi tiết để người khác có thể vẽ mà không phải tự đoán:

- **Số frame và giai đoạn câu chuyện.**
- **Bối cảnh:** địa điểm, thời điểm, môi trường vật lý, môi trường xã hội và tình trạng xung quanh.
- **Người:** nhân vật xuất hiện, vị trí, tư thế, biểu cảm, hướng nhìn và quan hệ giữa các nhân vật.
- **Vật thể và thiết bị:** đồ vật, máy móc, điện thoại, màn hình, giấy tờ hoặc đạo cụ cần xuất hiện và vị trí tương đối của chúng.
- **Hành động và động lực:** người dùng đang làm gì, vì sao làm và điều gì vừa kích hoạt hành động.
- **Tương tác người dùng–hệ thống:** hành động của người dùng, phản hồi của hệ thống, thông tin hiển thị và phản ứng tiếp theo của người dùng.
- **Cảm xúc:** cảm xúc cần thể hiện qua nét mặt, tư thế, ngôn ngữ cơ thể hoặc ký hiệu trực quan.
- **Loại góc máy và bố cục khung:** toàn cảnh cực rộng, toàn cảnh, trung cảnh, góc qua vai, góc nhìn chủ thể hoặc cận cảnh; chủ thể chính và điểm tập trung thị giác.
- **Nội dung cần nhìn thấy trong bản vẽ:** chi tiết quan trọng của người, vật, bối cảnh và sản phẩm/màn hình sản phẩm.
- **Điểm nhấn chuyển động:** mũi tên, vùng tô sáng, đường chuyển động hoặc ký hiệu cần dùng để thể hiện hành động và sự chú ý.
- **Chú thích câu chuyện:** một câu ngắn nối frame hiện tại với frame trước và sau.
- **Pain/gain và quyết định thiết kế liên quan:** pain/gain lấy từ input; quyết định thiết kế đối chiếu với Scenario 2.

Output phải nhất quán với Persona, Scenario và Value Proposition, đồng thời phù hợp với deliverable **Storyboard** trong rubric. File Markdown là đặc tả nội dung để vẽ storyboard, không thay thế bản storyboard minh họa cuối cùng.

## Workflow

1. Đọc `AGENTS.md`, `plan.md` cấp project, `skills/storyboard/skill.md`, `rules/domains/hci.md`, `inputs/Rubric.md` và các input `outputs/Persona.md`, `outputs/scenario-1.md`, `outputs/scenario-2.md`, `outputs/value-proposition.md`
2. Đọc Persona trước để xác định người dùng chính, goals, tasks, behaviors, motivations, frustrations, môi trường vật lý, môi trường xã hội và bối cảnh cảm xúc.
3. Đọc Value Proposition để xác định pain/gain, pain relievers, gain creators và giá trị phải nhìn thấy được qua sự thay đổi trong câu chuyện.
4. Đọc Scenario 1 để hiểu tình huống hiện tại, chuỗi hành động và pain; đọc Scenario 2 để hiểu tương tác mới, phản hồi hệ thống, kết quả cải thiện và các quyết định thiết kế cần thể hiện.
5. Lập bảng truy nguyên trước khi chia frame: `pain/gain từ input → sự kiện trong Scenario → tương tác trong Scenario 2 → quyết định thiết kế`.
6. Xác định mạch truyện **Mở đầu → Câu chuyện phát triển → Cao trào → Kết thúc**; làm rõ điểm bắt đầu, vấn đề tăng dần, khoảnh khắc tương tác hoặc quyết định quan trọng nhất và trạng thái kết thúc.
7. Chia mạch truyện thành các frame khi có thay đổi có ý nghĩa về bối cảnh, hành động, cảm xúc, trạng thái hệ thống, tương tác hoặc diễn tiến câu chuyện; không tạo frame chỉ để minh họa từng thao tác nhấp nhỏ.
8. Với mỗi frame, mô tả đầy đủ người, vật thể, thiết bị, bối cảnh, hành động, động lực, cảm xúc, tương tác, phản hồi, loại góc máy, bố cục, chuyển động và chú thích câu chuyện.
9. Chọn góc máy phù hợp với mục tiêu của frame; dùng góc qua vai, góc nhìn chủ thể hoặc cận cảnh khi cần nhìn rõ sản phẩm/màn hình sản phẩm, nhưng không biến toàn bộ storyboard thành chuỗi UI screenshot.
10. Kiểm tra tính liên tục giữa các frame: vị trí nhân vật, vật thể, thời gian, trạng thái công việc, cảm xúc và kết quả của frame trước phải nối hợp lý với frame sau.
11. Kiểm tra mỗi pain/gain đều lấy từ input và được thể hiện bằng diễn biến quan sát được; kiểm tra mỗi quyết định thiết kế đều đối chiếu được với Scenario 2.
12. Rà soát tính thực tế bằng các câu hỏi: bối cảnh có hợp lý không, động lực có hợp lý không, người dùng có thực sự hành động như vậy không và sản phẩm có xuất hiện đúng lúc không.
13. Ghi rõ assumptions, dữ liệu mô phỏng, open questions và khoảng trống nếu ba input chưa đủ hoặc mâu thuẫn; không tự tạo bằng chứng, khả năng sản phẩm hoặc quyết định thiết kế.
14. Điền kết quả vào file Markdown `storyboard.md` và lưu tại `outputs/storyboard.md`.
15. Kiểm tra output theo `skills/storyboard/skill.md` và rubric: câu chuyện rõ ràng, bối cảnh đầy đủ, tập trung vào người dùng, có cảm xúc, có tương tác người dùng–hệ thống, truyền đạt pain/gain, dẫn đến quyết định thiết kế và nhìn rõ sản phẩm/màn hình sản phẩm.
