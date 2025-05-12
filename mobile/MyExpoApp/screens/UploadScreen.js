import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  TextInput, 
  Alert, 
  ActivityIndicator 
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';

const CATEGORIES = [
  { id: 'purchase', label: 'Purchase Invoice' },
  { id: 'sale', label: 'Sale Invoice' },
  { id: 'payment', label: 'Payment Receipt' },
  { id: 'delivery', label: 'Delivery Note' },
];

const UploadScreen = () => {
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
  const handleUpload = () => {
    if (selectedFiles.length === 0) {
      Alert.alert('No Files', 'Please select at least one file to upload.');
      return;
    }

    if (!fileMetadata.category) {
      Alert.alert('Category Required', 'Please select a document category.');
      return;
    }

    setUploading(true);

    // Mock upload process (replace with real upload logic)
    setTimeout(() => {
      Alert.alert('Upload Successful', 'Your documents have been uploaded!');
      setUploading(false);
      resetMetadataForm();
      setSelectedFiles([]);
    }, 2000); // Simulate a 2-second upload delay
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Upload Documents</Text>
      <Text style={styles.subtitle}>Upload your invoices, receipts, and other financial documents</Text>
      
      <ScrollView style={styles.fileList}>
        {selectedFiles.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No files selected</Text>
            <Text style={styles.emptySubtext}>Tap the button below to select files</Text>
          </View>
        ) : (
          selectedFiles.map((file) => (
            <View key={file.id} style={styles.fileItem}>
              <Text style={styles.fileName}>{file.name}</Text>
            </View>
          ))
        )}
      </ScrollView>

      <View style={styles.formContainer}>
        <Text style={styles.formTitle}>Document Metadata</Text>
        
        {/* Category Selection */}
        <Text style={styles.label}>Category</Text>
        <ScrollView horizontal>
          {CATEGORIES.map((category) => (
            <TouchableOpacity 
              key={category.id}
              style={[styles.categoryButton, fileMetadata.category === category.id && styles.selectedCategory]}
              onPress={() => selectCategory(category.id)}
            >
              <Text style={styles.categoryText}>{category.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Input Fields */}
        <Text style={styles.label}>Amount</Text>
        <TextInput
          style={styles.input}
          value={fileMetadata.amount}
          onChangeText={(value) => handleInputChange('amount', value)}
          keyboardType="numeric"
        />

        <Text style={styles.label}>Date</Text>
        <TextInput
          style={styles.input}
          value={fileMetadata.date}
          onChangeText={(value) => handleInputChange('date', value)}
        />

        <Text style={styles.label}>Entity (Supplier/Customer)</Text>
        <TextInput
          style={styles.input}
          value={fileMetadata.entity}
          onChangeText={(value) => handleInputChange('entity', value)}
        />

        <Text style={styles.label}>Notes</Text>
        <TextInput
          style={styles.input}
          value={fileMetadata.notes}
          onChangeText={(value) => handleInputChange('notes', value)}
        />
      </View>

      {/* Upload Button */}
      <TouchableOpacity 
        style={[styles.button, uploading && styles.disabledButton]} 
        onPress={handleUpload} 
        disabled={uploading}
      >
        {uploading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.buttonText}>Upload Documents</Text>
        )}
      </TouchableOpacity>

      {/* Select Files Button */}
      <TouchableOpacity style={styles.button} onPress={pickDocument}>
        <Text style={styles.buttonText}>Select Files</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f7f7f7',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 10,
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 20,
    color: '#777',
  },
  emptyState: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
  },
  emptyText: {
    fontSize: 18,
    color: '#333',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#777',
  },
  fileItem: {
    marginBottom: 10,
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  fileName: {
    fontSize: 16,
    color: '#333',
  },
  formContainer: {
    marginTop: 20,
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  label: {
    fontSize: 14,
    marginVertical: 5,
    color: '#333',
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 15,
  },
  categoryButton: {
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 8,
    marginRight: 10,
  },
  selectedCategory: {
    backgroundColor: '#4CAF50',
  },
  categoryText: {
    color: '#333',
  },
  button: {
    backgroundColor: '#4CAF50',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 10,
  },
  disabledButton: {
    backgroundColor: '#d3d3d3',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default UploadScreen;
