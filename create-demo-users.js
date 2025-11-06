const axios = require('axios');

// Script này sẽ gọi backend API để tạo demo users
// Nhưng trước tiên cần có API endpoint ở backend

const users = [
  {
    username: 'admin1',
    email: 'admin@evservice.vn',
    password: '123456',
    fullName: 'Vũ Thị Quản',
    phone: '0901234567',
    role: 'ADMIN'
  },
  {
    username: 'customer1',
    email: 'customer@evservice.vn',
    password: '123456',
    fullName: 'Nguyễn Văn Khách',
    phone: '0902234567',
    role: 'CUSTOMER'
  },
  {
    username: 'staff1',
    email: 'staff@evservice.vn',
    password: '123456',
    fullName: 'Lê Văn Nhân',
    phone: '0903234567',
    role: 'STAFF'
  },
  {
    username: 'technician1',
    email: 'technician@evservice.vn',
    password: '123456',
    fullName: 'Hoàng Văn Kỹ',
    phone: '0904234567',
    role: 'TECHNICIAN'
  }
];

console.log('💡 Thông tin quan trọng:');
console.log('Database hiện tại KHÔNG CÓ user nào!');
console.log('Bạn cần thêm users vào database trước.');
console.log('\n📝 Có 2 cách:');
console.log('1. Dùng pgAdmin/DBeaver chạy file: be/database/insert_demo_users.sql');
console.log('2. Tạo API register endpoint và chạy script này\n');

console.log('BCrypt hash của password "123456":');
console.log('$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy');


console.log('\n📧 Demo accounts:');
users.forEach(user => {
  console.log(`${user.role.padEnd(12)} - ${user.email.padEnd(30)} - Password: 123456`);
});

console.log('\n⚠️  LƯU Ý: Hiện tại không thể đăng nhập vì database trống!');
console.log('Vui lòng chạy SQL script trong file: be/database/RUN_THIS_IN_PGADMIN.md');
