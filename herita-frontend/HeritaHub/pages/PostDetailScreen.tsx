import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  StatusBar,
  SafeAreaView,
  Dimensions,
  Image,
  TextInput,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { Ionicons, FontAwesome, MaterialIcons } from '@expo/vector-icons';
import api from '../api';
import { getUserId, getUsername, getUserUrl } from '../services/TokenService';

interface PostDetailModalProps {
  visible: boolean;
  onClose: () => void;
  articleData: {
    id: string;
    title: string;
    content: string;
    username: string;
    user_url: string;
    created_at: string;
    post_audience: string;
    like_counts: number;
    comment_counts: number;
    post_thumbnail: string;
    isLike: boolean;
  };
  onAction: (currentLikeState: boolean) => void;
  onComment: () => void;
}

interface Comment {
  comment: {
    id: string;
    content: string;
    created_at: string;
  }
  user: {
    id: string;
    name: string;
    avatar_url: string | null;
  }
}

const PostDetailModal: React.FC<PostDetailModalProps> = ({
  visible,
  onClose,
  articleData,
  onAction,
  onComment
}) => {
  const [liked, setLiked] = useState(articleData.isLike);
  const [likesCount, setLikesCount] = useState(articleData.like_counts);
  const [activeTab, setActiveTab] = useState('details');
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasMoreComments, setHasMoreComments] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [commentCount, setCommentCount] = useState(articleData.comment_counts);
  const [commentsPreloaded, setCommentsPreloaded] = useState(false);
  const [lastFetchedCommentIds, setLastFetchedCommentIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (articleData) {
      setLiked(articleData.isLike);
      setLikesCount(articleData.like_counts);
      setCommentCount(articleData.comment_counts);
    }
  }, [articleData]);

  useEffect(() => {
    if (visible && !commentsPreloaded && commentCount > 0) {
      const timer = setTimeout(() => {
        preloadComments();
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [visible, commentsPreloaded]);

  const preloadComments = async () => {
    try {
      const result = await commentApiService.fetchComments(articleData.id, 1, 10);
      setComments(result.comments);
      
      const commentIds = new Set(result.comments.map(comment => comment.comment.id));
      setLastFetchedCommentIds(commentIds);
      
      setHasMoreComments(result.hasMore);
      setTotalPages(result.totalPages);
      setCurrentPage(result.page);
      setCommentsPreloaded(true);
    } catch (error) {
      console.error('Error preloading comments:', error);
    }
  };

  const loadMoreComments = async () => {
    if (!hasMoreComments || isLoadingMore) return;
    
    setIsLoadingMore(true);
    
    try {
      const nextPage = currentPage + 1;
      const result = await commentApiService.fetchComments(articleData.id, nextPage, 10);
      console.log('Loaded more comments:', result);
      const newComments = result.comments.filter(
        newComment => !lastFetchedCommentIds.has(newComment.comment.id)
      );
      
      if (newComments.length > 0) {
        setComments(prev => [...prev, ...newComments]);
        
        const updatedCommentIds = new Set(lastFetchedCommentIds);
        newComments.forEach(comment => updatedCommentIds.add(comment.comment.id));
        setLastFetchedCommentIds(updatedCommentIds);
      }
      
      setCurrentPage(nextPage);
      setTotalPages(result.totalPages);
      setHasMoreComments(nextPage < result.totalPages);
    } catch (error) {
      console.error('Error loading more comments:', error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const refreshComments = async () => {
    if (isRefreshing) return;
    
    setIsRefreshing(true);
    
    try {
      const result = await commentApiService.fetchComments(articleData.id, 1, 11);
      const existingCommentsMap = new Map();
      comments.forEach(comment => {
        existingCommentsMap.set(comment.comment.id, comment);
      });
      
      const newComments: Comment[] = [];
      const updatedCommentIds: Set<string> = new Set();
      
      result.comments.forEach(comment => {
        updatedCommentIds.add(comment.comment.id);
        
        if (!existingCommentsMap.has(comment.comment.id)) {
          newComments.push(comment);
        }
      });
      if (newComments.length > 0) {
        setComments(prev => [...newComments, ...prev]);
        
        setCommentCount(prevCount => prevCount + newComments.length);
      }
      
      setCurrentPage(1);
      setTotalPages(result.totalPages);
      setHasMoreComments(1 < result.totalPages);
      setLastFetchedCommentIds(new Set(updatedCommentIds));
    } catch (error) {
      console.error('Error refreshing comments:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    
    if (tab === 'comments' && comments.length === 0 && !isLoadingComments) {
      setIsLoadingComments(true);
      commentApiService.fetchComments(articleData.id, 1, 10)
        .then(result => {
          setComments(result.comments);
          const commentIds = new Set(result.comments.map(comment => comment.comment.id));
          setLastFetchedCommentIds(commentIds);
          
          setCurrentPage(1);
          setTotalPages(result.totalPages);
          setHasMoreComments(1 < result.totalPages);
        })
        .catch(error => {
          console.error('Error loading comments:', error);
        })
        .finally(() => {
          setIsLoadingComments(false);
        });
    }
  };

  const onLikePress = () => {
    onAction(liked);
    
    setLiked(!liked);
    setLikesCount(prevCount => liked ? prevCount - 1 : prevCount + 1);
  };

  const handlePostComment = async () => {
    if (!commentText.trim() || isSubmittingComment) return;
    
    setIsSubmittingComment(true);
    
    try {
      const tempId = `temp-${Date.now()}`;
      const optimisticComment = {
        comment: {
          id: tempId,
          content: commentText,
          created_at: new Date().toISOString()
        },
        user: {
          id: getUserId(),
          name: getUsername(),
          avatar_url: getUserUrl()
        }
      };
      
      const newCommentCount = commentCount + 1;
      setCommentCount(newCommentCount);
      setComments(prev => [optimisticComment, ...prev]);
      setCommentText('');
      const response = await commentApiService.postComment(articleData.id, commentText);
      setLastFetchedCommentIds(prev => new Set([...prev, response.comment.id]));
      
      setComments(prev => prev.map(comment => 
        comment.comment.id === tempId ? response : comment
      ));
      
      onComment();
    } catch (error) {
      console.log('Error posting comment:', error);
      setCommentCount(commentCount);
      setComments(prev => prev.filter(comment => comment.comment.id !== `temp-${Date.now()}`));
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const commentApiService = {
    fetchComments: async (postId: string, page: number = 1, limit: number = 10): Promise<{
      comments: Comment[];
      totalComments: number;
      hasMore: boolean;
      page: number;
      totalPages: number;
    }> => {
      try {
        const response = await api.get(`post/${postId}/comments?page=${page}&limit=${limit}`);
        
        const data = response.data.result;
        return {
          comments: data.comments, 
          totalComments: data.totalComments,
          hasMore: data.page < data.totalPages,
          page: data.page,
          totalPages: data.totalPages
        };
      } catch (error) {
        console.error('Error fetching comments:', error);        
        return {
          comments: [],
          totalComments: 0,
          hasMore: false,
          page: 1,
          totalPages: 1
        };
      }
    },
    
    postComment: async (postId: string, content: string): Promise<Comment> => {
      try {
        const response = await api.post(`post/${postId}/comment`, {
          content: content
        });
        
        return response.data.result;
      } catch (error) {
        console.error('Error posting comment:', error);
        throw error; 
      }
    }
  };

  const renderCommentItem = useCallback(({ item }: { item: Comment }) => (
    <View style={styles.commentItem}>
      <Image
        source={
          item.user.avatar_url ? { uri: item.user.avatar_url } : require('../assets/default-avatar.png')
        }
        style={styles.commentAvatar}
      />
      <View style={styles.commentContent}>
        <Text style={styles.commentUsername}>{item.user.name}</Text>
        <Text style={styles.commentText}>{item.comment.content}</Text>
        <View style={styles.commentFooter}>
          <Text style={styles.commentTime}>
            {new Date(item.comment.created_at).toLocaleString()}
          </Text>
        </View>
      </View>
    </View>
  ), []);

  const renderFooter = () => {
    if (!hasMoreComments || currentPage >= totalPages) return null;
    
    return (
      <TouchableOpacity 
        style={styles.loadMoreButton}
        onPress={loadMoreComments}
        disabled={isLoadingMore}
      >
        {isLoadingMore ? (
          <ActivityIndicator size="small" color="#FF7A45" />
        ) : (
          <Text style={styles.loadMoreText}>Xem thêm bình luận</Text>
        )}
      </TouchableOpacity>
    );
  };

  const renderEmptyComments = () => {
    if (isLoadingComments) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color="#FF7A45" />
        </View>
      );
    }
    
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Chưa có bình luận nào</Text>
        <Text style={styles.emptySubText}>Hãy là người đầu tiên bình luận!</Text>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={onClose}>
            <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Bài viết chi tiết</Text>
          <View style={styles.headerSpacer} />
        </View>
        
        <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={styles.tabWrapper}
            onPress={() => handleTabChange('details')}
          >
            <Text style={activeTab === 'details' ? styles.activeTab : styles.inactiveTab}>
              Thông tin chi tiết
            </Text>
            {activeTab === 'details' && <View style={styles.activeTabIndicator} />}
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.tabWrapper}
            onPress={() => handleTabChange('comments')}
          >
            <Text style={activeTab === 'comments' ? styles.activeTab : styles.inactiveTab}>
              Bình luận ({commentCount})
            </Text>
            {activeTab === 'comments' && <View style={styles.activeTabIndicator} />}
          </TouchableOpacity>
        </View>
        
        {activeTab === 'details' ? (
          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            <View style={styles.authorContainer}>
              <Image 
                source={
                  articleData.user_url
                    ? { uri: articleData.user_url }
                    : require("../assets/default-avatar.png")
                }
                style={styles.authorImage}
              />
              <View style={styles.authorInfo}>
                <Text style={styles.authorName}>{articleData.username}</Text>
              </View>
              <Text style={styles.timeAgo}>{(new Date(articleData.created_at)).toLocaleDateString()}</Text>
            </View>
            
            <Image 
              source={articleData.post_thumbnail
                ? { uri: articleData.post_thumbnail }
                : require("../assets/default-avatar.png")}
              style={styles.mainImagePlaceholder}
            />
            
            <View style={styles.historicSiteInfo}>
              <Text style={styles.historicSiteText}>Xem tài liệu về di tích</Text>
              <TouchableOpacity style={styles.historicSiteButton}>
                <Text style={styles.historicSiteButtonText}>Tại đây</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.engagementContainer}>
              <View style={styles.likes}>
                <Text style={styles.statsText}>
                  {likesCount >= 1000 
                    ? `${(likesCount / 1000).toFixed(1)}k `
                    : `${likesCount} `}
                </Text>
                <FontAwesome name="thumbs-up" size={16} color="#666" />
              </View>
              <TouchableOpacity onPress={() => handleTabChange('comments')}>
                <Text style={styles.statsText}>{commentCount} bình luận</Text>
              </TouchableOpacity>
            </View>
            
            <Text style={styles.articleTitle}>
              {articleData.title}
            </Text>
            
            <Text style={styles.articleContent}>
              {articleData.content}
            </Text>
            <View style={{ height: 80 }} />
          </ScrollView>
        ) : (
          <View style={styles.commentsContainer}>
            <FlatList
              data={comments}
              renderItem={renderCommentItem}
              keyExtractor={(item, index) => `${item.comment.id}_${index}`}
              contentContainerStyle={[
                styles.commentsList,
                comments.length === 0 && styles.fullHeightContainer
              ]}
              showsVerticalScrollIndicator={false}
              ListHeaderComponent={
                comments.length > 0 ? (
                  <Text style={styles.commentsHeader}>
                    Tất cả bình luận ({commentCount})
                  </Text>
                ) : null
              }
              ListFooterComponent={renderFooter}
              ListEmptyComponent={renderEmptyComments}
              refreshing={isRefreshing}
              onRefresh={refreshComments}
              ListFooterComponentStyle={styles.footerStyle}
              initialNumToRender={10}
              maxToRenderPerBatch={10}
              windowSize={10}
            />
          </View>
        )}

        <View style={styles.actionButtonsContainer}>
          {activeTab === 'details' ? (
            <>
              <TouchableOpacity 
                style={styles.actionButton} 
                onPress={onLikePress}
              >
                <MaterialIcons 
                  name={liked ? "thumb-up" : "thumb-up-alt"} 
                  size={20} 
                  color={liked ? "#FF6F20" : "#555"} 
                  style={styles.actionIcon} 
                />
                <Text style={[
                  styles.actionText, 
                  liked && styles.likedText
                ]}>
                  {liked ? 'Liked' : 'Like'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => handleTabChange('comments')}
              >
                <MaterialIcons name="comment" size={20} color="#555" style={styles.actionIcon} />
                <Text style={styles.actionText}>Bình luận</Text>
              </TouchableOpacity>
            </>
          ) : (
            <View style={styles.commentInputContainer}>
              <TextInput
                style={styles.commentInput}
                placeholder="Viết bình luận..."
                value={commentText}
                onChangeText={setCommentText}
                multiline
                maxLength={500}
              />
              <TouchableOpacity 
                style={[
                  styles.sendButton, 
                  commentText.trim() && !isSubmittingComment 
                    ? styles.sendButtonActive 
                    : {}
                ]}
                disabled={!commentText.trim() || isSubmittingComment}
                onPress={handlePostComment}
              >
                {isSubmittingComment ? (
                  <ActivityIndicator size="small" color="#FF7A45" />
                ) : (
                  <Ionicons 
                    name="send" 
                    size={20} 
                    color={commentText.trim() ? "#FF7A45" : "#BBB"} 
                  />
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 56,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  headerSpacer: {
    width: 40,
  },
  authorImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E0E0E0',
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  tabWrapper: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    position: 'relative',
  },
  activeTab: {
    color: '#FF7A45',
    fontWeight: '500',
  },
  inactiveTab: {
    color: '#666666',
    fontWeight: '500',
  },
  activeTabIndicator: {
    position: 'absolute',
    bottom: 0,
    height: 2,
    width: '50%',
    backgroundColor: '#FF7A45',
  },
  scrollView: {
    flex: 1,
  },
  authorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  authorInfo: {
    marginLeft: 12,
    flex: 1,
  },
  authorName: {
    fontSize: 16,
    fontWeight: '600',
  },
  timeAgo: {
    fontSize: 14,
    color: '#666666',
  },
  mainImagePlaceholder: {
    width: width,
    height: 250,
    backgroundColor: '#F0F0F0',
  },
  historicSiteInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFF2EE',
    padding: 16,
    marginVertical: 12,
    marginHorizontal: 16,
    borderRadius: 8,
  },
  historicSiteText: {
    color: '#FF7A45',
    fontSize: 14,
    fontWeight: '500',
  },
  historicSiteButton: {
    backgroundColor: '#FF7A45',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  historicSiteButtonText: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  engagementContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  likes: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statsText: {
    fontSize: 14,
    color: '#666666',
  },
  articleTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },
  articleContent: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333333',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
  },
  actionIcon: {
    marginRight: 6,
  },
  actionText: {
    fontSize: 14,
    color: '#555',
  },
  likedText: {
    color: '#FF6F20',
    fontWeight: '500',
  },
  
  // Comments styles
  commentsContainer: {
    flex: 1,
  },
  commentsList: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  commentsHeader: {
    fontSize: 16,
    fontWeight: '600',
    marginVertical: 16,
  },
  commentItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  commentAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E0E0E0',
  },
  commentContent: {
    flex: 1,
    marginLeft: 12,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 10,
  },
  commentUsername: {
    fontWeight: '600',
    marginBottom: 4,
  },
  commentText: {
    fontSize: 14,
    marginBottom: 6,
  },
  commentFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  commentTime: {
    fontSize: 12,
    color: '#777',
  },
  commentInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  commentInput: {
    flex: 1,
    backgroundColor: '#F0F0F0',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    maxHeight: 80,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sendButtonActive: {
    backgroundColor: '#FFF2EE',
  },
  loaderContainer: {
    padding: 16,
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 14,
    color: '#666',
  },
  footerStyle: {
    paddingVertical: 16,
  },
  fullHeightContainer: {
    flexGrow: 1,
  },
  loadMoreButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginBottom: 30,
  },
  loadMoreText: {
    color: '#FF7A45',
    fontWeight: '500',
    fontSize: 14,
  },
});

export default PostDetailModal;