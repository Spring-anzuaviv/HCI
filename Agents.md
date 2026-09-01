# Cấu hình Agent của dự án

## 1. Bối cảnh dự án

Đây là đồ án HCI về các vấn đề trong công việc hằng ngày của nhân viên tại cửa hàng giặt ủi. Dự án tìm hiểu cách nhân viên tiếp nhận, phân loại, xử lý, theo dõi và bàn giao đồ giặt khi phải làm việc với nhiều đơn hàng, máy móc, thời hạn và sự gián đoạn cùng lúc.

Dự án phải luôn tập trung vào vấn đề. Không mô tả dự án như một sản phẩm có thương hiệu hoặc bắt đầu từ một giải pháp được đề xuất. Hãy bắt đầu từ nhu cầu người dùng được quan sát, bối cảnh công việc, cách làm hiện tại, điểm khó khăn và cơ hội cải thiện tương tác. Mọi giao diện hoặc tính năng phần mềm được đề xuất chỉ là phương tiện để giải quyết một vấn đề đã được xác thực.

Người dùng chính là nhân viên giặt ủi trực tiếp, có thể phải phân loại quần áo, nạp và lấy đồ khỏi máy giặt hoặc máy sấy, chuyển mẻ đồ giữa các công đoạn, kiểm tra chất lượng, đóng gói và trao đổi trạng thái với đồng nghiệp. Cần xem xét cả nhân viên mới và nhân viên có kinh nghiệm, trừ khi task giới hạn rõ nhóm người dùng.

### Trọng tâm vấn đề

Tìm hiểu các vấn đề như:

- Khó biết nên xử lý việc nào tiếp theo khi nhiều đơn hàng cùng cạnh tranh sự chú ý.
- Thông tin bị phân tán trên giấy ghi chú, trao đổi bằng lời nói, màn hình và đèn báo của máy.
- Bỏ lỡ hoặc thay đổi thời hạn do hàng chờ dài, phải làm lại, thiếu máy hoặc máy gặp sự cố.
- Tải nhận thức cao do phải chuyển đổi giữa công việc vật lý và theo dõi nhiều đơn hàng, máy móc.
- Khó hiểu vì sao một công việc cần được ưu tiên hơn công việc khác.
- Sai sót khi chuyển mẻ đồ sang công đoạn tiếp theo hoặc bàn giao cho nhân viên khác.
- Khác biệt về kinh nghiệm dẫn đến quyết định không nhất quán và khó hướng dẫn nhân viên mới.

Không được tự tạo kết quả nghiên cứu người dùng. Phải ghi rõ đâu là giả định, giả thuyết, dữ liệu mô phỏng và bằng chứng từ phỏng vấn hoặc quan sát.

## 2. Phạm vi dự án

Đầu ra của dự án là các sản phẩm nghiên cứu HCI, thiết kế tương tác, prototype trực quan và prototype phần mềm minh họa những tương tác được cải thiện cho nhân viên giặt ủi.

Trong phạm vi:

- Tìm hiểu quy trình làm việc hiện tại và các vấn đề của nó.
- Mô tả nhân viên mục tiêu thông qua persona dựa trên nghiên cứu.
- Liên kết nhu cầu người dùng với value proposition.
- Thể hiện tình huống làm việc hiện tại và được cải thiện qua scenario và storyboard.
- Thiết kế, kiểm thử wireframe và prototype tương tác.
- Xây dựng software product minh họa các tương tác được cải thiện.
- Chuẩn bị presentation và report cuối kỳ.

Ngoài phạm vi, trừ khi người dùng yêu cầu rõ ràng:

- Thay thế toàn bộ hệ thống POS, thanh toán, kế toán, quản lý khách hàng, giao nhận hoặc chấm công.
- Tích hợp thật với phần mềm giặt ủi thương mại.
- Điều khiển trực tiếp máy giặt hoặc máy sấy thật.
- Triển khai production hoặc di chuyển dữ liệu production.
- Sử dụng dịch vụ AI không cần thiết cho câu hỏi nghiên cứu HCI.

