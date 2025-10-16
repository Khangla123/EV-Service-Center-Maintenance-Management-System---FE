# ✅ Hướng dẫn Test Appointment Booking đã Fix

## 🔧 Các thay đổi đã thực hiện

### Frontend (appointmentService.ts)
✅ Thêm xử lý response format `{message, result}` giống vehicleService
✅ Thêm logging chi tiết cho tất cả API calls:
- `createAppointment()` - Tạo lịch hẹn mới
- `getAllAppointments()` - Lấy danh sách lịch hẹn
- `getMyAppointments()` - Lấy lịch hẹn của tôi
- `getAppointmentById()` - Lấy chi tiết lịch hẹn

### Frontend (AppointmentBooking.tsx)
✅ Thêm logging chi tiết trong `handleSubmit()`:
- Log selected vehicle, packages, form data, service center
- Log request payload trước khi gửi
- Log error response chi tiết (status, data, message)
- Hiển thị error message từ backend thay vì message cố định

### Backend (AppointmentController.java)
✅ Thêm logging chi tiết cho POST `/api/appointments`:
- Log request data
- Log customerId, vehicleId, serviceCenterId, servicePackageId
- Log appointmentDate
- Log appointment ID sau khi tạo thành công

### Backend (AppointmentService.java)
✅ Thêm logging chi tiết trong `createAppointment()`:
- Log mỗi bước tìm kiếm entity (customer, vehicle, service center, service package)
- Log kết quả tìm được (name, license plate, etc.)
- Log trước và sau khi save appointment
- Log appointment ID sau khi save

## 📋 Các bước test

### Bước 1: Restart Backend
**QUAN TRỌNG**: Phải restart backend để apply các thay đổi logging

Trong IntelliJ IDEA:
1. Stop application (nút đỏ vuông)
2. Build → Rebuild Project (hoặc Ctrl+F9)
3. Run 'EvServiceApplication' (Shift+F10)
4. Đợi thấy log: "Tomcat started on port(s): 8080"

### Bước 2: Refresh Frontend
Mở trình duyệt:
1. Vào http://localhost:3000/customer/booking
2. Nhấn Ctrl+Shift+R để hard refresh
3. Mở DevTools (F12) → Console tab

### Bước 3: Thử đặt lịch hẹn

#### 3.1. Chọn thông tin:
- ✅ Chọn xe (từ dropdown hoặc đã chọn trước)
- ✅ Chọn trung tâm dịch vụ
- ✅ Chọn gói dịch vụ (ít nhất 1)
- ✅ Chọn ngày
- ✅ Chọn giờ
- ✅ (Tùy chọn) Nhập ghi chú

#### 3.2. Click "ĐĂNG KÝ" hoặc "ĐẶT LỊCH"

#### 3.3. Kiểm tra Console logs

**Frontend Console (Chrome DevTools):**
```
🎯 [AppointmentBooking] handleSubmit called
📋 Selected vehicle: {id: "...", make: "VinFast", model: "VF8", ...}
📦 Selected packages: [{id: "...", name: "Bảo dưỡng định kỳ", ...}]
📅 Form data: {scheduledDate: "2025-01-15", scheduledTime: "10:00", ...}
🏢 Selected center: {id: "...", name: "VinFast Hà Nội", ...}
📤 [AppointmentBooking] Creating appointment with request: {
  customerId: "...",
  vehicleId: "...",
  serviceCenterId: "...",
  servicePackageId: "...",
  appointmentDate: "2025-01-15T10:00:00.000Z",
  notes: "..."
}
📞 [appointmentService] Creating appointment: {...}
📦 [appointmentService] Raw response: {message: "Đặt lịch hẹn thành công", result: {...}}
✅ [appointmentService] Returning appointment: {id: "...", ...}
✅ [AppointmentBooking] Appointment created successfully: {id: "...", ...}
```

