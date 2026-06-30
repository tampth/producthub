---
id: gloss-r-safe
term: R-SAFE
category: Ops
example: Intent PHARMACY.PRODUCT.RECOMMEND → R-SAFE bắt buộc escalate sang queue dược sĩ
---

Bộ quy tắc an toàn y tế bắt buộc trong callbot Long Châu. Gồm: HEALTHCARE.EMERGENCY → phát GR-07 và hướng dẫn gọi 115 ngay; 23 intent có Escalation=MUST/HIGH → phải vào queue dược sĩ, không vào queue bán hàng chung. Vi phạm R-SAFE = chặn go-live hoàn toàn.