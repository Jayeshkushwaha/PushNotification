import AsyncStorage from "@react-native-async-storage/async-storage";
import messaging from "@react-native-firebase/messaging";
import notifee, { AndroidImportance, AndroidStyle } from "@notifee/react-native";

export async function requestUserPermission() {
  const authStatus = await messaging().requestPermission();
  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;
  if (enabled) {
    console.log("Authorization status:", authStatus);
    getFcmToken();
  }
}
const getFcmToken = async () => {
  let fcmToken = await AsyncStorage.getItem("fcmToken");
  console.log("Old token", fcmToken);
  if (!fcmToken) {
    try {
      const fcmToken = await messaging().getToken();
      if (fcmToken) {
        console.log(fcmToken, "The new generated token");
        AsyncStorage.setItem("fcmToken", fcmToken);
      }
    } catch (error) {
      console.log(error, "Error raised in fcm token");
    }
  }
};
export const notificationListener = async () => {
  // Listen in background
  messaging().onNotificationOpenedApp((remoteMessage) => {
    console.log(
      "Notification caused app to open from background state:",
      remoteMessage.notification,
    );
  });
  //   Listen in forgorund
  messaging().onMessage(async (remoteMessage) => {
    console.log("Received on foreground", remoteMessage);
    const channelId = await notifee.createChannel({
      id: "default",
      name: "Default Channel",
    });
    await notifee.displayNotification({
      title: remoteMessage.notification.title,
      body: remoteMessage.notification.body,
      android: {
        channelId,
        importance: AndroidImportance.HIGH,
        groupId: "123",
        color: "#6495ed",
        timestamp: Date.now() - 800, // 8 minutes ago
        showTimestamp: true,
        largeIcon: remoteMessage.notification.android.imageUrl,
        style: {
          type: AndroidStyle.BIGPICTURE,
          picture: remoteMessage.notification.android.imageUrl,
        },
      },
    });
  });
  messaging()
    .getInitialNotification()
    .then((remoteMessage) => {
      if (remoteMessage) {
        console.log(
          "Notification caused app to open from quit state:",
          remoteMessage.notification,
        );
      }
    });
};
