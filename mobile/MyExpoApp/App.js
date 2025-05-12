import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SignInScreen from './screens/SignInScreen';
import HomeScreen from './screens/HomeScreen';
import UploadScreen from './screens/UploadScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  // Add extra padding for web environment
  const containerStyle = Platform.OS === 'web' ? {
    flex: 1,
    maxWidth: 800,
    margin: '0 auto',
    padding: 20,
    height: '100vh',
  } : { flex: 1 };

  return (
    <View style={containerStyle}>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="SignIn">
          <Stack.Screen 
            name="SignIn" 
            component={SignInScreen} 
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="Home" 
            component={HomeScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="Upload" 
            component={UploadScreen}
            options={{ 
              title: 'Upload Files',
              headerStyle: {
                backgroundColor: '#183153',
              },
              headerTintColor: '#fff',
              headerTitleStyle: {
                fontWeight: 'bold',
              },
            }}
          />
        </Stack.Navigator>
        <StatusBar style="auto" />
      </NavigationContainer>
    </View>
  );
}