## 3. Deliverables bắt buộc


1. **Persona**: Persona rõ ràng, chi tiết, có đủ chín phần theo rubric, hình ảnh đại diện và cách trình bày dễ đọc. Persona phải đại diện cho nhân viên giặt ủi và dựa trên bằng chứng hoặc ghi rõ là giả định.
2. **Value Proposition**: Đầy đủ các phần của value proposition, trong đó vấn đề, nhu cầu của persona và giá trị đề xuất phải tương ứng một-một. Không đưa vào giá trị không được hỗ trợ bởi persona.
3. **Scenario 1 (Hiện tại)**: Mô tả hoặc chuỗi hình ảnh dễ đọc về tình huống làm việc hiện tại, gồm hành động nhân viên, bối cảnh xung quanh và các vấn đề cụ thể.
4. **Scenario 2 (Cải thiện)**: Mô tả hoặc chuỗi hình ảnh thể hiện tương tác mới và cách chúng giải quyết các vấn đề trong Scenario 1.
5. **Storyboard**: Câu chuyện mạch lạc với hình minh họa, chú thích và đủ khung hình để thể hiện bối cảnh, khó khăn, tương tác và kết quả của nhân viên.
6. **Prototype**: Prototype trực quan hoàn chỉnh, minh họa các tương tác mới quan trọng và đủ ổn định để walkthrough.
7. **Wireframe**: Wireframe chi tiết, có thể sử dụng, được tạo bằng công cụ phù hợp, thể hiện bố cục, phân cấp, điều hướng và các trạng thái tương tác.
8. **Software Product**: Prototype phần mềm hoạt động, hiện thực hóa luồng tương tác được cải thiện đã chọn. Sản phẩm phải minh họa phần lớn quy trình liên quan, không chỉ là các màn hình tĩnh.
9. **Presentation**: Bài trình bày rõ ràng để nhóm giải thích dự án, quyết định thiết kế, bằng chứng, tương tác và trả lời các câu hỏi “tại sao”. Mỗi thành viên phải chuẩn bị để trình bày và trả lời câu hỏi.
10. **Report**: Báo cáo đầy đủ, định dạng nhất quán, theo yêu cầu môn học, có tiêu đề, nội dung, hình ảnh và tài liệu tham khảo khi cần.

Khi thực hiện hoặc ghi chép một task, phải xác định task đó hỗ trợ deliverable nào. Không xây dựng tính năng không thể liên kết với deliverable hoặc với một vấn đề đã được xác thực của nhân viên giặt ủi.

## 4. Công nghệ

Sử dụng stack hiện có của dự án, trừ khi người dùng yêu cầu thay đổi rõ ràng:

- Frontend: React cho prototype phần mềm tương tác.
- Backend: Node.js và Express khi cần API hoặc hành vi phía máy chủ.
- Dữ liệu: Supabase hoặc dữ liệu mock, tùy theo cấu trúc hiện tại của dự án.
- Logic ưu tiên hoặc workflow: logic tường minh, có thể kiểm tra; không sử dụng mô hình AI không thể giải thích.
- Design artifacts: sử dụng các file thiết kế và công cụ đã có trong repository.
- Xuất hình ảnh: sử dụng renderer hiện có hoặc công cụ cục bộ phù hợp như Playwright khi cần xuất HTML thành ảnh.

Không thêm dependency khi khả năng hiện có của dự án đã đủ. Không hard-code secret. Dùng biến môi trường cho thông tin xác thực và không commit file `.env` chứa secret.

## 5. Quy tắc thiết kế

### Thiết kế lấy người dùng làm trung tâm

