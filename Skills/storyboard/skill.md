---
name: storyboard
description: Dùng để tạo, đánh giá hoặc cải thiện storyboard tường thuật cho scenario HCI hoặc thiết kế sản phẩm, kết hợp kể chuyện và phác thảo để thể hiện bối cảnh, hành động, tương tác, cảm xúc, giá trị đề xuất và quyết định thiết kế.
---

# Skills

## Purpose

Tạo, đánh giá hoặc cải thiện một **storyboard tường thuật** cho scenario HCI/thiết kế sản phẩm.

Skill này giúp Agent tạo storyboard kết hợp **kể chuyện + phác thảo** để truyền đạt:

- Bối cảnh của người dùng.
- Hành động và động lực của người dùng.
- Tương tác giữa người dùng và hệ thống.
- Cảm xúc của người dùng.
- Giá trị đề xuất của sản phẩm.
- Các quyết định thiết kế xuất hiện từ scenario.

Storyboard phải làm cho scenario trở nên tường minh vì những người khác nhau có thể hình dung cùng một scenario được viết theo những cách khác nhau.

> **Storyboard = kể chuyện + phác thảo**

Skill này không dùng để tạo UI flow hoặc task flow rời rạc, thay thế nghiên cứu người dùng hay tự tạo khả năng sản phẩm không có bằng chứng.

## Use This Skill When

Dùng skill này khi người dùng yêu cầu:

- Tạo storyboard từ scenario, persona, value proposition,hành trình người dùng hoặc ý tưởng sản phẩm.
- Chuyển một scenario được viết thành các khung storyboard.
- Thiết kế storyboard tường thuật cho prototype HCI.
- Quyết định nội dung cần xuất hiện trong từng khung storyboard.
- Chọn loại góc máy phù hợp cho các khung storyboard.
- Cải thiện hoặc đánh giá một storyboard hiện có.
- Kiểm tra storyboard có đáp ứng các tiêu chí storyboard HCI hay không.
- Tạo prompt hoặc mô tả sẽ được dùng để vẽ các khung storyboard sau đó.

Không gọi skill này khi chỉ cần tạo chuỗi màn hình UI, mô tả task mà không có bối cảnh sử dụng hoặc chưa có đủ thông tin để xây dựng một mạch truyện hợp lý.

## Required Inputs

Ưu tiên nhận một hoặc nhiều nguồn sau nếu chúng có sẵn:

- **Người dùng / Persona**
- **Scenario 1 / Scenario 2**
- **Mục tiêu người dùng**
- **Tasks**
- **Pain points**
- **Expected gains**
- **Value proposition**
- **Môi trường vật lý**
- **Môi trường xã hội**
- **Thiết bị**
- **Bối cảnh thời gian**
- **Bối cảnh cảm xúc**

Pain/gain phải được lấy từ các input được cung cấp, như Persona, Value Proposition, Scenario 1, ghi chú phỏng vấn hoặc quan sát. Không tự tạo pain/gain chỉ để hoàn thiện mạch truyện.

Scenario 2 là nguồn để xác định các tương tác mới và suy ra quyết định thiết kế cần thể hiện trong storyboard. Nếu chưa có Scenario 2 hoặc Scenario 2 chưa mô tả đủ tương tác, phải ghi rõ khoảng trống thay vì tự bổ sung quyết định thiết kế.

Nếu một số thông tin không được cung cấp rõ ràng, chỉ suy luận khi suy luận đó được scenario hỗ trợ vững chắc.

Không tự tạo các động lực quan trọng của người dùng, khả năng của sản phẩm, ràng buộc môi trường hoặc tương tác nếu không có bằng chứng.

## Output

Đầu ra mặc định là một tài liệu Markdown tổ chức storyboard thành một chuỗi khung được đánh số theo mạch truyện:

**Mở đầu → Câu chuyện phát triển → Cao trào → Kết thúc**

Với mỗi khung, cung cấp đủ thông tin chi tiết để có thể vẽ được:

