# Debug Guide - Không hiển thị xe

## Bước 1: Kiểm tra Database

### 1.1 Kết nối database và chạy các query sau:

```sql
-- Query 1: Kiểm tra có vehicle models không
SELECT COUNT(*) as total_models FROM vehicle_models WHERE is_active = true;

-- Query 2: Kiểm tra có vehicles không
SELECT COUNT(*) as total_vehicles FROM vehicles WHERE is_active = true;

-- Query 3: Kiểm tra user đang đăng nhập (thay YOUR_EMAIL)
SELECT 
    u.id as user_id,
    u.email,
    c.id as customer_id,
    c.full_name
FROM users u
LEFT JOIN customers c ON c.user_id = u.id
WHERE u.email = 'YOUR_EMAIL';

-- Query 4: Kiểm tra xe của user đó
SELECT 
    v.id,
    v.vin,
    v.license_plate,
    vm.manufacturer,
    vm.model,
    c.full_name as owner
FROM vehicles v
JOIN customers c ON v.customer_id = c.id
JOIN users u ON c.user_id = u.id
JOIN vehicle_models vm ON v.vehicle_model_id = vm.id
WHERE u.email = 'YOUR_EMAIL' 
  AND v.is_active = true;
```

**Kết quả mong đợi:**
- Query 1: > 0 (có vehicle models)
- Query 2: > 0 (có vehicles)
- Query 3: Trả về user_id và customer_id
- Query 4: Trả về danh sách xe của user

## Bước 2: Kiểm tra Backend Logs

### 2.1 Restart backend với logging:
```bash
cd c:\FPT\SWP2\EV-Service-Center-Maintenance-Management-System---BE
.\mvnw spring-boot:run
```

### 2.2 Quan sát logs khi gọi API, cần thấy:
```
🚗 [VehicleController] /me endpoint called
🔑 [VehicleController] Authentication: EXISTS
👤 [VehicleController] Authenticated: true
👤 [VehicleController] Principal: <user-uuid>
🆔 [VehicleController] UserId: <user-uuid>
🚗 [VehicleService] getMyVehicles called with userId: <user-uuid>
✅ [VehicleService] Found customer: <customer-uuid> - <name>
🔍 [VehicleService] getVehiclesByCustomerId called with customerId: <customer-uuid>
📊 [VehicleService] Found X active vehicles in database
✅ [VehicleService] Converted to X responses
✅ [VehicleController] Returning X vehicles
```

**Vấn đề có thể gặp:**

#### Vấn đề 1: Authentication NULL
```
🔑 [VehicleController] Authentication: NULL
```
**Nguyên nhân:** Token không được gửi hoặc không hợp lệ
**Giải pháp:** Kiểm tra localStorage có token không, đăng nhập lại

#### Vấn đề 2: Customer not found
```
❌ [VehicleService] Customer not found for userId: <uuid>
```
**Nguyên nhân:** User không có Customer record
**Giải pháp:** Chạy query INSERT customer cho user đó

#### Vấn đề 3: No vehicles found
```
⚠️ [VehicleService] No vehicles found for customer <uuid>
```
**Nguyên nhân:** Customer không có xe trong database
**Giải pháp:** Thêm xe cho customer trong database

## Bước 3: Kiểm tra Frontend

### 3.1 Mở Chrome DevTools (F12) → Console

### 3.2 Quan sát logs khi load trang `/customer/vehicles`:
```
🚗 [VehicleManagement] Loading vehicles from API...
🔑 [VehicleManagement] Token: EXISTS
👤 [VehicleManagement] User: {...}
✅ [VehicleManagement] API Response: [...]
📊 [VehicleManagement] Response length: X
🔄 [VehicleManagement] Mapping vehicle: {...}
✅ [VehicleManagement] Mapped vehicles: [...]
```

**Vấn đề có thể gặp:**

#### Vấn đề 1: Token MISSING
```
🔑 [VehicleManagement] Token: MISSING
```
**Giải pháp:** Đăng nhập lại để lấy token mới

#### Vấn đề 2: API Error 401
```
❌ [VehicleManagement] Error details: { status: 401, ... }
```
**Giải pháp:** Token hết hạn, đăng nhập lại

#### Vấn đề 3: API Error 403
```
❌ [VehicleManagement] Error details: { status: 403, ... }
```
**Giải pháp:** User không có quyền truy cập, kiểm tra role

#### Vấn đề 4: Response rỗng
```
⚠️ [VehicleManagement] No vehicles returned from API
```
**Giải pháp:** User không có xe, cần thêm xe trong database

