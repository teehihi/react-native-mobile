import React, { useEffect } from 'react';
import { AppNavigator } from './navigation/AppNavigator';
import './global.css';
import './services/nativewindInterop';
import { useAuthStore } from './store/authStore';

// Component to initialize auth state
const AuthInitializer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const checkAuth = useAuthStore(state => state.checkAuth);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return <>{children}</>;
}

import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function App(): React.JSX.Element {
  return (
    <AuthInitializer>
      <SafeAreaProvider>
        <PaperProvider>
          <AppNavigator />
        </PaperProvider>
      </SafeAreaProvider>
    </AuthInitializer>
  );
}
