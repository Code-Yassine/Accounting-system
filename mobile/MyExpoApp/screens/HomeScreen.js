import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function HomeScreen({ navigation }) {
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    // Load user data when component mounts
    const loadUserData = async () => {
      try {
        const userJSON = await AsyncStorage.getItem('user');
        if (userJSON) {
          const userData = JSON.parse(userJSON);
          setUserData(userData);
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      }
    };

    loadUserData();
  }, []);

  const handleSignOut = async () => {
    try {
      setLoading(true);
      
      // Clear stored auth data
      await AsyncStorage.removeItem('user');
      
      // Navigate back to sign in
      if (navigation) {
        navigation.reset({
          index: 0,
          routes: [{ name: 'SignIn' }],
        });
      } else {
        // Fallback when navigation is not available
        Alert.alert(
          "Signed Out",
          "You have been signed out successfully.",
          [{ 
            text: "OK", 
            onPress: () => {
              setLoading(false);
            } 
          }]
        );
      }
    } catch (error) {
      console.error('Error signing out:', error);
      setLoading(false);
    }
  };

  if (!userData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#13335b" />
        <Text style={styles.loadingText}>Loading your account...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.welcome}>Welcome, {userData.name}</Text>
        <Text style={styles.accountType}>Client Portal</Text>
      </View>
      
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Account Summary</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Name:</Text>
          <Text style={styles.infoValue}>{userData.name}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Email:</Text>
          <Text style={styles.infoValue}>{userData.email}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Status:</Text>
          <View style={[
            styles.statusBadge, 
            { backgroundColor: userData.status === 'accepted' ? '#e6f4ea' : '#fce8e6' }
          ]}>
            <Text style={[
              styles.statusText,
              { color: userData.status === 'accepted' ? '#137333' : '#c5221f' }
            ]}>
              {userData.status.charAt(0).toUpperCase() + userData.status.slice(1)}
            </Text>
          </View>
        </View>
      </View>
      
      <View style={styles.actionsContainer}>
        <Text style={styles.sectionTitle}>Services</Text>
        
        <View style={styles.actionGrid}>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionIcon}>📊</Text>
            <Text style={styles.actionText}>Financial Reports</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionIcon}>📝</Text>
            <Text style={styles.actionText}>Documents</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionIcon}>💬</Text>
            <Text style={styles.actionText}>Messages</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionIcon}>📅</Text>
            <Text style={styles.actionText}>Appointments</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <TouchableOpacity 
        style={styles.signOutButton}
        onPress={handleSignOut}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <Text style={styles.signOutButtonText}>Sign Out</Text>
        )}
      </TouchableOpacity>
      
      <View style={styles.footer}>
        <Text style={styles.footerText}>FinBooks Client Portal v1.0</Text>
        <Text style={styles.footerText}>© 2025 Financial Experts, LLC</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f9fb',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f7f9fb',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6c7687',
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  welcome: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#183153',
    marginBottom: 4,
  },
  accountType: {
    fontSize: 16,
    color: '#6c7687',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    margin: 16,
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#183153',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  infoLabel: {
    width: 80,
    fontSize: 16,
    color: '#6c7687',
  },
  infoValue: {
    flex: 1,
    fontSize: 16,
    color: '#2d3748',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
  },
  actionsContainer: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#183153',
    marginBottom: 16,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionButton: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  actionIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2d3748',
    textAlign: 'center',
  },
  signOutButton: {
    backgroundColor: '#13335b',
    borderRadius: 10,
    margin: 16,
    marginTop: 8,
    padding: 16,
    alignItems: 'center',
  },
  signOutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  footer: {
    padding: 16,
    paddingBottom: 24,
    alignItems: 'center',
  },
  footerText: {
    color: '#6c7687',
    fontSize: 14,
    marginBottom: 4,
  },
}); 