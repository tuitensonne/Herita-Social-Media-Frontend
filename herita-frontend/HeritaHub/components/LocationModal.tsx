// LocationModal.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Modal,
  ActivityIndicator,
  FlatList,
  Alert,
  SafeAreaView,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import MapView, { Marker } from "react-native-maps";
import api from "../api";

interface LocationData {
    id?: string;
    name: string;
    address?: string;
    latitude: number;
    longitude: number;
    distance: number;
    post_count: number;
}

interface LocationModalProps {
  visible: boolean;
  onClose: () => void;
  onLocationSelected: (location: LocationData) => void;
  locationImage?: any; 
}

const LocationModal: React.FC<LocationModalProps> = ({
  visible,
  onClose,
  onLocationSelected,
  locationImage,
}) => {
    const [searchText, setSearchText] = useState("");
    const [locationPermission, setLocationPermission] = useState<boolean | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [currentLocation, setCurrentLocation] = useState<Location.LocationObject | null>(null);
    const [suggestedLocations, setSuggestedLocations] = useState<LocationData[]>([]);
    const [searchResults, setSearchResults] = useState<LocationData[]>([]);
    const [showMap, setShowMap] = useState(false);
    const [selectedMapLocation, setSelectedMapLocation] = useState<{
        latitude: number;
        longitude: number;
    } | null>(null);
    const [customLocationName, setCustomLocationName] = useState("");
    const [isSearching, setIsSearching] = useState(false);

    useEffect(() => {
        if (visible) {
            checkLocationPermission();
        }
    }, [visible]);

    const checkLocationPermission = async () => {
        try {
            const serviceEnabled = await Location.hasServicesEnabledAsync();
            
            if (!serviceEnabled) {
                setLocationPermission(false);
                return;
            }
            const { status } = await Location.getForegroundPermissionsAsync();
            if (status !== 'granted') {
                setLocationPermission(false);
                return;
            }

            setLocationPermission(true);
            setIsLoading(true);
            const location = await Location.getCurrentPositionAsync({});
            setCurrentLocation(location);
            fetchNearbyPlaces(location.coords.latitude, location.coords.longitude);
        } catch (error) {
            console.error("Lỗi kiểm tra quyền truy cập vị trí:", error);
            setLocationPermission(false);
        }
    };

    const requestLocationPermission = async () => {
        try {
            const serviceEnabled = await Location.hasServicesEnabledAsync();
            
            if (!serviceEnabled) {
                Alert.alert(
                    "Vị trí không được bật",
                    "Vui lòng bật dịch vụ vị trí trong cài đặt thiết bị của bạn.",
                    [{ text: "OK" }]
                );
                return;
            }
            
            const { status } = await Location.requestForegroundPermissionsAsync();
            
            if (status !== 'granted') {
                Alert.alert(
                    "Quyền bị từ chối",
                    "Vui lòng cho phép ứng dụng truy cập vị trí của bạn trong cài đặt.",
                    [{ text: "OK" }]
                );
                setLocationPermission(false);
            } else {
                setLocationPermission(true);
                setIsLoading(true);
                const location = await Location.getCurrentPositionAsync({});
                setCurrentLocation(location);
                fetchNearbyPlaces(location.coords.latitude, location.coords.longitude);
            }
        } catch (error) {
            console.error("Lỗi kiểm tra quyền truy cập vị trí:", error);
            Alert.alert("Lỗi", "Không thể truy cập vị trí của bạn.");
        }
    };

    const fetchNearbyPlaces = async (latitude: number, longitude: number) => {
        try {
            setIsLoading(true);
            const response = await api.get(`location/nearby?latitude=${latitude}&longitude=${longitude}&page=1&limit=50`);
            setSuggestedLocations(response.data.result);
        } catch (error) {
            console.error("Lỗi lấy địa điểm gần bạn:", error);
        } finally {
            setIsLoading(false);
        }

            // const mockLocations: LocationData[] = [
            //     {
            //         name: "Coffee Shop",
            //         address: "123 Main St",
            //         latitude: latitude + 0.001,
            //         longitude: longitude + 0.001,
            //     },
            //     {
            //         name: "Restaurant",
            //         address: "456 Oak Ave",
            //         latitude: latitude - 0.001,
            //         longitude: longitude - 0.002,
            //     },
            //     {
            //         name: "Park",
            //         address: "789 Pine Blvd",
            //         latitude: latitude + 0.002,
            //         longitude: longitude - 0.001,
            //     },
            //     {
            //         name: "Shopping Mall",
            //         address: "101 Market St",
            //         latitude: latitude - 0.003,
            //         longitude: longitude + 0.003,
            //     },
            // ];
    };

    const searchLocationsByKeyword = (keyword: string) => {
        setIsSearching(true);
    };

    const handleSearch = (text: string) => {
        setSearchText(text);
        
        if (text.trim() === "") {
            setSearchResults([]);
            if (currentLocation && locationPermission) {
                fetchNearbyPlaces(currentLocation.coords.latitude, currentLocation.coords.longitude);
            }
        } else {
            searchLocationsByKeyword(text);
        }
    };

    const handleSelectLocation = (location: LocationData) => {
        onLocationSelected(location);
        onClose();
    };

    const handleMapLocationSelection = async () => {
        if (selectedMapLocation && customLocationName.trim()) {
            const customLocation: LocationData = {
                name: customLocationName,
                address: "Custom Location",
                latitude: selectedMapLocation.latitude,
                longitude: selectedMapLocation.longitude,
                distance: 0,
                post_count: 0
            } 
            try {
                customLocation['id'] = await saveNewLocation(customLocation);
                onLocationSelected(customLocation);
                onClose();
            } catch (error) {
                console.error("Error saving custom location:", error);
                Alert.alert("Lỗi", "Không thể lưu địa điểm.");
            }
        } else {
            Alert.alert("Lỗi", "Hãy cung cấp tên cho địa điểm này");
        }
    };

    const saveNewLocation = async (location: LocationData) => {
        try {
            const response = await api.post('location', location);
            Alert.alert("Thành công", "Địa điểm đã được lưu thành công.");
            return response.data.resullt.id
        } catch (error) {
            console.error("Lỗi lưu địa điểm:", error);
            Alert.alert("Lỗi", "Không thể lưu địa điểm.");
        }
    }

    const handleMapPress = (e: any) => {
        setSelectedMapLocation({
            latitude: e.nativeEvent.coordinate.latitude,
            longitude: e.nativeEvent.coordinate.longitude,
        });
    };

    const renderLocationPermissionNotice = () => {
        return (
            <View style={styles.permissionNotice}>
                <View style={styles.permissionNoticeContent}>
                    {locationImage ? (
                        <Image 
                            source={locationImage} 
                            style={styles.permissionNoticeImage} 
                            resizeMode="contain"
                        />
                    ) : (
                        <Ionicons name="location-outline" size={40} color="#FF6F20" style={styles.permissionIcon} />
                    )}
                    
                    <View style={styles.permissionTextContainer}>
                        <Text style={styles.permissionNoticeTitle}>
                            Bật vị trí để xem địa điểm gần bạn
                        </Text>
                        
                        <Text style={styles.permissionNoticeDescription}>
                            Chúng tôi sẽ hiển thị các địa điểm gần bạn nhất
                        </Text>
                    </View>
                </View>
                
                <TouchableOpacity 
                    style={styles.enableLocationButton}
                    onPress={requestLocationPermission}
                >
                    <Text style={styles.enableLocationText}>Bật vị trí</Text>
                </TouchableOpacity>
            </View>
        );
    };

    const renderLocations = () => {
        const locationsToShow = searchText.trim() !== "" ? searchResults : suggestedLocations;
        
        if (isSearching) {
            return (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#FF6F20" />
                    <Text style={styles.loadingText}>Đang tìm kiếm...</Text>
                </View>
            );
        }
        
        return (
            <FlatList
                data={locationsToShow}
                keyExtractor={(item, index) => index.toString()}
                ListHeaderComponent={!locationPermission ? renderLocationPermissionNotice() : null}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={styles.locationItem}
                        onPress={() => handleSelectLocation(item)}
                    >
                        <View style={styles.locationIconContainer}>
                            <Ionicons name="location" size={24} color="#FF6F20" />
                        </View>
                        <View style={styles.locationInfo}>
                            <Text style={styles.locationName}>{item.name}</Text>
                            <Text style={styles.locationAddress}>{item.address}</Text>
                            <View style={styles.locationStats}>
                                <Text style={styles.locationDistance}>
                                    {item.distance < 1 
                                        ? `${Math.round(item.distance * 1000)} m` 
                                        : `${item.distance.toFixed(1)} km`} từ vị trí của bạn
                                </Text>
                                <Text style={styles.postCount}>
                                    {item.post_count} {item.post_count === 1 ? 'người đã ghé thăm' : 'người đã ghé thăm'}
                                </Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                )}
                ListFooterComponent={
                    <TouchableOpacity
                        style={styles.addCustomLocationButton}
                        onPress={() => setShowMap(true)}
                    >
                        <Ionicons name="add-circle-outline" size={24} color="#FF6F20" />
                        <Text style={styles.addCustomLocationText}>Thêm một địa điểm khác</Text>
                    </TouchableOpacity>
                }
                ListEmptyComponent={
                    !isSearching && searchText.trim() !== "" ? (
                        <View style={styles.noResultsContainer}>
                            <Text style={styles.noResultsText}>Không tìm thấy kết quả</Text>
                        </View>
                    ) : null
                }
            />
        );
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={false}
            onRequestClose={onClose}
        >
            <SafeAreaView style={styles.locationModalContainer}>
                <View style={styles.locationModalHeader}>
                    <Text style={styles.locationModalTitle}>
                        {showMap ? "Chọn địa điểm trên map" : "Chọn một địa điểm"}
                    </Text>
                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                        <Ionicons name="close" size={24} color="black" />
                    </TouchableOpacity>
                </View>

                {!showMap ? (
                    <>
                        <View style={styles.searchBarContainer}>
                            <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
                            <TextInput
                                style={styles.searchInput}
                                placeholder="Tìm kiếm một địa điểm..."
                                value={searchText}
                                onChangeText={handleSearch}
                            />
                        </View>

                        {isLoading && !isSearching && searchText.trim() === "" ? (
                            <View style={styles.loadingContainer}>
                                <ActivityIndicator size="large" color="#FF6F20" />
                                <Text style={styles.loadingText}>Đang tìm kiếm địa điểm gần bạn...</Text>
                            </View>
                        ) : (
                            renderLocations()
                        )}
                    </>
                ) : (
                    <View style={styles.mapContainer}>
                        {currentLocation ? (
                            <>
                                <MapView
                                    style={styles.map}
                                    initialRegion={{
                                        latitude: currentLocation.coords.latitude,
                                        longitude: currentLocation.coords.longitude,
                                        latitudeDelta: 0.01,
                                        longitudeDelta: 0.01,
                                    }}
                                    onPress={handleMapPress}
                                >
                                    {selectedMapLocation && (
                                        <Marker
                                            coordinate={{
                                                latitude: selectedMapLocation.latitude,
                                                longitude: selectedMapLocation.longitude,
                                            }}
                                        />
                                    )}
                                </MapView>

                                <View style={styles.customLocationInputContainer}>
                                    <TextInput
                                        style={styles.customLocationInput}
                                        placeholder="Tên địa điểm này"
                                        value={customLocationName}
                                        onChangeText={setCustomLocationName}
                                    />
                                    <View style={styles.mapButtonsContainer}>
                                        <TouchableOpacity
                                            style={[styles.mapButton, styles.cancelMapButton]}
                                            onPress={() => setShowMap(false)}
                                        >
                                            <Text style={styles.cancelMapButtonText}>Quay lại</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={[styles.mapButton, styles.confirmMapButton]}
                                            onPress={handleMapLocationSelection}
                                            disabled={!selectedMapLocation || !customLocationName.trim()}
                                        >
                                            <Text style={styles.confirmMapButtonText}>Xác nhận</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </>
                        ) : (
                            <View style={styles.mapLoadingContainer}>
                                <ActivityIndicator size="large" color="#FF6F20" />
                                <Text style={styles.loadingText}>Đang tải bản đồ...</Text>
                            </View>
                        )}
                    </View>
                )}
            </SafeAreaView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    locationModalContainer: {
        flex: 1,
        backgroundColor: "#fff",
    },
    locationModalHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 15,
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
    },
    locationModalTitle: {
        fontSize: 18,
        fontWeight: "600",
    },
    closeButton: {
        position: "absolute",
        right: 15,
    },
    searchBarContainer: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
        backgroundColor: "#f9f9f9",
    },
    searchIcon: {
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        paddingVertical: 8,
        fontSize: 16,
    },
    permissionNotice: {
        margin: 10,
        padding: 15,
        backgroundColor: "#FFF5F0",
        borderRadius: 10,
        borderWidth: 1,
        borderColor: "#FFDCC8",
        marginBottom: 5,
    },
    permissionNoticeContent: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 10,
    },
    permissionNoticeImage: {
        width: 60,
        height: 60,
        marginRight: 10,
    },
    permissionIcon: {
        marginRight: 10,
    },
    permissionTextContainer: {
        flex: 1,
    },
    permissionNoticeTitle: {
        fontSize: 16,
        fontWeight: "600",
        marginBottom: 5,
    },
    permissionNoticeDescription: {
        fontSize: 14,
        color: "#666",
    },
    enableLocationButton: {
        backgroundColor: "#FF6F20",
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 20,
        alignSelf: "flex-start",
    },
    enableLocationText: {
        color: "#fff",
        fontWeight: "500",
        fontSize: 14,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingVertical: 30,
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: "#555",
    },
    locationItem: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
    },
    locationIconContainer: {
        marginRight: 15,
    },
    locationInfo: {
        flex: 1,
    },
    locationName: {
        fontSize: 16,
        fontWeight: "500",
    },
    locationAddress: {
        fontSize: 14,
        color: "#666",
        marginTop: 3,
    },
    locationStats: {
        flexDirection: 'row',
        marginTop: 5,
        alignItems: 'center',
    },
    locationDistance: {
        fontSize: 13,
        color: "#666",
        marginRight: 10,
    },
    postCount: {
        fontSize: 13,
        color: "#FF9500",
    },
    addCustomLocationButton: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
    },
    addCustomLocationText: {
        marginLeft: 10,
        fontSize: 16,
        color: "#FF6F20",
    },
    mapContainer: {
        flex: 1,
    },
    mapLoadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    map: {
        flex: 1,
    },
    customLocationInputContainer: {
        padding: 15,
        backgroundColor: "#fff",
        borderTopWidth: 1,
        borderTopColor: "#eee",
    },
    customLocationInput: {
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 10,
        padding: 10,
        fontSize: 16,
        marginBottom: 15,
    },
    mapButtonsContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    mapButton: {
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 10,
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    confirmMapButton: {
        backgroundColor: "#FF6F20",
        marginLeft: 10,
    },
    cancelMapButton: {
        backgroundColor: "#f0f0f0",
        marginRight: 10,
    },
    confirmMapButtonText: {
        color: "#fff",
        fontWeight: "600",
    },
    cancelMapButtonText: {
        color: "#555",
    },
    noResultsContainer: {
        padding: 20,
        alignItems: "center",
    },
    noResultsText: {
        fontSize: 16,
        color: "#999",
    },
});

export default LocationModal;

export type { LocationData };