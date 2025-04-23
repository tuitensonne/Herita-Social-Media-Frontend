import React, { useState, ReactNode } from "react";
import {
  View,
  StyleSheet,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
  ImageSourcePropType,
} from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons";

interface CollapsibleSectionProps {
  title: string;
  children: ReactNode;
  initialCollapsed?: boolean;
  iconUp?: keyof typeof Feather.glyphMap;
  iconDown?: keyof typeof Feather.glyphMap;
}
const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  title,
  children,
  initialCollapsed = false,
  iconUp = "chevron-up",
  iconDown = "chevron-down",
}) => {
  const [isCollapsed, setIsCollapsed] = useState(initialCollapsed);

  return (
    <View style={styles.sectionContainer}>
      <TouchableOpacity
        onPress={() => setIsCollapsed(!isCollapsed)}
        style={styles.collapsibleHeader}
      >
        <Feather
          name={isCollapsed ? iconDown : iconUp}
          size={20}
          color="#666"
        />
        <Text style={styles.sectionTitle}>{title}</Text>
      </TouchableOpacity>
      {!isCollapsed && (
        <View style={styles.collapsibleContent}>{children}</View>
      )}
    </View>
  );
};
interface InfoRowProps {
  label?: string;
  value?: string;
  image?: ImageSourcePropType;
  isLast?: boolean;
}

const InfoRow: React.FC<InfoRowProps> = ({
  label,
  value,
  image,
  isLast = false,
}) => {
  return (
    <View style={[styles.infoRow, !isLast && styles.infoRowBorder]}>
      {image ? (
        <Image source={image} style={styles.rowImage} resizeMode="cover" />
      ) : (
        <>
          <Text style={styles.infoLabel}>{label}</Text>
          <Text style={styles.infoValue}>{value}</Text>
        </>
      )}
    </View>
  );
};

const DocumentScreen: React.FC = () => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tài liệu chi tiết</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      <ScrollView style={styles.container}>
        <View style={styles.titleSection}>
          <Text style={styles.mainTitle}>Dinh độc lập</Text>
          <Text style={styles.subtitle}>
            di tích lịch sử tại Việt Nam, từng là nơi ở của Tổng thống Việt Nam
            Cộng hòa
          </Text>
        </View>

        <CollapsibleSection title="Thông tin chung">
          <Text style={styles.generalInfoText}>
            Dinh Độc Lập là một tòa nhà của nhà nước tại Thành phố Hồ Chí Minh,
            từng là nơi ở và làm việc của Tổng thống Việt Nam Cộng hòa trước Sự
            kiện 30 tháng 4 năm 1975. Hiện nay, Dinh Độc Lập đã được Chính phủ
            Việt Nam xếp hạng là di tích quốc gia đặc biệt. Cơ quan quản lý di
            tích văn hoá Dinh Độc Lập có tên là Hội trường Thống Nhất thuộc Văn
            phòng Chính phủ.
          </Text>
          <View style={styles.sectionContainer}>
            <View style={styles.detailedInfoContainer}>
              <Text style={styles.detailedInfoTitle}>Dinh độc lập</Text>
              <InfoRow
                image={require("../../assets/Dinh_Độc_Lập_vào_nàm_2024.jpg")}
              />
              <InfoRow image={require("../../assets/map.png")} />
            </View>
          </View>

          <View style={styles.detailedInfoContainer}>
            <Text style={styles.detailedInfoTitle}>Thông tin chi tiết</Text>
            <InfoRow label="Tên gọi" value="Dinh độc lập" />
            <InfoRow label="Tên khác" value="Phủ Đầu Rồng" />
            <InfoRow
              label="Địa điểm"
              value="135 Nam Kỳ khởi nghĩa, phường Bến Thành, Quận 1, Thành phố Hồ Chí Minh, Việt Nam"
              isLast
            />
          </View>

          <View style={styles.detailedInfoContainer}>
            <Text style={styles.detailedInfoTitle}>Xây dựng</Text>
            <InfoRow label="Khởi công" value="1 tháng 7 năm 1962" />
            <InfoRow label="Hoàn thành" value="31 tháng 10 năm 1966" />
            <InfoRow label="Trùng tu" value="14 tháng 3 năm 1970" />
            <InfoRow label="Diện tích sàn" value="120.000 m²" />
            <InfoRow label="Chiều cao" value="26 m" isLast />
          </View>
        </CollapsibleSection>

        <CollapsibleSection title="Lịch sử" initialCollapsed>
          <Text>Thông tin lịch sử sẽ được thêm vào đây.</Text>
        </CollapsibleSection>

        <CollapsibleSection title="Một số hình ảnh">
          <View style={styles.detailedInfoContainer}>
            <InfoRow
              image={require("../../assets/Dinh_Độc_Lập_vào_nàm_2024.jpg")}
            />
            <InfoRow
              image={require("../../assets/Dinh_Độc_Lập_vào_nàm_2024.jpg")}
            />
            <InfoRow
              image={require("../../assets/Dinh_Độc_Lập_vào_nàm_2024.jpg")}
            />
          </View>
        </CollapsibleSection>
        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    backgroundColor: "#fff", // Match background
  },
  backButton: {
    padding: 5, // Increase tappable area
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
  },
  headerPlaceholder: {
    width: 24 + 10,
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  titleSection: {
    paddingHorizontal: 15,
    paddingTop: 20,
    paddingBottom: 10,
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
  },
  sectionContainer: {
    marginTop: 10,
  },
  collapsibleHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#eee",
    backgroundColor: "#f9f9f9",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "500",
    marginLeft: 10,
  },
  collapsibleContent: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: 1, // Add border below content if needed
    borderColor: "#eee",
  },
  generalInfoText: {
    fontSize: 14,
    lineHeight: 20,
    color: "#333",
  },
  imageSectionTitle: {
    fontSize: 16,
    fontWeight: "500",
    paddingHorizontal: 15,
    marginBottom: 10,
    marginTop: 15,
  },
  mainImage: {
    width: "100%",
    height: 200, // Adjust height as needed
    marginBottom: 10, // Spacing below image before map
  },
  mapImage: {
    width: "100%",
    height: 150, // Adjust height as needed
  },
  mapLabel: {
    textAlign: "center",
    fontSize: 13,
    color: "#666",
    paddingVertical: 8,
    borderBottomWidth: 1, // As per screenshot
    borderColor: "#eee",
    marginBottom: 10, // Spacing before next section
  },
  detailedInfoContainer: {
    borderRightWidth: 1,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#eee",
    marginTop: 10,
    backgroundColor: "#fff",
    alignItems: "center",
    width: "95%",
    margin: "auto",
  },
  detailedInfoTitle: {
    fontSize: 16,
    fontWeight: "500",
    paddingHorizontal: 15,
    paddingVertical: 12,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderColor: "#eee",
    width: "100%",
    textAlign: "center",
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  rowImage: {
    width: "100%",
    height: 200,
    borderRadius: 8,
  },
  infoRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  infoLabel: {
    fontSize: 14,
    color: "#555",
    fontWeight: "500",
    flex: 1, // Allow label to take up space but wrap
  },
  infoValue: {
    fontSize: 14,
    color: "#333",
    textAlign: "right",
    flex: 1.5, // Allow value more space and align right
  },
  galleryImage: {
    width: "100%",
    height: 200, // Adjust as needed
    marginBottom: 10, // Space between gallery images
  },
});
export default DocumentScreen;
