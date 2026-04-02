const Record = require("../models/Record");

exports.addRecord = async (req, res) => {
    try {
        const { type, amount, description, date, business } = req.body;

        const record = new Record({
            user: req.user.id,
            type,
            amount,
            description,
            date,
            business
        });

        await record.save();

        res.json({
            success: true,
            message: "Data saved"
        });

    } catch (err) {
        console.log(err);
        res.json({
            success: false,
            message: "Server error"
        });
    }
};

exports.getRecords = async (req, res) => {
    try {
        const { business } = req.query;

        const records = await Record.find({
            user: req.user.id,
            business
        });

        res.json({
            success: true,
            records
        });

    } catch (err) {
        console.log(err);
        res.json({
            success: false
        });
    }
};