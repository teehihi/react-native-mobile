import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { RouteProp, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigation';
import { ApiService } from '../services/api';
import { theme } from '../constants/theme';
import { OTPInput, OTPInputRef } from '../components/OTPInput';

type OTPVerificationScreenRouteProp = RouteProp<RootStackParamList, 'OTPVerification'>;
type OTPVerificationScreenNavigationProp = StackNavigationProp<RootStackParamList, 'OTPVerification'>;

interface Props {
  route: OTPVerificationScreenRouteProp;
  navigation: OTPVerificationScreenNavigationProp;
}

const OTPVerificationScreen: React.FC<Props> = ({ route, navigation }) => {
  const { email, purpose, userData } = route.params;
  const [otpCode, setOtpCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(300); // 5 minutes
  const [canResend, setCanResend] = useState(false);
  const [otpError, setOtpError] = useState(false);
  const otpInputRef = useRef<OTPInputRef>(null);

  // Auto focus khi screen được focus
  useFocusEffect(
    React.useCallback(() => {
      const timer = setTimeout(() => {
        otpInputRef.current?.focus();
      }, 500);
      return () => clearTimeout(timer);
    }, [])
  );

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleOTPComplete = (otp: string) => {
    setOtpCode(otp);
    setOtpError(false);
    // Không tự động verify, để user bấm nút xác thực
  };

  const handleOTPChange = (otp: string) => {
    setOtpCode(otp);
    setOtpError(false);
  };

  const handleVerifyOTP = async (otp?: string) => {
    const codeToVerify = otp || otpCode;
    
    if (!codeToVerify.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập mã OTP');
      setOtpError(true);
      return;
    }

    if (codeToVerify.length !== 6) {
      Alert.alert('Lỗi', 'Mã OTP phải có 6 chữ số');
      setOtpError(true);
      return;
    }

    setLoading(true);
    setOtpError(false);

    try {
      if (purpose === 'registration' && userData) {
        // Verify registration OTP
        const response = await ApiService.verifyRegistrationOTP({
          email,
          otpCode: codeToVerify,
          username: userData.username,
          password: userData.password,
          fullName: userData.fullName,
          phoneNumber: userData.phoneNumber,
        });

        if (response.success) {
          Alert.alert(
            'Thành công',
            'Đăng ký tài khoản thành công!',
            [
              {
                text: 'OK',
                onPress: () => navigation.reset({
                  index: 0,
                  routes: [{ name: 'Homepage' }],
                }),
              },
            ]
          );
        } else {
          Alert.alert('Lỗi', response.message);
          setOtpError(true);
        }
      } else if (purpose === 'password_reset') {
        // Chuyển đến màn hình nhập mật khẩu mới
        navigation.replace('ResetPassword', {
          email,
          otpCode: codeToVerify,
        });
      }
    } catch (error) {
      Alert.alert('Lỗi', 'Có lỗi xảy ra. Vui lòng thử lại.');
      setOtpError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!canResend) return;

    setResendLoading(true);

    try {
      let response;
      if (purpose === 'registration') {
        response = await ApiService.sendRegistrationOTP({
          email,
          fullName: userData?.fullName,
        });
      } else {
        response = await ApiService.sendPasswordResetOTP({ email });
      }

      if (response.success) {
        Alert.alert('Thành công', 'Mã OTP mới đã được gửi đến email của bạn');
        setCountdown(300);
        setCanResend(false);
        setOtpCode('');
        setOtpError(false);
        // Reset OTP input
        otpInputRef.current?.reset();
      } else {
        Alert.alert('Lỗi', response.message);
      }
    } catch (error) {
      Alert.alert('Lỗi', 'Có lỗi xảy ra khi gửi lại OTP');
    } finally {
      setResendLoading(false);
    }
  };

  const getTitle = () => {
    return purpose === 'registration' ? 'Xác thực đăng ký' : 'Xác thực đặt lại mật khẩu';
  };

  const getDescription = () => {
    return purpose === 'registration'
      ? 'Vui lòng nhập mã OTP đã được gửi đến email để hoàn tất đăng ký tài khoản'
      : 'Vui lòng nhập mã OTP đã được gửi đến email để đặt lại mật khẩu';
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <FontAwesome name="arrow-left" size={20} color={theme.colors.primary} />
          </TouchableOpacity>
          <Text style={styles.title}>{getTitle()}</Text>
        </View>

        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <FontAwesome name="envelope" size={60} color={theme.colors.primary} />
          </View>

          <Text style={styles.description}>{getDescription()}</Text>

          <Text style={styles.emailText}>
            Mã OTP đã được gửi đến: {email}
          </Text>

          <View style={styles.otpContainer}>
            <OTPInput
              ref={otpInputRef}
              length={6}
              onComplete={handleOTPComplete}
              onChangeText={handleOTPChange}
              autoFocus={true}
              error={otpError}
            />
          </View>

          {otpCode.length === 6 && (
            <TouchableOpacity
              style={[styles.verifyButton, loading && styles.disabledButton]}
              onPress={() => handleVerifyOTP()}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <FontAwesome name="check" size={16} color="white" style={styles.buttonIcon} />
                  <Text style={styles.verifyButtonText}>Xác thực</Text>
                </>
              )}
            </TouchableOpacity>
          )}

          <View style={styles.resendContainer}>
            {countdown > 0 ? (
              <Text style={styles.countdownText}>
                Gửi lại mã sau: {formatTime(countdown)}
              </Text>
            ) : (
              <TouchableOpacity
                style={styles.resendButton}
                onPress={handleResendOTP}
                disabled={resendLoading}
              >
                {resendLoading ? (
                  <ActivityIndicator size="small" color={theme.colors.primary} />
                ) : (
                  <>
                    <FontAwesome name="refresh" size={14} color={theme.colors.primary} />
                    <Text style={styles.resendButtonText}>Gửi lại mã OTP</Text>
                  </>
                )}
              </TouchableOpacity>
            )}
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 40,
  },
  backButton: {
    padding: 10,
    marginRight: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  content: {
    flex: 1,
    alignItems: 'center',
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: theme.colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  description: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 24,
  },
  emailText: {
    fontSize: 14,
    color: theme.colors.primary,
    textAlign: 'center',
    marginBottom: 30,
    fontWeight: '500',
  },
  otpContainer: {
    width: '85%',
    marginBottom: 30,
    marginHorizontal: 4
  },
  verifyButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
    minWidth: 200,
  },
  disabledButton: {
    opacity: 0.6,
  },
  buttonIcon: {
    marginRight: 8,
  },
  verifyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resendContainer: {
    alignItems: 'center',
  },
  countdownText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  resendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  resendButtonText: {
    color: theme.colors.primary,
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 5,
  },
});

export default OTPVerificationScreen;