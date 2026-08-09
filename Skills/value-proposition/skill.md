---
name: value-proposition
description: Dùng Value Proposition Canvas để liên kết bằng chứng người dùng với nhu cầu và giá trị đề xuất trong đồ án HCI.
---

# Skill Value Proposition Canvas

## Purpose

Tạo hoặc rà soát Value Proposition Canvas cho đồ án HCI dựa trên các vấn đề và nhu cầu của một nhóm người dùng cụ thể.

Skill này giúp Agent:

- Mô tả đúng Customer Profile từ bằng chứng hiện có.
- Liệt kê Customer Jobs, Pains và Gains theo mức độ quan trọng hoặc cường độ.
- Liên kết Products & Services, Pain Relievers và Gain Creators với đúng nhu cầu.
- Kiểm tra sự phù hợp giữa vấn đề, nhu cầu và giá trị đề xuất.
- Giữ ranh giới giữa finding, synthesis, assumption và ý tưởng thiết kế.

Skill này không dùng để khẳng định product-market fit, doanh thu, mức sẵn sàng trả tiền hoặc kết quả nghiên cứu chưa có bằng chứng.

## Use This Skill When

- Người dùng muốn tạo Value Proposition Canvas.
- Đã có persona, phỏng vấn, quan sát, scenario hoặc pain points cần tổng hợp thành giá trị đề xuất.
- Người dùng muốn kiểm tra một giá trị đề xuất có giải quyết đúng vấn đề của đối tượng hay không.
- Người dùng muốn so sánh một đề xuất thiết kế với cách làm hiện tại.

Không gọi skill này khi chỉ muốn tạo giao diện, storyboard, wireframe hoặc triển khai phần mềm mà chưa cần phân tích giá trị.

## Required Inputs

Ưu tiên nhận một hoặc nhiều nguồn sau:

- Persona của nhóm người dùng mục tiêu.
- Ghi chú phỏng vấn hoặc quan sát.
- Scenario hiện tại và workflow hiện tại.
- Goals, Tasks, Behaviors, Pain Points, Frustrations, Needs hoặc Wishes.
- Trích dẫn trực tiếp có nguồn.
- Ý tưởng sản phẩm hoặc tính năng cần kiểm tra.
- Template hoặc canvas của lecturer, nếu có.

Mỗi input cần được ghi nguồn và trạng thái bằng chứng khi có thể. Nếu input là dữ liệu mô phỏng hoặc giả định, phải ghi rõ.

## Output

Đầu ra mặc định là một tài liệu Markdown gồm:

1. Customer Segment và bối cảnh công việc.
2. Customer Jobs, được mô tả theo công việc, vấn đề hoặc nhu cầu người dùng đang cố hoàn thành.
3. Customer Pains, được xếp theo cường độ và tần suất nếu dữ liệu cho phép.
4. Customer Gains, được xếp theo mức độ liên quan và tần suất nếu dữ liệu cho phép.
5. Products & Services.
6. Pain Relievers.
7. Gain Creators.
8. Fit assessment và các khoảng trống cần kiểm chứng.

Đầu ra phải phù hợp với deliverable **Value Proposition** trong rubric và nhất quán với Persona, Scenario 1 và các artifact liên quan.

## Domain Knowledge

### Tổng quan Value Proposition Canvas

Value Proposition Canvas gồm hai phần phải được đọc cùng nhau:

```text
CUSTOMER PROFILE                         VALUE MAP
Customer Jobs                            Products & Services
Customer Pains             FIT           Pain Relievers
Customer Gains                           Gain Creators
```

- **Customer Profile** mô tả điều nhóm người dùng đang cố hoàn thành và những kết quả họ cần.
- **Value Map** mô tả đề xuất tạo giá trị như thế nào cho đúng nhóm người dùng đó.
- **FIT** là mức độ Value Map giải quyết các job, pain và gain quan trọng nhất.

Quy tắc cốt lõi: luôn hoàn thành Customer Profile trước Value Map. Không bắt đầu từ danh sách tính năng rồi cố gán pain hoặc gain sau đó.

