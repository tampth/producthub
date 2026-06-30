---
id: INIT-CC-01
title: MPT Callbot PB1 — Speech-to-Intent Routing
status: approved
priority: high
product: OMNI / Call Center
owner: tampt48
quarter: ""
objective: Thay thế IVR bấm phím bằng định tuyến thông minh theo ngôn ngữ tự nhiên
solution: ""
complexity: ""
risks: ""
effort: ""
investment: ""
roadmap: false
date: 2026-06-29
tags:
  - call-center
  - callbot
  - routing
  - mpt
  - speech-to-intent
---

Hệ thống IVR bấm phím (DTMF) hiện tại hoạt động không hiệu quả với ~50% khách hàng lớn tuổi: bấm sai phím → rơi nhầm queue → agent xử lý sai mảng → AHT tăng và khách hàng phải chuyển máy lại. Tỷ lệ định tuyến sai ước tính ~15%.

Đã có quyết định kiến trúc ADR-CC-001 (accepted): triển khai OmniSupport + MPT Callbot. Đã có spec kỹ thuật đầy đủ trong REQ-CC-04 với 79 intent, 4 nhóm queue, và yêu cầu R-SAFE (emergency → 115, 23 intent bắt buộc vào queue dược sĩ). Jira: LCR25-1771.

Nguồn: REQ-CC-04 · IDEA-CC-04 · ADR-CC-001
