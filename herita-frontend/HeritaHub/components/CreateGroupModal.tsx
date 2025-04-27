import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Modal,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Image,
} from "react-native";
import api from "../api";
import { getUserId } from "../services/TokenService";
import Ionicons from "@expo/vector-icons/Ionicons";
import socket from "../socket";

// Định nghĩa kiểu cho bạn bè
interface Friend {
  id: string;
  username: string;
  avatar_url: string;
}

interface CreateGroupModalProps {
  visible: boolean;
  onClose: () => void;
  onGroupCreated: () => void;
}

const CreateGroupModal: React.FC<CreateGroupModalProps> = ({
  visible,
  onClose,
  onGroupCreated,
}) => {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [selectedFriends, setSelectedFriends] = useState<string[]>([]);
  const [groupName, setGroupName] = useState("");
  const [loading, setLoading] = useState(false);
  const userId = getUserId();

  useEffect(() => {
    if (visible) {
      fetchFriends();
    }
  }, [visible]);

  const fetchFriends = async () => {
    try {
      setLoading(true);
      const followingResponse = await api.get(
        `/user/following?friend_id=${userId}`
      );
      const following = followingResponse.data.result;

      const followerResponse = await api.get(
        `/user/followed?friend_id=${userId}`
      );
      const followers = followerResponse.data.result;

      const allFriends = [...following, ...followers];
      const uniqueFriends = Array.from(
        new Map(
          allFriends
            .filter((friend: Friend) => friend.id !== userId)
            .map((friend: Friend) => [friend.id, friend])
        ).values()
      );
      setFriends(uniqueFriends);
    } catch (error) {
      console.log("Lỗi khi lấy danh sách bạn bè:", error);
      Alert.alert("Lỗi", "Không thể tải danh sách bạn bè. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const toggleFriendSelection = (friendId: string) => {
    setSelectedFriends((prev) =>
      prev.includes(friendId)
        ? prev.filter((id) => id !== friendId)
        : [...prev, friendId]
    );
  };
  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập tên nhóm.");
      return;
    }
    if (selectedFriends.length === 0) {
      Alert.alert("Lỗi", "Vui lòng chọn ít nhất một thành viên để tạo nhóm.");
      return;
    }

    try {
      setLoading(true);
      const data = {
        creatorId: userId,
        groupName: groupName,
        memberIds: [...selectedFriends],
      };
      socket.emit("create_group", data, (response: any) => {
        if (response.error) {
          Alert.alert("Lỗi", response.error);
          setLoading(false);
          return;
        }
        Alert.alert("Thành công", "Nhóm đã được tạo thành công!");
        setGroupName("");
        setSelectedFriends([]);
        onGroupCreated();
        onClose();
        setLoading(false);
      });
    } catch (error) {
      console.log("Lỗi khi tạo nhóm:", error);
      Alert.alert("Lỗi", "Không thể tạo nhóm. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const renderFriendItem = ({ item }: { item: Friend }) => (
    <TouchableOpacity
      style={styles.friendItem}
      onPress={() => toggleFriendSelection(item.id)}
    >
      <Image
        source={
          item.avatar_url
            ? { uri: item.avatar_url }
            : require("../assets/default-avatar.png")
        }
        style={styles.friendAvatar}
      />
      <Text style={styles.friendName}>{item.name}</Text>
      {selectedFriends.includes(item.id) && (
        <Ionicons name="checkmark-circle" size={24} color="#FF7733" />
      )}
    </TouchableOpacity>
  );

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Tạo nhóm mới</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="black" />
            </TouchableOpacity>
          </View>

          <TextInput
            style={styles.groupNameInput}
            placeholder="Nhập tên nhóm"
            value={groupName}
            onChangeText={setGroupName}
          />

          <Text style={styles.sectionTitle}>Chọn bạn bè</Text>
          {loading ? (
            <ActivityIndicator
              size="large"
              color="#FF7733"
              style={{ marginTop: 20 }}
            />
          ) : (
            <FlatList
              data={friends}
              renderItem={renderFriendItem}
              keyExtractor={(item) => item.id}
              style={styles.friendList}
            />
          )}

          <TouchableOpacity
            style={[
              styles.createButton,
              loading && styles.createButtonDisabled,
            ]}
            onPress={handleCreateGroup}
            disabled={loading}
          >
            <Text style={styles.createButtonText}>Tạo nhóm</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    height: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  groupNameInput: {
    borderWidth: 1,
    borderColor: "#EEEEEE",
    borderRadius: 8,
    padding: 10,
    marginBottom: 20,
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 10,
  },
  friendList: {
    flex: 1,
  },
  friendItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
  },
  friendAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  friendName: {
    flex: 1,
    fontSize: 16,
    fontWeight: "500",
  },
  createButton: {
    backgroundColor: "#FF7733",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 20,
  },
  createButtonDisabled: {
    backgroundColor: "#FFAA80",
  },
  createButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default CreateGroupModal;