### Bước 1: Xác định Customer Jobs

Customer Jobs là các task người dùng đang cố hoàn thành, vấn đề đang cố giải quyết hoặc nhu cầu đang cố đáp ứng.

Khi phân tích job, hỏi:

1. Người dùng đang cố hoàn thành task nào, giải quyết vấn đề nào hoặc đáp ứng nhu cầu nào? *(Ví dụ: hoàn thành một quy trình hoặc đạt được một kết quả cụ thể.)*
2. Có một việc nào người dùng nhất định phải hoàn thành không? *(Ví dụ: hoàn thành một công việc cốt lõi để đạt mục tiêu.)*
3. Người dùng cuối cùng đang cố đạt được kết quả nào? *(Ví dụ: hoàn thành đúng yêu cầu hoặc giải quyết một vấn đề cụ thể.)*
4. Người dùng cần hoàn thành điều gì để xem công việc là thành công? *(Ví dụ: đạt kết quả mong muốn với ít lỗi và ít nỗ lực hơn.)*

Xếp mỗi job theo mức độ quan trọng và ghi tần suất xảy ra. Không xem tên một tính năng là Customer Job.

### Bước 2: Xác định Customer Pains

Pains là cảm xúc tiêu cực, chi phí, tình huống không mong muốn, rủi ro, trở ngại hoặc sai sót xảy ra trước, trong và sau khi người dùng hoàn thành job.

Các câu hỏi cần dùng:

1. Khách hàng thấy điều gì quá tốn kém về thời gian, tiền bạc hoặc công sức? *(Ví dụ: mất nhiều thời gian, chi phí cao hoặc cần quá nhiều nỗ lực.)*
2. Điều gì khiến người dùng cảm thấy không tốt, khó chịu hoặc bực bội? *(Ví dụ: thao tác phức tạp, chờ đợi hoặc phải lặp lại công việc.)*
3. Các giải pháp hiện tại đang hoạt động chưa tốt ở điểm nào? *(Ví dụ: thiếu tính năng, hiệu năng thấp hoặc thường gặp lỗi.)*
4. Khách hàng gặp những khó khăn và thách thức chính nào? *(Ví dụ: khó hiểu cách dùng, khó hoàn thành task hoặc gặp trở ngại khi phối hợp.)*
5. Khách hàng gặp hoặc lo sợ những hậu quả xã hội tiêu cực nào? *(Ví dụ: mất sự tin tưởng, uy tín hoặc vị thế.)*
6. Khách hàng lo sợ những rủi ro nào, như rủi ro tài chính, xã hội hoặc kỹ thuật? *(Ví dụ: mất tiền, mất dữ liệu hoặc sử dụng sai.)*
7. Điều gì khiến người dùng lo lắng hoặc không yên tâm? *(Ví dụ: một vấn đề lớn, mối lo hoặc tình huống không kiểm soát được.)*
8. Khách hàng thường mắc những sai lầm nào? *(Ví dụ: nhập sai thông tin hoặc bỏ sót một bước.)*
9. Những rào cản nào khiến người dùng chưa chấp nhận giải pháp? *(Ví dụ: chi phí ban đầu, đường cong học tập hoặc ngại thay đổi.)*

Trong bối cảnh đồ án, kiểm tra các pain liên quan đến:

- Khó biết công việc nào nên xử lý tiếp theo.
- Thông tin phân tán giữa nhiều công cụ, ghi chú hoặc trao đổi bằng lời nói.
- Khó biết một công việc đã hoàn tất hoặc bước tiếp theo cần làm.
- Khó truyền đủ trạng thái, người phụ trách và việc cần làm khi bàn giao.
- Nguy cơ nhầm, bỏ quên, làm trùng hoặc chuyển sai công đoạn.
- Yêu cầu gấp, thay đổi thời hạn, hàng chờ hoặc nguồn lực không sẵn sàng.

Xếp pain theo cường độ và ghi tần suất chỉ khi dữ liệu cho phép.

### Bước 3: Xác định Customer Gains

