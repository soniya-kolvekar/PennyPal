const crypto = require("crypto");

function createImportBatch(fileName, transactions) {
    const now = new Date().toISOString();

    const batchId = crypto.randomUUID();

    const updatedTransactions = transactions.map((transaction) => ({
        ...transaction,
        importBatchId: batchId,
        status: "pending_review",
        updatedAt: now,
    }));

    return {
        id: batchId,

        fileName: fileName || "Unknown statement",

        status: "pending_review",

        createdAt: now,

        updatedAt: now,

        transactionCount: updatedTransactions.length,

        transactions: updatedTransactions,
    };
}

module.exports = {
    createImportBatch,
};