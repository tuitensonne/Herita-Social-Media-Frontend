import React, { useRef, useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Animated,
  PanResponder,
  Dimensions,
  FlatList,
  GestureResponderEvent,
  PanResponderGestureState,
  Alert,
} from "react-native";
import api from "../api";
import LoadingOverlay from "./LoadingOverlay";
import { getUserId } from "../services/TokenService";

const SCREEN_HEIGHT = Dimensions.get("window").height;
const DISMISS_THRESHOLD = 150;

type Props = {
  userId: string;
  type: string;
  visible: boolean;
  onClose: () => void;
  navigation: {
    navigate: (screen: string, params?: any) => void;
  };
  onUserListChanged?: (pageChange: boolean) => void;
};

const BottomSheetModal: React.FC<Props> = ({
  userId,
  visible,
  onClose,
  navigation,
  type,
  onUserListChanged,
}) => {
  const pan = useRef(new Animated.ValueXY()).current;
  const modalOpacity = useRef(new Animated.Value(0)).current;
  const [loading, setLoading] = useState(false);
  const [userList, setUserList] = useState([
    {
      id: "",
      name: "",
      avatar_url: "",
      isFollowing: false,
    },
  ]);

  useEffect(() => {
    fetchUserList();
  }, []);

  useEffect(() => {
    if (visible) {
      pan.setValue({ x: 0, y: SCREEN_HEIGHT });
      Animated.parallel([
        Animated.timing(pan.y, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(modalOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, pan, modalOpacity]);

  const fetchUserList = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/user/${type}?friend_id=${userId}`);
      const data = response.data.result;
      setUserList([...data]);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleNavigate = (userId: string) => {
    navigation.navigate("FriendProfile", { userId: userId });
  };

  const handleMessage = (friendId: string, friendName: string) => {
    const currentUserId = getUserId();
    navigation.navigate("Conversation", {
      chatId: friendId,
      chatType: "private",
      chatName: friendName,
      userId: currentUserId,
    });
    onClose();
  };

  const followFriend = async (friend_id: string) => {
    try {
      setLoading(true);
      await api.post(`/user/following?friend_id=${friend_id}`);
      fetchUserList();
      if (onUserListChanged) {
        onUserListChanged(true);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleFollowAction = (friend_id: string, isFollowing: boolean) => {
    if (!isFollowing) {
      followFriend(friend_id);
    } else {
      const title =
        type === "following"
          ? "Bỏ theo dõi người này?"
          : "Xóa người này khỏi danh sách người theo dõi?";
      const actionText = type === "following" ? "Bỏ theo dõi" : "Xóa";

      Alert.alert(title, "Bạn có chắc chắn muốn thực hiện hành động này?", [
        {
          text: "Không",
          style: "cancel",
        },
        {
          text: "Có",
          onPress: async () => {
            try {
              setLoading(true);
              if (type === "following") {
                const res = await api.delete(
                  `/user/following?friend_id=${friend_id}`
                );
              } else if (type === "followed") {
                const res = await api.delete(
                  `/user/follower?friend_id=${friend_id}`
                );
              }
              fetchUserList();
              if (onUserListChanged) {
                onUserListChanged(true);
              }
              Alert.alert("Thành công", `${actionText} thành công`);
            } catch (err) {
              console.log(err);
              Alert.alert("Lỗi", "Có lỗi xảy ra khi gửi yêu cầu");
            } finally {
              setLoading(false);
            }
          },
        },
      ]);
    }
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (
        _: GestureResponderEvent,
        gestureState: PanResponderGestureState
      ) => {
        if (gestureState.dy > 0) {
          pan.y.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (
        _: GestureResponderEvent,
        gestureState: PanResponderGestureState
      ) => {
        if (gestureState.dy > DISMISS_THRESHOLD) {
          Animated.parallel([
            Animated.timing(pan.y, {
              toValue: SCREEN_HEIGHT,
              duration: 300,
              useNativeDriver: true,
            }),
            Animated.timing(modalOpacity, {
              toValue: 0,
              duration: 300,
              useNativeDriver: true,
            }),
          ]).start(() => onClose());
        } else {
          Animated.spring(pan.y, {
            toValue: 0,
            tension: 100,
            friction: 15,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  if (!visible) return null;

  const renderItem = ({
    item,
  }: {
    item: {
      id: string;
      name: string;
      avatar_url: string;
      isFollowing: boolean;
    };
  }) => (
    <View style={styles.followerItem}>
      <TouchableOpacity
        style={styles.userInfoContainer}
        onPress={() => handleNavigate(item.id)}
      >
        <Image
          source={
            item.avatar_url
              ? { uri: item.avatar_url }
              : require("../assets/default-avatar.png")
          }
          style={styles.avatar}
        />
        <Text
          style={styles.followerName}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {item.name}
        </Text>
      </TouchableOpacity>

      <View style={styles.buttonContainer}>
        {item.id !== getUserId() && (
          <TouchableOpacity
            onPress={() => handleFollowAction(item.id, item.isFollowing)}
            style={styles.followButton}
          >
            <Text style={styles.followButtonText}>
              {item.isFollowing
                ? type === "following"
                  ? "Bỏ theo dõi"
                  : "Xóa"
                : "Theo dõi"}
            </Text>
          </TouchableOpacity>
        )}

        {item.id !== getUserId() && item.isFollowing && (
          <TouchableOpacity
            style={styles.messageButton}
            onPress={() => handleMessage(item.id, item.name)}
          >
            <Text style={styles.messageText}>Nhắn tin</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Animated.View
        style={[styles.backdrop, { opacity: modalOpacity }]}
        onTouchStart={onClose}
      />

      <Animated.View
        style={[
          styles.modal,
          {
            transform: [{ translateY: pan.y }],
          },
        ]}
        {...panResponder.panHandlers}
      >
        <View style={styles.dragHandleContainer}>
          <View style={styles.dragHandle} />
        </View>

        <FlatList
          data={userList}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          style={styles.list}
          showsVerticalScrollIndicator={false}
        />
      </Animated.View>
      <LoadingOverlay visible={loading} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modal: {
    backgroundColor: "#F0F0F0",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 40,
    height: SCREEN_HEIGHT * 0.7,
    width: "100%",
  },
  dragHandleContainer: {
    alignItems: "center",
    paddingVertical: 10,
  },
  dragHandle: {
    width: 40,
    height: 5,
    backgroundColor: "#CDCDCD",
    borderRadius: 3,
  },
  list: {
    flex: 1,
  },
  followerItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },
  userInfoContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 5,
  },
  followerName: {
    fontSize: 16,
    fontWeight: "500",
    flexShrink: 1,
    flex: 1,
    marginRight: 5,
  },
  buttonContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  followButton: {
    backgroundColor: "#FF6B00",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginRight: 10,
  },
  followButtonText: {
    color: "white",
    fontWeight: "500",
    fontSize: 14,
  },
  messageButton: {
    backgroundColor: "#FFE0D1",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  messageText: {
    color: "#FF6B00",
    fontWeight: "500",
    fontSize: 14,
  },
});

export default BottomSheetModal;