Gains là lợi ích người dùng mong đợi, mong muốn hoặc có thể thấy bất ngờ. Gains không chỉ là viết lại Pains theo chiều ngược lại.

Các câu hỏi cần dùng:

1. Việc tiết kiệm thời gian, tiền bạc hoặc công sức nào sẽ làm người dùng hài lòng? *(Ví dụ: giảm thời gian, chi phí hoặc số bước cần thực hiện.)*
2. Khách hàng mong đợi kết quả nào và kết quả nào có thể vượt quá mong đợi? *(Ví dụ: chất lượng tốt hơn, ít lỗi hơn hoặc hoàn thành nhanh hơn.)*
3. Các giải pháp hiện tại làm người dùng hài lòng nhờ đặc điểm, hiệu năng hoặc chất lượng nào? *(Ví dụ: thao tác nhanh, ổn định hoặc dễ sử dụng.)*
4. Điều gì sẽ làm công việc hoặc cuộc sống của người dùng dễ dàng hơn? *(Ví dụ: học nhanh hơn, dễ tiếp cận hơn hoặc có thêm hỗ trợ.)*
5. Khách hàng mong muốn những hậu quả xã hội tích cực nào? *(Ví dụ: được tin tưởng, được đánh giá cao hoặc có vị thế tốt hơn.)*
6. Khách hàng đang tìm kiếm điều gì ở một giải pháp? *(Ví dụ: thiết kế tốt, bảo đảm hoặc một tính năng cụ thể.)*
7. Khách hàng đang mơ ước điều gì? *(Ví dụ: đạt được thành tựu lớn hoặc giảm bớt một gánh nặng lớn.)*
8. Khách hàng đo lường thành công và thất bại bằng cách nào? *(Ví dụ: hiệu năng, chi phí hoặc chất lượng kết quả.)*
9. Điều gì sẽ làm tăng khả năng người dùng chấp nhận một giải pháp? *(Ví dụ: chi phí thấp hơn, rủi ro thấp hơn, chất lượng hoặc hiệu năng tốt hơn.)*

Phân loại gain khi dữ liệu cho phép:

- **Required:** điều kiện tối thiểu để công việc hoặc giải pháp có thể sử dụng.
- **Expected:** kết quả người dùng thường mong đợi.
- **Desired:** lợi ích giúp công việc dễ hơn nhưng chưa chắc được mong đợi.
- **Unexpected:** lợi ích vượt kỳ vọng; phải ghi rõ là giả định nếu chưa có bằng chứng.

Đối với đồ án, ưu tiên kiểm tra gains về hoàn thành công việc, hiểu trạng thái, giảm tải ghi nhớ, phối hợp và quyền điều chỉnh của người dùng.

### Bước 4: Liệt kê Products & Services

Sau khi Customer Profile đã rõ, mới liệt kê các sản phẩm và dịch vụ mà value proposition dựa vào.

Products & Services không tự tạo ra giá trị. Mỗi item phải hỗ trợ ít nhất một job hoặc liên quan đến một pain/gain đã xác định. Xếp theo mức độ quan trọng và xác định item là crucial hay trivial đối với người dùng.

### Bước 5: Thiết kế Pain Relievers

Pain Relievers mô tả chính xác cách Products & Services giảm một pain cụ thể.

| Customer Pain | Câu hỏi kiểm tra Pain Reliever |
| --- | --- |
| Khó biết việc tiếp theo | Đề xuất hiển thị hoặc giải thích thứ tự như thế nào? |
| Thông tin phân tán | Đề xuất đưa những thông tin liên quan về đâu? |
| Dễ quên bước tiếp theo | Đề xuất nhắc ở thời điểm nào và phản hồi ra sao? |
| Bàn giao thiếu ngữ cảnh | Đề xuất truyền trạng thái, vị trí và việc tiếp theo như thế nào? |
| Nguy cơ làm trùng hoặc sai công đoạn | Đề xuất hiển thị trạng thái và quyền xác nhận ra sao? |

Pain Relievers cần kiểm tra xem đề xuất có:

