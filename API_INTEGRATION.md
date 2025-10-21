# API Integration Summary

## ✅ Hoàn Thành

### 1. API Services Created
- ✅ `api.ts` - Axios instance với interceptors
- ✅ `authService.ts` - Authentication API
- ✅ `appointmentService.ts` - Quản lý lịch hẹn
- ✅ `customerService.ts` - Quản lý khách hàng
- ✅ `vehicleService.ts` - Quản lý xe
- ✅ `servicePackageService.ts` - Quản lý gói dịch vụ
- ✅ `serviceCenterService.ts` - Quản lý trung tâm dịch vụ
- ✅ `maintenanceHistoryService.ts` - Lịch sử bảo dưỡng
- ✅ `userService.ts` - Quản lý người dùng
- ✅ `staffService.ts` - Quản lý nhân viên
- ✅ `serviceOrderService.ts` - Quản lý đơn dịch vụ

### 2. Mock Data Removed
- ✅ Xóa `mockAuth.ts`
- ✅ Xóa `mockData.ts`

### 3. Auth Integration
- ✅ Cập nhật `AuthContext.tsx` để sử dụng `authService`
- ✅ Cập nhật `LoginPage.tsx` - Chỉ giữ demo accounts để hiển thị

### 4. Environment Configuration
- ✅ Tạo `.env` với `REACT_APP_API_URL=http://localhost:8080/api`
- ✅ Tạo `.env.example` 
- ✅ Cập nhật `.gitignore` để exclude `.env`

### 5. Type Updates
- ✅ Cập nhật `User` interface - `phone` thành optional

## ⚠️ Cần Fix Manually

### Components cần cập nhật properties để phù hợp với API response:

#### 1. `AppointmentManagement.tsx` (Staff)
Đã cập nhật cơ bản nhưng API response structure khác với mock data:
- API: `appointmentDate`, `serviceCenterName`, `servicePackageName`
- Mock: `scheduledDate`, `scheduledTime`, `vehicleModel`, `licensePlate`, `serviceType`, `technicianName`

#### 2. `CustomerManagement.tsx` (Staff)
API response structure:
- API: `firstName`, `lastName`, `userId`
- Mock: `name`, `vehicles[]`, `totalServices`, `lastServiceDate`, `registeredDate`, `notes`

**Giải pháp:**
- Cần gọi thêm API để lấy vehicles của customer
- Có thể lấy `totalServices` từ appointments
- `registeredDate` có thể dùng `createdAt`

## 📝 Lưu ý khi chạy

1. **Backend phải chạy trước** trên `http://localhost:8080`
2. **CORS** phải được config ở backend để cho phép origin từ `http://localhost:3000`
3. **Token** được lưu trong `localStorage` với key `accessToken`
4. **Auto refresh** token chưa implement - cần thêm sau

## 🔧 Cách sử dụng các Service

### Authentication
```typescript
import authService from './services/authService';

// Login
const response = await authService.login({ email, password });
// response.token và response.user đã được lưu vào localStorage

// Logout
await authService.logout();

// Get current user
const user = await authService.getCurrentUser();
```

### Appointments
```typescript
import appointmentService from './services/appointmentService';

// Get all appointments
const { appointments } = await appointmentService.getAllAppointments();

// Get my appointments (customer)
const { appointments } = await appointmentService.getMyAppointments();

// Create appointment
const appointment = await appointmentService.createAppointment({
  vehicleId,
  serviceCenterId,
  servicePackageId,
  appointmentDate: '2025-10-20T10:00:00'
});
```

### Customers
```typescript
import customerService from './services/customerService';

// Get all customers (staff/admin)
const customers = await customerService.getAllCustomers();

// Get my profile (customer)
const profile = await customerService.getMyProfile();
```

### Vehicles
```typescript
import vehicleService from './services/vehicleService';

// Get my vehicles (customer)
const vehicles = await vehicleService.getMyVehicles();

// Register new vehicle
const vehicle = await vehicleService.registerMyVehicle(vehicleData);
```

## 🚀 Next Steps

1. ✅ Tạo tất cả API service files
2. ✅ Xóa mock data files
3. ✅ Cập nhật AuthContext
4. ⚠️ Cập nhật các component để phù hợp với API response structure
5. 🔄 Test với backend thật
6. 🔄 Handle error cases tốt hơn
7. 🔄 Add loading states
8. 🔄 Add success/error notifications

## 📚 API Documentation cần tham khảo

Backend API base URL: `http://localhost:8080/api`

Các endpoints chính:
- `/auth/login` - POST - Đăng nhập
- `/auth/logout` - POST - Đăng xuất  
- `/appointments` - GET/POST - Quản lý lịch hẹn
- `/appointments/me` - GET - Lịch hẹn của tôi
- `/customers` - GET - Danh sách khách hàng
- `/customers/me` - GET - Profile của tôi
- `/vehicles` - GET/POST - Quản lý xe
- `/vehicles/me` - GET - Xe của tôi
- `/service-packages` - GET - Danh sách gói dịch vụ
- `/service-centers` - GET - Danh sách trung tâm
- `/maintenance-history` - GET - Lịch sử bảo dưỡng
