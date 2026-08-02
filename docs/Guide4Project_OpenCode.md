HCI \- FIT \- HCMUS 15  
File Agents.md  

• File cấu hình cho project 

– Đặt tại thư mục gốc của project 

– Opencode sẽ đọc file này trước khi đọc prompt đầu tiên nào  đó của phiên làm việc  

• Gồm những quy định của project để OpenCode làm ra những gì chúng ta mong muốn  – **Tổng quan dự án** 

• Project này là gì, làm cho ai dùng, mục đích là gì   
– **Tech Stack** 

• Dùng công nghệ gì (HTML/React/Python)   
– **Quy tắc thiết kế** 

• Màu sắc chủ đạo, font chữ, style tổng thể 

– **Quy tắc bắt buộc** 

• Những gì OpenCode không được làm, hoặc là phải làm 

– **Workflow** 

• Các bước làm việc trong project này 

HCI \- FIT \- HCMUS 16  
File Agents.md  

• Ví dụ 

– Dự án này giới thiệu dịch vụ AI, dùng HTML và CSS thuần, không framework, thiết kế tối giản, màu chủ đạo là màu đen/trắng, font chữ hiện đại, luôn luôn tạo website thân thiện, không dùng màu đỏ, mọi nút bấm đều phải có hover effect, sau mỗi thay đổi lớn thì tự chụp screenshot để so sánh với design gốc… 

HCI \- FIT \- HCMUS 17  
File Agents.md  

• Tạo file Agents.md bằng lệnh /init – File này tự động được thêm vào trong thư mục gốc   
của project   
![][image1]  
– Lệnh init sẽ phân tích project và tạo file 

• Những gì có sẵn trong thư mục dự án, OpenCode sẽ đọc, rồi lấy thông tin và điền vào file 

• Sau đó bổ sung các quy tắc riêng của dự án HCI \- FIT \- HCMUS 18  
Global rules 

• Nếu muốn mọi projects đều áp dụng quy tắc  chung 

• Cần đặt file này tại thư mục  

– \~/.config/opencode/Agents.md  

• Ví dụ 

\# Quy tắc chung  

\- Luôn luôn trả lời bằng tiếng Việt.  \- Không bao giờ được tự ý thay đổi phiên  bản gói phần mềm mà không hỏi ý   
kiến trước. 

HCI \- FIT \- HCMUS 19  
3\. 

Plan & Skill  
Tổ chức thư mục trong project 

• Yêu cầu Opencode làm việc theo cách riêng  của chúng ta (chứ không chỉ dùng Opencode) 

• skills/ 

– Thực hiện một nhiệm vụ cụ thể 

• rules/ 

– Áp đặt các quy tắc mà AI phải tuân theo • agents/ 

– Điều phối các skills thực hiện 1 mục tiêu lớn • templates/  

– Đảm bảo đầu ra có cấu trúc nhất quán  

HCI \- FIT \- HCMUS 21  
Thư mục skills/ 

• Tạo các thư mục con cho thư mục skills/ – \<Myproject\>/  

• Agents.md 

• … 

• \<skills\>/ 

