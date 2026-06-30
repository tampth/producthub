---
id: IDEA-CC-04
title: Phân loại nhu cầu khách hàng tự động khi gọi vào
status: in-review
priority: high
votes: 0
type: idea
submitter: tampt48
team: OMNI / Call Center
author: tampt48
date: 2026-06-25
tags:
  - call-center
  - routing
  - callbot
  - speech-to-intent
---

## Vấn đề

Hiện tại IVR bấm phím (1 = Nhà thuốc, 2 = Vaccine…) không hiệu quả với ~50% khách lớn tuổi. Bấm sai phím → rơi nhầm queue → agent xử lý sai mảng → tăng AHT và chuyển máy lại.

## Đề xuất

Triển khai Speech-to-Intent (MPT Callbot PB1) trên hotline 18006928: khách nói nhu cầu tự nhiên bằng tiếng Việt, bot nhận diện intent (79 intent) và định tuyến đúng queue. Giữ DTMF_FALLBACK cho khách không nói được.

## Giá trị kỳ vọng

- Tỷ lệ định tuyến sai < 3% (từ ~15% hiện tại)
- Trải nghiệm tự nhiên hơn cho người lớn tuổi
- Agent nhận được ngữ cảnh intent khi nhấc máy → giảm AHT
