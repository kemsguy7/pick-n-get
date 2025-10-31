// import { initializeApp } from "firebase-admin";
// import { getMessaging, getToken, onMessage } from "firebase/messaging";
// import dotenv from "dotenv"
// dotenv.config()

// const firebaseConfig = {
//   apiKey: process.env.APIKEY,
//   authDomain: process.env.AUTHDOMAIN,
//   databaseURL: process.env.DATABASE_URL,
//   projectId: process.env.PROJECTID,
//   storageBucket: process.env.STORAGEBUCKET,
//   messagingSenderId: process.env.MESSAGINGSENDERID,
//   appId: process.env.APPID,
//   measurementId: process.env.MEASUREMENTID
// };

// const app = initializeApp(firebaseConfig);
// const messaging = getMessaging(app);

// export const requestPermission = async (): Promise<string | null> => {
//   console.log("Requesting notification permission...");
//   const permission = await Notification.requestPermission();

//   if (permission === "granted") {
//     console.log("Notification permission granted.");
//     try {
//       const token = await getToken(messaging, {
//         vapidKey: process.env.FIREBASE_VAPID_KEY, // web push certificate key
//       });
//       console.log("FCM Token:", token);
//       return token;
//     } catch (err) {
//       console.error("Error retrieving FCM token:", err);
//       return null;
//     }
//   } else {
//     console.log("Permission denied for notifications.");
//     return null;
//   }
// };


// export const listenForMessages = () => {
//   onMessage(messaging, (payload) => {
//     console.log("Message received in foreground:", payload);

//     new Notification(payload.notification?.title || "New message", {
//       body: payload.notification?.body,
//       icon: payload.notification?.icon,
//     });
//   });
// };