**Backend Console (IntelliJ):**
```
📅 [AppointmentController] POST /appointments called
📋 [AppointmentController] Request: CreateAppointmentRequest(customerId=..., vehicleId=..., ...)
👤 [AppointmentController] CustomerId: 6736a155-b5a3-43b0-94c6-9313cd000ff2
🚗 [AppointmentController] VehicleId: abc123...
🏢 [AppointmentController] ServiceCenterId: def456...
📦 [AppointmentController] ServicePackageId: ghi789...
📅 [AppointmentController] AppointmentDate: 2025-01-15T10:00:00
📅 [AppointmentService] Creating appointment...
👤 [AppointmentService] Finding customer: 6736a155-b5a3-43b0-94c6-9313cd000ff2
✅ [AppointmentService] Found customer: khang
🚗 [AppointmentService] Finding vehicle: abc123...
✅ [AppointmentService] Found vehicle: 30A-123.45
🏢 [AppointmentService] Finding service center: def456...
✅ [AppointmentService] Found service center: VinFast Hà Nội
📦 [AppointmentService] Finding service package: ghi789...
✅ [AppointmentService] Found service package: Bảo dưỡng định kỳ
💾 [AppointmentService] Saving appointment...
✅ [AppointmentService] Appointment saved with ID: xyz789...
✅ [AppointmentController] Appointment created: xyz789...
```

### Bước 4: Kiểm tra kết quả

**Nếu thành công:**
- Frontend redirect sang trang `/appointments/success`
- Hiển thị thông báo thành công với appointment ID
- Backend logs không có error

**Nếu thất bại:**
- Modal alert hiển thị error message
- Frontend console logs:
  ```
  ❌ [AppointmentBooking] Error booking appointment: AxiosError {...}
  ❌ [AppointmentBooking] Error response: {code: 1000, message: "..."}
  ❌ [AppointmentBooking] Error status: 400/404/500
  ```
- Backend console logs sẽ chỉ ra lỗi cụ thể

## 🐛 Các lỗi có thể gặp

### Lỗi 1: 404 Not Found
**Nguyên nhân:**
- Backend chưa khởi động
- URL endpoint không đúng

**Giải pháp:**
- Kiểm tra backend có chạy trên port 8080: `netstat -ano | findstr ":8080"`
- Restart backend trong IntelliJ

### Lỗi 2: 400 Bad Request - "USER_NOT_EXISTED"
**Nguyên nhân:**
- CustomerId không tồn tại trong database
- VehicleId không tồn tại
- ServiceCenterId không tồn tại
- ServicePackageId không tồn tại

**Giải pháp:**
- Kiểm tra backend logs để xem entity nào không tìm thấy
- Verify dữ liệu trong database
- Kiểm tra UUID format có đúng không

### Lỗi 3: 400 Bad Request - "Could not initialize proxy"
**Nguyên nhân:**
- Hibernate lazy loading error (tương tự Vehicle)

**Giải pháp:**
- Thêm `@Transactional` annotation (đã có rồi)
- Thay đổi FetchType.LAZY → EAGER trong ServiceAppointment entity

### Lỗi 4: Validation Error
**Nguyên nhân:**
- Request thiếu field bắt buộc
- Format dữ liệu không đúng (ví dụ: date format)

**Giải pháp:**
- Kiểm tra request payload trong console
- Đảm bảo appointmentDate là ISO string format
- Đảm bảo tất cả UUID đều hợp lệ

### Lỗi 5: CORS Error
**Nguyên nhân:**
- Backend CORS config không cho phép origin

**Giải pháp:**
- Kiểm tra SecurityConfig đã có `http://localhost:3000` trong CORS config
- Restart backend sau khi thay đổi CORS

## 📊 Kiểm tra Database

Nếu appointment tạo thành công, kiểm tra trong database:

```sql
SELECT * FROM service_appointments 
WHERE customer_id = '6736a155-b5a3-43b0-94c6-9313cd000ff2'
ORDER BY created_at DESC
LIMIT 5;
```

Kết quả phải có record mới với:
- status = 'PENDING'
- appointment_date = ngày giờ đã chọn
- notes = ghi chú đã nhập
- customer_id, vehicle_id, service_center_id, service_package_id = UUID đã gửi

## 🎯 Next Steps

Sau khi test thành công:
1. ✅ Test trang "My Appointments" - xem lịch hẹn đã tạo
2. ✅ Test update appointment - thay đổi ngày giờ
3. ✅ Test cancel appointment - hủy lịch hẹn
4. ✅ Remove console.log() nếu không cần debug nữa
