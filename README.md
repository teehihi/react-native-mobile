# Bài Tập Tuần 1 - React Native TypeScript

Ứng dụng React Native được viết bằng TypeScript với 2 trang chính: Intro và Homepage.

## 🚀 Tính năng

- **Trang Intro**: Hiển thị logo thương hiệu với animation trong 10 giây, sau đó tự động chuyển sang Homepage
- **Trang Homepage**: Giới thiệu bản thân với thông tin cá nhân, kỹ năng, sở thích và mục tiêu
- **TypeScript**: Sử dụng TypeScript để type safety và better development experience
- **Animations**: Smooth animations với React Native Animated API
- **Responsive Design**: Giao diện responsive cho nhiều kích thước màn hình

## 🛠 Công nghệ sử dụng

- **React Native** với **Expo**
- **TypeScript** cho type safety
- **React Navigation** cho điều hướng
- **Animated API** cho animations
- **Modern ES6+** syntax

## 📱 Cài đặt và chạy

### 1. Cài đặt dependencies
```bash
npm install
```

### 2. Chạy ứng dụng
```bash
# Chạy trên web
npm run web

# Chạy trên Android (cần Android Studio)
npm run android

# Chạy trên iOS (cần Xcode - chỉ trên macOS)
npm run ios

# Chạy và hiển thị QR code để scan bằng Expo Go app
npm start
```

## 📁 Cấu trúc dự án

```
BaiTapTuan1_TypeScript/
├── screens/
│   ├── IntroScreen.tsx      # Trang intro với logo và loading
│   └── HomepageScreen.tsx   # Trang homepage giới thiệu bản thân
├── types/
│   ├── navigation.ts        # Types cho navigation
│   └── profile.ts          # Types cho thông tin profile
├── constants/
│   └── theme.ts            # Theme constants (colors, sizes, fonts)
├── assets/
│   └── dacsanvietLogo.webp # Logo thương hiệu
├── App.tsx                 # Main app component
└── package.json
```

## 🎨 Giao diện

### Trang Intro
- Logo thương hiệu với shadow effect
- Smooth fade-in và scale animations
- Progress bar hiển thị thời gian loading (10s)
- Tự động chuyển trang sau 10 giây

### Trang Homepage
- Header với avatar và thông tin cơ bản
- Card-based layout với shadow effects
- Animated skill bars với màu sắc khác nhau
- Thông tin được tổ chức theo sections:
  - Thông tin cá nhân
  - Kỹ năng lập trình (với progress bars)
  - Sở thích & đam mê
  - Mục tiêu & định hướng
  - Thành tích & kinh nghiệm

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
</table>


## 🔧 TypeScript Features

- **Type Safety**: Tất cả components và functions đều có types
- **Interface Definitions**: Định nghĩa interfaces cho data structures
- **Navigation Types**: Type-safe navigation với param lists
- **Props Typing**: Tất cả props đều được type properly
- **Constants Typing**: Theme constants với proper typing

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