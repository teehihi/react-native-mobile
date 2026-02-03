import { RegisterRequest } from './api';

export type RootStackParamList = {
  Intro: undefined;
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
  OTPVerification: {
    email: string;
    purpose: 'registration' | 'password_reset' | 'password_change' | 'email_update' | 'phone_update';
    userData?: RegisterRequest;
    passwordData?: {
      currentPassword: string;
      newPassword: string;
      otpToken?: string;
    };
    emailData?: {
      newEmail: string;
      otpToken?: string;
    };
    phoneData?: {
      newPhone: string;
      otpToken?: string;
    };
  };
  ForgotPassword: undefined;
  ResetPassword: {
    email: string;
    otpCode: string;
  };
  Homepage: undefined;
  Search: { initialQuery?: string; category?: string };
  ProductDetail: { product: any };
  ProfileEdit: undefined;
  ChangePassword: undefined;
  ChangeEmail: undefined;
  ChangePhone: undefined;
};

export type NavigationProps = {
  navigation: {
    replace: <T extends keyof RootStackParamList>(
      screen: T,
      params?: RootStackParamList[T]
    ) => void;
    navigate: <T extends keyof RootStackParamList>(
      screen: T,
      params?: RootStackParamList[T]
    ) => void;
    reset: (state: { index: number; routes: { name: keyof RootStackParamList }[] }) => void;
    goBack: () => void;
  };
};