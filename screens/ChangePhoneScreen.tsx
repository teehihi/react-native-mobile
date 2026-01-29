import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ApiService } from '../services/api';
import { User } from '../types/api';

interface ChangePhoneScreenProps {
  navigation: any;
}

const ChangePhoneScreen: React.FC<ChangePhoneScreenProps> = ({ navigation }) => {
  const [user, setUser] = useState<User | null>(null);
  const [newPhone, setNewPhone] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      const response = await ApiService.getProfile();
      if (response.success && response.data) {
        setUser(response.data.user);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const handleSendOTP = async () => {
    if (!newPhone) {
      Alert.alert('Lỗi', 'Vui lòng nhập số điện thoại mới');
      return;
    }

    if (newPhone.length < 10) {
      Alert.alert('Lỗi', 'Số điện thoại không hợp lệ');
      return;
    }

    if (newPhone === user?.phoneNumber) {
      Alert.alert('Lỗi', 'Số điện thoại mới phải khác số điện thoại hiện tại');
      return;
    }

    try {
      setLoading(true);
      const response = await ApiService.sendPhoneUpdateOTP(newPhone);
      if (response.success) {
        // Navigate to OTP verification screen
        navigation.navigate('OTPVerification', {
          email: user?.email || '', // Current email (where OTP was sent)
          purpose: 'phone_update',
          phoneData: {
            newPhone,
            otpToken: response.data?.otpToken,
          },
        });
      } else {
        Alert.alert('Lỗi', response.message);
      }
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể gửi OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()} 
            style={styles.backButton}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Đổi số điện thoại</Text>
          <View style={styles.headerRight} />
        </View>

        <ScrollView 
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.form}>
            {/* Current Phone */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Số điện thoại hiện tại</Text>
              <View style={styles.currentPhoneContainer}>
                <Text style={styles.currentPhoneText}>
                  {user?.phoneNumber || 'Chưa có số điện thoại'}
                </Text>
              </View>
            </View>

            {/* New Phone */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Số điện thoại mới</Text>
              <TextInput
                style={styles.input}
                value={newPhone}
                onChangeText={setNewPhone}
                placeholder="Nhập số điện thoại mới"
                placeholderTextColor="#9ca3af"
                keyboardType="phone-pad"
              />
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.submitButton, loading && styles.submitButtonDisabled]}
              onPress={handleSendOTP}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.submitButtonText}>Tiếp tục</Text>
              )}
            </TouchableOpacity>

            {/* Security Tips */}
            <View style={styles.tipsContainer}>
              <Text style={styles.tipsTitle}>Lưu ý bảo mật:</Text>
              <Text style={styles.tipText}>• Mã OTP sẽ được gửi đến email hiện tại của bạn</Text>
              <Text style={styles.tipText}>• Số điện thoại mới phải khác số điện thoại hiện tại</Text>
              <Text style={styles.tipText}>• Đảm bảo số điện thoại mới chính xác</Text>
              <Text style={styles.tipText}>• Số điện thoại dùng để khôi phục tài khoản</Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    padding: 16,
  },
  form: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  currentPhoneContainer: {
    padding: 12,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  currentPhoneText: {
    fontSize: 16,
    color: '#6b7280',
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#111827',
    backgroundColor: '#fff',
  },
  submitButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  tipsContainer: {
    marginTop: 32,
    padding: 16,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#2563eb',
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  tipText: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 4,
  },
});

export default ChangePhoneScreen;