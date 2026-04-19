import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getMessaging, isSupported } from "firebase/messaging";
import { getAnalytics, isSupported as isAnalyticsSupported } from "firebase/analytics";

// Dedicated Firebase project: nerolifeos
const firebaseConfig = {
  apiKey: "AIzaSyDIcZTYPHQJ67DYagwGiZTcBUCOUy0W_3k",
  authDomain: "nerolifeos.firebaseapp.com",
  projectId: "nerolifeos",
  storageBucket: "nerolifeos.firebasestorage.app",
  messagingSenderId: "1087634157157",
  appId: "1:1087634157157:web:e878deef6c6108557c208c",
  measurementId: "G-W28G2C4TMS",
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);

// Analytics — browser-only, skip on SSR/static export
const analytics = async () => {
  const supported = await isAnalyticsSupported();
  return supported ? getAnalytics(app) : null;
};

// FCM — browser-only
const messaging = async () => {
  const supported = await isSupported();
  return supported ? getMessaging(app) : null;
};

export { app, db, analytics, messaging };