- Bắt đầu từ bối cảnh, mục tiêu, task, khó khăn và giới hạn của nhân viên giặt ủi.
- Ưu tiên bằng chứng được cung cấp hoặc quan sát được hơn giả định.
- Giải thích các giả định quan trọng và phân biệt chúng với kết quả nghiên cứu.
- Giữ persona, value proposition, scenario, storyboard, wireframe, prototype, software, presentation và report nhất quán với nhau.
- Thiết kế cho cả nhân viên mới và nhân viên có kinh nghiệm, trừ khi task quy định khác.

### Thiết kế trực quan và tương tác

- Sử dụng giao diện rõ ràng, tương phản cao, phù hợp với khu vực giặt ủi sáng và bận rộn.
- Ưu tiên font sans-serif dễ đọc và cỡ chữ đủ lớn để đọc nhanh khi đang đứng hoặc di chuyển.
- Dùng bố cục card, list, table hoặc từng bước khi giúp nhân viên quét thông tin nhanh.
- Làm cho hành động chính dễ thấy, dễ chạm và có thể thực hiện với ít bước.
- Hiển thị trạng thái, thời gian, người phụ trách và hành động tiếp theo rõ ràng, không chỉ dựa vào màu sắc.
- Dùng ngôn ngữ quen thuộc với công việc giặt ủi thay vì thuật ngữ kỹ thuật.
- Phản hồi sau mỗi hành động quan trọng của nhân viên.
- Giữ quyền kiểm soát cho con người: đề xuất hoặc thứ tự phải dễ hiểu, có thể xem xét và điều chỉnh.
- Thiết kế responsive cho các kích thước desktop, tablet và mobile được hỗ trợ.
- Khi có wireframe hoặc mockup tham chiếu, phải so sánh implementation với thiết kế gốc thay vì tự ý thay thế ngôn ngữ hình ảnh.

### Khả năng tiếp cận và bằng chứng

- Duy trì tương phản tốt giữa chữ và control, ưu tiên đạt WCAG AA.
- Không truyền đạt ý nghĩa quan trọng chỉ bằng màu sắc; kết hợp màu với nhãn, icon hoặc văn bản.
- Có các trạng thái focus, hover, pressed, loading, empty, error và disabled khi phù hợp.
- Chú thích và nội dung annotation trong deliverable phải đọc được ở kích thước trình bày.
- Tránh nội dung trang trí cạnh tranh với task trước mắt của nhân viên.

## 6. Quy tắc ngôn ngữ và giao tiếp

- Viết file dự án, comment code, UI copy khi được yêu cầu cho deliverable và tài liệu bằng tiếng Việt, trừ khi người dùng yêu cầu ngôn ngữ khác cho artifact đó.
- Luôn trả lời người dùng bằng tiếng Việt.
- Giữ câu trả lời ngắn gọn và dùng tiêu đề Markdown khi hữu ích.
- Giải thích ngắn gọn các quyết định thiết kế hoặc kỹ thuật quan trọng bằng tiếng Việt.
- Không tuyên bố kết quả được hỗ trợ bởi nghiên cứu nếu repository không có bằng chứng tương ứng.
- Nêu rõ sự không chắc chắn và giới hạn thay vì bịa đặt sự kiện, nguồn, trích dẫn, screenshot hoặc phản hồi người dùng.

## 7. Skills, rules, templates và tools

Sử dụng cấu trúc repository như một pipeline có thể tái sử dụng:

- `skills/<skill-name>/plan.md`: thời điểm dùng skill, input, output và workflow.
- `skills/<skill-name>/skill.md`: kiến thức lĩnh vực, chiến lược suy luận, quy tắc validation và xử lý lỗi.
- `plan.md`: roadmap cấp project, dependency giữa deliverable, milestone và trạng thái verification.
- `rules/`: các quy tắc HCI, chất lượng, task, lĩnh vực hoặc phong cách dùng chung khi có.
- `templates/`: cấu trúc đầu ra ổn định cho persona, value proposition, scenario, storyboard, tài liệu wireframe, presentation và report.
- `tools/`: script hoặc custom tool xác định để render, export, validation hoặc so sánh artifact.
- `docs/Rubric.md`: tiêu chí chấp nhận cho mười deliverables.

