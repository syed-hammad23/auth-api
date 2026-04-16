const express = require("express");
const router = express.Router();

const { findNearbyUsers, sendFriendRequest, respondRequest } = require("../controllers/appController");
const authMiddleware = require("../middleware/authMiddleware");


router.get("/nearby-users", authMiddleware, findNearbyUsers);
router.post("/send-request", authMiddleware, sendFriendRequest);
router.post("/respond-request", authMiddleware, respondRequest);

module.exports = router;