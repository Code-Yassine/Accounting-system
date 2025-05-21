import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Linking,
  SafeAreaView,
  Alert
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { format } from 'date-fns';

const STATUS_COLORS = {
  new: '#2196F3',
  in_progress: '#FFA000',
  processed: '#4CAF50',
  rejected: '#F44336'
};

const STATUS_LABELS = {
  new: 'New',
  in_progress: 'In Progress',
  processed: 'Processed',
  rejected: 'Rejected'
};

const CATEGORY_LABELS = {
  purchase_invoice: 'Purchase Invoice',
  purchase_payment: 'Purchase Payment',
  purchase_delivery: 'Purchase Delivery',
  sale_invoice: 'Sale Invoice',
  sale_payment: 'Sale Payment',
  sale_delivery: 'Sale Delivery'
};

const DocumentDetailsScreen = ({ route, navigation }) => {
  const { document } = route.params;

  const handleViewDocument = async () => {
    try {
      // Construct the full URL to the document in the backend's uploads folder
      const serverUrl = 'http://192.168.0.105:5000'; // Make sure this matches your backend URL
      const documentPath = document.fileUrl.startsWith('http') 
        ? document.fileUrl 
        : `${serverUrl}/uploads/${document.fileUrl.split('/').pop()}`;

      console.log('Opening document URL:', documentPath);
      await Linking.openURL(documentPath);
    } catch (error) {
      console.error('Error opening document:', error);
      Alert.alert(
        'Error',
        'Could not open the document. Please try again later.',
        [{ text: 'OK' }]
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Document Details</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.documentHeader}>
          <View style={styles.titleContainer}>
            <MaterialIcons 
              name={document.fileType === 'pdf' ? 'picture-as-pdf' : 'image'} 
              size={32} 
              color="#666" 
            />
            <Text style={styles.documentTitle}>{document.title}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[document.status] }]}>
            <Text style={styles.statusText}>{STATUS_LABELS[document.status]}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Document Information</Text>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Category</Text>
            <Text style={styles.infoValue}>{CATEGORY_LABELS[document.category]}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Upload Date</Text>
            <Text style={styles.infoValue}>
              {format(new Date(document.createdAt), 'dd/MM/yyyy HH:mm')}
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>File Type</Text>
            <Text style={styles.infoValue}>{document.fileType.toUpperCase()}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Document Details</Text>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Party Name</Text>
            <Text style={styles.infoValue}>{document.metadata.partyName}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Date</Text>
            <Text style={styles.infoValue}>
              {format(new Date(document.metadata.date), 'dd/MM/yyyy')}
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Reference</Text>
            <Text style={styles.infoValue}>{document.metadata.reference}</Text>
          </View>
          {document.metadata.amount && (
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Amount</Text>
              <Text style={styles.infoValue}>{document.metadata.amount}</Text>
            </View>
          )}
          {document.metadata.notes && (
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Notes</Text>
              <Text style={styles.infoValue}>{document.metadata.notes}</Text>
            </View>
          )}
        </View>

        <TouchableOpacity style={styles.viewButton} onPress={handleViewDocument}>
          <MaterialIcons name="visibility" size={24} color="#fff" />
          <Text style={styles.viewButtonText}>View Document</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    marginTop: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  content: {
    flex: 1,
  },
  documentHeader: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 16,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  documentTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 12,
    flex: 1,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  section: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoLabel: {
    fontSize: 16,
    color: '#666',
    flex: 1,
  },
  infoValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
    flex: 2,
    textAlign: 'right',
  },
  viewButton: {
    backgroundColor: '#4CAF50',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    margin: 16,
    borderRadius: 8,
  },
  viewButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
});

export default DocumentDetailsScreen;
