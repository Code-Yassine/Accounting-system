import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, Platform } from 'react-native';
import SignInScreen from './screens/SignInScreen';

export default function App() {
  return (
    <View style={{ flex: 1, backgroundColor: '#f7f9fb', paddingTop: Platform.OS === 'android' ? 60 : 80 }}>
      <SignInScreen />
      <StatusBar style="auto" />
    </View>
  );
}
