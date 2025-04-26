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
  Dimensions,
} from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons";
import api from "../api";
import { StackScreenProps } from "@react-navigation/stack";
import { RootStackParamList } from "../App";

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
  label: string;
  value: string;
  isLast?: boolean;
}

const InfoRow: React.FC<InfoRowProps> = ({ label, value, isLast = false }) => {
  return (
    <View style={[styles.infoRow, !isLast && styles.infoRowBorder]}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
};

interface CultureContent {
  id: string;
  created_at: string;
  title: string;
  description: string;
  category: string;
  Content_section: {
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

type DocumentScreenProps = StackScreenProps<RootStackParamList, "Document">;

const DocumentScreen: React.FC<DocumentScreenProps> = ({ route, navigation }) => {
  const { id } = route.params;
  const [cultureContent, setCultureContent] = useState<CultureContent | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCultureContent = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get(`/culture-content/${id}`);
        if (response.data.status === "success" && response.data.result) {
          setCultureContent(response.data.result);
        } else {
          setError(response.data.message || "Failed to fetch culture content");
        }
      } catch (err: any) {
        console.error("Fetch Error:", err);
        setError(err.message || "An error occurred while fetching data");
      } finally {
        setLoading(false);
      }
    };

    fetchCultureContent();
  }, [id]);

  const parseKeyValueContent = (
    content: string
  ): { label: string; value: string }[] => {
    if (!content) return [];
    return content
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.includes(":"))
      .map((line) => {
        const separatorIndex = line.indexOf(":");
        const label = line.substring(0, separatorIndex).trim();
        const value = line.substring(separatorIndex + 1).trim();
        return { label, value };
      })
      .filter((item) => item.label && item.value);
  };

  const renderSectionContent = (section: CultureContent["Content_section"][0]) => {
    const hasImages = section.Media && section.Media.length > 0;
    const hasTextContent = section.content && section.content.trim().length > 0;
    const keyValuePairs = parseKeyValueContent(section.content);
    const isLikelyKeyValue = keyValuePairs.length > 0 && hasTextContent;
    const isLikelyParagraph = hasTextContent && !isLikelyKeyValue;
    const isImageOnlySection = hasImages && !hasTextContent;

    const imageElements = hasImages ? (
      <View style={styles.imageContainer}>
        {section.Media.map((media) => (
          <Image
            key={media.id}
            source={{ uri: media.image_url }}
            style={styles.contentImage}
            resizeMode="cover"
          />
        ))}
      </View>
    ) : null;

    let textElements = null;
    if (isLikelyKeyValue) {
      textElements = (
        <View>
          {keyValuePairs.map((item, idx) => (
            <InfoRow
              key={idx}
              label={item.label}
              value={item.value}
              isLast={idx === keyValuePairs.length - 1}
            />
          ))}
        </View>
      );
    } else if (isLikelyParagraph) {
      textElements = (
        <Text style={styles.paragraphText}>{section.content.trim()}</Text>
      );
    }

    return (
      <>
        {textElements}
        {imageElements}
      </>
    );
  };

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
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Error</Text>
          <View style={styles.headerPlaceholder} />
        </View>
        <Text style={styles.errorText}>{error || "No data available"}</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tài liệu chi tiết</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      <ScrollView style={styles.container}>
        <View style={styles.titleSection}>
          <Text style={styles.mainTitle}>{cultureContent.title}</Text>
          {cultureContent.description && (
            <Text style={styles.subtitle}>{cultureContent.description}</Text>
          )}
        </View>

        {cultureContent.Content_section.map((section) => (
          <CollapsibleSection
            key={section.id}
            title={section.title}
            initialCollapsed={section.title !== "Thông tin chung"}
          >
            {renderSectionContent(section)}
          </CollapsibleSection>
        ))}

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const screenWidth = Dimensions.get("window").width;

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
    flex: 1,
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
    paddingBottom: 15,
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#111",
  },
  subtitle: {
    fontSize: 14,
    color: "#555",
    lineHeight: 20,
  },
  sectionContainer: {},
  collapsibleHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderColor: "#eee",
    backgroundColor: "#f9f9f9",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 10,
    color: "#333",
  },
  collapsibleContent: {
    paddingHorizontal: 15,
    paddingVertical: 15,
    backgroundColor: "#fff",
  },
  paragraphText: {
    fontSize: 14,
    lineHeight: 21,
    color: "#333",
    marginBottom: 10,
    textAlign: 'justify',
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingVertical: 10,
  },
  infoRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  infoLabel: {
    fontSize: 14,
    color: "#555",
    fontWeight: "500",
    flex: 0.4,
    marginRight: 10,
  },
  infoValue: {
    fontSize: 14,
    color: "#333",
    textAlign: "right",
    flex: 0.6,
  },
  imageContainer: {
    marginTop: 10,
  },
  contentImage: {
    width: screenWidth - 30,
    height: 200,
    borderRadius: 8,
    marginBottom: 10,
    alignSelf: "center",
  },
  loadingText: {
    fontSize: 16,
    textAlign: "center",
    marginTop: 50,
    color: "#666",
  },
  errorText: {
    fontSize: 16,
    color: "red",
    textAlign: "center",
    marginTop: 20,
    paddingHorizontal: 15,
  },
});

export default DocumentScreen;
