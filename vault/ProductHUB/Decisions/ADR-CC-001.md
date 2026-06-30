---
id: ADR-CC-001
title: Triển khai hệ thống Call Center tập trung với OmniSupport + MPT Callbot
date: 2026-06-25
status: accepted
deciders: Long Nguyen Vu, Team CP ISC, BU ECOM
tags:
  - call-center
  - architecture
  - adr
  - omni
  - mpt
---

## Bối cảnh

Long Châu đang vận hành hai hotline (18006928 và 1800646455) với hệ thống IVR bấm phím truyền thống và không có nền tảng thống nhất để quản lý cuộc gọi, miss call, và lịch sử tương tác. Agent xử lý từng kênh riêng lẻ, không có ngữ cảnh về khách hàng khi nhấc máy.

## Quyết định

Triển khai **OmniSupport (FRT)** làm nền tảng tổng đài trung tâm, tích hợp với **MPT/OmiBot** để cung cấp Speech-to-Intent routing trên hotline 18006928 (PB1). FRT giữ vai trò Controller, MPT là Processor theo NĐ13/2023.

## Các phương án đã xem xét

| Phương án | Mô tả | Lý do loại |
|---|---|---|
| A — Giữ nguyên IVR DTMF | Không thay đổi hệ thống hiện tại | Không giải quyết vấn đề định tuyến sai và UX kém |
| B — Tự xây callbot | Tự phát triển STT/NLU | Quá tốn nguồn lực, không đủ data training tiếng Việt |
| **C — OmniSupport + MPT (CHỌN)** | Dùng nền tảng sẵn có, tích hợp đối tác | Cost hiệu quả, tốc độ triển khai nhanh, MPT có kinh nghiệm y tế |

## Hệ quả

**Tích cực:**
- Triển khai nhanh (tận dụng OmniSupport đang dùng cho chat)
- MPT có sẵn 79 intent được train cho ngành y tế/dược
- R-SAFE đảm bảo an toàn (cấp cứu → 115, dược sĩ bắt buộc)
- Đáp ứng NĐ13/2023 với DPA ký giữa FRT (Controller) và MPT (Processor)

**Rủi ro và mitigation:**
- Race condition giữa STT latency và SIP routing → NFR-P01: P95 ≤ 8 giây
- Data residency audio/transcript → MPT cần xác nhận lưu tại VN (OQ-05)
- Vendor lock-in với MPT → Contract có exit clause rõ ràng

## Các quyết định liên quan

- PB2 (sau PB1): mở rộng sang tư vấn tự động, outbound campaign
- Queue dược sĩ (30004, 30024, 30014) phải hoạt động trước khi go-live PB1
- DTMF_FALLBACK giữ nguyên trong PB1 — tắt sau khi confidence MPT ổn định