- **Số khung**
- **Giai đoạn câu chuyện**
- **Bối cảnh / không gian**
- **Hành động của người dùng**
- **Tương tác với hệ thống / sản phẩm**, khi phù hợp
- **Cảm xúc của người dùng**
- **Loại góc máy**
- **Nội dung cần nhìn thấy trong bản phác thảo**
- **Điểm nhấn chuyển động/hành động**, khi phù hợp
- **Chú thích mạch truyện**

Storyboard phải tạo thành một câu chuyện liên tục thay vì một tập hợp các màn hình không liên quan.

Storyboard cuối cùng phải hiển thị rõ sản phẩm/màn hình khi có tương tác với hệ thống.

## Domain Knowledge

### Storyboard

**Storyboard = kể chuyện + phác thảo**

Storyboard được sử dụng vì mỗi người có thể hình dung một scenario theo cách khác nhau. Vì vậy, scenario cần được vẽ một cách tường minh.

### Bối cảnh

**Bối cảnh: tập hợp các hoàn cảnh xung quanh sự tương tác của người dùng với một sản phẩm**

Bối cảnh bao gồm:

- **Người dùng**
- **Tasks**
- **Thiết bị**
- **Môi trường vật lý**
- **Môi trường xã hội**
- **Bối cảnh thời gian và cảm xúc**

**Các quyết định thiết kế được dẫn dắt bởi bối cảnh sử dụng chứ không phải chỉ bởi task.**

Vì vậy, không chỉ thể hiện task mà người dùng thực hiện. Hãy cho thấy các hoàn cảnh xung quanh tương tác và cách những hoàn cảnh đó ảnh hưởng đến hành vi của người dùng cũng như thiết kế.

### Hướng dẫn xây dựng storyboard

#### 1. Mạch truyện

Storyboard phải tuân theo:

**Mở đầu → Câu chuyện phát triển → Cao trào → Kết thúc**

Do đó, các khung phải tạo ra diễn tiến tường thuật thay vì chỉ hiển thị từng tính năng sản phẩm riêng lẻ.

#### 2. Phác thảo

Sử dụng loại góc máy phù hợp tùy theo thông tin mà khung cần truyền đạt.

##### Toàn cảnh cực rộng (extreme long shot / wide shot)

**Góc nhìn thể hiện chi tiết của bối cảnh, địa điểm, v.v.**

Dùng khi cần thiết lập môi trường và bối cảnh tổng thể.

##### Toàn cảnh (long shot)

**Thể hiện toàn bộ chiều cao của một người.**

Dùng khi hành động toàn thân của người dùng hoặc mối quan hệ của họ với môi trường là quan trọng.

##### Trung cảnh (medium shot)

**Thể hiện đầu và vai của một người.**

Dùng khi hành động, biểu cảm hoặc tương tác của người dùng quan trọng hơn môi trường rộng hơn.

##### Góc qua vai (over-the-shoulder shot)

**Nhìn qua vai của một người.**

Dùng khi cần nhìn thấy cả người dùng và đối tượng mà họ đang tương tác.

##### Góc nhìn chủ thể (point-of-view shot)

**Nhìn thấy mọi thứ mà một người đang nhìn thấy.**

Dùng khi storyboard cần truyền đạt điều người dùng đang nhìn thấy tại thời điểm đó.

##### Cận cảnh (close-up)

**Ví dụ: thể hiện chi tiết giao diện trên thiết bị mà người dùng đang cầm.**

Dùng khi màn hình sản phẩm, trạng thái UI, thông tin, control hoặc tương tác cần được nhìn thấy rõ ràng.

#### 3. Nhấn mạnh hành động và chuyển động

Dùng chú thích trực quan để làm cho hành động, chuyển động, sự chú ý và cảm xúc trở nên dễ hiểu.

Ví dụ:

