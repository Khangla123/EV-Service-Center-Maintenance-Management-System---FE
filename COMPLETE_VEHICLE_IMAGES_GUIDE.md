# 🚗 Hướng dẫn Hoàn thiện Ảnh Xe

## 🎯 Mục tiêu
Thêm ảnh cho TẤT CẢ các xe trong database để hiển thị đẹp trên trang "Quản lý xe".

## ✅ Hiện trạng
- ✓ VinFast VF 8 - Đã có ảnh, đang hiển thị
- ✓ VinFast VF 9 - Đã có ảnh, đang hiển thị
- ⏳ ~33 xe khác - Chưa có ảnh

## 📋 Các bước thực hiện

### Bước 1: Chạy SQL update database (BẮT BUỘC)

**Mở IntelliJ Database Console:**
1. Click vào tab **Database** (bên phải)
2. Kết nối: `EVService@localhost`
3. Right-click → **Jump to Query Console**
4. Mở file: `database/update_all_vehicle_images.sql`
5. Chọn tất cả (Ctrl+A)
6. Chạy (Ctrl+Enter hoặc click ▶)

**Kết quả mong đợi:**
```
UPDATE 35  (tất cả xe đã được update đường dẫn ảnh)
```

### Bước 2: Download ảnh xe (TÙY CHỌN)

Bạn có 3 lựa chọn:

#### **Option A: Dùng placeholder tạm (Nhanh nhất)** ✅ Recommended
```
- Database đã được update với đường dẫn
- Xe chưa có ảnh sẽ hiển thị SVG placeholder
- Có thể thêm ảnh thật sau
```

#### **Option B: Download ảnh thật (Chất lượng cao)**
Xem file: `DOWNLOAD_CHECKLIST.md`
- Ưu tiên: VinFast (4 xe) + Tesla (4 xe)
- Nguồn: Trang chính thức, stock photos, AI
- Yêu cầu: 800x600px, < 200KB, PNG

#### **Option C: Tạo placeholder SVG**
```powershell
cd public/assets/images/vehicles
.\create_placeholders.ps1
```

### Bước 3: Restart Backend (BẮT BUỘC)

**Trong IntelliJ:**
1. Stop backend hiện tại (Ctrl+F2 hoặc nút Stop đỏ)
2. Chạy lại: Click nút Run (▶) hoặc Shift+F10

**Hoặc dùng terminal:**
```bash
cd C:\FPT\SWP2\EV-Service-Center-Maintenance-Management-System---BE
mvn spring-boot:run
```

### Bước 4: Test kết quả

1. Mở trình duyệt: http://localhost:3000/customer/vehicles
2. Hard refresh: **Ctrl + Shift + R**
3. Kiểm tra:
   - ✓ VF8, VF9 hiển thị ảnh thật
   - ✓ Xe khác hiển thị placeholder SVG (nếu chưa có ảnh)
   - ✓ Không có icon placeholder cũ

---

## 🎨 Cấu trúc thư mục

```
public/assets/images/vehicles/
├── vinfast-vf8.png              ✅ Đã có
├── vinfast-vf9.png              ✅ Đã có
├── vinfast-vf5.png              ⏳ Cần thêm
├── vinfast-e34.png              ⏳ Cần thêm
├── tesla-model3.png             ⏳ Cần thêm
├── tesla-modely.png             ⏳ Cần thêm
├── tesla-models.png             ⏳ Cần thêm
├── byd-atto3.png                ⏳ Cần thêm
├── hyundai-ioniq5.png           ⏳ Cần thêm
├── kia-ev6.png                  ⏳ Cần thêm
├── default-ev.svg               ✅ Placeholder mặc định
├── DOWNLOAD_CHECKLIST.md        📝 Danh sách cần download
└── create_placeholders.ps1      🔧 Script tạo placeholder
```

---

## 📊 Database Schema

```sql
vehicle_models
├── id
├── manufacturer (VinFast, Tesla, BYD...)
├── model (VF 8, Model 3...)
├── year
├── battery_capacity
├── range_km
└── image_url  ⭐ '/assets/images/vehicles/vinfast-vf8.png'
```

---

## 🔍 Debug

### Nếu ảnh không hiển thị:

**1. Kiểm tra Database:**
```sql
SELECT manufacturer, model, image_url 
FROM vehicle_models 
WHERE manufacturer = 'VinFast';
```
Kết quả phải có `image_url` không NULL.

**2. Kiểm tra File:**
```bash
# Kiểm tra file có tồn tại không
Test-Path "public/assets/images/vehicles/vinfast-vf8.png"
# Phải trả về: True
```

**3. Kiểm tra Console:**
- Mở DevTools (F12) → Console
- Tìm log: `🖼️ First vehicle imageUrl: ...`
- Không có lỗi 404

**4. Kiểm tra Network:**
- DevTools → Network → Img
- Tìm: `vinfast-vf8.png`
- Status: 200 (OK)

---

## ✅ Checklist Hoàn thành

- [ ] Bước 1: Chạy SQL `update_all_vehicle_images.sql`
- [ ] Bước 2: Restart backend
- [ ] Bước 3: Test trên browser
- [ ] Bước 4: Kiểm tra Console không lỗi
- [ ] Bước 5: VF8, VF9 hiển thị ảnh thật
- [ ] Bước 6: Xe khác hiển thị placeholder (OK)
- [ ] Bước 7: (Optional) Download thêm ảnh thật

---

## 🎯 Kết quả mong đợi

### Trước (chỉ icon):
```
┌─────────────────┐
│ VF 8     2024   │
│   [Car Icon]    │
│     black       │
└─────────────────┘
```

### Sau (có ảnh):
```
┌─────────────────┐
│ VF 8     2024   │
│ [Ảnh VF8 đen]   │
│                 │
└─────────────────┘
```

---

## 📁 Files quan trọng

✅ `update_all_vehicle_images.sql` - SQL update database (CHẠY NÀY TRƯỚC)  
✅ `DOWNLOAD_CHECKLIST.md` - Danh sách ảnh cần download  
✅ `create_placeholders.ps1` - Script tạo placeholder SVG  
✅ `default-ev.svg` - Placeholder mặc định

---

## 💡 Tips

**Ưu tiên:**
1. ✅ Chạy SQL update database (5 phút)
2. ✅ Restart backend (2 phút)
3. ✅ Test xem đã hiển thị chưa (1 phút)
4. ⏳ Download ảnh dần dần (làm sau)

**Lợi ích:**
- Database đã sẵn sàng
- Code đã support ảnh
- Thêm ảnh mới chỉ cần drop file vào thư mục `vehicles/`
- Không cần restart backend khi thêm ảnh

---

🚀 **Bắt đầu từ Bước 1: Chạy SQL update database!**
