## Step 1 :-
npx react-native@X.XX.X init AwesomeProject --version X.XX.X
#npm
npm install --save @notifee/react-native
#Yarn
yarn add @notifee/react-native

## Step 2 :-
Main File:-App.js
import { StyleSheet, Text, TouchableOpacity, View, TextInput } from "react-native";
import React, { useState } from "react";
import notifee from "@notifee/react-native";
const NotificationPlayGround = () => {
  const [enteredValue, setEnteredValue] = useState("");
  const [notificationId, setNotificationId] = useState("");
  async function onDisplayNotification() {
    const channelId = await notifee.createChannel({
      id: "default",
      name: "Default Channel",
    });
    await notifee.requestPermission();
    const notiID = await notifee.displayNotification({
      id: "123",
      title: `<p style="color: white;"><b>New message</p></b></p>`,
      body: enteredValue,
      android: {
        channelId,
        color: "#6495ed",
        timestamp: Date.now() - 800, // 8 minutes ago
        showTimestamp: true,
        groupSummary: true,
        groupId: "123",
      },
    });
    setNotificationId(notiID); // from useState
    // Grouping
    await notifee.displayNotification({
      title: `<p style="color: white;"><b>New message</b></p>`,
      body: enteredValue,
      android: {
        channelId,
        color: "#6495ed",
        timestamp: Date.now() - 800, // 8 minutes ago
        showTimestamp: true,
        groupSummary: true,
        groupId: "123",
        largeIcon: "https://logos.flamingtext.com/City-Logos/Todo-Logo.png",
        style: {
        type: AndroidStyle.BIGPICTURE,
        picture: "https://logos.flamingtext.com/City-Logos/Todo-Logo.png",
        },
      },
    });
  }
  //  Clear notification
  const onClearNotification = async () => {
    await notifee.cancelNotification(notificationId);
  };
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
      <TouchableOpacity
        style={[styles.button, { backgroundColor: "red" }]}
        onPress={onClearNotification}
      >
        <Text style={styles.btn_text}>Cancel</Text>
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
    margin: 14,
    padding: 14,
  },
  btn_text: {
    color: "white",
    fontWeight: "bold",
    fontSize: 27,
    textAlign: "center",
  },
});

## Step 3 :-
#Using npm
npm install --save @react-native-firebase/app @react-native-firebase/messaging
#Using Yarn
yarn add @react-native-firebase/app @react-native-firebase/messaging

## Step 4 :-
Next, you must visit the official Firebase website and navigate to the Firebase console to create a new project Link-https://console.firebase.google.com/. 
In my case, I named my project ‘PushNotification.’ After creating your project, simply click the notification bell icon to begin creating your notifications.
Next, you will see a section titled ‘Add Firebase to your Android app,’ a form field. 
Simply fill out the form. For the Android package name, navigate to the app/build.gradle file, and you will find your package name starting with ‘com.yourpackagename.’ 
Copy this name and paste it into the Android package name field.
After you’ve filled out the form, click ‘Next,’ and you’ll be prompted to download the configuration file named google-services.json. 
Paste this file into the app folder inside your Android folder. 
Once you’ve completed these steps, you must include the Google SDK in your project by following the steps below.

## Step 5 :-
Step 1: Navigate to the <project>/build.gradle file and include the following line of code inside the dependencies section.

dependencies {
    //...... other classpaths
    classpath('com.google.gms:google-services:4.3.8')  //..Add this line
}
Step 2: In your project folder, navigate to <app-module>/build.gradle, and add the following line of code at the top section of the build.gradle file:

