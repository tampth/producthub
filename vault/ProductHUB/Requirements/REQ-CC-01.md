---
id: REQ-CC-01
title: Vận hành tổng đài inbound
status: draft
priority: high
product: Call Center
author: thuyduong.vu
date: '2024-01-15'
tags:
  - call-center
  - omni
updatedAt: '2026-06-30'
---
## Tổng quan

Xây dựng quy trình vận hành tổng đài inbound tập trung cho hai hotline chính: **18006928** (Nhà thuốc / Vaccine / Xét nghiệm) và **1800646455 / LC247** (Chăm sóc đặc biệt 24/7).

## Vấn đề hiện tại (P1–P5)

- **P1** — Cuộc gọi nhỡ không được theo dõi và xử lý lại
- **P2** — Không có cơ chế định tuyến thông minh theo nhu cầu khách
- **P3** — Agent không có lịch sử tương tác khi nhấc máy
- **P4** — Thời gian phản hồi chậm do thiếu phân công hàng đợi
- **P5** — Chất lượng tư vấn không đồng đều, không đo được

## Mục tiêu (OBJ-01 → OBJ-05)

- **OBJ-01** — Định tuyến cuộc gọi đúng nhóm xử lý ngay từ đầu
- **OBJ-02** — Giảm tỷ lệ cuộc gọi nhỡ (Abandon Rate < 5%)
- **OBJ-03** — Lưu đầy đủ lịch sử cuộc gọi để agent tra cứu
- **OBJ-04** — Hỗ trợ vận hành 24/7 (LC247)
- **OBJ-05** — Có báo cáo KPI: AHT, SLA, Abandon Rate, Occupancy

## Cấu trúc hàng đợi (Queue)

| Queue | Mô tả |
|---|---|
| 30001 | Nhà Thuốc — Tư vấn & Đặt thuốc |
| 30002 | Vaccine — Tiêm chủng |
| 30003 | Xét nghiệm — Sale Lab |
| 30004 | Vaccine — Tư vấn Bác sĩ |
| 30013 | LC247 — Tư vấn chung |
| 30014 | LC247 — Bác sĩ trực |
| 30023 | Xét nghiệm — Tư vấn |
| 30024 | Xét nghiệm — Bác sĩ |

## Stakeholders

Khách hàng, Sale eCom/Tư vấn, Bác sĩ, CTV, Shop, BGB Vận hành, ICS, MPT

## Parking Lot

- Quy trình xử lý khi cả 2 hotline đều bận?
- Threshold Abandon Rate theo từng queue có khác nhau không?
- Báo cáo KPI xuất theo ngày/tuần/tháng?
- Ai là owner vận hành mỗi queue?
- Tích hợp với CRM/RSA để hiện lịch sử khi nhấc máy
