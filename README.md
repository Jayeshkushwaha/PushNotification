# Create Push Notifications In React Native With Notifee.

## npx react-native@0.71.10 init PushNotification --version 0.71.10

### Step 1. Add Libraries

yarn add @notifee/react-native @react-native-firebase/app @react-native-firebase/messaging @react-native-async-storage/async-storage

### Step 2. Setup Firebase

Link - https://console.firebase.google.com/
Create a new project on Firebase Console.
Click on android icon fill out the form with your package name.
Download the google-services.json file and place it in the android/app directory.

### Step 3. android/build.gradle

```
dependencies {
    //...... other classpaths
    classpath('com.google.gms:google-services:4.3.8')  //..Add this line
}
```

### Step 4. android/app/build.gradle

```
apply plugin: 'com.google.gms.google-services
dependencies {
        ... other implementations
        implementation platform('com.google.firebase:firebase-bom:32.3.1') // Add this line
```

### Step 5. utils/pushnotification_helper.js

```
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
```

### Step 6. App.tsx

```
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import React, { useEffect, useState } from "react";
import notifee, { AndroidImportance, AndroidStyle } from "@notifee/react-native";
import {
  requestUserPermission,
  notificationListener,
} from "./utils/pushnotification_helper";
const NotificationPlayGround = () => {

  useEffect(() => {
    requestUserPermission();
    notificationListener();
  }, []);

  const [enteredValue, setEnteredValue] = useState("");
  async function onDisplayNotification() {
    const channelId = await notifee.createChannel({
      id: "default",
      name: "Default Channel",
    });
    await notifee.requestPermission();
    await notifee.displayNotification({
      id: "123",
      title: `<p style="color: white;"><b>New message</p></b></p>`,
      body: enteredValue,
      android: {
        importance: AndroidImportance.HIGH,
        channelId,
        color: "#6495ed",
        timestamp: Date.now() - 800, // 8 minutes ago
        showTimestamp: true,
        groupSummary: true,
        groupId: "123",
        largeIcon: "https://logos.flamingtext.com/City-Logos/Todo-Logo.png",
      },
    });
    // Grouping
    await notifee.displayNotification({
      title: `<p style="color: white;"><b>New message</b></p>`,
      body: enteredValue,
      android: {
        channelId,
        groupId: "123",
        color: "#6495ed",
        timestamp: Date.now() - 800, // 8 minutes ago
        showTimestamp: true,
        largeIcon: "https://logos.flamingtext.com/City-Logos/Todo-Logo.png",
        style: {
          type: AndroidStyle.BIGPICTURE,
          picture: "https://logos.flamingtext.com/City-Logos/Todo-Logo.png",
        },
      },
    });
  }
  return (
    <View style={styles.body}>
      <TextInput
        placeholder="Write something."
        style={styles.input}
        onChangeText={(value) => setEnteredValue(value)}
        value={enteredValue}
      />
      <TouchableOpacity style={styles.button} onPress={onDisplayNotification}>
        <Text style={styles.btn_text}>Create</Text>
      </TouchableOpacity>
    </View>
  );
};
export default NotificationPlayGround;
const styles = StyleSheet.create({
  body: {
    flex: 1,
    backgroundColor: "black",
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  input: {
    width: "100%",
    backgroundColor: "#323232",
    height: 150,
    textAlignVertical: "top",
    padding: 20,
  },
  button: {
    width: "100%",
    backgroundColor: "cornflowerblue",
    margin: 20,
    padding: 20,
  },
  btn_text: {
    color: "white",
    fontWeight: "bold",
    fontSize: 27,
    textAlign: "center",
  },
})
```

### Step 7. index.js

```
import messaging from "@react-native-firebase/messaging";
messaging().setBackgroundMessageHandler(async (remoteMessage) => {
  console.log("Message handled in the background", remoteMessage);
});
```

### Step 8. Link - https://fcm-tester.netlify.app/
Need server key from firebase console and fcm token from app console.
