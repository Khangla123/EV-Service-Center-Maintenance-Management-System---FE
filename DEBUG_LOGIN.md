# Hướng dẫn Debug Lỗi Đăng Nhập

## Vấn đề hiện tại
Đăng nhập không thành công với thông báo "Đăng nhập thất bại"

## Những gì đã làm

### 1. ✅ Đã tạo API Services
- Đã tạo đầy đủ các service files trong `src/services/`
- Đã cấu hình axios với interceptors
- Đã map tất cả endpoints từ backend

### 2. ✅ Đã cập nhật AuthContext
- Thay thế mock authentication bằng real API calls
- Sử dụng `authService.login()` từ `src/services/authService.ts`
- Xử lý errors đúng cách

### 3. ✅ Đã cài đặt axios
- axios version 1.12.2 đã được cài đặt trong package.json

### 4. ✅ Đã tạo Test Page
- Tạo `/test-login` page để debug
- Có thể test cả AuthService và Direct Fetch

## Các bước kiểm tra

### Bước 1: Kiểm tra Backend đang chạy
1. Mở terminal mới
2. Đi đến thư mục backend: `cd c:\FPT\SWP2\EV-Service-Center-Maintenance-Management-System---BE`
3. Chạy backend: `./mvnw spring-boot:run` hoặc `mvn spring-boot:run`
4. Đảm bảo backend chạy ở `http://localhost:8080`

### Bước 2: Test API trực tiếp
Mở trình duyệt và truy cập: `http://localhost:3000/test-login`

Page này cho phép:
- Test login với AuthService (qua axios)
- Test login trực tiếp với fetch
- Xem response và error details

### Bước 3: Kiểm tra Network Tab
1. Mở DevTools (F12)
2. Chuyển sang tab "Network"
3. Thử đăng nhập
4. Kiểm tra:
   - Request URL có đúng không? (should be `http://localhost:8080/api/auth/login`)
   - Request Method: POST
   - Request Headers: Content-Type: application/json
   - Request Body: `{"email":"...","password":"..."}`
   - Response Status: 200, 400, 401, 500?
   - Response Body: Có thông báo lỗi gì không?

### Bước 4: Kiểm tra Console
1. Mở DevTools Console (F12 > Console)
2. Xem có error messages nào không
3. Kiểm tra:
   - CORS errors?
   - Network errors?
   - JavaScript errors?

## Các vấn đề thường gặp

### 1. CORS Error
**Triệu chứng:** Console báo lỗi về CORS policy

**Giải pháp:**
- Kiểm tra backend SecurityConfig đã cho phép `http://localhost:3000`
- Đảm bảo backend có `@CrossOrigin` hoặc CORS configuration

### 2. 404 Not Found
**Triệu chứng:** Request trả về 404

**Giải pháp:**
- Kiểm tra URL trong `.env`: `REACT_APP_API_URL=http://localhost:8080/api`
- Kiểm tra backend controller có endpoint `/api/auth/login` không
- Restart frontend sau khi thay đổi `.env`

### 3. 401 Unauthorized
**Triệu chứng:** Request trả về 401

**Giải pháp:**
- Email hoặc password không đúng
- Kiểm tra user có tồn tại trong database không
- Kiểm tra password encoding (BCrypt) ở backend

### 4. 400 Bad Request
**Triệu chứng:** Request trả về 400

**Giải pháp:**
- Kiểm tra request body format
- Đảm bảo email và password được gửi đúng
- Kiểm tra backend validation rules

### 5. 500 Internal Server Error
**Triệu chứng:** Request trả về 500

**Giải pháp:**
- Kiểm tra backend logs
- Có thể là lỗi database connection
- Có thể là lỗi trong backend code

## Test với tài khoản mẫu

### Frontend đang dùng:
- Email: `lakhanqpro125@gmail.com`
- Password: `456`

### Tạo user trong backend (nếu chưa có):

#### Option 1: Qua API
```bash
# PowerShell
Invoke-WebRequest -Uri "http://localhost:8080/api/users/register" -Method POST -ContentType "application/json" -Body '{"email":"lakhanqpro125@gmail.com","password":"456","firstName":"Test","lastName":"User","phone":"0987654321"}'
```

#### Option 2: Qua Database
```sql
-- Nếu backend dùng PostgreSQL/MySQL
INSERT INTO users (email, password, first_name, last_name, phone, role) 
VALUES ('lakhanqpro125@gmail.com', '$2a$10$...', 'Test', 'User', '0987654321', 'CUSTOMER');
```

## Files đã sửa

1. `src/services/api.ts` - Cấu hình axios
2. `src/services/authService.ts` - Authentication service
3. `src/context/AuthContext.tsx` - Sử dụng real API
4. `src/pages/TestLogin.tsx` - Test page (NEW)
5. `src/App.tsx` - Thêm route `/test-login`
6. `.env` - Cấu hình API URL

## Debug Flow

```
User clicks Login
    ↓
LoginPage.tsx → handleSubmit()
    ↓
AuthContext.tsx → login()
    ↓
authService.ts → login({ email, password })
    ↓
api.ts → axios.post('/auth/login', ...)
    ↓
[Interceptor adds token if exists]
    ↓
Request to Backend: http://localhost:8080/api/auth/login
    ↓
Backend Response
    ↓
[Interceptor handles 401]
    ↓
AuthService saves token & user
    ↓
AuthContext updates state
    ↓
LoginPage navigates to dashboard
```

## Kiểm tra từng bước

### 1. Kiểm tra API URL
```typescript
// In browser console
console.log(process.env.REACT_APP_API_URL);
// Should output: http://localhost:8080/api
```

### 2. Test AuthService trực tiếp
```typescript
// In browser console
import authService from './services/authService';
const result = await authService.login({ 
  email: 'lakhanqpro125@gmail.com', 
  password: '456' 
});
console.log(result);
```

### 3. Kiểm tra LocalStorage
```javascript
// In browser console
console.log('Token:', localStorage.getItem('accessToken'));
console.log('User:', localStorage.getItem('user'));
```

## Next Steps nếu vẫn lỗi

1. **Chạy Test Page:**
   - Truy cập `http://localhost:3000/test-login`
   - Thử cả 2 nút test
   - Xem response details

2. **Kiểm tra Backend Logs:**
   - Xem console của backend server
   - Tìm error messages khi login

3. **Test với Postman/Insomnia:**
   - POST to `http://localhost:8080/api/auth/login`
   - Body: `{"email":"lakhanqpro125@gmail.com","password":"456"}`
   - Headers: `Content-Type: application/json`

4. **Kiểm tra Database:**
   - User có tồn tại không?
   - Password có đúng hash không?
   - Role có đúng không?

## Contact Info
Nếu vẫn gặp vấn đề, cung cấp:
1. Screenshot của Network tab
2. Console errors
3. Backend logs
4. Response từ test page
