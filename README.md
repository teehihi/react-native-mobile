# BaiTapTuan1 - Buoi2 - Login and Register

Ứng dụng React Native TypeScript với tích hợp API Authentication, thực hiện chức năng Register và Login không sử dụng OTP và JWT.

## 🎯 Mô tả dự án

Đây là bài tập tuần 1 được nâng cấp với TypeScript và tích hợp API backend. Ứng dụng bao gồm:

- **Intro Screen**: Màn hình loading với logo và progress bar (10 giây)
- **Welcome Screen**: Trang giới thiệu với các nút Đăng nhập/Đăng ký
- **Login Screen**: Form đăng nhập hỗ trợ email hoặc username
- **Register Screen**: Form đăng ký tài khoản mới
- **Homepage Screen**: Hiển thị thông tin cá nhân và chức năng logout

## 🚀 Demo giao diện

### Navigation Flow
```
Intro Screen (10s loading)
    ↓
Welcome Screen (Trang giới thiệu)
    ├── Nút "Đăng Nhập" → Login Screen
    └── Nút "Đăng Ký" → Register Screen
         ↓ (thành công)
Homepage Screen (Thông tin cá nhân)
    ↓ (logout)
Welcome Screen
```

### Tính năng giao diện
- **Intro Screen**: 
  - Logo animation với fade in effect
  - Progress bar loading 10 giây
  - Tự động chuyển sang Welcome Screen

- **Welcome Screen**:
  - Logo và thông điệp chào mừng
  - 3 feature highlights với icons
  - Nút "Đăng Nhập" (primary button)
  - Nút "Đăng Ký" (outline button)
  - Nút "Xem thử" (ghost button)

- **Login Screen**:
  - Form đăng nhập với validation
  - Hỗ trợ đăng nhập bằng **email hoặc username**
  - Toggle hiển thị/ẩn password
  - Loading state khi đang xử lý
  - Nút back về Welcome Screen

- **Register Screen**:
  - Form đăng ký đầy đủ với validation
  - Các trường: Username, Họ tên, Email, SĐT, Password, Confirm Password
  - Toggle hiển thị/ẩn password
  - Validation real-time
  - Nút back về Welcome Screen

- **Homepage Screen**:
  - Header với avatar và thông tin user
  - Hiển thị thông tin từ API (username, email, phone, role, status)
  - Các section: Sở thích, Kỹ năng, Mục tiêu
  - Nút logout ở header

## 🔧 Công nghệ sử dụng

### Frontend
- **React Native**: Framework chính
- **TypeScript**: Type safety
- **Expo**: Development platform
- **React Navigation 7**: Navigation system
- **FontAwesome Icons**: Icon library
- **Axios**: HTTP client
- **AsyncStorage**: Local storage

### Backend API
- **Node.js**: Runtime
- **Express.js**: Web framework
- **MySQL**: Database
- **bcrypt**: Password hashing
- **Session-based Authentication**: Không sử dụng JWT

## 📱 Cài đặt và chạy

### 1. Cài đặt dependencies
```bash
npm install
```

### 2. Cấu hình API
Cập nhật IP address trong `services/api.ts`:
```typescript
const API_BASE_URL = 'http://YOUR_IP:3001/api';
```

### 3. Chạy API Server
```bash
cd ../GroupAPI_MySQL
npm start
```

### 4. Chạy React Native App
```bash
npm start
```

### 5. Test trên thiết bị
- **Android**: Quét QR code bằng Expo Go
- **iOS**: Quét QR code bằng Camera app
- **Web**: Mở http://localhost:8081

## 🧪 Testing

### Test API Connection
```bash
npm run test-api
```

### Test TypeScript
```bash
npm run type-check
```

### Manual Testing Flow
1. **Intro Screen**: Xem animation loading 10 giây
2. **Welcome Screen**: Nhấn các nút điều hướng
3. **Register**: Tạo tài khoản mới với validation
4. **Login**: Đăng nhập bằng email hoặc username
5. **Homepage**: Xem thông tin user và test logout

## 🔐 Authentication Features

### Login
- **Flexible Input**: Chấp nhận cả email và username
- **Validation**: Kiểm tra input không rỗng
- **Session Management**: Lưu session ID và user data
- **Error Handling**: Hiển thị lỗi từ API

### Register
- **Full Validation**: Username (min 3), email format, password (min 6)
- **Confirm Password**: Kiểm tra khớp với password
- **Optional Fields**: Phone number không bắt buộc
- **Unique Check**: API kiểm tra email/username đã tồn tại

### Session Management
- **AsyncStorage**: Lưu session ID và user data local
- **Auto Logout**: Khi session hết hạn
- **Secure**: Session-based thay vì JWT

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - Đăng ký tài khoản
- `POST /api/auth/login` - Đăng nhập (email hoặc username)
- `POST /api/auth/logout` - Đăng xuất
- `POST /api/auth/check-session` - Kiểm tra session

### Example Login Request
```json
{
  "emailOrUsername": "admin@dacsanviet.com",
  "password": "admin123"
}
```



