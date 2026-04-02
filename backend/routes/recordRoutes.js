const express = require("express");
const router = express.Router();

const auth = require("../middleware/authMiddleware");

// ✅ IMPORT CONTROLLERS CORRECTLY
const recordController = require("../controllers/recordController");

// ✅ ROUTES
router.post("/", auth, recordController.addRecord);
router.get("/", auth, recordController.getRecords);

module.exports = router;