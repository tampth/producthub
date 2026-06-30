---
id: gloss-race-condition
term: Race Condition
category: Engineering
example: INC-002 — Zalo webhook đến sau 3.102s vượt Lock 3s → bot nhận diện nhầm tin agent gửi là tin mới từ ngoài vào
---

Lỗi xảy ra khi hai tiến trình cùng truy cập/ghi dữ liệu đồng thời, dẫn đến kết quả không nhất quán. Trong OmniSupport: Zalo API latency cao khiến webhook event đến trước khi msg_id được lưu vào DB, gây bot lặp lại tin nhắn của agent.