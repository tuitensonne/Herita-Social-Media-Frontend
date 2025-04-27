import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import BottomSheetModal from "../components/FollowList";
import api from "../api";
import LoadingOverlay from "../components/LoadingOverlay";
import { useFocusEffect } from "@react-navigation/native";
import { StackScreenProps } from "@react-navigation/stack";
import { getUserId } from "../services/TokenService";
import { ProfileStackParamList } from "../Stack/ProfileStack";
import PostComponent from "../components/Post";

type Props = StackScreenProps<ProfileStackParamList, "FriendProfile">;

const FriendProfileScreen: React.FC<Props> = ({ navigation, route }) => {
  const { userId } = route.params || {};
  const [loading, setLoading] = useState(false);
  const [modalOption, setModalOption] = useState({
    type: "",
    visibile: false,
  });

  const [userData, setUserData] = useState({
    number_of_posts: 0,
    following: 0,
    follower: 0,
    username: "",
    avatar_url: "",
    isFollowing: false,
  });

  const [userPosts, setUserPosts] = useState([
    {
      id: "",
      thumbnail_url: "",
      post_audience: "Public",
      title: "",
      content: "",
      created_at: "",
      like_counts: 0,
      comment_counts: 0,
      isLike: false,
      locationId: "",
    },
  ]);

  const handlePostDelete = (id: string) => {
    setUserPosts((prevPosts) => prevPosts.filter((post) => post.id !== id));
    setUserData({
      number_of_posts: userData.number_of_posts - 1,
      follower: userData.follower,
      following: userData.following,
      username: userData.username,
      avatar_url: userData.avatar_url,
      isFollowing: userData.isFollowing
    })
  };

  useFocusEffect(
    useCallback(() => {
      fetchUserData();
    }, [])
  );
  
  const goBack = (reload: boolean) => {
    if (reload) {
      fetchUserData();
    } else {
      navigation.goBack()
    }
  }

  const followFriend = async () => {
    try {
      setLoading(true);
        const response = await api.post(`/user/following?friend_id=${userId}`)
        setUserData((prevData) => ({
          ...prevData,
          isFollowing: true,
          follower: prevData.follower + 1, 
        }));
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  const unfollowFriend = async () => {
    Alert.alert( 
        "Theo dõi",
        "Bạn có chắc chắn muốn thực hiện hành động này?",
        [
            {
                text: "Không",
                style: "cancel",
            },
            {
            text: "Có",
                onPress: async () => {
                  try {
                    setLoading(true);
                      const res = await api.delete(`/user/following?friend_id=${userId}`)
                      setUserData((prevData) => ({
                        ...prevData,
                        isFollowing: false,
                        follower: prevData.follower - 1, 
                      }));
                  } catch (error) {
                    console.log(error);
                  } finally {
                    setLoading(false);
                  }
                },
            },
        ]
    );
  }

  useEffect(() => {
    setModalOption({type: "", visibile: false})
    fetchUserData()
  }, [userId])

  const fetchUserPosts = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/post/${userId}/posts`);
      setUserPosts(response.data.result);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserData = async () => {
    try {
      setLoading(true);
        const response = await api.get(`/user/general-profile?userId=${userId}`);
        setUserData(response.data.result);
        if (userId === getUserId()) {
          userData.isFollowing = true
        }
        if (response.data.result.isFollowing || userId === getUserId()) {
          fetchUserPosts()
        }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({
    item,
  }: {
    item: {
      id: string;
      thumbnail_url: string;
      post_audience: string;
      title: string;
      content: string;
      created_at: string;
      like_counts: number;
      comment_counts: number;
      isLike: boolean;
      locationId: string;
    };
  }) => (
    <PostComponent
      userId={userId}
      id={item.id}
      title={item.title}
      user_url={userData.avatar_url}
      username={userData.username}
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

  const handleUserListChanged = (reloadPage: boolean) => {
    if (reloadPage)
      fetchUserData();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <FlatList
        data={userPosts}
        renderItem={(userData.isFollowing || userId === getUserId() )? renderItem : null}
        keyExtractor={(item) => item.id}
        style={styles.list}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <>
            <View style={styles.header}>
              <TouchableOpacity onPress={() => goBack(userId === undefined)}>
                <Ionicons name="arrow-back" size={24} color="black" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>{userData.username}</Text>
              <View style={{ width: 24 }} />
            </View>

            <View style={styles.profileInfo}>
              <Image
                source={
                  userData.avatar_url
                    ? { uri: userData.avatar_url }
                    : require("../assets/default-avatar.png")
                }
                style={styles.profileImage}
              />

              <View style={styles.statsContainer}>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{userData.number_of_posts}</Text>
                  <Text style={styles.statLabel}>Đã đăng</Text>
                </View>

                <TouchableOpacity
                  onPress={() => {
                    if (userData.isFollowing || userId === getUserId())
                      setModalOption({ type: "followed", visibile: true })
                  }}
                >
                  <View style={styles.statItem}>
                    <Text style={styles.statNumber}>{userData.follower}</Text>
                    <Text style={styles.statLabel}>Người theo dõi</Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    if (userData.isFollowing || userId === getUserId())
                      setModalOption({ type: "following", visibile: true })
                  }}
                >
                  <View style={styles.statItem}>
                    <Text style={styles.statNumber}>{userData.following}</Text>
                    <Text style={styles.statLabel}>Theo dõi</Text>
                  </View>
                </TouchableOpacity>
              </View>

              <View style={styles.buttonContainer}>
                {userData.isFollowing ? (
                  <View style={styles.twoButtonsRow}>
                    <TouchableOpacity
                      onPress={() => unfollowFriend()}
                      style={[styles.followButton, styles.messageButton]}
                    >
                      <Text style={styles.followButtonText}>
                        Bỏ theo dõi
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      // onPress={() => {
                      //   navigation.navigate("ChatScreen"); 
                      // }}
                      style={[styles.followButton, styles.unfollowButton]}
                    >
                      <Text style={styles.unfollowButtonText}>
                        Nhắn tin
                      </Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity
                    onPress={async () => {
                      if (userId === getUserId())
                        navigation.navigate("ProfileDetail");
                      else {
                        followFriend()
                      }
                    }}
                    style={styles.followButton}
                  >
                    <Text style={styles.followButtonText}>
                      {userId === getUserId() ? "Chỉnh sửa thông tin người dùng" : "Theo dõi"}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </>
        }
      />
      {modalOption.visibile && (
        <BottomSheetModal
          userId={userId}
          type={modalOption.type}
          visible={modalOption.visibile}
          onClose={() => setModalOption({ type: "", visibile: false })}
          navigation={{
            navigate: navigation.navigate,
          }}
          onUserListChanged={handleUserListChanged}
        />
      )}
      <LoadingOverlay visible={loading} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: "white",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  profileInfo: {
    alignItems: "center",
    padding: 20,
    backgroundColor: "white",
  },
  profileImage: {
    width: 150,
    height: 150,
    borderRadius: 80,
    marginBottom: 10,
  },
  username: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 15,
  },
  statsContainer: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-around",
    marginBottom: 20,
  },
  statItem: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 18,
    fontWeight: "bold",
  },
  statLabel: {
    fontSize: 14,
    color: "#333",
    textAlign: "center",
  },
  buttonContainer: {
    marginTop: 10,
    width: '100%',
  },
  twoButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  followButton: {
    backgroundColor: '#FF6F20',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  messageButton: {
    flex: 1,
    marginRight: 8,
  },
  unfollowButton: {
    backgroundColor: '#FFE6D8',
    flex: 1,
    marginLeft: 8,
  },
  followButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  unfollowButtonText: {
    color: '#FF6F20',
    fontWeight: 'bold',
  },
  postsSection: {
    marginTop: 10,
    backgroundColor: "white",
    flex: 1,
  },
  postsSectionTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#FF6B00",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  postItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  postHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  postAuthorImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  postTitle: {
    fontWeight: "500",
  },
  postTime: {
    fontSize: 12,
    color: "#666",
  },
  postImage: {
    width: "100%",
    height: 200,
    borderRadius: 5,
    marginBottom: 10,
  },
  postCaption: {
    fontSize: 14,
    marginBottom: 15,
  },
  postActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingTop: 10,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionText: {
    marginLeft: 5,
  },
  list: {
    flex: 1,
  },
});
export default FriendProfileScreen;
