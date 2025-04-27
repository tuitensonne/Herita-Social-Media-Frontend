import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  SafeAreaView,
  Alert
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import api from '../api';
import { navigate } from '../services/NavigationService';

type RootStackParamList = {
  ResultScreen: { photoId: string };
  CameraScreen: undefined;
};

type CameraScreenNavigationProp = StackNavigationProp<RootStackParamList, 'CameraScreen'>;

interface ImageResult {
  uri: string;
  width: number;
  height: number;
  type?: string;
  fileName?: string;
  fileSize?: number;
}

const CameraScreen: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<ImageResult | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const navigation = useNavigation<CameraScreenNavigationProp>();

  const takePicture = async (): Promise<void> => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert('Thông báo', 'Bạn cần cấp quyền truy cập camera để sử dụng tính năng này');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.8,
      aspect: [4, 3],
    });

    if (!result.canceled) {
      setSelectedImage({
        uri: result.assets[0].uri,
        width: result.assets[0].width,
        height: result.assets[0].height,
        fileName: result.assets[0].fileName ?? undefined,
        type: result.assets[0].type,
        fileSize: result.assets[0].fileSize
      });
    }
  };

  const pickImage = async (): Promise<void> => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert('Thông báo', 'Bạn cần cấp quyền truy cập thư viện ảnh để sử dụng tính năng này');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
      aspect: [4, 3],
    });

    if (!result.canceled) {
      setSelectedImage({
        uri: result.assets[0].uri,
        width: result.assets[0].width,
        height: result.assets[0].height,
        fileName: result.assets[0].fileName ?? undefined,
        type: result.assets[0].type,
        fileSize: result.assets[0].fileSize
      });
    }
  };

  const handleSubmit = async (): Promise<void> => {
    if (!selectedImage) {
      Alert.alert('Thông báo', 'Vui lòng chụp hoặc chọn một ảnh trước.');
      return;
    }

    setUploading(true);
    
    try {
        const formData = new FormData();
        formData.append('file', {
            uri: selectedImage.uri,
            type: 'image/jpeg',
            name: selectedImage.fileName || 'photo.jpg',
        } as any);

        const response = await api.post('/culture-content/image', formData, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
            
        })
        const result = await response.data.result;
        console.log(result[0])
        if (response) {
            navigate('Document', {id: result[0]})
        } else {
            Alert.alert('Lỗi', result.message || 'Có lỗi xảy ra khi tải ảnh lên.');
        }
    } catch (error) {
        console.error('Upload error:', error);
        Alert.alert('Lỗi', 'Không thể tải ảnh lên. Vui lòng thử lại sau.');
    } finally {
        setUploading(false);
    }
};

    const clearSelectedImage = (): void => {
        setSelectedImage(null);
    };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.logo}>
            <View style={[styles.rhombus, styles.orangePart]} />
            <View style={[styles.rhombus, styles.bluePart]} />
          </View>
          <Text style={styles.appName}>Tìm kiếm nội dung văn hóa</Text>
          <Text style={styles.welcomeText}>
            Chào mừng đến với HeritaHub, hi vọng bạn sẽ có trải nghiệm tốt
          </Text>
        </View>

        {selectedImage && (
          <View style={styles.previewContainer}>
            <Image source={{ uri: selectedImage.uri }} style={styles.previewImage} />
            <TouchableOpacity 
              style={styles.clearButton} 
              onPress={clearSelectedImage}
            >
              <Text style={styles.clearButtonText}>×</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.buttonsContainer}>
          {uploading ? (
            <View style={styles.buttonPrimary}>
              <ActivityIndicator size="small" color="#FFFFFF" />
              <Text style={styles.buttonText}>Đang tải lên...</Text>
            </View>
          ) : selectedImage ? (
            <TouchableOpacity 
              style={styles.buttonPrimary} 
              onPress={handleSubmit}
            >
              <Text style={styles.buttonText}>Tìm kiếm</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              style={styles.buttonPrimary} 
              onPress={takePicture}
            >
              <Text style={styles.buttonText}>Chụp ảnh</Text>
            </TouchableOpacity>
          )}
          
          {!selectedImage && (
            <TouchableOpacity 
              style={styles.buttonSecondary} 
              onPress={pickImage}
            >
              <Text style={styles.buttonSecondaryText}>Chọn từ thư viện</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logo: {
    width: 60,
    height: 60,
    position: 'relative',
    marginBottom: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rhombus: {
    position: 'absolute',
    width: 40,
    height: 40,
    transform: [{ rotate: '45deg' }],
  },
  orangePart: {
    backgroundColor: '#FF6F20',
    left: 5,
  },
  bluePart: {
    backgroundColor: '#20A0FF',
    right: 5,
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  welcomeText: {
    textAlign: 'center',
    color: '#666',
    paddingHorizontal: 20,
  },
  previewContainer: {
    width: '100%',
    height: 300,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    marginVertical: 20,
  },
  previewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  clearButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.6)',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  buttonsContainer: {
    width: '100%',
    marginTop: 20,
  },
  buttonPrimary: {
    backgroundColor: '#FF6F20',
    borderRadius: 12,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    flexDirection: 'row',
  },
  buttonSecondary: {
    backgroundColor: 'rgba(255, 111, 32, 0.1)',
    borderRadius: 12,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  buttonSecondaryText: {
    color: '#FF6F20',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default CameraScreen;