- **Mũi tên lớn** nhấn mạnh một người đang đi ngang qua/đi khỏi, hướng đi của họ.
- **Mũi tên vòng tròn** nhấn mạnh chuyển động khi người đó nhận ra một điều đáng chú ý.
- **Dấu hỏi** biểu lộ cảm xúc hoặc sự quan tâm.
- **Vùng đánh dấu** nhấn mạnh hành động chụp ảnh/quay phim.
- **Phần tô sáng** nhấn mạnh hành động tiếp nhận thông tin.

Không chỉ dựa vào chú thích khi một hành động hoặc cảm xúc có thể được truyền đạt bằng hình ảnh.

#### 4. Thêm mạch truyện

Đánh dấu từng khung storyboard theo thứ tự và thêm chú thích mạch truyện để người đọc có thể theo dõi câu chuyện:

**1…. 2….**

Mỗi khung phải có số thứ tự rõ ràng để người đọc có thể theo dõi câu chuyện theo đúng trình tự dự kiến.

#### 5. Trình bày và lặp lại

Đánh giá storyboard bằng cách hỏi:

- **Nó có thực tế không?**
- **Bối cảnh có hợp lý không?**
- **Động lực của nhân vật có hợp lý không?**
- **Họ có thực sự thực hiện những hành động đó không?**

Nếu câu trả lời cho một trong những câu hỏi này chưa thuyết phục, hãy sửa storyboard trước khi xem là hoàn thành.

#### 6. Storyboard tường thuật hoàn chỉnh

Đầu ra cuối cùng phải hoạt động như một **storyboard tường thuật hoàn chỉnh**.

Người đọc phải có thể hiểu:

- Người dùng đang ở đâu.
- Người dùng đang ở trong tình huống nào.
- Người dùng muốn gì.
- Điều gì xảy ra.
- Người dùng hành động như thế nào.
- Hệ thống tham gia vào lúc nào và như thế nào.
- Tương tác phát triển như thế nào.
- Khoảnh khắc hoặc vấn đề cao trào quan trọng là gì.
- Scenario kết thúc như thế nào.
- Sản phẩm mang lại giá trị gì.

## Reasoning / Inference Strategy

Khi chuyển một scenario thành storyboard, suy luận theo thứ tự sau.

### Nguyên tắc suy luận

#### Bước 1: Xác định bối cảnh sử dụng

Trích xuất:

- Người dùng
- Tasks
- Thiết bị
- Môi trường vật lý
- Môi trường xã hội
- Bối cảnh thời gian
- Bối cảnh cảm xúc

Thực hiện việc này trước khi quyết định màn hình hoặc tính năng sản phẩm nào cần xuất hiện.

Ghi nhớ:

> **Các quyết định thiết kế được dẫn dắt bởi bối cảnh sử dụng chứ không phải chỉ bởi task.**

#### Bước 2: Xác định mạch truyện

Xác định:

**Mở đầu → Câu chuyện phát triển → Cao trào → Kết thúc**

Phần mở đầu cần thiết lập người dùng và bối cảnh.

Phần phát triển cần thể hiện hành động, vấn đề, quyết định hoặc tình huống thay đổi của người dùng.

Phần cao trào cần thể hiện khoảnh khắc, vấn đề, quyết định hoặc tương tác người dùng–hệ thống quan trọng nhất.

Phần kết thúc cần thể hiện kết quả và giá trị được mang lại cho người dùng.

#### Bước 3: Chia mạch truyện thành các khung

Mỗi khung cần thể hiện một thay đổi có ý nghĩa trong ít nhất một yếu tố sau:

- Bối cảnh
- Hành động của người dùng
- Cảm xúc của người dùng
- Trạng thái hệ thống
- Tương tác người dùng–hệ thống
- Diễn tiến câu chuyện

Không tạo thêm khung chỉ để thể hiện mọi thao tác nhấp nhỏ.

Không nén các thay đổi bối cảnh hoặc tương tác quan trọng vào một khung nếu việc đó làm câu chuyện khó hiểu.

#### Bước 4: Tập trung vào người dùng

Storyboard không phải là một chuỗi UI mockup.

Với mỗi khung, xác định:

