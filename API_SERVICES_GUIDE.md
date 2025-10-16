# API Services Documentation

## Tổng quan

Tất cả các API services đã được tạo để kết nối frontend với backend Spring Boot. Các services được tổ chức theo từng module chức năng.

## Cấu trúc Services

```
src/services/
├── api.ts                      # Cấu hình axios base
├── authService.ts              # Authentication (đăng nhập, đăng xuất, quên mật khẩu)
├── userService.ts              # Quản lý users
├── customerService.ts          # Quản lý customers
├── vehicleService.ts           # Quản lý vehicles (xe)
├── appointmentService.ts       # Quản lý appointments (lịch hẹn)
├── serviceOrderService.ts      # Quản lý service orders (đơn dịch vụ)
├── serviceCenterService.ts     # Quản lý service centers
├── index.ts                    # Export tất cả services
└── mockAuth.ts                 # Mock data (có thể xóa khi dùng API thật)
```

## Cấu hình

### 1. Cài đặt axios (đã tạo sẵn)
```bash
npm install axios
```

### 2. Cấu hình API URL trong file `.env`
```env
REACT_APP_API_URL=http://localhost:8080/api
```

## Cách sử dụng

### Import services

```typescript
import { 
  authService, 
  userService, 
  customerService, 
  vehicleService, 
  appointmentService,
  serviceOrderService,
  serviceCenterService 
} from '../services';
```

### 1. Authentication Service (`authService`)

#### Đăng nhập
```typescript
try {
  const response = await authService.login({
    email: 'customer@evservice.vn',
    password: '123456'
  });
  
  console.log('Login successful:', response.user);
  // Token đã được lưu tự động vào localStorage
} catch (error) {
  console.error('Login failed:', error);
}
```

#### Đăng xuất
```typescript
await authService.logout();
```

#### Quên mật khẩu
```typescript
// Bước 1: Gửi OTP qua email
await authService.forgotPassword({ email: 'user@example.com' });

// Bước 2: Xác thực OTP
await authService.verifyOtp({ email: 'user@example.com', otp: '123456' });

// Bước 3: Đặt lại mật khẩu
await authService.resetPassword({
  email: 'user@example.com',
  otp: '123456',
  newPassword: 'newPassword123'
});
```

#### Lấy thông tin user hiện tại
```typescript
const currentUser = await authService.getCurrentUser();
```

#### Kiểm tra đăng nhập
```typescript
const isLoggedIn = authService.isAuthenticated();
const user = authService.getUser();
const token = authService.getToken();
```

### 2. User Service (`userService`)

#### Đăng ký tài khoản
```typescript
const newUser = await userService.register({
  email: 'newuser@example.com',
  password: 'password123',
  firstName: 'Nguyễn',
  lastName: 'Văn A',
  phone: '0987654321'
});
```

#### Lấy danh sách users (admin)
```typescript
const users = await userService.getAllUsers({
  page: 0,
  size: 10,
  role: 'CUSTOMER',
  search: 'nguyen'
});
```

#### Lấy thông tin user theo ID
```typescript
const user = await userService.getUserById('userId');
```

#### Cập nhật user
```typescript
await userService.updateUser('userId', {
  firstName: 'Nguyễn',
  lastName: 'Văn B',
  phone: '0912345678'
});
```

#### Cập nhật role (admin)
```typescript
await userService.updateUserRole('userId', { role: 'STAFF' });
```

#### Xóa user (admin)
```typescript
await userService.deleteUser('userId');
```

### 3. Customer Service (`customerService`)

#### Lấy danh sách khách hàng
```typescript
const customers = await customerService.getAllCustomers({
  page: 0,
  size: 10,
  search: 'nguyen'
});
```

#### Tạo khách hàng mới
```typescript
const newCustomer = await customerService.createCustomer({
  userId: 'userId',
  firstName: 'Nguyễn',
  lastName: 'Văn A',
  email: 'customer@example.com',
  phone: '0987654321',
  address: 'Hà Nội'
});
```

#### Lấy hồ sơ của tôi (customer)
```typescript
const myProfile = await customerService.getMyProfile();
```

