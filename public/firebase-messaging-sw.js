// Firebase Cloud Messaging Service Worker — LifeOS
importScripts("https://www.gstatic.com/firebasejs/11.6.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/11.6.1/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyA3Fs3P-gR-ofK1nB03j8nM6f8RSopeBkw",
  authDomain: "neroworkspace-3ecf6.firebaseapp.com",
  projectId: "neroworkspace-3ecf6",
  storageBucket: "neroworkspace-3ecf6.firebasestorage.app",
  messagingSenderId: "108666922161",
  appId: "1:108666922161:web:840f06a6dcf5b3521f2e90",
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
