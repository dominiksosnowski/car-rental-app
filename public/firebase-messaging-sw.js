// firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/9.6.11/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.6.11/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyCMDPzjewTGpN4aQG8DYQE5DUV-BddU2-M",
  authDomain: "sosnowski-6d735.firebaseapp.com",
  projectId: "sosnowski-6d735",
  storageBucket: "sosnowski-6d735.appspot.com",
  messagingSenderId: "977425461760",
  appId: "1:977425461760:web:7379f9cc50360c1922dee5"
});

const messaging = firebase.messaging();

// Obsługa powiadomień w tle
messaging.onBackgroundMessage((payload) => {
  console.log("📨 Powiadomienie w tle:", payload);
  self.registration.showNotification(payload.notification.title, {
    body: payload.notification.body,
    icon: '/icon.png' // możesz podmienić na własną ikonę
  });
});
