# Hướng dẫn Setup Ảnh Xe (Vehicle Images)

## 📁 Cấu trúc thư mục ảnh

Tất cả ảnh xe cần được đặt trong thư mục:
```
public/assets/images/vehicles/
```

## 🖼️ Danh sách ảnh cần chuẩn bị

### VinFast (Ưu tiên cao - Thương hiệu Việt)
- ✅ `vinfast-vf8.png` - VinFast VF 8 (Đã có)
- ✅ `vinfast-vf9.png` - VinFast VF 9 (Đã có)
- ⬜ `vinfast-vf5.png` - VinFast VF 5 Plus
- ⬜ `vinfast-e34.png` - VinFast VF e34

### Tesla
- ⬜ `tesla-model3.png` - Tesla Model 3
- ⬜ `tesla-modely.png` - Tesla Model Y
- ⬜ `tesla-models.png` - Tesla Model S

### BYD
- ⬜ `byd-atto3.png` - BYD Atto 3
- ⬜ `byd-seal.png` - BYD Seal
- ⬜ `byd-tang.png` - BYD Tang EV
- ⬜ `byd-dolphin.png` - BYD Dolphin

### Hyundai
- ⬜ `hyundai-ioniq5.png` - Hyundai Ioniq 5
- ⬜ `hyundai-ioniq6.png` - Hyundai Ioniq 6
- ⬜ `hyundai-kona.png` - Hyundai Kona Electric

### Kia
- ⬜ `kia-ev6.png` - Kia EV6
- ⬜ `kia-niro.png` - Kia Niro EV
- ⬜ `kia-ev9.png` - Kia EV9

### Mercedes-Benz
- ⬜ `mercedes-eqs.png` - Mercedes EQS
- ⬜ `mercedes-eqe.png` - Mercedes EQE

### BMW
- ⬜ `bmw-ix.png` - BMW iX
- ⬜ `bmw-i4.png` - BMW i4
- ⬜ `bmw-ix3.png` - BMW iX3

### Audi
- ⬜ `audi-etron-gt.png` - Audi e-tron GT
- ⬜ `audi-q4.png` - Audi Q4 e-tron

### Nissan
- ⬜ `nissan-leaf.png` - Nissan Leaf
- ⬜ `nissan-ariya.png` - Nissan Ariya

### Volkswagen
- ⬜ `vw-id4.png` - VW ID.4
- ⬜ `vw-id3.png` - VW ID.3

### Porsche
- ⬜ `porsche-taycan.png` - Porsche Taycan

### MG
- ⬜ `mg-zs.png` - MG ZS EV
- ⬜ `mg-mg4.png` - MG MG4 Electric

### Polestar
- ⬜ `polestar-2.png` - Polestar 2
- ⬜ `polestar-3.png` - Polestar 3

### Default
- ⬜ `default-ev.png` - Ảnh mặc định cho xe chưa có ảnh

## 📝 Yêu cầu ảnh

- **Format**: PNG hoặc WebP (khuyến nghị WebP cho tối ưu dung lượng)
- **Kích thước**: 800x600px hoặc tỷ lệ 4:3
- **Nền**: Trong suốt hoặc nền trắng
- **Dung lượng**: < 200KB mỗi ảnh
- **Góc chụp**: Góc nghiêng 3/4 phía trước (tương tự ảnh VF8, VF9 hiện tại)

## 🚀 Cách cập nhật ảnh vào Database

### Bước 1: Đặt ảnh vào thư mục
```bash
# Tạo thư mục nếu chưa có
mkdir -p public/assets/images/vehicles

# Copy ảnh vào thư mục
# Ví dụ: vinfast-vf8.png, tesla-model3.png, ...
```

### Bước 2: Chạy migration SQL
```bash
# Kết nối PostgreSQL
psql -U postgres -d EVService

# Chạy script migration
\i database/add_vehicle_images.sql
```

### Bước 3: Kiểm tra kết quả
```sql
-- Xem các model xe đã có ảnh
SELECT manufacturer, model, image_url 
FROM vehicle_models 
ORDER BY manufacturer, model;
```

## 🔍 Nguồn ảnh gợi ý

1. **Official Website**: Lấy từ trang chủ hãng xe (VinFast, Tesla, BYD...)
2. **Stock Photos**: Unsplash, Pexels (tìm với license free)
3. **Press Kits**: Media/Press section của các hãng xe
4. **AI Generated**: Sử dụng DALL-E, Midjourney để tạo ảnh (nếu cần)

## 💡 Tips

- Ưu tiên lấy ảnh **VinFast** trước (thương hiệu Việt Nam)
- Có thể dùng ảnh tương tự cho các variant (Model 3 Standard/Long Range dùng chung 1 ảnh)
- Ảnh `default-ev.png` dùng cho các xe chưa có ảnh cụ thể

## 📞 Hỗ trợ

Nếu cần hỗ trợ tìm hoặc tạo ảnh, liên hệ team Design.
