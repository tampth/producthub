---
id: REQ-CC-04
title: MPT Callbot PB1 - Định tuyến thông minh bằng giọng nói
epic: OMNI / Call Center
status: Draft
priority: High
author: tampt48
date: 2026-06-11
tags:
  - call-center
  - callbot
  - mpt
  - routing
  - speech-to-intent
  - pb1
jira: LCR25-1771
---

## Tổng quan

Thay thế IVR bấm phím (DTMF) bằng Speech-to-Intent trên hotline **18006928**. Khách nói nhu cầu tự nhiên → Bot nhận diện → Định tuyến đúng nhóm. Phạm vi PB1: chỉ **định tuyến**, không tư vấn hay xử lý nghiệp vụ.

## Bài toán

| Vấn đề hiện tại | Mục tiêu PB1 |
|---|---|
| IVR bấm phím: khách nghe menu → bấm 1–4 | Khách nói nhu cầu → bot nhận diện → định tuyến đúng |
| ~50% khách lớn tuổi → khó thao tác | Nói tự nhiên, không cần bấm phím |
| Bấm sai → rơi nhầm Nhóm 1 → tăng AHT | Giảm định tuyến sai |
| Ngoài giờ/bận → khách không để lại nhu cầu | Ghi nhận miss call kèm ngữ cảnh intent |
| Agent không biết nhu cầu khi nhấc máy | Hiển thị transcript + intent khi ringing |

## Kiến trúc luồng

```
Khách gọi 18006928
    → [GR-06] Thông báo ghi âm
    → [GR-00/01] Chào + hỏi nhu cầu
    → Khách nói → STT → văn bản → NLU → Intent + confidence
        ├── confidence ≥ 0.6 → Định tuyến queue
        ├── confidence < 0.6 → [GR-02] Hỏi lại lần 2
        │       ├── Phân loại được → Định tuyến
        │       └── Vẫn không rõ → [GR-04] Default Nhóm 1
        └── Intent = HEALTHCARE.EMERGENCY → [GR-07] "Gọi 115 ngay"
```

## Mapping Nhóm → Queue

| Nhóm | Bộ phận | Queue PBX | Domain | Số intent |
|---|---|---|---|---|
| Nhóm 1 (default) | Tư vấn & Đặt thuốc | FLC_ECOM | PHARMACY, HEALTHCARE, MEMBERSHIP | 43 |
| Nhóm 2 | Tiêm chủng | FVAC_ECOM | VACCINATION | 16 |
| Nhóm 3 | Xét nghiệm | Sale Lab | LAB | 12 |
| Nhóm 4 | Chăm sóc & Góp ý | FLC_CSKH | FEEDBACK | 1 |

**Tổng: 79 intent** | Nhóm 1 là fallback mặc định.

## Tham số cấu hình đề xuất

| Tham số | Giá trị | Ý nghĩa |
|---|---|---|
| MAX_TURNS | 2 | Số lượt hỏi tối đa |
| CONF_THRESHOLD | 0.6 | Ngưỡng confidence phân loại |
| NO_INPUT_TIMEOUT | 5s | Chờ tiếng nói mỗi lượt |
| BARGE_IN | Bật | Khách nói chen khi bot đang phát |
| DTMF_FALLBACK | Bật | Dự phòng bấm phím 1–4 |

## Yêu cầu phi chức năng (NFR)

- **NFR-P01**: P95 latency STT+NLU+routing ≤ 8 giây
- **NFR-S01**: API hardening — whitelist IP FRT, mã hóa TLS 1.2+
- **NFR-A01**: Audit log mỗi intent decision, retention 90 ngày
- **NFR-D01**: Dữ liệu audio/transcript lưu trong lãnh thổ Việt Nam (NĐ13/2023)

## R-SAFE (Bắt buộc — chặn go-live nếu vi phạm)

- `HEALTHCARE.EMERGENCY` → GR-07 "Gọi 115 ngay" — bỏ qua mọi logic
- 23 intent Escalation=MUST/HIGH → phải vào queue **có dược sĩ**, không vào queue bán hàng
- Golden Set: MPT phải chạy regression đạt 100% mỗi lần đổi model

## Phân định MPT vs FRT

| Hạng mục | MPT | FRT |
|---|---|---|
| Bot Workflow STT/NLU/routing + R-SAFE | Xây dựng | Nghiệm thu |
| API getDetailByPhone | Cung cấp | Dải IP, nghiệm thu |
| Client tổng đài (hiển thị ngữ cảnh) | Spec API | **FRT phát triển** |
| DB miss call + outbound | — | **FRT chủ trì** |
| Consent + thông báo ghi âm | Hỗ trợ kỹ thuật | **FRT chủ trì** |

## Stakeholders

Team CP (ISC), BU ECOM, Dược chính/Pharmacovigilance, Pháp chế/DPO, IT Security, MPT/OmiBot
