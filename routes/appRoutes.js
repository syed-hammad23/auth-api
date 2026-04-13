const express = require("express");
const router = express.Router();

const { findNearbyUsers } = require("../controllers/appController");
const authMiddleware = require("../middleware/authMiddleware");


router.get("/nearby-users", authMiddleware, findNearbyUsers);

module.exports = router;