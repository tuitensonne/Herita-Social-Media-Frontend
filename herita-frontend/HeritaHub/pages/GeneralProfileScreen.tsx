import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  FlatList,
  Alert,
} from "react-native";
import BottomSheetModal from "../components/FollowList";
import api from "../api";
import LoadingOverlay from "../components/LoadingOverlay";
import { useFocusEffect } from "@react-navigation/native";
import { StackScreenProps } from "@react-navigation/stack";
import { getUserId, clearTokens } from "../services/TokenService"; // Thêm clearTokens
import { ProfileStackParamList } from "../Stack/ProfileStack";
import PostComponent from "../components/Post";
import * as SecureStore from 'expo-secure-store'; // Thêm import SecureStore

type Props = StackScreenProps<ProfileStackParamList, "GeneralProfile">;

const GeneralProfileScreen: React.FC<Props> = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const [modalOption, setModalOption] = useState({
    type: "",
    visibile: false,
  });
  const [showLogoutMenu, setShowLogoutMenu] = useState(false);

  const [userData, setUserData] = useState({
    number_of_posts: 0,
    following: 0,
    follower: 0,
    username: "",
    avatar_url: "",
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
      locationId: ""
    },
  ]);

  const handlePostDelete = (id: string) => {
    setUserPosts((prevPosts) => prevPosts.filter((post) => post.id !== id));
    setUserData({
      number_of_posts: userData.number_of_posts - 1,
      follower: userData.follower,
      following: userData.following,
      username: userData.username,
      avatar_url: userData.avatar_url
    })
  };
  
  useFocusEffect(
    useCallback(() => {
      fetchUserData();
      fetchUserPosts();
    }, [])
  );

  const fetchUserPosts = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/post/${getUserId()}/posts`);
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
      const userId = getUserId();
      const response = await api.get(`/user/general-profile?userId=${userId}`);
      setUserData(response.data.result);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleUserListChanged = (reloadPage: boolean) => {
    if (reloadPage) fetchUserData();
  };
  
  // Thêm hàm xử lý đăng xuất
  const handleLogout = async () => {
    Alert.alert(
      "Đăng xuất",
      "Bạn có chắc chắn muốn đăng xuất?",
      [
        {
          text: "Hủy",
          style: "cancel"
        },
        {
          text: "Đăng xuất",
          onPress: async () => {
            setLoading(true);
            try {
              await clearTokens(); 
              navigation.reset({
                index: 0,
                routes: [{ name: 'Welcome' as any }],
              });
            } catch (error) {
              console.log("Lỗi khi đăng xuất:", error);
              Alert.alert("Lỗi", "Không thể đăng xuất. Vui lòng thử lại sau.");
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
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
      userId={getUserId()}
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

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <FlatList
        data={userPosts}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        style={styles.list}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <>
            <View style={styles.header}>
              <Text style={styles.headerTitle}>{userData.username}</Text>
              
              {/* Thêm nút menu "..." */}
              <TouchableOpacity 
                style={styles.menuButton}
                onPress={() => setShowLogoutMenu(!showLogoutMenu)}
              >
                <Text style={styles.menuButtonText}>...</Text>
              </TouchableOpacity>
              
              {/* Menu đăng xuất */}
              {showLogoutMenu && (
                <View style={styles.logoutMenu}>
                  <TouchableOpacity 
                    style={styles.logoutButton}
                    onPress={handleLogout}
                  >
                    <Text style={styles.logoutText}>Đăng xuất</Text>
                  </TouchableOpacity>
                </View>
              )}
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
                  <Text style={styles.statNumber}>
                    {userData.number_of_posts}
                  </Text>
                  <Text style={styles.statLabel}>Đã đăng</Text>
                </View>

                <TouchableOpacity
                  onPress={() =>
                    setModalOption({ type: "followed", visibile: true })
                  }
                >
                  <View style={styles.statItem}>
                    <Text style={styles.statNumber}>{userData.follower}</Text>
                    <Text style={styles.statLabel}>Người theo dõi</Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() =>
                    setModalOption({ type: "following", visibile: true })
                  }
                >
                  <View style={styles.statItem}>
                    <Text style={styles.statNumber}>{userData.following}</Text>
                    <Text style={styles.statLabel}>Theo dõi</Text>
                  </View>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                onPress={() => {
                  navigation.navigate("ProfileDetail");
                }}
                style={styles.followButton}
              >
                <Text style={styles.followButtonText}>
                  Chỉnh sửa thông tin người dùng
                </Text>
              </TouchableOpacity>
            </View>
          </>
        }
      />

      {modalOption.visibile && (
        <BottomSheetModal
          userId={getUserId()}
          type={modalOption.type}
          visible={modalOption.visibile}
          onClose={() => setModalOption({ type: "", visibile: false })}
          navigation={navigation}
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
    justifyContent: "center",
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: "white",
    position: "relative",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  menuButton: {
    position: "absolute",
    right: 15,
    padding: 5,
  },
  menuButtonText: {
    fontSize: 22,
    fontWeight: "bold",
  },
  logoutMenu: {
    position: "absolute",
    right: 10,
    top: 40,
    backgroundColor: "white",
    borderRadius: 5,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    zIndex: 1000,
  },
  logoutButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  logoutText: {
    color: "#FF6B00",
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
  followButton: {
    backgroundColor: "#FF6B00",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    width: "80%",
  },
  followButtonText: {
    color: "white",
    fontWeight: "500",
    textAlign: "center",
  },
  list: {
    flex: 1,
  },
});

export default GeneralProfileScreen;