import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import socket from "../socket";
import api from "../api";
import { getUserId } from "../services/TokenService";
import Ionicons from '@expo/vector-icons/Ionicons';

interface ChatItem {
  id: string;
  name: string;
  message: string;
  time: string;
  avatar: string;
  type: "private" | "group";
  unread?: boolean;
}

const ChatListItem = React.memo(
  ({ item, onPress }: { item: ChatItem; onPress: () => void }) => (
    <TouchableOpacity style={styles.chatItem} onPress={onPress}>
      <Image
        source={
          item.avatar
            ? { uri: item.avatar }
            : require("../assets/default-avatar.png")
        }
        style={styles.avatar}
      />
      <View style={styles.chatContent}>
        <Text style={styles.chatName}>{item.name}</Text>
        <Text style={styles.chatMessage} numberOfLines={1}>
          {item.message}
        </Text>
      </View>
      <Text style={styles.chatTime}>{item.time}</Text>
    </TouchableOpacity>
  )
);

const Header = React.memo(() => (
  <View style={styles.header}>
    <Text style={styles.headerTitle}>Chat</Text>
  </View>
));

const SearchBar = React.memo(() => (
  <View style={styles.searchContainer}>
    <View style={styles.searchBar}>
      <Ionicons name="search-outline" size={24} color="gray" />
      <TextInput
        style={styles.searchInput}
        placeholder="Tìm kiếm người dùng hoặc nhóm"
        placeholderTextColor="#9EA3B0"
      />
    </View>
  </View>
));

const TabNavigation = React.memo(
  ({
    activeTab,
    onTabChange,
  }: {
    activeTab: "chat" | "group";
    onTabChange: (tab: "chat" | "group") => void;
  }) => (
    <View style={styles.tabContainer}>
      <TouchableOpacity
        style={[styles.tab, activeTab === "chat" && styles.activeTab]}
        onPress={() => onTabChange("chat")}
      >
        <Text
          style={[styles.tabText, activeTab === "chat" && styles.activeTabText]}
        >
          Chat riêng
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.tab, activeTab === "group" && styles.activeTab]}
        onPress={() => onTabChange("group")}
      >
        <Text
          style={[
            styles.tabText,
            activeTab === "group" && styles.activeTabText,
          ]}
        >
          Chat nhóm
        </Text>
      </TouchableOpacity>
    </View>
  )
);

