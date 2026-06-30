---
id: IDEA-CC-01
title: Hệ thống quản lý cuộc gọi nhỡ tự động
status: in-review
priority: high
votes: 0
type: idea
submitter: tampt48
team: OMNI / Call Center
author: tampt48
date: '2026-06-25T00:00:00.000Z'
tags:
  - call-center
  - miss-call
  - automation
---
## Vấn đề

Hiện tại cuộc gọi nhỡ không được theo dõi hệ thống. Agent phải tự ghi nhận thủ công hoặc bỏ sót hoàn toàn. Khách hàng gọi nhỡ không được gọi lại đúng hạn, ảnh hưởng đến chất lượng dịch vụ và doanh thu.

## Đề xuất

Xây dựng module quản lý miss call tự động: ghi nhận cuộc gọi nhỡ hợp lệ (≥ 3 giây trong queue), phân công cho agent xử lý, theo dõi SLA callback, và tự động reset lúc 0h00 mỗi ngày.

## Giá trị kỳ vọng

- Không còn miss call bị bỏ sót
- Callback đúng SLA → tăng chuyển đổi và hài lòng khách hàng
- Supervisor có báo cáo miss call theo queue
