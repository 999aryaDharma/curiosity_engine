// src/components/tags/TagReplacementModal.tsx

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Modal,
  Animated,
  Dimensions,
} from "react-native";
import { Tag } from "@type/tag.types";
import { useTagStore } from "@stores/tagStore";
import TagChip from "./TagChip";
import Button from "@components/common/Button";
import {
  COLORS,
  SPACING,
  FONT_SIZES,
  FONT_WEIGHTS,
  BORDER_RADIUS,
} from "@constants/colors";

const { height } = Dimensions.get("window");

interface TagReplacementModalProps {
  visible: boolean;
  currentTag: Tag | null;
  onClose: () => void;
  onReplace: (newTag: Tag) => void;
}

export const TagReplacementModal: React.FC<TagReplacementModalProps> = ({
  visible,
  currentTag,
  onClose,
  onReplace,
}) => {
  const { allTags, loadAllTags } = useTagStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [filteredTags, setFilteredTags] = useState<Tag[]>([]);
  const [selectedTag, setSelectedTag] = useState<Tag | null>(null);

  const slideAnim = React.useRef(new Animated.Value(height)).current;

  useEffect(() => {
    if (visible) {
      loadAllTags();
      Animated.spring(slideAnim, {
        toValue: 0,
        speed: 12,
        bounciness: 6,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: height,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  useEffect(() => {
    if (!allTags || !Array.isArray(allTags)) return;

    if (searchQuery.trim() === "") {
      setFilteredTags(allTags.filter((t) => t.id !== currentTag?.id));
    } else {
      const query = searchQuery.toLowerCase();
      const results = allTags.filter(
        (tag) =>
          tag.id !== currentTag?.id &&
          (tag.name.toLowerCase().includes(query) ||
            tag.cluster?.toLowerCase().includes(query))
      );
      setFilteredTags(results);
    }
  }, [searchQuery, allTags, currentTag]);

  const handleReplace = () => {
    if (selectedTag) {
      onReplace(selectedTag);
      handleClose();
    }
  };

  const handleClose = () => {
    setSearchQuery("");
    setSelectedTag(null);
    onClose();
  };

  // Group by cluster
  const groupedTags = filteredTags.reduce((acc, tag) => {
    const cluster = tag.cluster || "Other";
    if (!acc[cluster]) acc[cluster] = [];
    acc[cluster].push(tag);
    return acc;
  }, {} as Record<string, Tag[]>);

  return (
    <Modal visible={visible} transparent animationType="none">
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.container,
            {
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerHandle} />
            <View style={styles.headerContent}>
              <Text style={styles.headerTitle}>Replace Tag</Text>
              <TouchableOpacity
                onPress={handleClose}
                style={styles.closeButton}
              >
                <Text style={styles.closeIcon}>×</Text>
              </TouchableOpacity>
            </View>

            {currentTag && (
              <View style={styles.currentTagContainer}>
                <Text style={styles.currentTagLabel}>Current:</Text>
                <TagChip
                  label={currentTag.name}
                  selected
                  color="mint"
                  size="medium"
                />
              </View>
            )}
          </View>

          {/* Search */}
          <View style={styles.searchContainer}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Search tags..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {/* Tags List */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {Object.entries(groupedTags).map(([cluster, tags]) => (
              <View key={cluster} style={styles.clusterSection}>
                <Text style={styles.clusterName}>{cluster}</Text>
                <View style={styles.tagsGrid}>
                  {tags.map((tag) => (
                    <TouchableOpacity
                      key={tag.id}
                      onPress={() => setSelectedTag(tag)}
                      activeOpacity={0.7}
                    >
                      <TagChip
                        label={tag.name}
                        selected={selectedTag?.id === tag.id}
                        color={selectedTag?.id === tag.id ? "coral" : "mint"}
                        size="medium"
                        style={styles.tag}
                      />
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ))}

            {filteredTags.length === 0 && (
              <View style={styles.emptyState}>
                <Text style={styles.emptyEmoji}>🔍</Text>
                <Text style={styles.emptyText}>
                  {searchQuery ? "No tags found" : "Loading tags..."}
                </Text>
              </View>
            )}

            <View style={{ height: 100 }} />
          </ScrollView>

          {/* Action Button */}
          {selectedTag && (
            <View style={styles.actionContainer}>
              <Button
                title={`Replace with "${selectedTag.name}"`}
                onPress={handleReplace}
                variant="gradient"
                size="large"
                fullWidth
              />
            </View>
          )}
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  container: {
    backgroundColor: COLORS.neutral.white,
    borderTopLeftRadius: BORDER_RADIUS.xxxl,
    borderTopRightRadius: BORDER_RADIUS.xxxl,
    maxHeight: height * 0.85,
    paddingBottom: SPACING.xl,
  },
  header: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.base,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.neutral.gray200,
  },
  headerHandle: {
    width: 40,
    height: 4,
    backgroundColor: COLORS.neutral.gray300,
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: SPACING.md,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.md,
  },
  headerTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.neutral.black,
  },
  closeButton: {
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  closeIcon: {
    fontSize: 32,
    color: COLORS.neutral.gray500,
    lineHeight: 32,
  },
  currentTagContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  currentTagLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.neutral.gray600,
    marginRight: SPACING.sm,
    fontWeight: FONT_WEIGHTS.medium,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.neutral.gray50,
    borderRadius: BORDER_RADIUS.xl,
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.md,
    marginBottom: SPACING.base,
    paddingHorizontal: SPACING.base,
  },
  searchIcon: {
    fontSize: 20,
    marginRight: SPACING.sm,
  },
  searchInput: {
    flex: 1,
    height: 48,
    fontSize: FONT_SIZES.base,
    color: COLORS.neutral.black,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
  },
  clusterSection: {
    marginBottom: SPACING.xl,
  },
  clusterName: {
    fontSize: FONT_SIZES.base,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.neutral.gray700,
    marginBottom: SPACING.md,
  },
  tagsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -SPACING.xs,
  },
  tag: {
    margin: SPACING.xs,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: SPACING.huge,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: SPACING.md,
  },
  emptyText: {
    fontSize: FONT_SIZES.base,
    color: COLORS.neutral.gray600,
  },
  actionContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.neutral.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.neutral.gray200,
  },
});

export default TagReplacementModal;

// Export for easy import
// export { TagReplacementModal };
