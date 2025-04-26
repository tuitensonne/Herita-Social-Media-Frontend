import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Alert
} from "react-native";
import * as ImagePicker from "expo-image-picker";

interface AvatarSelectionModalProps {
  visible: boolean;
  multiSelection: boolean;
  type: "Image" | "Video";
  onClose: () => void;
  onImageSelected: (uri: string[]) => void;
}

const AvatarSelectionModal: React.FC<AvatarSelectionModalProps> = ({
  visible,
  onClose,
  onImageSelected,
  multiSelection,
  type
}) => {
  const handleTakePhoto = async () => {
    onClose();
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (perm.status !== "granted") {
      Alert.alert("Error", "Don't have permission to access camera");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: type === "Image"
        ? ImagePicker.MediaTypeOptions.Images
        : ImagePicker.MediaTypeOptions.Videos,
      quality: 0.7,
    });

    if (!result.canceled && result.assets?.length > 0) {
      onImageSelected(result.assets.map((a) => a.uri));
    }
  };

  const handleChooseFromGallery = async () => {
    onClose();
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (perm.status !== "granted") {
      Alert.alert("Error", "Don't have permission to access gallery");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: type === "Image"
        ? ImagePicker.MediaTypeOptions.Images
        : ImagePicker.MediaTypeOptions.Videos,
      allowsMultipleSelection: multiSelection,
      quality: 0.7,
    });

    if (!result.canceled && result.assets?.length > 0) {
      onImageSelected(result.assets.map((a) => a.uri));
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.smallTitle}>Choose media</Text>

          <TouchableOpacity style={styles.modalButton} onPress={handleTakePhoto}>
            <Text style={styles.modalButtonText}>Take {type}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.modalButton} onPress={handleChooseFromGallery}>
            <Text style={styles.modalButtonText}>Choose from gallery</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.modalButton, { paddingVertical: 0, backgroundColor: "white" }]}
            onPress={onClose}
          >
            <Text style={[styles.modalButtonText, { color: "#FF6F20", marginTop: 10 }]}>
              Cancel
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    width: "80%",
    alignItems: "center",
  },
  smallTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  modalButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: "#f2f2f2",
    marginBottom: 10,
    width: "100%",
    alignItems: "center",
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: "500",
  },
});

export default AvatarSelectionModal;