import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  ScrollView,
  SafeAreaView,
  ActivityIndicator
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { getDocuments } from '../api/documents';
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

const UploadHistoryScreen = ({ route, navigation }) => {
  const { userData } = route.params;
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    category: '',
    status: ''
  });
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const docs = await getDocuments('', userData.id);
      setDocuments(docs);
    } catch (error) {
      console.error('Error loading documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = (docs) => {
    return docs.filter(doc => {
      // Date filter
      if (filters.startDate && new Date(doc.metadata.date) < new Date(filters.startDate)) {
        return false;
      }
      if (filters.endDate && new Date(doc.metadata.date) > new Date(filters.endDate)) {
        return false;
      }

      // Category filter
      if (filters.category && doc.category !== filters.category) {
        return false;
      }

      // Status filter
      if (filters.status && doc.status !== filters.status) {
        return false;
      }

      // Search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          doc.title.toLowerCase().includes(query) ||
          doc.metadata.partyName.toLowerCase().includes(query) ||
          doc.metadata.reference.toLowerCase().includes(query)
        );
      }

      return true;
    });
  };

  const renderFilterModal = () => (
    <Modal
      visible={showFilters}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowFilters(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Filter Documents</Text>
            <TouchableOpacity onPress={() => setShowFilters(false)}>
              <MaterialIcons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.filterContent}>
            <View style={styles.filterGroup}>
              <Text style={styles.filterLabel}>Date Range</Text>
              <TextInput
                style={styles.input}
                placeholder="Start Date (YYYY-MM-DD)"
                value={filters.startDate}
                onChangeText={(text) => setFilters(prev => ({ ...prev, startDate: text }))}
              />
              <TextInput
                style={styles.input}
                placeholder="End Date (YYYY-MM-DD)"
                value={filters.endDate}
                onChangeText={(text) => setFilters(prev => ({ ...prev, endDate: text }))}
              />
            </View>

            <View style={styles.filterGroup}>
              <Text style={styles.filterLabel}>Category</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                  <TouchableOpacity
                    key={key}
                    style={[
                      styles.categoryChip,
                      filters.category === key && styles.selectedCategoryChip
                    ]}
                    onPress={() => setFilters(prev => ({ 
                      ...prev, 
                      category: prev.category === key ? '' : key 
                    }))}
                  >
                    <Text style={[
                      styles.categoryChipText,
                      filters.category === key && styles.selectedCategoryChipText
                    ]}>
                      {label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View style={styles.filterGroup}>
              <Text style={styles.filterLabel}>Status</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {Object.entries(STATUS_LABELS).map(([key, label]) => (
                  <TouchableOpacity
                    key={key}
                    style={[
                      styles.statusChip,
                      filters.status === key && styles.selectedStatusChip,
                      { borderColor: STATUS_COLORS[key] }
                    ]}
                    onPress={() => setFilters(prev => ({ 
                      ...prev, 
                      status: prev.status === key ? '' : key 
                    }))}
                  >
                    <Text style={[
                      styles.statusChipText,
                      filters.status === key && styles.selectedStatusChipText,
                      { color: STATUS_COLORS[key] }
                    ]}>
                      {label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity 
              style={styles.resetButton}
              onPress={() => setFilters({
                startDate: '',
                endDate: '',
                category: '',
                status: ''
              })}
            >
              <Text style={styles.resetButtonText}>Reset Filters</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.applyButton}
              onPress={() => setShowFilters(false)}
            >
              <Text style={styles.applyButtonText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderDocumentItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.documentItem}
      onPress={() => navigation.navigate('DocumentDetails', { document: item })}
    >
      <View style={styles.documentHeader}>
        <View style={styles.documentTitleContainer}>
          <MaterialIcons 
            name={item.fileType === 'pdf' ? 'picture-as-pdf' : 'image'} 
            size={24} 
            color="#666" 
          />
          <Text style={styles.documentTitle} numberOfLines={1}>
            {item.title}
          </Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[item.status] }]}>
          <Text style={styles.statusText}>{STATUS_LABELS[item.status]}</Text>
        </View>
      </View>

      <View style={styles.documentDetails}>
        <Text style={styles.detailText}>
          <Text style={styles.detailLabel}>Category: </Text>
          {CATEGORY_LABELS[item.category]}
        </Text>
        <Text style={styles.detailText}>
          <Text style={styles.detailLabel}>Date: </Text>
          {format(new Date(item.metadata.date), 'dd/MM/yyyy')}
        </Text>
        <Text style={styles.detailText}>
          <Text style={styles.detailLabel}>Party: </Text>
          {item.metadata.partyName}
        </Text>
        <Text style={styles.detailText}>
          <Text style={styles.detailLabel}>Reference: </Text>
          {item.metadata.reference}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Document History</Text>
        <TouchableOpacity 
          style={styles.filterButton}
          onPress={() => setShowFilters(true)}
        >
          <MaterialIcons name="filter-list" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <MaterialIcons name="search" size={24} color="#666" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search documents..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
        </View>
      ) : (
        <FlatList
          data={applyFilters(documents)}
          renderItem={renderDocumentItem}
          keyExtractor={item => item._id}
          contentContainerStyle={styles.listContainer}
          refreshing={loading}
          onRefresh={loadDocuments}
        />
      )}

      {renderFilterModal()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
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
  filterButton: {
    padding: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#333',
  },
  listContainer: {
    padding: 16,
  },
  documentItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  documentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  documentTitleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  documentTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginLeft: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  documentDetails: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 12,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  detailLabel: {
    fontWeight: '500',
    color: '#333',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  filterContent: {
    maxHeight: '70%',
  },
  filterGroup: {
    marginBottom: 20,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    fontSize: 16,
    color: '#333',
  },
  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    marginRight: 8,
  },
  selectedCategoryChip: {
    backgroundColor: '#4CAF50',
  },
  categoryChipText: {
    color: '#666',
    fontSize: 14,
  },
  selectedCategoryChipText: {
    color: '#fff',
  },
  statusChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    marginRight: 8,
  },
  selectedStatusChip: {
    backgroundColor: '#f0f0f0',
  },
  statusChipText: {
    fontSize: 14,
  },
  selectedStatusChipText: {
    fontWeight: '500',
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  resetButton: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#666',
  },
  resetButtonText: {
    color: '#666',
    fontSize: 16,
  },
  applyButton: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#4CAF50',
  },
  applyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default UploadHistoryScreen; 