---
id: gloss-speech-to-intent
term: Speech-to-Intent
category: Engineering
example: Khách nói "tôi muốn hỏi về vaccine" → STT → văn bản → NLU → VACCINATION.INQUIRY → queue FVAC_ECOM
---

Kiến trúc callbot thế hệ mới: Giọng nói → STT (văn bản tiếng Việt) → NLU (nhận diện intent + confidence) → Định tuyến. Thay thế DTMF (bấm phím) trên hotline 18006928 trong dự án MPT PB1. Confidence threshold: ≥ 0.6 để được coi là phân loại được.