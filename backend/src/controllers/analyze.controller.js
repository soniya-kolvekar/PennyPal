const {
    parseBankStatement,
} = require("../services/statementParserService");

const {
    createImportBatch,
} = require("../services/importBatchService");

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

        if (transactions.length === 0) {
            return res.status(422).json({
                success: false,
                message: "No transactions could be extracted.",
            });
        }

        const batch = createImportBatch(
            fileName,
            transactions
        );

        return res.status(200).json({
            success: true,

            message: "Statement analyzed successfully.",

            batch: {
                id: batch.id,
                fileName: batch.fileName,
                status: batch.status,
                createdAt: batch.createdAt,
                transactionCount: batch.transactionCount,
            },

            transactions: batch.transactions,
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    analyzeStatement,
};