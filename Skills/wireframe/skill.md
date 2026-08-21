---
name: wireframe-builder
description: Xây dựng bản Wireframe (Đứng sau Prototype, có màu sắc, mô phỏng gần với giao diện cuối).
---

# Skill Wireframe Builder

## Purpose
Tạo file HTML/CSS/JS thuần đóng vai trò là bản Wireframe cho đồ án HCI.
Bản Wireframe này **đứng sau Prototype**. Nó kế thừa bộ khung (skeleton) của Prototype và đắp thêm màu sắc thương hiệu, chi tiết UI (typography, borders) để tiệm cận với giao diện cuối cùng. Tuy nhiên, nó vẫn được thiết kế theo hướng phẳng, thô và "xấu hơn" bản Frontend cuối để người dùng tập trung test luồng nghiệp vụ thay vì soi xét tính thẩm mỹ.

## Use This Skill When
- Đã có bản Prototype (khung trắng đen) và cần đắp màu để ra bản Wireframe.
- Cần tạo giao diện Medium-Fidelity có thể tương tác đầy đủ các logic (Hàng đợi, Cảnh báo trễ) bằng JS.

## Required Inputs
- File `outputs/prototype.html` (Bản trắng đen làm gốc).
- Bảng màu: Teal (`#0891b2`), Amber (`#f59e0b`), Red (`#ef4444`).

## Output
- File lưu tại: `outputs/prototype/wireframe.html`
- Giao diện có màu sắc đầy đủ, nhưng không dùng hiệu ứng đổ bóng, bo góc lớn (không dùng glassmorphism).

## Reasoning Rules
1. **Bám sát định nghĩa lớp:** Wireframe phải có màu, nhưng không được quá đẹp (giữ lại tính chất của wireframe).
2. **Không dùng Framework:** 100% Vanilla HTML/CSS/JS.
3. **Logic hoàn chỉnh:** Mọi nút bấm, luồng cảnh báo trễ hẹn (cập nhật lại giờ) đều phải chạy thực tế bằng Javascript.