1. Người dùng đang làm gì?
2. Vì sao người dùng làm việc đó?
3. Người dùng đang nhìn thấy gì?
4. Người dùng đang cảm thấy gì?
5. Hệ thống đóng vai trò gì?

Người dùng phải luôn là chủ thể trung tâm của câu chuyện.

#### Bước 5: Chọn góc máy

Chọn góc máy theo thông tin mà khung cần truyền đạt.

Sử dụng:

- **Toàn cảnh cực rộng (extreme long shot / wide shot)** → không gian/địa điểm/bối cảnh.
- **Toàn cảnh (long shot)** → toàn bộ người và hành động vật lý.
- **Trung cảnh (medium shot)** → người, hành động và biểu cảm.
- **Góc qua vai (over-the-shoulder shot)** → người dùng đang tương tác với một đối tượng.
- **Góc nhìn chủ thể (point-of-view shot)** → điều người dùng nhìn thấy.
- **Cận cảnh (close-up)** → chi tiết UI/thiết bị/sản phẩm.

Không dùng cận cảnh UI cho mọi khung. 

Sử dụng các góc máy đầy đủ nhất có thể hoặc luân phiên khi cần để cả **bối cảnh** và **chi tiết tương tác** đều dễ hiểu.

#### Bước 6: Thể hiện hành động và cảm xúc bằng hình ảnh

Khi phù hợp, chỉ rõ các chú thích trực quan như:

- Mũi tên lớn cho hành động đi bộ/di chuyển.
- Mũi tên vòng tròn cho chuyển động hoặc lúc nhận ra điều gì đó.
- Dấu hỏi cho sự quan tâm/cảm xúc.
- Các vùng để nhấn mạnh hành động chụp ảnh/quay phim.
- Phần tô sáng để nhấn mạnh thông tin vừa nhận được.
- ...

Cảm xúc cần được nhìn thấy qua biểu cảm, ngôn ngữ cơ thể, ký hiệu hoặc dấu hiệu trực quan khác của người dùng thay vì chỉ tồn tại trong phần mô tả bằng chữ.

#### Bước 7: Thể hiện tương tác người dùng–hệ thống

Khi sản phẩm trở nên có liên quan, làm cho tương tác đó nhìn thấy được.

Thể hiện:

**Người dùng → hành động → hệ thống → thông tin/phản hồi → phản ứng của người dùng**

Ít nhất các tương tác sản phẩm quan trọng phải làm cho sản phẩm hoặc màn hình của nó nhìn thấy rõ ràng.

Dùng **góc qua vai**, **góc nhìn chủ thể** hoặc **cận cảnh** khi phù hợp.

#### Bước 8: Kết nối storyboard với pain/gain

Xác định pain hoặc nhu cầu tồn tại trước hoặc trong khi tương tác từ các input được cung cấp. Ưu tiên Persona, Value Proposition, Scenario 1 và bằng chứng phỏng vấn hoặc quan sát; không suy ngược pain/gain từ tính năng sản phẩm.

Sau đó thể hiện cách sản phẩm tạo ra gain mong đợi.

Storyboard cần truyền đạt **giá trị đề xuất: đáp ứng được các tiêu chí pain/gain**.

Không chỉ tuyên bố rằng sản phẩm hữu ích. Hãy làm cho giá trị của nó nhìn thấy được thông qua sự thay đổi trong tình huống của người dùng.

#### Bước 9: Suy ra các quyết định thiết kế

Sau khi mạch truyện đã rõ ràng, đối chiếu Scenario 2 để xác định tương tác mới và điều chúng hàm ý cho thiết kế sản phẩm.

Storyboard phải **dẫn đến các quyết định thiết kế**.

Các quyết định thiết kế phải được suy ra từ Scenario 2 và truy nguyên về bối cảnh được quan sát, nhu cầu, hành vi, cảm xúc hoặc khó khăn tương tác của người dùng thay vì được thêm vào một cách tùy ý.

#### Bước 10: Trình bày và lặp lại

Rà soát:

