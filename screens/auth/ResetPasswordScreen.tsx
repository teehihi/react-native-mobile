import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../types/navigation';
import { ApiService } from '../../services/api';
import { theme } from '../../constants/theme';
import { validatePassword } from '../../utils/validation';

type ResetPasswordScreenRouteProp = RouteProp<RootStackParamList, 'ResetPassword'>;
type ResetPasswordScreenNavigationProp = StackNavigationProp<RootStackParamList, 'ResetPassword'>;

interface Props {
  route: ResetPasswordScreenRouteProp;
  navigation: ResetPasswordScreenNavigationProp;
}

const ResetPasswordScreen: React.FC<Props> = ({ route, navigation }) => {
  const { email, otpCode } = route.params;
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);



  const handleResetPassword = async () => {
    if (!newPassword.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập mật khẩu mới');
      return;
    }

    const passCheck = validatePassword(newPassword);
    if (!passCheck.isValid) {
      Alert.alert('Lỗi', passCheck.message || 'Mật khẩu không hợp lệ');
      return;
    }

    if (!confirmPassword.trim()) {
      Alert.alert('Lỗi', 'Vui lòng xác nhận mật khẩu');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Lỗi', 'Mật khẩu xác nhận không khớp');
      return;
    }

    setLoading(true);

    try {
      const response = await ApiService.resetPasswordWithOTP({
        email,
        otpCode,
        newPassword,
      });

      if (response.success) {
        Alert.alert(
          'Thành công',
          'Đặt lại mật khẩu thành công! Vui lòng đăng nhập lại.',
          [
            {
              text: 'OK',
              onPress: () => navigation.replace('Login'),
            },
          ]
        );
      } else {
        Alert.alert('Lỗi', response.message);
      }
    } catch (error) {
      Alert.alert('Lỗi', 'Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
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
          <Text style={styles.title}>Đặt lại mật khẩu</Text>
        </View>

        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <FontAwesome name="lock" size={60} color={theme.colors.primary} />
          </View>

          <Text style={styles.description}>
            Nhập mật khẩu mới cho tài khoản của bạn
          </Text>

          <Text style={styles.emailText}>
            Email: {email}
          </Text>

          <View style={styles.inputContainer}>
            <View style={styles.passwordContainer}>
              <FontAwesome name="lock" size={20} color={theme.colors.gray} style={styles.inputIcon} />
              <TextInput
                style={styles.passwordInput}
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="Mật khẩu mới"
                secureTextEntry={!showNewPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowNewPassword(!showNewPassword)}
              >
                <FontAwesome
                  name={showNewPassword ? 'eye' : 'eye-slash'}
                  size={20}
                  color={theme.colors.gray}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.passwordContainer}>
              <FontAwesome name="lock" size={20} color={theme.colors.gray} style={styles.inputIcon} />
              <TextInput
                style={styles.passwordInput}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Xác nhận mật khẩu"
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <FontAwesome
                  name={showConfirmPassword ? 'eye' : 'eye-slash'}
                  size={20}
                  color={theme.colors.gray}
                />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.resetButton, loading && styles.disabledButton]}
            onPress={handleResetPassword}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <FontAwesome name="check" size={16} color="white" style={styles.buttonIcon} />
                <Text style={styles.resetButtonText}>Đặt lại mật khẩu</Text>
              </>
            )}
          </TouchableOpacity>

          <View style={styles.passwordRequirements}>
            <Text style={styles.requirementsTitle}>Yêu cầu mật khẩu:</Text>
            <Text style={styles.requirementText}>• Ít nhất 6 ký tự</Text>
            <Text style={styles.requirementText}>• Nên bao gồm chữ hoa, chữ thường và số</Text>
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
  inputContainer: {
    width: '100%',
    marginBottom: 30,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.lightGray,
    borderRadius: 12,
    backgroundColor: 'white',
    marginBottom: 15,
    paddingHorizontal: 15,
    minHeight: 50,
  },
  inputIcon: {
    marginRight: 10,
    width: 20,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 15,
    fontSize: 16,
    color: theme.colors.text,
    height: 50,
  },
  eyeButton: {
    padding: 5,
    width: 30,
    alignItems: 'center',
  },
  resetButton: {
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
  resetButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  passwordRequirements: {
    alignItems: 'flex-start',
    width: '100%',
  },
  requirementsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 5,
  },
  requirementText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginBottom: 2,
  },
});

export default ResetPasswordScreen;