- Tạo ra tiết kiệm về thời gian, tiền bạc hoặc công sức không? *(Ví dụ: giảm số bước hoặc giảm chi phí.)*
- Làm người dùng cảm thấy tốt hơn, giảm khó chịu hoặc bực bội không? *(Ví dụ: giảm chờ đợi hoặc giảm thao tác lặp lại.)*
- Khắc phục giải pháp đang hoạt động chưa tốt không? *(Ví dụ: cải thiện tính năng, hiệu năng hoặc chất lượng.)*
- Chấm dứt các khó khăn và thách thức người dùng gặp phải không? *(Ví dụ: làm cho task dễ hoàn thành hơn.)*
- Loại bỏ các hậu quả xã hội tiêu cực mà người dùng gặp hoặc lo sợ không? *(Ví dụ: giảm nguy cơ mất sự tin tưởng.)*
- Loại bỏ các rủi ro mà người dùng lo sợ không? *(Ví dụ: giảm rủi ro tài chính, xã hội hoặc kỹ thuật.)*
- Giúp người dùng bớt lo lắng không? *(Ví dụ: cung cấp thông tin hoặc hỗ trợ cho một vấn đề lớn.)*
- Hạn chế hoặc loại bỏ các sai lầm thường gặp không? *(Ví dụ: giảm lỗi nhập liệu hoặc bỏ sót bước.)*
- Loại bỏ các rào cản khiến người dùng chưa chấp nhận giải pháp không? *(Ví dụ: giảm chi phí ban đầu hoặc làm đường cong học tập dễ hơn.)*

Xếp mỗi pain reliever theo cường độ pain mà nó giải quyết và ghi tần suất nếu có dữ liệu. Không dùng mô tả chung như “tối ưu quy trình” nếu chưa chỉ ra pain cụ thể.

### Bước 6: Tạo Gain Creators

Gain Creators mô tả cách Products & Services tạo ra một gain cụ thể.

| Customer Gain | Câu hỏi kiểm tra Gain Creator |
| --- | --- |
| Biết việc nên làm tiếp theo | Đề xuất giúp người dùng nhận biết hành động nào và vì sao như thế nào? |
| Bớt phải ghi nhớ | Đề xuất lưu và hiển thị thông tin nào? |
| Dễ bàn giao | Đề xuất giúp người tiếp nhận tiếp tục công việc ra sao? |
| Tự tin điều chỉnh | Đề xuất cho người dùng xem, xác nhận hoặc đổi thứ tự như thế nào? |

Gain Creators cần kiểm tra xem đề xuất có:

- Tạo ra khoản tiết kiệm làm người dùng hài lòng không? *(Ví dụ: tiết kiệm thời gian, tiền bạc hoặc công sức.)*
- Tạo ra kết quả người dùng mong đợi hoặc vượt quá mong đợi không? *(Ví dụ: chất lượng tốt hơn hoặc kết quả ổn định hơn.)*
- Sao chép hoặc vượt qua giải pháp hiện tại ở đặc điểm, hiệu năng hoặc chất lượng quan trọng không? *(Ví dụ: nhanh hơn, dễ dùng hơn hoặc đáng tin cậy hơn.)*
- Làm công việc hoặc cuộc sống của người dùng dễ dàng hơn không? *(Ví dụ: học nhanh hơn, dễ tiếp cận hơn hoặc có thêm hỗ trợ.)*
- Tạo ra hậu quả xã hội tích cực mà người dùng mong muốn không? *(Ví dụ: giúp người dùng được đánh giá cao hơn.)*
- Cung cấp điều người dùng đang tìm kiếm không? *(Ví dụ: thiết kế tốt, bảo đảm hoặc tính năng cụ thể.)*
- Đáp ứng điều người dùng đang mơ ước không? *(Ví dụ: đạt thành tựu lớn hoặc giảm bớt gánh nặng lớn.)*
- Tạo ra kết quả phù hợp với tiêu chí thành công và thất bại của người dùng không? *(Ví dụ: hiệu năng tốt hơn hoặc chi phí thấp hơn.)*

