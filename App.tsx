import React from 'react';
import { AuthProvider } from './store/authContext';
import { AppNavigator } from './navigation/AppNavigator';

export default function App(): React.JSX.Element {
  return (
    <AuthProvider>
      <AppNavigator />
    </AuthProvider>
  );
}