const ChatListScreen = ({ navigation, route }: any) => {
  const [activeTab, setActiveTab] = useState<"chat" | "group">("chat");
  const [chatData, setChatData] = useState<ChatItem[]>([]);
  const [loading, setLoading] = useState(true);
  const userId = getUserId();

  // Thiết lập WebSocket
  useEffect(() => {
    // Tham gia phòng của người dùng
    socket.emit("join", userId);

    // Lắng nghe tin nhắn riêng mới
    const handleNewPrivateMessage = (message: any) => {
      setChatData((prev) => {
        const updatedChats = [...prev];
        const chatIndex = updatedChats.findIndex(
          (chat) =>
            chat.type === "private" &&
            (chat.id === message.sender_id || chat.id === message.receiver_id)
        );
        if (chatIndex !== -1) {
          updatedChats[chatIndex] = {
            ...updatedChats[chatIndex],
            message: message.content,
            time: new Date(message.created_at).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
            unread: true,
          };
          const [updatedChat] = updatedChats.splice(chatIndex, 1);
          updatedChats.unshift(updatedChat);
        }
        return updatedChats;
      });
    };

    // Lắng nghe tin nhắn nhóm mới
    const handleNewGroupMessage = (message: any) => {
      setChatData((prev) => {
        const updatedChats = [...prev];
        const chatIndex = updatedChats.findIndex(
          (chat) => chat.type === "group" && chat.id === message.group_id
        );
        if (chatIndex !== -1) {
          updatedChats[chatIndex] = {
            ...updatedChats[chatIndex],
            message: message.content,
            time: new Date(message.created_at).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
            unread: true,
          };
          const [updatedChat] = updatedChats.splice(chatIndex, 1);
          updatedChats.unshift(updatedChat);
        }
        return updatedChats;
      });
    };

    // Lắng nghe nhóm mới
    const handleGroupCreated = (group: any) => {
      setChatData((prev) => [
        {
          id: group.id,
          name: group.name,
          message: "Nhóm mới được tạo",
          time: new Date(group.created_at).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          avatar: "",
          type: "group",
          unread: false,
        },
        ...prev,
      ]);
    };

    socket.on("new_private_message", handleNewPrivateMessage);
    socket.on("new_group_message", handleNewGroupMessage);
    socket.on("group_created", handleGroupCreated);

    return () => {
      socket.off("new_private_message", handleNewPrivateMessage);
      socket.off("new_group_message", handleNewGroupMessage);
      socket.off("group_created", handleGroupCreated);
    };
  }, [userId]);

  useEffect(() => {
    const fetchChats = async () => {
      setLoading(true);
      try {
        let response;
        if (activeTab === "chat") {
          response = await api.get(`/chat/conversations/${userId}`);
        } else {
          response = await api.get(`/chat/conversations/group`);
        }

        const chats = response.data;

        const formatted = chats.map((chat: any) => ({
          id: activeTab === "chat" ? chat.id : chat.id,
          name: activeTab === "chat" ? chat.username : chat.name,
          message: chat.lastMessage || "Chưa có tin nhắn",
          time: chat.lastMessageTime
            ? new Date(chat.lastMessageTime).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })
            : "",
          avatar: activeTab === "chat" ? chat.avatar_url || "" : "",
          type: activeTab === "chat" ? "private" : "group",
          unread: false,
        }));

        setChatData(formatted);
      } catch (err) {
        console.error(`Lỗi khi lấy danh sách ${activeTab}:`, err);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchChats();
    }
  }, [activeTab, userId]);

  const handleChatPress = useCallback(
    (chat: ChatItem) => {
      navigation.navigate("Conversation", {
        chatId: chat.id,
        chatType: chat.type,
        chatName: chat.name,
        userId,
      });
    },
    [navigation, userId]
  );

  const keyExtractor = useCallback((item: ChatItem) => item.id, []);
  const renderItem = useCallback(
    ({ item }: { item: ChatItem }) => (
      <ChatListItem item={item} onPress={() => handleChatPress(item)} />
    ),
    [handleChatPress]
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <Header />
      <SearchBar />
      <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
      {loading ? (
        <ActivityIndicator
          size="large"
          color="#FF7733"
          style={{ marginTop: 20 }}
        />
      ) : (
        <FlatList
          data={chatData}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          windowSize={5}
          removeClippedSubviews={true}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 56,
    paddingHorizontal: 16,
  },
  backButton: {
    padding: 8,
  },
  backIcon: {
    fontSize: 24,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginLeft: 16,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 44,
  },
  searchIcon: {
    marginRight: 8,
    fontSize: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#000000",
  },
  tabContainer: {
    flexDirection: "row",
    borderBottomColor: "#EEEEEE",
    borderBottomWidth: 1,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 14,
  },
  activeTab: {
    borderBottomColor: "#FF7733",
    borderBottomWidth: 2,
  },
  tabText: {
    fontSize: 16,
    color: "#9EA3B0",
  },
  activeTabText: {
    color: "#FF7733",
    fontWeight: "500",
  },
  chatItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomColor: "#F5F5F5",
    borderBottomWidth: 1,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  chatContent: {
    flex: 1,
    marginLeft: 12,
  },
  chatName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  chatMessage: {
    fontSize: 14,
    color: "#9EA3B0",
  },
  chatTime: {
    fontSize: 12,
    color: "#9EA3B0",
  },
});

export default ChatListScreen;
