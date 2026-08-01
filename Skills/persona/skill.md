---
name: laundry-persona-builder
description: Dùng khi cần dựng hoặc cập nhật persona cho đồ án (hệ thống hỗ trợ điều phối công việc cho nhân viên vận hành cửa hàng giặt ủi) từ dữ liệu phỏng vấn người dùng cuối. Xem skills/persona/plan.md để biết khi nào gọi skill này và định dạng input/output.
---

# Persona Generator — Skill

_(Phần "phục vụ LLM": kiến thức và logic đặc thù để chuyển input thành output đúng đắn. Phần khi-nào-gọi / input / output nằm ở `skills/persona/plan.md`.)_

## Knowledge

- Một persona đại diện cho một nhóm người dùng có chung goals, behaviors, motivations và pain points — không phải chân dung của một cá nhân cụ thể được phỏng vấn.
- Persona tốt phải: thực tế (realistic), nhất quán nội bộ (internally consistent), và có căn cứ từ dữ liệu nghiên cứu người dùng (supported by user research) — mọi pain/goal trong persona phải truy được về ít nhất một nguồn dữ liệu.
- Persona chỉ mô tả người dùng, không mô tả giải pháp/tính năng sản phẩm. Câu như "người dùng cần một app nhắc việc tự động" là sai vị trí trong persona — đó là Value Proposition, không phải mô tả người dùng.
- Trong đồ án, phạm vi người dùng hợp lệ cho persona hiện tại là nhân viên vận hành tại cửa hàng giặt ủi quy mô lớn (nhiều máy, nhiều đơn xử lý đồng thời, từ 2 nhân viên trở lên). Dữ liệu từ nhóm chủ tiệm nhỏ tự vận hành đơn lẻ không thuộc phạm vi này.
- Trong nhóm mục tiêu, có thể tồn tại các vai trò khác biệt (ví dụ: nhân viên vận hành thường vs. trưởng ca điều phối cả đội) với hành vi và nhu cầu không hoàn toàn giống nhau.

## Reasoning

- Nếu có nhiều goals xuất hiện trong dữ liệu, ưu tiên chọn goal xuất hiện lặp lại ở từ hai nguồn phỏng vấn trở lên làm goal chính của persona (tín hiệu mạnh hơn goal chỉ xuất hiện ở một nguồn).
- Nếu một pain point được người phỏng vấn tự thuật mâu thuẫn với hành vi thực tế đã quan sát/mô tả, ưu tiên tin vào behaviors quan sát được hơn là lời tự thuật.
- Chỉ suy luận (infer) thông tin còn thiếu (ví dụ: demographic, mức độ sẵn sàng công nghệ) khi có bằng chứng gián tiếp hỗ trợ từ dữ liệu liên quan (ví dụ: cùng vai trò, cùng bối cảnh làm việc). Không được suy luận goals chỉ dựa vào tuổi hoặc các thuộc tính nhân khẩu học đơn lẻ.
- Mỗi behavior trong persona phải hỗ trợ (support) cho ít nhất một goal đã liệt kê; nếu một hành vi không phục vụ goal nào, cân nhắc loại khỏi persona thay vì giữ cho "đầy đủ".
- Khi các nguồn cùng nhóm người dùng thể hiện mức độ cảm nhận pain khác nhau (ví dụ: một người thấy cấp thiết cần công cụ hỗ trợ, người khác thấy chưa cần), không được chọn một bên và bỏ bên còn lại — ghi nhận cả hai như một dải phổ trong persona (ví dụ ở mục "mức độ sẵn sàng với công nghệ") để tránh phóng đại pain nhằm "bán" ý tưởng giải pháp.

## Validation

Trước khi xuất persona, kiểm tra các cặp quan hệ sau có nhất quán không:

- **Goal ↔ Task/Behavior:** mỗi goal có ít nhất một task/behavior thực tế hỗ trợ việc đạt goal đó không?
- **Task/Behavior ↔ Pain Point:** pain point có phát sinh hợp lý từ task/behavior đã mô tả không, hay là một pain point rời rạc không liên quan?
- **Pain Point ↔ Wish/Nhu cầu cốt lõi:** nhu cầu cốt lõi nêu ra có đúng là thứ giải quyết pain point đã nêu, hay đã lệch sang một vấn đề khác?
- **Traceability:** mỗi câu mô tả trong persona (goal, pain, behavior, quote) có truy được về ít nhất một nguồn dữ liệu cụ thể trong mục "Nguồn dữ liệu" không?
- **Phạm vi nhóm người dùng:** toàn bộ dữ liệu dùng để tổng hợp có đúng thuộc nhóm người dùng mục tiêu (nhân viên tiệm lớn) không, hay có lẫn dữ liệu ngoài phạm vi (tiệm nhỏ)?
- **Tasks ↔ Behaviors:** Tasks có đang bị nhầm lẫn với Behaviors không (Tasks phải là hành động công việc cụ thể, Behaviors phải là thói quen/cách phản ứng đi kèm)?
- **Pain Points ↔ Frustrations:** Frustrations có đơn thuần lặp lại nguyên văn Pain Points không (sai), hay có diễn đạt đúng trạng thái cảm xúc phát sinh từ Pain Points (đúng)?
- **Needs (Wishes) ↔ Motivations:** Needs có bị viết thành mô tả giải pháp/tính năng không (sai — vi phạm nguyên tắc Knowledge); Motivations có giải thích được lý do sâu xa của Goals/Needs, hay chỉ lặp lại Goals bằng từ khác?