- Nó có thực tế không?
- Bối cảnh có hợp lý không?
- Động lực của nhân vật có hợp lý không?
- Họ có thực sự thực hiện những hành động đó không?

Sửa các khung, tương tác, động lực hoặc bối cảnh thiếu thực tế trước khi hoàn thiện storyboard.

## Rules

1. **Storyboard = kể chuyện + phác thảo.**

2. Luôn thiết lập **bối cảnh sử dụng**, không chỉ task.

3. Xem xét:

   - Người dùng
   - Tasks
   - Thiết bị
   - Môi trường vật lý
   - Môi trường xã hội
   - Bối cảnh thời gian và cảm xúc

4. **Các quyết định thiết kế được dẫn dắt bởi bối cảnh sử dụng chứ không phải chỉ bởi task.**

5. Tuân theo mạch truyện:

   **Mở đầu → Câu chuyện phát triển → Cao trào → Kết thúc**

6. Dùng góc máy phù hợp:

   - Toàn cảnh cực rộng (extreme long shot / wide shot)
   - Toàn cảnh (long shot)
   - Trung cảnh (medium shot)
   - Góc qua vai (over-the-shoulder shot)
   - Góc nhìn chủ thể (point-of-view shot)
   - Cận cảnh (close-up)

7. Nhấn mạnh các hành động và chuyển động quan trọng bằng hình ảnh.

8. Thêm số thứ tự mạch truyện rõ ràng: **1…. 2….**

9. Giữ storyboard tập trung vào **người dùng**, không chỉ giao diện.

10. Thể hiện **tương tác người dùng–hệ thống**.

11. Thể hiện **cảm xúc của người dùng**.

12. Truyền đạt **giá trị đề xuất** và đáp ứng các tiêu chí **pain/gain** liên quan.

13. Đảm bảo storyboard **dẫn đến các quyết định thiết kế**.

14. **Sản phẩm/màn hình sản phẩm phải nhìn thấy rõ ràng** khi phù hợp.

15. Không biến storyboard thành một chuỗi ảnh chụp màn hình UI.

16. Không bỏ qua bối cảnh môi trường hoặc cảm xúc chỉ để dành thêm chỗ cho màn hình UI.

17. Không thêm khả năng sản phẩm không được scenario hoặc mô tả sản phẩm đã cung cấp hỗ trợ.

18. Giữ hành động thực tế và động lực hợp lý.

19. Mỗi khung phải đóng góp cho mạch truyện.

20. Chuỗi khung cuối cùng phải hoạt động như một **storyboard tường thuật hoàn chỉnh**.

21. Pain/gain phải lấy từ các input được cung cấp và có thể truy nguyên về nguồn; không tự tạo pain/gain từ giải pháp.

22. Các quyết định thiết kế phải lấy từ hoặc được suy ra trực tiếp từ Scenario 2; không thêm quyết định thiết kế không xuất hiện hoặc không được Scenario 2 hỗ trợ.

## Validation Rules

Trước khi hoàn thiện, kiểm tra storyboard theo mọi tiêu chí của giảng viên.

### Tiêu chí 1 — Kể một câu chuyện rõ ràng

Xác nhận storyboard có:

**Mở đầu → Câu chuyện phát triển → Cao trào → Kết thúc**

Các khung phải kết nối logic với nhau.

### Tiêu chí 2 — Minh họa rõ bối cảnh sử dụng

Kiểm tra các bối cảnh liên quan có nhìn thấy được hay không:

- Người dùng
- Tasks
- Thiết bị
- Môi trường vật lý
- Môi trường xã hội
- Bối cảnh thời gian và cảm xúc

### Tiêu chí 3 — Tập trung vào người dùng

Storyboard chủ yếu phải truyền đạt trải nghiệm của người dùng thay vì chỉ giới thiệu màn hình sản phẩm.

### Tiêu chí 4 — Thể hiện tương tác người dùng–hệ thống

Storyboard phải minh họa rõ ràng cách người dùng tương tác với hệ thống.

### Tiêu chí 5 — Truyền đạt cảm xúc của người dùng