#### Cập nhật hồ sơ của tôi
```typescript
await customerService.updateMyProfile({
  firstName: 'Nguyễn',
  lastName: 'Văn B',
  phone: '0912345678',
  address: 'Hồ Chí Minh'
});
```

### 4. Vehicle Service (`vehicleService`)

#### Tìm kiếm xe
```typescript
const vehicles = await vehicleService.searchVehicles({
  page: 0,
  size: 10,
  manufacturer: 'VinFast',
  model: 'VF8'
});
```

#### Thêm xe mới
```typescript
const newVehicle = await vehicleService.createVehicle({
  customerId: 'customerId',
  model: 'VF8',
  manufacturer: 'VinFast',
  year: 2024,
  licensePlate: '30A-12345',
  color: 'Đỏ',
  mileage: 5000
});
```

#### Lấy xe của tôi (customer)
```typescript
const myVehicles = await vehicleService.getMyVehicles();
```

#### Đăng ký xe mới (customer)
```typescript
const myNewVehicle = await vehicleService.registerMyVehicle({
  model: 'VF9',
  manufacturer: 'VinFast',
  year: 2024,
  licensePlate: '30B-67890',
  color: 'Trắng'
});
```

#### Cập nhật thông tin xe
```typescript
await vehicleService.updateVehicle('vehicleId', {
  mileage: 10000,
  lastMaintenanceDate: new Date()
});
```

### 5. Appointment Service (`appointmentService`)

#### Lấy khung giờ trống
```typescript
const availableSlots = await appointmentService.getAvailableSlots({
  serviceCenterId: 'centerId',
  date: '2024-10-15',
  serviceType: 'Bảo dưỡng định kỳ'
});
```

#### Đặt lịch hẹn
```typescript
const appointment = await appointmentService.createAppointment({
  vehicleId: 'vehicleId',
  serviceCenterId: 'centerId',
  appointmentDate: '2024-10-15',
  appointmentTime: '09:00',
  serviceType: 'Bảo dưỡng định kỳ',
  notes: 'Xe có tiếng kêu lạ'
});
```

#### Lấy lịch hẹn của tôi
```typescript
const myAppointments = await appointmentService.getMyAppointments({
  page: 0,
  size: 10,
  status: 'CONFIRMED'
});
```

#### Cập nhật lịch hẹn
```typescript
await appointmentService.updateAppointment('appointmentId', {
  appointmentDate: '2024-10-16',
  appointmentTime: '14:00'
});
```

#### Hủy lịch hẹn
```typescript
await appointmentService.cancelAppointment('appointmentId');
```

### 6. Service Order Service (`serviceOrderService`)

#### Tạo đơn dịch vụ
```typescript
const serviceOrder = await serviceOrderService.createServiceOrder({
  customerId: 'customerId',
  vehicleId: 'vehicleId',
  serviceCenterId: 'centerId',
  serviceType: 'Sửa chữa',
  description: 'Thay lốp xe'
});
```

#### Lấy danh sách đơn dịch vụ
```typescript
const orders = await serviceOrderService.getAllServiceOrders({
  page: 0,
  size: 10,
  status: 'IN_PROGRESS'
});
```

#### Phân công thợ
```typescript
await serviceOrderService.assignTechnician('orderId', {
  technicianId: 'technicianId'
});
```

#### Cập nhật trạng thái
```typescript
await serviceOrderService.updateStatus('orderId', {
  status: 'COMPLETED',
  notes: 'Đã hoàn thành'
});
```

#### Lấy công việc được giao (technician)
```typescript
const myAssignments = await serviceOrderService.getMyAssignments({
  page: 0,
  size: 10,
  status: 'IN_PROGRESS'
});
```

#### Cập nhật chi tiết đơn dịch vụ
```typescript
await serviceOrderService.updateServiceOrder('orderId', {
  diagnosis: 'Lốp xe bị mòn',
  partsUsed: ['Lốp xe VinFast VF8 - 4 chiếc'],
  laborCost: 500000,
  partsCost: 8000000,
  totalCost: 8500000
});
```

### 7. Service Center Service (`serviceCenterService`)

#### Lấy danh sách trung tâm dịch vụ
```typescript
const centers = await serviceCenterService.getAllServiceCenters({
  page: 0,
  size: 10,
  city: 'Hà Nội',
  isActive: true
});
```

