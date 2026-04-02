const axios = require("axios");
const Record = require("../models/Record");

exports.chatWithAI = async (req, res) => {
    try {
        const { message } = req.body;

        // ✅ GET USER DATA
        const records = await Record.find({ user: req.user.id });

        let totalIncome = 0;
        let totalExpense = 0;

        records.forEach(r => {
            if (r.type === "income") totalIncome += r.amount;
            else totalExpense += r.amount;
        });

        const profit = totalIncome - totalExpense;

        // ✅ AI PROMPT
        const prompt = `
You are a smart business analyst AI.

Business Data:
- Total Income: ₹${totalIncome}
- Total Expense: ₹${totalExpense}
- Profit: ₹${profit}

User Question:
${message}

Give short, clear and helpful advice.
`;

        // ✅ GEMINI API
        const response = await axios.post(
            `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
            {
                contents: [
                    {
                        parts: [{ text: prompt }]
                    }
                ]
            }
        );

        const reply =
            response.data.candidates?.[0]?.content?.parts?.[0]?.text
            || "No response";

        res.json({ reply });

    } catch (err) {
        console.error(err.response?.data || err.message);
        res.status(500).json({ message: "AI error" });
    }
};