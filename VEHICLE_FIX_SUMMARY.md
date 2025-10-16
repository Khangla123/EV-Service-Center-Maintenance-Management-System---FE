# Sửa lỗi hiển thị xe - Vehicle Display Fix

## Vấn đề
- Trang quản lý xe (`/customer/vehicles`) vẫn hiển thị dữ liệu cứng (2 xe VinFast mock)
- Database đã có dữ liệu xe nhưng không hiển thị lên

## Nguyên nhân
1. **Frontend**: `VehicleManagement.tsx` đang dùng mock data thay vì gọi API
2. **Backend**: `VehicleController.getMyVehicles()` đang dùng `UUID.randomUUID()` (mock) thay vì lấy userId thật từ token
3. **Security**: Endpoint `/api/vehicles/me` được permit (không yêu cầu authentication) nhưng code cần Authentication object
4. **Mapping**: Frontend dùng field `make` nhưng Backend trả về `manufacturer`

## Các thay đổi đã thực hiện

### 1. Backend - VehicleController.java
```java
// ✅ Thêm import
import org.springframework.security.core.Authentication;

// ✅ Sửa getMyVehicles() - lấy userId từ token
@GetMapping("/me")
public ApiResponse<List<VehicleResponse>> getMyVehicles(Authentication authentication) {
    String userIdString = authentication != null ? authentication.getName() : null;
    UUID currentUserId = userIdString != null ? UUID.fromString(userIdString) : null;
    
    List<VehicleResponse> vehicles = vehicleService.getMyVehicles(currentUserId);
    return ApiResponse.<List<VehicleResponse>>builder()
            .message("Danh sách xe của bạn")
            .result(vehicles)
            .build();
}

// ✅ Sửa registerMyVehicle() - lấy userId từ token
@PostMapping("/me")
public ApiResponse<VehicleResponse> registerMyVehicle(
        @RequestBody CreateVehicleRequest request,
        Authentication authentication) {
    String userIdString = authentication != null ? authentication.getName() : null;
    UUID currentUserId = userIdString != null ? UUID.fromString(userIdString) : null;
    
    VehicleResponse response = vehicleService.registerMyVehicle(currentUserId, request);
    return ApiResponse.<VehicleResponse>builder()
            .message("Đăng ký xe thành công")
            .result(response)
            .build();
}
```

### 2. Backend - SecurityConfig.java
```java
// ✅ Xóa permitAll cho /api/vehicles/me (cần authentication)
// VehicleController
.requestMatchers(HttpMethod.GET, "/api/vehicles").permitAll()
.requestMatchers(HttpMethod.POST, "/api/vehicles").permitAll()
// ... các endpoint khác ...
// NOTE: /api/vehicles/me cần authentication để lấy userId từ token
// .requestMatchers(HttpMethod.GET, "/api/vehicles/me").permitAll() // REMOVED
// .requestMatchers(HttpMethod.POST, "/api/vehicles/me").permitAll() // REMOVED
```

### 3. Frontend - VehicleManagement.tsx
```typescript
// ✅ Thêm import vehicleService
import { vehicleService } from '../../../services';

// ✅ Thay thế mock data bằng API call
useEffect(() => {
  const loadVehicles = async () => {
    setLoading(true);
    try {
      const response = await vehicleService.getMyVehicles();
      
      // Map backend response to frontend type
      const mappedVehicles: Vehicle[] = response.map((vehicle: any) => ({
        id: vehicle.id,
        customerId: vehicle.customerId,
        make: vehicle.manufacturer, // ✅ BE: manufacturer -> FE: make
        model: vehicle.model,
        year: vehicle.year,
        vin: vehicle.vin,
        licensePlate: vehicle.licensePlate,
        color: vehicle.color || 'Không rõ',
        batteryCapacity: vehicle.batteryCapacity || 0,
        mileage: vehicle.mileage || 0,
        purchaseDate: new Date(vehicle.purchaseDate),
        warrantyExpiration: new Date(new Date(vehicle.purchaseDate).setFullYear(
          new Date(vehicle.purchaseDate).getFullYear() + 3
        )), // Default 3 years warranty
        createdAt: new Date(vehicle.createdAt),
        updatedAt: new Date(vehicle.updatedAt)
      }));
      
      setVehicles(mappedVehicles);
    } catch (error) {
      console.error('Error loading vehicles:', error);
      setVehicles([]);
    } finally {
      setLoading(false);
    }
  };

  loadVehicles();
}, [user]);
```

## Luồng hoạt động mới

