# 🚗 Hướng dẫn Lưu và Hiển thị Ảnh Xe

## 📌 Tổng quan

Hệ thống lưu ảnh xe trong **database** thông qua bảng `vehicle_models`. Mỗi model xe (VinFast VF 8, Tesla Model 3...) sẽ có một URL ảnh riêng, và tất cả các xe thuộc model đó sẽ hiển thị cùng ảnh.

## 🗂️ Cấu trúc Database

```sql
vehicle_models
├── id (UUID)
├── manufacturer (VARCHAR) - VinFast, Tesla, BYD...
├── model (VARCHAR) - VF 8, Model 3...
├── year (INTEGER)
├── battery_capacity (DECIMAL)
├── range_km (INTEGER)
├── image_url (VARCHAR) ⭐ - URL ảnh xe
└── created_at (TIMESTAMP)

vehicles
├── id (UUID)
├── customer_id (UUID)
├── vehicle_model_id (UUID) -> vehicle_models.id
├── vin (VARCHAR)
├── license_plate (VARCHAR)
├── color (VARCHAR)
└── ...
```

## 🔄 Luồng dữ liệu

```
vehicle_models.image_url (Database)
        ↓
VehicleModel entity (Backend)
        ↓
VehicleResponse DTO (Backend API)
        ↓
Vehicle type (Frontend)
        ↓
<img src={vehicle.imageUrl} /> (UI)
```

## 📝 Các thay đổi đã thực hiện

### Backend (Java Spring Boot)

#### 1. **VehicleModel.java** - Thêm field imageUrl
```java
@Column(name = "image_url", length = 500)
private String imageUrl;
```

#### 2. **VehicleModelResponse.java** - Expose imageUrl qua API
```java
private String imageUrl;
```

#### 3. **VehicleResponse.java** - Include imageUrl trong Vehicle API
```java
private String imageUrl; // URL ảnh xe từ VehicleModel
```

#### 4. **VehicleService.java** - Map imageUrl trong convertToResponse
```java
if (vehicle.getVehicleModel() != null) {
    // ... other fields
    response.setImageUrl(vehicle.getVehicleModel().getImageUrl());
}
```

### Frontend (React + TypeScript)

#### 1. **types/index.ts** - Thêm imageUrl vào Vehicle interface
```typescript
export interface Vehicle {
  // ... existing fields
  imageUrl?: string; // URL ảnh xe từ database
}
```

#### 2. **VehicleManagement.tsx** - Sử dụng imageUrl từ API
```typescript
const getVehicleImage = (vehicle: Vehicle) => {
  // Ưu tiên lấy ảnh từ database
  if (vehicle.imageUrl) {
    return vehicle.imageUrl;
  }
  
  // Fallback nếu chưa có ảnh trong DB
  return '/assets/images/vehicles/default-ev.png';
};
```

### Database Migration

#### **add_vehicle_images.sql** - Script update ảnh cho các model xe
```sql
-- Thêm cột image_url
ALTER TABLE vehicle_models 
ADD COLUMN IF NOT EXISTS image_url VARCHAR(500);

-- Update ảnh cho từng model
UPDATE vehicle_models 
SET image_url = '/assets/images/vehicles/vinfast-vf8.png'
WHERE manufacturer = 'VinFast' AND model = 'VF 8';
```

## 🚀 Cách sử dụng

### Bước 1: Chuẩn bị ảnh

1. Tải ảnh xe về (hoặc tạo từ AI)
2. Đổi tên theo format: `{manufacturer}-{model}.png`
   - Ví dụ: `vinfast-vf8.png`, `tesla-model3.png`
3. Đặt vào thư mục: `public/assets/images/vehicles/`

### Bước 2: Chạy migration database

```bash
# Kết nối PostgreSQL
psql -U postgres -d EVService

# Chạy migration
\i database/add_vehicle_images.sql
```

### Bước 3: Restart Backend

```bash
cd EV-Service-Center-Maintenance-Management-System---BE
mvn spring-boot:run
```

### Bước 4: Test Frontend

```bash
cd EV-Service-Center-Maintenance-Management-System---FE
npm start
```

Truy cập: http://localhost:3000/customer/vehicles

## ✅ Kết quả mong đợi

- ✅ Mỗi xe hiển thị ảnh từ database (`vehicle.imageUrl`)
- ✅ Nếu chưa có ảnh trong DB, hiển thị ảnh mặc định
- ✅ Ảnh được quản lý tập trung ở bảng `vehicle_models`
- ✅ Dễ dàng update ảnh cho tất cả xe cùng model

## 🔧 Thêm ảnh cho model xe mới

### Cách 1: Qua SQL
```sql
UPDATE vehicle_models 
SET image_url = '/assets/images/vehicles/new-car.png'
WHERE manufacturer = 'Brand' AND model = 'Model Name';
```

### Cách 2: Qua API (nếu có endpoint update)
```bash
PATCH /api/v1/vehicle-models/{id}
{
  "imageUrl": "/assets/images/vehicles/new-car.png"
}
```

## 📂 Cấu trúc thư mục ảnh khuyến nghị

```
public/assets/images/vehicles/
├── vinfast-vf8.png
├── vinfast-vf9.png
├── vinfast-vf5.png
├── tesla-model3.png
├── tesla-modely.png
├── byd-atto3.png
├── hyundai-ioniq5.png
└── default-ev.png (ảnh mặc định)
```

## 🎨 Quy chuẩn ảnh

- **Kích thước**: 800x600px (4:3) hoặc 1000x750px
- **Format**: PNG với nền trong suốt hoặc WebP
- **Dung lượng**: < 200KB (tối ưu performance)
- **Góc chụp**: 3/4 view phía trước (như ảnh VF8, VF9 hiện tại)
- **Chất lượng**: HD, rõ nét, không bị mờ

## 🐛 Troubleshooting

### Ảnh không hiển thị
1. Kiểm tra URL trong database: `SELECT manufacturer, model, image_url FROM vehicle_models;`
2. Kiểm tra file ảnh tồn tại: `ls public/assets/images/vehicles/`
3. Kiểm tra console log: `vehicle.imageUrl` có giá trị không?

### Ảnh bị lỗi 404
- Đảm bảo đường dẫn bắt đầu bằng `/assets/images/vehicles/`
- File ảnh phải nằm trong thư mục `public/`

### Backend không trả imageUrl
- Kiểm tra `VehicleService.convertToResponse()` đã map `imageUrl` chưa
- Restart backend sau khi thay đổi code

## 📞 Hỗ trợ

Nếu cần hỗ trợ thêm, liên hệ team Backend hoặc Frontend.
