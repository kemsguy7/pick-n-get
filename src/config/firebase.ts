// import admin from 'firebase-admin';
// import dotenv from 'dotenv';
// dotenv.config();

// // Parse the service account key
// const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY!.replace(/\\n/g, '\n'));

// if (!admin.apps.length) {
//   admin.initializeApp({
//     credential: admin.credential.cert(serviceAccount),
//     databaseURL: process.env.FIREBASE_DATABASE_URL,
//   });
// }

// export const messaging: admin.messaging.Messaging = admin.messaging();
// export const database: admin.database.Database = admin.database();
