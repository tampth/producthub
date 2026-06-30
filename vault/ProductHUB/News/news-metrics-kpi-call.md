---
id: news-metrics-kpi-call
title: KPI Tổng đài — Chỉ số vận hành Call Center
category: metrics
author: tampt48
date: 2026-06-25
tags:
  - call-center
  - kpi
  - metrics
  - omni
---

## Tổng quan KPI Call Center

Năm chỉ số cốt lõi để đo hiệu quả vận hành tổng đài. Mỗi chỉ số có ngưỡng mục tiêu và cách tính cụ thể.

---

## 1. AHT — Average Handle Time (Thời gian xử lý trung bình)

**Công thức:** `AHT = Talk Time + Hold Time + ACW`

- **Talk Time**: Thời gian agent nói chuyện trực tiếp với khách
- **Hold Time**: Thời gian khách chờ trong cuộc gọi (agent đang tìm thông tin)
- **ACW (After Call Work)**: Thời gian agent điền thông tin, ghi chú sau cuộc gọi

**Mục tiêu**: Giảm AHT bằng cách cung cấp ngữ cảnh cuộc gọi trước khi agent nhấc máy (MPT Callbot PB1).

---

## 2. Abandon Rate (Tỷ lệ bỏ cuộc)

**Định nghĩa:** % khách hàng cúp máy trước khi được kết nối với agent.

**Ngưỡng:**
- ✅ **Tốt**: < 5%
- ⚠️ **Cần cải thiện**: 5% – 10%
- 🔴 **Nguy hiểm**: > 10%

**Cải thiện bằng**: Tăng agent, cải thiện routing, callback tự động.

---

## 3. SLA Answer (Cam kết tốc độ trả lời)

**Định nghĩa:** % cuộc gọi được trả lời trong X giây cam kết.

**Ví dụ tiêu chuẩn "80/20"**: 80% cuộc gọi được trả lời trong 20 giây.

**Theo dõi riêng** theo từng queue (Nhà thuốc, Vaccine, Xét nghiệm, LC247) vì SLA có thể khác nhau.

---

## 4. Occupancy (Mức độ bận của agent)

**Công thức:** `Occupancy = (Talk Time + ACW) / Total Login Time × 100%`

**Zone lý tưởng:**
- ✅ **80% – 85%**: Hiệu quả cao, agent không bị quá tải
- ⚠️ **> 90%**: Nguy hiểm — agent kiệt sức, chất lượng giảm
- ⚠️ **< 70%**: Lãng phí nhân lực

**Lưu ý**: Occupancy ≠ Utilization. Utilization tính cả thời gian training, họp.

---

## 5. Connect Rate (Tỷ lệ kết nối outbound)

**Định nghĩa:** % cuộc gọi outbound (gọi ra) có người trả lời / tổng số cuộc gọi thực hiện.

**Áp dụng cho**: Callback miss call, CSKH outbound campaign.

**Cải thiện bằng**: Gọi đúng giờ, brandname thay số ẩn danh, preview dialer.

---

## Dashboard Gợi ý

| Chỉ số | Realtime | Daily Report | Alert |
|---|---|---|---|
| Abandon Rate | ✅ | ✅ | > 8% |
| SLA Answer | ✅ | ✅ | < 75% |
| AHT | — | ✅ | > 8 phút |
| Occupancy | ✅ | ✅ | > 90% |
| Connect Rate | — | ✅ | < 50% |