```
User truy cập /customer/vehicles
    ↓
VehicleManagement.tsx load
    ↓
useEffect gọi vehicleService.getMyVehicles()
    ↓
api.get('/vehicles/me') với Authorization header (Bearer token)
    ↓
Backend: SecurityConfig yêu cầu authentication cho /api/vehicles/me
    ↓
Backend: VehicleController.getMyVehicles(Authentication auth)
    ↓
Lấy userId từ authentication.getName()
    ↓
VehicleService.getMyVehicles(userId)
    ↓
Tìm Customer theo userId
    ↓
Lấy danh sách Vehicle của Customer
    ↓
Map Vehicle entity -> VehicleResponse
    ↓
Trả về { message: "...", result: [VehicleResponse] }
    ↓
Frontend map response:
  - manufacturer -> make
  - Tính warrantyExpiration = purchaseDate + 3 years
    ↓
Hiển thị danh sách xe lên UI
```

## Cách test

### Bước 1: Kiểm tra database có dữ liệu xe
```sql
-- Kiểm tra có user và customer không
SELECT u.id, u.email, u.full_name, c.id as customer_id
FROM users u
LEFT JOIN customers c ON c.user_id = u.id;

-- Kiểm tra có xe không
SELECT v.id, v.vin, v.license_plate, v.color, 
       vm.manufacturer, vm.model, vm.year,
       c.full_name as owner
FROM vehicles v
JOIN customers c ON v.customer_id = c.id
JOIN vehicle_models vm ON v.vehicle_model_id = vm.id
WHERE v.is_active = true;
```

### Bước 2: Restart backend
```bash
cd c:\FPT\SWP2\EV-Service-Center-Maintenance-Management-System---BE
.\mvnw spring-boot:run
```

### Bước 3: Test với user có xe
1. Đăng nhập với tài khoản có dữ liệu xe trong database
2. Vào trang `/customer/vehicles`
3. Kiểm tra Console (F12):
   ```
   Loading vehicles from API...
   Vehicles loaded: [...]
   ```
4. Trang sẽ hiển thị xe từ database thay vì 2 xe VinFast mock

### Bước 4: Test với user không có xe
1. Đăng nhập với tài khoản mới (không có xe)
2. Vào trang `/customer/vehicles`
3. Sẽ hiển thị empty state: "Chưa có xe nào"

### Bước 5: Kiểm tra API trực tiếp
```javascript
// Mở Console (F12) khi đã đăng nhập
fetch('http://localhost:8080/api/vehicles/me', {
  headers: {
    'Authorization': 'Bearer ' + localStorage.getItem('accessToken')
  }
})
.then(r => r.json())
.then(console.log);
```

Kết quả mong đợi:
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
      "vin": "...",
      "licensePlate": "30A-123.45",
      "color": "Đen",
      "batteryCapacity": 87.7,
      "mileage": 14800,
      "purchaseDate": "2023-05-15",
      ...
    }
  ]
}
```

## Field mapping giữa Backend và Frontend

| Backend (VehicleResponse) | Frontend (Vehicle) | Ghi chú |
|--------------------------|-------------------|---------|
| `manufacturer` | `make` | Hãng xe |
| `model` | `model` | Model xe |
| `year` | `year` | Năm sản xuất |
| `batteryCapacity` | `batteryCapacity` | Dung lượng pin (kWh) |
| `mileage` | `mileage` | Số km đã đi |
| `purchaseDate` | `purchaseDate` | Ngày mua xe |
| ❌ Not in BE | `warrantyExpiration` | Frontend tính: purchaseDate + 3 years |
| `vin` | `vin` | Số VIN |
| `licensePlate` | `licensePlate` | Biển số xe |
| `color` | `color` | Màu xe |
| `createdAt` | `createdAt` | Ngày tạo |
| `updatedAt` | `updatedAt` | Ngày cập nhật |

## Lưu ý quan trọng

1. **Authentication required**: Endpoint `/api/vehicles/me` bây giờ **YÊU CẦU** token. Nếu không có token hoặc token hết hạn, sẽ trả về 401 Unauthorized.

2. **Warranty calculation**: Backend không có field `warrantyExpiration`, frontend tính toán bằng cách cộng 3 năm vào `purchaseDate`.

3. **Error handling**: Nếu API lỗi, trang sẽ hiển thị empty state thay vì crash.

4. **Console logging**: Code có logging để debug, có thể xóa sau khi test xong:
   ```typescript
   console.log('Loading vehicles from API...');
   console.log('Vehicles loaded:', response);
   ```

## Các trang đã được cập nhật

✅ **AppointmentBooking.tsx** - Đã xóa mock data cho service centers, service packages, vehicles
✅ **VehicleManagement.tsx** - Đã xóa mock data cho vehicles, dùng API

## Next steps (nếu cần)

1. [ ] Thêm field `warrantyExpiration` vào backend (Vehicle model + VehicleResponse)
2. [ ] Thêm chức năng thêm/sửa/xóa xe trong VehicleManagement
3. [ ] Thêm chức năng upload ảnh xe
4. [ ] Thêm validation cho VIN (17 ký tự)
5. [ ] Thêm filter/search trong danh sách xe
