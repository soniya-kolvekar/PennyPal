const {
    ollamaClient,
    OLLAMA_MODEL
} = require("../config/ollama");


const GOAL_ADVICE_SYSTEM_PROMPT = `
You are Penny, the Emotional Financial Therapist Mascot Companion inside PennyPal.
You are a warm, adorable penguin companion who acts as a motivational financial coach for savings goals.

YOUR ROLE FOR THIS REQUEST:
- The user has a specific savings goal. You are providing personalized motivational coaching for that goal.
- Be warm, encouraging, and specific to their goal details.
- Reference their actual numbers (target amount, saved amount, remaining, progress percentage).
- Provide 2-3 actionable micro-tips tailored to their goal category.
- Keep your response concise (3-5 sentences max).
- Use Penny's warm penguin personality with gentle encouragement.
- NEVER shame or guilt-trip. Celebrate any progress, no matter how small.
- If they are close to their goal, amp up the excitement.
- If they are just starting, reassure them that every journey starts with one waddle.
`;


/**
 * Generate motivational financial coaching for a specific savings goal.
 * Uses Ollama when available, falls back to a template engine.
 *
 * @param {Object} goal - The goal data from the frontend
 * @param {string} goal.title - Goal title
 * @param {number} goal.targetAmount - Target savings amount
 * @param {number} [goal.savedAmount] - Amount already saved
 * @param {string} [goal.category] - Goal category
 * @param {string} [goal.targetDate] - Target date
 * @param {number} [goal.streak] - Current saving streak
 * @returns {Promise<string>} Motivational coaching text
 */
async function generateGoalAdvice(goal) {
    const targetAmount = Number(goal.targetAmount || 0);
    const savedAmount = Number(
        goal.savedAmount || goal.currentAmount || 0
    );
    const remaining = Math.max(0, targetAmount - savedAmount);
    const progressPercent =
        targetAmount > 0
            ? Math.round((savedAmount / targetAmount) * 100)
            : 0;

    const goalContext = `
Goal Details:
- Title: ${goal.title || "Savings Goal"}
- Category: ${goal.category || "General"}
- Target Amount: ₹${targetAmount.toLocaleString("en-IN")}
- Amount Saved: ₹${savedAmount.toLocaleString("en-IN")}
- Remaining: ₹${remaining.toLocaleString("en-IN")}
- Progress: ${progressPercent}%
- Target Date: ${goal.targetDate || "Not set"}
- Current Streak: ${goal.streak || 0} days
`;

    // 1. Try Ollama LLM
    try {
        const response = await Promise.race([
            ollamaClient.chat({
                model: OLLAMA_MODEL,
                messages: [
                    {
                        role: "system",
                        content:
                            GOAL_ADVICE_SYSTEM_PROMPT +
                            goalContext
                    },
                    {
                        role: "user",
                        content: `Give me motivational coaching for my "${goal.title}" savings goal.`
                    }
                ],
                options: {
                    temperature: 0.7
                }
            }),
            new Promise((_, reject) =>
                setTimeout(
                    () => reject(new Error("Ollama timeout")),
                    10000
                )
            )
        ]);

        if (
            response &&
            response.message &&
            response.message.content
        ) {
            return response.message.content;
        }
    } catch (err) {
        console.log(
            "ℹ️ Ollama unavailable for goal advice, using Penny fallback engine."
        );
    }

    // 2. Resilient Fallback Engine
    return generateFallbackAdvice(goal, {
        targetAmount,
        savedAmount,
        remaining,
        progressPercent
    });
}


/**
 * Template-based fallback when Ollama is unavailable.
 */
function generateFallbackAdvice(
    goal,
    { targetAmount, savedAmount, remaining, progressPercent }
) {
    const title = goal.title || "your goal";
    const category = (goal.category || "").toLowerCase();
    const streak = goal.streak || 0;

    // Completed
    if (progressPercent >= 100) {
        return `🎉 You did it! You've saved the full ₹${targetAmount.toLocaleString("en-IN")} for ${title}! Penny is doing a happy waddle dance! 🐧 This proves you have incredible discipline. Take a moment to celebrate — you earned it!`;
    }

    // Almost there (80%+)
    if (progressPercent >= 80) {
        return `You're SO close to your ${title} goal! 🐧✨ You've already saved ₹${savedAmount.toLocaleString("en-IN")} — that's ${progressPercent}% of the way there! Only ₹${remaining.toLocaleString("en-IN")} to go. Keep this momentum going — you're in the final stretch and Penny is cheering every step!`;
    }

    // Good progress (50-79%)
    if (progressPercent >= 50) {
        return `You're past the halfway mark on ${title}! 🐧 ₹${savedAmount.toLocaleString("en-IN")} saved out of ₹${targetAmount.toLocaleString("en-IN")} — that's real commitment. ${streak > 3 ? `Your ${streak}-day streak shows incredible consistency!` : "Try building a daily saving streak for extra momentum!"} You've got this — one waddle at a time!`;
    }

    // Early progress (10-49%)
    if (progressPercent >= 10) {
        let tip = "Try the 'round-up' trick — round every purchase up and save the difference!";
        if (category === "travel") {
            tip = "Skip one delivery meal a week and put it toward your travel fund!";
        } else if (category === "purchase") {
            tip = "Set aside a small fixed amount every morning — it adds up faster than you think!";
        } else if (category === "education") {
            tip = "Think of this as investing in yourself — future you will be so grateful!";
        }

        return `Great start on ${title}! 🐧 You've saved ₹${savedAmount.toLocaleString("en-IN")} so far (${progressPercent}%). ${tip} Every rupee saved is a step closer to your dream!`;
    }

    // Just started (< 10%)
    return `Welcome to your ${title} journey! 🐧 Every big goal starts with a single step — or in Penny's case, a single waddle! Your target of ₹${targetAmount.toLocaleString("en-IN")} is absolutely achievable. Start with a tiny daily deposit, even ₹50/day, and watch the magic of consistency. You've got a friend in Penny rooting for you!`;
}


module.exports = {
    generateGoalAdvice
};
