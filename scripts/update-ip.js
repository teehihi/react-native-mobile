#!/usr/bin/env node

const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

// Tìm IP thực tế của máy tính
function findRealIP() {
  try {
    const output = execSync('ifconfig | grep "inet " | grep -v 127.0.0.1 | head -1', { encoding: 'utf8' });
    const match = output.match(/inet (\d+\.\d+\.\d+\.\d+)/);
    return match ? match[1] : null;
  } catch (error) {
    console.error('❌ Không thể tìm IP tự động. Vui lòng cập nhật thủ công.');
    return null;
  }
}

// Cập nhật file .env
function updateEnvFile(newIP) {
  const envPath = path.join(__dirname, '../.env');
  
  if (!fs.existsSync(envPath)) {
    console.log('📄 File .env không tồn tại. Tạo từ .env.example...');
    const examplePath = path.join(__dirname, '../.env.example');
    if (fs.existsSync(examplePath)) {
      fs.copyFileSync(examplePath, envPath);
    } else {
      console.error('❌ File .env.example không tồn tại!');
      return false;
    }
  }
  
  let envContent = fs.readFileSync(envPath, 'utf8');
  
  // Cập nhật IP cho real device
  envContent = envContent.replace(
    /API_HOST_REAL_DEVICE=.*/,
    `API_HOST_REAL_DEVICE=${newIP}`
  );
  
  fs.writeFileSync(envPath, envContent);
  return true;
}

// Main function
function main() {
  console.log('🔍 Đang tìm IP thực tế của máy tính...');
  
  const realIP = findRealIP();
  
  if (!realIP) {
    console.log('\n📝 Vui lòng cập nhật IP thủ công trong file .env:');
    console.log('1. Tìm IP: ifconfig | grep "inet " (macOS/Linux) hoặc ipconfig (Windows)');
    console.log('2. Cập nhật API_HOST_REAL_DEVICE trong file .env');
    return;
  }
  
  console.log(`✅ Tìm thấy IP: ${realIP}`);
  
  if (updateEnvFile(realIP)) {
    console.log(`🎉 Đã cập nhật file .env với IP: ${realIP}`);
    console.log('\n📱 Bây giờ bạn có thể:');
    console.log('1. Restart Expo server: npm start -- --clear');
    console.log('2. Quét lại QR code trên điện thoại');
  } else {
    console.error('❌ Không thể cập nhật file .env');
  }
}

main();