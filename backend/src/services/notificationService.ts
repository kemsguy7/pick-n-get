// import { messaging } from "../config/firebase";

// export const sendNotification = async (
//   token: string,
//   title: string,
//   body: string,
//   data: Record<string, string> = {}
// ) => {
//   try {
//     const message = {
//       token,
//       notification: {
//         title,
//         body,
//       },
//       data, // optional custom payload (e.g., rideId, riderId, status)
//     };

//     const response = await messaging.send(message);
//     console.log("Notification sent:", response);
//     return response;
//   } catch (error) {
//     console.error("Error sending notification:", error);
//   }
// };
