import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  View,
  SafeAreaView,
  StatusBar,
  Text,
  TouchableOpacity,
  Image, // Thêm Image vì dùng PostImage
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons"; // Thêm Icon vì dùng trực tiếp

import UserInfo from "./components/UserInfo";
import PostImage from "./components/PostImage";
import ActionButtons from "./components/ActionButtons";
// Không cần import CTABanner, EngagementStats, PostContent nữa

import { dimens } from "../../constants/dimens";
import { colors } from "../../constants/color";

const postData = {
  user: {
    avatarUrl: "https://i.pravatar.cc/100?u=champer",
    username: "Chạm bờ môi em",
    handle: "champer",
    timestamp: "2h ago",
  },
  // Dùng mảng nếu PostImage hỗ trợ carousel
  imageUrls: [
    "https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/Dinh_Doc_Lap_2018.jpg/1280px-Dinh_Doc_Lap_2018.jpg",
    "https://static.vinwonders.com/production/dinh-doc-lap-1.jpg",
    "https://cdn.britannica.com/37/189937-050-741F04A7/Reunification-Palace-Ho-Chi-Minh-City-Vietnam.jpg",
  ],
  // imageUrl: 'https://path/to/single/image.jpg', // Hoặc dùng 1 ảnh
  cta: {
    message: "Xem tài liệu về di tích",
    buttonText: "Tải đây",
  },
  engagement: {
    likes: 12000,
    comments: 5,
  },
  content: {
    title: "Khám phá Dinh Độc Lập hay Hội trường Thống Nhất",
    body: "Hội trường Thống Nhất là một công trình mang đậm dấu ấn lịch sử, được khởi công vào ngày 1 tháng 7 năm 1962 và hoàn thành vào ngày 31 tháng 10 năm 1966. Tác phẩm này là thành quả sáng tạo của kiến trúc sư Ngô Viết Thụ, người đã thổi hồn vào từng đường nét thiết kế với tinh thần văn hóa sâu sắc.",
  },
};
// --- ---

type Tab = "info" | "comments";

// Hàm format số lớn (giữ nguyên hoặc chuyển vào util)
const formatCount = (count: number | string): string => {
  if (typeof count === "string") return count;
  if (count >= 1000000) {
    return (count / 1000000).toFixed(1).replace(".0", "") + "M";
  }
  if (count >= 1000) {
    return (count / 1000).toFixed(1).replace(".0", "") + "K";
  }
  return count.toString();
};

const DetailPostScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>("info");
  const [isLiked, setIsLiked] = useState(false);

  const handleLike = () => {
    setIsLiked(!isLiked);
    // Logic cập nhật like count (ví dụ)
    // Chú ý: Cách cập nhật này không lý tưởng trong thực tế
    if (!isLiked) {
      postData.engagement.likes += 1; // Cần quản lý state tốt hơn
    } else {
      postData.engagement.likes -= 1;
    }
  };

  const handleShare = () => {
    console.log("Share pressed");
  };

  const handleDownload = () => {
    console.log("Download pressed - from DetailScreen");
  };

  // --- Component Tab đơn giản (giữ nguyên) ---
  const renderTabs = () => (
    <View style={styles.tabContainer}>
      <TouchableOpacity
        style={[
          styles.tabButton,
          activeTab === "info" && styles.activeTabButton,
        ]}
        onPress={() => setActiveTab("info")}
      >
        <Text
          style={[styles.tabText, activeTab === "info" && styles.activeTabText]}
        >
          Thông tin chi tiết
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.tabButton,
          activeTab === "comments" && styles.activeTabButton,
        ]}
        onPress={() => setActiveTab("comments")}
      >
        <Text
          style={[
            styles.tabText,
            activeTab === "comments" && styles.activeTabText,
          ]}
        >
          Bình luận ({formatCount(postData.engagement.comments)})
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
      {/* Header */}

      {renderTabs()}

      <ScrollView style={styles.scrollView}>
        {activeTab === "info" && (
          <>
            {/* 1. User Info (Component) */}
            <UserInfo
              avatarUrl={postData.user.avatarUrl}
              username={postData.user.username}
              handle={postData.user.handle}
              timestamp={postData.user.timestamp}
            />

            {/* 2. Post Image (Component) */}
            <PostImage imageUrls={postData.imageUrls} />
            {/* Hoặc <PostImage imageUrl={postData.imageUrl} /> */}

            {/* 3. CTA Banner (Inline JSX) */}
            <View style={styles.ctaContainer}>
              <Text style={styles.ctaMessage}>{postData.cta.message}</Text>
              <TouchableOpacity
                style={styles.ctaButton}
                onPress={handleDownload}
                activeOpacity={0.8}
              >
                <Text style={styles.ctaButtonText}>
                  {postData.cta.buttonText}
                </Text>
              </TouchableOpacity>
            </View>

            {/* 4. Engagement Stats (Inline JSX) */}
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Icon
                  name="thumb-up-outline"
                  size={18}
                  color={colors.iconGray}
                />
                {/* Cập nhật số like dựa trên state isLiked */}
                <Text style={styles.statText}>
                  {formatCount(postData.engagement.likes)}
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statText}>
                  {formatCount(postData.engagement.comments)} bình luận
                </Text>
              </View>
            </View>

            {/* 5. Post Content (Inline JSX) */}
            <View style={styles.contentContainer}>
              <Text style={styles.contentTitle}>{postData.content.title}</Text>
              <Text style={styles.contentBody}>{postData.content.body}</Text>
            </View>
          </>
        )}

        {activeTab === "comments" && (
          <View style={styles.commentsPlaceholder}>
            <Text>Khu vực hiển thị bình luận...</Text>
          </View>
        )}

        {/* Để khoảng trống cuối scroll view nếu ActionButtons cố định */}
        {/* <View style={{ height: 70 }} /> */}
      </ScrollView>

      {/* 6. Action Buttons (Component - cố định bên dưới) */}
      {/* Chỉ hiển thị nút khi ở tab info */}
      {activeTab === "info" && (
        <ActionButtons
          onLikePress={handleLike}
          onSharePress={handleShare}
          isLiked={isLiked}
        />
      )}
    </SafeAreaView>
  );
};

