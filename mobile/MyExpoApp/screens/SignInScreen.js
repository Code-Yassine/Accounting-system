import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { Checkbox } from 'react-native-paper';
import { signIn, testConnection } from '../api/auth';

export default function SignInScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [serverStatus, setServerStatus] = useState('unknown'); // 'unknown', 'online', 'offline'

  // Test connection when component mounts
  useEffect(() => {
    if (Platform.OS === 'web') {
      // For web browsers, just set the server status to online
      // This avoids CORS issues with the test endpoint
      setServerStatus('online');
    } else {
      // For mobile, test the connection
      const checkServerConnection = async () => {
        try {
          setError('');
          const isConnected = await testConnection();
          setServerStatus(isConnected ? 'online' : 'offline');
          if (!isConnected) {
            setError('Server is not available. Please try again later.');
          }
        } catch (err) {
          console.error('Server check failed:', err);
          setServerStatus('offline');
          setError('Cannot connect to server');
        }
      };
      checkServerConnection();
    }
  }, []);

  const handleSignIn = async () => {
    // Input validation
    if (!email) {
      setError('Email is required');
      return;
    }
    if (!password) {
      setError('Password is required');
      return;
    }

    // If server is offline, first try to reconnect
    if (serverStatus === 'offline') {
      try {
        setLoading(true);
        const isConnected = await testConnection();
        setServerStatus(isConnected ? 'online' : 'offline');
        if (!isConnected) {
          setLoading(false);
          Alert.alert(
            'Connection Error',
            'Cannot connect to the server. Please check:\n\n' +
            '1. The server is running\n' +
            '2. Your device is connected to the network\n' +
            '3. The server IP address is correct',
            [{ text: 'OK' }]
          );
          return;
        }
      } catch (err) {
        setLoading(false);
        setError('Cannot connect to server');
        return;
      }
    }

    setError('');
    setLoading(true);
    
    try {
      console.log('Attempting sign in with:', email);
      const userData = await signIn(email, password);
      
      // Sign in successful
      console.log('Sign in successful:', userData);
      setLoading(false);
      
      // Navigate to Home screen with user data
      if (navigation) {
        // Pass userData as a parameter to the Home screen
        console.log('Navigating to Home with userData:', userData);
        navigation.reset({
          index: 0,
          routes: [{ 
            name: 'Home',
            params: { userData }
          }],
        });
      }
    } catch (err) {
      console.error('Sign in failed:', err);
      setLoading(false);
      
      // Handle different types of errors
      if (err.message && err.message.includes('Network error')) {
        // Special handling for web platform
        if (Platform.OS === 'web') {
          setError('Cannot connect to server. Make sure your backend is running on localhost:5000');
        } else {
          // Show a detailed alert for network errors to help troubleshoot
          Alert.alert(
            'Connection Error',
            'Cannot connect to the server. Please check:\n\n' +
            '1. The server is running\n' +
            '2. Your device is connected to the network\n' +
            '3. The server IP address is correct',
            [{ text: 'OK' }]
          );
          setError('Cannot connect to server');
        }
      } else if (err.message) {
        setError(err.message);
      } else {
        setError('Sign in failed. Please check your credentials.');
      }
    }
  };

  // Use a different style for web
  const webCardStyle = Platform.OS === 'web' ? {
    width: '100%',
    maxWidth: 400,
    margin: '0 auto',
  } : {};

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <Image source={require('../assets/image.png')} style={styles.logo} />
        <Text style={styles.title}>Financial Experts</Text>
        <Text style={styles.subtitle}>Professional Accounting Services</Text>
      </View>
      <View style={[styles.card, webCardStyle]}>
        <Text style={styles.signInTitle}>Sign In</Text>
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="your.email@company.com"
          placeholderTextColor="#b0b0b0"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          editable={!loading}
        />
        <Text style={styles.label}>Password</Text>
        <View style={styles.passwordRow}>
          <TextInput
            style={[styles.input, { flex: 1 }]}
            placeholder="Your password"
            placeholderTextColor="#b0b0b0"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            editable={!loading}
          />
          <TouchableOpacity
            style={styles.eyeButton}
            onPress={() => setShowPassword((prev) => !prev)}
            disabled={loading}
          >
            <Text style={{ color: '#b0b0b0', fontSize: 18 }}>{showPassword ? '🙈' : '👁️'}</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.optionsRow}>
          <View style={styles.rememberMeRow}>
            <Checkbox.Item
              label="Remember me"
              status={rememberMe ? 'checked' : 'unchecked'}
              onPress={() => setRememberMe(!rememberMe)}
              disabled={loading}
            />
          </View>
          <TouchableOpacity disabled={loading}>
            <Text style={styles.forgotPassword}>Forgot Password?</Text>
          </TouchableOpacity>
        </View>
        
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        
        <TouchableOpacity 
          style={[styles.signInButton, loading && styles.signInButtonDisabled]}
          onPress={handleSignIn}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.signInButtonText}>Sign In</Text>
          )}
        </TouchableOpacity>
      </View>
      <View style={styles.footer}>
        <Text style={styles.footerText}>© 2025 Financial Experts, LLC</Text>
        <Text style={styles.footerText}>All rights reserved</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginTop: 40, // Added top margin
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logo: {
    width: 56,
    height: 56,
    marginBottom: 12,
    resizeMode: 'contain',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#183153',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#6c7687',
    marginBottom: 8,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 28,
    width: '90%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    alignItems: 'stretch',
    marginBottom: 32,
  },
  signInTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#183153',
    textAlign: 'center',
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    color: '#222',
    marginBottom: 6,
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 10,
    backgroundColor: '#fafbfc',
  },
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  eyeButton: {
    padding: 8,
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  rememberMeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    marginRight: 6,
  },
  rememberMeText: {
    fontSize: 15,
    color: '#222',
  },
  forgotPassword: {
    color: '#6c7687',
    fontWeight: 'bold',
    fontSize: 15,
    textDecorationLine: 'underline',
  },
  signInButton: {
    backgroundColor: '#13335b',
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  signInButtonDisabled: {
    backgroundColor: '#6c7687',
  },
  signInButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  footer: {
    alignItems: 'center',
    marginTop: 'auto',
    marginBottom: 18,
  },
  footerText: {
    color: '#6c7687',
    fontSize: 14,
  },
  errorText: {
    color: '#dc3545',
    fontSize: 14,
    marginBottom: 10,
    textAlign: 'center',
  }
});