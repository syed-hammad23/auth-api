const db = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

// REGISTER
exports.register = (req, res) => {
  const { name, email, password } = req.body;

  const hashedPassword = bcrypt.hashSync(password, 10);

  const sql = "INSERT INTO users (name, email, password) VALUES (?, ?, ?)";

  db.query(sql, [name, email, hashedPassword], (err, result) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }

    res.json({ message: "User registered successfully" });
  });
};

// LOGIN
exports.login = (req, res) => {
  const { email, password } = req.body;

  const sql = "SELECT * FROM users WHERE email = ?";

  db.query(sql, [email], (err, result) => {
    if (err || result.length === 0) {
      return res.status(400).json({ message: "User not found" });
    }

    const user = result[0];

    const isMatch = bcrypt.compareSync(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  });
};


// FORGOT PASSWORD
exports.forgotPassword = (req, res) => {
  const { email } = req.body;

  const sql = "SELECT * FROM users WHERE email = ?";

  db.query(sql, [email], (err, result) => {
    if (err || result.length === 0) {
      return res.status(400).json({ message: "User not found" });
    }

    const user = result[0];

    // Generate token
    const resetToken = crypto.randomBytes(32).toString("hex");

    const expiry = Date.now() + 15 * 60 * 1000; // 15 mins

    const updateSql =
      "UPDATE users SET reset_token=?, reset_token_expiry=? WHERE id=?";

    db.query(updateSql, [resetToken, expiry, user.id], (err) => {
      if (err) {
        return res.status(500).json({ message: "Error saving token" });
      }

      // In real app → send email
      res.json({
        message: "Reset token generated",
        resetToken,
      });
    });
  });
};


// RESET PASSWORD
exports.resetPassword = (req, res) => {
  const { token, newPassword } = req.body;

  const sql =
    "SELECT * FROM users WHERE reset_token=? AND reset_token_expiry > ?";

  db.query(sql, [token, Date.now()], (err, result) => {
    if (err || result.length === 0) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    const user = result[0];

    const hashedPassword = bcrypt.hashSync(newPassword, 10);

    const updateSql =
      "UPDATE users SET password=?, reset_token=NULL, reset_token_expiry=NULL WHERE id=?";

    db.query(updateSql, [hashedPassword, user.id], (err) => {
      if (err) {
        return res.status(500).json({ message: "Password reset failed" });
      }

      res.json({ message: "Password reset successful" });
    });
  });
};