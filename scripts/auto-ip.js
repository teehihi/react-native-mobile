const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function getLocalIP() {
  try {
    const os = require('os');
    const platform = os.platform();

    if (platform === 'win32') {
      // Windows: sử dụng ipconfig và lọc theo Adapter
      const output = execSync('ipconfig', { encoding: 'utf8' });
      const adapters = output.split(/\r?\n\r?\n/);
      
      let preferredIp = null;
      let wifiIp = null;
      let otherIps = [];
      
      for (let adapter of adapters) {
        const isWifi = adapter.toLowerCase().includes('wi-fi') || adapter.toLowerCase().includes('wireless');
        const lines = adapter.split('\n');
        
        for (let line of lines) {
          if (line.includes('IPv4 Address')) {
            const match = line.match(/(\d+\.\d+\.\d+\.\d+)/);
            if (match) {
              const ip = match[1];
              // Ưu tiên tuyệt đối dải 192.168.1.x (Wi-Fi thật)
              if (ip.startsWith('192.168.1.')) {
                preferredIp = ip;
                break;
              }
              // Bỏ qua Radmin và VMware dải 192.168.192 / 192.168.27
              if (!ip.startsWith('26.') && !ip.startsWith('127.') && !ip.startsWith('192.168.192.') && !ip.startsWith('192.168.27.')) {
                if (isWifi) {
                  wifiIp = ip;
                } else {
                  otherIps.push(ip);
                }
              }
            }
          }
        }
        if (preferredIp) break;
      }
      
      if (preferredIp) return preferredIp;
      if (wifiIp) return wifiIp;
      if (otherIps.length > 0) return otherIps[0];
      
      return '192.168.1.35'; // Fallback
    } else {
      // macOS/Linux: sử dụng ifconfig
      const output = execSync('ifconfig | grep "inet " | grep -v 127.0.0.1', { encoding: 'utf8' });
      const match = output.match(/inet (\d+\.\d+\.\d+\.\d+)/);

      if (match) {
        return match[1];
      }

      // Fallback: thử với ip route (Linux)
      try {
        const routeOutput = execSync('ip route get 1.1.1.1 | grep -oP "src \\K\\S+"', { encoding: 'utf8' });
        return routeOutput.trim();
      } catch (e) {
        // Fallback cuối: dùng hostname -I (Linux)
        try {
          const hostnameOutput = execSync('hostname -I', { encoding: 'utf8' });
          return hostnameOutput.trim().split(' ')[0];
        } catch (e2) {
          console.warn('⚠️  Cannot auto-detect IP, using fallback');
          return '192.168.1.100'; // Fallback IP
        }
      }
    }
  } catch (error) {
    console.warn('⚠️  Error detecting IP:', error.message);
    return '192.168.1.100'; // Fallback IP
  }
}

function updateEnvFile() {
  const envPath = path.join(__dirname, '../.env');
  const currentIP = getLocalIP();

  console.log('🔍 Detected IP:', currentIP);

  if (!fs.existsSync(envPath)) {
    console.log('📝 Creating .env file...');
    const envContent = `# API Configuration - Auto-generated
API_HOST_LOCAL=localhost
API_HOST_IOS_SIMULATOR=127.0.0.1
API_HOST_ANDROID_EMULATOR=10.0.2.2
API_HOST_REAL_DEVICE=${currentIP}
API_PORT=3001
NODE_ENV=development
DEBUG_API=true
`;
    fs.writeFileSync(envPath, envContent);
  } else {
    // Đọc file .env hiện tại
    let envContent = fs.readFileSync(envPath, 'utf8');

    // Cập nhật API_HOST_REAL_DEVICE
    const updatedContent = envContent.replace(
      /API_HOST_REAL_DEVICE=.*/,
      `API_HOST_REAL_DEVICE=${currentIP}`
    );

    // Kiểm tra xem có thay đổi không
    if (updatedContent !== envContent) {
      fs.writeFileSync(envPath, updatedContent);
      console.log('✅ Updated .env with new IP:', currentIP);
    } else {
      console.log('✅ IP unchanged:', currentIP);
    }
  }
}

// Chạy script
updateEnvFile();