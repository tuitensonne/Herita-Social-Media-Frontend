import React from "react";
import { Image, StyleSheet, View, Text } from "react-native";
import Swiper from "react-native-swiper"; // Import Swiper
import { colors } from "../../../constants/color";
import { dimens } from "../../../constants/dimens";

// Định nghĩa Props Interface mới
interface PostImageProps {
  imageUrls: string[]; // Chấp nhận mảng các URL ảnh
}

const PostImage: React.FC<PostImageProps> = ({ imageUrls }) => {
  // Trường hợp không có ảnh hoặc mảng rỗng
  if (!imageUrls || imageUrls.length === 0) {
    // Bạn có thể trả về null hoặc một placeholder
    return (
      <View style={[styles.image, styles.placeholder]}>
        <Text style={styles.placeholderText}>Không có ảnh</Text>
      </View>
    );
  }

  // Trường hợp chỉ có một ảnh, hiển thị như bình thường
  if (imageUrls.length === 1) {
    return (
      <View style={styles.container}>
        <Image
          source={{ uri: imageUrls[0] }}
          style={styles.image}
          resizeMode="cover"
        />
      </View>
    );
  }

  // Trường hợp có nhiều ảnh, dùng Swiper để tạo carousel
  return (
    <View style={styles.swiperContainer}>
      <Swiper
        loop={false} // Tắt lặp vô hạn (tùy chọn)
        showsPagination={true} // Hiển thị dấu chấm chỉ số trang
        dotColor={colors.border} // Màu dấu chấm không hoạt động
        activeDotColor={colors.primary} // Màu dấu chấm hoạt động (màu cam)
        paginationStyle={styles.pagination} // Style cho khu vực dấu chấm
        // showsButtons={true} // Bật nút trái/phải nếu muốn (cần style thêm)
        // nextButton={<Text style={styles.swiperButtonText}>›</Text>}
        // prevButton={<Text style={styles.swiperButtonText}>‹</Text>}
      >
        {imageUrls.map((url, index) => (
          <View key={index} style={styles.slide}>
            <Image
              source={{ uri: url }}
              style={styles.image}
              resizeMode="cover"
            />
          </View>
        ))}
      </Swiper>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // Style cho container khi chỉ có 1 ảnh
  },
  swiperContainer: {
    // Swiper cần chiều cao cụ thể để hoạt động đúng
    height: dimens.screenWidth * (9 / 16), // Giữ tỷ lệ 16:9 dựa trên chiều rộng màn hình
    // height: 250, // Hoặc một giá trị cố định
    backgroundColor: colors.border, // Nền chờ ảnh load
    // marginBottom: dimens.paddingSmall, // Khoảng cách dưới nếu cần
  },
  slide: {
    flex: 1, // Để View chiếm toàn bộ không gian slide
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.border, // Nền nếu ảnh không load được
  },
  image: {
    // Chiếm toàn bộ không gian của slide hoặc container
    width: "100%",
    height: "100%",
    backgroundColor: colors.border, // Màu nền chờ ảnh load
  },
  pagination: {
    bottom: 8, // Điều chỉnh vị trí dấu chấm
  },
  placeholder: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.lightGray,
    height: dimens.screenWidth * (9 / 16), // Chiều cao giống swiper
    width: "100%",
  },
  placeholderText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  // --- Styles cho nút Swiper nếu bật ---
  // swiperButtonText: {
  //   color: colors.primary,
  //   fontSize: 40, // Kích thước nút
  //   fontWeight: 'bold',
  // },
});

export default PostImage;
