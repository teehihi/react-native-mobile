import React, { useEffect } from 'react';
import { AppNavigator } from './navigation/AppNavigator';
import { useAuthStore } from './store/authStore';

// Component to initialize auth state
const AuthInitializer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const checkAuth = useAuthStore(state => state.checkAuth);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return <>{children}</>;
}

export default function App(): React.JSX.Element {
  return (
    <AuthInitializer>
      <AppNavigator />
    </AuthInitializer>
  );
}
