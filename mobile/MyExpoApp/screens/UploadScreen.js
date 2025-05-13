import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  TextInput, 
  Alert, 
  ActivityIndicator,
  SafeAreaView,
  Dimensions 
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { addDocument } from '../api/documents';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const CATEGORIES = [
  { id: 'purchase', label: 'Purchase Invoice', icon: 'receipt-long' },
  { id: 'sale', label: 'Sale Invoice', icon: 'point-of-sale' },
  { id: 'payment', label: 'Payment Receipt', icon: 'payments' },
  { id: 'delivery', label: 'Delivery Note', icon: 'local-shipping' },
];

const UploadScreen = ({ route, navigation }) => {
  const { userData } = route.params;
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [fileMetadata, setFileMetadata] = useState({
    category: '',
    date: '',
    amount: '',
    entity: '', 
    notes: ''
  });

  // Function to pick a document
  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'], // Allow PDF and images
        multiple: true,
      });

      if (result.canceled) {
        return;
      }

      const newFiles = result.assets.map(file => ({
        ...file,
        id: Math.random().toString(36).substring(7),
      }));

      setSelectedFiles([...selectedFiles, ...newFiles]);
    } catch (error) {
      console.error('Error picking document', error);
      Alert.alert('Error', 'An error occurred while selecting the file.');
    }
  };

  // Function to handle category selection
  const selectCategory = (category) => {
    setFileMetadata({ ...fileMetadata, category });
  };

  // Function to handle input change
  const handleInputChange = (field, value) => {
    setFileMetadata({ ...fileMetadata, [field]: value });
  };

  // Function to reset metadata form
  const resetMetadataForm = () => {
    setFileMetadata({
      category: '',
      date: '',
      amount: '',
      entity: '',
      notes: ''
    });
  };

  // Function to handle file upload
  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      Alert.alert('No Files', 'Please select at least one file to upload.');
      return;
    }

    if (!fileMetadata.category) {
      Alert.alert('Category Required', 'Please select a document category.');
      return;
    }

    setUploading(true);

    try {
      // Upload each file with its metadata
      for (const file of selectedFiles) {
        const documentData = {
          title: file.name,
          description: fileMetadata.notes,
          clientId: userData.id, // From route params
          type: fileMetadata.category,
          metadata: {
            date: fileMetadata.date,
            amount: fileMetadata.amount,
            entity: fileMetadata.entity,
            originalFilename: file.name
          }
        };

        await addDocument(documentData);
      }

      Alert.alert(
        'Upload Successful', 
        'Your documents have been uploaded successfully!'
      );
      
      // Reset form
      resetMetadataForm();
      setSelectedFiles([]);
    } catch (error) {
      console.error('Upload error:', error);
      Alert.alert(
        'Upload Failed', 
        error.message || 'An error occurred while uploading the documents.'
      );
    } finally {
      setUploading(false);
    }
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity 
        style={styles.backButton} 
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={24} color="#333" />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Upload Documents</Text>
    </View>
  );

  const renderFileItem = (file) => (
    <View key={file.id} style={styles.fileItem}>
      <MaterialIcons name="description" size={24} color="#4CAF50" />
      <Text style={styles.fileName} numberOfLines={1}>{file.name}</Text>
      <TouchableOpacity 
        onPress={() => setSelectedFiles(files => files.filter(f => f.id !== file.id))}
        style={styles.removeButton}
      >
        <MaterialIcons name="close" size={20} color="#ff4444" />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.uploadSection}>
          <TouchableOpacity 
            style={styles.uploadArea} 
            onPress={pickDocument}
            disabled={uploading}
          >
            <MaterialIcons name="cloud-upload" size={48} color="#4CAF50" />
            <Text style={styles.uploadText}>
              {selectedFiles.length > 0 
                ? `${selectedFiles.length} file(s) selected` 
                : 'Tap to select files'}
            </Text>
          </TouchableOpacity>
        </View>

        {selectedFiles.length > 0 && (
          <View style={styles.filesSection}>
            <Text style={styles.sectionTitle}>Selected Files</Text>
            {selectedFiles.map(renderFileItem)}
          </View>
        )}

        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Document Details</Text>
          
          <Text style={styles.label}>Category *</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.categoriesContainer}
          >
            {CATEGORIES.map((category) => (
              <TouchableOpacity 
                key={category.id}
                style={[
                  styles.categoryButton,
                  fileMetadata.category === category.id && styles.selectedCategory
                ]}
                onPress={() => selectCategory(category.id)}
              >
                <MaterialIcons 
                  name={category.icon} 
                  size={24} 
                  color={fileMetadata.category === category.id ? '#fff' : '#666'} 
                />
                <Text style={[
                  styles.categoryText,
                  fileMetadata.category === category.id && styles.selectedCategoryText
                ]}>
                  {category.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Input Fields with improved styling */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Amount *</Text>
            <TextInput
              style={styles.input}
              value={fileMetadata.amount}
              onChangeText={(value) => handleInputChange('amount', value)}
              keyboardType="numeric"
              placeholder="Enter amount"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Date *</Text>
            <TextInput
              style={styles.input}
              value={fileMetadata.date}
              onChangeText={(value) => handleInputChange('date', value)}
              placeholder="DD/MM/YYYY"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Entity Name</Text>
            <TextInput
              style={styles.input}
              value={fileMetadata.entity}
              onChangeText={(value) => handleInputChange('entity', value)}
              placeholder="Enter supplier/customer name"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Notes</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={fileMetadata.notes}
              onChangeText={(value) => handleInputChange('notes', value)}
              placeholder="Add any additional notes"
              placeholderTextColor="#999"
              multiline
              numberOfLines={4}
            />
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.submitButton, 
            (uploading || selectedFiles.length === 0) && styles.disabledButton
          ]} 
          onPress={handleUpload}
          disabled={uploading || selectedFiles.length === 0}
        >
          {uploading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <MaterialIcons name="cloud-upload" size={24} color="#fff" />
              <Text style={styles.submitButtonText}>Upload Documents</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
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
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 16,
    color: '#333',
  },
  content: {
    flex: 1,
  },
  uploadSection: {
    padding: 20,
  },
  uploadArea: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    borderWidth: 2,
    borderColor: '#4CAF50',
    borderStyle: 'dashed',
    borderRadius: 12,
    backgroundColor: '#f0f9f0',
  },
  uploadText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  filesSection: {
    padding: 20,
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  fileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginBottom: 8,
  },
  fileName: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    color: '#333',
  },
  removeButton: {
    padding: 4,
  },
  formSection: {
    padding: 20,
    backgroundColor: '#fff',
  },
  categoriesContainer: {
    marginBottom: 20,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: '#f0f0f0',
    minWidth: width * 0.35,
  },
  selectedCategory: {
    backgroundColor: '#4CAF50',
  },
  categoryText: {
    marginLeft: 8,
    color: '#666',
    fontSize: 14,
  },
  selectedCategoryText: {
    color: '#fff',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  footer: {
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 8,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
});

export default UploadScreen;