– **\<persona\>/** 

» Plan.md 

» Skill.md  

– **\<value-proposition\>/** 

» Plan.md 

» Skill.md  

– …  

• Không nên viết tất cả vào 1 file skill.md vì sẽ khó  bảo trì nếu dự án lớn 

• Nên chia thành nhiều thư mục giúp quản lý và tái  sử dụng dễ hơn 

HCI \- FIT \- HCMUS 22  
File Plan.md 

• Mô tả 

– Skill này dùng khi nào? 

– Input là gì? 

– Output là gì?  

– Workflow gồm những bước nào?  

• Phục vụ **Agent** 

– Giúp Agent biết khi nào gọi skill này, skill nhận  loại dữ liệu gì, trả về loại dữ liệu gì  

HCI \- FIT \- HCMUS 23  
Ví dụ 

\# Persona Generator 

\#\# Purpose   
Generate a user persona from user research findings.    
\#\# Use this skill when    
– The user wants to create a persona.   
– The available information includes user goals, tasks, pain points, motivations, or  wishes.    
– The user has completed the user discovery stage and wants to summarize the findings  into a persona. 

\#\# Required inputs   
One or more of the following: 

– Goals   
– Tasks   
– Pain Points   
– Wishes   
– Behaviors 

– Quotes   
– Demographic information   
\#\# Output   
A completed persona following the selected persona template.   
\#\# Workflow 

1\. Read the available user discovery data.    
2\. Infer any missing persona attributes when appropriate.    
3\. Generate a realistic persona.    
4\. Ensure consistency between goals, tasks, and pain points.    
5\. **Produce the persona in Markdown.** \# a visual persona as a single-page infographic HCI \- FIT \- HCMUS 24  
File Skill.md 

• Mô tả 

– Cách thực hiện công việc (hướng dẫn AI) 

– Kiến thức và logic đặc thù của công việc 

• Phục vụ **LLM** (để biết phải suy luận như thế nào) – Làm thế nào để chuyển input thành output một cách  đúng đắn và chất lượng? 

• Skill tốt thường gồm 

– Purpose 

– Domain knowledge 

– Reasoning/Inference strategy 

– Validation rules 

– Failure handling 

HCI \- FIT \- HCMUS 25  
Ví dụ skill cơ bản  

\# Persona generatorskill  

Generate a realistic persona based on user discovery findings. 

\#\# Rules 

– Do not invent impossible facts.  

– Keep all attributes internally consistent.  

– Goals should explain what the user wants to achieve.  

– Tasks describe the user's daily activities.  

– Pain points explain obstacles.  

– Wishes describe improvements desired by the user.  

– The representative quote should summarize the user's mindset. 

HCI \- FIT \- HCMUS 26  
Ví dụ skill tốt  

\#\# Knowledge    
A persona represents a group of users with similar goals, behaviors,  motivations, and pain points. 

A good persona should be realistic, internally consistent, and  supported by user research. 

\#\# Reasoning   
If multiple goals are available, prioritize the primary goal.  If pain points conflict with behaviors, use the observed  behaviors. 

Infer missing demographic information only when supported by  evidence. 

Never infer goals from age alone.  

Behaviors should support goals. 

\#\# Validation 

Check consistency. 

Goal vs. Task  

Task vs. Pain Point  

Pain Point vs. Wish 

HCI \- FIT \- HCMUS 27  
Thư mục rules/ 

• Chứa quy tắc dùng chung cho nhiều skills 

• Phạm vi  

– Domain rule (chuyên ngành) 

– Task rule (thực hiện công việc) 

– Quality rule (chất lượng) 

– Style rule (trình bày) 

• Note 

– Global rule 

– Project rule  

HCI \- FIT \- HCMUS 28  
Thư mục rules/ 

• Ví dụ 

![][image2]![][image3]HCI \- FIT \- HCMUS 29  
File hci.md 

\# HCI rules  

Always use User-Centered Design principles. 

Never invent user research findings. 

Explain assumptions. 

Use HCI terminology consistently. 

Prefer ISO 9241 definitions. 

Differentiate usability from UX. 

Cite Nielsen's heuristics when discussing usability.  Do not confuse persona with user role. 

Use examples from interactive systems. 

HCI \- FIT \- HCMUS 30  
File reasoning.md 

\# Task rules  

Think step by step.  

Explain assumptions.  

Do not skip intermediate reasoning.  

Always verify mathematical derivations.  

Produce Markdown tables. 

Explain trade-offs. 

HCI \- FIT \- HCMUS 31  
File quality.md 

\# Quality rules  

Do not hallucinate.  

If uncertain, state uncertainty. 

Cite sources when possible.  

Never invent references.  

Prefer precise terminology. 

Never fabricate citations. 

HCI \- FIT \- HCMUS 32  
File style.md 

\# Quality rules  

Write concise paragraphs.  

Avoid emojis.  

Respond in Vietnamese.  

Always provide English translation.  

Use Markdown headings. 

HCI \- FIT \- HCMUS 33  
Cơ chế load rules 

• (1) opencode.json  

{ "instructions": \[  

"rules/hci.md",  

"rules/database.md",  

"rules/style.md"  

\] } 

– OpenCode sẽ đưa các file này vào context cùng với  Agents.md  

– Nhưng, dễ làm tăng số token  

HCI \- FIT \- HCMUS 34  
Cơ chế load rules 

• (2) Cho phép trong Agent.md  

General Rules 

Always answer in Vietnamese. 

Always cite sources when possible. 

\------------------------------------ 

Lazy Loading Rules 

If the task is about HCI, 

read @rules/hci.md. 

If the task is about Database, 

read @rules/database.md. 

If the task is about Marketing, 

read @rules/marketing.md. 

– OpenCode chỉ đọc files cần thiết, không nạp tất cả ngay từ đầu  

HCI \- FIT \- HCMUS 35  
Thư mục templates/ 

• Kết quả được trình bày như thế nào? – Cấu trúc trình bày 

– Định nghĩa layout 

• Thư mục  

– \<templates\>/ 

• Persona.md 

• …  

HCI \- FIT \- HCMUS 36  
File Persona.md 

\# Persona Template    
\#\# Layout  

A one-page persona with the following sections in order:   
1\. Header    
2\. Profile Summary  

3\. Goals    
4\. Tasks    
5\. Pain Points  

6\. Wishes    
7\. Behaviors    
8\. Representative Quote 

\#\# Header   
\- Name    
\- Occupation  

\- Photo (optional)    
\#\# Profile Summary 

A brief paragraph (50–100 words) describing the user.   
\#\# Goals    
Display as a bullet list. 

\#\# Tasks    
Display as a bullet list.   
\#\# Pain Points    
Display as a bullet list.   
\#\# Behaviors    
Display as a bullet list.   
\#\# Wishes  

Display as a bullet list.   
\#\# Representative Quote   
Display as a highlighted quotation. 

HCI \- FIT \- HCMUS 37  
File Persona.md 

\# Persona Template  

\#\# Page Size   
A4 portrait 

\#\# Typography 

\- Name: Heading 1   
\- Section titles: Heading 2 

\#\# Layout  

Two-column layout. 

Left column: 

\- Photo  

\- Profile Summary 

Right column: 

\- Goals  

\- Tasks  

\- Pain Points  

\- Wishes  

\- Behaviors    
\- Quote 

HCI \- FIT \- HCMUS 38  
Renderer 

• Khi skill ổn định  

– AI tạo ra nội dung cho persona chính xác và nhất  quán 

• Tự động xuất HTML/Markdown 

• Hoặc tích hợp Renderer để xuất ra ảnh  – Tạo ra persona object (JSON), không tạo md – Cung cấp HTML template (sử dụng placeholeder)  và CSS 

– Dùng HTML Renderer đọc JSON, thay dữ liệu vào  template, xuất HTML hoàn chỉnh 

– Dùng Playwright/Puppeteer để mở HTML, chụp  màn hình, xuất file ảnh PNG 

HCI \- FIT \- HCMUS 39  
File persona.json 

{ "name": "Dr. Lan Nguyen",  

"age": 42,  

"occupation": "Emergency Physician",  

"photo": "doctor.jpg",  

"background": "Works in a busy emergency department...",  "goals": \[  

"Diagnose patients quickly",  

"Reduce medication errors" \], 

"tasks": \[ "Review EHR", "Review lab results",  

"Prescribe medication" \],  

"pain\_points": \[  

"Information scattered across multiple screens",  

"Frequent interruptions" \],  

"wishes": \[ "Unified dashboard", "Automatic allergy alerts" \], "quote": "I want to spend more time treating patients than  searching for information."  

} 

HCI \- FIT \- HCMUS 40  
File html template 

{ \<\!DOCTYPE html\>  

\<html\> \<head\> \<link rel="stylesheet" href="persona.css"\> \</head\>  \<body\>  

\<div class="card"\> \<div class="left"\>  

\<img src="{{photo}}"\>  

\<h1\>{{name}}\</h1\>  

\<h3\>{{occupation}}\</h3\>  

\<p\>{{background}}\</p\>\</div\>  

\<div class="right"\>  

\<h2\>Goals\</h2\>\<ul\>{{goals}}\</ul\>  

\<h2\>Tasks\</h2\>\<ul\>{{tasks}}\</ul\> 

\<h2\>Pain Points\</h2\>\<ul\>{{pain\_points}}\</ul\> 

\<h2\>Wishes\</h2\>\<ul\>{{wishes}}\</ul\> 

\<h2\>Quote\</h2\> \<blockquote\>{{quote}}\</blockquote\>\</div\>  \</div\>  

\</body\> \</html\> 

} 

HCI \- FIT \- HCMUS 41  
File style.css 

.card{  

display:flex;  

width:1200px;  

border-radius:20px;  

padding:40px;  

background:white;  

} 

.left{ width:35%; }  

.right{ width:65%; } 

HCI \- FIT \- HCMUS 42  
File Persona.md với Placeholder 

\# Persona Template    
\#\# Layout  

A one-page persona with the following sections in order:   
1\. Header    
2\. Profile Summary  

3\. Goals    
4\. Tasks    
5\. Pain Points  

6\. Wishes    
7\. Behaviors    
8\. Representative Quote 

\#\# Header   
\- {{name}}    
\- {{occupation}}  

\- {{photo}}   
\#\# Profile Summary 

{{profile\_summary}}   
\#\# Goals    
{{goals}} 

\#\# Tasks    
{{tasks}}   
\#\# Pain Points    
{{pain\_points}}   
\#\# Behaviors    
{{behariours}}   
\#\# Wishes  

{{wishes}}   
\#\# Representative Quote   
{{quote}} 

HCI \- FIT \- HCMUS 43  
Pipeline tạo persona 

• Project hiện tại đơn giản  

– Chỉ làm 1 nhiệm vụ : tạo persona  

– Không có nhiều bước  

• Agents.md làm điều phối là đủ 

• Project cần phải điều phối nhiều nhiệm vụ – Ví dụ : Persona, Scenario, Task Analysis, User  Flow, Storyboard, Wireframe  

• Nên có thư mục agents/  

HCI \- FIT \- HCMUS 44  
Workflow trong Agents.md 

• Ví dụ  

\#\# Workflow 

1\. Validate the provided user research information. 2\. Invoke the Persona Generator skill.  

3\. Generate a structured persona object (persona.json).  4\. Load the selected HTML/CSS persona template.  5\. Populate the template using the generated persona object. 6\. Render the completed HTML. 

**7\. Export the rendered page as a PNG image.**  

8\. Return the generated image.   
OpenCode không tự động biết cách chuyển  HTML thành PNG 

HCI \- FIT \- HCMUS 45   
Workflow trong Agents.md 

**“Export the rendered page as a PNG image”** 

• OpenCode chỉ hiểu : cần có 1 bước export • OpenCode không biết : export bằng cái gì  – Chrome? 

– Playwright? 

– Python? 

– …  

• Cần thêm thư mục tools/  

HCI \- FIT \- HCMUS 46  
Tổ chức thư mục (1)  

• Ví dụ   
OpenCode chỉ việc gọi tool  
HCI \- FIT \- HCMUS 47   
Workflow trong Agents.md (1) 

• Ví dụ 

\#\# Workflow 

1\. Validate inputs.  

2\. Invoke Persona Generator.  

3\. Produce persona.json.  

4\. Load the selected HTML template.  5\. Populate the template.  

6\. Save index.html.  

**7\. Invoke render\_png.py.** 

8\. Return persona.png.   
Agents.md là nơi  để mô tả các lệnh  thực thi ???

HCI \- FIT \- HCMUS 48   
Tổ chức thư mục (2)  

• Với OpenCode CLI, hỗ trợ Custom Tool  

OpenCode phải có quyền  

• gọi 1 tool   
• chạy 1 script

HCI \- FIT \- HCMUS 49   
Workflow trong Agents.md (2) 

• Ví dụ 

\#\# Workflow 

1\. Validate inputs.  

2\. Invoke Persona Generator.  

3\. Produce persona.json.  

4\. Load the selected HTML template.  5\. Populate the template.  

6\. Save index.html.  

**7\. Invoke the render-persona tool** 

8\. Return persona.png. 

HCI \- FIT \- HCMUS 50  
Project persona  

• Nên gồm 3 giai đoạn  

– **Giai đoạn 1:** Hoàn thiện persona-generator,  index.html và style.css 

– **Giai đoạn 2:** Viết render\_png.py (hoặc  render\_png.js dùng Playwright) 

– **Giai đoạn 3:** Cập nhật Agents.md để gọi tool  render 

HCI \- FIT \- HCMUS 51  
5\. 

Vibecoding  
Project  

• Dự án gồm 3 giai đoạn  

– 1\) Input design template  

• Wireframe/Mockup  

– 2\) Chuẩn bị file .md 

– 3\) Build và tinh chỉnh  

HCI \- FIT \- HCMUS 56  
Giai đoạn 1  

• Chuẩn bị các files ảnh wireframe/mockup – Dung lượng nên thấp (vài chục KB) 

– Resize ảnh nhỏ lại 10% so với ban đầu 100% – Opencode vẫn hiểu tổng thể layout 

HCI \- FIT \- HCMUS 57  
Giai đoạn 2  

• 1\) Đưa ảnh wireframe/mockup vào thư mục  của project 

• 2\) Tạo file Agents.md của project 

• Prompt 

Tôi muốn build một website minh họa thiết kế tương  tác. Đây là website có phong cách thiết kế mà tôi  muốn \<đưa đường dẫn tới file ảnh\>. Hãy tạo cho tôi  một file Agents.md phù hợp để dùng cho dự án này. 

HCI \- FIT \- HCMUS 58  
Giai đoạn 2  

• Mở file Agents.md ra xem  

– Quy tắc lấy từ ảnh như màu sắc, layout,  typography… và những workflow 

• Thêm vào những quy tắc bắt buộc  \#Quy tắc bắt buộc 

• Sau những thay đổi lớn, chụp screenshot và so  sánh với design gốc 

• Website phải mobile-friendly 

• Mọi section phải có animation khi scroll 

HCI \- FIT \- HCMUS 59  
Giai đoạn 3 – Build  

• Prompt  

Hãy build một website hoàn chỉnh dựa theo Agents.md và ảnh wireframe này \<đường dẫn tới file ảnh\>. Bắt đầu với file index.html. Sau khi tạo xong chụp màn hình để so sánh ảnh gốc và tiếp tục tinh chỉnh đến khi design sát với ảnh gốc nhất có thể.  

HCI \- FIT \- HCMUS 60  
Giai đoạn 3  

• Quan sát  

– Opencode sẽ đọc Agents.md trước tiên để hiểu  context của dự án  

– Tạo file index.html  

• Nếu bật thinking ra xem, sẽ thấy kế hoạch chi tiết từng  bước như thế nào  

• Build xong, prompt  

Mở file index.html trong Chrome. 

• Quan sát tiếp  

HCI \- FIT \- HCMUS 61  
Giai đoạn 3  

• Tiếp tục hoàn thiện trang web hơn  – Giả sử quan sát trang web thấy vài chỗ font tiếng  Việt chưa tốt → yêu cầu AI sửa  

• Nhưng  

– Chúng ta giao task, AI làm, tiếp tục giao task, AI  làm tiếp…  

– Nếu AI làm sai ngay bước 1, và chúng ta không  kiểm tra, thì lỗi chồng lỗi 

HCI \- FIT \- HCMUS 62  
Giai đoạn 3 – Tinh chỉnh  

• Cách đúng 

– Giao task, AI làm, AI tự verify kết quả, tinh chỉnh,  rồi verify, rồi lại tiếp tục  

• Cơ chế cho AI tự kiểm tra kết quả của chính nó  

HCI \- FIT \- HCMUS 63  
Giai đoạn 3  

• Prompt tinh chỉnh  

So sánh website hiện tại với ảnh wireframe  gốc. Liệt kê tất cả các điểm khác biệt, sau  đó tinh chỉnh từng điểm một. Chụp hình  screenshot sau mỗi thay đổi để track tiến  độ. 

[image1]: <data:image/png;base64,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>

[image2]: <data:image/png;base64,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>

[image3]: <data:image/png;base64,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IkEuQS4IQgMnLi4uJygo6Aj+DaSGwwkvSfD7R+iGDRu2pqenq6GGFhQUXMRrhxCah+nChQsH1jf90KFDLemxY8fKEeaHmjVrptPb23uzhYVFY37nCUXIW2/cuLGyf//+n1KEt7pPnz6ahISE1+jatWsPHzp0qLtyqWTXrl2L0Y63OA5FZ8BHETXoEA5TJyenpuhg+DUCphSdw1J+AGr+/PlrKZ+VN2yvIAjCHxI+j00R3E03bdqUtnr16t60tLS0LQNVgc92W1tb6035L/id3/RecBn8rpP9+/cH0aVLl6ZhGb2Li4sdKa+XcxzlS7v4RVtbtmxxX7VqVW86d+7ctMrKyt7Tp09vQZUPAwUEBFjTrKysL/r27ftlRkZGZ8rr7IIgCP/T/B5f9VrfPJWnSgw/Pm9iYlLv0yb8YI/+h3tQzVvQnTt3Lj579uw8VP6mtL5lCYIg/E/xewRhffOUIBcEQfgfh5dk9L+XXP/70gVBEARBEARBEARBEARBEARBEARBEARBEARBEARBEARBEARBEARBEARBEARBEARBEARBEARBEARBEARBEARBEARBEARBEARBEARBEARBEARBEARBEARBEARBEARBEARBEARBEARBEARBEARBEARBEARBEARBEARBEARBEARBEARBEARBEARBEARBEARBEARBEARBEARBEARBEARBEARBEARBEARBEARBEARBEARBEARBEARBEARBEARBEARBEARBEARBEARB+KNjZWWlcnV1Nafu7u5NIiMjjQzHeRixsLDQ6eXl1QjtbtqtWzcTamT0cDTfxMREp4KxsbHOh6V9giD8gZAg/32QIBcE4T/K5MmTD9PZs2d/mJSU5GY4/GFmwoQJC0pKSj5bvnx5CjUc/t8CHWJjmpKSkuzp6dln4sSJnrRZs2aGowqCIPx6EDhnaHJy8o0ePXp4Gg5/mImKilqdkJCgnTZtWjo1HP7fwMXFRTVy5EgXio7x27y8vE/WrVvnQ1u1amU4uiAIwv1jZ2en8vX1NWrZsqUJtba2NrGysjKKjo5+mvbq1etGz5496wR5QECAql27diYU45q0aNHCpG3btsbUwcFBN05iYqJOvGZib29vgrDSyWVwmZD/6qZ1d3dXNWnSRIVhOh0dHY04HedNmzdvrhu3S5cuRtTDw0O/OSo3NzdV+/btTdq0aaPz2LFjfV955ZW1u3bt8qV1RgaYh275nTp10sn2cTlKGzF/I3Nz8zrTODk5USPKNqOKNrGxsdGJda5d7/rg5RQ/Pz/VypUrt1HMQ11dXV2O5RpTXg4SBEH4xUiQS5ALgtBA4ek8dXV1NTtw4MCsyZMnX6Bjxow5X1paujwyMvI5qgR5o0aNVLRDhw6qcePG+e3cufN5mpmZeT43N/f85s2bK+jgwYM9MI1RUVGRGz1+/PiFvXv3nl+wYIHOKVOmXNi+ffvIsrKyF2hOTs6La9euHYnOwbhv375m9PDhwzO2bNlyYejQoefpwIEDz69aterCc889N4eiPWb6lyMSEhJanz179hxC8vxtn0Xbni0vL4+ghjcThw8fHrp69eoL77zzznm6Z88e3XIWLlz4IsW0WT169Ki9K8kQx3BXrN8ympeXdz41NfV8fn6+zscee+xgSkqKja2trYoawrZiGwX36dPnK4p5fTV9+nQ/5T0QBEH4RVhaWupEQM5EhXoT1fc1WlBQcDUmJuaaj4+PmipBHhgYqKIIsS6jRo16F+F2k2ZnZ18dMmTIVQR8DV2zZs37mKYZxvOjo0ePVqPC1iC8blKMo8b8biGwb1KcDagzMjI+R5C3wL/uFCF3Fcu6hpC/SidNmnQ1IiLiGsL1JkWVPQdnDrXpHBsb237//v1fI6Cv0tDQ0JshISEadEzpVH+9CcIzAZW7Gh2E5rbXs7KyrqI6VlO0+av09PTWHTt2VFFUzCaooF9F1V9De/fufQ3zvTps2DCd8fHxNZWVlRMMl6OAdTFF57jZxcVFQxctWrSR18xNTU11CoIgPDDNmzdXIYDbUYTQGwzw/v3796QjRozoiIp7kru7u4YqQY7Kuzk9evToXxFuGoxTQdPS0jogzDxnz579GXV2dr61bdu2efpBnpSU9M/nn39+OEUoX/Hy8tKcO3duKUVl/Fjr1q0/b9q0qRU6BAeKKvlRBHrgyJEjO9IJEyZ0RMUbhnD+iaLqP29mZmasrA86AROcSXRMTEzsQNHezWFhYdq7BTmWl4DKWY31/5giWKMQ5s7ohN6lCPOaN998c23jxo1VFGFris7hNXQY31JU1V2x7p2w7TrQjz76aAeq+DuWw+1MsQ4egwYN+pzbgfbr169jfZW7IAjCfSNBLkEuCMIfAARWHg0KCtLGxcXtTU5Obkp5uWXixImdOnfu/CZVgjwyMtKaIhg/69Chw5cIJn9qbW3Nm5qmCMPFlOGfnp6+WglyBKzaxcXlGMZtS8vKyq60b9/+o7Fjx3am5ubm0e3atbu2b9++AqVtPj4+TT744IPVx48f300xza4FCxYcjomJuUXRWZw35idp7gLCflX37t3vGuR2dnYJaIN6zpw5myj+z5ulxmjPFIr2qE+ePLlTuS/AIMdyX/P19b1Bn3766UOLFy8ODwwMtKVojzHnYXjNGx2cMV0LuF3y8/NLabdu3cz0miMIgvDLGD9+fDbt0qWL1tXVdbpyzZzwXwTU01QJcgSYNUXl+pmfn997VlZWjSkqad34qMzTKapjTdeuXesEOZZxAhV2W7pu3borLVu2fA05bEJRscZ26tRJ++KLL27D/JtRhOQ+LLsGHYdOnCnoRDs11MHB4byRkdEvDnJW5JiH+siRI1spX+OHchDCkZTX+vfv318b5Gij0alTpzYnJCTUUJyRqNHJ/TBlypRv6JIlS0rKy8u9+KSL8rSLo6MjO0QvWlRUdBWdnRrjDaHKdhYEQfhVzJgxI5silLXh4eGlCExTypBBRd0MQXqe6t3stKYjR478DCH2j+jo6LaUlw746B2q+r4UIa5BiNYGeVZWlhrLqBPktra2ryOI+dF5PvanC/KXX365cvDgwd0p5n8dHcArCL+edNq0aREIzAGo6K9SVMy/Osh50/XYsWNbqfJ6mzZtoiiCuubAgQO1QW5vb69CuyyxLpF06tSpxQsXLnwX7WSgq7EsTXFxcZH+Mvi44eXLl3dR3uxdv379xVGjRtlSw0cbBUEQfhES5BLkgiA0cHbv3p1NEUJqhN0PY8eOdaMIa9X+/ftHRkVF1dCUlBRdkKemplrTpUuXfuLs7KxG0C2lsbGxqrCwsMazZs3aSp2cnDS5ubmr8/Pz/agS5EOHDm1L7xbkn3766aY33njjEWpjY6N+/PHHzwUHBxtRtMlo+/bt49BJ3KDt27e/V5CX8WZnYWFhX2o4nNfIGeTHjx/fSpXX7xbkfA4d0zTy8PAwplgfY2wTm7179z5C+Ugh2liozIcfaurSpYvx8OHDX6Roz01s63x+6IkKgiD8alhFp6WlWVFUu5cYzNu2bXuEImzjVq5c+Q6CS0OVIPfx8TGmqDwL+dQJ/v0nRWj3R/BvTEpKukUjIiJuPProo4VKkPMauWFFjqB7Hc3gB25qg/zixYuVycnJ4RTBqHuue/ny5VPp/PnziydNmvQTQlZDlSDHdCqamZnp7e7u3sPNzS2cIjirAwICtKNHj55BXV1de6ADCEAlzE9sGinXyO8W5Mo1cjMzMxU1AVjXR9HhzaQI6fC+ffv2mjdv3kfU29tbg/Wsrcj5SVOMn4Fq/RpdtWrVX7Ozs1spn1wVBEH4TeDNOFpVVYUMGnMF/6+hQUFBt1B5f4uQ14n/f4Ug91Bu5I0bN85xx44dLyM4r1GEtBpVKj/k8z1Fxb4QIWmSl5fnQ1Hlf4tx/oQOog3dsGHDx61atbqIJrCiNkaQR6GK/+7FF1/kh2Sa0wkTJuxHW3SXLShC+Dpeu4Lpv6X29vZP8akVpWJ+9dVX/4RO5htPT0+dGH7F2tr6W8zrG4r2fYN1uWBpaWlGEeSxqLq/PXHiRDlVtglCvCflMAT5Fv0gj46OvohO4xpFR1GD5fHm63VaXl7+FjoaL+VrdPv06WM1ceLEM2g3267G8CL8+++NLwiC8FvAxwYpQtQ4PDy89Z///Od19OzZs1UDBw60b9euXUtqY2PTEhVq7cfVOU1wcHAzBN1A+uSTT1afP39+R05OTieKeZkx/DCOCUUwtkR4NkfwGVEEqw2GWyvzQ0aaoYOw7datm6VSYcfFxTV5++231yFkq+lzzz03EWcBNm3btm1JMb0VL3con7xESDZDrrfEazr5f/2/KdpgrXz/d+PGjc2gLdpjSXmGQtApmFK0pyXC31LZRhTbwuro0aP59NixY9WnTp2qPnDgQBYNDAxszufC0Tad6LxS0N6rs2bNepPiLMVcvqpWEITfHAlyCXJBEP5A8MMs+oSEhNT52xCGFb88iypwmntNd78YzoeXK/iNhf9N2MHoPydO2JlQPtWiDzq3LRUVFe/DDOrt7V1nuCAIgvCQwscwqaOjYyNnZ+cmUVFRRtRwPEEQBEEQBEEQBEEQBEEQBEEQBEEQBEEQBEEQBEEQBEEQBEEQBEEQBEEQBEEQBEEQBEEQBEEQBOF/CH79rPIVtMTKykrn70Xjxo11tm7dWve38u2H+m14GDDcBvwiL0EQhIcSCfL6MdwGEuSCIDy0mJiY6CwrK1sxf/78cwUFBe7UcLzfmuXLl8esXLny+SFDhoyjhsP/2zg5ObmOHj363F/+8peVVP871AVBEB4qlF/86d+//4nIyMibXbt29aeG4/3WlJSUDIqKiuIPQZdSw+H/bUxNTf1atGhx4/Tp049SnEXId6ILgvBwcr9BXt+lBf70mp2dnc760J+Gy2jXrl3t36jIe7700ktPrl69OpvWDviFGF4KuRv8JSLKX0wiyg9ZGNKoUSMJckEQGgYS5BLkgiA0cAyC/MaUKVPS6YoVK7bitapNmzato2FhYc1btWpVZ1resFy8eHEcraio2JaRkVGluHfv3vLevXvbKj+8TIYOHeqyYcOGKlpWVrblT3/608alS5f2o3Vm/AvAsjzWrFmzbd++fVV0xIgRVZs3b6565plndI4cObJqyZIlVWirD2WQx8fHm6Smprai6EzWDBw4sAr/VtJBgwalS5ALgtAg0A/ygIAA9bBhw76laWlpmoiICG2nTp3UdNmyZccQxDYMQOrr66sqLi6OHj58+FfUw8ND06dPHy2m04mqXrN169ZNZmZmKkri4uLCx4wZo6YJCQlaR0dHTceOHUupQbMemC5dukT5+/trYmJidPbo0UPr5eWlwXrpxLK1zs7O6qlTp86mnTt3NkFY+y1atOgz6uLiokZnoMU6c701WNfvEORqCXJBEB56lCAfMGDACRsbG/W8efMu0HHjxsWhci5GAP5EhwwZcguB2E2Zbt26dQGTJk36jGFJT506dXnu3LnxCOlYeuzYsb1PPPHEWiXIuQxUxdajR4+Opxs3bpzfvXt3jZ2dXSnVb9MvAcEcBbVFRUWnKTqXTAT39V69er1GCwoKevXs2fPKnDlz3qehoaHN0eZ99vb2aooq/bm8vLzoI0eOLKHoaG7gTEIrQS4IwkOPBLkEuSAIDRz9SysI5BswkHbo0EHl4+OjQqAdolFRUbcQvKHKdH369EkIDAxU5+fnv0pzc3MdOb6rq6tOhKZpSEiIaceOHVVUWZbCjBkzBkZGRv5mQY5lR3Xp0kW7evXqHdTT09MF7b06derUZ6mHh0fzESNGfDFq1Kj3qLu7u1VhYeEraOsNeujQoVzetO3WrZsZ3bJly8UWLVpIkAuC8PCjH+QI35sIQ3+qDB86dOghinC7FRAQUBvkCMoEBKAaVfkmeq9PZvLTm/ogyAcxyH+r58gZ5F27dtVu3rx5J8Xfruh8ruIs4Tnq7e1tlZOT8yXOPN6j6KisEhMTX4mOjv6eOjg42PGpmtatW5vSiwBnKBLkgiA8/OhfWkHw3fH4YWZm5iFqGOSocBN4gxCBvIU2atRIGXRf3E+QOzk5qdCmphTVcXOKKt+S8marPkqQb926dSfFcFcE9NV58+Y9Rzt37qwLcnRY71EEt1VSUlJtkCPY2zRt2rQ2yC9cuCBBLghCw0CCXIJcEIQGzv0GeVhYWJ0gHzhwYGJoaKi6b9++T9Bhw4ZZ84M1fLacKsFu+KVcCvcT5Lzm/pe//OUx6urq+jE6jo+rq6tfo4MGDaoz0/sNcuXSCuZnNX369Ffx71VaUlISn5aWpmrfvr0J3bhx4wW5Ri4IQoNA/xp5ZD2f7DS8Rq58W2FBQYEtwvwZ5amV7du3H0F4tu/YsWM7Onfu3OmrVq2aqDy1glBUBQcHt+nUqZM9RXCODQ8P1zg6OpZTb29vewR1+7i4OFvKTgHha4TK+EVqbm6uRZgyqD+jWPa/PmV0Gwa5n5+fdsuWLTspg5zXyA2DXKnInZ2dm44bNy4Lbb1F16xZ83lRUVEcHELRCVyRp1YEQWgQ6FXkJxFeNxDmAVQZjmr8MDWsyBnOBw4cGJuXl3edInhrEPbfBwYG6uzSpcuN/fv372ZlfluT8ePHX8Kwb6m/v/+PrVq14oeNrtGQkJBvMf13e/bsOUi5DISzEW86kiZNmqgtLCzUVVVVn1HDIEdQR/NDSJWVlbsogzwmJubq/Pnzn6e82Zmbm/slpnuPomNpgqB3wLBXKMJcjTOMq2jXNZqVlaXm45iPP/74Y1SCXBCEhxYJcglyQRAaOMqlEgYfAjXQ09OzCVWGI5BdKII6yMPDo6nyetu2bVU9evQwzs7O9qMvvfTSn6qrq185ePDgZbpw4cIJ+fn5jrxhSfmd566urp3RaQRS/B2IcA9Eh6BT+TslJcWF8tJKcHCwauzYsV5UGS8tLc2PYhwTpS3Ezs6uGdoUhJB2pH5+fo0dHR0DENaeFJ2HCeyKQPel6BSMXVxceEmpPcU6jEHH9Bo6iTI6aNAgf3QegSNHjnSlmJ/+4gRBEP448INDNDw8XFdBoyrW6ezszO/0Nhz9P4bhc+v3AhW9CmFtxHCnbdq0MRxFEARBEARBEARBEARBEARBEARBEARBEARBEARBEARBEARBEARBEARBEARBEARBEARBEARBEARBEARBEARBEARBqAu/c1z5vnLSrFkzgzF+Pfrz/zVYWlrW+dvW1lb34xfC/WNvb1/7f34FsYWFhd5QQRAaJPwxiEWLFuXQxYsXV6SmpjoajvMg8Mci+IMPNDg42DI2NtZE+U3PXwuDZ+HChSPmzZu3kU6cONHDcBzh51m3bp3PsmXLNtHc3NyM36KDFQThISApKenQbW9FRETU/tTbL+X48eMr6bZt274cMmRI3G9VkfPn6gYNGrQtKipKTQcOHBhjOI7w86xfv75XWlqahtrZ2ZUbDhcEoYEiQf6/gwS5IDRw+APJvJRiSGxs7CEaExNzq2fPnrVBbm5u/rMB3KTJv372U7l0olw+Wbp0aQV1dHTUtmnTJll/GoYx26DINt0NDm/cuHHt35y2b9++28LDw2sowihab3QdhpdwuA7Kj0/Xh7IO+nCZtL5tRThNfdPd7Xrzr7m09KDT6bervvYsXLgwOTExUUNbtGixwXC4IAgPOd7e3qqpU6f6z5gxo5gOHz68aMqUKSkIxf0UYV4nyG1sbFSPPPJIEsbheEW9e/cuLCgoKNy0aVN/6u/vb4JpaoNt4sSJwSUlJYWLFi16lnbo0EHTv3//igULFhTSxYsXF48ePbqrEpSpqamqXbt2+W3fvr2YDhs2rDA9Pb1wyZIlRfTkyZOxkZGRumvjlGGM4du6deumplu2bFmPdhUOHTpUZ3V1dUFKSopFYGCgihKElQptjaRoW1GfPn0Ks7Ozde7du3cozkDM3N3dVZTwd0k9PDxM6I4dO8LGjx9fjHkWUk6DM41ROBMwprzZ2rJlS05jRLE+zSsqKgoHDx6sE9uqCOuV2q5dOxW9W8fwc7Ru3VqF7TaA7tu3rxDvX2FxcbHOCxcuFM6fP78Q21TnCy+8MLh9+/aq7t2768zPz2+G9o7LysoqpFiXCadOndoUFxenoRLkgtCA6NSpk04EkT8O+PeCg4O1NCoqSotwvpKUlPQVjY6OrhPkCKduCQkJX/fo0UNLEaq6aRASP9Bjx46dQZBb8UeMKUJxVq9evThvDbWystIgcLWo/nRiWVpU/cXK/BG+rTZu3Ph2WFiYlmJ63fyV5SGIvkKg92JgUiXIu3btqqFjxozRYPm6aW9bs2fPnspBgwY1o6xI3dzcvJKTkz+nWB/dOmA9daJtVxHmz8fHx7ehTk5O7JCM3njjjSqKcT8LDQ3VTUPZPsznxsWLF3Mp14FP/axbty6BIlQvh4SEaLgOynog3L8tLCwcQhn6D/qDzzhjMfLz8ztLGb7Yfhp0yDqLioo0eH+0nTt31jl79uzX0Dm3YvjTs2fPbsDwGr4HFNNqR4wYoXtvqAS5IDQgJMglyCXIBaGBg7AzpuPGjTvp4uJyCwFZSnHaX4Rg3+zg4KChhkGOoIzbuXPnP6feZvfu3cWrV6+eiPn8g7q7u1+rrq4erQTHnDlzQhDMxevXr3+OduzYUTNlypRNGzZsKKZ4bRKm8+d1a5qRkdHu6aef/nLUqFEr6Jo1a4oxv2IsqoSirT/OmDHjDQSyKVWC3NraWkv79+//BeY7adeuXWUUf9/kdX6EZhLlOiB8A3fs2PE1xbxmYn2Ky8vLiyiW8TeE902E/0SKefKatPHgwYOfp56enjdmzZq1gG2iJSUlE/bv3//mW2+9NZty/gjQxpjPAYp5qRcvXnyKl1foihUrpmK7X0EH9j1dvnx5vwe95o11NkIHcIaiM7z5yCOPbENneYt6eXmpFy5cuAHv2XGK909z8uTJfLynnSk6kvewPa5jXZfTzZs3T5owYcKXTZs21VAbGxsJckFoKGzdujWJIlSuoVJ9Bwe5E+WwVatWBeL1z6gS5Aw0irBojAquI0IsgU6bNi05KysrCQE/j9rb26vx+i4lmJUbisuWLaugrq6uWoxT52YnUW4+oko0RtC0R/j0pKWlpcm5ubnJBQUFg+iQIUO+R5i+YWJiYkqVIEcVrKFPPPHEYfxriupcJ8JzZ7t27dToICZRnIUYo/Js1LdvXwd69OjROASzbh0oOrPJmP4WQv4xyuoXyzBG9fs8RRBenzt37uixY8e2pWw7zlxaozJuTtFRqdBRhfj4+FyhmZmZ/0TY98/JyUmmWJc+lZWVX/JeAUXorjLcFvdCP8inT59+feXKle6+vr57KKp9Nc4CYtHOKbfVoiPNCwgISKeo2rXDhg3bhG1oStHp8CwoA//XUKnIBaEBgUo0nfL0GpV3KUJFRQnDCAf1Acpqlo8f8nIBRQXdHRX4MVa6FCHGSxm8XKITVbgG4+xUbkYqLF26dCNlkGN5KbUDDAgKCjKaNGlSOjqIKxTBpLsJx8sH1NHRUdO+ffs3EGYM8dogR0jV0LCwsEhlPcjbb7+9EUGuQdX9PkXF2gRVsN+mTZsO0QEDBlxLTk7WrQMNDw/XICA1ZWVlj1JUy0bokIy2bdt2mvKMIiEhQYNq+iLdsmXLoQULFoShw2tKeYP3zJkzleisNBTL07Vf39DQUA23A0Un+quCHJ3KjdmzZ7uhk9lC+/Xrp8b6xaOTmkZ56QhnAXmotNMpzhC0CP4yZV58AglnTSlRUVG8/CNBLggNCQlyCXIiQS4IDRic/qfTkJAQrbu7+0oXFxcVJQhwlb+//0GqBDkCzJweO3bs/ximEyZM+D+K0Nhw+PDhCgTKIYqQVq9Zs+ZngxxBfEeQ82P8FO1piw7iK4TSP+n48ePL9+7du/HEiRPb6NChQ6+hQ7kjyDFdDU1JSanzHPn777+/CYGqraioeI/26NHD6sknn7yIdVBTzP+9JUuWbDh06NBGijbuRftqSktLH6UMct4UHjduXEe6efPmCmyT42lpabcoxuXjlD+dPXt2JuUy0c6tyqWeRYsWfXf06NGNBw4c0Hnw4EGdWNYmWl5ePpDbSXn8kpc6GjVqZKLA6/P660MY5AjlM3TevHm6IO/atetWiraoEdTx2CbTKIN82bJleZaWlukU76F23bp1dTqPxYsX9+K1dCpBLggNCIRtP8oqrKCg4KPp06e7UoSnCmEVOnDgwK8ohuuCHKFhQUeOHPkuql7erPOmvr6+Kjs7O9Pq6urjtFWrVpq1a9feEeQIl40UnYUW4yfxQz/1ffDn6aefXol53Nq/f/8rlJ0Ln+dG5epFscxv6wtydBA1NCMjYwjHV57TRohWMFDx73kaHBzcLC8v75XAwMCfKP4fwjMQVKrGFJ3STqynWj/I2U7ljIT/79mzZ7OxY8fGUFT1b7HyRhvmUbRdNWTIEN82bdp8RRG072EbmaIyV1E+N274lAq3oQI6x3B0Vi/4+Pg8T1HB77WysqoT5vUFOTrdrfRuQY5tk07RSWtzc3NXKtufYnnJ2BYaKkEuCA0IhLYbHTFixF+DgoJqduzYsYAmJiY2Q6W4Rbn5pdzsxGm8Bc3JyXnX2dn5J1SagymCtvGsWbMSUlNTv6IIF219QY4QXU95g2/48OGbMY+mFJhDE+XmaElJycjWrVtfQ0B9QVEtRyB43BGwr1N0Arxk8YaRkZEpVYKcjzVStOmfGzduTEI4OVKE7V9QqaoHDBiQTBGiZkVFRa+gHTfoqlWrclBxN540aVJ3is7iU8xHqx/kqGSNJk6cmEcRmjHoIMzRWVjRqqqq/R4eHhp0IPMo1zUyMtIK435MsX2u4IxiMc5+2lNsH/MFCxb4Ytsvo9u3b0/heiugval8rLFJkyY63dzcXre2tq7zqSGs9wMFOc4y8jZs2NCXomNW44ziAt5TB4rOpSnavQXz4hMr8tSKIDQkJMglyCXIBaGBo1x6eOmll1bggK5B2F2nycnJf8Pp/C1+iIXGxsby0ko3R0fHRvTZZ589hVN+hvx3FOH91+7du3/ND5VQfpcKgnyX/neJ8IM7GNaJ5ufnf4HwuOXr6/s3inm/g7AZxUsSFG2xQXC/qtwsxPL/iTb9IyUlRUN58xPtflM/yPv167cdocpr/fxQjyYpKYkfWPqIurq6atatW/fFzp07gyjaZ3Lp0qX9AQEBaoppfuzVq9dfw8LCvqSjRo3SINh5Q/Axqjx+GBoa+gL19vb+Cu15G2H4LsX0aoT/tXPnzo2kXF9sRyN0Fv0ogvUbPz8/fo/JB5TTIvg/QRu19Kmnnlqj/75kZ2en8YND6Nx0IsjfMAzy2zc7z1J0Cjfnzp3LIK+k6KzUK1asSECIT6d8/BBBXoB1bULREVdg+TXBwcEfUqzD3/geYz00FEFeob8sQRAeYpTv3kDQWKCiy1i/fv1lunz58s8RBvlDhgzJpAihYQh2W+W7RxAEbbKysrIRcp9QhMY3qGr3IFCGUoRvJsIoXHnuXKFv375m9ODBgwNQcWai6tXZrFmz4Qjm2u8Q580+hJ3b7t27L9P58+d/jWW8gE4gg2aC5s2b92ZVehuGfxjaybZmoiIvrKys/ALr8Q3FtBVYZjjWQUXj4+NZ9bYsLCwcRcvKyj5A0H2NaY5SnAEMdXBwyESgx1DegOV1bQReAsUZw3606Rus69cU059avHhxGuZrRBGuuvVQbt6iCo5G0O5Adf8N5frg37MI/6G0vLw8kD/coXxhWEFBgX1gYODwxo0bZ1LMI03/S8IIOy+EfAJFGzPHjBnTDB1WN4qOcTg6y7bYJt4UneWI4uJiN37fCsX2taioqNiCdn9DsfzPx48fn49QH0ZxFhBSZ2GCIDycMPwUGAqoAHk5oDlFuLdgRak3um4cTkP5f1TkKlSvLW5rg0rVnAGmhBhRxldQgupecBo+PohAak4RLi1QsVsqwXgv0DEZYTpduygq9EYI/jrL5zpgmE7M2xrtt+nWrZsFRcVeZ37KNMrNTnQy5miTDc5WdKIKbqKEvf76cRmU4YkOrDG2qw3ltFheU/314XgK97ON9FHeE8PX9Le/0pbbHQDXubY9CPsW6ADv/nWWgiA8nEiQS5BLkAuCIAiCIAiCIAiCIAiCIAiCIAiCIAiCIAiCIAiCIAiCIAiCIAiCIAiCIAiCIAiCIAiCIAiCIAiCIAj/u/Db+X7u73vB7+7mD1oo3/5naWmp4i/bP8zcax3vNfyPANexvvWs77U/Kq1bt9ZJ9L85VBAaHElJSU3Hjx+fnZmZOYTyK20fBB74w4YNC8jOzh5HZ8yY4fWgXw37n8bGxkY1c+bM7jQxMbGgZ8+etY4ZM2aIm5vbH/6o5jag8+fP7zZ8+PCCpUuXjqa9evW68xe6/6Bgv7ehhYWFBdgP0gyHC0KDQYJcglyCXIJcaOBERUXZjxs37vu4uLjXaMuWLR84xOLj42dCLUWQ5xgOfxg5cuTIDNq3b1/+RqrW2dlZQ8eOHfuGk5PTw90T/YY8/vjjK7p166atqqr6nKalpf379wL/4KDT9qYTJ06s6dSp0+OGwwXhDgx/0ebn0B9Puf58N+42z59bnvIrNxRVqD0qsu8CAwMvUysrqzsWZjifRo3qFm0LFiyYVlpaeo2uXr06q85A1Z3TG6L/i0gKpqamOg1/jYfca3734vavBZlShHnBoUOHFqATu0oHDx78On8w2nAaBcN1V1C2p/ID2BzvbuOSu70/PzeNPrw3Qeubhz71/f6o/nZ+4oknlqAqv3ru3LkPaZ8+fWqD/F7roGDYBv79c/ssMZzmfrjbNrsb+u2vb7pRo0Z5UYR5Dfb704bDBeEOMjMzW1NUfAmTJk2Kj4mJ0VlUVBSPAyk+OjpaZ1ZWVvzAgQOtlOnCw8NVixYt6tyvX794GhoaGo/T3/i8vLwAyp820/9JNh6o7dq14y/LG1NUyBHJycnxYWFhOjH/hPz8fIcuXbqoKKpRXZBj3L/QkSNHOg0aNKi2PcOGDfP08Kj9rWYdI0aMMJs+fXo0xUEQv3Hjxt6XLl0aRg8ePOhSZ2SA9WyOaeIp13XKlCm18x8wYEBCbm5uBzs7OxVV8Pf317l48WIntCEe20Hn0KFDE4YMGWLFwKS/9Maq/vJcXV3tEOLf0LsFuXJzsEePHuy4uqenp8fT7t27696z5cuXO1NsQ934yk/boWPzx/rFYzvrRMcZn5OTkzB69Ghbyp/F04fvCbarL7ZrAsV73hrLi+N7SNFGTu8dEhKiojibcsQ+lYhAak8LCwsjuAxle2Nfa4qQqp0/L6dgmg5sA921a1efF154Yej777/fn2Lf+1dPBGbOnNmCYn9JwDTxS5cu1cn9kO8dhsVQbBNT/iyf0hnjzIY/au2O95bvr24/nzp1anxJSYlODIvFNOa1jbpPuF9TzNN7woQJteuYmJioaxfWRyfOMuPnzZsXgf3GmHL9vby8jBcuXNiT8vjhNPv27RtF8T5IkAv3hwS5BLkEuQS50MDJyMjoRxEUvA6rwUGoEwefZsmSJRoEtE5es8XBFOPk5KSiwcHBnRGu7+PA0VD8rYmMjNRgZ/6c7t27dyMOXEvlVJtOnDjRdffu3fsoQvkqAqR2/klJSZpt27a9kJaW1oIqQY55/JMiOF9LSEjQLYcirN5BIHXp2LGjipLY2NiWBw4c+JqmpKRoEDAaHDA6caDkGqy6qlOnTiEY5ybds2ePBuujQQDqxDI16AgudOvWjT/IbNOmTRtdwOLgd6HoiC6zPUr7EWQahMrjR48eTaf6IfVL8fb2bov5XqH1BTmX4enpaUTXrl2bge37A8JCQ9Fm3TbFtn6NIhTc+GPZ6GSMKMY9ieDQjUexLTX8G9vpEcofozbsjLZv316N7a6mhw8ffj47O7uG24lyGyxbtux9hKEXxfJmoUDQoBO5SPF+/8RxsK+oKd7PjQgxc+XmJpk2bdoEdBIampqaqtuvjhw58jnVv7SC8I2ms2bN0qBz4TJ08j0ICgrSoIO6SZ966qlJHN/Pz08nOpPOK1as+KvSZqyjBuugQdjqRJt/dHFxebC76npg/6/kcYQORWdgYKCmrKxMg+NLZ0BAAI+pT7BcG8pCZ+fOnZlY758o28NjAu3U2b9/f40EuXBfYOdLp6j+NKjgXsNBeIQitGoQWB+ggthFMfxGZWXli9j5zCgOzKQ5c+ZcxcG0kyKEq1atWrUNO9+3FJ3BjwjCJKVaQYVuhINoUufOndUUB+Z7qOi3bt68uYpimUcROD/gQHCgSpBjOg3FgXER869EB7OHtmrV6vrKlSv/jLAxpVwXhJElKu/1FEGxFQfPS6gkNRQVYLbhujdr1izY1tb2FuWBjfk/uW7dukqKzuQLBM31DRs2DKIIO1axbqisLlOE4i0E98GqqqpKior+GYyvGT9+/BGKZdctaX8BDPL4+PgrFNX+HUHOKvvkyZPDKDrZH9CmT4uLi7dShG7l7NmzP0ZnpaFPPvnk0+bm5kampqY6cQZxBJ3zjjVr1lRRvH+VWJ/Tbm5uaopQKzXsjBDU++zt7TUUlaMGZ16XEKRbKdZ5F/aPa6hsYyk6uZl83zDeDYrOYS+2UzVev0Xx/taUl5fXuQGNcI7Be1pFUQi8yunXr1//Ge3du3dtkOO9jKIoGLTYtzSovr+jeJ+24b05jv1TQ/H//Ry/Q4cOphRV7gVU6BqcSXxAsd9twba6gEJAQ7E9f8TwXxzkLVu2rMR7psF8z1AcIzVsHzr95yn24ScwvOb48eNLKAqIFnjfTqMj1lCE/NPYRluxXb+gLVq00EAJcuHeoHpLp6hYtKWlpSsR2F0pqocbOFiO4aBuTXHQf1dUVHQZFYsZxUFngwCIwAHkSlFBuaEKdsMOO53iYFdjZ92NnZs7uMra2toEAf+6r6/vDxTVfzf9Sy84+JvCSFRSjakS5Njxr1MEUxZPj9EJtKJY1tcIuDdQXZpSzkN/fgQBPh1VkZZOnjy53iBHh3WLIsSeQwdh3bp1a2P6/PPPn0S71efOnXuMMgQxTi7mqaWo5PahcvREFehG586dG4DA+j94naL69DJc3oNyryDHWYIRzj7OUrRZ8+ijj57HdnOhCEs3BNswdNLXKarbS6jCrRAuKorw9UCI2EA3irMZV3R+o7EsDcW2+Ajb31N/eah69yHcWSVqsD0/wv7hyLCn2MYmCKKeWI41ZZCjvVosaxnFMkzQWZpivusp9gEt9oEJyrxZ/XM/UTh16tRS7HdarMNn9G5BjnVVV1dXZ1N3d3cjbKdQdMIainA8iffMQnmcDx3dmyggfsJ6dqe8xISzNXvsT/9H/f39f0Tw/qogZ5vQESVQtKECx5EWx0cuRXv6Yr01FRUVZRRnfv4oENQIeIb886jCbXi5EIVRGkV7ayTIhftCglyCXIJcglxo4CiXVrATa3FqvAo7tD/FTn4TO/sJhIkdxan49yNGjLiMndWM4oBxxqn74mnTpn1P8fd17LjX0SncoAhHDQ7Ancr1cZyW98BO+jl21m8oDvY2+o/w8ZE+otwsVIIc07xK0XkYI3h5+cSOIgS+wUHxhomJiSmtnZEeOEhKeCDR+oK8efPmwTiVvkW3bdt2hI+C8YNHFKfaXXFQ39i9e/ejtFGjRrwWnc1Tc4pQuoVQuI6A0cn/YxvWYLrrFMFaJwR/CfcKcrTfKCsr6wzFe6JFeKqV9lC+H9h2GtqjRw/1I488ksvApHg/BhUXFz+C7XiDsv29evW6qVzKGj169C2EXIj+8hjkrVq1UtPVq1eXdu3a1US5kWj4GB06s5ns8NCmsZTvKcfB/ydRDkNxUBvkhiDIl98tyPFeRlF0Dlq0Ub1u3bpoyv0JgR2m3BfJyMi4tWPHjqRnn312IkV71YsWLfpe2Yf4CCD2KZPMzMwX6a8Ncltb20osUztv3jze1IzHPjsNYa1FB5dP0bn3xzJ4CaWMYh/pim1ds2LFimOUHRm3EULdi2L95GancH8oQc6wQ9W7CuHoT3Hg38SBewKhbkcRqt8jzC9jR2xGUaW+iIqB164/p0uXLj2Hg+aZ+fPn/5liB1WjYt+pBDNCZDaqfg0q1ysUodHWsC36KEFu+Bw5Dgw7iqr9GwTdzwY5DpySe1XkSpAfOnToqP4wLM8P63AD6/QoZZDb2NhkK0GHA/E9hP8zVVVVOtEJPsO/9+7de4aiwu2kP79fgpeXV+3NzvqCHIFslJSUdIaiGq1Zv379RbZDke1im+ixY8eeO3jwYPqWLVviKd7Ln0JCQtSoFC9RvPbM/v37X+dNTzpy5MhbCLc6Qc5r5AgnNcU26254BqQPg5zFATqIbKq8npycPJkyyBHOvzrIcVak3rx5cwzlsAkTJoRhv9FQbDM1OuEknBlOotiPtWVlZT9g32pDOT46Q1PsSxepYZCzgzK8T/BzsCLHNtMuWLAgnqLjn84gx3bLp9iu/XnDc+HChWUU719XTFODbX+c4qxVNx+8N94U6yBBLtwfyqWV+w1yV1dXK4od/93g4OAfENoxlI8bolIzKS8v30hRbajXrl27k097UISMPw7ej1HVX6GoxjpgPrUVuIKFhYVOJciDgoIu018S5KzI7zfIDx8+fEeQI6jqBDnml41w1dKioqI5bJPSXqoPQqjO378EdJRtEXpXaEpKymuo+Iz1l4XTbqOpU6eeoVjedQSFt/JhE57hGLaJ2xnhkn5bLd6T06i8W1BOM2PGjCTl0srdghzvmZpi2/TQH2bIvYKcl/J+LshPnz79i4Mc+5eGKkF++fLlCRT7Uc3EiRO/x75uR3mmiH3YHOv7Mq0vyNEht8N+X0HRnk0YfzUCtwlVxlNgkONMoE6Qh4eHa3Ec5VMlyDGsjHbq1KkrOsUanNEeo+w0+D6gY/aiqampEuTC/SFBLkEuQS5BLjRwlCDnQacf5NgBb+LArQ1y7KC6IHdycrKiOFDeRaB9n52dHU75KFxOTo4vAuATamNjo2GQ83SRInRM5syZ8zoCgCGgPnny5FPFxcV22JFVdMmSJYmYfgAOKAva8y4f0VeCHOPWCXIeBHweuWnTpkaU14GxTrU3O2fNmpXFA1f5AA3b9HOXVnDKXefSCqY1Ki0tzVWeuy4sLLyyZ8+efsoHmPjBE5wuR6PNgygC4Fc/foh5tC0oKPiWoi0fzpw5cxAOcAvK9rPzPHDgQCnltdbVq1e/jG3fkXJbIMiaTp8+fSDF/+P4IR+8d+mU398yd+7cE4MHD7ai2JbGaPcc5R5AfUHOa+S/VZAbXlrhTT6uk9KxKzc7KyoqPqXYJ6z4vvI+iXKzk0GOTki9adOmGMr5GF5a2bVrVxL2TUs6duzY17HPXkWYZ1P83eHxxx9fh9duUgZ5W4PHD7HPe8Hr1NLSUot99Wu0oQXVH4/cLcj1L63wGrlyaaVfv37+DGuE+58ptlM7XifHth9G+Z7KzU7hvjCoyFfrV+TY+U7qV+Q4sF9DJdWcnjhx4mU+exsTE/MPip3yOA7ev/FDOLRDhw5aBPku5cDkh3aqqqoycfB+T1mZoCp/acCAASco/v89KsQfBw0a5EBZkaOzuCPIlRtVhhU5K9BXXnllMub1KMUBchIV2Fs4GLS0V69elxGAJzHdTor5NTaoyI/pbxdW5AzynTt3PkpxhmG0Zs2a9gj15yi2CZ+M+AphcZLGxcWdgF+js7pBsT6/+qkVbPNGONtZTVGd88u/1NhuT9MVK1YciI6OtsS2cqQI2S/ZpoSEBH5Q6TKmPYl/n8Y0NRTB8iKqPWOEfSJFhX8V81RjWz1LMe6jeF+ued5+pnnUqFG3EF6GQV6tBDne33sF+SwGOeaZQ5XXDYNcuVmKbdkSHeVRdF4nKQL6HWxz3iy9RvH+ncJ2fgydUoZSkWO9lYo8lnL+DHJ+sItmZGSo8d4lo+M3oigWMkJDQ7/Dvs2bvxoE52vYT25h/+V+zA/s3BHkmIcXvE5xhqN1dHT8GoHeguqPRxjk2O51ghzLuaMiV4Ic62xZUlJShU6shqKNl7BNTuB4vELRkfE5cvnSLOHeYMfyodjpyhYvXpyGHd2eooJZMX78+NHYuZpRHPiLeQBixzKmqGj4ceR1qMavUoTjLbz2HE6Dl1OEYCn+HsJKmZqbm/PRQSMccAMoqszj48aNq2HlR3Fq+dm6desWITysKEK4OQ7exQjryVT5lCE6EUuKjmMhqsopxrdhNXfw4MHBtra2pRTj3yEOxFKs50yK9pihwnNo1arVCooQGaW/XTCsnZ2d3XIckFkU66w7c0AVZ08RpKUzZsz4ioFHcYZQgwDah9eXUbT935/r/4XwxzDQmXajOKNg1V2KMwOdWOZ8BLkFAtGIbtu2LQmvrUCVeplym+bn53O7XqCoasexSnd3dzemq1atKsI8r/Nj4BTb8ym8/yvQGZVSBBznVSfUcBaSiQAvpW3atHHUH2YIQisG4bQSgRRKlddRoUZQtKEsMjIyXHk9ODi4OYJtMd6XUsr3Cu9BnfcPy1yJoIvFvuZC0U7+Xbp06VJXyvngvemEtrP9pegASsvKyjyUYgL7hRGm46eYj1C8r9/Nnj17FfbjTyiKhx9xtlJnndHJ2WE+yyjbZW9vv8DiNvrjEeyDA3GMrJwyZYobRehHYV9diU4njGIdfbHvrcS+n0b5QTl0HOZoexXF8VbDYwKFwC6KjmYFio07LgkKwh1IkEuQS5BLkAt/IBi2CDWdCnzErL7HzBgK3bp1M8YO6kMR2n44iFrrf3cGYQBSZRol2OfPn98cQeiHHboLxY7rhsBWYefXyXGIcuqtwOu8VP81or/MXwLnx2vOd4NtIsr6sVNatGiRJw68LpTrn5mZWXsDDIFg6ePjE+Tq6hqoL06Xa9V/HQd4EDqOOjfQ2Hnp/+yXPmwv28FrxpRBxfaPuv0lVXl5eV0Q4H5oYxvKm68cv1OnTjoR0qbz5s3zRXj4UYR5SwRdnWXob1ME2B3Pit8PzDvKm3g/h+GXdP0cvB9BFdg2ym1guB/wRjv3a4qgbop9NFC5wYvw7Iyw5I3P1ykKkh8RtnVudir77oOg3IdRUG5AG25fXg9n+/A+WFIeD1OnTvXDvmRBDfdxQXjo+KPvpOjkIlCJ3kLnpKadb3/HDK9LKyqvUT7TjYANMJzPb8UffXvfD76+viHFxcVXcXa5mWZlZa1C5X5OeY/Ky8urExMTLQ2n+70xLFYEQXhIwFlG53379h2rqqrSuW3btjtUhtHdu3cf6927t7PhfITfjq5du7rFxMQcQxV+jfbt25c3rP++efPm9RRVedNfUoELgvAHRYL84UOCXBCE+0K5scYbow9KffcihN8OXodPTEw03rhxYwpdvXp1P3SoPso1dtn+giAIDQDDh034+QPlZqQgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCL8KIyMjnYIgCEIDxdzcXOfAgQObdOnSpYOrq6sDdXFxcejRo0f75ORkY2o43YOA6U1p9+7dHUJDQ1tbWVmp6G9NampqY39//w5su2K3bt0cevXqZUoNx68PboumTZvqVGjZsqVOQRCEh5pp06YNAj8GBgb+oLho0aLPEcDtqOH4D0JcXJwbnT59+je5ublPGg7/rZg6dWrcqFGjfggICNDJdSgpKfka7XejhuPXh6mpqWr27NkBNCgoqGj48OGFaHszajiuIAjCQ4UE+b+QIBcEocGyadOm5DfeeOPVl1566S8UIfhTTk7OdzExMfbUcPwHoUePHu60d+/e17t37/6M4fDfio0bN3Z/6623Xvnzn/98iUZFRX0/dOjQawhhd2o4fn0UFhaarl27tpSiM9Dm5+evRJibUcNxBUEQflfatm2rSkpKMnVzc7OgTk5OFt7e3mb+/v6NKKpNi8TERCPlGrmvr6+qZ8+eqg4dOhhRV1fXV1E9fxcbG2tPDedvZmamcnBw4HSNqLOzs0XHjh0tOF+K4FYZG//r0jrm60779u17PTw8/BzGM6VsE9sWHx9vStu3b68bn9NRBKkKwW/BeVN7e3sLLy8vi8jISHOKeekqaP114HI7deqkE/M+m5mZed9BzvUZMGBAp0mTJv1EfXx8PiooKOhqaWmpooIgCP8RGEa0S5cuFtu2bds4duzYD+mgQYM+XLBgwb4dO3acpjt37nwvPT3d1XD6Vq1aGVN3d/fLPxfkffr0MZ42bVrUkiVLjlJUvh/itQ9Wrlypc/bs2fEM0yZNmtQJcgTtpWXLlu2hgwcP/nDMmDEfVlZWbqZocxO2XbkZWlJSErNly5Z3MzIyPqAI+w8QrB+cOnXq/+i8efMwSRfDptXi6en5zIMEOTl79uwedGRqimW/jA6ktqMQBEH4jyBB/m8kyAVBaHA0atRIdwmAlpeXr3Fzc6tJSkr6gi5atOiTlJSUb/CahiYmJt5AuHoazkMJcg8Pj8t5eXl3BLnSUQwcOLDlrFmzPkbg1VAE7Kf4+xN0AN/T3r17f4mgT4iKiqoT5C4uLhqE6hWKjuUTvPY5XquhpaWl65s3b26ktw6PBgcH/1hUVPQJLSsr+yQ7O/trZR0qKireQTtc9Nuvj5eX130FeePGjXWiY2mEdj8eHh6uofv37x8dFBRkOLogCMLvB8NoypQpHjQiIuLdXr16XU1OTvajkZGRzRG0ub6+vhqKYb8oyBXWrFmzGBW3GuH7Ge3fv789Qrv55MmTSynCXbN3795/jBgxwlo/yFEla6ZOnZpP0cbmqampPjgz+Il269bt72i7V+vWrVX09OnT46urq4ciXK0pgrbFpEmTAkaNGvUuRYV+Kzo6OtSwbQr3G+RK54Sqv29gYODNuXPnvkrREbWzsLAwHF0QBOH3ZcWKFbkUgaRFMJYnJCQ0pqxws7KybDt37vxn+muDHNV9KUMZoT2VYhnGDN8+ffp0ouCTCRMmfIGgbWFQkb+CdrSizZo1UyGMG2HYOurv769dtmxZAW9iUlTfDhs3bhx39OjR5ynOKp7Fss5i2Z9TjH8L6/Krgtza2ppnDE0ogvsFb2/vm7t27ZpCsX6GowuCIPz+SJD/GwlyQRAaJOPGjcumXbp00bq7u0/n43mUmJiYqEJDQ5+mDPIePXrckVS2trbG9F43O318fEoRpJp+/foNoJw3RTCaUnQkf8frX/j6+tYJ8q5du57TbxP/xThTb8vntvNtbGxU9Pjx48eCgoJq0CHdoKNHj75eUFBwPTIysoZi/FvocH5VkPMxyiVLlvSnCO7vFyxY8AHa2IQ2b97ccHRBEITfn/nz52dTBJEWVfKm1NRUc8qKvKSkxA4Byw/7/AUVbb0VuRLkrMhREd/1A0ERERGlfn5+mqioqP4UlbHu2fWhQ4c6U1S2nyJ4vwgLC6sNclTq1zHNqzNnzrSjrMgHDx7cOC0trZyy88Hr+VVVVYkU7b6KDufvOTk54XTIkCFOvXv3ZsV/kmL8nw1ytOGZjIyMa2i/OzUczmfVCwsLm6HjO07RaWimT58+HG3VPVMvCILwX+HIkSOjKCrQW6NGjbqWl5fnSxGoql27duWjGtfQuwW5cmkFwXcZfofw9KT8ZKP+I3hFRUWlHTt21CxbtuwERadhnZ6ebrRv374y6uzsrFmxYsWHqMJrb3YyyLnsgwcPjqeYP4PUu7i4+Crt3r37rQMHDmShOk6nOGPQoDN4ddCgQQ6UjzNivBCcIXxI0XnUG+TKNzqiTc9gHtcQ5oEUHU4j3rzk0z2U80Nwx8bHx6vpwIEDL6Ijaad/xiAIgvAfR4JcglwQhAYMr+mGhIQ0ptu2bbtgb2+vzs/Pv0j9/f2zxo8f/yXDl97tZqevr68xraysfA2Brp43b943NDs7e1lycvKwpKQkG7p3797M1NRUPjKoplu2bDmRm5tbPHLkyB9ply5d1AjdbEdHx9rvWuE1csyTjx/+kw4YMCBr9erVF9AeNZ0/f/5LXl5e5mh7AMX8/xEcHHwLnVIJRUcwcs6cOf9wd3fXUB8fn3qDXPmIP9r4bOvWrdUI6ysU22FdZGTksBEjRrShVlZWJrt3737RwcHhBkUHNImPISrTC4Ig/FdAsOksLy/vVVFR8VcE6se0a9eun8+dO/f/UJn+QBGqN1AR3xHkfn5+OquqqgYuXLjwbwjYt2mLFi3eRvj+DUHqQ21tbY0Qwjm8hk0DAgIY6NrAwMB/0uPHj5/MyspqffuTnU4Uy3wDVfvbWP47NDw8nDcsb6K6/ytdtWpVGoK89rnu5557bjMq7y95LZ5GRESoMzMz/75o0aK3KV77K9bVz3Ad3NzcdK5bty4J8/wrzg7eplyHsWPH/g3bIZzu2LFjCIL9xzFjxvyd4qylpZ2dneHsBEEQ/rMgRHUivM0QrM0nTJjgTUtKSkJQ8Xbt3r37e7SgoOAaL5kYTq98ytHFxcWoZcuW5mZmZjqNjIzMmzZtau7t7W1E+YSKp6enMQLQhh47dmwuKtolO3fujKFOTk5mqL5188S/RtTCwkI3j379+jWnhw8fnv3II49MwdmCJW3Tpo0Rl92hQwed7du3NysrK+uJqnkJfeyxx+b37t3b1tra2pyyXaampnf8vJGyDgxldDh11oFtQGfQgmLepzt37qxNS0vLp6jyDWclCILwn0eCXIJcEIQGjhJin3766d7q6urLCNk02rdv3+iDBw++ww/xUIR7ec+ePX/1d2wrlzEUlJ9F+7mfRrvbNIbwGW/DZ7nrG+9BmTJlSjt66dKl59CRvLBp06a+1HA8QRCE/wpKkL/77rtPubq63vDz81PTsLCwGlScN5cuXfohXb58eZD+71L+L6HcB8B2Mqao2lm5/y6/IyoIgvDAdOzYUWdISIjV6dOnR58/f/4QPXfu3J+eeuqpSf7+/taUj979rwa5IAjCQ40EuSAIwh8EJyeneq8n29vb6xQEQRAEQRAEQRAEQRAEQRAEQRAEQRAEQRAEQRAEQRAEQRAEQRAEQRAEQRCEh5smTZqYNGvWzIJaWlrq/uVr1HBcQ/gzc+3btzdt2bKlBXV2djYx/HbH+uBXBlN+G2RDB+tgZGVlZUGxLRrz6yQEQRD+o0iQ/zokyAVB+K/TvXv34XFxce/QqKiov6Wmpr7Ts2fPNGo4bn1Mnjw5v6Sk5F26YsWKIfyRaH34d0REhDGtqKiIwDhxmzZtcqd/hO/I6QD69+//Br1w4cIhc3PzO34YRBAE4Xdl0qRJY6urq7+mCxYsuOrg4MAfs86ghuPWR2RkZEl4eLiWTp06NdtwOAkICGhKz5079/GIESPUb7755jpqOF5DxNTU1BlnMj/RI0eOnEeQy69cC8IfGRzkqtatW+uqVH2VX7nn//mTcMrryv+VSxH8IWei/HScMq3y485UmY9SGevP38fHR785um+TTExMbBwbG2tN165du8rd3V3TqVOnDFpn5Nuggq/T9srKyqS33357Kz148GBP/XHZHo4TGBjYhO7bt+9jvKZ97bXXVlPD9ee89dtvbW1d5xeVOnfuXGd4fet0L/S377309PRUtWjRonZaw+XTRo0aOTdr1uwnevToUQlyQfijI0EuQS4IQgOF36VOXV1djXfu3Jm9fv36s7SgoODM6dOnz7z88ss6EYRP9+nT519pDcaOHRuMoDz71ltvTaXK6yNGjOhKOezNN9+ciTBhoPDmo/E777yzY/Xq1WfokCFDzowePfoMAvQsnTNnTjB//k0JTkNmz569zMPD42eDPC4urvnFixdP0HXr1p3ZsGHDk3v27DlN0Z4U/XHRaZlUV1dXlZaWnqXZ2dnXW7VqpcH/P6LLly9/euXKlWc+/vjjFTQ6Otr6pZdeOrV58+azFNskU39+5IMPPlhbVlZ2hr777rvrEcwPdE160KBBLtu3bz9LT506dSYvL+9MVVWVTmy7M+PHjz+zYsWKsxQdW5yNjY2qf//+ZnTYsGEuGO8A/j1DMfxMSUnJaAlyQfiDw6pNCfKnnnoqKyUl5RoqOzVFGF+PiYm52aNHDw1F1XoLFWaoMi1CLwFBpT5+/PhWqrzepk2bKIqwrdm/f/9OPv1BsSwTNze3yz179rxO0RFcz8nJue7r63uLDhw48B8I9iCEjooagqC/Z5CjvTZHjhz5jCIUr6OK5rw1dPLkyXWukaPiN0VYv8z1pGiTBlW2Bu2ooSNHjryO9lz/8MMPT9CAgIAm6ByOoA1ampGRUYLOT2VpaakTbTLKz88/i213i+7atWsqXtNf5D3BdH7YxmrK331NTU293r59ew3FuqkR2Ne5zen06dN3Dh48uHFmZqYnnTt37vd4vUZZH0x7q3fv3jdx1qChEuSC8AcGB30LiqB7AcGkPnny5FGKIPRCVZ4bFBSkof7+/gzF2iBHRZvg4OBw1yBnqOgHOULE5NChQ0uDg4M9KULGKz093WvBggVLKMMRleQqdCaNqDI/hfsJ8qSkJBOEnQdNTEz0jI2NLUO7tXTSpEl1gpyXJvr27euMdexKUQV/jsDUXrp0aQdNTk72RDu8EJIdKX9AGhV+KjqH7+m4ceM+wjgOvKRBUfH3QYf3U25u7t8pgrRDfb8a9XMgwP26dOmipoWFhTwDCsO8v6OY318R3D5paWkfUiz/y6FDh7Z89tlnqym2uRpV+MsYz4Nu2rRpODqjK+hkNFSCXBD+wEiQS5ALgtDAOXHiRD+KYNUg0G9MmDDBn/LmHsK9PULhEg0ICKgT5HZ2dj97aaVjx441Bw4c2MmbgtTZ2VkVHx/fbMeOHaNoRUXFlhkzZmwuLy8/T52cnDTLli37Hm1woMr8FO4nyA0JCQmZgXZrqeGlFQXl8cO9e/d+wpudr7766hpqOB6v33t5eRmjzc9R/P/W888/PxcdghFFpzEWr2ny8/PnUob7g8IgB2q6YsWK45hvm+jo6Cu0qKjo9YSEBAt0On+nAwcO/CImJqYlXj9D3dzcbpWVlY1mOymWb4SO9LEWLVpoqQS5IPyBWblyZTqNiIjQoMJ7HZVgR8phrKQHDBjwJ4qqvN6K/NixY1up8rphRa78APXChQu9Vq1a9aq3t/dPNC4uTouKWIvqUqeNjY1m3rx536MNDlSZnwJvdt7rqRVDQkNDSwIDA7X0foIcbWaQr6WG4xF+oOb/2zsPqKjO9I1TRFRQRHQRBEvEghUEEZEiTRRUUBQUFVSEgKgUC82GggVXRCzYE+PajSixYIm7SUyORhMTdY1mTcymmcQYFbOJCgz/57nrNcPEGjf5o3l/5/yOzswt3/3m8HzvrXPo0KFFFHsv5dnZ2QfQJ/UpwvTfGDhu7tu3L4zqzvs4aAc5qv/deG2F8L5G09LSzmCPo05ycvInFIPrt1ifBfY8jlDsDdzCnkcrdQ+oUaNG+ufPny/BXkEllSAXhOcUnuxEuA6k3t7emtGjR1/Iycl5gfJzXl6HwNhOdU92MshZkWsHOU+aIlz6U4S3EuTqVSuoUqeyosag8TWdMWPG4NjY2N4lJSUrKZb90CBnRc4gt7GxGUIf53b77t27/0+DnJcsRkZG2lG0/SoGo+/OnDlTQrHHcXvBggXvoiqvQRs2bHhvHoq+bWhtbW2DPRlFhG8TBHOVYGWQOzo6VlDspezGAGGF6a5R7AX8KsgR3hahoaFHKLb1VufOne3YL5RBfvr06RIMkBwkJcgF4XkGITqQDho0SANvDx06tAtFSPDOyuZ+fn4fUh4j1w5yVKQBdnZ2FQjllRTBwfeMt27depaiCtRoBzmq8EwEVCUCKZ66u7srh1zi4uJSKKrsyocF+eLFi+e1aNFCM378+JW0Z8+eNdWwJPe7ZBEVebpWkMfofk6wp2FCd+7cyUMrmqNHjy6ivLRPG3X56AfFMWPG5PBqmAkTJlRShKgGexbeCFQOIFXmJe+9994ehP1PzZo1U1y+fPkV9LO19jRPGuT4XhrMnTv3CEXby1auXDlWHTgwkOrn5+fvQx9XUglyQXiOkSCXIBcE4RkHAVePIijf4DHvdevWHaAI9W7FxcXvt27dWkN1gzwsLKy3i4tLxYsvvvg9RbgMXr16dVZgYOAtimCv1A5yLG8qwlqTm5v7MR04cKAXBgsfvP8ZNTExeeihlW3btiV6eXndQZiV0TVr1iy1sbFxQmhaUbRNLzU1tQVCu+td+VkB3q+kGJRmYTBxwjo7UysrK+VmndDQUH0aHR2dwPbl5eV9S6Oioga0bdvWGctsTRHUVdpz4MCBcd26dfvZ3NxcQ0eMGPF9fHx8lyoTaXHs2LH9devWrTQ2NlZEH9xAkFd5MtfjBHlKSsonlEHu6elpjgHFh9rb299OTEz8D8J7HEWb4/z9/UvZr1SCXBCeU3iMnLd5U4T28KSkpB9QLZZRVMxlCLw74eHhtymPkfNkZ40aNfgwJr2EhATb2bNnv4PKT0MRPuWY/mdUh6UUIXtz8+bNq9UbZhBELgiaf1tbW2soquByJyenmwi0UoqQLUWQfxMREdGEqu1TK0xU3wbZ2dlzUYnfpJaWljcwz42RI0emUZ7gO3PmzCoMLtdphw4drmE7bqAaLaUYjK63a9fuGqrmf1I+Fle7LxDELTIyMk4iEEsp9jaU6T/++OOdFCGoTIcBQBFtr5WVlXWeJ2nptGnT1vIW+wfx7rvv7q5Xr15p7dq1FbEXcxlBbqU9DYK8M/qxlCLIt+N1Y4T41zQtLe0E/q2NED9HsQ2f8SSrr6+vIvq8CNv4kzoQODg43JoyZUopvlvFXbt2HeHJWu31CYLwnKBeHujm5mYQHBxsg8pxCd25c2fR/v37ZyDgiqga5OpVEXjNW8qtT58+vYWWlJTsWr9+fQx2921onTp1bHl5HK/Xpm3atOEJS5cPPvhgF92zZ88uVPG9UGXaUgsLC1tUvTZ9+/Y1pLrt5GCAytkY4dqUIpRsEYi2qKLrUT5rG+HWANWuLTUwMLA1NDS0RVsV+ZoidK0pPqsSagh/Xodu0bhxY1uqzodlNqKofpXp1Mv7sAzj8ePHn0ebb9MTJ05M4sCjizoQYS+lEZfHNlHs4dhgwKqynVimEWxKUe1znQYYJG0oBiYrfEe8BNKaYqBsgj0Gfd5dSr29veuOGzfOE3sKu+mRI0cysQfThP1EfXx8LJs/4Z2mgiA8I0iQ/xcJckEQngv4h84nIFKe7OMzT2JiYnZQXkeufYyc8GSjOj3vYuS//GUeqgtPFrZo0aLK9Ax39emJ1R2G96hRo+ogfDvTTZs2bcfgUTpv3rxLtHv37mYPO7TyR4BgV74Tam1tzWv6dScRBOHPSHR09A7Kk52oCqsE+f0q0IfxpNNXN5YuXRqNvYUfKa9wwR7MV9hL6EEdHR11JxcEQagenDhxYjE9evTo6fDw8KqXbvzJKCoqCkdfnKPZ2dmzXF1dW6uHjp6FvQpBEP6kSJD/ggS5IAjPHDxJ5+zsrH9Xgz/z4QMeIw8ICOANRAbUyclJn/0jCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIg/N4YGxsrj481NzfXpyYmJsqPHv+Z4OOP1R8mwbbr8+mWgiAIzwwS5BLkgiA8B8yfP99x6dKl+2hKSspE3c+fdywsLIzWrl27hmZmZm63t7f/c41kgiA8+2RkZPj179+/nDZr1myd7ufPO6jIjceNG/cR7dat21UrK6uGutMIgvAHwh9U1v1lH+0fglD/36RJE0XCQwl8/34/GFGnTh1lmSrqtA9CXeaj3tOGv4Cj/QtDXB/XS++H7qEP3de6sD/4S0lU3U7Oo843b9485+PHjx+le/funaoz+0OXr/aF9vKI+uPWj/p1H/7CkvqD0I/Lo/pTG7bB0tLy3mu1r7UxMzOrGR8ff4527dr1KqaRIBeE/08kyH+NBLkEuSA8UzBYFixY4L158+YldMeOHf4XLlzIyszMzKfYfc4/depUup2dnQHljy9HRETU+/DDD3NpRkZG/pgxY/KLi4sL6NatW3t4e3srv9VJTU1N9b/77ruM1atX59NRo0blIwDy9+zZU0DT09Obav/mJYOqV69ehp9++ukUitDMDwsLy09ISFA8ePBgAd5rqd3+nj176r300kvd6bZt2wqio6Pzp06dqnju3LkFI0aMMEPg8JniyjxeXl7N1q1bl08//vjj/MOHDyttovPnzy8oLCzs5eTkpEdV0O7GtKioaNGqVasWTZ8+fQHNysoaem+iu/j5+dXCMudQ9GkWwr7X0qVLC2hsbOxi/BtrZGSkT9lH3Ab2AZ07d25nLJ/T5dPt27en4XX/3bt3L6ELFy7870Y8AW5ubjVPnjw5h27ZsiUffZQ/ceLEArp+/Xp/fA9ZY8eOXUwLCgqGuLq6Ku2i7du318f3PBrbuZiOHz8+f9euXYtTUlKuUglyQagmDBgwIAl/vBqal5d3A/+W+/j4aCjfQ1B+iGrXiOI9izVr1uxxdHSsoAgtTVBQkAZ/8IoIwssbNmzwaN68uR5FNWeI8D/t4uKioZy2X79+mk6dOilioDgVGBjYQq2oO3TooJeTkzMK09yhnTt31vTt21fTp08fxW7dupXb2tp6qJUyr6BYuXKlG0Lpa9q2bVsNlqfp0aOHItZZceDAgX0TJkxoRFnNmpubu7Rs2bKMTpo0SVlu7969FVu0aKHBcr7DvE0o28P1BAQEtKcYJG5xmzGoKWKbf3WMHPPVT05Ovkzx/zIMEDfYJor2a9q1a3cLITiJom8NWZmPHj3a4a6f4nNlWurv73978ODBpZ6enhqKQXOE7voeBfrfFIPTt5RtxnZoWrVqpYg+voHtKXNwcNDQ4ODgm76+vl3Q7wYUQT8B0/zM70H9Lrj9XAblMXIJckGoBuCPMwmhq6Hu7u4VCOJDUVFRwXTgwIEhqAo3oPIyoYcOHSpi0OAPvoROnjw5eM6cOQMREqcpqsoKVJCvMGCpsbGxIarIjfijD6bZ2dkDEPYhaWlpa2ibNm0qQ0NDp6FqNqAhISEN8vPzjzFQKarvdbm5uSHYO1BExZqHSrWH2vbw8HCj2bNnb7WxsamgGGTOYSAIXbZsWRJFSN9EEFXMnDkziHKeunXrujRq1KiM4vOfMHhNxXK57JBp06ZdsLa2Lnv99dfnUF5uSBCmdSnaPABVaybCrJze72Qnwq0+9h4uU0tLSw1/xHrGjBnBFG0PxwByJS4u7guKgcAE4WyIAF9BW7duXYl+n49tCKFTpkxJ6NKlS7k68GGv4DcFOdr8LcUgWLZ///716Nfz1MzMTPPqq6++g++8mGJ77jRo0MAF7a5NMdB9gsAvRyW/g2Ib+uH724K+1lAM9BLkglAdkCCXIJcgF4RnHARdEv7ANTQ5OfkwwrGResyWh0cQPMb4o61NEaYX8ceuKS4ufouOHTs2PjU1dSzCNJ8ixCoQ8McROE2olZUVj03X2bp1a0+6ePHicQi4sWvXrt1OEeQ8HHNVnR6hZobB4YA6sCCYd2CXv66FhYUhdXJyMsYuPo/YKCfhpk6d6okAvINALqcZGRm9eZwd8+rT8ePHr0L7KzBPb8rf22SQI3zKKKbfjQHDANPo0x07dsxDwJfv2bNnL0WQK2cneQJUPSmMdfpi8CunDwpy9MtlijaUYpuDOSBQDIKmaO/nmEYRbTCJj4/vNHLkyFsUffUpAtxBPfmZmJhoiWA/rgY55n3iIMcyTdGGbyna828XF5eGBw8ePEER2rePHDmSjMHLhiLYr+F7nIzQd6fYvisTJ068wkNqFAONHvqlr7e39w9UDq0IQjWBQd6hQ4dK2qtXr/EIMt1JeIVFbRoUFHSRVaZ6DB1VNuep9Pf3V3R0dNSkpKRoEJD+FBW95fr164s8PDy+pZyG8/j6+iqiatdkZWWVDh8+3JYi6PQQXOFeXl4/0Y4dO1a0bdv2PYT7MYoqeSEqxFrqMfWYmBhvtL8SIVhBsTfgq91u7E2sYHt37dr1BkVo12KQY4Apo5s3by7idFwvNTEx6dSkSZPbr7zyyl5as2bNX11yk56e7veoIEc4X6ZY5iWsz0i9CgYVbF30zxfYps8ptt+kf//+DoGBgRUUQVuENt4bONgmTDcbVbWG/paKXDvI7e3tP0MY13/rrbdOUrTpppGRkTUGmcYUg+ANvP/eRx99NIe+8MILGvTpFeypmVFeAYMBvWZERMQ/KQYFCXJBqA4wyFH1VtLo6Ogk3c8Jwqg2RQhfRBj9WFhYmEmXLl06ZdmyZVOWL1+uyP9jFz0NodqMTp8+PYNhnJSUdJNid37mkiVLJiOQiykP08ycObN02LBhtpThjLDQxzRRFG1KRVX9DSr3MopllSOQFqEtBhQV/EOD/NVXX12BwK7AYLGQYn01tIMcFbgS5CqoSB0QVLcx+Oyl9wty3hD0uEGO9n9mbm7+3+MzesqJ0LqTJk2qEuTYg3HAAFlBEbLFCHYDU1NTXvGjh4FQD2E5B3siGqob5KzyEaTG6LfaFMurjXUaaF8eqh3k2P7P0I/1jx49epI2bNjwZq1atWxgY4rXN954442TZ8+ezaEI8srVq1ffC3IuD/1njEH3HJUgF4RqggT5L0iQS5ALwjMJg9zR0ZGHRR4Y5OrJL4TYJ/jjvo4Qc6Q85oyw0+OxU6p7A02nTp0yudzMzMxJ1MPDQ5/vp6enJ9FWrVpVagc5L/fjw5hU7O3t9UJCQqzXrFmTTZs2bXobQfhPhE4NimV2CgsL+0oNVgwWPdkmBLJiQkLCMrS3AgZQLvtxgvzll1/eSx8Q5NrHyNfqfq59jPxxghxtdIyJiamg/v7+/1mwYEEf9gMdN26cHab/AQOYhuoGubW1dQ0MdG9gWZ9RDLSXMDB4aU/zJEHOQyv/+Mc/3jt9+nQ0xTJ/Sk1N/Y7nKaifn58eBsxW+B4/p3KMXBCqCY8T5DwhSPFHnYFwrZgxY8YlOmjQICeEWcPExMRudOfOnVtWrlw5juFOfX19M3n1Car3Nymqzmao6F9ANfcuRdVZpSIPDw83Ly4ufvn48eN5lM/xQIVugXWlUizrFoLuLKrPGpQnYxF2a3gCliKstiB8LHktNEXYXES43ULg+1Fui3aQo2L/VZBjIKgS5Lz6hseVKUKrUXJycrB6chXTbkCYWvB96uzsXN/Ly+uJgjwyMtJs4cKFeyiPSc+ZM2cf1mVF161btxThW/GgIMfgajRkyJDzCOFKivDnYNBLe5onCXJW5H//+98/xDz1KPr2X2jnrfz8/GTau3fvNnv37j2tXrUiQS4I1QQEeTIvcaOxsbHJup8TdVd/+fLl9uvXr7+IacsoKu7SXr16XUOA3KQIrgoE9ivqyUgEURCC5hoCp4IiWK8jyK8hzHgzThkq8rKsrKwbERERthTTNikoKLiBkCinbm5u13x8fK7xBCTFwFF+7ty51QhHA8p1XLp0KQ5V6U8UYV6OIL2GwCqlCKNbQ4cOTXFxcTGkPIHIIEf43qYYeO4X5D9rnezU4x2YU6ZMOUC7d+/+PcLrunrVC/YQfkIbv+f7FCG3f8CAAQ1QZX9N7wZ5TXX5ukGOz0y4l4A9gyF0+vTpNxHgZXZ2dj9Q9O0tfCfl6qEV3RuCGOTot/Poh3KK76MMQR6gPQ0vG12yZMll2r59+0sM8nfeeecEZXDrBPn1N9988wMMgib0/fff34DBtxwDzG3as2fPG7xElTcRUfTFFQlyQagGSJD/ggS5BLkgPJMggJsgvHhsuSf+eJtoP/RKF4S3HoK6DULLnW7durUYwXuuqKjoI5qTk5OK4GmDwOBzOpTL5+bOnTto37595+iaNWs+iomJiU9PT/egCAfPgQMHug8bNqym6ogRI3ocPHhwP+UNPgigcwcOHHiXYle/F4LZFCHPy+D0eJ16cHCwQXJycndaXFxctGrVqnObNm16jXp7e7shMKs89QmBZYrA9qJJSUntuRwVY2NjBqtnXFxcR4r2Kddze3p6OlD839PQ0NAT4a6ovua/NDo62gFBV4PrpehTV6zv3nF2tiUgIMAV7VbEZwYIXw56+jQvL68bgrnvihUrllFsq0d8fPwuLJM3a2kQ9FWCHMvQd3Z2dlHXj8HOE4FfX3satMMA/epGuU6sz3Dq1KldaL169dzR/ppGd0GfuON7ccKAo0/RFjP0eW/06ym6YcMG9u18fOZOmzdv3oOHuLTXJwjCM4J6Mg4VqRGvmkBgKaLaM9B+miIfvISg0cd0xhRBY4wBwACZwUpXa4m/wJOVXC5F1WyM8OG8NSmvsb4fansQyso8WIYR5U1NfzTq3aCPC6ffuHFjAMXAOAsDYycMgCYUewxpYWFhdwIDAy/S1NTUDg/qt98L7BnwO1G+X35/GNwM1Tt3BUEQhLscOXIkj/JmKVT+X4WHh5+jqKZ/5oPLUA0vpZaWlr96rKwgCIJQDZAgFwRBeIbhdfV5eXkudPLkybmFhYXXc3JyrtG1a9eeT0tLGxkZGcnLFE3+Pw4VCYIgCI+Ax5rVh2R5eXkZeXh4WHTr1k0Rr82aNWt271frBUEQBEEQBEEQBEEQBEEQBEEQBEEQBEEQBEEQBEEQBEEQBEEQBEEQBEEQBEEQBOFPgoWFxUNfC4Ig/CE0atSIv3Rfm1pbW9dp3ry5EZ9Brv0c8qfB3d29R1BQ0EIaEBDw1/79+y/08PBwpLrTPmu4ubkZz549e0ZiYuJ02rlz5z/24eKCIAiEPzB8+i4bN2789OLFi4m60zwNCO8JI0aMqKS9e/fW8AeJW7VqFUF1p33WcHJyqhsXF/elr6/vFxSDoYnuNIIgCL87EuS/HQlyQRD+5/DRqQ87JMIfMeChFPXHl0nXrl0bLFmy5Adqb29f+eabb07VmU2vcePGiir8EWNVor08bRo2bKiXmJjYKi8vL4xu3ry5qHXr1prmzZtHUN3pCduoHtrR17/385j3uN96Hpe6devqvnVf1MfQ1qpVS3mtbp9ue9BfpqNHj/68R48eiugjCXJBEJ4OnmybNWtW+ylTpsTRXr16xQYFBcVOmzbtRbpt2zZ3Pg8b1bAhxbQRMHHGjBk/Ujs7u8qtW7cWJScnx9DJkye/iCrdZ+LEiaZ0wYIFXFYc3m9H1UHDw8NDccOGDYNTUlJic3NzAyiDXPsXcKZPnz63TZs2Dw3yli1b6mHZdhThHzd48ODYQYMGKRYWFo52d3evaW1trUefFB7TXrx4cTS2OZZmZmbGDh8+PC4pKak1zcnJiQoNDX1x5MiRXSiCWhlQMPgorlmzpk9UVFRseHi4Il6PGzNmzFUJckEQnhr+cjtFMLXLzs6+gCpbQ7t3765BwGh8fHwU09PTl3N6c3Pz2hSh+4mvr6+G4Urr16+v8fT01Pj7+ysGBwdrvvzyy78hgG3o3/72t2/69OmjefEuHBT4iziOjo6Ky5YtO4VAr3j77bdXU912Yhnz2rZt+8Ag79ixo15sbGxzDCYfUG9vb+XX5hHAigEBARW7du1aMmzYsNr0YXsf98PFxaUh2ljKbaTclnbt2mnGjh37LxoYGFjWoUMHTUJCwiWKz5u5urrq5+fnD6Govq87OTkp81K0QRMSEsI+liAXBOHpkCB/PCTIBUGothgZGSkeP3682NLSUjNz5swvaG5ubua8efMyR44cOZeuW7duCafHNDXo/Pnzxy1atGg2AvY/tGXLlprDhw8fxP8zKJaRuXHjxmCGNS0sLExr3769Jjk5+VWKoDcxMzPTmzt3rhtFUH6DfL+O95tQW1vbKu18VJDb29vrb9my5SV8xmk006ZNu4w2Tku/CwaJYwjQcqwjiD7pz6VhcGs4a9asG9jOCorBogQB/k2DBg00FP1zbOXKlR/Z2dndolZWVvZ+fn5mbAflPKtWrToyZ86cNBoXF/eOhYUFQ/1zKkEuCMJvRg3yTZs2vcZA2rNnz0d00KBBTfi5jY2NAUXwNHJ2dtarU6eOIuHJTlSpVymq08qSkpLMKgvXU67OUESVaoGAPo/K9Ue6cOHCHghcvaFDh6ZQVLOVUVFRM8eMGWNIdU8OPijIOR1NTU11xYBzA3sJFRShOmP48OE+gwcP7kkLCgqKEK6abdu2HacI1v+ejXxMWJEzyBHSF2i/fv2ssZzzGNTu0GPHjqVjz6Ur9kx+pFh33wkTJjg0bdr0Kp04ceIXkZGRf1GP0e/evTvJwcHhFgaYz6kEuSAIvxleiUJRJQ5EUF/v0qWLhvbt2/c4gvElBJIn7d69e50XXnihyryY3mLp0qU/UAb5iRMnplWZQAuEv+H+/fvfxaCgoYcOHdqC5ZojtN+mrq6uZcuXL4/TnU+FQc5DOM2aNYugup8PGTLEGxUwP1fs3bt3RZ8+fe6JzyoY5NjOTylvYNJdxsNQgxwDzlmKttR77bXXLiC0r1AMhvVNTU3tGjZseIueOXPm8IULF5ZjPRq6efPmS+hD4xYtWuhRzG8aEhLyubu7u6IEuSAIvxkJ8sdDglwQhGqLep2zoaGh/tixY0OGDRu2hyIYK9q3b1+J0GJ43Vi3bt0uvN9Ae17dID958uQDg7xp06Z6KSkpfjzpSMPDw99BcCdg0LhFJ0+efAqBW4uXHVJdpk2bpgS57qEVlX79+nnfPZF4ga4FmzZtehkBqsj/0w8++CCPIlyVC9l5nJ7qovueGuSdOnU6S9u2bWu2b9++Cw0aNPieGhsbN6hXr54dBsVbFOs4iP5YhoCupEVFRZ8hsI3V5WH+uuiDLyTIBUF4atRjtryJBZUlw9mUZmRk+I0bNy4dAaaho0aNKhsxYkR37Xm7du1qsWLFimuUV3C8/vrrmQ+6TtvAwEAvOTm5HsJrN/Xw8NAga+9V0FhXGJanO9s9UEXP4wlVLy+veNqxY0d9BOi9zxMSErxDQ0M1AwYM+ILOnDmzI/c01AqYV6nwJh21fWpQ4/+1KPYKtmEbDmJAKKGdO3duc2/hek8e5KdOnTr4zTffZNva2pbT/Pz8Sw4ODkZubm68Jl0PewxN0AdfS5ALgvDUIIAUZ8yYEYbKOj0wMLAxRVVskJubG4RQ09Do6Og7I0eOdNWe197evhYCfwdFWGp27969f+jQoebUwsLCAGGoz0qc8oQkb/BBVVxIW7VqpbGzs9MMHz68gkZGRnZm2D+I7du3z8P6eNXLDYrBIwQBrI9BQDEqKqp5Tk7OaQRsBZ0PEI41UL3rUwRpn9TU1EwEckuqLpcBShH+XyHoKzGY3KHYG6kyqjwqyDGvEuR/+ctfbtH333//7+g3nuC9TBHWP0ydOtVn0qRJjWlJSclRHuqRk52CIDw1EuQS5IIgPOOozwYpLCzcyxuBfHx8LtLw8PAzCNpLHTp0uEMRnnNDQkLuHeMlvD48JiamL/Xz87vp5ORU4ebmdoH6+/uf/eqrrxbwcIb63BGeLE1KSmpJhwwZ8q25uXllfHz8Wjpx4sT7PsbVxsZGEe1pjAHjbT5vhTo4OPyAcD2LdSdQXnfu5eXVIigo6DRFm2/j9dlBgwadpj169LjGyxI9PT37UnX5apCHhoZ+Xbt27YcGeXZ2dilC/J+UQY4w/hgD1lWqHlpBiN+mp06deiM9Pb3ekSNHTlAMajxEdWXgwIH/ojyez5PKCPEvqAS5IAi/GQYgzczMDETFuJFVJ01JSbmel5dXiqp8AW3Tpo2h7kOn+CApS0tLxSlTpoSgyo5HGCqamZnFFxQU+KHq1KOsyHn9OcK1HsUewJesnFGd59AqC74PPH6PMLfp06fPWIrQjEclPBYB7Uw5Da+HR2Xeig4bNmzqnDlzrqL6vU4XLVp0Be9PxJ5FU6q13Bq0W7duI2vWrBnfsmVLRfRJo1/Wrqfn6upaKywsLAbV/1CKgaImgnoY+iCaYt3G2O562O44ih2CAWiX3l//+teWFHsLaXjv2uzZs2/Q5cuXr8fAEod+jaKYp4b2+gRBEB4bnjCkDOPg4OA6CEsr2rdvXyuEoTXeM6YPuqVdfdrgg2h89+mHPLwyZswYc1TVw6m9vf1VDBZfonq2oLp3curCgeBRd2Py0Ix6qAhVr0FERIRVv379FCMjIxs7OzvrP6q9D0J3Hu7FPApuNwc7itBW2oPBQJF9zcFJEAThqZEgfzx055EgFwShWqJ7W/z/kvz8/DCE6VvqQ7W6dOnyc25u7oSQkBADqjv9887v2deCIAi/Cy+//HJmVlaWZvDgwYfp6NGjR/HKGLWCFgRBEKop6uWH06dPbzxz5kzn6OhoC8obcnjViyAIglDNkSAXBEEQBEEQBEEQBEEQBEEQBEEQBEEQBEEQBEEQBEEQBEEQBEEQBEEQBEEQBEEQBEEQBEEQBEEQBEEQBEEQBEEQBEEQBEEQBEEQBEH4H/N/AZrFbTU6s5kAAAAASUVORK5CYII=>