Xếp mỗi gain creator theo mức độ liên quan của gain mà nó tạo ra và ghi tần suất nếu có dữ liệu. Không tuyên bố gain ngoài phạm vi dữ liệu hoặc ngoài phạm vi HCI của đồ án.

### Bước 7: Đánh giá FIT

FIT được xem xét bằng cách đối chiếu hai phía:

| Customer Profile quan trọng nhất | Value Map mạnh nhất |
| --- | --- |
| Jobs | Products & Services |
| Pains | Pain Relievers |
| Gains | Gain Creators |

Checklist FIT:

- [ ] Products & Services hỗ trợ các Customer Jobs quan trọng.
- [ ] Pain Relievers giải quyết các Pains có ảnh hưởng rõ.
- [ ] Gain Creators tạo ra các Gains mà người dùng thực sự cần hoặc mong muốn.
- [ ] Mỗi liên kết có nguồn hoặc được ghi rõ là giả định.
- [ ] Người dùng có thể xem lý do, xác nhận và điều chỉnh đề xuất của hệ thống.
- [ ] Có ghi lại các pain, gain hoặc job chưa được giải quyết.

Trong đồ án này, FIT chỉ có nghĩa là **problem-solution fit ở mức prototype HCI**. Không kết luận product-market fit, business model fit, khả năng sinh lời hoặc mức sẵn sàng trả tiền nếu không có dữ liệu tương ứng.

## Reasoning / Inference Strategy

### Nguyên tắc suy luận

1. Bắt đầu từ Persona, không bắt đầu từ sản phẩm hoặc tính năng.
2. Đọc các thông tin trong Persona gồm bối cảnh, goals, tasks, behaviors, pain points, motivations, wishes và quote.
3. Xác định điều Persona đang cố hoàn thành, vấn đề Persona đang gặp và kết quả Persona mong muốn.
4. Chuyển goals, tasks và behaviors của Persona thành Customer Jobs; không coi tên sản phẩm hoặc tính năng là một job.
5. Chuyển pain points và frustrations của Persona thành Customer Pains; tách pain đã xảy ra khỏi pain mới chỉ là dự đoán.
6. Chuyển motivations, wishes và needs của Persona thành Customer Gains; không tạo gain chỉ bằng cách viết ngược lại một pain.
7. Xếp hạng jobs, pains và gains theo mức độ quan trọng được thể hiện trong Persona; nếu Persona chưa đủ dữ liệu thì ghi rõ chưa xác thực.
8. Kiểm tra Customer Profile có phản ánh đúng Persona trước khi xây dựng Value Map.
9. Từ Customer Profile, xác định Products & Services cần có để hỗ trợ các job của Persona.
10. Ghép từng Pain Reliever với một pain cụ thể và từng Gain Creator với một gain cụ thể của Persona.
11. Kiểm tra Value Map có giải quyết đúng goals, pain points và needs của Persona, không thêm giá trị ngoài Persona.
12. Đối chiếu lại với Scenario 1 và các nguồn nghiên cứu trước khi kết luận FIT.

## Rules

- Không tự tạo finding, câu trích dẫn, số đo, mức độ nghiêm trọng hoặc tần suất.
- Không đưa sản phẩm hoặc tính năng vào Value Map trước khi đọc Customer Profile.
- Không đưa giá trị không liên kết với Persona, Scenario 1 hoặc bằng chứng phỏng vấn/quan sát.
- Không biến câu hỏi phỏng vấn hoặc dòng “Insight cần khai thác” thành câu trả lời của người dùng.
- Không dùng màu sắc làm nguồn duy nhất để biểu diễn mức độ ưu tiên trong artifact.
- Mọi thứ tự ưu tiên phải có lý do mà người dùng có thể xem và điều chỉnh.
- Không mô tả prototype như hệ thống production hoặc công cụ điều khiển thiết bị thật.
- Dùng ngôn ngữ quen thuộc với nhóm người dùng; tránh thuật ngữ kỹ thuật nếu không cần.
- Giữ một-một giữa vấn đề, nhu cầu và giá trị đề xuất khi deliverable yêu cầu.
- Nếu dữ liệu chưa đủ, giữ ô trống, ghi `chưa có bằng chứng` hoặc tạo open question thay vì bịa nội dung.

