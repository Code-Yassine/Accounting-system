// API config for environment variables in React Native
import Constants from 'expo-constants';

// You can set this in app.json or use a fallback
const API_URL = Constants.expoConfig?.extra?.API_URL || 'http://192.168.0.105:5000';
export default API_URL;
