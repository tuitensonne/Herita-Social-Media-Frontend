import React, { useState, useEffect, ReactNode } from "react";
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
import api from "../../api";

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

interface CultureContent {
  id: string;
  created_at: string;
  title: string;
  description: string;
  category: string;
  Content: {
    id: string;
    title: string;
    content: string;
    updated_at: string;
    culture_id: string;
    Media: {
      id: string;
      image_url: string;
      type: string;
      postId: string | null;
      contentSectionId: string;
    }[];
  }[];
}

const DocumentScreen: React.FC<{ route: { params: { id: string } } }> = ({
  route,
}) => {
  const { id } = route.params; // Assume ID is passed via navigation params
  const [cultureContent, setCultureContent] = useState<CultureContent | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCultureContent = async () => {
      try {
        const response = await api.get(`/api/v1/culture-content/${id}`);
        if (response.data.status === "success") {
          setCultureContent(response.data.result);
        } else {
          setError("Failed to fetch culture content");
        }
      } catch (err) {
        setError("An error occurred while fetching data");
      } finally {
        setLoading(false);
      }
    };

    fetchCultureContent();
  }, [id]);

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Text style={styles.loadingText}>Loading...</Text>
      </SafeAreaView>
    );
  }

  if (error || !cultureContent) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Text style={styles.errorText}>{error || "No data available"}</Text>
      </SafeAreaView>
    );
  }

  // Helper function to parse content string into key-value pairs
  const parseContent = (
    content: string
  ): { label: string; value: string }[] => {
    return content
      .split("\n")
      .filter((line) => line.includes(":"))
      .map((line) => {
        const [label, ...valueParts] = line.split(":");
        return {
          label: label.trim(),
          value: valueParts.join(":").trim(),
        };
      });
  };

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
          <Text style={styles.mainTitle}>{cultureContent.title}</Text>
          <Text style={styles.subtitle}>{cultureContent.description}</Text>
        </View>

        {cultureContent.Content.map((section, index) => (
          <CollapsibleSection
            key={section.id}
            title={section.title}
            initialCollapsed={section.title !== "Thông tin chung"} // Expand "Thông tin chung" by default
          >
            <View style={styles.detailedInfoContainer}>
              {section.content &&
              !["Một số hình ảnh", "Hình ảnh di tích"].includes(
                section.title
              ) ? (
                <>
                  {section.title === "Thông tin chung" ? (
                    <Text style={styles.generalInfoText}>
                      {section.content}
                    </Text>
                  ) : (
                    parseContent(section.content).map((item, idx) => (
                      <InfoRow
                        key={idx}
                        label={item.label}
                        value={item.value}
                        isLast={
                          idx === parseContent(section.content).length - 1
                        }
                      />
                    ))
                  )}
                </>
              ) : null}

              {section.Media.length > 0 && (
                <View>
                  {section.Media.map((media, idx) => (
                    <InfoRow
                      key={media.id}
                      image={{ uri: media.image_url }}
                      isLast={idx === section.Media.length - 1}
                    />
                  ))}
                </View>
              )}
            </View>
          </CollapsibleSection>
        ))}
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
    backgroundColor: "#fff",
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
  },
  headerPlaceholder: {
    width: 34,
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
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  generalInfoText: {
    fontSize: 14,
    lineHeight: 20,
    color: "#333",
  },
  detailedInfoContainer: {
    borderWidth: 1,
    borderColor: "#eee",
    marginTop: 10,
    backgroundColor: "#fff",
    alignItems: "center",
    width: "95%",
    marginHorizontal: "auto",
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
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    color: "#333",
    textAlign: "right",
    flex: 1.5,
  },
  loadingText: {
    fontSize: 16,
    textAlign: "center",
    marginTop: 20,
  },
  errorText: {
    fontSize: 16,
    color: "red",
    textAlign: "center",
    marginTop: 20,
  },
});

export default DocumentScreen;
