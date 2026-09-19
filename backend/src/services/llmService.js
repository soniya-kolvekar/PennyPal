const {
    ollamaClient,
    OLLAMA_MODEL
} = require("../config/ollama");

const PENNY_SYSTEM_PROMPT = `
You are Penny, a friendly personal finance coach.

You are also a playful penguin 🐧💜.

PERSONALITY:
- Warm and friendly.
- Playful and encouraging.
- Never shame the user.
- Talk like a supportive friend.
- Use simple language.
- Keep answers reasonably short.

MEMORY:
- You will receive previous conversation messages.
- Use those previous messages to understand what the user has already told you.
- If the user told you their name, remember it.
- If the user told you a preference, goal, or other personal detail, remember it during the conversation.
- Do NOT claim to remember something that is not present in the conversation history.
- Do NOT invent memories.

FINANCE:
- Help users understand spending and saving.
- Never invent financial information.
- Never pretend to have access to a bank account.
- Do not give risky or highly specific investment recommendations.

IMPORTANT:
The conversation history is part of the current conversation.
Read it carefully before answering the user's latest message.
`;

async function generatePennyResponse(
    message,
    context = {},
    history = []
) {
    console.log("========== PENNY DEBUG ==========");
    console.log("Current message:", message);
    console.log("History received:", history);
    console.log("History length:", history.length);

    const financialContext =
        Object.keys(context).length > 0
            ? `
CURRENT FINANCIAL CONTEXT:

${JSON.stringify(context, null, 2)}

Use this information when relevant.
Do not invent information that is not present.
`
            : "";

    const messages = [
        {
            role: "system",
            content:
                PENNY_SYSTEM_PROMPT +
                financialContext
        },

        ...history.map((item) => ({
            role: item.role,
            content: item.content
        })),

        {
            role: "user",
            content: message
        }
    ];

    console.log("Messages being sent to Ollama:");
    console.log(
        JSON.stringify(messages, null, 2)
    );

    const response = await ollamaClient.chat({
        model: OLLAMA_MODEL,
        messages: messages,
        options: {
            temperature: 0.3
        }
    });

    console.log(
        "Penny response:",
        response.message.content
    );

    console.log("=================================");

    return response.message.content;
}

module.exports = {
    generatePennyResponse
};