Trước khi dùng skill, đọc `plan.md` và `skill.md` của skill đó nếu có. Nếu skill, template hoặc tool cần thiết chưa tồn tại, không được giả vờ đã sử dụng; hãy tạo hoặc đề xuất artifact nhỏ nhất còn thiếu.

## 8. Workflow bắt buộc

Với mọi task đáng kể, thực hiện workflow sau:

1. Đọc `Agents.md`, `plan.md`, các file liên quan trong `docs/`, plan và skill phù hợp, cùng các file hiện tại của dự án.
2. Xác định vấn đề của nhân viên giặt ủi, người dùng mục tiêu, bối cảnh công việc và deliverable trong rubric bị ảnh hưởng.
3. Kiểm tra bằng chứng hiện có. Phân biệt findings, assumptions, constraints và open questions.
4. Xác định input, output và tiêu chí thành công trước khi chỉnh sửa.
5. Mô tả interaction flow: điểm bắt đầu, hành động nhân viên, phản hồi hệ thống, quyết định hoặc xác nhận và trạng thái kết thúc.
6. Chọn hoặc gọi skill, template hoặc tool nhỏ nhất phù hợp.
7. Tạo artifact hoặc implementation từng bước. Bảo vệ công việc hiện có và không ghi đè file không liên quan.
8. Nếu thay đổi artifact trực quan hoặc giao diện, render hoặc mở artifact và kiểm tra ở kích thước trình bày dự kiến.
9. So sánh kết quả với thiết kế tham chiếu và rubric. Liệt kê khác biệt, phần thiếu, vấn đề dễ đọc và thuật ngữ không nhất quán.
10. Sửa các vấn đề đã xác định và kiểm tra lại. Với software, chạy test, build hoặc kiểm tra cục bộ phù hợp.
11. Cập nhật `plan.md` khi hoàn thành milestone hoặc deliverable.
12. Báo cáo công việc đã hoàn thành, bằng chứng sử dụng, giả định, verification, giới hạn và phần còn lại bằng tiếng Việt.

### Kiểm tra theo deliverable

- Persona: kiểm tra đủ chín phần theo rubric, bằng chứng, tính nhất quán, hình ảnh đại diện và khả năng đọc.
- Value Proposition: kiểm tra mọi giá trị đề xuất đều liên kết với nhu cầu hoặc điểm khó khăn của persona.
- Scenario: kiểm tra scenario hiện tại làm rõ vấn đề và scenario cải thiện thể hiện tương tác mới.
- Storyboard: kiểm tra câu chuyện có mở đầu, khó khăn, tương tác và kết quả rõ ràng, kèm chú thích phù hợp.
- Prototype và wireframe: kiểm tra điều hướng, trạng thái, touch target, phân cấp trực quan và tính nhất quán với bối cảnh người dùng.
- Software Product: kiểm tra workflow chính có tương tác thật, không chỉ là hình ảnh, và bao phủ quy trình đã chọn từ đầu đến cuối.
- Presentation và report: kiểm tra tính đầy đủ, định dạng, hình ảnh, thuật ngữ và khả năng giải thích cho cả nhóm.

## 9. Giới hạn thay đổi và an toàn

- Không xóa, reset hoặc ghi đè công việc của người dùng nếu chưa được cho phép rõ ràng.
- Không thay đổi stack, phiên bản package hoặc cấu hình nếu không có lý do cụ thể; phải hỏi trước khi tạo thay đổi breaking.
- Không dùng dữ liệu cá nhân thật của khách hàng hoặc nhân viên trong ví dụ và screenshot.
- Không sửa dữ liệu production hoặc database dùng chung nếu chưa được xác nhận rõ ràng.
- Không tạo ấn tượng sai rằng prototype điều khiển máy giặt thật hoặc là hệ thống production-ready.
- Khi yêu cầu mâu thuẫn, ưu tiên yêu cầu mới nhất của người dùng, rubric, thực hành HCI dựa trên bằng chứng và phạm vi tối thiểu.