## Validation Rules

### Kiểm tra đầu vào

- [ ] Có xác định rõ nhóm người dùng mục tiêu.
- [ ] Có bối cảnh công việc, task hoặc workflow cụ thể.
- [ ] Có nguồn cho các claim chính hoặc ghi rõ claim là giả định.
- [ ] Persona và Scenario 1, nếu được dùng, tồn tại và không mâu thuẫn với input.

### Kiểm tra Customer Profile

- [ ] Có Customer Jobs, Pains và Gains riêng biệt.
- [ ] Jobs mô tả việc cần hoàn thành, không phải tên tính năng.
- [ ] Pains mô tả vấn đề, trở ngại, rủi ro hoặc cảm xúc tiêu cực cụ thể.
- [ ] Gains mô tả kết quả mong muốn, không chỉ lặp lại Pains.
- [ ] Ranking và tần suất chỉ được ghi khi có căn cứ; phần còn lại được đánh dấu chưa xác thực.

### Kiểm tra Value Map

- [ ] Products & Services thuộc phạm vi prototype HCI và có liên quan đến một job.
- [ ] Mỗi Pain Reliever chỉ rõ pain được giảm và cách giảm.
- [ ] Mỗi Gain Creator chỉ rõ gain được tạo và cách người dùng nhận biết kết quả.
- [ ] Không có tính năng mồ côi không liên kết với Customer Profile.

### Kiểm tra FIT và deliverable

- [ ] Có đường liên kết từ pain/need đến value proposition.
- [ ] Không có giá trị đề xuất vượt quá bằng chứng mà không ghi rõ là giả định.
- [ ] Kết luận chỉ là problem-solution fit trong phạm vi đồ án.
- [ ] Nội dung nhất quán với Persona, Scenario 1 và mục Value Proposition trong `docs/Rubric.md`.
- [ ] Tài liệu Markdown đọc được và có các phần của canvas lecturer.

## Failure Handling

### Thiếu bằng chứng người dùng

- Dừng việc kết luận pain hoặc gain là finding.
- Ghi claim là giả định hoặc đưa vào mục `Open questions`.
- Đề xuất câu hỏi phỏng vấn hoặc quan sát tiếp theo, không tự điền câu trả lời.

### Nguồn mâu thuẫn

- Giữ riêng từng finding theo nguồn.
- Ghi rõ nhóm người dùng, bối cảnh và điểm mâu thuẫn.
- Không trung bình hóa hoặc chọn một nguồn mà không nêu lý do.

### Có tính năng nhưng không có pain/gain phù hợp

- Đưa tính năng vào mục `Unmapped ideas` hoặc loại khỏi Value Map.
- Không tạo pain/gain mới chỉ để hợp thức hóa tính năng.

### Có pain nhưng chưa có giải pháp phù hợp

- Giữ pain trong Customer Profile.
- Ghi `Chưa có Pain Reliever phù hợp` và nêu gap cần nghiên cứu hoặc thiết kế.

### Không đủ dữ liệu để xếp hạng

- Không gán mức `cao`, `trung bình` hoặc `thấp` như một finding.
- Dùng thứ tự tạm thời có ghi rõ là giả định, hoặc để trạng thái `chưa xếp hạng`.

### Persona hoặc Scenario không nhất quán

- Dừng kết luận FIT.
- Liệt kê claim mâu thuẫn và nguồn tương ứng.
- Ưu tiên làm rõ evidence upstream trước khi sửa Value Map downstream.

## Boundaries

Skill này không:

- Thay thế phỏng vấn, quan sát hoặc kiểm thử với người dùng.
- Tạo dữ liệu người dùng, persona hoặc quote không có nguồn.
- Quyết định thay nhóm dự án về tính năng cuối cùng.
- Đánh giá doanh thu, pricing, product-market fit hoặc business model fit.
- Điều khiển thiết bị thật hoặc dữ liệu production.
