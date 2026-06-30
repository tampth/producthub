---
id: IDEA-CC-05
title: Giảm thời gian chờ và tốc độ phản hồi tổng đài
status: submitted
priority: high
votes: 0
type: idea
submitter: tampt48
team: OMNI / Call Center
author: tampt48
date: 2026-06-25
tags:
  - call-center
  - sla
  - performance
  - queue
---

## Vấn đề

Thời gian chờ trong hàng đợi quá dài, đặc biệt giờ cao điểm. SLA Answer (80% trả lời trong 20 giây) chưa đạt. Khách cúp máy trước khi kết nối agent → Abandon Rate cao → mất doanh thu.

## Đề xuất

- Tối ưu phân bổ agent theo giờ cao điểm dựa trên dữ liệu lịch sử
- Thêm tính năng callback tự động (khách chọn "gọi lại khi có agent rảnh" thay vì chờ)
- Queue priority: LC247 và cuộc gọi từ khách VIP được ưu tiên
- Báo cáo Occupancy realtime để supervisor điều phối thêm agent

## Giá trị kỳ vọng

- Abandon Rate giảm xuống < 5%
- SLA Answer đạt ≥ 80/20
- Trải nghiệm chờ máy tốt hơn với estimated wait time thông báo cho khách
