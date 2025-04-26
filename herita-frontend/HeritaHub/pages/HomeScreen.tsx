import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
} from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import CreatePostModal from '../components/CreatePostModal';
import UploadStatusBar from '../components/UploadStatusBar';
import PostComponent from '../components/Post';

const HomeScreen: React.FC = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [uploadingPost, setUploadingPost] = useState<number>(0);

  const showCreatePostModal = () => setIsModalVisible(true);
  const hideCreatePostModal = () => setIsModalVisible(false);

  const handlePostCreationStart = (progress: number) => {
    setUploadingPost(progress);
    hideCreatePostModal();
  };

  const handlePostCompleted = () => {
    setUploadingPost(0);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Home Feed</Text>
        <TouchableOpacity style={styles.createPostButton} onPress={showCreatePostModal}>
          <MaterialIcons name="post-add" size={24} color="#1877F2" />
          <Text style={styles.createPostText}>Create Post</Text>
        </TouchableOpacity>
      </View>

      <ScrollView>
        <Text style={styles.feedPlaceholder}>Feed content goes here</Text>
      </ScrollView>

      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={hideCreatePostModal}
      >
        <CreatePostModal onClose={hideCreatePostModal} onPostStarted={handlePostCreationStart} />
      </Modal>

      {uploadingPost !== 0 && (
        <UploadStatusBar progress={uploadingPost} onCompleted={handlePostCompleted} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#fff' 
  },
  header: { 
    padding: 16, 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center' 
  },
  headerTitle: { 
    fontSize: 20, 
    fontWeight: 'bold' 
  },
  createPostButton: { 
    flexDirection: 'row', 
    alignItems: 'center' 
  },
  createPostText: { 
    marginLeft: 6, 
    color: '#1877F2' 
  },
  feedPlaceholder: { 
    padding: 16, 
    textAlign: 'center', 
    color: '#888' 
  },
});

export default HomeScreen;