### 3.3 Test API trực tiếp trong Console:

Paste code trong file `test-vehicle-api.js` vào Console và chạy

## Bước 4: Test API với Postman/Thunder Client

### Request:
```
GET http://localhost:8080/api/vehicles/me
Headers:
  Authorization: Bearer <your-token>
  Content-Type: application/json
```

### Response mong đợi:
```json
{
  "message": "Danh sách xe của bạn",
  "result": [
    {
      "id": "...",
      "customerId": "...",
      "manufacturer": "VinFast",
      "model": "VF8",
      "year": 2023,
      "vin": "VF8ABC123456789",
      "licensePlate": "30A-123.45",
      "color": "Đen",
      "batteryCapacity": 87.7,
      "mileage": 14800,
      "purchaseDate": "2023-05-15",
      "createdAt": "...",
      "updatedAt": "..."
    }
  ]
}
```

## Bước 5: Các lỗi thường gặp và cách sửa

### Lỗi 1: "Customer not found"
```sql
-- Kiểm tra xem user có customer record không
SELECT u.id as user_id, u.email, c.id as customer_id
FROM users u
LEFT JOIN customers c ON c.user_id = u.id
WHERE u.email = 'YOUR_EMAIL';

-- Nếu customer_id là NULL, tạo customer:
INSERT INTO customers (id, user_id, full_name, phone, address, created_at, updated_at)
VALUES (
    UUID(),
    '<user_id_from_above>',
    'Customer Name',
    '0123456789',
    'Address',
    NOW(),
    NOW()
);
```

### Lỗi 2: "No vehicles found"
```sql
-- Tạo vehicle model trước (nếu chưa có)
INSERT INTO vehicle_models (id, manufacturer, model, year, battery_capacity, range_km, is_active, created_at, updated_at)
VALUES (
    UUID(),
    'VinFast',
    'VF8',
    2023,
    87.7,
    420,
    true,
    NOW(),
    NOW()
);

-- Sau đó tạo vehicle
INSERT INTO vehicles (
    id, customer_id, vehicle_model_id, vin, license_plate, 
    color, purchase_date, mileage, is_active, created_at, updated_at
)
VALUES (
    UUID(),
    '<customer_id>',
    '<vehicle_model_id>',
    'VF8ABC123456789',
    '30A-123.45',
    'Đen',
    '2023-05-15',
    14800,
    true,
    NOW(),
    NOW()
);
```

### Lỗi 3: Backend không nhận token
**Kiểm tra CORS trong SecurityConfig:**
```java
corsConfiguration.addAllowedOrigin("http://localhost:3000");
corsConfiguration.setAllowCredentials(true);
```

**Kiểm tra frontend gửi token:**
```typescript
// api.ts
config.headers.Authorization = `Bearer ${token}`;
```

### Lỗi 4: Token expired
**Giải pháp:** Đăng nhập lại để lấy token mới
```javascript
// Clear old token
localStorage.removeItem('accessToken');
localStorage.removeItem('user');
// Then login again
```

## Bước 6: Checklist tổng hợp

- [ ] Database có vehicle_models
- [ ] Database có vehicles với is_active = true
- [ ] User có customer record (customers.user_id = users.id)
- [ ] Customer có vehicles (vehicles.customer_id = customers.id)
- [ ] Backend đang chạy trên port 8080
- [ ] Frontend đang chạy trên port 3000
- [ ] Token tồn tại trong localStorage
- [ ] Token chưa hết hạn
- [ ] API /vehicles/me trả về 200 OK
- [ ] Response có field "result" là array
- [ ] Frontend mapping đúng manufacturer → make
- [ ] Console không có lỗi 401/403

## Bước 7: Nếu vẫn không được

1. **Clear cache:**
   - Ctrl + Shift + Delete
   - Clear cookies, cache, storage
   - Restart browser

2. **Rebuild backend:**
   ```bash
   cd BE
   .\mvnw clean package
   .\mvnw spring-boot:run
   ```

3. **Rebuild frontend:**
   ```bash
   cd FE
   rm -rf node_modules package-lock.json
   npm install
   npm start
   ```

4. **Check network tab:**
   - F12 → Network
   - Reload page
   - Click on `/vehicles/me` request
   - Check Request Headers (có Authorization không?)
   - Check Response (status code? response body?)

5. **Enable verbose logging:**
   ```yaml
   # application.yaml
   logging:
     level:
       com.swp391.EV.service: DEBUG
       org.springframework.security: DEBUG
   ```