## 🔍 Validation Rules

### Login
- **Email/Username**: Không được rỗng
- **Password**: Không được rỗng

### Register
- **Username**: Min 3 ký tự, không có khoảng trắng
- **Email**: Format email hợp lệ
- **Password**: Min 6 ký tự
- **Confirm Password**: Phải khớp với password
- **Full Name**: Bắt buộc
- **Phone**: Tùy chọn, format số điện thoại

## 🛡️ Security Features

- **Password Hashing**: bcrypt với salt rounds
- **Session-based Auth**: Không sử dụng JWT
- **Input Validation**: Client và server side
- **SQL Injection Prevention**: Prepared statements
- **Secure Storage**: AsyncStorage cho session data

## 📱 Responsive Design

- **Mobile First**: Thiết kế ưu tiên mobile
- **Flexible Layout**: Sử dụng Flexbox
- **Screen Adaptation**: Tự động điều chỉnh theo màn hình
- **Touch Friendly**: Buttons và inputs có kích thước phù hợp

## 🚨 Error Handling

- **Network Errors**: Hiển thị thông báo kết nối
- **Validation Errors**: Highlight fields lỗi
- **API Errors**: Hiển thị message từ server
- **Loading States**: Disable buttons khi đang xử lý

## 📈 Performance

- **TypeScript**: Type safety và better IDE support
- **Optimized Images**: WebP format cho logo
- **Lazy Loading**: Components load khi cần
- **Memory Management**: Proper cleanup cho timers

## 🎯 Test Accounts

### Admin Account
- **Email**: admin@dacsanviet.com
- **Username**: admin
- **Password**: admin123

### Test Account (tự tạo)
- Sử dụng form Register để tạo tài khoản test


## 🎨 UI/UX Design

### Color Scheme
- **Primary**: #667eea (Blue gradient)
- **Success**: #2ecc71 (Green)
- **Warning**: #f39c12 (Orange)
- **Error**: #e74c3c (Red)
- **Background**: #f5f7fa (Light gray)

### Typography
- **Headers**: Bold, 24-32px
- **Body**: Regular, 14-16px
- **Captions**: Light, 12px

### Components
- **Buttons**: Rounded corners, shadows, icons
- **Input Fields**: Clean design với icons
- **Cards**: Shadow effects, rounded corners
- **Loading States**: Activity indicators

## 📁 Cấu trúc project

```
BaiTapTuan1_TypeScript/
├── screens/
│   ├── IntroScreen.tsx          # Loading screen
│   ├── WelcomeScreen.tsx        # Trang giới thiệu (mới)
│   ├── LoginScreen.tsx          # Đăng nhập
│   ├── RegisterScreen.tsx       # Đăng ký
│   └── HomepageScreen.tsx       # Trang chính
├── services/
│   └── api.ts                   # API service layer
├── types/
│   ├── navigation.ts            # Navigation types
│   ├── api.ts                   # API types
│   └── profile.ts               # Profile types
├── constants/
│   └── theme.ts                 # Theme constants
├── assets/
│   └── dacsanvietLogo.webp     # Logo
└── App.tsx                      # Main app component
```

## Demo Giao diện

<table>
  <tr>
    <td align="center">
      <img src="screenshots/loadingScreen.png" width="280"/><br/>
      <em>Màn hình loading</em>
    </td>
    <td align="center">
      <img src="screenshots/homePage.png" width="280"/><br/>
      <em>Giao diện trang chủ giới thiệu bản thân</em>
    </td>
  </tr>
  <tr>
    <td align="center">
      <img src="screenshots/welcome.png" width="280"/><br/>
      <em>Màn hình Welcome</em>
    </td>
    <td align="center">
      <img src="screenshots/loginScreen.png" width="280"/><br/>
      <em>Giao diện trang đăng nhập đơn giản</em>
    </td>
    <td align="center">
      <img src="screenshots/registerScreen.png" width="280"/><br/>
      <em>Giao diện trang đăng ký đơn giản</em>
    </td>
  </tr>
</table>

## 📝 Changelog

### Version 2.0.0 (Current)
- ✅ Thêm Welcome Screen với UI/UX đẹp
- ✅ Login hỗ trợ email và username
- ✅ Tích hợp API MySQL backend
- ✅ Session management hoàn chỉnh
- ✅ TypeScript type safety
- ✅ Error handling và validation
- ✅ Responsive design

### Version 1.0.0
- ✅ Basic Intro và Homepage screens
- ✅ Static content display

## 🤝 Đóng góp

1. Fork project
2. Tạo feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## 🧑‍💻 Tác giả

**Nguyễn Nhật Thiên (TEE)**

- 📧 Email: teeforwork21@gmail.com
- 🔗 GitHub: [github.com/teehihi](https://github.com/teehihi)
- 🌐 Linktree: [linktr.ee/nkqt.tee](https://linktr.ee/nkqt.tee)

---


<div align="center">

**⭐ Nếu bạn thích dự án này, hãy cho chúng tôi một star! ⭐**

Made with ❤️ by Tee

</div>