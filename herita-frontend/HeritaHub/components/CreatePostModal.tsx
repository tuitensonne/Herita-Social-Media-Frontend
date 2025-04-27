import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Image,
  ScrollView,
  SafeAreaView,
  Alert,
} from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Ionicons } from "@expo/vector-icons";
import { FontAwesome } from "@expo/vector-icons";
import AvatarSelectionModal from "./GetImageModal";
import LocationModal, { LocationData } from "./LocationModal";
import api from "../api";
import axios from "axios";

interface MediaFile {
  uri: string;
  type: string;
}

interface CreatePostModalProps {
  onClose: () => void;
  onPostStarted: (progress: number) => void;
}

const CreatePostModal: React.FC<CreatePostModalProps> = ({
  onClose,
  onPostStarted,
}) => {
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [postData, setPostData] = useState({
    title: "",
    content: "",
    created_at: null,
    post_audience: null,
    location: null as LocationData | null,
  });
  const [type, setType] = useState<"Image" | "Video">("Image");

  const handleAvatarSelected = (uris: string[]) => {
    const newFiles = uris.map((uri) => ({
      uri,
      type: type === "Image" ? "Image" : "Video",
    }));
    setMediaFiles((prev) => [...prev, ...newFiles]);
  };

  const removeMedia = (index: number) => {
    const updatedMedia = [...mediaFiles];
    updatedMedia.splice(index, 1);
    setMediaFiles(updatedMedia);
  };

  const handleChange = (field: string, value: any) => {
    setPostData({ ...postData, [field]: value });
  };

  const handleLocationSelected = (location: LocationData) => {
    setPostData({ ...postData, location });
  };

  const removeLocation = () => {
    setPostData({ ...postData, location: null });
  };

  const handleCreatePost = async () => {
    if (    
        postData.title === "" || 
        ((!postData.content || postData.content === "") &&
        mediaFiles.length === 0)
      ) {
      Alert.alert("Thông báo", "Bài viết phải bao gồm tiêu đề và nội dung hoặc ít nhất một hình ảnh/video.");
      return;
    }
    setIsCreating(true);
    onPostStarted(0);

    try {
      const { post, cloudinaryParams } = await createPostInBackend();
      onPostStarted(10);
      if (mediaFiles.length > 0) {
        await uploadMediaFilesSequentially(post.id, cloudinaryParams);
      } else {
        onPostStarted(100);
      }
      onClose();
    } catch (error) {
      console.error("Create post failed:", error);
      alert("Không thể tạo bài viết. Vui lòng thử lại.");
      onPostStarted(0);
    } finally {
      setIsCreating(false);
    }
  };

  const createPostInBackend = async () => {
    try {
      const postPayload = {
        title: postData.title,
        content: postData.content,
        post_audience: postData.post_audience || 'Public',
        ...(postData.location && {
          location_id: postData.location.id
        }),
      };
      console.log("Post payload:", postPayload);
      const response = await api.post('/post', postPayload);
      return response.data.result;
    } catch (error) {
      console.error("Failed to create post:", error);
      throw new Error("Failed to create post in backend");
    }
  };

  const uploadMediaFilesSequentially = async (postId: string, cloudinaryParams: {folder: string, upload_preset: string, api_url: string}) => {
    const totalFiles = mediaFiles.length;
    const progressPerFile = 80 / totalFiles;
    
    for (let i = 0; i < totalFiles; i++) {
      const file = mediaFiles[i];
      
      const mediaUrl = await uploadToCloudinary(file, cloudinaryParams, (fileProgress) => {
        const overallProgress = 10 + (i * progressPerFile) + (fileProgress * progressPerFile / 100);
        onPostStarted(Math.round(overallProgress));
      });

      await api.patch(`post/${postId}`, {thumbnail_url: mediaUrl})

      await saveMediaToDatabase(postId, mediaUrl, file.type);
      
      const currentProgress = 10 + ((i + 1) * progressPerFile);
      onPostStarted(Math.round(currentProgress));
    }
    
    onPostStarted(100);
  };
  
  const uploadToCloudinary = async (
    file: MediaFile,
    cloudinaryParams: { folder: string; upload_preset: string; api_url: string },
    onProgress: (progress: number) => void
  ): Promise<string> => {
    const { folder, upload_preset, api_url } = cloudinaryParams;
  
    const formData = new FormData();
    formData.append("upload_preset", upload_preset);
    formData.append("folder", folder);
  
    const filename = file.uri.split("/").pop();
    const match = /\.(\w+)$/.exec(filename || "");
    const mimeType = match ? `${file.type}/${match[1]}` : "image/jpeg";
  
    formData.append("file", {
      uri: file.uri,
      name: filename || "file",
      type: mimeType,
    } as any); 
  
    try {
      const response = await axios.post(api_url, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          const percent = progressEvent.total
            ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
            : 0;
          onProgress(percent);
        },
      });
  
      return response.data.secure_url;
    } catch (error) {
      console.error("Upload to Cloudinary failed:", error);
      throw error;
    }
  };

  const saveMediaToDatabase = async (postId: string, mediaUrl: string, mediaType: string) => {
    try {
      await api.post(`post/${postId}/media`, {
        url: mediaUrl,
        type: mediaType.startsWith('Video') ? 'Video' : 'Image',
      });
    } catch (error) {
      console.error("Failed to save media to database:", error);
      throw new Error("Failed to save media to database");
    }
  };

  return (
    <SafeAreaView style={styles.modalContainer}>
      <View style={styles.modalHeader}>
        <TouchableOpacity onPress={onClose} style={styles.sideButton}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.modalTitle}>Đăng bài viết</Text>
      </View>

      <ScrollView contentContainerStyle={styles.modalContent}>
        <Text style={styles.title}>Thông tin bài đăng</Text>

        <TextInput
          placeholder="Tiêu đề"
          placeholderTextColor="#aaa"
          value={postData.title}
          onChangeText={(text) => handleChange("title", text)}
          style={styles.postTitle}
        />
        <TextInput
          style={styles.input}
          placeholder="Nội dung bài viết..."
          placeholderTextColor="#aaa"
          multiline
          value={postData.content}
          onChangeText={(text) => handleChange("content", text)}
        />

        <View style={styles.mediaButtonRow}>
          <TouchableOpacity
            style={styles.mediaIcon}
            onPress={() => {
              setType("Image");
              setShowAvatarModal(true);
            }}
          >
            <MaterialIcons name="photo-library" size={22} color="white" />
          </TouchableOpacity>
          {/* <TouchableOpacity
            style={styles.mediaIcon}
            onPress={() => {
              setType("Video");
              setShowAvatarModal(true);
            }}
          >
            <MaterialIcons name="videocam" size={22} color="white" />
          </TouchableOpacity> */}
          <View style={styles.locationWrapper}>
            <Text style={styles.addLocationText}>Thêm địa điểm</Text>
            <TouchableOpacity 
              style={styles.locationButton}
              onPress={() => setShowLocationModal(true)}
            >
              <Text style={styles.locationText}>
                {postData.location ? "Bật" : "Tắt"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {postData.location && (
          <View style={styles.selectedLocationContainer}>
            <View style={styles.selectedLocationInfo}>
              <Ionicons name="location" size={20} color="#007bff" />
              <Text style={styles.selectedLocationText}>
                {postData.location.name}
              </Text>
            </View>
            <TouchableOpacity 
              style={styles.removeLocationButton}
              onPress={removeLocation}
            >
              <Ionicons name="close-circle" size={20} color="#999" />
            </TouchableOpacity>
          </View>
        )}

        {mediaFiles.length > 0 && (
          <View style={styles.mediaGrid}>
            {mediaFiles.map((file, index) => (
              <View key={index} style={styles.mediaItem}>
                <Image source={{ uri: file.uri }} style={styles.previewImage} />
                {file.type.startsWith("Video") && (
                  <View style={styles.videoOverlay}>
                    <FontAwesome name="play" size={24} color="white" />
                  </View>
                )}
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => removeMedia(index)}
                >
                  <MaterialIcons name="close" size={16} color="white" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[
            styles.footerButton, 
            styles.postButton,
            (!postData.title && !postData.content && mediaFiles.length === 0) ? styles.disabledButton : {}
          ]}
          onPress={handleCreatePost}
          disabled={!postData.title && !postData.content && mediaFiles.length === 0}
        >
          <Text style={styles.footerButtonText}>Đăng</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.footerButton, styles.cancelButton, { borderWidth: 1, borderBlockColor: "#F00"}]}
          onPress={onClose}
        >
          <Text style={[styles.footerButtonText, { color: "#F00" }]}>Hủy</Text>
        </TouchableOpacity>
      </View>
      
      <AvatarSelectionModal
        visible={showAvatarModal}
        onClose={() => setShowAvatarModal(false)}
        onImageSelected={handleAvatarSelected}
        multiSelection={true}
        type={type}
      />
      
      <LocationModal
        visible={showLocationModal}
        onClose={() => setShowLocationModal(false)}
        onLocationSelected={handleLocationSelected}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  modalContainer: { flex: 1, backgroundColor: "#fff" },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 60,
    paddingHorizontal: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    flex: 1,
  },
  sideButton: { width: 24, alignItems: "center" },
  modalContent: { padding: 16 },
  title: { fontSize: 16, fontWeight: "bold", marginBottom: 8 },
  postTitle: {
    height: 40,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    minHeight: 100,
    textAlignVertical: "top",
  },
  mediaButtonRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
  },
  mediaIcon: {
    backgroundColor: "#FF6D00",
    borderRadius: 32,
    padding: 10,
    marginRight: 12,
  },
  locationWrapper: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: "auto",
  },
  addLocationText: { fontSize: 14, marginRight: 8 },
  locationButton: {
    borderWidth: 1,
    borderColor: "#FF6D00",
    borderRadius: 16,
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  locationText: {
    color: "#FF6D00",
    fontWeight: "500",
  },
  mediaGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 12,
  },
  mediaItem: {
    width: 100,
    height: 100,
    margin: 4,
    borderRadius: 8,
    position: "relative",
  },
  previewImage: {
    width: "100%",
    height: "100%",
    borderRadius: 8,
  },
  removeButton: {
    position: "absolute",
    top: 2,
    right: 2,
    backgroundColor: "black",
    borderRadius: 10,
    padding: 2,
  },
  videoOverlay: {
    position: "absolute",
    top: "35%",
    left: "35%",
    backgroundColor: "rgba(0,0,0,0.4)",
    borderRadius: 30,
    padding: 4,
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 16,
  },
  footerButton: {
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderColor: "#FF6D00",
    minWidth: 100,
    alignItems: "center",
  },
  postButton: {
    backgroundColor: "#FF6D00",
  },
  cancelButton: {
    backgroundColor: "#fff",
  },
  disabledButton: {
    backgroundColor: "#FFE6D8",
  },
  footerButtonText: {
    fontWeight: "bold",
    color: "#fff",
  },
  selectedLocationContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
    marginBottom: 15,
  },
  selectedLocationInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  selectedLocationText: {
    fontSize: 14,
    marginLeft: 10,
  },
  removeLocationButton: {
    padding: 5,
  },
});

export default CreatePostModal;
