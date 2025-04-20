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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import BottomSheetModal from "../components/FollowList";
import api from "../api";
import LoadingOverlay from "../components/LoadingOverlay";
import { useFocusEffect } from "@react-navigation/native";
import { StackScreenProps } from "@react-navigation/stack";
import { getUserId } from "../services/TokenService";
import { ProfileStackParamList } from "../Stack/ProfileStack";

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

  const fetchUserData = async () => {
    try {
      setLoading(true);
        const response = await api.get(`/user/general-profile?userId=${userId}`);
        setUserData(response.data.result);  
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleUserListChanged = (reloadPage: boolean) => {
    if (reloadPage)
      fetchUserData();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

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
              if (userData.isFollowing)
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
              if (userData.isFollowing)
                setModalOption({ type: "followed", visibile: true })
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
});
export default FriendProfileScreen;
