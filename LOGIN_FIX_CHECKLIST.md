# ✅ Login Fix Checklist

## Trước Khi Test

- [ ] Backend đang chạy tại `http://localhost:8080`
- [ ] Frontend đang chạy tại `http://localhost:3000`
- [ ] File `.env` có `REACT_APP_API_URL=http://localhost:8080/api`
- [ ] User tồn tại trong database với email: `lakhanqpro125@gmail.com`
- [ ] Password trong DB là BCrypt hash của `456`

## Test Steps

### 1. Test với Test Page
- [ ] Mở trình duyệt tại `http://localhost:3000/test-login`
- [ ] Email field có giá trị: `lakhanqpro125@gmail.com`
- [ ] Password field có giá trị: `456`
- [ ] Click "Test with AuthService" button
- [ ] Kiểm tra kết quả:
  - [ ] Success = true
  - [ ] Có token trong response
  - [ ] Có user info trong response

### 2. Test Backend Trực Tiếp
- [ ] Trên cùng page, click "Test with Fetch (Direct)"
- [ ] Kiểm tra response:
  - [ ] Status = 200
  - [ ] isApiResponse = true
  - [ ] code = 1000
  - [ ] result có accessToken

### 3. Test Network Tab
- [ ] Mở DevTools (F12)
- [ ] Chuyển sang tab Network
- [ ] Click nút test lại
- [ ] Tìm request `login` và kiểm tra:
  - [ ] Request URL: `http://localhost:8080/api/auth/login`
  - [ ] Method: POST
  - [ ] Status: 200
  - [ ] Request Payload có email và password
  - [ ] Response có structure: `{ code, message, result }`

### 4. Test Console
- [ ] Mở DevTools Console (F12)
- [ ] Không có error màu đỏ
- [ ] Có logs từ authService (nếu có console.log)
- [ ] Kiểm tra localStorage:
  ```javascript
  console.log('Token:', localStorage.getItem('accessToken'));
  console.log('User:', localStorage.getItem('user'));
  ```

### 5. Test Login Page Thật
- [ ] Đi tới `http://localhost:3000/login`
- [ ] Nhập email: `lakhanqpro125@gmail.com`
- [ ] Nhập password: `456`
- [ ] Click "Đăng nhập"
- [ ] Kiểm tra:
  - [ ] Không có error message
  - [ ] Redirect đến dashboard
  - [ ] Header hiển thị user info
  - [ ] Token được lưu trong localStorage

### 6. Test Navigation
- [ ] Sau khi login thành công
- [ ] URL đã chuyển sang `/customer/dashboard` (hoặc tương ứng với role)
- [ ] Dashboard hiển thị đúng
- [ ] Có thể navigate giữa các trang
- [ ] Token vẫn còn trong localStorage

### 7. Test Logout
- [ ] Click nút Logout
- [ ] Token bị xóa khỏi localStorage
- [ ] Redirect về login page hoặc home page
- [ ] Không thể access protected routes

## Troubleshooting

### Nếu Test 1 Fail:
- [ ] Kiểm tra lại backend có chạy không
- [ ] Xem Network tab có request không
- [ ] Xem Console có error gì không
- [ ] Kiểm tra CORS error

### Nếu Test 2 Fail:
- [ ] Backend không chạy hoặc sai port
- [ ] CORS chưa được config đúng
- [ ] Endpoint không tồn tại

### Nếu Test 5 Fail (Login Page):
- [ ] Xem lại Test 1-4 đã pass chưa
- [ ] Check AuthContext có error không
- [ ] Xem response có đúng format không
- [ ] Kiểm tra password có đúng không

## Expected Results

### ✅ Success Response từ AuthService:
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "lakhanqpro125@gmail.com",
      "firstName": "Văn A",
      "lastName": "Nguyễn",
      "role": "CUSTOMER"
    }
  }
}
```

### ✅ Success Response từ Backend Direct:
```json
{
  "success": true,
  "status": 200,
  "isApiResponse": true,
  "data": {
    "code": 1000,
    "message": "Login thành công",
    "result": {
      "userId": "550e8400-e29b-41d4-a716-446655440000",
      "email": "lakhanqpro125@gmail.com",
      "role": "CUSTOMER",
      "fullName": "Nguyễn Văn A",
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
}
```

### ✅ LocalStorage After Login:
```javascript
// accessToken
"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"

// user
"{\"id\":\"550e8400-e29b-41d4-a716-446655440000\",\"email\":\"lakhanqpro125@gmail.com\",\"firstName\":\"Văn A\",\"lastName\":\"Nguyễn\",\"role\":\"CUSTOMER\"}"
```

## Common Issues & Solutions

| Issue | Check | Solution |
|-------|-------|----------|
| CORS Error | Network tab | Backend SecurityConfig allows localhost:3000 |
| 404 Not Found | URL in Network | Check API_URL in .env |
| 401 Unauthorized | Credentials | Check email/password in DB |
| 500 Server Error | Backend logs | Fix backend code |
| Response undefined | Console | Check response structure |
| Token not saved | localStorage | Check authService.login() |
| Not redirecting | AuthContext | Check navigation logic |

## Files to Check If Issues

1. `src/services/authService.ts` - Login logic
2. `src/context/AuthContext.tsx` - Auth state management
3. `src/services/api.ts` - Axios config
4. `.env` - API URL config
5. Backend `AuthController.java` - Login endpoint
6. Backend `SecurityConfig.java` - CORS & security

## Final Verification

- [ ] Tất cả tests pass ✓
- [ ] Không có console errors ✓
- [ ] Login thành công ✓
- [ ] Dashboard hiển thị đúng ✓
- [ ] Token được lưu ✓
- [ ] Logout hoạt động ✓

---
**Status:** [ ] In Progress  [ ] Completed  [ ] Issues Found

**Notes:**
_Ghi chú vấn đề gặp phải ở đây..._

**Completed By:** ________________  **Date:** __________
