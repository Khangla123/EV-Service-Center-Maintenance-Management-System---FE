# 🔧 Đã Sửa Lỗi Đăng Nhập

## ❌ Vấn Đề
Đăng nhập luôn báo lỗi **"Email hoặc mật khẩu không đúng"** dù credentials trong database là chính xác.

## 🔍 Nguyên Nhân
Backend trả về response với **ApiResponse wrapper**, nhưng frontend đang expect response trực tiếp.

### Backend Response Structure (Thực tế):
```json
{
  "code": 1000,
  "message": "Login thành công",
  "result": {
    "userId": "uuid-here",
    "email": "user@example.com",
    "role": "CUSTOMER",
    "fullName": "Nguyễn Văn A",
    "accessToken": "jwt-token-here"
  }
}
```

### Frontend Expected (Trước khi sửa):
```json
{
  "token": "jwt-token-here",
  "user": {
    "id": "...",
    "email": "...",
    "firstName": "...",
    "lastName": "...",
    "role": "..."
  }
}
```

## ✅ Giải Pháp

### 1. Cập nhật `authService.ts`

#### Thêm Backend Types:
```typescript
// Backend API Response wrapper
interface ApiResponse<T> {
  code: number;
  message: string;
  result: T;
}

// Backend LoginResponse
interface BackendLoginResponse {
  userId: string;
  email: string;
  role: string;
  fullName: string;
  accessToken: string;
}
```

#### Sửa Login Method:
```typescript
async login(credentials: LoginRequest): Promise<LoginResponse> {
  const response = await api.post<ApiResponse<BackendLoginResponse>>('/auth/login', credentials);
  
  // Backend trả về ApiResponse wrapper
  const backendData = response.data.result;
  
  if (!backendData || !backendData.accessToken) {
    throw new Error('Invalid response from server');
  }
  
  // Parse fullName thành firstName và lastName
  const nameParts = backendData.fullName ? backendData.fullName.split(' ') : ['', ''];
  const lastName = nameParts[0] || '';
  const firstName = nameParts.slice(1).join(' ') || nameParts[0] || '';
  
  // Convert backend response to frontend format
  const loginResponse: LoginResponse = {
    token: backendData.accessToken,
    user: {
      id: backendData.userId,
      email: backendData.email,
      firstName: firstName,
      lastName: lastName,
      role: backendData.role,
    }
  };
  
  // Lưu token và user info
  localStorage.setItem('accessToken', loginResponse.token);
  localStorage.setItem('user', JSON.stringify(loginResponse.user));
  
  return loginResponse;
}
```

### 2. Các Methods Khác Cũng Được Cập Nhật:
- ✅ `logout()` - Sử dụng `ApiResponse<void>`
- ✅ `forgotPassword()` - Extract message từ ApiResponse
- ✅ `verifyOtp()` - Check code === 1000 cho valid
- ✅ `resetPassword()` - Extract message từ ApiResponse
- ✅ `getCurrentUser()` - Parse MeResponse với ApiResponse wrapper

## 📝 Các Thay Đổi Chi Tiết

### File: `src/services/authService.ts`

#### Before:
```typescript
const response = await api.post('/auth/login', credentials);
return response.data; // Expected { token, user }
```

#### After:
```typescript
const response = await api.post<ApiResponse<BackendLoginResponse>>('/auth/login', credentials);
const backendData = response.data.result; // Extract from wrapper
// Convert to frontend format
return { token: backendData.accessToken, user: {...} };
```

## 🎯 Mapping Backend ↔ Frontend

| Backend Field | Frontend Field | Notes |
|--------------|----------------|-------|
| `userId` | `user.id` | Direct mapping |
| `email` | `user.email` | Direct mapping |
| `role` | `user.role` | Direct mapping |
| `fullName` | `firstName` + `lastName` | Split by space |
| `accessToken` | `token` | Renamed |
| `code: 1000` | Success indicator | Used for validation |
| `message` | - | Used for user feedback |

## 🧪 Testing