// --- StyleSheet ---
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.white,
  },
  scrollView: {
    flex: 1,
    backgroundColor: colors.white,
  },
  // --- Tab Styles (Giữ nguyên) ---
  tabContainer: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tabButton: {
    flex: 1,
    alignItems: "center",
    paddingVertical: dimens.paddingMedium - 2,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  activeTabButton: {
    borderBottomColor: colors.primary,
  },
  tabText: {
    fontSize: 15,
    color: colors.textSecondary,
    fontWeight: "500",
  },
  activeTabText: {
    color: colors.primary,
  },

  // --- Styles cho phần Inline ---
  // CTA Banner Styles
  ctaContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.lightGray,
    paddingHorizontal: dimens.paddingMedium,
    paddingVertical: dimens.paddingSmall + 2,
    marginHorizontal: dimens.paddingMedium,
    borderRadius: dimens.borderRadius,
    marginTop: dimens.paddingMedium,
    borderWidth: 1,
    borderColor: colors.secondary,
  },
  ctaMessage: {
    fontSize: 14,
    color: colors.textSecondary,
    flex: 1,
    marginRight: dimens.paddingSmall,
  },
  ctaButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: dimens.paddingMedium,
    paddingVertical: dimens.paddingSmall,
    borderRadius: dimens.borderRadius,
  },
  ctaButtonText: {
    color: colors.white,
    fontWeight: "bold",
    fontSize: 14,
  },
  // Engagement Stats Styles
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: dimens.paddingMedium,
    marginTop: dimens.paddingMedium,
    paddingBottom: dimens.paddingSmall,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  statText: {
    marginLeft: dimens.paddingSmall / 2,
    fontSize: 14,
    color: colors.textSecondary,
  },
  // Post Content Styles
  contentContainer: {
    paddingHorizontal: dimens.paddingMedium,
    paddingVertical: dimens.paddingMedium,
  },
  contentTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.textPrimary,
    marginBottom: dimens.paddingSmall,
    lineHeight: 28,
  },
  contentBody: {
    fontSize: 15,
    color: colors.textPrimary,
    lineHeight: 22,
  },
  // Comments Placeholder
  commentsPlaceholder: {
    flex: 1, // Để chiếm không gian còn lại trong ScrollView
    justifyContent: "center",
    alignItems: "center",
    padding: dimens.paddingLarge,
    minHeight: 200, // Đặt chiều cao tối thiểu để thấy rõ
  },
});

export default DetailPostScreen;
