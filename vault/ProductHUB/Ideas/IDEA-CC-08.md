---
id: IDEA-CC-08
title: Hợp nhất dữ liệu chăm sóc khách hàng đa kênh
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
  - omnichannel
  - data
  - cx
---

## Vấn đề

Dữ liệu tương tác khách hàng bị phân tán: chat Zalo ở một nơi, Facebook ở một nơi, cuộc gọi ở một nơi, CSST ở nơi khác. Không có bức tranh tổng thể về hành trình khách hàng. Profile khách hàng bị split theo SĐT khác nhau (INC-001).

## Đề xuất

- Chuẩn hóa định danh khách hàng (customer ID hoặc merged phone profile)
- API hợp nhất profile: nhiều SĐT → một customer
- Tích hợp CSST events vào timeline tương tác trên Omni

## Giá trị kỳ vọng

- Giải quyết root cause INC-001 (SĐT mapping lệch)
- Agent thấy toàn bộ hành trình khách từ một màn hình
- Nền tảng cho phân tích retention và churn prediction
