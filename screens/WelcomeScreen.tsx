import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Dimensions,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { NavigationProps } from '../types/navigation';
import { theme } from '../constants/theme';

const { width, height } = Dimensions.get('window');

interface WelcomeScreenProps extends NavigationProps {}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ navigation }) => {
  return (
    <View style={styles.container}>
      {/* Header với logo */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Image
            source={require('../assets/dacsanvietLogo.webp')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
        <Text style={styles.title}>Chào mừng bạn!</Text>
        <Text style={styles.subtitle}>
          Khám phá ứng dụng tuyệt vời của chúng tôi
        </Text>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.featureContainer}>
          <View style={styles.featureItem}>
            <FontAwesome name="mobile" size={32} color={theme.colors.primary} />
            <Text style={styles.featureText}>Giao diện thân thiện</Text>
          </View>
          <View style={styles.featureItem}>
            <FontAwesome name="shield" size={32} color={theme.colors.success} />
            <Text style={styles.featureText}>Bảo mật cao</Text>
          </View>
          <View style={styles.featureItem}>
            <FontAwesome name="rocket" size={32} color={theme.colors.warning} />
            <Text style={styles.featureText}>Hiệu suất tốt</Text>
          </View>
        </View>
      </View>

      {/* Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.loginButton}
          onPress={() => navigation.navigate('Login')}
        >
          <FontAwesome name="sign-in" size={20} color="white" style={styles.buttonIcon} />
          <Text style={styles.loginButtonText}>Đăng Nhập</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.registerButton}
          onPress={() => navigation.navigate('Register')}
        >
          <FontAwesome name="user-plus" size={20} color={theme.colors.primary} style={styles.buttonIcon} />
          <Text style={styles.registerButtonText}>Đăng Ký</Text>
        </TouchableOpacity>

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>hoặc</Text>
          <View style={styles.dividerLine} />
        </View>

        <TouchableOpacity
          style={styles.guestButton}
          onPress={() => {
            // Có thể thêm chức năng guest mode sau
            navigation.navigate('Login');
          }}
        >
          <FontAwesome name="eye" size={20} color={theme.colors.gray} style={styles.buttonIcon} />
          <Text style={styles.guestButtonText}>Xem thử</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
  },
  logoContainer: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    marginBottom: 30,
  },
  logo: {
    width: width * 0.4,
    height: width * 0.4,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: theme.colors.gray,
    textAlign: 'center',
    paddingHorizontal: 40,
    lineHeight: 24,
  },
  content: {
    flex: 0.8,
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  featureContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  featureItem: {
    alignItems: 'center',
    flex: 1,
  },
  featureText: {
    fontSize: 14,
    color: theme.colors.text,
    marginTop: 12,
    textAlign: 'center',
    fontWeight: '500',
  },
  buttonContainer: {
    paddingHorizontal: 30,
    paddingBottom: 50,
  },
  loginButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  registerButton: {
    backgroundColor: 'white',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  registerButtonText: {
    color: theme.colors.primary,
    fontSize: 18,
    fontWeight: 'bold',
  },
  buttonIcon: {
    marginRight: 10,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: theme.colors.gray,
    opacity: 0.3,
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    color: theme.colors.gray,
  },
  guestButton: {
    backgroundColor: 'transparent',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.gray,
  },
  guestButtonText: {
    color: theme.colors.gray,
    fontSize: 16,
    fontWeight: '500',
  },
});

export default WelcomeScreen;