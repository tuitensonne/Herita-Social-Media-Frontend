import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  FlatList,
} from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import CreatePostModal from '../components/CreatePostModal';
import UploadStatusBar from '../components/UploadStatusBar';
import PostComponent from '../components/Post';
import { useFocusEffect } from '@react-navigation/native';
import api from '../api';

const HomeScreen: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [uploadingPost, setUploadingPost] = useState<number>(0);
  const [userPosts, setUserPosts] = useState([
    {
      id: '',
      userId: '',
      thumbnail_url: '',
      post_audience: 'Public',
      title: '',
      content: '',
      created_at: '',
      like_counts: 0,
      comment_counts: 0,
      isLike: false,
      locationId: '',
      username: '',
      avatar_url: '',
    },
  ]);
  const [refreshing, setRefreshing] = useState(false);

  const showCreatePostModal = () => setIsModalVisible(true);
  const hideCreatePostModal = () => setIsModalVisible(false);

  const handlePostCreationStart = (progress: number) => {
    setUploadingPost(progress);
    hideCreatePostModal();
  };

  const fetchUserPosts = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/post/feed`);
      setUserPosts(response.data.result);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
      setRefreshing(false); // Set refreshing to false after data has been fetched
    }
  };

  const handlePostDelete = (id: string) => {
    setUserPosts((prevPosts) => prevPosts.filter((post) => post.id !== id));
  };

  const handlePostCompleted = () => {
    setUploadingPost(0);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchUserPosts();
  };

  const renderItem = ({
    item,
  }: {
    item: {
      id: string;
      userId: string;
      thumbnail_url: string;
      post_audience: string;
      title: string;
      content: string;
      created_at: string;
      like_counts: number;
      comment_counts: number;
      isLike: boolean;
      locationId: string;
      username: string;
      avatar_url: string;
    };
  }) => (
    <PostComponent
      userId={item.userId}
      id={item.id}
      title={item.title}
      user_url={item.avatar_url}
      username={item.username}
      content={item.content}
      created_at={item.created_at}
      post_audience={item.post_audience}
      post_thumbnail={item.thumbnail_url}
      like_counts={item.like_counts}
      comment_counts={item.comment_counts}
      isLike={item.isLike}
      location_id={item.locationId}
      onPostDeleted={handlePostDelete}
    />
  );

  useFocusEffect(
    useCallback(() => {
      fetchUserPosts();
    }, [])
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Bảng tin</Text>
        <TouchableOpacity style={styles.createPostButton} onPress={showCreatePostModal}>
          <MaterialIcons name="post-add" size={24} color="#FF6F20" />
          <Text style={styles.createPostText}>Tạo bài viết</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={userPosts}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        style={styles.list}
        showsVerticalScrollIndicator={false}
        refreshing={refreshing} // Binding the refreshing state to FlatList
        onRefresh={handleRefresh} // Trigger the refresh on pull-down
      />

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
    color: '#FF6F20' 
  },
  feedPlaceholder: { 
    padding: 16, 
    textAlign: 'center', 
    color: '#888' 
  },
  list: {
    flex: 1,
  },
});

export default HomeScreen;
