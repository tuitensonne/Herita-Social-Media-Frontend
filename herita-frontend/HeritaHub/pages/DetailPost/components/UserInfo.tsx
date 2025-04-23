import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import { colors } from "../../../constants/color";
import { dimens } from "../../../constants/dimens";
interface UserInfoProps {
  avatarUrl: string;
  username: string;
  handle: string;
  timestamp: string;
}

const UserInfo: React.FC<UserInfoProps> = ({
  avatarUrl,
  username,
  handle,
  timestamp,
}) => {
  return (
    <View style={styles.container}>
      <Image source={{ uri: avatarUrl }} style={styles.avatar} />
      <View style={styles.textContainer}>
        <Text style={styles.username}>{username}</Text>
        <Text style={styles.handleTimestamp}>
          @{handle} · {timestamp}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: dimens.paddingMedium,
    paddingVertical: dimens.paddingSmall,
    backgroundColor: colors.white, // Thêm nền trắng nếu cần tách biệt
  },
  avatar: {
    width: dimens.avatarSize,
    height: dimens.avatarSize,
    borderRadius: dimens.avatarSize / 2,
    marginRight: dimens.paddingSmall,
    backgroundColor: colors.border, // Placeholder color
  },
  textContainer: {
    justifyContent: "center",
  },
  username: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.textPrimary,
  },
  handleTimestamp: {
    fontSize: 13,
    color: colors.textSecondary,
  },
});

export default UserInfo;
