import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  Alert,
  ActivityIndicator,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import axios from 'axios';

// API URL configuration
const API_URL = Platform.OS === 'web' 
  ? 'http://localhost:5000/api' // Use localhost for web development
  : 'http://10.0.2.2:5000/api';  // Use 10.0.2.2 for Android emulator (points to host's localhost)
                                // For a real device, use your computer's actual IP address

const CATEGORIES = [
  { id: 'purchase', label: 'Purchase Invoice' },
  { id: 'sale', label: 'Sale Invoice' },
  { id: 'payment', label: 'Payment Receipt' },
  { id: 'delivery', label: 'Delivery Note' },
];

const UploadScreen = ({ navigation, route }) => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [modalVisible, setModalVisible] = useState(false);
  const [currentFile, setCurrentFile] = useState(null);
  const [fileMetadata, setFileMetadata] = useState({
    category: '',
    date: '',
    amount: '',
    entity: '', // supplier or customer
    notes: ''
  });
  
  // Get user data from route params
  const userData = route.params?.userData || {};

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

  // Function to select files
  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'], // Restrict to PDF and images
        multiple: true, // Allow multiple file selection
        copyToCacheDirectory: true
      });

      if (result.canceled) {
        return;
      }

      // Handle selected files
      const newFiles = result.assets.map(file => ({
        ...file,
        id: Math.random().toString(36).substring(7),
        uploaded: false,
        error: null,
        metadata: null
      }));

      setSelectedFiles([...selectedFiles, ...newFiles]);
      
      // If there's at least one new file, prompt for metadata
      if (newFiles.length > 0) {
        setCurrentFile(newFiles[0]);
        setModalVisible(true);
      }
    } catch (error) {
      console.error('Error picking document', error);
      Alert.alert('Error', 'An error occurred while selecting the file.');
    }
  };

  // Function to handle category selection
  const selectCategory = (category) => {
    setFileMetadata({...fileMetadata, category: category});
  };

  // Function to save metadata for current file
  const saveMetadata = () => {
    if (!fileMetadata.category) {
      Alert.alert('Required Field', 'Please select a document category.');
      return;
    }

    // Find current file in our state and update it
    setSelectedFiles(prev => 
      prev.map(file => 
        file.id === currentFile.id 
          ? { ...file, metadata: { ...fileMetadata } } 
          : file
      )
    );

    // Get next file that needs metadata
    const nextFile = selectedFiles.find(
      file => file.id !== currentFile.id && !file.metadata && !file.uploaded
    );

    if (nextFile) {
      // Reset form and show for next file
      resetMetadataForm();
      setCurrentFile(nextFile);
    } else {
      // Close modal if no more files need metadata
      setModalVisible(false);
      setCurrentFile(null);
      resetMetadataForm();
    }
  };

  // Function to handle API errors more gracefully
  const handleApiError = (error) => {
    console.error('API Error:', error);
    
    if (!error.response) {
      // Network error
      if (error.message === 'Network Error') {
        return `Cannot connect to the server. Please check that your backend server is running at ${API_URL}`;
      }
      return error.message || 'An unknown error occurred';
    }
    
    // Server returned an error
    if (error.response.data && error.response.data.message) {
      return error.response.data.message;
    }
    
    // Default error message based on status
    switch (error.response.status) {
      case 400:
        return 'Invalid request. Please check your file and try again.';
      case 401:
        return 'Unauthorized. Please log in again.';
      case 403:
        return 'You do not have permission to upload files.';
      case 404:
        return 'The requested resource was not found.';
      case 413:
        return 'The file is too large to upload.';
      case 500:
        return 'Server error. Please try again later.';
      default:
        return `Error ${error.response.status}: ${error.response.statusText}`;
    }
  };

  // Function to upload a single file
  const uploadFile = async (file) => {
    try {
      // Create form data
      const formData = new FormData();
      formData.append('file', {
        uri: file.uri,
        type: file.mimeType || 'application/octet-stream',
        name: file.name
      });
      
      // Add user information if available
      if (userData && userData._id) {
        formData.append('userId', userData._id);
      } else {
        // For testing - use a default user ID if none is provided
        // In production, you should require proper authentication
        formData.append('userId', '64e5ac12345678901234567'); // Replace with a valid MongoDB ObjectId
      }

      // Add metadata if available
      if (file.metadata) {
        // Append each metadata field
        Object.keys(file.metadata).forEach(key => {
          if (file.metadata[key]) {
            formData.append(key, file.metadata[key]);
          }
        });
      }
      
      console.log(`Uploading file to ${API_URL}/files/upload`);
      
      // Upload the file
      const response = await axios.post(
        `${API_URL}/files/upload`, 
        formData, 
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (progressEvent) => {
            const progress = (progressEvent.loaded / progressEvent.total) * 100;
            setUploadProgress(prev => ({
              ...prev,
              [file.id]: progress
            }));
          },
          timeout: 30000 // 30 second timeout
        }
      );
      
      console.log('Upload response:', response.data);
      return response.data;
    } catch (error) {
      const errorMessage = handleApiError(error);
      console.error('Error uploading file:', errorMessage);
      throw new Error(errorMessage);
    }
  };

  // Function to upload all files
  const uploadAllFiles = async () => {
    if (selectedFiles.length === 0) {
      Alert.alert('No Files', 'Please select files to upload first.');
      return;
    }

    // Check if all files have metadata
    const filesWithoutMetadata = selectedFiles.filter(
      file => !file.uploaded && !file.metadata
    );

    if (filesWithoutMetadata.length > 0) {
      setCurrentFile(filesWithoutMetadata[0]);
      setModalVisible(true);
      return;
    }

    // Check if backend server is reachable before starting uploads
    try {
      setUploading(true);
      
      // Simple ping to check if server is reachable
      await axios.get(`${API_URL}/files/ping`, { timeout: 5000 }).catch(error => {
        // If ping endpoint doesn't exist, that's okay - just checking connectivity
        if (error.response) {
          // If we get any response, server is up
          return;
        }
        // If no response at all, throw error
        throw new Error(`Cannot connect to server at ${API_URL}. Please check that your backend is running.`);
      });
      
      let successCount = 0;
      let failCount = 0;
      
      for (const file of selectedFiles) {
        if (file.uploaded) continue;
        
        try {
          // Reset progress for this file
          setUploadProgress(prev => ({
            ...prev,
            [file.id]: 0
          }));

          // Upload the file
          const result = await uploadFile(file);

          // Mark file as uploaded and store the result
          if (result && result.success) {
            setSelectedFiles(prev => 
              prev.map(f => 
                f.id === file.id 
                  ? { ...f, uploaded: true, fileId: result.fileId } 
                  : f
              )
            );
            successCount++;
          } else {
            throw new Error(result?.message || 'Upload failed');
          }
        } catch (error) {
          failCount++;
          
          // Mark file as having an error
          setSelectedFiles(prev => 
            prev.map(f => 
              f.id === file.id 
                ? { ...f, error: error.message || 'Upload failed' } 
                : f
            )
          );
        }
      }

      setUploading(false);
      
      if (successCount > 0 && failCount === 0) {
        Alert.alert('Upload Complete', `Successfully uploaded ${successCount} file${successCount !== 1 ? 's' : ''}.`);
      } else if (successCount > 0 && failCount > 0) {
        Alert.alert('Upload Partially Complete', 
          `Uploaded ${successCount} file${successCount !== 1 ? 's' : ''} successfully, but ${failCount} file${failCount !== 1 ? 's' : ''} failed.`);
      } else if (failCount > 0) {
        Alert.alert('Upload Failed', `Failed to upload ${failCount} file${failCount !== 1 ? 's' : ''}.`);
      }
    } catch (error) {
      setUploading(false);
      Alert.alert('Connection Error', error.message);
    }
  };

  // Function to remove a file from the list
  const removeFile = (id) => {
    setSelectedFiles(prev => prev.filter(file => file.id !== id));
  };

  // Function to get file icon based on type
  const getFileIcon = (file) => {
    // Use emoji for file types instead of image assets
    if (file.mimeType) {
      if (file.mimeType.includes('pdf')) {
        return '📄'; // PDF document
      } else if (file.mimeType.includes('image')) {
        return '🖼️'; // Image
      } else if (file.mimeType.includes('word') || file.mimeType.includes('document')) {
        return '📝'; // Word document
      } else if (file.mimeType.includes('excel') || file.mimeType.includes('sheet')) {
        return '📊'; // Spreadsheet
      } else if (file.mimeType.includes('zip') || file.mimeType.includes('rar')) {
        return '🗜️'; // Compressed file
      } else if (file.mimeType.includes('audio')) {
        return '🎵'; // Audio file
      } else if (file.mimeType.includes('video')) {
        return '🎬'; // Video file
      }
    }
    
    // Default file icon
    return '📁';
  };

  // Function to get category label
  const getCategoryLabel = (categoryId) => {
    const category = CATEGORIES.find(cat => cat.id === categoryId);
    return category ? category.label : 'Not Categorized';
  };

  // Function to render the progress indicator
  const renderProgress = (file) => {
    const progress = uploadProgress[file.id] || 0;
    
    if (file.uploaded) {
      return (
        <View style={styles.fileStatus}>
          <Text style={styles.successText}>✓ Uploaded</Text>
        </View>
      );
    }
    
    if (file.error) {
      return (
        <View style={styles.fileStatus}>
          <Text style={styles.errorText}>✗ Failed</Text>
        </View>
      );
    }
    
    if (uploading && progress > 0) {
      return (
        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { width: `${progress}%` }]} />
          <Text style={styles.progressText}>{Math.round(progress)}%</Text>
        </View>
      );
    }
    
    return null;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Upload Financial Documents</Text>
        <Text style={styles.subtitle}>Upload invoices, receipts and other financial documents</Text>
      </View>
      
      <ScrollView style={styles.fileList}>
        {selectedFiles.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyText}>No files selected</Text>
            <Text style={styles.emptySubtext}>Tap the button below to select files</Text>
          </View>
        ) : (
          selectedFiles.map((file) => (
            <View key={file.id} style={styles.fileItem}>
              <View style={styles.fileInfo}>
                <View style={styles.fileIconContainer}>
                  <Text style={styles.fileIconText}>
                    {getFileIcon(file)}
                  </Text>
                </View>
                <View style={styles.fileDetails}>
                  <Text style={styles.fileName} numberOfLines={1}>{file.name}</Text>
                  <View style={styles.fileMetadata}>
                    <Text style={styles.fileSize}>{(file.size / 1024 / 1024).toFixed(2)} MB</Text>
                    {file.metadata && file.metadata.category && (
                      <Text style={styles.fileCategory}>{getCategoryLabel(file.metadata.category)}</Text>
                    )}
                  </View>
                  {file.metadata && file.metadata.amount && (
                    <Text style={styles.fileAmount}>${file.metadata.amount}</Text>
                  )}
                </View>
              </View>
              
              {renderProgress(file)}
              
              {!uploading && (
                <View style={styles.fileActions}>
                  {!file.uploaded && (
                    <TouchableOpacity 
                      style={styles.editButton} 
                      onPress={() => {
                        setCurrentFile(file);
                        setFileMetadata(file.metadata || {
                          category: '',
                          date: '',
                          amount: '',
                          entity: '',
                          notes: ''
                        });
                        setModalVisible(true);
                      }}
                    >
                      <Text style={styles.editButtonText}>✎</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity 
                    style={styles.removeButton} 
                    onPress={() => removeFile(file.id)}
                  >
                    <Text style={styles.removeButtonText}>✕</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ))
        )}
      </ScrollView>
      
      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.button, styles.selectButton]} 
          onPress={pickDocument}
          disabled={uploading}
        >
          <Text style={styles.buttonText}>Select Files</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.button, 
            styles.uploadButton,
            (selectedFiles.length === 0 || uploading) && styles.disabledButton
          ]} 
          onPress={uploadAllFiles}
          disabled={selectedFiles.length === 0 || uploading}
        >
          {uploading ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <Text style={styles.buttonText}>Upload All</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Metadata Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          Alert.alert('Warning', 'Please complete file details or remove the file.');
        }}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalContainer}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Document Details</Text>
              <Text style={styles.modalSubtitle}>
                {currentFile ? currentFile.name : 'File'}
              </Text>
            </View>

            <ScrollView style={styles.modalForm}>
              <Text style={styles.formLabel}>Document Category*</Text>
              <View style={styles.categoryButtons}>
                {CATEGORIES.map(category => (
                  <TouchableOpacity
                    key={category.id}
                    style={[
                      styles.categoryButton,
                      fileMetadata.category === category.id && styles.categoryButtonSelected
                    ]}
                    onPress={() => selectCategory(category.id)}
                  >
                    <Text 
                      style={[
                        styles.categoryButtonText,
                        fileMetadata.category === category.id && styles.categoryButtonTextSelected
                      ]}
                    >
                      {category.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.formLabel}>Document Date</Text>
              <TextInput
                style={styles.textInput}
                placeholder="MM/DD/YYYY"
                value={fileMetadata.date}
                onChangeText={(text) => setFileMetadata({...fileMetadata, date: text})}
                keyboardType="numbers-and-punctuation"
              />

              <Text style={styles.formLabel}>Amount</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter amount"
                value={fileMetadata.amount}
                onChangeText={(text) => setFileMetadata({...fileMetadata, amount: text})}
                keyboardType="decimal-pad"
              />

              <Text style={styles.formLabel}>Supplier/Customer</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter name"
                value={fileMetadata.entity}
                onChangeText={(text) => setFileMetadata({...fileMetadata, entity: text})}
              />

              <Text style={styles.formLabel}>Notes</Text>
              <TextInput
                style={[styles.textInput, styles.textAreaInput]}
                placeholder="Additional information"
                value={fileMetadata.notes}
                onChangeText={(text) => setFileMetadata({...fileMetadata, notes: text})}
                multiline={true}
                numberOfLines={3}
              />
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.modalCancelButton]}
                onPress={() => {
                  // Remove the file if user cancels without adding metadata
                  if (currentFile) {
                    removeFile(currentFile.id);
                  }
                  setModalVisible(false);
                  setCurrentFile(null);
                  resetMetadataForm();
                }}
              >
                <Text style={styles.modalCancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.modalSaveButton]}
                onPress={saveMetadata}
              >
                <Text style={styles.modalSaveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  fileList: {
    flex: 1,
    marginBottom: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
    fontFamily: 'System',
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginVertical: 12,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
  },
  fileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  fileInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  fileIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#e0f2fe',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fileIconText: {
    fontSize: 24,
  },
  fileDetails: {
    marginLeft: 12,
    flex: 1,
  },
  fileName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  fileMetadata: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  fileSize: {
    fontSize: 14,
    color: '#999',
  },
  fileCategory: {
    fontSize: 12,
    backgroundColor: '#e0f2fe',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 8,
    color: '#0369a1',
  },
  fileAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#047857',
    marginTop: 4,
  },
  fileStatus: {
    marginLeft: 8,
  },
  successText: {
    color: 'green',
    fontWeight: '500',
  },
  errorText: {
    color: 'red',
    fontWeight: '500',
  },
  progressContainer: {
    width: 100,
    height: 20,
    backgroundColor: '#e0e0e0',
    borderRadius: 10,
    overflow: 'hidden',
    marginLeft: 12,
    position: 'relative',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#4285F4',
    borderRadius: 10,
  },
  progressText: {
    position: 'absolute',
    width: '100%',
    textAlign: 'center',
    fontSize: 12,
    fontWeight: 'bold',
    color: 'white',
    lineHeight: 20,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  fileActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#e0f2fe',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  editButtonText: {
    color: '#0369a1',
    fontWeight: 'bold',
    fontSize: 12,
  },
  removeButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#ffebee',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeButtonText: {
    color: '#e53935',
    fontWeight: 'bold',
    fontSize: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    flex: 1,
  },
  selectButton: {
    backgroundColor: '#4285F4',
    marginRight: 8,
  },
  uploadButton: {
    backgroundColor: '#34A853',
    marginLeft: 8,
  },
  disabledButton: {
    backgroundColor: '#A9A9A9',
    opacity: 0.7,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '80%',
    padding: 20,
  },
  modalHeader: {
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  modalForm: {
    flex: 1,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  categoryButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  categoryButton: {
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  categoryButtonSelected: {
    backgroundColor: '#4285F4',
  },
  categoryButtonText: {
    fontSize: 14,
    color: '#333',
  },
  categoryButtonTextSelected: {
    color: 'white',
    fontWeight: '500',
  },
  textInput: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  textAreaInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCancelButton: {
    backgroundColor: '#f5f5f5',
    marginRight: 8,
  },
  modalCancelButtonText: {
    color: '#333',
    fontWeight: '500',
  },
  modalSaveButton: {
    backgroundColor: '#4285F4',
    marginLeft: 8,
  },
  modalSaveButtonText: {
    color: 'white',
    fontWeight: '500',
  },
});

export default UploadScreen; 