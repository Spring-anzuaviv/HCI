# Kế hoạch Hiện thực Prototype (Khung trắng đen)

## 1. Context & Goal
Mục tiêu của kế hoạch này là hiện thực hóa giao diện dưới dạng Prototype (Low-Fidelity). Trong quy trình của chúng ta, **Prototype là bản thiết kế trắng đen, đóng vai trò như bộ khung xương (skeleton)** đứng trước Wireframe.
Prototype tập trung hoàn toàn vào cấu trúc thông tin (Information Architecture), luồng tương tác (User Flow) và cách bố trí các thành phần trên màn hình để giải quyết các pain points của người dùng mà không bị phân tâm bởi màu sắc hay phong cách thiết kế (visual design).

## 2. Technical Stack & Ràng buộc
- **Frontend:** Vanilla HTML5, CSS3, JavaScript. Không sử dụng thư viện/framework.
- **Giao diện:** Trắng đen (Black & White), không màu sắc rực rỡ, không đổ bóng phức tạp. Chỉ dùng các nét viền (borders), khối xám (gray boxes) và typography cơ bản để biểu diễn.
- **Dữ liệu:** Hardcode tĩnh để mô phỏng tương tác.

## 3. Implementation Steps

### Bước 1: Khởi tạo Base Layout (Trắng Đen)
- Xây dựng layout mobile-first 390px.
- Thiết lập CSS Variables với tone màu xám, đen, trắng (ví dụ: `--gray-100`, `--black`, `--white`). Tuyệt đối không dùng màu thương hiệu ở bước này.

### Bước 2: Dựng Khung (Skeleton) cho Dashboard
- Dựng các khối (boxes) cho Thanh điều hướng, Trạng thái máy giặt/sấy, và Bảng đơn hàng.
- Sử dụng Text mộc và các placeholder icon để minh họa.

### Bước 3: Tương tác logic cơ bản
- Viết Javascript mô phỏng luồng chuyển trang cơ bản.
- Tương tác ẩn/hiện popup thông báo hoặc cập nhật số liệu dạng raw.

## 4. Output
- File lưu tại: `outputs/prototype.html` (Bản khung trắng đen ban đầu).
- Output này sẽ làm tiền đề để bước tiếp theo đắp màu và tinh chỉnh thành bản Wireframe.
