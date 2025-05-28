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
  Dimensions,
  Image 
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { addDocument } from '../api/documents';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const CATEGORIES = [
  // Purchase categories
  { id: 'purchase_invoice', label: 'Purchase Invoice', icon: 'receipt-long', type: 'purchase' },
  { id: 'purchase_payment', label: 'Purchase Payment Proof', icon: 'payments', type: 'purchase' },
  { id: 'purchase_delivery', label: 'Purchase Delivery Note', icon: 'local-shipping', type: 'purchase' },
  // Sale categories
  { id: 'sale_invoice', label: 'Sale Invoice', icon: 'receipt-long', type: 'sale' },
  { id: 'sale_payment', label: 'Sale Payment Proof', icon: 'payments', type: 'sale' },
  { id: 'sale_delivery', label: 'Sale Delivery Note', icon: 'local-shipping', type: 'sale' },
];

const UploadScreen = ({ route, navigation }) => {
  const { userData } = route.params;
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [justificationFile, setJustificationFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [fileMetadata, setFileMetadata] = useState({
    category: '',
    date: '',
    amount: '',
    partyName: '',
    reference: '',
    notes: '',
    partyType: 'Supplier'
  });
  const [showCaptureOptions, setShowCaptureOptions] = useState(false);
  const [showJustificationOptions, setShowJustificationOptions] = useState(false);

  // Function to handle camera capture
  const handleCameraCapture = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Camera permission is required to take photos.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
        allowsEditing: true,
      });

      if (!result.canceled) {
        const newFile = {
          ...result.assets[0],
          id: Math.random().toString(36).substring(7),
          name: `camera_${Date.now()}.jpg`,
        };
        setSelectedFiles([...selectedFiles, newFile]);
      }
    } catch (error) {
      console.error('Error capturing image:', error);
      Alert.alert('Error', 'An error occurred while capturing the image.');
    }
  };

  // Function to handle justification document capture
  const handleJustificationCapture = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Camera permission is required to take photos.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
        allowsEditing: true,
      });

      if (!result.canceled) {
        setJustificationFile({
          ...result.assets[0],
          id: Math.random().toString(36).substring(7),
          name: `justification_${Date.now()}.jpg`,
        });
      }
    } catch (error) {
      console.error('Error capturing justification image:', error);
      Alert.alert('Error', 'An error occurred while capturing the image.');
    }
  };

  // Function to pick a document
  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
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

  // Function to pick a justification document
  const pickJustificationDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
      });

      if (result.canceled) {
        return;
      }

      setJustificationFile({
        ...result.assets[0],
        id: Math.random().toString(36).substring(7),
      });
    } catch (error) {
      console.error('Error picking justification document', error);
      Alert.alert('Error', 'An error occurred while selecting the file.');
    }
  };

  // Function to handle category selection
  const selectCategory = (category) => {
    setFileMetadata(prev => ({ 
      ...prev, 
      category,
      partyType: category.startsWith('purchase_') ? 'Supplier' : 'Customer'
    }));
  };

  // Function to handle input change
  const handleInputChange = (field, value) => {
    setFileMetadata(prev => ({ ...prev, [field]: value }));
  };

  // Function to reset metadata form
  const resetMetadataForm = () => {
    setFileMetadata({
      category: '',
      date: '',
      amount: '',
      partyName: '',
      reference: '',
      notes: '',
      partyType: 'Supplier'
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

    if (!fileMetadata.date || !fileMetadata.partyName || !fileMetadata.reference) {
      Alert.alert('Required Fields', 'Please fill in all required fields (Date, Party Name, Reference).');
      return;
    }

    if (!userData?.id) {
      Alert.alert('Error', 'User information is missing. Please try logging in again.');
      return;
    }

    setUploading(true);

    try {
      // Upload each file with its metadata
      for (const file of selectedFiles) {
        const documentData = {
          title: file.name,
          fileUrl: file.uri,
          fileType: file.type || 'image/jpeg',
          category: fileMetadata.category,
          metadata: {
            date: fileMetadata.date,
            amount: fileMetadata.amount,
            partyName: fileMetadata.partyName,
            partyType: fileMetadata.partyType,
            reference: fileMetadata.reference,
            notes: fileMetadata.notes
          }
        };

        await addDocument(documentData, userData.id, justificationFile?.uri);
      }

      Alert.alert(
        'Upload Successful', 
        'Your documents have been uploaded successfully!'
      );
      
      // Reset form
      resetMetadataForm();
      setSelectedFiles([]);
      setJustificationFile(null);
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

  // Function to render capture options modal
  const renderCaptureOptions = () => (
    <View style={styles.modalContainer}>
      <View style={styles.modalContent}>
        <TouchableOpacity 
          style={styles.modalOption} 
          onPress={() => {
            handleCameraCapture();
            setShowCaptureOptions(false);
          }}
        >
          <MaterialIcons name="camera-alt" size={24} color="#4CAF50" />
          <Text style={styles.modalOptionText}>Take Photo</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.modalOption} 
          onPress={() => {
            pickDocument();
            setShowCaptureOptions(false);
          }}
        >
          <MaterialIcons name="folder" size={24} color="#4CAF50" />
          <Text style={styles.modalOptionText}>Choose from Gallery</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Function to render justification options modal
  const renderJustificationOptions = () => (
    <View style={styles.modalContainer}>
      <View style={styles.modalContent}>
        <TouchableOpacity 
          style={styles.modalOption} 
          onPress={() => {
            handleJustificationCapture();
            setShowJustificationOptions(false);
          }}
        >
          <MaterialIcons name="camera-alt" size={24} color="#4CAF50" />
          <Text style={styles.modalOptionText}>Take Photo</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.modalOption} 
          onPress={() => {
            pickJustificationDocument();
            setShowJustificationOptions(false);
          }}
        >
          <MaterialIcons name="folder" size={24} color="#4CAF50" />
          <Text style={styles.modalOptionText}>Choose from Gallery</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity 
        style={styles.backButton} 
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={24} color="#333" />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Upload Document</Text>
      <TouchableOpacity 
        style={styles.historyButton}
        onPress={() => navigation.navigate('UploadHistory', { userData })}
      >
        <MaterialIcons name="history" size={24} color="#4CAF50" />
      </TouchableOpacity>
    </View>
  );

  const renderUploadArea = () => (
    <View style={styles.uploadSection}>
      <TouchableOpacity 
        style={[
          styles.uploadArea,
          selectedFiles.length > 0 && styles.uploadAreaWithFiles
        ]} 
        onPress={() => setShowCaptureOptions(true)}
        disabled={uploading}
      >
        <MaterialIcons 
          name={selectedFiles.length > 0 ? "cloud-done" : "add-a-photo"} 
          size={48} 
          color="#4CAF50" 
        />
        <Text style={styles.uploadText}>
          {selectedFiles.length > 0 
            ? `${selectedFiles.length} file(s) selected` 
            : 'Tap to add documents'}
        </Text>
        {selectedFiles.length > 0 && (
          <Text style={styles.uploadSubText}>
            Tap to add more documents
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );

  const renderFileItem = (file) => (
    <View key={file.id} style={styles.fileItem}>
      <View style={styles.fileInfo}>
        {file.type?.startsWith('image/') ? (
          <Image 
            source={{ uri: file.uri }} 
            style={styles.fileThumbnail} 
          />
        ) : (
          <View style={styles.fileIconContainer}>
            <MaterialIcons name="description" size={24} color="#4CAF50" />
          </View>
        )}
        <Text style={styles.fileName} numberOfLines={1}>{file.name}</Text>
      </View>
      <TouchableOpacity 
        onPress={() => setSelectedFiles(files => files.filter(f => f.id !== file.id))}
        style={styles.removeButton}
      >
        <MaterialIcons name="close" size={20} color="#ff4444" />
      </TouchableOpacity>
    </View>
  );

  const renderCategoryButton = (category) => (
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
  );

  const renderJustificationFile = () => (
    <View style={styles.fileItem}>
      {justificationFile?.type?.startsWith('image/') ? (
        <Image 
          source={{ uri: justificationFile.uri }} 
          style={styles.fileThumbnail} 
        />
      ) : (
        <MaterialIcons name="description" size={24} color="#4CAF50" />
      )}
      <Text style={styles.fileName} numberOfLines={1}>
        {justificationFile?.name || 'Justification Document'}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      
      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {renderUploadArea()}

        {showCaptureOptions && renderCaptureOptions()}
        {showJustificationOptions && renderJustificationOptions()}

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
            contentContainerStyle={styles.categoriesContent}
          >
            {CATEGORIES.map(renderCategoryButton)}
          </ScrollView>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Date *</Text>
            <TextInput
              style={styles.input}
              value={fileMetadata.date}
              onChangeText={(value) => handleInputChange('date', value)}
              placeholder="DD-MM-YYYY"
              placeholderTextColor="#999"
              keyboardType="numeric"
              maxLength={10}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>{fileMetadata.partyType} Name *</Text>
            <TextInput
              style={styles.input}
              value={fileMetadata.partyName}
              onChangeText={(value) => handleInputChange('partyName', value)}
              placeholder={`Enter ${fileMetadata.partyType.toLowerCase()} name`}
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Reference Number *</Text>
            <TextInput
              style={styles.input}
              value={fileMetadata.reference}
              onChangeText={(value) => handleInputChange('reference', value)}
              placeholder="Enter document reference number"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Amount</Text>
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

          <View style={styles.justificationSection}>
            <Text style={styles.sectionTitle}>Justification Document (Optional)</Text>
            <TouchableOpacity 
              style={[
                styles.justificationButton,
                justificationFile && styles.justificationButtonWithFile
              ]}
              onPress={() => setShowJustificationOptions(true)}
              disabled={uploading}
            >
              <MaterialIcons 
                name={justificationFile ? "attach-file" : "add-circle-outline"} 
                size={24} 
                color="#4CAF50" 
              />
              <Text style={styles.justificationButtonText}>
                {justificationFile ? 'Change Justification' : 'Add Justification'}
              </Text>
            </TouchableOpacity>
            {justificationFile && renderJustificationFile()}
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={[
            styles.submitButton, 
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
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    elevation: 2,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  historyButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
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
  uploadAreaWithFiles: {
    padding: 20,
    backgroundColor: '#e8f5e9',
  },
  uploadText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  uploadSubText: {
    marginTop: 4,
    fontSize: 14,
    color: '#4CAF50',
  },
  filesSection: {
    padding: 20,
    backgroundColor: '#fff',
    marginBottom: 8,
    borderRadius: 12,
    marginHorizontal: 16,
    elevation: 2,
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
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginBottom: 8,
  },
  fileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  fileIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 4,
    backgroundColor: '#e8f5e9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fileThumbnail: {
    width: 40,
    height: 40,
    borderRadius: 4,
  },
  fileName: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    color: '#333',
  },
  removeButton: {
    padding: 8,
    marginLeft: 8,
  },
  formSection: {
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginHorizontal: 16,
    elevation: 2,
  },
  categoriesContainer: {
    marginBottom: 20,
  },
  categoriesContent: {
    paddingRight: 16,
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
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  justificationSection: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  justificationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#4CAF50',
    borderRadius: 8,
    marginTop: 8,
    backgroundColor: '#fff',
  },
  justificationButtonWithFile: {
    backgroundColor: '#e8f5e9',
  },
  justificationButtonText: {
    marginLeft: 8,
    color: '#4CAF50',
    fontSize: 16,
  },
  footer: {
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    elevation: 4,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 8,
    elevation: 2,
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
  modalContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '80%',
    elevation: 4,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalOptionText: {
    marginLeft: 16,
    fontSize: 16,
    color: '#333',
  },
});

export default UploadScreen;