#### Tạo trung tâm dịch vụ (admin)
```typescript
const newCenter = await serviceCenterService.createServiceCenter({
  name: 'Trung tâm VinFast Hà Nội',
  address: '123 Phố Huế',
  city: 'Hà Nội',
  district: 'Hai Bà Trưng',
  phone: '0241234567',
  email: 'hanoi@vinfast.vn',
  workingHours: {
    monday: '08:00 - 18:00',
    tuesday: '08:00 - 18:00',
    wednesday: '08:00 - 18:00',
    thursday: '08:00 - 18:00',
    friday: '08:00 - 18:00',
    saturday: '08:00 - 17:00',
    sunday: 'Closed'
  },
  services: ['Bảo dưỡng', 'Sửa chữa', 'Thay thế phụ tùng']
});
```

## Xử lý lỗi

Tất cả các services đều throw error khi có lỗi xảy ra. Sử dụng try-catch để xử lý:

```typescript
import { getErrorMessage } from '../services';

try {
  await authService.login({ email, password });
} catch (error) {
  const errorMessage = getErrorMessage(error);
  console.error('Error:', errorMessage);
  // Hiển thị thông báo lỗi cho user
}
```

## Ví dụ Component React

### Login Component
```typescript
import React, { useState } from 'react';
import { authService, getErrorMessage } from '../services';

const LoginComponent: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await authService.login({ email, password });
      console.log('Login successful:', response.user);
      // Redirect to dashboard
      window.location.href = '/dashboard';
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <input 
        type="email" 
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />
      <input 
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Mật khẩu"
        required
      />
      {error && <div className="error">{error}</div>}
      <button type="submit" disabled={loading}>
        {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
      </button>
    </form>
  );
};
```

### Vehicle List Component
```typescript
import React, { useEffect, useState } from 'react';
import { vehicleService, Vehicle, getErrorMessage } from '../services';

const VehicleList: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadVehicles();
  }, []);

  const loadVehicles = async () => {
    try {
      const myVehicles = await vehicleService.getMyVehicles();
      setVehicles(myVehicles);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Đang tải...</div>;
  if (error) return <div>Lỗi: {error}</div>;

  return (
    <div>
      <h2>Xe của tôi</h2>
      {vehicles.map(vehicle => (
        <div key={vehicle.id}>
          <h3>{vehicle.manufacturer} {vehicle.model}</h3>
          <p>Biển số: {vehicle.licensePlate}</p>
          <p>Năm: {vehicle.year}</p>
        </div>
      ))}
    </div>
  );
};
```

## Lưu ý quan trọng

1. **Token được lưu tự động**: Khi đăng nhập thành công, token sẽ được lưu vào localStorage và tự động gửi trong mọi request.

2. **Xử lý 401 Unauthorized**: Khi token hết hạn, user sẽ tự động được redirect về trang login.

3. **CORS**: Backend đã cấu hình CORS cho `http://localhost:3000`, `http://localhost:3001`, `http://localhost:3002`.

4. **Environment Variables**: Đảm bảo file `.env` có `REACT_APP_API_URL` trỏ đúng địa chỉ backend.

5. **TypeScript**: Tất cả services đều có type definitions đầy đủ để hỗ trợ autocomplete và type checking.

## API Endpoints Mapping

