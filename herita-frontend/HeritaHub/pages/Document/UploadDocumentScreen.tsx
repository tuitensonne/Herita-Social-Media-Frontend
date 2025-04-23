import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import { Ionicons, MaterialIcons, FontAwesome5, AntDesign } from "@expo/vector-icons";

const UploadDocumentScreen = () => {
  const [attachedImages, setAttachedImages] = useState([
    require("../../assets/Dinh_Độc_Lập_vào_nàm_2024.jpg"),
    require("../../assets/Dinh_Độc_Lập_vào_nàm_2024.jpg"),
    require("../../assets/Dinh_Độc_Lập_vào_nàm_2024.jpg"),
    require("../../assets/Dinh_Độc_Lập_vào_nàm_2024.jpg"),
    require("../../assets/Dinh_Độc_Lập_vào_nàm_2024.jpg"),
    require("../../assets/Dinh_Độc_Lập_vào_nàm_2024.jpg"),
  ]);

  const handleAddImage = () => {
    // Function to handle adding new images
    console.log("Add image pressed");
    // Would typically open image picker here
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Tải tài liệu</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {/* Basic Info Section */}
          <TextInput
            style={styles.input}
            placeholder="Tên tài liệu"
            placeholderTextColor="#999"
          />
          <TextInput
            style={styles.input}
            placeholder="Mô tả ngắn gọn"
            placeholderTextColor="#999"
          />

          <Text style={styles.sectionTitle}>Thông tin chung</Text>
          <TextInput
            style={styles.textArea}
            placeholder="Tóm tắt di tích lịch sử"
            placeholderTextColor="#999"
            multiline
            numberOfLines={4}
          />

          {/* Attached Images */}
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.inputLabel}>Hình ảnh đính kèm</Text>
            <TouchableOpacity style={styles.addButton} onPress={handleAddImage}>
              <FontAwesome5 name="paperclip" size={18} color="#777" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.imagesContainer}>
            {attachedImages.map((image, index) => (
              <View key={index} style={styles.imageWrapper}>
                <Image source={image} style={styles.attachedImage} />
                <TouchableOpacity style={styles.removeImageButton}>
                  <AntDesign name="close" size={16} color="#fff" />
                </TouchableOpacity>
              </View>
            ))}
            <TouchableOpacity style={styles.addImageBox} onPress={handleAddImage}>
              <AntDesign name="plus" size={28} color="#aaa" />
            </TouchableOpacity>
          </View>

          {/* Location Map */}
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.inputLabel}>Hình ảnh địa điểm</Text>
          </View>
          <View style={styles.mapContainer}>
            <Image
              source={require("../../assets/map.png")}
              style={styles.mapImage}
              resizeMode="cover"
            />
            <View style={styles.mapPin}>
              <MaterialIcons name="location-on" size={24} color="#4285F4" />
            </View>
            <TouchableOpacity style={styles.attachButton}>
              <FontAwesome5 name="paperclip" size={20} color="#777" />
            </TouchableOpacity>
          </View>

          {/* Detailed Information */}
          <Text style={styles.sectionTitle}>Thông tin chi tiết</Text>
          <TextInput
            style={styles.input}
            placeholder="Tên gọi"
            placeholderTextColor="#999"
          />
          <TextInput
            style={styles.input}
            placeholder="Tên khác (nếu có)"
            placeholderTextColor="#999"
          />
          <TextInput
            style={styles.input}
            placeholder="Địa điểm"
            placeholderTextColor="#999"
          />

          {/* Construction Information */}
          <Text style={styles.sectionTitle}>Xây dựng</Text>
          <View style={styles.dateInputContainer}>
            <TextInput
              style={styles.dateInput}
              placeholder="Ngày khởi công"
              placeholderTextColor="#999"
            />
            <TouchableOpacity style={styles.calendarButton}>
              <Ionicons name="calendar" size={20} color="#777" />
            </TouchableOpacity>
          </View>

          <View style={styles.dateInputContainer}>
            <TextInput
              style={styles.dateInput}
              placeholder="Ngày hoàn thành"
              placeholderTextColor="#999"
            />
            <TouchableOpacity style={styles.calendarButton}>
              <Ionicons name="calendar" size={20} color="#777" />
            </TouchableOpacity>
          </View>

          <View style={styles.dateInputContainer}>
            <TextInput
              style={styles.dateInput}
              placeholder="Ngày trùng tu(nếu có)"
              placeholderTextColor="#999"
            />
            <TouchableOpacity style={styles.calendarButton}>
              <Ionicons name="calendar" size={20} color="#777" />
            </TouchableOpacity>
          </View>

          <TextInput
            style={styles.input}
            placeholder="Diện tích"
            placeholderTextColor="#999"
          />
          <TextInput
            style={styles.input}
            placeholder="Chiều cao"
            placeholderTextColor="#999"
          />

          {/* Historical Information */}
          <Text style={styles.sectionTitle}>Lịch sử</Text>
          <TextInput
            style={styles.textArea}
            placeholder="Lịch sử về di tích văn hóa"
            placeholderTextColor="#999"
            multiline
            numberOfLines={4}
          />
          
          {/* Submit Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.cancelButton}>
              <Text style={styles.cancelButtonText}>Hủy</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.submitButton}>
              <Text style={styles.submitButtonText}>Lưu</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  backButton: {
    paddingRight: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    flex: 1,
    textAlign: "center",
    marginRight: 24,
  },
  form: {
    padding: 16,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    marginBottom: 16,
    paddingHorizontal: 12,
    backgroundColor: "#f9f9f9",
    fontSize: 16,
  },
  dateInput: {
    flex: 1,
    height: 48,
    paddingHorizontal: 12,
    fontSize: 16,
    backgroundColor: "#f9f9f9",
  },
  dateInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    marginBottom: 16,
    backgroundColor: "#f9f9f9",
  },
  calendarButton: {
    padding: 12,
  },
  textArea: {
    height: 100,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    marginBottom: 16,
    paddingHorizontal: 12,
    paddingTop: 12,
    backgroundColor: "#f9f9f9",
    textAlignVertical: "top",
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
    marginTop: 4,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "500",
  },
  addButton: {
    padding: 4,
  },
  imagesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 16,
  },
  imageWrapper: {
    width: "33%",
    aspectRatio: 1,
    padding: 4,
    position: "relative",
  },
  attachedImage: {
    width: "100%",
    height: "100%",
    borderRadius: 8,
  },
  removeImageButton: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  addImageBox: {
    width: "33%",
    aspectRatio: 1,
    padding: 4,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    borderStyle: "dashed",
    margin: 4,
  },
  mapContainer: {
    height: 160,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    marginBottom: 16,
    overflow: "hidden",
    position: "relative",
  },
  mapImage: {
    width: "100%",
    height: "100%",
  },
  mapPin: {
    position: "absolute",
    top: "50%",
    left: "50%",
    marginLeft: -12,
    marginTop: -24,
  },
  attachButton: {
    position: "absolute",
    bottom: 8,
    right: 8,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    marginBottom: 40,
  },
  cancelButton: {
    flex: 1,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    marginRight: 8,
  },
  submitButton: {
    flex: 1,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#4285F4",
    borderRadius: 8,
    marginLeft: 8,
  },
  cancelButtonText: {
    fontSize: 16,
    color: "#555",
  },
  submitButtonText: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "600",
  },
});

export default UploadDocumentScreen;