apply plugin: 'com.google.gms.google-services
dependencies {
        ... other implementations
        implementation platform('com.google.firebase:firebase-bom:32.3.1') // Add this line

## Step 6 :-
To get started, create a folder named utils; within that folder, create a file named pushnotification_helper.js

import AsyncStorage from "@react-native-async-storage/async-storage";
import messaging from "@react-native-firebase/messaging";
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

Main File:-App.js
import { StyleSheet, Text, TouchableOpacity, View, TextInput } from "react-native";
import React, { useState, useEffect } from "react";
import notifee from "@notifee/react-native";
import {
  requestUserPermission,
  notificationListener,
} from "./utils/pushnotification_helper";
const NotificationPlayGround = () => {
  const [enteredValue, setEnteredValue] = useState("");
  const [notificationId, setNotificationId] = useState("");

  useEffect(() => {
    requestUserPermission();
    notificationListener();
  }, []);

  async function onDisplayNotification() {
    const channelId = await notifee.createChannel({
      id: "default",
      name: "Default Channel",
    });
    await notifee.requestPermission();
    const notiID = await notifee.displayNotification({
      id: "123",
      title: `<p style="color: white;"><b>New message</p></b></p>`,
      body: enteredValue,
      android: {
        channelId,
        color: "#6495ed",
        timestamp: Date.now() - 800, // 8 minutes ago
        showTimestamp: true,
        groupSummary: true,
        groupId: "123",
      },
    });
    setNotificationId(notiID); // from useState
    // Grouping
    await notifee.displayNotification({
      title: `<p style="color: white;"><b>New message</b></p>`,
      body: enteredValue,
      android: {
        channelId,
        color: "#6495ed",
        timestamp: Date.now() - 800, // 8 minutes ago
        showTimestamp: true,
        groupSummary: true,
        groupId: "123",
        largeIcon: "https://logos.flamingtext.com/City-Logos/Todo-Logo.png",
        style: {
        type: AndroidStyle.BIGPICTURE,
        picture: "https://logos.flamingtext.com/City-Logos/Todo-Logo.png",
        },
      },
    });
  }
  //  Clear notification
  const onClearNotification = async () => {
    await notifee.cancelNotification(notificationId);
  };
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
      <TouchableOpacity
        style={[styles.button, { backgroundColor: "red" }]}
        onPress={onClearNotification}
      >
        <Text style={styles.btn_text}>Cancel</Text>
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
    margin: 14,
    padding: 14,
  },
  btn_text: {
    color: "white",
    fontWeight: "bold",
    fontSize: 27,
    textAlign: "center",
  },
});

index.js :-
import messaging from "@react-native-firebase/messaging";
messaging().setBackgroundMessageHandler(async (remoteMessage) => {
  console.log("Message handled in the background", remoteMessage);
});

Use This to test
https://fcm-tester.netlify.app/
need server key from firebase console
need token from app console

# Create Push Notifications In React Native With Notifee.

### Step 1. android/app/src/main/AndroidManifest.xml

```
<intent-filter>
    <action android:name="android.intent.action.VIEW" />
    <category android:name="android.intent.category.DEFAULT" />
    <category android:name="android.intent.category.BROWSABLE" />
    <data android:scheme="demoapp" />
</intent-filter>
```

### Step 2. App.tsx

