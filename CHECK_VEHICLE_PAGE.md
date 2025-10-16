# ✅ Hướng dẫn kiểm tra Vehicle Management

## 🔍 Vấn đề hiện tại
- Bạn đang ở trang **Booking** (`/customer/booking`) 
- Cần truy cập trang **Vehicle Management** (`/customer/vehicles`)

## 📍 Các bước kiểm tra

### Bước 1: Truy cập đúng trang
Mở trình duyệt và vào:
```
http://localhost:3000/customer/vehicles
```

HOẶC từ trang chủ:
1. Click vào menu Customer
2. Chọn "Quản lý phương tiện" / "My Vehicles"

### Bước 2: Kiểm tra Console
Mở DevTools (F12) → Console tab, bạn sẽ thấy:

**✅ Logs thành công:**
```
🔍 [VehicleManagement] Component mounted
🔑 [VehicleManagement] Token: eyJ...
👤 [VehicleManagement] Loading vehicles for user: eab97d81-2ef2-4c4e-b85a-c61f77c1bd87
📞 [vehicleService] Calling GET /vehicles/me...
📦 [vehicleService] Raw response: {message: "...", result: [...]}
✅ [vehicleService] Returning vehicles: [{...}]
🚗 [VehicleManagement] Vehicles response: [{id: "...", manufacturer: "VinFast", ...}]
📊 [VehicleManagement] Mapped vehicles: [{id: "...", make: "VinFast", ...}]
✅ [VehicleManagement] Returning vehicles: 1
```

### Bước 3: Kiểm tra hiển thị
Trang phải hiển thị:
- Card với thông tin xe: **VinFast VF8** 
- Biển số: **30A-123.45**
- VIN: **VF8ABC123456789**
- Năm: **2023**
- Màu: **Đỏ** (Red)

### Bước 4: Kiểm tra Backend logs (trong IntelliJ)
```
🚗 [VehicleController] /me endpoint called
🔑 [VehicleController] Authentication: EXISTS
👤 [VehicleController] Authenticated: true
🆔 [VehicleController] UserId: eab97d81-2ef2-4c4e-b85a-c61f77c1bd87
📋 [VehicleService] getMyVehicles - userId: eab97d81-2ef2-4c4e-b85a-c61f77c1bd87
👤 [VehicleService] Found customer: khang (6736a155-b5a3-43b0-94c6-9313cd000ff2)
🚙 [VehicleService] Found 1 vehicles for customer
✅ [VehicleController] Returning 1 vehicles
```

## 🐛 Nếu vẫn gặp lỗi

### Lỗi 400 Bad Request
- Kiểm tra token còn hiệu lực không (logout → login lại)
- Xem backend logs có exception không

### Lỗi 404 Not Found  
- Backend chưa restart sau khi sửa code
- URL không đúng

### Không hiển thị xe
- Kiểm tra database có dữ liệu không
- Xem console logs để debug

## 📝 Lưu ý về trang Booking
Trang `/customer/booking` cũng gọi API vehicles để load dropdown chọn xe.
Nếu vehicle API hoạt động, dropdown sẽ hiển thị danh sách xe.

Nhưng để test **Vehicle Management** đầy đủ, phải vào trang `/customer/vehicles`.
