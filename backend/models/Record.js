const mongoose = require("mongoose");

const recordSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    business: String,
    type: String, // income / expense
    amount: Number,
    category: String,
    note: String,
    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Record", recordSchema);