## 10. Định dạng báo cáo hoàn thành

Kết thúc mỗi task đáng kể bằng câu trả lời tiếng Việt gồm:

- **Đã thực hiện**: các file và artifact đã thay đổi.
- **Deliverables liên quan**: các mục trong rubric được hỗ trợ hoặc hoàn thành.
- **Đã kiểm tra**: test, render, so sánh hoặc kiểm tra thủ công đã thực hiện.
- **Giả định và giới hạn**: giả định chưa được hỗ trợ, dữ liệu mô phỏng hoặc khoảng trống còn lại.
- **Tiếp theo**: chỉ nêu hành động tiếp theo quan trọng nhất nếu cần.

<!-- gitnexus:start -->
# GitNexus — Code Intelligence

This project is indexed by GitNexus as **HCI** (1539 symbols, 3056 relationships, 117 execution flows). Use the GitNexus MCP tools to understand code, assess impact, and navigate safely.

> Index stale? Run `node .gitnexus/run.cjs analyze` from the project root — it auto-selects an available runner. No `.gitnexus/run.cjs` yet? `npx gitnexus analyze` (npm 11 crash → `npm i -g gitnexus`; #1939).

## Always Do

- **MUST run impact analysis before editing any symbol.** Before modifying a function, class, or method, run `impact({target: "symbolName", direction: "upstream"})` and report the blast radius (direct callers, affected processes, risk level) to the user.
- **MUST run `detect_changes()` before committing** to verify your changes only affect expected symbols and execution flows. For regression review, compare against the default branch: `detect_changes({scope: "compare", base_ref: "main"})`.
- **MUST warn the user** if impact analysis returns HIGH or CRITICAL risk before proceeding with edits.
- When exploring unfamiliar code, use `query({search_query: "concept"})` to find execution flows instead of grepping. It returns process-grouped results ranked by relevance.
- When you need full context on a specific symbol — callers, callees, which execution flows it participates in — use `context({name: "symbolName"})`.
- For security review, `explain({target: "fileOrSymbol"})` lists taint findings (source→sink flows; needs `analyze --pdg`).

## Never Do

- NEVER edit a function, class, or method without first running `impact` on it.
- NEVER ignore HIGH or CRITICAL risk warnings from impact analysis.
- NEVER rename symbols with find-and-replace — use `rename` which understands the call graph.
- NEVER commit changes without running `detect_changes()` to check affected scope.

## Resources

| Resource | Use for |
|----------|---------|
| `gitnexus://repo/HCI/context` | Codebase overview, check index freshness |
| `gitnexus://repo/HCI/clusters` | All functional areas |
| `gitnexus://repo/HCI/processes` | All execution flows |
| `gitnexus://repo/HCI/process/{name}` | Step-by-step execution trace |

## CLI

| Task | Read this skill file |
|------|---------------------|
| Understand architecture / "How does X work?" | `.claude/skills/gitnexus/gitnexus-exploring/SKILL.md` |
| Blast radius / "What breaks if I change X?" | `.claude/skills/gitnexus/gitnexus-impact-analysis/SKILL.md` |
| Trace bugs / "Why is X failing?" | `.claude/skills/gitnexus/gitnexus-debugging/SKILL.md` |
| Rename / extract / split / refactor | `.claude/skills/gitnexus/gitnexus-refactoring/SKILL.md` |
| Tools, resources, schema reference | `.claude/skills/gitnexus/gitnexus-guide/SKILL.md` |
| Index, status, clean, wiki CLI commands | `.claude/skills/gitnexus/gitnexus-cli/SKILL.md` |

<!-- gitnexus:end -->
