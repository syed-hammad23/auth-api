const db = require("../config/db");


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