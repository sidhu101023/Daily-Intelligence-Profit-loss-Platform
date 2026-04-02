const express = require("express");
const cors = require("cors");
const path = require("path");

require("dotenv").config({
    path: path.resolve(__dirname, "../.env")
});

const connectDB = require("./config/db");
const chatRoutes = require("./routes/chatRoutes");
const app = express();

// ======================
// MIDDLEWARE
// ======================
app.use(cors());
app.use(express.json());

// ======================
// DATABASE
// ======================
connectDB();

// ======================
// ROUTES (API)
// ======================
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/records", require("./routes/recordRoutes"));
app.use("/api/chat", chatRoutes);
// ======================
// SERVE FRONTEND (VERY IMPORTANT)
// ======================
app.use(express.static(path.join(__dirname, "../frontend")));

// Default route
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/dashboard.html"));
});

// ======================
// START SERVER
// ======================
const PORT = 5000;

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});