## Failure handling

- **Thiếu dữ liệu cho một thuộc tính bắt buộc** (ví dụ không có đủ dữ liệu để xác định goal): không tự bịa nội dung; ghi rõ "chưa đủ dữ liệu, cần thu thập thêm" thay vì đoán.
- **Dữ liệu lẫn nhóm người dùng** (ví dụ dữ liệu tiệm nhỏ lọt vào tập dùng cho persona tiệm lớn): dừng bước tổng hợp, lọc lại theo đúng phạm vi trước khi tiếp tục, không tổng hợp tạm rồi sửa sau.
- **Một nhóm dữ liệu thực chất chứa từ hai cụm hành vi/nhu cầu khác biệt rõ rệt trở lên** (ví dụ nhân viên thường vs. trưởng ca điều phối có nhu cầu khác hẳn nhau): không gộp cưỡng ép vào một persona; báo cho người dùng và đề xuất tách thành nhiều persona.
- **Output chứa mô tả giải pháp/tính năng** (vi phạm nguyên tắc trong Knowledge): loại bỏ phần đó khỏi persona trước khi xuất file; nếu cần, ghi chú riêng để dùng sau ở bước Value Proposition.
- **Kiểm tra Validation thất bại** (một cặp goal/task/pain/wish không khớp nhau): quay lại bước Reasoning để xử lý mâu thuẫn (theo quy tắc ưu tiên behaviors quan sát được) trước khi xuất persona, không xuất persona có mâu thuẫn nội bộ chưa giải quyết.

## Persona template (dùng ở bước xuất output)

Khung chuẩn theo mẫu môn học (HCI - FIT - HCMUS). Phải giữ đúng thứ tự và tên các mục sau, không tự đổi tên hoặc gộp mục:

```markdown
# [Tên nhân vật đại diện]

## Basic Information

| Name | ... |
| Age | ... |
| Role | ... |
| Experience | ... |
| Workplace | ... |
| Digital Literacy | ... |
| Primary Device | ... |

## Background

(đoạn văn mô tả bối cảnh công việc chung)

## Goals

- ...

## Behaviors

(hành vi điển hình quan sát/tự thuật được, không phải nhiệm vụ công việc)

- ...

## Environment (Touch points)

(những người/hệ thống/thiết bị người dùng tương tác đồng thời trong lúc làm việc)

- ...

## Tasks

(các bước công việc cụ thể phải thực hiện — khác Behaviors: Tasks là "làm gì",
Behaviors là "làm như thế nào/thói quen kèm theo")

- ...

## Pain Points

(vấn đề cụ thể, có thể quan sát được, phát sinh trong lúc thực hiện Tasks)

- ...

## Needs (Wishes)

(điều người dùng mong muốn được hỗ trợ — không mô tả giải pháp)

- ...

## Frustrations

"[Tên] cảm thấy khó chịu khi..." — trạng thái cảm xúc phát sinh từ Pain Points, không lặp
lại y nguyên Pain Points.

- ...

## Motivations

(đoạn văn: động lực sâu xa đằng sau Goals — vì sao các goal đó quan trọng với người dùng)

## Quote

"[Quote tiêu biểu]"

---
```

## Nguồn dữ liệu

(liệt kê từng nguồn đã dùng để tổng hợp)

```
Phân biệt quan trọng khi điền:
- **Tasks vs. Behaviors:** Tasks là danh sách công việc phải làm (what); Behaviors là cách người dùng thực hiện/phản ứng kèm theo (how/habits).
- **Pain Points vs. Frustrations:** Pain Points là sự kiện/vấn đề cụ thể quan sát được; Frustrations là cảm xúc phát sinh từ các Pain Points đó, viết theo dạng "[Tên] cảm thấy khó chịu khi...".
- **Needs (Wishes) vs. Motivations:** Needs là điều cụ thể người dùng muốn được hỗ trợ; Motivations là lý do sâu xa/giá trị đứng sau các Goals và Needs đó.

```
