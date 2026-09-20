const {
    ollamaClient,
    OLLAMA_MODEL,
    OLLAMA_TIMEOUT_MS
} = require("../config/ollama");
const { findRelevantKnowledge } = require("./ragService");

const PENNY_SYSTEM_PROMPT = `
You are Penny, the Emotional Financial Therapist Mascot Companion inside PennyPal.
You are a warm, adorable penguin companion who acts as a safe, compassionate money therapist and mindset coach.

THERAPEUTIC PHILOSOPHY & PERSONALITY:
- Safe Space, Zero Shame: You NEVER judge, scold, or guilt-trip users for their spending. Money is emotional and overwhelming. You validate feelings first.
- Emotional Grounding: You remind users to take a slow, deep breath. You separate self-worth from bank account balances.
- Empathetic & Curious: When users overspend, you ask gentle questions: "Were you feeling exhausted, stressed, or celebrating when that happened?"
- Mascot Warmth: You speak like an encouraging, cozy friend who lives in their pocket. You use warm expressions, gentle reassurance, and occasional sweet penguin metaphors (e.g. waddling through ice storms together).
- Grounded in Reality: You gently use the user's real numbers from their financial context when provided, helping them see clarity instead of fear.
- Actionable & Gentle: You provide tiny, micro-actions (e.g. the 24-hour pause rule, putting a little cushion aside) rather than rigid, stressful financial rules.
- Brevity: Keep answers concise (2 to 4 comforting, impactful sentences). Only go longer if explicitly asked for a detailed breakdown.
`;

/**
 * Intelligent Emotional Financial Therapist Fallback Engine
 * Used when local Ollama is offline or unreachable so Penny NEVER fails to support the user.
 */
