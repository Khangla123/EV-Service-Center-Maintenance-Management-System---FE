# 🔧 Fix: Ảnh Xe Không Hiển Thị

## ❌ Vấn đề
Trang "Quản lý xe" không hiển thị ảnh xe, chỉ có icon placeholder.

## ✅ Nguyên nhân
1. **Ảnh đã có** trong `public/assets/images/` nhưng code tìm ở `public/assets/images/vehicles/`
2. **Database chưa có imageUrl** (hoặc NULL)
3. **Backend chưa restart** sau khi thêm field imageUrl

## 🚀 Giải pháp (Làm theo thứ tự)

### Bước 1: Kiểm tra file ảnh ✅
```
✅ DONE - Đã copy ảnh vào thư mục đúng:
- vinfast-vf8.png 
- vinfast-vf9.png
Đường dẫn: public/assets/images/vehicles/
```

### Bước 2: Update Database ⏳

**Chạy SQL này trong Database Console (IntelliJ):**

```sql
-- Update đường dẫn ảnh VinFast
UPDATE vehicle_models 
SET image_url = '/assets/images/vehicles/vinfast-vf8.png'
WHERE manufacturer = 'VinFast' AND model IN ('VF 8', 'VF8');

UPDATE vehicle_models 
SET image_url = '/assets/images/vehicles/vinfast-vf9.png'
WHERE manufacturer = 'VinFast' AND model IN ('VF 9', 'VF9');

-- Kiểm tra
SELECT manufacturer, model, image_url 
FROM vehicle_models 
WHERE manufacturer = 'VinFast';
```

**Hoặc chạy file SQL:**
```bash
# Trong IntelliJ Database Console
# Mở file: update_vinfast_images.sql
# Chọn tất cả (Ctrl+A)
# Chạy (Ctrl+Enter)
```

### Bước 3: Restart Backend ⏳

```bash
# Stop backend hiện tại (Ctrl+C trong terminal backend)
# Hoặc click vào nút Stop trong IntelliJ

# Restart
cd C:\FPT\SWP2\EV-Service-Center-Maintenance-Management-System---BE
mvn spring-boot:run
```

### Bước 4: Refresh Frontend ⏳

1. Mở trình duyệt: http://localhost:3000/customer/vehicles
2. Hard refresh: **Ctrl + F5** hoặc **Ctrl + Shift + R**
3. Mở **DevTools** (F12) → tab **Console**
4. Xem các log debug:
   ```
   🚗 Vehicles loaded: [...]
   🖼️ First vehicle imageUrl: /assets/images/vehicles/vinfast-vf8.png
   🔍 Getting image for VinFast VF 8: /assets/images/vehicles/vinfast-vf8.png
   ✅ Using imageUrl from database: /assets/images/vehicles/vinfast-vf8.png
   ```

### Bước 5: Kiểm tra kết quả ✅

Nếu thành công, bạn sẽ thấy:
- ✅ Ảnh VF8 màu đen hiển thị
- ✅ Ảnh VF9 màu trắng hiển thị
- ✅ Console log không có lỗi 404

## 🐛 Nếu vẫn không hiển thị

### Debug 1: Kiểm tra Console Log
Mở DevTools (F12) → Console, tìm:
- ❌ **404 Not Found** → File ảnh không tồn tại
- ❌ **imageUrl: undefined** → Database chưa có data
- ❌ **imageUrl: null** → Database có record nhưng imageUrl = NULL

### Debug 2: Kiểm tra Network Tab
DevTools → Network → Filter: Img
- Tìm request: `vinfast-vf8.png`
- Xem status: 200 (OK) hay 404 (Not Found)

### Debug 3: Kiểm tra API Response
DevTools → Network → Filter: XHR/Fetch
- Tìm request: `/api/v1/vehicles/my-vehicles`
- Xem Response → Kiểm tra có field `imageUrl` không

**Response mẫu (đúng):**
```json
{
  "id": "xxx",
  "make": "VinFast",
  "model": "VF 8",
  "imageUrl": "/assets/images/vehicles/vinfast-vf8.png"  ← Phải có
}
```

### Debug 4: Verify Backend
```bash
# Test API trực tiếp
curl http://localhost:8080/api/v1/vehicles/my-vehicles
# Hoặc mở Postman/Thunder Client
```

## 📝 Checklist

- [ ] Bước 1: File ảnh đã có trong `public/assets/images/vehicles/` ✅
- [ ] Bước 2: Database đã update imageUrl
- [ ] Bước 3: Backend đã restart
- [ ] Bước 4: Frontend đã hard refresh
- [ ] Bước 5: Check Console log (không có lỗi)
- [ ] Bước 6: Check Network (ảnh load 200 OK)
- [ ] Bước 7: Ảnh hiển thị trên UI ✅

## 🎯 Kết quả mong đợi

**Trước:**
```
┌─────────────────────┐
│  VF 8      2024     │
│                     │
│    [Car Icon]       │  ← Chỉ có icon
│     black           │
│                     │
└─────────────────────┘
```

**Sau:**
```
┌─────────────────────┐
│  VF 8      2024     │
│                     │
│  [Ảnh VF8 đen]      │  ← Ảnh thật
│                     │
│                     │
└─────────────────────┘
```

---

✅ Frontend code đã update với debug logs  
✅ File ảnh đã sẵn sàng  
⏳ Cần chạy SQL update database  
⏳ Cần restart backend
