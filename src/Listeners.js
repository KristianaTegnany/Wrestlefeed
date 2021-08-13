import AsyncStorage from '@react-native-community/async-storage';

import firebase from 'react-native-firebase';

function displayNotificationFromCustomData(message: RemoteMessage){
  if(message.data && message.data.title){
    const channel = new firebase.notifications.Android.Channel('test-channel', 'Test Channel', firebase.notifications.Android.Importance.Max)
      .setDescription('My apps test channel');
      firebase.notifications().android.createChannel(channel);
    let notification = new firebase.notifications.Notification();
      notification = notification
      .setTitle(message.data.title)
      .setBody(message.data.body)
      .setData(message.data)
      .setSound("bell.mp3")
      notification.android.setPriority(firebase.notifications.Android.Priority.High)
      notification.android.setChannelId("test-channel")
    firebase.notifications().displayNotification(notification);
  }
}

function showLocalNotification(notif) {
  
  const channel = new firebase.notifications.Android.Channel(
    "channel-1",
    "ANDROID_CHANNEL_NAME",
    firebase.notifications.Android.Importance.Max,
    ).setSound('default')
    .enableLights(true)
    .enableVibration(true)
    .setVibrationPattern([300]);
    firebase.notifications().android.createChannel(channel);
  
  let notification = new firebase.notifications.Notification();
  notification = notification.setNotificationId(new Date().valueOf().toString())
  .setTitle(notif._title)
  .setBody(notif._body)
  .setSound(channel._sound)
  .setData({
    data: notif._data
  });
  
  notification.android.setAutoCancel(true);
  notification.android.setColor("red")
  notification.android.setColorized(true)
  notification.android.setLights(0xff00ff00, 300, 100)
  notification.android.setPriority(firebase.notifications.Android.Priority.High)
  notification.android.setGroupAlertBehaviour(firebase.notifications.Android.GroupAlert.All)
  notification.android.setCategory(firebase.notifications.Android.Category.Alarm)
  notification.android.setSmallIcon("ic_launcher")
  notification.android.setVibrate([300, 400, 300])
  notification.android.setChannelId(channel._channelId)

  firebase.notifications().displayNotification(notification)
}

export async function registerHeadlessListener(message: RemoteMessage){
  await AsyncStorage.setItem('headless', new Date().toISOString());
  displayNotificationFromCustomData(message);
}

// these callback will be triggered only when app is foreground or background
export function registerAppListener(navigation){
  this.notificationListener = firebase.notifications().onNotification(notification => {
    showLocalNotification(notification);
  })
  this.notificationOpenedListener = firebase.notifications().onNotificationOpened((notificationOpen: NotificationOpen) => {
    const notif: Notification = notificationOpen.notification;
  });

  this.onTokenRefreshListener = firebase.messaging().onTokenRefresh(token => {

  });

  this.messageListener = firebase.messaging().onMessage((message: RemoteMessage) => {
    displayNotificationFromCustomData(message);
  });

}