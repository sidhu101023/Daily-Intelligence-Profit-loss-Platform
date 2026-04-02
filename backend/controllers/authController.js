const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Register
exports.register = async (req, res) => {
    try {
        const { email, password } = req.body;

        let user = await User.findOne({ email });

        if (user) {
            return res.json({
                success: false,
                message: "User already exists"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        user = new User({
            email,
            password: hashedPassword
        });

        await user.save();

        res.json({
            success: true,
            message: "User registered successfully"
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

// Login
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.json({
                success: false,
                message: "Invalid email"
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.json({
                success: false,
                message: "Invalid password"
            });
        }

        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET || "mysupersecretkey",
            { expiresIn: "7d" }
        );

        res.json({
            success: true,
            token: token
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

// SAVE PROFILE
exports.saveProfile = async (req, res) => {
    try {
        const { name, mobile, businesses } = req.body;

        const user = await User.findByIdAndUpdate(
            req.user.id,
            { name, mobile, businesses },
            { returnDocument: "after" }
        );

        res.json({
            success: true,
            user
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};


// GET PROFILE
exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        res.json({
            success: true,
            user
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};