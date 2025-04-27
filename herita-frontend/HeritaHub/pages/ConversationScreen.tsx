import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import socket from "../socket";
import api from "../api";
import Ionicons from "@expo/vector-icons/Ionicons";

interface Message {
  id: string;
  text: string;
  time: string;
  isSent: boolean;
  tempId?: string;
  senderName?: string;
  senderAvatar?: string;
}

const MessageBubble = React.memo(
  ({ message, chatType }: { message: Message; chatType: string }) => (
    <View style={[styles.messageRow, message.isSent && styles.sentMessageRow]}>
      {!message.isSent && (
        <Image
          source={
            message.senderAvatar
              ? { uri: message.senderAvatar }
              : require("../assets/default-avatar.png")
          }
          style={styles.messageAvatar}
        />
      )}
      <View style={styles.messageContainer}>
        {chatType === "group" && !message.isSent && message.senderName && (
          <Text style={styles.senderName}>{message.senderName}</Text>
        )}
        <View
          style={[
            styles.messageBubble,
            message.isSent
              ? styles.sentMessageBubble
              : styles.receivedMessageBubble,
          ]}
        >
          <Text
            style={[
              styles.messageText,
              message.isSent && styles.sentMessageText,
            ]}
          >
            {message.text}
          </Text>
        </View>
        <Text
          style={[
            styles.messageTime,
            message.isSent
              ? styles.sentMessageTime
              : styles.receivedMessageTime,
          ]}
        >
          {message.time}
        </Text>
      </View>
    </View>
  )
);

const ConversationHeader = React.memo(
  ({ onBack, chatName }: { onBack: () => void; chatName: string }) => (
    <View style={styles.header}>
      <TouchableOpacity style={styles.backButton} onPress={onBack}>
        <Ionicons name="arrow-back" size={24} color="black" />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>{chatName || "Chat"}</Text>
    </View>
  )
);

