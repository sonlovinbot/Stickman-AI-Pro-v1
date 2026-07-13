<div align="center">

# 🖍️ Stickman AI Pro

**Biến một ý tưởng thành nguyên bộ video người que viral — tiêu đề, kịch bản, hình ảnh, thumbnail và giọng đọc — trong vài phút.**

Một dự án mã nguồn mở miễn phí từ **[Coachio](https://coachio.ai)**

[Tính năng](#-tính-năng) · [Bắt đầu](#-bắt-đầu) · [Cài đặt API](#-cài-đặt-api) · [Coachio API](#-tích-hợp-coachio-api) · [Cấu trúc](#-cấu-trúc-dự-án)

</div>

---

## 📖 Giới thiệu dự án

**Stickman AI Pro** là công cụ sản xuất nội dung video dạng "người que" (stick figure) theo phong cách các kênh YouTube nổi tiếng như *Better Than Yesterday* hay *Casually Explained* — nét vẽ tối giản, đen trên nền giấy ngà, kể chuyện bằng ẩn dụ hình ảnh.

Bạn chỉ cần nhập **một chủ đề**. Ứng dụng lo phần còn lại: nghĩ tiêu đề viral, chia kịch bản thành từng cảnh 2 giây, vẽ minh hoạ cho từng cảnh, tạo thumbnail và lồng giọng đọc. Kết thúc, bạn tải về một file ZIP đã sẵn sàng để dựng.

Dự án được **Coachio** phát hành miễn phí cho cộng đồng creator Việt Nam — như một ví dụ thực chiến cho thấy có thể ghép các mô hình AI thành một dây chuyền sản xuất nội dung hoàn chỉnh, chạy hoàn toàn trên trình duyệt, không cần backend.

> **Coachio** là nền tảng dành cho coach, creator và nhà đào tạo: xây funnel, bán khoá học, chăm sóc học viên, và một API gateway hợp nhất để gọi các mô hình AI tạo ảnh/video hàng đầu qua một endpoint duy nhất — chính là API được tích hợp sẵn trong dự án này.

---

## ✨ Tính năng

| | |
|---|---|
| 🎯 **Tiêu đề viral** | 5 tiêu đề theo 3 công thức đã được kiểm chứng (Extreme Transformation, Cruel Truth, Wake-up Call) |
| 📝 **Kịch bản mật độ cao** | Chia nhỏ thành các cảnh 2 giây — nhịp giữ chân người xem trên TikTok/Shorts |
| 🖼️ **Minh hoạ người que** | Mỗi cảnh một hình, nét vẽ và bảng màu đồng nhất, có chữ trong ảnh |
| 🎨 **Thumbnail** | Ảnh bìa YouTube tạo tự động từ tiêu đề đã chọn |
| 🎙️ **Giọng đọc AI** | Text-to-speech, kèm nút viết lại kịch bản dài hơn / ngắn gọn hơn |
| 🌍 **3 ngôn ngữ** | Tiếng Việt · English · 日本語 — mỗi ngôn ngữ có công thức và giọng riêng |
| 📐 **2 khung hình** | Dọc 9:16 (TikTok/Shorts) hoặc ngang 16:9 (YouTube) |
| 💾 **Lưu & mở dự án** | Xuất JSON để làm tiếp sau, xuất ZIP (ảnh + kịch bản + audio) khi xong |
| ⚙️ **Hai nguồn tạo ảnh** | Google Gemini *(Nano Banana Pro)* hoặc **Coachio** *(GPT Image 2, tối đa 4K)* |

### Quy trình 6 bước

```
1. Chủ đề  →  2. Tiêu đề  →  3. Kịch bản  →  4. Hình ảnh  →  5. Thumbnail  →  6. Audio  →  📦 ZIP
```

---

## 🚀 Bắt đầu

**Yêu cầu:** Node.js 18+

```bash
git clone https://github.com/sonlovinbot/Stickman-AI-Pro-v1.git
cd Stickman-AI-Pro-v1
npm install
```

Tạo file `.env.local` ở thư mục gốc:

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

> Gemini luôn cần thiết vì nó lo phần **tiêu đề, kịch bản và giọng đọc**. Lấy key miễn phí tại [Google AI Studio](https://aistudio.google.com/apikey).

Chạy ứng dụng:

```bash
npm run dev     # http://localhost:3000
npm run build   # build production vào dist/
```

---

## ⚙️ Cài đặt API

Bấm biểu tượng **⚙️** trên thanh header để mở bảng **Cài đặt API**. Tại đây bạn chọn nguồn tạo **ảnh**:

### Google Gemini (mặc định)

Dùng model `gemini-3-pro-image-preview` (Nano Banana Pro) với key trong `.env.local`. Không cần cấu hình thêm.

### Coachio — GPT Image 2

| Tuỳ chọn | Mô tả |
|---|---|
| **API Key** | Lấy tại Coachio Dashboard → **API Keys**. Lưu trong `localStorage` của trình duyệt, không gửi đi đâu khác ngoài `api.coachio.ai`. |
| **Base URL** | Mặc định `https://api.coachio.ai/api/v1`. Đổi sang proxy của bạn nếu trình duyệt chặn CORS. |
| **Độ phân giải** | `1k` (0.81 credits) · `2k` (1.35) · `4k` (3.2) |
| **Tỷ lệ khung hình** | Mặc định bám theo khung hình đã chọn ở bước Chủ đề. Có thể ép cứng `16:9`, `9:16`, `1:1`, `auto`... |
| **Ảnh tham chiếu** | Tuỳ chọn, tối đa **5 ảnh**. Tải lên ảnh mẫu để GPT Image 2 giữ đúng nét vẽ người que xuyên suốt tất cả các cảnh. |
| **Kiểm tra kết nối** | Xác thực API Key ngay trong bảng cài đặt trước khi tốn credits. |

Bấm **Kiểm tra kết nối** để chắc chắn key hợp lệ, rồi **Lưu cài đặt**. Chấm đỏ trên biểu tượng ⚙️ báo hiệu bạn đang dùng Coachio.

---

## 🔌 Tích hợp Coachio API

Toàn bộ nằm trong [services/coachioService.ts](services/coachioService.ts). Luồng chuẩn: **upload → submit → poll → download**.

```
POST /upload/image          →  URL ảnh tham chiếu (tuỳ chọn, ≤15MB, ≤5 ảnh)
POST /task/submit           →  task_id
GET  /task/status/{task_id} →  poll mỗi 3s cho tới completed / failed
                            →  tải ảnh về, inline thành base64 để đóng gói ZIP
```

Xác thực bằng header `X-API-Key` trên mọi request.

**Payload submit:**

```json
{
  "task_type": "image",
  "prompt": "<prompt người que>",
  "ai_model_config": {
    "model_identifier": "gpt_image_2",
    "generation_mode": "default",
    "aspect_ratio": "9:16",
    "resolution": "1k"
  },
  "media_inputs": {
    "images_url": ["https://cdn.coachio.ai/.../ref.png"]
  }
}
```

**Đã xử lý sẵn trong code:**

- ⏳ **Polling** mỗi 3 giây, timeout cứng 5 phút.
- 🔁 **Exponential backoff** cho lỗi `429` và `5xx` (4 lần thử, 2s → 16s).
- 🚧 **Ràng buộc của model:** `aspect_ratio: "auto"` chỉ chạy được với `resolution: "1k"` — UI tự hạ độ phân giải để bạn không nhận lỗi 400.
- 💬 **Thông báo lỗi tiếng Việt** cho `400` (tham số sai), `401` (key sai), `402` (hết credits), `413` (file >15MB), `429` (rate limit), `500` (lỗi máy chủ).
- 🖼️ **CORS an toàn:** ảnh trả về được tải và chuyển thành data URL. Nếu CDN chặn cross-origin, ứng dụng vẫn giữ nguyên link và ghi kèm vào ZIP dưới dạng `.url.txt` thay vì âm thầm bỏ mất ảnh.

**Bảng giá GPT Image 2:** 1K = 0.81 credits · 2K = 1.35 credits · 4K = 3.2 credits mỗi ảnh.

> ⚠️ Đây là ứng dụng chạy hoàn toàn phía trình duyệt, nên API Key nằm trong `localStorage`. Với môi trường production, hãy đặt một proxy backend giữ key ở phía máy chủ và trỏ **Base URL** vào proxy đó.

---

## 📁 Cấu trúc dự án

```
├── App.tsx                      # State máy chủ đạo: 6 bước, import/export, ZIP
├── types.ts                     # Scene, GenerationConfig, ApiSettings, CoachioSettings
├── components/
│   ├── SettingsModal.tsx        # ⚙️ Bảng cài đặt API (chọn nguồn ảnh, key, ảnh tham chiếu)
│   ├── StepInput.tsx            # 1. Chủ đề, ngôn ngữ, tone, khung hình, thời lượng
│   ├── StepTitles.tsx           # 2. Chọn tiêu đề
│   ├── StepScript.tsx           # 3. Duyệt & sửa kịch bản
│   ├── StepVisuals.tsx          # 4. Ảnh từng cảnh (vẽ lại từng ảnh được)
│   ├── StepThumbnail.tsx        # 5. Thumbnail
│   └── StepAudio.tsx            # 6. Giọng đọc + xuất ZIP
└── services/
    ├── imageService.ts          # Điều phối: gọi Gemini hay Coachio
    ├── imagePrompts.ts          # Prompt định danh phong cách — dùng chung cho cả 2 nguồn
    ├── geminiService.ts         # Tiêu đề, kịch bản, viết lại, TTS, ảnh Gemini
    ├── coachioService.ts        # Coachio API: upload, submit, poll, backoff, lỗi
    └── settingsService.ts       # Đọc/ghi cài đặt vào localStorage
```

Vì `imagePrompts.ts` được cả hai nguồn dùng chung, bạn có thể đổi nguồn tạo ảnh giữa chừng mà các cảnh vẫn giữ cùng một phong cách.

---

## 🛠️ Công nghệ

React 19 · TypeScript · Vite 6 · Tailwind CSS · JSZip · Google Gemini · Coachio API

---

<div align="center">

**Made with 🖍️ by [Coachio](https://coachio.ai)**

Miễn phí, mã nguồn mở. Dùng thoải mái, fork thoải mái.

</div>
