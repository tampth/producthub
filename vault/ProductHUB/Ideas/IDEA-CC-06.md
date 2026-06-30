---
id: IDEA-CC-06
title: Đo lường hiệu suất agent theo thời gian thực
status: submitted
priority: medium
votes: 0
type: idea
submitter: tampt48
team: OMNI / Call Center
author: tampt48
date: 2026-06-25
tags:
  - call-center
  - kpi
  - supervisor
  - reporting
---

## Vấn đề

Supervisor không có dữ liệu realtime về hiệu suất từng agent: ai đang bận, ai rảnh, AHT của ai cao, ai xử lý sai mảng. Chỉ có thể biết sau khi xuất báo cáo cuối ngày — quá muộn để can thiệp.

## Đề xuất

Xây dựng dashboard supervisor realtime:
- Occupancy từng agent (%) 
- AHT trung bình theo agent / queue
- Số cuộc gọi xử lý trong ca
- Alert khi agent Occupancy > 90% hoặc có cuộc gọi > 15 phút

## Giá trị kỳ vọng

- Supervisor điều phối kịp thời khi queue quá tải
- Phát hiện agent cần hỗ trợ / training sớm hơn
- Dữ liệu đánh giá KPI tháng chính xác và khách quan
