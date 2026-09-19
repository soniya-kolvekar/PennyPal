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

async function analyzeFinancialBehavior(analytics) {

    const systemPrompt = `
You are Penny, FinPal's personal finance coach.

Analyze the financial data provided by FinPal.

Your job is to identify:

1. The category where the user spends the most.
2. A category where the user may have an opportunity to save.
3. Why that category is worth reviewing.
4. Give friendly, practical advice.

Important rules:

- Do not invent numbers.
- Do not perform your own financial calculations.
- Use only the numbers provided.
- Do not shame the user.
- Do not assume that high spending automatically means bad spending.
- Consider spending changes and patterns when deciding where the user
  may have an opportunity to save.
- Return valid JSON only.

Return exactly this structure:

{
  "highestSpendingCategory": {
    "category": "Food",
    "amount": 6200,
    "reason": "..."
  },
  "savingOpportunity": {
    "category": "Food",
    "reason": "...",
    "potentialAction": "..."
  },
  "pennyAdvice": "..."
}
`;

    const userPrompt = `
Here is FinPal's calculated financial analysis:

${JSON.stringify(analytics, null, 2)}

Analyze this data and return the requested JSON.
`;

    const rawResponse = await askOllama({
        systemPrompt,
        userPrompt,
        json: true
    });

    let result;

    try {
        result = JSON.parse(rawResponse);
    } catch {
        throw new Error("Ollama returned invalid JSON.");
    }

    return result;
}


async function generateTemptationAlertMessage(category, analyticsSummary) {
    const systemPrompt = `
You are Penny, a highly sarcastic, slightly sassy, but ultimately caring personal finance coach.

Your user has just entered a geographic spending zone (e.g. a mall, a coffee shop) associated with the category: "${category}".

Your job is to generate a short, punchy push notification (1-2 sentences max) to warn them before they spend money.
Be sarcastic, witty, and reference their current financial standing if relevant.

Rules:
- Keep it under 2 sentences.
- Use emojis.
- Be funny and sarcastic but don't be genuinely mean.
- Only return the raw message text, no JSON, no quotes around the text.
`;

    const userPrompt = `
Category: ${category}
User's Financial Summary:
${JSON.stringify(analyticsSummary, null, 2)}

Generate the notification message.
`;

    try {
        const rawResponse = await askOllama({
            systemPrompt,
            userPrompt,
            json: false
        });
        return rawResponse.trim();
    } catch (error) {
        console.error("Temptation message generation failed, using fallback:", error);
        return `🐧 Oh look, a ${category} area. Your wallet would like a word before you do something we both regret.`;
    }
}

module.exports = {
    askOllama,
    categorizeTransaction,
    analyzeFinancialBehavior,
    generateTemptationAlertMessage
};