import React from 'react';
import { AuthProvider } from './src/context/AuthContext';
import { LanguageProvider } from './src/context/LanguageContext';
import AppNavigator from './src/navigation/AppNavigator';
import { StatusBar } from 'expo-status-bar';

export default function App() {
  return (
    <AuthProvider>
        <LanguageProvider>
            <AppNavigator />
            <StatusBar style="auto" />
        </LanguageProvider>
    </AuthProvider>
  );
}

