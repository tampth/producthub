---
id: REQ-CC-02
title: Quản lý cuộc gọi nhỡ
epic: OMNI / Call Center
status: Draft
priority: High
author: tampt48
date: '2026-06-25T00:00:00.000Z'
tags:
  - call-center
  - miss-call
  - outbound
  - omni
updatedAt: '2026-06-30'
---
## Tổng quan

Xây dựng hệ thống theo dõi và xử lý cuộc gọi nhỡ (missed call) tự động: lọc spam, định tuyến về đúng queue/platform, và quản lý vòng đời xử lý lại (callback).

## Vấn đề 
- Cuộc gọi nhỡ không được ghi nhận đầy đủ
- Không phân biệt được cuộc gọi nhỡ hợp lệ vs spam ngắn
- Không biết queue nào bị nhỡ để phân công lại đúng agent
- Không có SLA cho việc gọi lại cuộc gọi nhỡ
- Khách gọi lại không được kết nối với agent đã xử lý lần trước

## Mục tiêu

- **OBJ-01** — Ghi nhận 100% cuộc gọi nhỡ hợp lệ (≥ 3 giây trong queue hoặc timeout 30 giây)
- **OBJ-02** — Lọc spam: bỏ qua cuộc gọi < 3 giây
- **OBJ-03** — Định tuyến miss call về đúng queue/platform tương ứng
- **OBJ-04** — Theo dõi trạng thái xử lý lại (pending → done → reset)
- **OBJ-05** — Reset danh sách miss call lúc 0h mỗi ngày

## Điều kiện miss call hợp lệ

- Khách ở trong queue ≥ 3 giây, HOẶC
- Timeout 30 giây mà không có agent nhấc máy

## Điều kiện "đã xử lý xong" (Clear)

1. Agent gọi ra thành công — khách bắt máy
2. Khách tự gọi lại và được kết nối
3. Gọi lại 2 lần không có người trả lời → close
4. Reset tự động lúc 0h00

## Mapping Queue → Platform

| Queue | Platform ghi nhận |
|---|---|
| 30001 | RSA Ecom |
| 30002, 30023 | Vaccine Web |
| 30013 | LC247 Portal |

## Parking Lot

- SLA gọi lại miss call là bao lâu? (30 phút? 2 giờ?)
- Nếu khách gọi vào queue khác sau khi bị nhỡ, có tự clear không?
- Ai được phép xem và xử lý danh sách miss call?
- Thống kê miss call có tách theo hotline (18006928 vs 1800646455)?
- Cơ chế thông báo nội bộ khi miss call queue dược sĩ?
- Tích hợp với outbound dialer để gọi lại tự động?
