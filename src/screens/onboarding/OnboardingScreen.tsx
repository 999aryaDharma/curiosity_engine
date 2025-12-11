// src/screens/onboarding/OnboardingScreen.tsx

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Animated,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useTagStore } from "@stores/tagStore";
import { Tag } from "@type/tag.types";
import TagChip from "@components/tags/TagChip";
import Button from "@components/common/Button";
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from "@constants/colors";

const { width } = Dimensions.get("window");

interface OnboardingScreenProps {
  navigation: any;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({
  navigation,
}) => {
  const {
    allTags,
    selectedTags: storeSelectedTags,
    selectTag,
    deselectTag,
    loadAllTags,
  } = useTagStore();
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(50)).current;

  useEffect(() => {
    loadAllTags();

    // Entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        speed: 12,
        bounciness: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleTagPress = (tagId: string) => {
    if (selectedTags.includes(tagId)) {
      setSelectedTags(selectedTags.filter((id) => id !== tagId));
      deselectTag(tagId);
    } else {
      if (selectedTags.length < 10) {
        setSelectedTags([...selectedTags, tagId]);
        selectTag(tagId);
      }
    }
  };

  const handleContinue = () => {
    if (selectedTags.length >= 5) {
      navigation.replace("Home");
    }
  };

  const groupedTags = allTags.reduce((acc, tag) => {
    const cluster = tag.cluster || "Other";
    if (!acc[cluster]) acc[cluster] = [];
    acc[cluster].push(tag);
    return acc;
  }, {} as Record<string, Tag[]>);

  const getClusterColor = (cluster: string): string => {
    const colors = COLORS.clusters as Record<string, string>;
    return colors[cluster.toLowerCase()] || COLORS.primary.main;
  };

  const progress = (selectedTags.length / 10) * 100;

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={["#FFFFFF", "#F0F9FF", "#FEF3F7"]}
        style={styles.gradient}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Header */}
          <Animated.View
            style={[
              styles.header,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <Text style={styles.emoji}>✨🧠💭</Text>
            <Text style={styles.title}>Welcome to{"\n"}Curiosity Engine</Text>
            <Text style={styles.subtitle}>
              Select at least 5 topics that spark your curiosity
            </Text>

            {/* Progress Bar */}
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <LinearGradient
                  colors={
                    COLORS.gradients.twilight as [string, string, ...string[]]
                  }
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.progressFill, { width: `${progress}%` }]}
                />
              </View>
              <Text style={styles.progressText}>
                {selectedTags.length}/10 selected
              </Text>
            </View>
          </Animated.View>

          {/* Tags by Cluster */}
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }}
          >
            {Object.entries(groupedTags).map(
              ([cluster, tags], clusterIndex) => (
                <View key={cluster} style={styles.clusterSection}>
                  {/* Cluster Header */}
                  <View style={styles.clusterHeader}>
                    <View
                      style={[
                        styles.clusterDot,
                        { backgroundColor: getClusterColor(cluster) },
                      ]}
                    />
                    <Text style={styles.clusterName}>{cluster}</Text>
                  </View>

                  {/* Tags */}
                  <View style={styles.tagsGrid}>
                    {tags.map((tag, tagIndex) => {
                      const isSelected = selectedTags.includes(tag.id);
                      const delay = clusterIndex * 50 + tagIndex * 30;

                      return (
                        <Animated.View
                          key={tag.id}
                          style={{
                            opacity: fadeAnim,
                            transform: [
                              {
                                translateY: fadeAnim.interpolate({
                                  inputRange: [0, 1],
                                  outputRange: [20, 0],
                                }),
                              },
                            ],
                          }}
                        >
                          <TagChip
                            label={tag.name}
                            selected={isSelected}
                            onPress={() => handleTagPress(tag.id)}
                            color={getClusterColor(cluster)}
                            variant={isSelected ? "gradient" : "outlined"}
                            size="medium"
                            style={styles.tag}
                          />
                        </Animated.View>
                      );
                    })}
                  </View>
                </View>
              )
            )}
          </Animated.View>

          {/* Bottom Spacing */}
          <View style={{ height: 100 }} />
        </ScrollView>

        {/* Floating Action Button */}
        <Animated.View
          style={[
            styles.floatingButton,
            {
              opacity: fadeAnim,
              transform: [
                {
                  translateY: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [100, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <Button
            title={
              selectedTags.length < 5
                ? `Select ${5 - selectedTags.length} more`
                : "Let's Start! 🚀"
            }
            onPress={handleContinue}
            variant="gradient"
            size="large"
            fullWidth
            disabled={selectedTags.length < 5}
          />
        </Animated.View>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.neutral.white,
  },
  gradient: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.xxxl,
  },
  header: {
    alignItems: "center",
    marginBottom: SPACING.xl,
  },
  emoji: {
    fontSize: 48,
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: "bold",
    color: COLORS.neutral.black,
    textAlign: "center",
    marginBottom: SPACING.sm,
    lineHeight: FONT_SIZES.xxxl * 1.2,
  },
  subtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.neutral.gray600,
    textAlign: "center",
    marginBottom: SPACING.lg,
    paddingHorizontal: SPACING.md,
  },
  progressContainer: {
    width: "100%",
    alignItems: "center",
  },
  progressBar: {
    width: "100%",
    height: 8,
    backgroundColor: COLORS.neutral.gray200,
    borderRadius: BORDER_RADIUS.full,
    overflow: "hidden",
    marginBottom: SPACING.sm,
  },
  progressFill: {
    height: "100%",
    borderRadius: BORDER_RADIUS.full,
  },
  progressText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: "600",
    color: COLORS.primary.main,
  },
  clusterSection: {
    marginBottom: SPACING.xl,
  },
  clusterHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.md,
  },
  clusterDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: SPACING.sm,
  },
  clusterName: {
    fontSize: FONT_SIZES.lg,
    fontWeight: "700",
    color: COLORS.neutral.black,
    textTransform: "capitalize",
  },
  tagsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -SPACING.xs,
  },
  tag: {
    margin: SPACING.xs,
  },
  floatingButton: {
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

export default OnboardingScreen;
