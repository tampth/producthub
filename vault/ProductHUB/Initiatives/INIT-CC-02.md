---
id: INIT-CC-02
title: Miss Call Tracking & Callback Management
status: proposed
priority: high
product: OMNI / Call Center
owner: tampt48
quarter: ""
objective: Đảm bảo 100% cuộc gọi nhỡ hợp lệ được ghi nhận và xử lý lại đúng SLA
solution: ""
complexity: ""
risks: ""
effort: ""
investment: ""
roadmap: false
date: 2026-06-29
tags:
  - call-center
  - miss-call
  - callback
  - automation
---

Cuộc gọi nhỡ không được theo dõi hệ thống. Agent phải tự ghi nhận thủ công hoặc bỏ sót hoàn toàn. Không có cơ chế phân biệt cuộc gọi nhỡ hợp lệ (≥ 3 giây trong queue) và spam ngắn. Không có SLA callback, không biết queue nào bị nhỡ để phân công lại đúng agent. Kết quả: khách gọi nhỡ không được gọi lại đúng hạn, ảnh hưởng trực tiếp đến chuyển đổi và trải nghiệm dịch vụ.

Đã có spec chi tiết trong REQ-CC-02: điều kiện hợp lệ, mapping queue → platform (RSA Ecom / Vaccine Web / LC247 Portal), vòng đời xử lý (pending → done), reset 0h00.

Nguồn: IDEA-CC-01 · REQ-CC-02
