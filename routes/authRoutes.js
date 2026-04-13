const express = require("express");
const router = express.Router();
const upload = require("../middleware/cloudinary");
const authMiddleware = require("../middleware/authMiddleware");
const {
    register,
    login,
    forgotPassword,
    resetPassword,
    updateProfile,
    getProfile,
} = require("../controllers/authController");

router.post("/register", register);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.put("/profile", authMiddleware, upload.single("image"), updateProfile);
router.get("/get-profile", authMiddleware, getProfile);
module.exports = router;