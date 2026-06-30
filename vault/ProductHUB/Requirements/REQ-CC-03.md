---
id: REQ-CC-03
title: Tham vấn bác sĩ trong cuộc gọi
epic: OMNI / Call Center
status: Draft
priority: High
author: tampt48
date: '2026-06-25T00:00:00.000Z'
tags:
  - call-center
  - escalation
  - bac-si
  - tham-van
  - omni
updatedAt: '2026-06-30'
---
## Tổng quan

Xây dựng luồng leo thang (escalation) từ agent tư vấn thông thường sang bác sĩ/dược sĩ trong cùng một cuộc gọi, không để khách phải gọi lại. Áp dụng cho Vaccine, Xét nghiệm và LC247.

## Vấn đề 

- Khi khách cần tư vấn chuyên sâu (y tế, dược), agent không thể chuyển ngay — khách phải gọi lại
- Không có queue riêng cho bác sĩ/dược sĩ trong từng dịch vụ
- Agent không biết khi nào phải escalate và escalate về đâu
- Cuộc gọi bị mất nếu transfer không đúng cách

## Mục tiêu

- **OBJ-01** — Agent có thể transfer call sang bác sĩ ngay trong cuộc gọi (warm transfer)
- **OBJ-02** — Mapping rõ ràng: queue tư vấn → queue bác sĩ theo từng dịch vụ
- **OBJ-03** — Khách không bị ngắt kết nối trong quá trình transfer
- **OBJ-04** — Ghi nhận lý do escalate để phân tích sau
- **OBJ-05** — Dược sĩ trực nhận được context từ cuộc gọi trước khi nhấc máy

## Mapping Queue Escalation

| Dịch vụ | Queue Tư vấn | Queue Bác sĩ/Dược sĩ |
|---|---|---|
| Vaccine | 30002 | 30004 |
| Xét nghiệm | 30023 | 30024 |
| LC247 | 30013 | 30014 |

## Luồng Escalation

```
Khách gọi vào queue tư vấn (30002 / 30023 / 30013)
    │
    ▼
Agent tiếp nhận — đánh giá nhu cầu
    │
    ├─► Xử lý được → Kết thúc bình thường
    │
    └─► Cần bác sĩ → Warm Transfer → Queue bác sĩ (30004 / 30024 / 30014)
            │
            ├─► Bác sĩ nhấc máy → Tiếp tục tư vấn (3-way hoặc blind transfer)
            │
            └─► Bác sĩ không nhấc → Miss call queue bác sĩ → Ghi nhận → Callback
```

## Điều kiện bắt buộc escalate (R-SAFE)

Các intent sau PHẢI định tuyến đến queue dược sĩ, không được vào queue bán hàng chung:
- Tư vấn tương tác thuốc
- Tư vấn tác dụng phụ
- Tư vấn liều dùng
- Khuyến nghị sản phẩm thuốc kê đơn
- Tình huống cấp cứu y tế → Hướng dẫn gọi 115 ngay

## Parking Lot

- Warm transfer hay blind transfer? Agent có ở lại trong cuộc gọi không?
- Nếu queue bác sĩ hết người, hiển thị thông báo gì cho khách?
- Có thể escalate từ LC247 (30013) sang dược sĩ bán hàng (30001) không?
- Thời gian chờ tối đa trước khi báo bác sĩ không available là bao lâu?
- Ghi âm cuộc gọi escalated có được lưu riêng không?
- Ai quản lý lịch trực bác sĩ theo queue?
- Trigger escalation là manual (agent bấm nút) hay có thể auto từ bot?