function generatePennyFallbackResponse(message, context = {}, relevantKnowledge = []) {
    const text = message.toLowerCase().trim();
    const {
        currentMonth = "this month",
        totalSpentThisMonth = 0,
        totalIncomeThisMonth = 0,
        netSavingsThisMonth = 0,
        topCategory = null,
        topCategories = [],
        foodSpent = 0,
        shoppingSpent = 0,
        recentTransactions = []
    } = context;

    // 1. GUILT & OVERSPENDING
    if (
        text.includes("guilt") ||
        text.includes("guilty") ||
        text.includes("overspent") ||
        text.includes("spent too much") ||
        text.includes("bad with money") ||
        text.includes("regret") ||
        text.includes("messed up") ||
        text.includes("wasted money")
    ) {
        if (totalSpentThisMonth > 0) {
            return `First, take a gentle, deep breath with me. 🐧 You are NOT bad with money—spending is often just how we soothe stress, exhaustion, or treat ourselves when life gets heavy. You've spent ₹${totalSpentThisMonth.toLocaleString("en-IN")} so far in ${currentMonth}, and that's okay. What matters is that you're here checking in right now. How were you feeling when you made that purchase?`;
        }
        return `Take a slow, comforting breath with me. 🐧 You are not defined by a single receipt or an impulse purchase. Overspending usually happens when we're tired, stressed, or trying to care for ourselves. Let's forgive the past slip, give yourself some grace, and look ahead together with a clean slate. How are you feeling right now?`;
    }

    // 2. ANXIETY, STRESS & OVERWHELM
    if (
        text.includes("anxious") ||
        text.includes("anxiety") ||
        text.includes("stress") ||
        text.includes("stressed") ||
        text.includes("scared") ||
        text.includes("fear") ||
        text.includes("overwhelmed") ||
        text.includes("panic") ||
        text.includes("nervous")
    ) {
        return `Pause for a second and unclench your jaw. Inhale calm, exhale the panic. 🌿 Money anxiety is so real, but you don't have to carry it alone anymore. In ${currentMonth}, you have ${recentTransactions.length > 0 ? "awareness of your habits" : "started tracking"}, and awareness is 80% of peace of mind. We can take this one small waddle at a time. What part feels most overwhelming to you right now?`;
    }

    // 3. IMPULSE BUYING & AFFORDABILITY
    if (
        text.includes("impulse") ||
        text.includes("should i buy") ||
        text.includes("can i afford") ||
        text.includes("want to buy") ||
        text.includes("buy this")
    ) {
        // Check if there's a specific amount mentioned
        const amountMatch = text.match(/(?:₹|rs\.?|inr)?\s*(\d+(?:,\d+)*(?:\.\d+)?)/i);
        const askedAmount = amountMatch ? Number(amountMatch[1].replace(/,/g, "")) : null;

        if (askedAmount && netSavingsThisMonth > 0) {
            if (askedAmount <= netSavingsThisMonth) {
                return `Looking at your numbers, you have a positive net cushion of ₹${netSavingsThisMonth.toLocaleString("en-IN")} in ${currentMonth}! You technically can afford this ₹${askedAmount.toLocaleString("en-IN")} purchase. But here's my therapist check-in: try the '24-hour pause rule'. Wait until tomorrow morning—if you still genuinely love it, treat yourself guilt-free!`;
            } else {
                return `I love that you're asking me before swiping! Right now, your net savings for ${currentMonth} sit at ₹${netSavingsThisMonth.toLocaleString("en-IN")}, so spending ₹${askedAmount.toLocaleString("en-IN")} might leave you feeling pinched and anxious next week. How about putting it on a 48-hour wishlist so you can buy it with complete peace of mind later?`;
            }
        }

        return `Before you tap 'Place Order', let's do a 60-second mindfulness check! 🛒 Are you buying this because it will truly bring you lasting joy, or because today was stressful and you're seeking a quick dopamine boost? If it's the second, treat yourself to a hot shower or tea first. If you still want it tomorrow, we'll budget for it!`;
    }

    // 4. FOOD & DINING SPENDING
    if (text.includes("food") || text.includes("swiggy") || text.includes("zomato") || text.includes("dining") || text.includes("eating out")) {
        if (foodSpent > 0) {
            return `You've spent ₹${foodSpent.toLocaleString("en-IN")} on Food in ${currentMonth}. Food is our biggest comfort companion when we're busy or drained, so please don't shame yourself for it! If you'd like to feel a bit more in control, try swapping just one food order this week for a home-cooked meal. Small waddles add up!`;
        }
        return `You haven't recorded any dining out or food delivery expenses in ${currentMonth} yet! If you do treat yourself, remember to enjoy every bite without guilt—balance is all about intentional joy.`;
    }

    // 5. SHOPPING SPENDING
    if (text.includes("shopping") || text.includes("amazon") || text.includes("clothes")) {
        if (shoppingSpent > 0) {
            return `Your shopping expenses total ₹${shoppingSpent.toLocaleString("en-IN")} for ${currentMonth}. It's completely natural to want nice things and tools that make life fun. Just remember: shopping is meant to serve your happiness, not drain your calm. How do you feel about the things you bought?`;
        }
        return `Your shopping tab is clean at ₹0 so far in ${currentMonth}! You're doing wonderful at keeping impulse purchases at bay.`;
    }

    // 6. TOTAL SPENDING & BREAKDOWN INQUIRY
    if (
        text.includes("how much did i spend") ||
        text.includes("total spend") ||
        text.includes("my spending") ||
        text.includes("breakdown") ||
        text.includes("how am i doing") ||
        text.includes("status") ||
        text.includes("summary")
    ) {
        if (totalSpentThisMonth > 0) {
            const topCatText = topCategory ? `with your highest spending in ${topCategory.category} (₹${topCategory.amount.toLocaleString("en-IN")})` : "";
            return `In ${currentMonth}, your total spending is ₹${totalSpentThisMonth.toLocaleString("en-IN")} ${topCatText}. You've recorded ${context.totalTransactions || 0} transactions. Looking at your numbers with curiosity instead of fear is a huge step toward financial calm! Which category would you like us to look into together?`;
        }
        return `You haven't recorded any expenses yet in ${currentMonth}! If you have a recent bank statement, head to the Upload page and we'll organize it together with zero judgment.`;
    }

    // 7. CALMING BUDGET TIPS
    if (text.includes("tip") || text.includes("advice") || text.includes("budget") || text.includes("habit") || text.includes("help me save")) {
        // If RAG has a relevant fact, weave it in warmly
        if (relevantKnowledge.length > 0 && relevantKnowledge[0].answer) {
            return `Here is a gentle nugget of wisdom: ${relevantKnowledge[0].answer} Remember, budgeting isn't about restriction or punishing yourself—it's just giving your money permission to bring you peace of mind!`;
        }
        return `Here is my favorite emotional budgeting tip: the 50/30/20 gentle framework! 50% for your essentials (rent, groceries), 30% for pure guilt-free fun (you deserve joy!), and 20% for future calm (savings). You don't have to be perfect—even saving 5% this month is a victory worth celebrating! 🎉`;
    }

    // 8. GENERAL GREETINGS & COMPANIONSHIP
    if (text.includes("hi") || text.includes("hello") || text.includes("hey") || text.includes("who are you") || text.includes("penny")) {
        return `Hey there! 🐧 I'm Penny, your emotional financial therapist and money buddy. I'm here to listen, celebrate your wins, soothe your money anxiety, and help you understand your spending with zero shame. Take a deep breath—how are you feeling about your money today?`;
    }

    // 9. DEFAULT COMFORTING THERAPIST RESPONSE
    return `I hear you, and I'm right here in your pocket cheering you on. 🐧 Money can feel like a heavy emotional puzzle, but we take it one day and one gentle decision at a time. Whether you want to talk about spending guilt, check your numbers, or just need a calm breath, I'm listening. What's on your mind?`;
}