### Test với Test Page:
1. Truy cập: `http://localhost:3000/test-login`
2. Nhập email và password từ database
3. Click "Test with AuthService"
4. Kiểm tra response:

**Success Response:**
```json
{
  "success": true,
  "data": {
    "token": "jwt-token...",
    "user": {
      "id": "uuid...",
      "email": "user@example.com",
      "firstName": "Văn A",
      "lastName": "Nguyễn",
      "role": "CUSTOMER"
    }
  }
}
```

### Test với Login Page:
1. Truy cập: `http://localhost:3000/login`
2. Nhập credentials từ database
3. Click "Đăng nhập"
4. Nếu thành công → redirect to dashboard
5. Nếu thất bại → Xem Network tab và Console

## 🔐 Password Handling

**Quan trọng:** 
- Frontend gửi **plain text password** trong request
- Backend sẽ so sánh với BCrypt hash trong database
- **KHÔNG BAO GIỜ** hash password ở frontend!

```typescript
// ✅ ĐÚNG - Frontend gửi plain text
await authService.login({ 
  email: "user@example.com", 
  password: "123456" // Plain text
});

// ❌ SAI - Không hash ở frontend
await authService.login({ 
  email: "user@example.com", 
  password: bcrypt.hash("123456") // WRONG!
});
```

## 🐛 Common Issues

### Issue 1: Vẫn báo "Email hoặc mật khẩu không đúng"
**Nguyên nhân:** Password trong DB không khớp
**Giải pháp:** 
```sql
-- Kiểm tra user tồn tại
SELECT * FROM users WHERE email = 'lakhanqpro125@gmail.com';

-- Reset password (nếu cần)
UPDATE users 
SET password = '$2a$10$...' -- BCrypt hash của "456"
WHERE email = 'lakhanqpro125@gmail.com';
```

### Issue 2: CORS Error
**Triệu chứng:** Console báo CORS policy
**Giải pháp:** Backend SecurityConfig đã config cho `localhost:3000`, restart backend

### Issue 3: Network Error
**Triệu chứng:** Request không đến backend
**Giải pháp:** 
- Kiểm tra backend đang chạy: `http://localhost:8080`
- Kiểm tra `.env`: `REACT_APP_API_URL=http://localhost:8080/api`
- Restart frontend sau khi sửa `.env`

### Issue 4: 500 Internal Server Error
**Triệu chứng:** Backend trả về 500
**Giải pháp:** Xem backend logs để biết error details

## 📊 Response Codes

| Code | Meaning | Action |
|------|---------|--------|
| 1000 | Success | Proceed with response |
| 400 | Bad Request | Check request format |
| 401 | Unauthorized | Invalid credentials |
| 500 | Server Error | Check backend logs |

## 🚀 Next Steps

1. **Test Login** với credentials thật từ database
2. **Verify Token** được lưu vào localStorage
3. **Test Navigation** sau khi login thành công
4. **Test Logout** để đảm bảo token được xóa
5. **Test Protected Routes** với token

## 📖 Related Files

- ✅ `src/services/authService.ts` - **ĐÃ SỬA**
- ✅ `src/context/AuthContext.tsx` - Đã update từ mock sang real API
- ✅ `src/services/api.ts` - Axios config với interceptors
- ✅ `src/pages/TestLogin.tsx` - Test page cho debugging
- ✅ `.env` - API URL configuration

## 💡 Tips

1. **Luôn kiểm tra Network tab** trước khi debug code
2. **Console.log** response để xem structure thực tế
3. **Sử dụng Test Page** (`/test-login`) để debug nhanh
4. **Check Backend logs** khi có 500 errors
5. **Restart cả frontend và backend** sau khi sửa config

## ✨ Kết Luận

Lỗi đã được sửa! Login bây giờ sẽ:
1. ✅ Gửi request đúng format đến backend
2. ✅ Nhận và parse ApiResponse wrapper
3. ✅ Convert backend response sang frontend format
4. ✅ Lưu token và user info vào localStorage
5. ✅ Navigate đến dashboard sau khi login thành công

**Thử login ngay để xem kết quả!** 🎉
