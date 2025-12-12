// src/services/notification/notificationService.ts

import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { mmkvService } from "@services/storage/mmkvService";
import sparkGenerator from "@services/spark-engine/sparkGenerator";
import { getTodayString } from "@utils/dateUtils";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

class NotificationService {
  private NOTIFICATION_ID = "daily_spark_reminder";
  private LAST_CHECK_KEY = "last_notification_check";

  async initialize(): Promise<void> {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      console.log("[Notification] Permission not granted");
      return;
    }

    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "Daily Reminders",
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#8B5CF6",
      });
    }

    console.log("[Notification] Service initialized");
  }

  async scheduleSparkReminder(): Promise<void> {
    const settings = await mmkvService.getSettings();

    if (!settings?.notificationsEnabled) {
      console.log("[Notification] Notifications disabled in settings");
      return;
    }

    const hasGeneratedToday = await this.checkIfUserGeneratedSparksToday();

    if (hasGeneratedToday) {
      await this.cancelScheduledReminder();
      return;
    }

    const lastCheck = await mmkvService.getString(this.LAST_CHECK_KEY);
    const today = getTodayString();

    if (lastCheck === today) {
      return;
    }

    await this.scheduleNotificationIfNotExists(
      settings.dailyReminderTime || "09:00"
    );
    await mmkvService.setString(this.LAST_CHECK_KEY, today);
  }

  private async checkIfUserGeneratedSparksToday(): Promise<boolean> {
    try {
      const today = getTodayString();
      const recentSparks = await sparkGenerator.getRecentSparks(10);

      return recentSparks.some((spark) => {
        const sparkDate = new Date(spark.createdAt).toISOString().split("T")[0];
        return sparkDate === today;
      });
    } catch (error) {
      console.error("[Notification] Error checking sparks:", error);
      return false;
    }
  }

  private async scheduleNotificationIfNotExists(time: string): Promise<void> {
    const existingNotifications =
      await Notifications.getAllScheduledNotificationsAsync();
    const hasExisting = existingNotifications.some(
      (notif) => notif.identifier === this.NOTIFICATION_ID
    );

    if (hasExisting) {
      console.log("[Notification] Reminder already scheduled");
      return;
    }

    const [hours, minutes] = time.split(":").map(Number);
    const now = new Date();
    const scheduledTime = new Date();
    scheduledTime.setHours(hours, minutes, 0, 0);

    if (scheduledTime <= now) {
      scheduledTime.setDate(scheduledTime.getDate() + 1);
    }

    await Notifications.scheduleNotificationAsync({
      identifier: this.NOTIFICATION_ID,
      content: {
        title: "Time to Spark Your Curiosity",
        body: "You haven't generated any sparks today. Ready to explore?",
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
        data: { type: "daily_reminder" },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: hours,
        minute: minutes,
        repeats: true,
      },
    });

    console.log(
      "[Notification] Reminder scheduled for",
      scheduledTime.toISOString()
    );
  }

  async cancelScheduledReminder(): Promise<void> {
    await Notifications.cancelScheduledNotificationAsync(this.NOTIFICATION_ID);
    console.log("[Notification] Reminder cancelled");
  }

  async cancelAllNotifications(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
    console.log("[Notification] All notifications cancelled");
  }

  async getScheduledNotifications(): Promise<
    Notifications.NotificationRequest[]
  > {
    return await Notifications.getAllScheduledNotificationsAsync();
  }

  async sendTestNotification(): Promise<void> {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Test Notification",
        body: "Your notifications are working!",
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 2,
        repeats: false,
      },
    });
  }
}

export default new NotificationService();
