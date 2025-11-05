# Admin Module - EV Service Center

## 📋 Tổng quan

Module Admin cung cấp đầy đủ các chức năng quản trị cho trung tâm dịch vụ EV, bao gồm:

## 🎯 Các chức năng đã hoàn thành

### 1. **Dashboard Tổng quan** (`/admin/dashboard`)
- Thống kê tổng quan: Doanh thu, số xe, lịch hẹn, hiệu suất
- Cảnh báo quan trọng: Tồn kho thấp, lịch hẹn quá tải, chứng chỉ hết hạn
- Hoạt động gần đây
- Dịch vụ phổ biến nhất

### 2. **Quản lý Nhân sự** (`/admin/staff`)
- Danh sách nhân viên và kỹ thuật viên
- Thêm/Sửa/Xóa nhân viên
- Lọc theo vai trò (Staff/Technician) và trạng thái
- Tìm kiếm nhanh
- Thống kê tổng hợp

### 3. **Quản lý Lịch hẹn** (`/admin/appointments`)
- Xem tổng quan lịch hẹn toàn trung tâm
- Lọc theo trạng thái và ngày
- Hiển thị thông tin chi tiết: Khách hàng, dịch vụ, kỹ thuật viên
- Quản lý lịch hẹn khẩn cấp
- Thống kê theo trạng thái

### 4. **Quản lý Kho Phụ tùng** (`/admin/inventory`)
- Danh sách phụ tùng với tồn kho
- Cảnh báo tồn kho thấp/hết hàng
- **AI Gợi ý Đặt hàng thông minh**
- Lọc theo danh mục và trạng thái
- Thống kê giá trị kho

### 5. **Quản lý Tài chính** (`/admin/finance`)
- Báo cáo doanh thu theo tháng
- Phân tích chi phí (Phụ tùng, Lương, Vận hành)
- Báo cáo lợi nhuận và tỷ suất
- Biểu đồ xu hướng doanh thu
- Doanh thu theo dịch vụ

### 6. **Cài đặt Hệ thống** (`/admin/settings`)
- Đang phát triển...

## 🏗️ Cấu trúc thư mục

```
src/components/admin/
├── AdminDashboard.tsx          # Component chính với navigation
├── AdminDashboard.css          # Styles cho dashboard chính
├── dashboard/
│   ├── DashboardOverview.tsx   # Tổng quan
│   ├── DashboardOverview.css
│   └── index.ts
├── staff/
│   ├── StaffManagement.tsx     # Quản lý nhân sự
│   ├── StaffManagement.css
│   └── index.ts
├── appointments/
│   ├── AppointmentManagement.tsx  # Quản lý lịch hẹn
│   ├── AppointmentManagement.css
│   └── index.ts
├── inventory/
│   ├── InventoryManagement.tsx    # Quản lý kho
│   ├── InventoryManagement.css
│   └── index.ts
├── finance/
│   ├── FinanceManagement.tsx      # Tài chính
│   ├── FinanceManagement.css
│   └── index.ts
├── customers/                      # Chưa triển khai
└── settings/                       # Chưa triển khai
```

## 🚀 Cách sử dụng

### 1. Đăng nhập với tài khoản Admin
```
Email: admin@evservice.vn
Password: 123456
```

### 2. Navigation
- Sử dụng sidebar bên trái để điều hướng giữa các modules
- Menu item đang active sẽ được highlight

### 3. Các tính năng chính

#### Dashboard
- Xem tổng quan ngay khi đăng nhập
- Click vào các cảnh báo để xem chi tiết

#### Quản lý Nhân sự
- Dùng thanh tìm kiếm để tìm nhân viên
- Lọc theo vai trò và trạng thái
- Click nút Sửa/Xóa để thao tác

#### Quản lý Lịch hẹn
- Lọc theo trạng thái: Chờ xác nhận, Đã xác nhận, Đang thực hiện, v.v.
- Xem chi tiết từng lịch hẹn
- Lịch hẹn khẩn cấp được đánh dấu riêng

#### Quản lý Kho
- **AI Suggestions**: Xem gợi ý đặt hàng thông minh
- Phê duyệt hoặc điều chỉnh đơn đặt hàng
- Theo dõi tồn kho theo thời gian thực

#### Tài chính
- Chọn kỳ báo cáo: Tuần/Tháng/Quý/Năm
- Xuất báo cáo PDF/Excel (coming soon)
- Xem biểu đồ xu hướng

## 🎨 UI/UX Features

### Design Principles
- **Liquid Glass Effect**: Giao diện hiện đại, trong suốt
- **Gradient Colors**: Sử dụng gradient #667eea → #764ba2
- **Responsive**: Tự động điều chỉnh trên mọi thiết bị
- **Smooth Transitions**: Hiệu ứng chuyển động mượt mà

### Color Scheme
- Primary: `#667eea` → `#764ba2` (Gradient)
- Success: `#10b981`
- Warning: `#fbbf24`
- Danger: `#ef4444`
- Background: `#f5f7fa`

## 📊 Data Management

### Mock Data
Hiện tại sử dụng mock data để demo. Trong production, cần kết nối với:
- Backend API endpoints
- Database (PostgreSQL/MongoDB)
- Real-time updates (WebSocket)

### State Management
- Sử dụng React useState hooks
- Có thể mở rộng với Redux/Context API

## 🔜 Tính năng sắp triển khai

### Module Khách hàng & Xe
- Xem toàn bộ hồ sơ khách hàng
- Lịch sử dịch vụ tổng hợp
- Phân tích hành vi khách hàng

### Module Cài đặt
- Cấu hình trung tâm dịch vụ
- Quản lý bảng giá dịch vụ
- Cài đặt thông báo
- Sao lưu dữ liệu

### Nâng cao
- Export báo cáo Excel/PDF
- Quản lý lịch ca làm việc
- Quản lý chứng chỉ kỹ thuật viên
- Đánh giá hiệu suất nhân viên
- Quản lý nhà cung cấp

## 💡 Tips

1. **Performance**: Components được tối ưu với memo và useMemo
2. **Accessibility**: Đầy đủ ARIA labels và keyboard navigation
3. **Scalability**: Cấu trúc module dễ dàng mở rộng
4. **Maintainability**: Code clean, có comment rõ ràng

## 🐛 Known Issues

- Mobile sidebar cần thêm toggle button
- Export PDF/Excel chưa implement
- Real-time updates chưa có

## 📝 Development Notes

### Thêm module mới
1. Tạo folder trong `src/components/admin/`
2. Tạo component `.tsx` và `.css`
3. Export trong `index.ts`
4. Thêm vào `AdminDashboard.tsx`:
   - Import component
   - Thêm menu item
   - Thêm case trong `renderContent()`

### Styling
- Sử dụng CSS modules hoặc className trực tiếp
- Tuân theo naming convention: `module-name__element-name--modifier`
- Responsive breakpoints: 768px, 1024px

## 📞 Support

Nếu có vấn đề hoặc câu hỏi, liên hệ:
- Email: support@evservice.vn
- Issues: GitHub repository

---

**Version**: 1.0.0  
**Last Updated**: October 13, 2025  
**Author**: EV Service Center Development Team
