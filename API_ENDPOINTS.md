# API Endpoints Documentation

## Base URL
```
http://localhost:8080/api
```

## Authentication Endpoints (`/api/auth`)
- `POST /auth/login` - Đăng nhập
- `POST /auth/forgot-password` - Quên mật khẩu
- `POST /auth/verify-otp` - Xác thực OTP
- `POST /auth/reset-password` - Đặt lại mật khẩu
- `GET /auth/me` - Lấy thông tin user hiện tại
- `POST /auth/logout` - Đăng xuất

## User Endpoints (`/api/users`)
- `POST /users/register` - Đăng ký tài khoản mới
- `GET /users/user` - Lấy danh sách users
- `GET /users/user/{id}` - Lấy thông tin user theo ID
- `PUT /users/user/{id}` - Cập nhật thông tin user
- `DELETE /users/user/{id}` - Xóa user

## Customer Endpoints (`/api/customers`)
- `GET /customers` - Lấy danh sách customers
- `POST /customers` - Tạo customer mới
- `GET /customers/{id}` - Lấy thông tin customer theo ID
- `PUT /customers/{id}` - Cập nhật thông tin customer
- `GET /customers/me` - Lấy thông tin customer hiện tại
- `PUT /customers/me` - Cập nhật thông tin customer hiện tại

## Vehicle Endpoints (`/api/vehicles`)
- `GET /vehicles` - Lấy danh sách tất cả vehicles
- `POST /vehicles` - Thêm vehicle mới
- `GET /vehicles/{id}` - Lấy thông tin vehicle theo ID
- `PUT /vehicles/{id}` - Cập nhật thông tin vehicle
- `DELETE /vehicles/{id}` - Xóa vehicle
- `GET /vehicles/customers/{customerId}/vehicles` - Lấy danh sách vehicles của customer
- `POST /vehicles/customers/{customerId}/vehicles` - Thêm vehicle cho customer
- `GET /vehicles/me` - Lấy danh sách vehicles của user hiện tại ✅ (Permitted)
- `POST /vehicles/me` - Đăng ký vehicle mới cho user hiện tại

## Service Center Endpoints (`/api/service-centers`)
- `GET /service-centers` - Lấy danh sách trung tâm dịch vụ ✅ (Permitted)
- `POST /service-centers` - Tạo trung tâm dịch vụ mới
- `GET /service-centers/{id}` - Lấy thông tin trung tâm theo ID
- `PUT /service-centers/{id}` - Cập nhật thông tin trung tâm
- `DELETE /service-centers/{id}` - Xóa trung tâm dịch vụ

## Service Package Endpoints (`/api/service-packages`)
- `GET /service-packages` - Lấy danh sách gói dịch vụ ✅ (Permitted)
- `POST /service-packages` - Tạo gói dịch vụ mới
- `GET /service-packages/{id}` - Lấy thông tin gói dịch vụ theo ID
- `PUT /service-packages/{id}` - Cập nhật gói dịch vụ
- `DELETE /service-packages/{id}` - Xóa gói dịch vụ

## Appointment Endpoints (`/api/appointments`)
- `GET /appointments` - Lấy danh sách tất cả appointments
- `POST /appointments` - Đặt lịch hẹn mới ✅ (Permitted)
- `GET /appointments/{id}` - Lấy thông tin appointment theo ID
- `PUT /appointments/{id}` - Cập nhật appointment
- `DELETE /appointments/{id}` - Hủy appointment
- `GET /appointments/me` - Lấy danh sách appointments của user hiện tại
- `GET /appointments/available` - Lấy khung giờ trống

## Service Order Endpoints (`/api/service-orders`)
- `GET /service-orders` - Lấy danh sách tất cả service orders
- `POST /service-orders` - Tạo service order mới
- `GET /service-orders/{id}` - Lấy thông tin service order theo ID
- `PUT /service-orders/{id}` - Cập nhật service order
- `PUT /service-orders/{id}/assign` - Assign technician cho order
- `PUT /service-orders/{id}/status` - Cập nhật trạng thái order
- `GET /service-orders/my-assignments` - Lấy danh sách orders được assign

## Mail Endpoints (`/api/mail`)
- `GET /mail/receive_email` - Nhận email

---

## Response Format

Tất cả API endpoints đều trả về theo format chuẩn:

```json
{
  "message": "Success message",
  "result": { /* data object or array */ }
}
```

## Error Format

```json
{
  "code": "ERROR_CODE",
  "message": "Error message description"
}
```

## Authentication

Hầu hết endpoints yêu cầu JWT token trong header:
```
Authorization: Bearer <token>
```

## Endpoints được phép truy cập công khai (không cần auth):

✅ Các endpoints được đánh dấu ✅ trong danh sách trên
✅ Tất cả auth endpoints (`/api/auth/*`)
✅ User registration (`POST /api/users/register`)
✅ Swagger/API docs (`/api/swagger-ui/**`, `/api/v1/api-docs/**`)
