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