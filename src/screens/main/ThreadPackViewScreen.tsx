// src/screens/main/ThreadPackViewScreen.tsx

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { RouteProp, NavigationProp } from "@react-navigation/native";
import { RootStackParamList } from "@navigation/AppNavigation";
import { LinearGradient } from "expo-linear-gradient";
import { ThreadPack, ThreadSpark } from "@type/thread.types";
import Card from "@components/common/Card";
import Button from "@components/common/Button";
import LoadingSpinner from "@components/common/LoadingSpinner";
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from "@constants/colors";
import sparkGenerator from "@services/spark-engine/sparkGenerator";
import { useSettingsStore } from "@stores/settingsStore";

type ThreadPackViewScreenRouteProp = RouteProp<RootStackParamList, 'ThreadPackView'>;

type ThreadPackViewScreenProps = {
  route: ThreadPackViewScreenRouteProp;
  navigation: NavigationProp<RootStackParamList>;
};

export const ThreadPackViewScreen: React.FC<ThreadPackViewScreenProps> = ({
  route,
  navigation,
}) => {
  const { clusterId } = route.params;
  const { settings } = useSettingsStore();
  const [threadPack, setThreadPack] = useState<ThreadPack | null>(null);
  const [isGenerating, setIsGenerating] = useState(true);
  const [savedSparks, setSavedSparks] = useState<Set<string>>(new Set());

  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    generatePack();
  }, []);

  const generatePack = async () => {
    setIsGenerating(true);
    try {
      const pack = await sparkGenerator.generateThreadPack(
        clusterId,
        settings.chaosLevel
      );
      setThreadPack(pack);

      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }).start();
    } catch (error: any) {
      Alert.alert("Error", error.message);
      navigation.goBack();
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddToThread = async (spark: ThreadSpark) => {
    if (!threadPack) return;

    try {
      await sparkGenerator.saveThreadSparkFromPack(
        spark,
        threadPack.id,
        threadPack.clusterId
      );

      setSavedSparks((prev) => new Set([...prev, spark.id]));

      Alert.alert(
        "Added to Thread",
        "This spark has been saved to your thread."
      );
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  };

  const handleExploreSpark = (spark: ThreadSpark) => {
    Alert.alert(
      "Explore Spark",
      "Would you like to create a Deep Dive based on this spark?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Deep Dive",
          onPress: () => {
            navigation.navigate("DeepDive", { sparkText: spark.text });
          },
        },
      ]
    );
  };

  const handleRegenerate = () => {
    Alert.alert(
      "Regenerate Pack",
      "Generate a new set of 4 sparks for this cluster?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Regenerate", onPress: generatePack },
      ]
    );
  };

  if (isGenerating) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <LoadingSpinner
            variant="gradient"
            size="large"
            message="Generating Thread Pack..."
          />
        </View>
      </SafeAreaView>
    );
  }

  if (!threadPack) return null;

  const renderSparkCard = (
    spark: ThreadSpark,
    index: number,
    isLast: boolean
  ) => {
    const isSaved = savedSparks.has(spark.id);

    let typeColor = COLORS.primary.main;
    let typeLabel = "Continuation";
    let typeIcon = "→";

    if (spark.type === "derived") {
      typeColor = COLORS.accent.purple;
      typeLabel = "Alternative Path";
      typeIcon = "↗";
    } else if (spark.type === "wildcard") {
      typeColor = COLORS.accent.orange;
      typeLabel = "Wildcard";
      typeIcon = "✦";
    }

    return (
      <View key={spark.id} style={styles.sparkContainer}>
        <View style={styles.timeline}>
          <View style={[styles.timelineDot, { backgroundColor: typeColor }]} />
          {!isLast && <View style={styles.timelineLine} />}
        </View>

        <Animated.View
          style={[
            styles.sparkCardContainer,
            {
              opacity: fadeAnim,
              transform: [
                {
                  translateY: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [50, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <Card variant="elevated" style={styles.sparkCard}>
            <View style={styles.sparkHeader}>
              <View style={[styles.typeBadge, { backgroundColor: typeColor }]}>
                <Text style={styles.typeIcon}>{typeIcon}</Text>
                <Text style={styles.typeLabel}>{typeLabel}</Text>
              </View>
              {isSaved && (
                <View style={styles.savedBadge}>
                  <Text style={styles.savedText}>Saved</Text>
                </View>
              )}
            </View>

            <Text style={styles.sparkText}>{spark.text}</Text>

            <View style={styles.sparkActions}>
              {!isSaved && (
                <TouchableOpacity
                  style={[styles.actionButton, { borderColor: typeColor }]}
                  onPress={() => handleAddToThread(spark)}
                >
                  <Text style={[styles.actionButtonText, { color: typeColor }]}>
                    Add to Thread
                  </Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={[styles.actionButton, styles.actionButtonOutline]}
                onPress={() => handleExploreSpark(spark)}
              >
                <Text style={styles.actionButtonTextOutline}>Explore</Text>
              </TouchableOpacity>
            </View>
          </Card>
        </Animated.View>
      </View>
    );
  };

  const allSparks = [
    threadPack.continuationSpark,
    ...threadPack.derivedSparks,
    threadPack.wildcardSpark,
  ];

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={["#FFFFFF", "#F0F9FF"]} style={styles.gradient}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Thread Pack</Text>
          <TouchableOpacity
            onPress={handleRegenerate}
            style={styles.regenerateButton}
          >
            <Text style={styles.regenerateIcon}>🔄</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <Animated.View style={{ opacity: fadeAnim }}>
            <Card variant="gradient" style={styles.clusterCard}>
              <Text style={styles.clusterLabel}>Continuing</Text>
              <Text style={styles.clusterName}>{threadPack.clusterName}</Text>
            </Card>

            <Card variant="outlined" style={styles.infoCard}>
              <Text style={styles.infoText}>
                Explore 4 connected sparks that continue your intellectual
                journey. Add the ones that resonate to your thread.
              </Text>
            </Card>

            <View style={styles.packContainer}>
              {allSparks.map((spark, index) =>
                renderSparkCard(spark, index, index === allSparks.length - 1)
              )}
            </View>

            <View style={styles.bottomActions}>
              <Button
                title="Back to Cluster"
                onPress={() => navigation.goBack()}
                variant="outline"
                size="medium"
                fullWidth
                style={styles.bottomButton}
              />
            </View>
          </Animated.View>

          <View style={{ height: SPACING.xxxl }} />
        </ScrollView>
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.md,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  backIcon: {
    fontSize: 24,
    color: COLORS.neutral.black,
  },
  headerTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: "bold",
    color: COLORS.neutral.black,
  },
  regenerateButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  regenerateIcon: {
    fontSize: 20,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  clusterCard: {
    marginBottom: SPACING.md,
    padding: SPACING.lg,
  },
  clusterLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.neutral.white,
    opacity: 0.9,
    marginBottom: SPACING.xs,
  },
  clusterName: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: "bold",
    color: COLORS.neutral.white,
  },
  infoCard: {
    marginBottom: SPACING.xl,
    borderColor: COLORS.primary.main,
    borderWidth: 2,
  },
  infoText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.neutral.gray700,
    lineHeight: FONT_SIZES.sm * 1.4,
  },
  packContainer: {
    marginBottom: SPACING.xl,
  },
  sparkContainer: {
    flexDirection: "row",
    marginBottom: SPACING.lg,
  },
  timeline: {
    width: 40,
    alignItems: "center",
    paddingTop: SPACING.lg,
  },
  timelineDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: COLORS.neutral.gray300,
    marginTop: SPACING.sm,
  },
  sparkCardContainer: {
    flex: 1,
  },
  sparkCard: {
    padding: SPACING.lg,
  },
  sparkHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.md,
  },
  typeBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
  },
  typeIcon: {
    fontSize: FONT_SIZES.md,
    marginRight: SPACING.xs,
    color: COLORS.neutral.white,
  },
  typeLabel: {
    fontSize: FONT_SIZES.xs,
    fontWeight: "700",
    color: COLORS.neutral.white,
  },
  savedBadge: {
    backgroundColor: COLORS.success.light,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs / 2,
    borderRadius: BORDER_RADIUS.sm,
  },
  savedText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: "700",
    color: COLORS.neutral.white,
  },
  sparkText: {
    fontSize: FONT_SIZES.md,
    lineHeight: FONT_SIZES.md * 1.5,
    color: COLORS.neutral.gray800,
    marginBottom: SPACING.lg,
  },
  sparkActions: {
    flexDirection: "row",
    gap: SPACING.sm,
  },
  actionButton: {
    flex: 1,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 2,
    alignItems: "center",
  },
  actionButtonOutline: {
    borderColor: COLORS.neutral.gray300,
  },
  actionButtonText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: "600",
  },
  actionButtonTextOutline: {
    fontSize: FONT_SIZES.sm,
    fontWeight: "600",
    color: COLORS.neutral.gray700,
  },
  bottomActions: {
    marginTop: SPACING.lg,
  },
  bottomButton: {
    marginBottom: SPACING.sm,
  },
});

export default ThreadPackViewScreen;
