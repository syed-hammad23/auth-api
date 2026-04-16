const db = require("../config/db");
const { sendPushNotification } = require("../services/notificationService");

exports.findNearbyUsers = (req, res) => {
  const userId = req.user.id;
  const { latitude, longitude } = req.query;

  const radius = 100; // 100 meters = 0.1 km

  const sql = `
    SELECT id, name, email, image, latitude, longitude,
    (6371 * ACOS(
      COS(RADIANS(?)) * COS(RADIANS(latitude)) *
      COS(RADIANS(longitude) - RADIANS(?)) +
      SIN(RADIANS(?)) * SIN(RADIANS(latitude))
    )) AS distance
    FROM users
    WHERE id != ?
    HAVING distance < ?
    ORDER BY distance ASC
  `;

  db.query(
    sql,
    [latitude, longitude, latitude, userId, radius],
    (err, result) => {
      if (err) return res.status(500).json({ message: "Error fetching users" });

      res.json({
        count: result.length,
        users: result,
      });
    }
  );
};



exports.sendFriendRequest = (req, res) => {
  const senderId = req.user.id;
  const { receiverId } = req.body;

  // Prevent sending to yourself
  if (senderId == receiverId) {
    return res.status(400).json({ message: "Cannot send request to yourself" });
  }

  // Check if already exists
  const checkSql = `
    SELECT * FROM friend_requests 
    WHERE sender_id=? AND receiver_id=? AND status='pending'
  `;

  db.query(checkSql, [senderId, receiverId], (err, result) => {
    if (result.length > 0) {
      return res.status(400).json({ message: "Request already sent" });
    }

    const insertSql =
      "INSERT INTO friend_requests (sender_id, receiver_id) VALUES (?, ?)";

    db.query(insertSql, [senderId, receiverId], (err) => {
      if (err) return res.status(500).json({ message: "Error sending request" });

      // 🔔 Send notification
      sendPushNotification(receiverId, "New Friend Request");

      res.json({ message: "Friend request sent" });
    });
  });
};




exports.respondRequest = (req, res) => {
  const { requestId, status } = req.body;

  const sql = `
    UPDATE friend_requests 
    SET status=? 
    WHERE id=?
  `;

  db.query(sql, [status, requestId], (err) => {
    if (err) return res.status(500).json({ message: "Error updating request" });

    res.json({ message: `Request ${status}` });
  });
};