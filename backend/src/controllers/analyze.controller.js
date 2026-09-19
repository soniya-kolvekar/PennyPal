const {
    parseBankStatement,
} = require("../services/statementParserService");

async function analyzeStatement(req, res, next) {
    try {
        const { text, fileName } = req.body;

        if (!text || typeof text !== "string") {
            return res.status(400).json({
                success: false,
                message: "Extracted statement text is required.",
            });
        }

        if (text.length > 5_000_000) {
            return res.status(400).json({
                success: false,
                message: "Statement text is too large.",
            });
        }

        const transactions = parseBankStatement(text);

        return res.json({
            success: true,

            fileName: fileName || null,

            count: transactions.length,

            transactions,
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    analyzeStatement,
};
