const {
    parseBankStatement,
} = require("../services/statementParserService");

const {
    createImportBatch,
} = require("../services/importBatchService");
const {
    categorizeTransaction,
    analyzeFinancialBehavior
} = require("../services/categorizationLlmService");
const {
    calculateAnalytics
} = require("../services/analyticsService");

async function generateAnalytics(req, res, next) {
    try {
        const {
            transactions,
            currentMonth,
            previousMonth
        } = req.body;

        if (!Array.isArray(transactions)) {
            return res.status(400).json({
                success: false,
                message: "Transactions array is required."
            });
        }

        const analytics = calculateAnalytics(
            transactions,
            {
                currentMonth,
                previousMonth
            }
        );

        return res.status(200).json({
            success: true,
            message: "Analytics calculated successfully.",
            analytics
        });

    } catch (error) {
        console.error(
            "Analytics generation error:",
            error
        );

        next(error);
    }
}

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

async function categorizeTransactions(req, res, next) {
    try {
        const { transactions, userCorrections = {} } = req.body;

        if (!Array.isArray(transactions)) {
            return res.status(400).json({
                success: false,
                message: "transactions must be an array."
            });
        }

        if (transactions.length === 0) {
            return res.status(400).json({
                success: false,
                message: "At least one transaction is required."
            });
        }

        const categorizedTransactions = [];

        for (const transaction of transactions) {
            const result = await categorizeTransaction(transaction, userCorrections);

            categorizedTransactions.push({
                ...transaction,
                category: result.category,
                categoryConfidence: result.confidence,
                categoryReason: result.reason,
                categorySource: result.source,
                normalizedMerchant: result.normalizedMerchant || transaction.merchant,
                updatedAt: new Date().toISOString()
            });
        }

        return res.status(200).json({
            success: true,
            message: "Transactions categorized successfully.",
            transactions: categorizedTransactions
        });
    } catch (error) {
        next(error);
    }
}

async function generateInsights(req, res, next) {
    try {
        const analytics = req.body;

        if (!analytics || typeof analytics !== "object") {
            return res.status(400).json({
                success: false,
                message: "Analytics data is required."
            });
        }

        const insights = await analyzeFinancialBehavior(analytics);

        return res.status(200).json({
            success: true,
            message: "Financial insights generated successfully.",
            insights
        });

    } catch (error) {
        console.error("Insight generation error:", error);

        next(error);
    }
}

module.exports = {
    analyzeStatement,
    categorizeTransactions,
    generateAnalytics,
    generateInsights
};