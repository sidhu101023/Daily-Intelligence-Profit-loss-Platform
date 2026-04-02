const express = require("express");
const router = express.Router();   // ✅ must be here

const auth = require("../middleware/authMiddleware");

const {
    register,
    login,
    saveProfile,
    getProfile
} = require("../controllers/authController");

// Auth
router.post("/register", register);
router.post("/login", login);

// Profile
router.post("/profile", auth, saveProfile);
router.get("/profile", auth, getProfile);

module.exports = router;