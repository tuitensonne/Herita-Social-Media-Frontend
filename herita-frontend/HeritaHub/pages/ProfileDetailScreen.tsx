import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Image,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
  Platform,
  ScrollView,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import LoadingOverlay from "../components/LoadingOverlay";
import * as ImagePicker from "expo-image-picker";
import { Modal } from "react-native";
import api from "../api";

interface Props {
  navigation: {
    navigate: (screen: string) => void;
    goBack: () => void
  };
}

const ProfileDetailSreen: React.FC<Props> = ({ navigation }) => {
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    date_of_birth: "",
    gender: "",
    avatar_url: null,
    bio: "",
  });
  const [old_avatar_url, setOldAvatarUrl] = useState("")
  const [loading, setLoading] = useState(false);
  const [dob, setDob] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    fetchUserData();
  }, []);

  const getFileName = (uri: string): string => {
    const extension = uri.split(".").pop();
    return `${Date.now()}.${extension}`;
  };

  const getFileType = (uri: string): string => {
    if (uri.endsWith(".png")) return "image/png";
    if (uri.endsWith(".jpg") || uri.endsWith(".jpeg")) return "image/jpeg";
    return "image/jpeg";
  };

  const fetchUserData = async () => {
    try {
      setLoading(true)
      const res = await api.get("user/profile");
      const data = res.data.result;
      setFormData(data);
      setOldAvatarUrl(res.data.result.avatar_url)
      if (data.date_of_birth) {
        setDob(new Date(data.date_of_birth));
      }
    } catch (error) {
      console.log(error);
      Alert.alert("Error", "Can't load user profile");
    } finally {
      setLoading(false)
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDob(selectedDate);
      handleChange("date_of_birth", selectedDate.toISOString());
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const form = new FormData();

      form.append("username", formData.username);
      form.append("email", formData.email);
      form.append("date_of_birth", formData.date_of_birth);
      form.append("gender", formData.gender);
      form.append("bio", formData.bio || "");
  
      if (old_avatar_url !== "")
        form.append("avatar_url", old_avatar_url)
  
      if (formData.avatar_url) {
        form.append("file", {
          uri: formData.avatar_url,
          name: getFileName(formData.avatar_url),
          type: getFileType(formData.avatar_url),
        } as any);
      }

      const res = await api.patch("user/profile", form, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setOldAvatarUrl(res.data.result.avatar_url)
      Alert.alert("Success", "Profile updated successfully!");
    } catch (err) {
      console.log(err);
      Alert.alert("Error", "Something went wrong while updating profile.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: "center"
        }}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
        </View>
        <View style={styles.container}>
          <TouchableOpacity
            style={styles.avatarContainer}
            onPress={() => setShowAvatarModal(true)}
          >
            <Image
              source={
                formData.avatar_url
                  ? { uri: formData.avatar_url }
                  : require("../assets/default-avatar.png")
              }
              style={styles.avatar}
            />
            <View style={styles.cameraIconContainer}>
              <MaterialIcons name="photo-camera" size={20} color="#fff" />
            </View>
          </TouchableOpacity>

          <Text style={styles.title}>Profile</Text>

          <Text style={styles.smallTitle}>Username</Text>
          <View style={styles.inputContainer}>
            <MaterialIcons
              name="account-circle"
              size={20}
              color="#555"
              style={styles.icon}
            />
            <TextInput
              placeholder="Your username"
              style={styles.input}
              value={formData.username}
              onChangeText={(text) => handleChange("username", text)}
            />
          </View>

          <Text style={styles.smallTitle}>Email</Text>
          <View style={styles.inputContainer}>
            <MaterialIcons
              name="email"
              size={20}
              color="#555"
              style={styles.icon}
            />
            <TextInput
              placeholder="Your email address"
              style={styles.input}
              value={formData.email}
              onChangeText={(text) => handleChange("email", text)}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          <Text style={styles.smallTitle}>Date of birth</Text>
          <TouchableOpacity
            style={styles.inputContainer}
            onPress={() => setShowDatePicker(true)}
          >
            <MaterialIcons
              name="calendar-today"
              size={20}
              color="#555"
              style={styles.icon}
            />
            <Text style={[styles.input, { color: dob ? "#000" : "#888" }]}>
              {dob ? dob.toLocaleDateString() : "Your date of birth"}
            </Text>
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={dob || new Date()}
              mode="date"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={handleDateChange}
              maximumDate={new Date()}
            />
          )}

          <Text style={styles.smallTitle}>Gender</Text>
          <View style={styles.inputContainer}>
            <Ionicons
              name="male-female"
              size={20}
              color="#555"
              style={styles.icon}
            />
            <Picker
              selectedValue={formData.gender}
              style={[styles.input, { height: 50 }]}
              onValueChange={(itemValue) => handleChange("gender", itemValue)}
            >
              <Picker.Item label="Male" value="Male" />
              <Picker.Item label="Female" value="Female" />
              <Picker.Item label="Other" value="Other" />
            </Picker>
          </View>

          <Text style={styles.smallTitle}>Bio</Text>
          <View style={styles.bioContainer}>
            <MaterialIcons
              name="info-outline"
              size={20}
              color="#555"
              style={styles.icon}
            />
            <TextInput
              placeholder="Tell us about yourself..."
              style={styles.bioInput}
              value={formData.bio || ""}
              onChangeText={(text) => handleChange("bio", text)}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          <TouchableOpacity style={styles.button} onPress={handleSubmit}>
            <Text style={styles.buttonText}>Update</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <Modal visible={showAvatarModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.smallTitle}>Choose your avatar</Text>

            <TouchableOpacity
              style={styles.modalButton}
              onPress={async () => {
                setShowAvatarModal(false);
                const perm = await ImagePicker.requestCameraPermissionsAsync();
                if (perm.status !== "granted") {
                  Alert.alert(
                    "Error",
                    "Don't have permission to access camera"
                  );
                  return;
                }
                const result = await ImagePicker.launchCameraAsync({
                  mediaTypes: "images",
                  allowsEditing: true,
                  quality: 1,
                });
                if (!result.canceled && result.assets?.length > 0) {
                  handleChange("avatar_url", result.assets[0].uri);
                }
              }}
            >
              <Text style={styles.modalButtonText}>Take photo</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalButton}
              onPress={async () => {
                setShowAvatarModal(false);
                const perm =
                  await ImagePicker.requestMediaLibraryPermissionsAsync();
                if (perm.status !== "granted") {
                  Alert.alert(
                    "Error",
                    "Don't have permission to access gallery"
                  );
                  return;
                }
                const result = await ImagePicker.launchImageLibraryAsync({
                  mediaTypes: "images",
                  allowsEditing: true,
                  quality: 1,
                });
                if (!result.canceled && result.assets?.length > 0) {
                  handleChange("avatar_url", result.assets[0].uri);
                }
              }}
            >
              <Text style={styles.modalButtonText}>Choose from gallery</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.modalButton,
                { paddingVertical: 0, backgroundColor: "white" },
              ]}
              onPress={() => setShowAvatarModal(false)}
            >
              <Text
                style={[
                  styles.modalButtonText,
                  { color: "#FF6F20", marginTop: 10 },
                ]}
              >
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <LoadingOverlay visible={loading} />
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
    paddingVertical: 10,
    backgroundColor: "white",
  },
  container: {
    flex: 1,
    paddingHorizontal: 30,
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  avatarContainer: {
    alignSelf: "center",
    marginBottom: 20,
    position: "relative",
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  cameraIconContainer: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#FF6F20",
    borderRadius: 20,
    padding: 5,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 30,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F6F6F8",
    borderRadius: 10,
    marginBottom: 15,
    paddingHorizontal: 15,
    height: 50,
  },
  smallTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  icon: {
    fontSize: 20,
    marginRight: 10,
    alignSelf: "center",
  },
  input: {
    flex: 1,
    fontSize: 16,
    backgroundColor: "#F6F6F8",
  },
  button: {
    backgroundColor: "#FF6F20",
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: "center",
    marginBottom: 20,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  bottomText: {
    textAlign: "center",
    fontSize: 14,
    color: "#000",
  },
  linkText: {
    color: "#FF6F20",
    fontWeight: "600",
  },
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
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
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
  bioContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#F6F6F8",
    borderRadius: 10,
    marginBottom: 15,
    paddingHorizontal: 15,
    paddingTop: 10,
    paddingBottom: 10,
  },
  bioInput: {
    flex: 1,
    fontSize: 16,
    minHeight: 100,
    backgroundColor: "#F6F6F8",
  },
});

export default ProfileDetailSreen;