yarn add @react-navigation/native react-native-screens react-native-safe-area-context @react-navigation/native-stack @react-navigation/material-bottom-tabs react-native-paper react-native-vector-icons @react-native-masked-view/masked-view
```
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';
import HomeScreen from './screens/HomeScreen';
import ProfileScreen from './screens/ProfileScreen';
import FavScreen from './screens/FavScreen';
import Settings from './screens/Settings';
import { Image, StyleSheet, ActivityIndicator } from 'react-native';
//  import Icon from 'react-native-vector-icons/Ionicons'

const Tab = createMaterialBottomTabNavigator();

const Stack = createNativeStackNavigator();
const HomeStack = createNativeStackNavigator();
const FavStack = createNativeStackNavigator();
const ProfileStack = createNativeStackNavigator();
const SettingsStack = createNativeStackNavigator();

const linking = {
  prefixes: ['demoapp://'],
  config: {
    screens: {
      HomeScreen: 'homescreen',
      FavouriteScreen: 'favscreen',
      ProfileScreen: {
        screens: {
          Profile: {
            path: 'profilescreen/:user/',
          },
        },
      },
      SettingsScreen: 'settingsscreen',
    },
  },
};

const App = () => (
  <NavigationContainer linking={linking}>
    <Tab.Navigator
      initialRouteName="Home"
      activeColor="#fff"
      headerShown={true}
      screenOptions={{
        headerStyle: {
          backgroundColor: '#009387',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >

      <Tab.Screen
        name="HomeScreen"
        component={HomeStackScreen}
        options={{
          title: 'Home',
          tabBarLabel: 'Home',
          tabBarColor: '#009387',
          tabBarIcon: ({ color }) => (
            <Image style={styles.image} source={{
              uri: 'https://logos.flamingtext.com/City-Logos/Todo-Logo.png',
            }} />
          ),
        }}
      />
      <Tab.Screen
        name="FavouriteScreen"
        component={FavStackScreen}
        options={{
          tabBarLabel: 'Favourite',
          tabBarColor: '#009387',
          tabBarIcon: ({ color }) => (
            <Image style={styles.image} source={{
              uri: 'https://logos.flamingtext.com/City-Logos/Todo-Logo.png',
            }} />
          ),
        }}
      />
      <Tab.Screen
        name="ProfileScreen"
        component={ProfileStackScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarColor: '#009387',
          tabBarIcon: ({ color }) => (
            <Image style={styles.image} source={{
              uri: 'https://logos.flamingtext.com/City-Logos/Todo-Logo.png',
            }} />
          ),
        }}
      />
      <Tab.Screen
        name="SettingsScreen"
        component={SettingsStackScreen}
        options={{
          tabBarLabel: 'Settings',
          tabBarColor: '#009387',
          tabBarIcon: ({ color }) => (
            <Image style={styles.image} source={{
              uri: 'https://logos.flamingtext.com/City-Logos/Todo-Logo.png',
            }} />
          ),
        }}
      />
    </Tab.Navigator>
  </NavigationContainer>
);


const HomeStackScreen = () => (
  <Stack.Navigator screenOptions={{
    headerStyle: {
      backgroundColor: '#009387',
    },
    headerTintColor: '#fff',
    headerTitleStyle: {
      fontWeight: 'bold',
    },
  }}>
    <Stack.Screen name="Home" component={HomeScreen} />
  </Stack.Navigator>
);

const FavStackScreen = () => (
  <Stack.Navigator screenOptions={{
    headerStyle: {
      backgroundColor: '#009387',
    },
    headerTintColor: '#fff',
    headerTitleStyle: {
      fontWeight: 'bold',
    },
  }}>
    <Stack.Screen name="Favourite" component={FavScreen} />
  </Stack.Navigator>
);

const ProfileStackScreen = () => (
  <Stack.Navigator screenOptions={{
    headerStyle: {
      backgroundColor: '#009387',
    },
    headerTintColor: '#fff',
    headerTitleStyle: {
      fontWeight: 'bold',
    },
  }}>
    <Stack.Screen name="Profile" component={ProfileScreen} />
  </Stack.Navigator>
);

const SettingsStackScreen = () => (
  <Stack.Navigator screenOptions={{
    headerStyle: {
      backgroundColor: '#009387',
    },
    headerTintColor: '#fff',
    headerTitleStyle: {
      fontWeight: 'bold',
    },
  }}>
    <Stack.Screen name="Settings" component={Settings} />
  </Stack.Navigator>
);

export default App;

const styles = StyleSheet.create({
  image: {
    flex: 1,
    width: 30,
    height: 30,
    resizeMode: 'contain',
  },
});
```

### Step 3. screens/HomeScreen.js

```
import React from 'react'
import {View, Text, StyleSheet} from 'react-native'

const HomeScreen = () => {
    return(
        <View style={styles.container}>
            <Text style={styles.title}>Welcome to React Native {'\n'} Deep Linking Tutorial</Text>
              
        </View>
    );
};

export default HomeScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
    fontSize: 24,
    color: '#800000',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  textDescription: {
    fontSize: 14,
    fontWeight: 'bold',
  },
});
```

### Step 4. screens/FavScreen.js

```
import React from 'react'
import {View, Text, Button, StyleSheet, Linking} from 'react-native'

const FavScreen = () => {

    const url_settings = 'demoapp://profilescreen/Smith';
    return(
        <View style={styles.container}>
            <Text style={styles.title}>Favourite Screen</Text>
            <Button
            title="Click Here"
            onPress={() => Linking.openURL(url_settings)}
            />
        </View>
    );
};

export default FavScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },

    title: {
    fontSize: 24,
    color: '#800000',
    textAlign: 'center',
    fontWeight: 'bold',
  }, 
});
```

### Step 5. screens/ProfileScreen.js

```
import React from 'react'
import {View, Text, Button, StyleSheet} from 'react-native'

const ProfileScreen = ({route}) => {
    const {user} = route.params;

    return(
        <View style={styles.container}>
       <Text style={styles.title}>
        My name is {user}
       </Text>
        </View>
    );
};

export default ProfileScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
    fontSize: 24,
    color: '#800000',
    textAlign: 'center',
    fontWeight: 'bold',
  }, 
});
```

### Step 6. screens/Settings.js

```
import React from 'react'
import {View, Text, Button, StyleSheet, Linking} from 'react-native'

const Settings = () => {
        const url_fav = 'demoapp://favscreen';
    return(
        <View style={styles.container}>
            <Text style={styles.title}>Settings Screen</Text>
            <Button
            title="Click Here"
            onPress={() => Linking.openURL(url_fav)}
            />
        </View>
    );
};

export default Settings;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },

    title: {
    fontSize: 24,
    color: '#800000',
    textAlign: 'center',
    fontWeight: 'bold',
  }, 
});
```