Những thay đổi cảm xúc quan trọng phải nhìn thấy được hoặc được truyền đạt rõ ràng.

### Tiêu chí 6 — Truyền đạt giá trị đề xuất

Storyboard phải minh họa cách giải pháp đáp ứng **pain/gain** của người dùng.

Pain/gain được minh họa phải truy nguyên được về các input đã cung cấp.

### Tiêu chí 7 — Dẫn đến các quyết định thiết kế

Scenario và bối cảnh được thể hiện trong storyboard phải cung cấp bằng chứng cho các quyết định thiết kế.

Mỗi quyết định thiết kế phải đối chiếu được với tương tác hoặc diễn biến tương ứng trong Scenario 2.

### Tiêu chí 8 — Thấy rõ sản phẩm/màn hình sản phẩm

Khi sản phẩm được sử dụng, storyboard phải làm cho sản phẩm hoặc màn hình sản phẩm liên quan nhìn thấy rõ ràng.

Không đánh dấu storyboard là hoàn thành nếu thiếu một hoặc nhiều tiêu chí áp dụng được.

## Failure Handling

### Scenario được cung cấp chưa đầy đủ

- Giữ nguyên mọi thông tin đã biết.
- Không mâu thuẫn với persona hoặc scenario.
- Chỉ suy luận các chi tiết nhỏ cần thiết để kết nối mạch truyện.
- Chỉ rõ các giả định quan trọng khi chúng ảnh hưởng đến storyboard.
- Tránh tự tạo chức năng sản phẩm không được hỗ trợ.

### Storyboard quá tập trung vào UI

- Bổ sung bối cảnh người dùng.
- Bổ sung môi trường vật lý/xã hội.
- Bổ sung hành động của người dùng.
- Bổ sung cảm xúc.
- Bổ sung các bước chuyển giữa tương tác và kết quả.

### Storyboard quá tập trung vào bối cảnh và sản phẩm không rõ ràng

- Bổ sung tương tác người dùng–hệ thống.
- Bổ sung khung góc qua vai, góc nhìn chủ thể hoặc cận cảnh.
- Làm cho sản phẩm/màn hình sản phẩm nhìn thấy được.

### Mạch truyện thiếu thực tế

Đánh giá:

- Nó có thực tế không?
- Bối cảnh có hợp lý không?
- Động lực của nhân vật có hợp lý không?
- Họ có thực sự thực hiện những hành động đó không?

Sau đó sửa các khung liên quan.

## Boundaries

Skill này không:

- Xem storyboard chỉ là một UI flow.
- Xem storyboard chỉ là một task flow.
- Loại người dùng khỏi các khung tương tác với sản phẩm.
- Bỏ qua bối cảnh vật lý, xã hội, thời gian hoặc cảm xúc khi chúng có liên quan.
- Tự tạo các tính năng sản phẩm không được hỗ trợ.
- Thêm hành động không cần thiết chỉ để tăng số lượng khung.
- Dùng cùng một góc máy cho mọi khung khi một góc khác có thể truyền đạt cảnh tốt hơn.
- Che khuất các tương tác UI quan trọng trong góc máy từ xa.
- Thay thế việc kể chuyện bằng những giải thích dài dòng bằng chữ.
- Chỉ nêu pain/gain bằng chữ mà không thể hiện chúng qua mạch truyện.
- Tạo các khung rời rạc không có **Mở đầu → Câu chuyện phát triển → Cao trào → Kết thúc**.

Storyboard cuối cùng phải đáp ứng:

- **Kể một câu chuyện rõ ràng**
- **Minh họa rõ bối cảnh sử dụng**
- **Tập trung vào người dùng**
- **Thể hiện tương tác người dùng–hệ thống**
- **Truyền đạt cảm xúc của người dùng**
- **Truyền đạt giá trị đề xuất: đáp ứng được các tiêu chí pain/gain**
- **Dẫn đến các quyết định thiết kế**
- **Thấy rõ sản phẩm/màn hình sản phẩm**
