const { generatePennyResponse } = require("../services/llmService");

async function chat(req, res, next) {
    try {
        const { message, context } = req.body;
        if (!message || typeof message !== "string") {
            return res.status(400).json({ success: false, error: "Message is required." });
        }

        const response = await generatePennyResponse(message, context || {});
        res.json({ success: true, response });
    } catch (error) {
        console.error("Penny chatbot error:", error);
        next(error);
    }
}

module.exports = { chat };
