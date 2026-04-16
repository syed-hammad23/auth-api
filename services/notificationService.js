const admin = require("../config/firebase");
const db = require("../config/db");

const sendPushNotification = (userId, message) => {
  const sql = "SELECT device_token FROM users WHERE id=?";

  db.query(sql, [userId], async (err, result) => {
    if (err) {
      console.log("DB error:", err);
      return;
    }

    if (!result[0]?.device_token) return;

    const token = result[0].device_token;

    try {
      await admin.messaging().send({
        token,
        notification: {
          title: "Friend Request",
          body: message,
        },
      });

      console.log("Notification sent");
    } catch (error) {
      console.log("Push error:", error);
    }
  });
};

module.exports = { sendPushNotification };