| Service | Method | Frontend Service | Backend Endpoint |
|---------|--------|-----------------|------------------|
| Auth | POST | `authService.login()` | `/api/auth/login` |
| Auth | POST | `authService.logout()` | `/api/auth/logout` |
| Auth | POST | `authService.forgotPassword()` | `/api/auth/forgot-password` |
| Auth | POST | `authService.verifyOtp()` | `/api/auth/verify-otp` |
| Auth | POST | `authService.resetPassword()` | `/api/auth/reset-password` |
| Auth | GET | `authService.getCurrentUser()` | `/api/auth/me` |
| User | POST | `userService.register()` | `/api/users/register` |
| User | GET | `userService.getAllUsers()` | `/api/users/user` |
| User | GET | `userService.getUserById()` | `/api/users/user/{id}` |
| User | PUT | `userService.updateUser()` | `/api/users/user/{id}` |
| User | PATCH | `userService.updateUserRole()` | `/api/users/user/{id}/role` |
| User | DELETE | `userService.deleteUser()` | `/api/users/user/{id}` |
| Customer | GET | `customerService.getAllCustomers()` | `/api/customers` |
| Customer | POST | `customerService.createCustomer()` | `/api/customers` |
| Customer | GET | `customerService.getCustomerById()` | `/api/customers/{id}` |
| Customer | PUT | `customerService.updateCustomer()` | `/api/customers/{id}` |
| Customer | GET | `customerService.getMyProfile()` | `/api/customers/me` |
| Customer | PUT | `customerService.updateMyProfile()` | `/api/customers/me` |
| Vehicle | GET | `vehicleService.searchVehicles()` | `/api/vehicles` |
| Vehicle | POST | `vehicleService.createVehicle()` | `/api/vehicles` |
| Vehicle | GET | `vehicleService.getVehicleById()` | `/api/vehicles/{id}` |
| Vehicle | PUT | `vehicleService.updateVehicle()` | `/api/vehicles/{id}` |
| Vehicle | DELETE | `vehicleService.deleteVehicle()` | `/api/vehicles/{id}` |
| Vehicle | GET | `vehicleService.getVehiclesByCustomerId()` | `/api/vehicles/customers/{customerId}` |
| Vehicle | POST | `vehicleService.createVehicleForCustomer()` | `/api/vehicles/customers/{customerId}` |
| Vehicle | GET | `vehicleService.getMyVehicles()` | `/api/vehicles/me` |
| Vehicle | POST | `vehicleService.registerMyVehicle()` | `/api/vehicles/me` |
| Appointment | GET | `appointmentService.getAllAppointments()` | `/api/appointments` |
| Appointment | POST | `appointmentService.createAppointment()` | `/api/appointments` |
| Appointment | GET | `appointmentService.getAppointmentById()` | `/api/appointments/{id}` |
| Appointment | PUT | `appointmentService.updateAppointment()` | `/api/appointments/{id}` |
| Appointment | DELETE | `appointmentService.cancelAppointment()` | `/api/appointments/{id}` |
| Appointment | GET | `appointmentService.getMyAppointments()` | `/api/appointments/me` |
| Appointment | GET | `appointmentService.getAvailableSlots()` | `/api/appointments/available` |
| Service Order | GET | `serviceOrderService.getAllServiceOrders()` | `/api/service-orders` |
| Service Order | POST | `serviceOrderService.createServiceOrder()` | `/api/service-orders` |
| Service Order | GET | `serviceOrderService.getServiceOrderById()` | `/api/service-orders/{id}` |
| Service Order | PUT | `serviceOrderService.updateServiceOrder()` | `/api/service-orders/{id}` |
| Service Order | PUT | `serviceOrderService.assignTechnician()` | `/api/service-orders/{id}/assign` |
| Service Order | PUT | `serviceOrderService.updateStatus()` | `/api/service-orders/{id}/status` |
| Service Order | GET | `serviceOrderService.getMyAssignments()` | `/api/service-orders/my-assignments` |
| Service Center | GET | `serviceCenterService.getAllServiceCenters()` | `/api/service-centers` |
| Service Center | POST | `serviceCenterService.createServiceCenter()` | `/api/service-centers` |
| Service Center | GET | `serviceCenterService.getServiceCenterById()` | `/api/service-centers/{id}` |
| Service Center | PUT | `serviceCenterService.updateServiceCenter()` | `/api/service-centers/{id}` |
| Service Center | DELETE | `serviceCenterService.deleteServiceCenter()` | `/api/service-centers/{id}` |

## Testing với Mock Data

Để test mà chưa cần backend chạy, bạn có thể tạm thời comment axios call và return mock data:

```typescript
// Ví dụ trong vehicleService.ts
async getMyVehicles(): Promise<Vehicle[]> {
  // return (await api.get('/vehicles/me')).data;
  
  // Mock data for testing
  return [
    {
      id: '1',
      customerId: '1',
      model: 'VF8',
      manufacturer: 'VinFast',
      year: 2024,
      licensePlate: '30A-12345',
      color: 'Đỏ',
      mileage: 5000
    }
  ];
}
```

Sau khi backend sẵn sàng, uncomment axios call và xóa mock data.
