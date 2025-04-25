import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Alert, Modal, ActivityIndicator } from 'react-native';
import { MaterialIcons } from "@expo/vector-icons";
import { Fontisto } from '@expo/vector-icons';
import Feather from '@expo/vector-icons/Feather';
import PostDetailModal from '../pages/PostDetailScreen';
import api from '../api';
import { getUserId } from '../services/TokenService';

interface PostProps {
    id: string
    title: string;
    content: string;
    userId: string
    username: string;
    user_url: string;
    created_at: string;
    post_audience: string;
    like_counts: number;
    comment_counts: number;
    post_thumbnail: string;
    isLike: boolean;
    onPostDeleted: (id: string) => void;
}

const PostComponent: React.FC<PostProps> = ({
    username,
    userId,
    title,
    created_at,
    post_audience,
    post_thumbnail,
    like_counts,
    comment_counts,
    content,
    user_url,
    id,
    isLike,
    onPostDeleted,
}) => {
    const [modalVisible, setModalVisible] = useState(false);
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [liked, setLiked] = useState(isLike); 
    const [likesCount, setLikesCount] = useState(like_counts);
    const [commentCount, setCommentCount] = useState(comment_counts);

    useEffect(() => {
        setLiked(isLike);
        setLikesCount(like_counts);
    }, [isLike, like_counts]);

    useEffect(() => {
    }, [commentCount]);

    const handleLikeToggle = async (currentLikeState: boolean) => {
        const newLikeState = !currentLikeState;
        
        setLiked(newLikeState);
        setLikesCount(prevCount => currentLikeState ? prevCount - 1 : prevCount + 1);
        
        try {
            const action = newLikeState ? 'like' : 'unlike';
            await api.post(`/post/${id}?action=${action}`);
        } catch (error) {
            console.log('Lỗi khi thực hiện thao tác like:', error);
            setLiked(currentLikeState);
            setLikesCount(prevCount => newLikeState ? prevCount - 1 : prevCount + 1);
        }
    };

    const handleCommentToggle = async () => {
        setCommentCount(prevCount => prevCount + 1);
    };

    const onSharePress = () => {}
    
    const handleDeletePost = async () => {
        try {
            await api.delete(`/post/${id}`);
            setDeleteModalVisible(false);
            
            if (onPostDeleted) {
                onPostDeleted(id);
            }
        } catch (error) {
            console.log('Lỗi khi xóa bài viết:', error);
            Alert.alert('Lỗi', 'Không thể xóa bài viết. Vui lòng thử lại sau.');
        }
    };

    const showDeleteConfirmation = () => {
        setDeleteModalVisible(true);
    };
    
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                {user_url ? (
                    <Image source={{ uri: user_url }} style={styles.profileImage} />
                ) : (
                <View style={styles.profileImagePlaceholder} />
                )}
                    <View style={styles.userInfo}>
                    <Text style={styles.username}>{username}</Text>
                    <Text style={styles.timeAgo}>{(new Date(created_at)).toLocaleDateString()}</Text>
                </View>
                
                {userId === getUserId() && (<TouchableOpacity onPress={showDeleteConfirmation} style={styles.deleteButton}>
                    <Feather name="x" size={24} color="#FF6347" />
                </TouchableOpacity>)}
                
            </View>
            
            {post_thumbnail && (
                <Image
                    source={{ uri: post_thumbnail }}
                    style={styles.mainImage}
                    resizeMode="cover"
                />
            )}

            <View style={styles.captionContainer}>
                <Text style={styles.captionText}>{title}</Text>
            </View>

            <View style={styles.statsContainer}>
                <Text style={styles.statsText}>
                    {likesCount} {likesCount === 1 ? 'like' : 'likes'}
                </Text>
                <Text style={styles.statsText}>
                    {commentCount} {commentCount === 1 ? 'comment' : 'comments'}
                </Text>
            </View>

            <View style={styles.actionBar}>
                <TouchableOpacity 
                    style={styles.actionButton} 
                    onPress={() => handleLikeToggle(liked)}
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

                <TouchableOpacity style={styles.actionButton} onPress={() => setModalVisible(true)}>
                    <MaterialIcons name="visibility" size={20} color="#555" style={styles.actionIcon} />
                    <Text style={styles.actionText}>Xem chi tiết</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionButton} onPress={onSharePress}>
                    <Fontisto name="share-a" size={20} color="#555" style={styles.actionIcon} />
                    <Text style={styles.actionText}>Share</Text>
                </TouchableOpacity>
            </View>

            {/* Modal xác nhận xóa */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={deleteModalVisible}
                onRequestClose={() => setDeleteModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.deleteModalContainer}>
                        <Text style={styles.deleteModalTitle}>Xóa bài viết?</Text>
                        <Text style={styles.deleteModalMessage}>
                            Bạn có chắc chắn muốn xóa bài viết này không? Hành động này không thể hoàn tác.
                        </Text>
                        <View style={styles.deleteModalButtons}>
                            <TouchableOpacity 
                                style={[styles.deleteModalButton, styles.cancelButton]} 
                                onPress={() => setDeleteModalVisible(false)}
                            >
                                <Text style={styles.cancelButtonText}>Hủy</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                style={[styles.deleteModalButton, styles.confirmButton]} 
                                onPress={handleDeletePost}
                            >
                                <Text style={styles.confirmButtonText}>Xóa</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            <PostDetailModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                articleData={{
                    username,
                    title,
                    created_at,
                    post_audience,
                    post_thumbnail,
                    like_counts: likesCount,
                    comment_counts: commentCount,
                    content,
                    user_url,
                    id,
                    isLike: liked,
                }}
                onAction={(currentLikeState) => handleLikeToggle(currentLikeState)}
                onComment={() => handleCommentToggle()}
            />
        </View>
    );
};
const styles = StyleSheet.create({
    container: {
        width: '100%',
        maxWidth: 500,
        backgroundColor: 'white',
        borderRadius: 8,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
        marginVertical: 10,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
    },
    profileImage: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 8,
    },
    profileImagePlaceholder: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#e0e0e0',
        marginRight: 8,
    },
    userInfo: {
        flex: 1,
    },
    username: {
        fontWeight: 'bold',
        fontSize: 16,
    },
    timeAgo: {
        color: '#666',
        fontSize: 12,
    },
    deleteButton: {
        padding: 8,
    },
    mainImage: {
        width: '100%',
        height: 250,
    },
    captionContainer: {
        borderTopWidth: 1,
        borderColor: '#e0e0e0',
        padding: 12,
    },
    captionText: {
        fontSize: 16,
        textAlign: 'center',
        fontWeight: '500',
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 12,
        borderBottomWidth: 1,
        borderColor: '#e0e0e0',
    },
    statsText: {
        fontSize: 14,
        color: '#666',
    },
    actionBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 8,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
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
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    deleteModalContainer: {
        width: '80%',
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    deleteModalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
    },
    deleteModalMessage: {
        fontSize: 14,
        color: '#555',
        textAlign: 'center',
        marginBottom: 20,
    },
    deleteModalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    deleteModalButton: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
        flex: 1,
        marginHorizontal: 5,
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: '#f0f0f0',
    },
    confirmButton: {
        backgroundColor: '#FF6347',
    },
    cancelButtonText: {
        color: '#555',
        fontWeight: '500',
    },
    confirmButtonText: {
        color: 'white',
        fontWeight: '500',
    },
});

export default PostComponent;