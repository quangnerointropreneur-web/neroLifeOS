// Firebase Cloud Messaging Service Worker — LifeOS
importScripts("https://www.gstatic.com/firebasejs/11.6.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/11.6.1/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyDIcZTYPHQJ67DYagwGiZTcBUCOUy0W_3k",
  authDomain: "nerolifeos.firebaseapp.com",
  projectId: "nerolifeos",
  storageBucket: "nerolifeos.firebasestorage.app",
  messagingSenderId: "1087634157157",
  appId: "1:1087634157157:web:e878deef6c6108557c208c",
  measurementId: "G-W28G2C4TMS",
});


const messaging = firebase.messaging();

// Background message handler
messaging.onBackgroundMessage((payload) => {
  const { title, body, icon } = payload.notification ?? {};
  self.registration.showNotification(title ?? "LifeOS Alert", {
    body: body ?? "",
    icon: icon ?? "/icon-192.png",
    badge: "/icon-192.png",
    data: { url: payload.data?.url ?? "/" },
    vibrate: [200, 100, 200],
  });
});

// Notification click → open app
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url ?? "/";
  event.waitUntil(clients.openWindow(url));
});
