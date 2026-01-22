import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { COLORS } from '../constants/theme';

interface OTPInputProps {
  length?: number;
  onComplete: (otp: string) => void;
  onChangeText?: (otp: string) => void;
  autoFocus?: boolean;
  error?: boolean;
}

export interface OTPInputRef {
  reset: () => void;
  focus: () => void;
}

const { width } = Dimensions.get('window');
const BOX_SIZE = 50;
const SPACING = 12;

export const OTPInput = forwardRef<OTPInputRef, OTPInputProps>(({
  length = 6,
  onComplete,
  onChangeText,
  autoFocus = true,
  error = false,
}, ref) => {
  const [otp, setOtp] = useState<string>('');
  const [focusedIndex, setFocusedIndex] = useState<number>(0);
  const inputRef = useRef<TextInput>(null);

  // Reset function
  const resetOTP = () => {
    setOtp('');
    setFocusedIndex(0);
    onChangeText?.('');
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  // Focus function
  const focusOTP = () => {
    setTimeout(() => {
      inputRef.current?.focus();
      setFocusedIndex(0);
    }, 100);
  };

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    reset: resetOTP,
    focus: focusOTP,
  }));

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [autoFocus]);

  const handleChangeText = (text: string) => {
    // Chỉ cho phép số và giới hạn độ dài
    const numericText = text.replace(/[^0-9]/g, '').slice(0, length);
    setOtp(numericText);
    setFocusedIndex(numericText.length);
    
    onChangeText?.(numericText);
    
    // Gọi onComplete khi đã nhập đủ
    if (numericText.length === length) {
      onComplete(numericText);
    }
  };

  const handleKeyPress = (e: any) => {
    if (e.nativeEvent.key === 'Backspace' && otp.length > 0) {
      const newOtp = otp.slice(0, -1);
      setOtp(newOtp);
      setFocusedIndex(newOtp.length);
      onChangeText?.(newOtp);
    }
  };

  const renderBoxes = () => {
    const boxes = [];
    for (let i = 0; i < length; i++) {
      const isFocused = i === focusedIndex;
      const hasValue = i < otp.length;
      const value = hasValue ? otp[i] : '';

      boxes.push(
        <View
          key={i}
          style={[
            styles.otpBox,
            isFocused && styles.focusedBox,
            hasValue && styles.filledBox,
            error && styles.errorBox,
          ]}
        >
          <TextInput
            style={[
              styles.otpText,
              isFocused && styles.focusedText,
              error && styles.errorText,
            ]}
            value={value}
            editable={false}
            selectTextOnFocus={false}
          />
        </View>
      );
    }
    return boxes;
  };

  return (
    <View style={styles.container}>
      {/* Hidden input để xử lý keyboard */}
      <TextInput
        ref={inputRef}
        style={styles.hiddenInput}
        value={otp}
        onChangeText={handleChangeText}
        onKeyPress={handleKeyPress}
        keyboardType="numeric"
        maxLength={length}
        autoFocus={autoFocus}
        caretHidden
        autoComplete="sms-otp"
        textContentType="oneTimeCode"
      />
      
      {/* Hiển thị các ô OTP */}
      <View style={styles.otpContainer}>
        {renderBoxes()}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
    width: '100%',
  },
  hiddenInput: {
    position: 'absolute',
    width: 1,
    height: 1,
    opacity: 0,
    zIndex: -1,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  otpBox: {
    width: BOX_SIZE,
    height: BOX_SIZE,
    borderWidth: 2,
    borderColor: COLORS.lightGray,
    borderRadius: 10,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: SPACING / 2,
    shadowColor: COLORS.black,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  focusedBox: {
    borderColor: COLORS.primary,
    borderWidth: 2.5,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.3,
  },
  filledBox: {
    borderColor: COLORS.success,
    backgroundColor: COLORS.white,
  },
  errorBox: {
    borderColor: COLORS.error,
    backgroundColor: COLORS.lightError,
  },
  otpText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
  },
  focusedText: {
    color: COLORS.primary,
  },
  errorText: {
    color: COLORS.error,
  },
});