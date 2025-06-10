import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  StatusBar,
  Image,
  RefreshControl
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { getDocumentStats } from '../api/documents';

export default function HomeScreen({ navigation, route }) {
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0 });
  const [userData, setUserData] = useState(route.params?.userData || null);

  useEffect(() => {
    if (!userData && route.params?.userData) {
      setUserData(route.params.userData);
    }
  }, [route.params, userData]);

  useEffect(() => {
    if (userData) {
      fetchStats();
    }
  }, [userData]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      console.log('UserData in fetchStats:', userData);
      
      const clientId = userData._id || userData.id;
      
      if (!clientId) {
        console.error('No client ID found in userData:', userData);
        Alert.alert('Error', 'Unable to fetch statistics: Client ID not found');
        return;
      }

      const statsData = await getDocumentStats(clientId);
      console.log('Fetched stats:', statsData);
      setStats(statsData);
    } catch (error) {
      console.error('Error fetching stats:', error);
      Alert.alert('Error', 'Failed to fetch document statistics');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchStats();
  };

  const handleSignOut = async () => {
    try {
      setLoading(true);
      if (navigation) {
        navigation.reset({
          index: 0,
          routes: [{ name: 'SignIn' }],
        });
      } else {
        Alert.alert(
          "Signed Out",
          "You have been signed out successfully.",
          [{ 
            text: "OK", 
            onPress: () => setLoading(false)
          }]
        );
      }
    } catch (error) {
      console.error('Error signing out:', error);
      setLoading(false);
    }
  };

  if (!userData) {
    const mockUserData = {
      name: "Client Demo",
      email: "client@example.com",
      status: "accepted",
      role: "client",
      _id: "mock-id"
    };
    return renderContent(mockUserData, loading, handleSignOut, navigation, stats, refreshing, onRefresh);
  }

  return renderContent(userData, loading, handleSignOut, navigation, stats, refreshing, onRefresh);
}

function renderContent(userData, loading, handleSignOut, navigation, stats, refreshing, onRefresh) {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f7f9fb" />
      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#4CAF50']}
            tintColor="#4CAF50"
          />
        }
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.welcome}>Welcome back,</Text>
            <Text style={styles.userName}>{userData.name}</Text>
          </View>
          <TouchableOpacity 
            style={styles.profileButton}
            onPress={() => Alert.alert('Profile', 'Profile settings coming soon!')}
          >
            <MaterialIcons name="account-circle" size={40} color="#4CAF50" />
          </TouchableOpacity>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <MaterialIcons name="upload-file" size={24} color="#4CAF50" />
            <Text style={styles.statNumber}>{loading ? '-' : stats.total}</Text>
            <Text style={styles.statLabel}>Documents</Text>
          </View>
          <View style={styles.statCard}>
            <MaterialIcons name="pending-actions" size={24} color="#FFA000" />
            <Text style={styles.statNumber}>{loading ? '-' : stats.pending}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
          <View style={styles.statCard}>
            <MaterialIcons name="check-circle" size={24} color="#2196F3" />
            <Text style={styles.statNumber}>{loading ? '-' : stats.approved}</Text>
            <Text style={styles.statLabel}>Approved</Text>
          </View>
        </View>
        
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Account Status</Text>
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
          <View style={styles.infoRow}>
            <MaterialIcons name="email" size={20} color="#6c7687" />
            <Text style={styles.infoValue}>{userData.email}</Text>
          </View>
        </View>
        
        <View style={styles.actionsContainer}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          
          <View style={styles.actionGrid}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => navigation.navigate('Upload', { userData })}
            >
              <View style={styles.actionIconContainer}>
                <MaterialIcons name="cloud-upload" size={24} color="#4CAF50" />
              </View>
              <Text style={styles.actionText}>Upload Files</Text>
              <Text style={styles.actionSubtext}>Upload new documents</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => navigation.navigate('UploadHistory', { userData })}
            >
              <View style={styles.actionIconContainer}>
                <MaterialIcons name="history" size={24} color="#2196F3" />
              </View>
              <Text style={styles.actionText}>History</Text>
              <Text style={styles.actionSubtext}>View uploaded documents</Text>
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
            <>
              <MaterialIcons name="logout" size={20} color="#fff" />
              <Text style={styles.signOutButtonText}>Sign Out</Text>
            </>
          )}
        </TouchableOpacity>
        
        <View style={styles.footer}>
          <Text style={styles.footerText}>Clever Office Client Portal v1.0</Text>
          <Text style={styles.footerText}>© 2025 Clever Office, LLC</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f9fb',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 30,
    marginTop: 40,
  },
  welcome: {
    fontSize: 16,
    color: '#6c7687',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#183153',
  },
  profileButton: {
    padding: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 4,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#183153',
    marginVertical: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6c7687',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    margin: 16,
    marginTop: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#183153',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  infoValue: {
    flex: 1,
    fontSize: 16,
    color: '#2d3748',
    marginLeft: 12,
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
    justifyContent: 'space-between',
  },
  actionButton: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f0f9f0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  actionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#183153',
    marginBottom: 4,
  },
  actionSubtext: {
    fontSize: 12,
    color: '#6c7687',
    textAlign: 'center',
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#dc3545',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  signOutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#6c7687',
    marginBottom: 4,
  },
}); 