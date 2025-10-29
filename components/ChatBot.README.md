# Chatbot "Em Boo" - Trợ lý tìm trọ thông minh

## 🎀 Tính năng

### 1. **Giao diện dễ thương và hiện đại**
- ✨ Sử dụng mascot MASCOT.png làm avatar
- 🎨 Tone màu chủ đạo: Xanh cyan, xanh dương, xanh teal
- 💎 Font chữ title giống RoomieGo (iCielBC Lodestone)
- 🌈 Gradient background và hiệu ứng glassmorphism

### 2. **Chức năng tương tác**
- 💬 Chat real-time với Em Boo
- 🤖 Trả lời tự động thông minh theo context
- ⚡ Gợi ý nhanh (Quick Replies)
- ⌨️ Typing indicator khi bot đang trả lời
- 📱 Responsive design cho mobile

### 3. **Khả năng phóng to/thu nhỏ**
- 🔼 Minimize: Thu nhỏ chatbox
- 🔽 Maximize: Mở rộng chatbox
- ❌ Close: Đóng chatbox
- 🎯 Floating button ở góc màn hình

## 🎭 Tính cách "Em Boo"

### Phong cách giao tiếp:
- 💕 Dễ thương, thân thiện, gần gũi
- 🎀 Dùng emoji để tạo cảm xúc
- 🌟 Nhiệt tình hỗ trợ người dùng
- 😊 Lịch sự, chuyên nghiệp nhưng không cứng nhắc

### Nhiệm vụ chính:
1. **Tìm phòng theo yêu cầu** - Lọc phòng theo giá, khu vực, tiện ích
2. **Gợi ý phòng phù hợp** - Đề xuất phòng nổi bật, phòng gần trường
3. **Hỗ trợ thông tin** - Trả lời câu hỏi về tìm trọ
4. **Hướng dẫn sử dụng** - Giúp người dùng sử dụng website

## 📝 Các loại câu trả lời mẫu

### 1. Chào hỏi (Greeting)
```
- "Chào bạn! Mình là Em Boo nè 🎀 Bạn đang tìm phòng trọ ở đâu thế?"
- "Hi bạn yêu! Em Boo đây 💙 Để em giúp bạn tìm phòng trọ ưng ý nhé!"
- "Xin chào! Em là Boo, trợ lý tìm trọ của bạn 🏠"
```

### 2. Hỏi về giá (Budget)
```
- "Bạn muốn tìm phòng trong tầm giá bao nhiêu vậy? Em sẽ lọc phòng phù hợp cho bạn ngay! 💰"
- "Ngân sách của bạn khoảng bao nhiêu một tháng nhỉ? Để em tìm những phòng đẹp mà giá hợp lý nha! ✨"
```

### 3. Hỏi về địa điểm (Location)
```
- "Bạn muốn tìm phòng ở khu vực nào? Gần trường học, gần chợ hay trung tâm thành phố? 📍"
- "Địa điểm nào bạn thích nhất? Em sẽ tìm những phòng đẹp ở gần đó cho bạn! 🗺️"
```

### 4. Hỏi về tiện ích (Amenities)
```
- "Bạn cần phòng có những tiện ích gì nhỉ? Wifi, máy lạnh, bếp riêng...? Cứ nói em nghe nha! 🌟"
- "Phòng bạn tìm cần có gì đặc biệt không? Gác lửng, ban công, hay máy giặt? Em note lại liền! 📝"
```

### 5. Cảm ơn (Thanks)
```
- "Không có gì đâu bạn yêu! Em luôn sẵn sàng giúp bạn mà 💙"
- "Hehe, em vui khi giúp được bạn! Có gì cứ gọi em nha! 🎀"
```

## 🎨 Design Tokens

### Colors
```css
Primary Gradient: from-cyan-500 via-blue-500 to-teal-500
Background: from-blue-50 via-cyan-50 to-teal-50
User Message: from-blue-500 to-cyan-500
Bot Message: white with cyan border
Border: cyan-200/50
```

### Typography
```css
Title: iCielBC Lodestone (--font-heading)
Body: Inter (--font-sans)
```

### Spacing
```css
ChatBox Size: 420x600px (desktop), 450x650px (large)
Minimized: 320x80px
Border Radius: 3xl (1.5rem)
Shadow: 2xl with color glow
```

## 🚀 Cách sử dụng

### Trong code:
```tsx
import ChatBot from "@/components/ChatBot"

// Thêm vào layout hoặc page
<ChatBot />
```

### Cho người dùng:
1. Click vào nút chat (biểu tượng tin nhắn) ở góc phải màn hình
2. Chat với Em Boo bằng cách gõ tin nhắn
3. Hoặc chọn gợi ý nhanh để bắt đầu
4. Minimize/Maximize để điều chỉnh kích thước
5. Close để đóng chatbox

## 🔮 Tương lai phát triển

- [ ] Tích hợp AI/GPT để trả lời thông minh hơn
- [ ] Kết nối trực tiếp với API tìm kiếm phòng
- [ ] Hiển thị kết quả phòng trong chatbox
- [ ] Lưu lịch sử chat
- [ ] Voice input/output
- [ ] Multi-language support
- [ ] Analytics tracking

## 💡 Tips

- Chatbot sẽ tự động chào hỏi khi mở lần đầu
- Typing delay ngẫu nhiên 0.8-1.6s để tạo cảm giác tự nhiên
- Quick replies chỉ hiển thị ở đầu cuộc hội thoại
- Chatbox tự động scroll xuống tin nhắn mới nhất
- Avatar sử dụng gradient border để nổi bật

---

**Tạo bởi:** Tro4S Team  
**Version:** 1.0.0  
**Last Updated:** October 22, 2025
