const {
    ollamaClient,
    OLLAMA_MODEL
} = require("../config/ollama");

/**
 * Send a prompt to the local Ollama model.
 */
async function askOllama({
    systemPrompt,
    userPrompt,
    json = false
}) {
    const response = await ollamaClient.chat({
        model: OLLAMA_MODEL,

        messages: [
            {
                role: "system",
                content: systemPrompt
            },
            {
                role: "user",
                content: userPrompt
            }
        ],

        ...(json ? { format: "json" } : {}),

        options: {
            temperature: 0.2
        }
    });

    return response.message.content;
}


/**
 * Categorize a financial transaction using Ollama.
 */
async function categorizeTransaction(transaction) {
    const categories = [
        "Food",
        "Shopping",
        "Transport",
        "Bills",
        "Subscriptions",
        "Entertainment",
        "Healthcare",
        "Education",
        "Rent",
        "Travel",
        "Personal",
        "Other"
    ];

    const systemPrompt = `
You are FinPal's transaction categorization assistant.

Your job is to classify financial transactions into exactly one
of the allowed categories.

Allowed categories:
${categories.join(", ")}

Rules:
- Choose exactly one category.
- Never create a new category.
- Use the merchant and transaction description.
- If the transaction is ambiguous, choose "Other".
- Do not invent information.
- Return valid JSON only.

Required JSON format:

{
  "category": "Food",
  "confidence": 0.95,
  "reason": "The merchant appears to be a food delivery service."
}
`;

    const userPrompt = `
Categorize this transaction:

Merchant:
${transaction.merchant || "Unknown"}

Original description:
${transaction.originalDescription || transaction.merchant || "Unknown"}

Amount:
${transaction.amount ?? "Unknown"}

Transaction type:
${transaction.type || "expense"}
`;

    const rawResponse = await askOllama({
        systemPrompt,
        userPrompt,
        json: true
    });

    let result;

    try {
        result = JSON.parse(rawResponse);
    } catch (error) {
        throw new Error("Ollama returned invalid JSON.");
    }

    if (!categories.includes(result.category)) {
        result.category = "Other";
    }

    let confidence = Number(result.confidence);

    if (!Number.isFinite(confidence)) {
        confidence = 0;
    }

    confidence = Math.max(0, Math.min(1, confidence));

    return {
        category: result.category,
        confidence,
        reason: result.reason || "",
        source: "llm"
    };
}

module.exports = {
    askOllama,
    categorizeTransaction
};