async function generatePennyResponse(message, context = {}, history = []) {
    // 1. RAG Retrieval: Fetch matching stored knowledge from knowledge base
    let relevantKnowledge = [];
    try {
        relevantKnowledge = await findRelevantKnowledge(message);
    } catch (e) {
        relevantKnowledge = [];
    }

    let knowledgeContext = "";
    if (relevantKnowledge.length > 0) {
        knowledgeContext = `
RELEVANT KNOWLEDGE BASE (Retrieved Facts):
${relevantKnowledge
    .map(
        (k, i) =>
            `[Fact ${i + 1}] ${k.topic ? `Topic: ${k.topic} | ` : ""}Q: ${k.question}\nA: ${k.answer}`
    )
    .join("\n\n")}
`;
    }

    const financialContext =
        Object.keys(context).length > 0
            ? `
Here is the user's current live financial context from their local vault:

${JSON.stringify(context, null, 2)}

Use these exact numbers with warmth and emotional validation. Never shame the user.
`
            : `
No financial context has been provided yet.
`;

    // 2. Try Ollama LLM if available
    try {
        const chatMessages = [
            {
                role: "system",
                content:
                    PENNY_SYSTEM_PROMPT +
                    knowledgeContext +
                    financialContext
            }
        ];

        // Append recent conversation history
        if (Array.isArray(history) && history.length > 0) {
            history.slice(-6).forEach((h) => {
                if (h.role && h.content) {
                    chatMessages.push({ role: h.role, content: h.content });
                }
            });
        }

        chatMessages.push({
            role: "user",
            content: message
        });

        const response = await Promise.race([
            ollamaClient.chat({
                model: OLLAMA_MODEL,
                messages: chatMessages,
                options: {
                    temperature: 0.7
                }
            }),
            new Promise((_, reject) =>
                setTimeout(() => reject(new Error("Ollama timeout")), OLLAMA_TIMEOUT_MS || 120000)
            )
        ]);

        if (response && response.message && response.message.content) {
            return response.message.content;
        }
    } catch (err) {
        console.log("ℹ️ Ollama unavailable or timed out, activating Penny Emotional Therapist engine.");
    }

    // 3. Resilient Emotional Therapist Mascot Engine Fallback
    return generatePennyFallbackResponse(message, context, relevantKnowledge);
}

module.exports = {
    generatePennyResponse
};