import { RegisterRequest } from './api';

export type RootStackParamList = {
  Intro: undefined;
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
  OTPVerification: {
    email: string;
    purpose: 'registration' | 'password_reset';
    userData?: RegisterRequest;
  };
  ForgotPassword: undefined;
  ResetPassword: {
    email: string;
    otpCode: string;
  };
  Homepage: undefined;
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
    goBack: () => void;
  };
};