const ConversationScreen = ({ navigation, route }: any) => {
  const { chatId, chatType, chatName, userId } = route.params;
  const [messages, setMessages] = useState<Message[]>([]);
  const [tempMessage, setTempMessage] = useState<Message | null>(null);
  const [messageText, setMessageText] = useState("");
  const [loading, setLoading] = useState(true);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    const handleNewPrivateMessage = (message: any) => {
      if (
        chatType === "private" &&
        (message.sender.id === chatId || message.receiver.id === chatId)
      ) {
        const newMessage = {
          id: message.id,
          text: message.content,
          time: new Date(message.created_at).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          isSent: message.sender.id === userId,
          senderName: message.sender.username,
          senderAvatar: message.sender.avatar_url,
        };

        setMessages((prev) => [newMessage, ...prev]);
        setTempMessage(null);
      }
    };

    const handleNewGroupMessage = (message: any) => {
      if (chatType === "group" && message.group_id === chatId) {
        const newMessage = {
          id: message.id,
          text: message.content,
          time: new Date(message.created_at).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          isSent: message.sender.id === userId,
          senderName: message.sender.username,
          senderAvatar: message.sender.avatar_url,
        };

        setMessages((prev) => [newMessage, ...prev]);
        setTempMessage(null);
      }
    };

    socket.on("new_private_message", handleNewPrivateMessage);
    socket.on("new_group_message", handleNewGroupMessage);

    return () => {
      socket.off("new_private_message", handleNewPrivateMessage);
      socket.off("new_group_message", handleNewGroupMessage);
    };
  }, [chatId, chatType, userId]);

  useEffect(() => {
    const fetchMessages = async () => {
      setLoading(true);
      try {
        let response;
        if (chatType === "private") {
          response = await api.get(`/chat/private/${userId}/${chatId}`);
        } else {
          response = await api.get(`/chat/group/${chatId}`);
        }
        const formattedMessages = response.data.map((msg: any) => ({
          id: msg.id,
          text: msg.content,
          time: new Date(msg.created_at).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          isSent: msg.sender.id === userId,
          senderName: msg.sender.username,
          senderAvatar: msg.sender.avatar_url,
        }));

        setMessages(formattedMessages.reverse());
      } catch (err) {
        console.error(`Lỗi khi lấy tin nhắn ${chatType}:`, err);
      } finally {
        setLoading(false);
      }
    };

    if (chatId && userId) {
      fetchMessages();
    }
  }, [chatId, chatType, userId]);

  const handleSend = useCallback(() => {
    if (messageText.trim()) {
      const tempId = `temp-${Date.now()}`;
      const newMessage: Message = {
        id: tempId,
        text: messageText,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        isSent: true,
        tempId,
        senderName: "Bạn",
        senderAvatar: undefined,
      };

      setTempMessage(newMessage);
      setMessageText("");

      if (chatType === "private") {
        socket.emit("send_private_message", {
          senderId: userId,
          receiverId: chatId,
          content: messageText,
          tempId,
        });
      } else {
        socket.emit("send_group_message", {
          senderId: userId,
          groupId: chatId,
          content: messageText,
          tempId,
        });
      }

      setTimeout(() => {
        flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
      }, 100);
    }
  }, [messageText, chatType, chatId, userId]);

  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const keyExtractor = useCallback((item: Message) => item.id, []);
  const renderItem = useCallback(
    ({ item }: { item: Message }) => (
      <MessageBubble message={item} chatType={chatType} />
    ),
    [chatType]
  );

  const displayMessages = tempMessage ? [tempMessage, ...messages] : messages;

  return (
    <SafeAreaView style={styles.container}>
      <ConversationHeader onBack={handleBack} chatName={chatName} />
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        {loading ? (
          <ActivityIndicator size="large" color="#FF7733" style={{ flex: 1 }} />
        ) : (
          <FlatList
            ref={flatListRef}
            data={displayMessages}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
            inverted={true}
            initialNumToRender={15}
            maxToRenderPerBatch={10}
            windowSize={10}
            removeClippedSubviews={true}
            contentContainerStyle={styles.messageList}
          />
        )}
        <View style={styles.inputContainer}>
          <TouchableOpacity style={styles.emojiButton}>
            <Text style={styles.emojiIcon}>😊</Text>
          </TouchableOpacity>
          <TextInput
            style={styles.textInput}
            placeholder="Nhập tin nhắn..."
            placeholderTextColor="#9EA3B0"
            value={messageText}
            onChangeText={setMessageText}
            multiline
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              messageText.trim() ? styles.activeSendButton : {},
            ]}
            onPress={handleSend}
            disabled={!messageText.trim()}
          >
            <Text style={styles.sendIcon}>➤</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  keyboardAvoid: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    height: 56,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginLeft: 16,
  },
  messageList: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  messageRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginVertical: 4,
    maxWidth: "80%",
  },
  sentMessageRow: {
    alignSelf: "flex-end",
    flexDirection: "row-reverse",
  },
  messageContainer: {
    flexShrink: 1,
    justifyContent: "flex-start",
  },
  messageAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginHorizontal: 8,
    marginTop: 1,
  },
  messageBubble: {
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    maxWidth: "100%",
  },
  sentMessageBubble: {
    backgroundColor: "#FF7733",
    borderTopRightRadius: 0,
  },
  receivedMessageBubble: {
    backgroundColor: "#FFF0E6",
    borderTopLeftRadius: 0,
  },
  senderName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 2,
  },
  messageText: {
    fontSize: 16,
    color: "#000000",
  },
  sentMessageText: {
    color: "#FFFFFF",
  },
  messageTime: {
    fontSize: 12,
    marginHorizontal: 8,
    alignSelf: "flex-end",
  },
  sentMessageTime: {
    color: "#FF7733",
  },
  receivedMessageTime: {
    color: "#888",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  emojiButton: {
    padding: 8,
  },
  emojiIcon: {
    fontSize: 24,
  },
  textInput: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    maxHeight: 120,
    marginHorizontal: 8,
  },
  sendButton: {
    padding: 8,
    backgroundColor: "#F5F5F5",
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  activeSendButton: {
    backgroundColor: "#FF7733",
  },
  sendIcon: {
    fontSize: 18,
    color: "#FFFFFF",
  },
});

export default ConversationScreen;
