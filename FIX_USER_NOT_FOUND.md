# 🔧 Fix: Lỗi "Không tìm thấy người dùng" khi đặt lịch

## 🐛 Nguyên nhân lỗi

### Vấn đề:
Backend trả về lỗi **"USER_NOT_EXISTED"** (ErrorCode 1000) khi tạo appointment.

### Root Cause:
Frontend đang gửi **userId** thay vì **customerId** trong request:
- `userId` = ID từ bảng `users` (UUID của tài khoản đăng nhập)
- `customerId` = ID từ bảng `customers` (UUID của hồ sơ khách hàng)

**Ví dụ:**
- `userId` = `eab97d81-2ef2-4c4e-b85a-c61f77c1bd87` (từ JWT token)
- `customerId` = `6736a155-b5a3-43b0-94c6-9313cd000ff2` (từ customer table)

Backend `AppointmentService.createAppointment()` tìm kiếm trong bảng `customers` với userId → không tìm thấy → throw `USER_NOT_EXISTED`.

## ✅ Giải pháp

### 1. Thêm state customerId trong AppointmentBooking
```typescript
const [customerId, setCustomerId] = useState<string | null>(null);
```

### 2. Load customer profile để lấy customerId
```typescript
const loadCustomerProfile = async () => {
  if (!user?.id) {
    console.log('⚠️ No user ID, cannot load customer profile');
    return;
  }
  
  try {
    console.log('👤 Loading customer profile for user:', user.id);
    const customer = await customerService.getMyProfile();
    console.log('✅ Customer profile loaded:', customer);
    setCustomerId(customer.id);
  } catch (error) {
    console.error('❌ Error loading customer profile:', error);
    setCustomerId(user?.id || null);
  }
};
```

### 3. Sử dụng customerId trong handleSubmit()
```typescript
const createRequest = {
  customerId: customerId, // ✅ Use customerId from customer profile
  vehicleId: selectedVehicle.id,
  serviceCenterId: selectedCenter.id,
  servicePackageId: selectedPackages[0].id,
  appointmentDate: appointmentDateTime.toISOString(),
  notes: formData.notes
};
```

## 📋 Các bước test

### Bước 1: Hard Refresh Frontend
```
Ctrl + Shift + R
```

### Bước 2: Kiểm tra Console Logs

**Frontend Console:**
```
👤 Loading customer profile for user: eab97d81-2ef2-4c4e-b85a-c61f77c1bd87
✅ Customer profile loaded: {id: "6736a155-b5a3-43b0-94c6-9313cd000ff2", ...}
```

**Khi submit:**
```
👤 Customer ID: 6736a155-b5a3-43b0-94c6-9313cd000ff2  ← ✅ Đây là customerId!
```

**Backend Console:**
```
✅ [AppointmentService] Found customer: khang  ← ✅ Tìm thấy!
```

## 🔗 Relationship

```
userId (JWT) → Customer Profile API → customerId → Appointment
```

## 📝 Tóm tắt

### Trước: ❌
```typescript
customerId: user?.id  // userId, KHÔNG PHẢI customerId
```

### Sau: ✅
```typescript
customerId: customerId  // customerId từ customer profile API
```
