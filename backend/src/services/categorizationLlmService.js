const {
    ollamaClient,
    OLLAMA_MODEL
} = require("../config/ollama");

const CANONICAL_CATEGORIES = [
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

/**
 * Normalizes raw merchant strings by stripping common banking prefixes,
 * UPI handles, numeric transaction sequences, and legal entity suffixes.
 */
function normalizeMerchant(rawText = "") {
    if (!rawText || typeof rawText !== "string") return "UNKNOWN";

    let clean = rawText.toUpperCase().trim();

    // 1. Remove common payment prefixes
    clean = clean.replace(/^(UPI|POS|NEFT|RTGS|IMPS|ACH|NACH|BIL|BILDESK|INB|MOB|ECOM|PAYTM|BBPS|CMS|TPRR)[\/\-_\s]+/gi, "");
    clean = clean.replace(/^(PAYMENT\s+TO|TRANSFER\s+TO|PURCHASE\s+AT|SENT\s+TO)[\/\-_\s]+/gi, "");

    // 2. Remove trailing UPI handles (e.g. @okhdfcbank, @okaxis, @paytm, @ybl)
    clean = clean.replace(/@[a-zA-Z0-9_\.\-]+/gi, "");

    // 3. Remove long transaction ID numbers and date/time stamps
    clean = clean.replace(/[\/\-_]\d{6,}[\/\-_]?/g, " ");
    clean = clean.replace(/\b\d{8,}\b/g, " ");

    // 4. Remove common corporate / merchant noise
    clean = clean.replace(/\b(PVT\s*LTD|PRIVATE\s*LIMITED|LTD|LLP|INC|CORP|ENTERPRISES|INDIA|PAYMENTS?|SERVICES?|SOLUTIONS?|STORE|RETAIL)\b/gi, "");

    // 5. Clean up special characters, punctuation, and multiple spaces
    clean = clean.replace(/[^\w\s]/g, " ");
    clean = clean.replace(/\s+/g, " ").trim();

    return clean || rawText.toUpperCase().trim() || "UNKNOWN";
}

/**
 * Deterministic keyword rules dictionary mapping known merchants and patterns
 * to the 12 canonical FinPal categories.
 */
const DETERMINISTIC_RULES = [
    // 1. FOOD & DINING
    {
        category: "Food",
        keywords: [
            "SWIGGY", "ZOMATO", "MCDONALD", "DOMINO", "KFC", "PIZZA HUT", "STARBUCKS",
            "CHAAYOS", "CHAI POINT", "BURGER KING", "SUBWAY", "BLINKIT", "INSTAMART",
            "ZEPTO", "BIGBASKET", "BB DAILY", "DMART", "D MART", "NATURES BASKET",
            "SPAR HYPERMARKET", "BAKERY", "RESTAURANT", "CAFE", "COFFEE", "DINING",
            "DHABA", "BISTRO", "KITCHEN", "EATERY", "EATS", "FOOD", "BARBEQUE NATION",
            "HALDIRAM", "BIKANERVALA", "BIRYANI", "SWEETS", "SUPERMARKET", "GROCERY",
            "GROCERIES", "ORGANIC", "MEAT", "FISH", "VEGETABLE", "FRUIT", "TUCK SHOP"
        ],
        reason: "Matched known food delivery, restaurant, or grocery merchant"
    },

    // 2. SHOPPING
    {
        category: "Shopping",
        keywords: [
            "AMAZON", "FLIPKART", "MYNTRA", "AJIO", "MEESHO", "NYKAA", "TATA CLIQ",
            "ZARA", "H&M", "H M", "UNIQLO", "MARKS AND SPENCER", "LIFESTYLE",
            "PANTALOONS", "WESTSIDE", "DECATHLON", "CROMA", "RELIANCE DIGITAL",
            "VIJAY SALES", "IKEA", "SHOPPING", "MALL", "BOUTIQUE", "JEWELLER",
            "TANISHQ", "MALABAR", "KALYAN", "LENSKART", "FOOTWEAR", "CLOTHING",
            "APPAREL", "SHOES", "FASHION", "ELECTRONICS", "GADGET"
        ],
        reason: "Matched known e-commerce, electronics, or retail shopping store"
    },

    // 3. TRANSPORT
    {
        category: "Transport",
        keywords: [
            "UBER", "OLA", "RAPIDO", "METRO", "DMRC", "BMRC", "MMRDA", "IRCTC",
            "RAILWAY", "PETROL", "DIESEL", "FUEL", "INDIAN OIL", "IOCL",
            "BHARAT PETROLEUM", "BPCL", "HINDUSTAN PETROLEUM", "HPCL", "SHELL",
            "FASTAG", "TOLL", "PARKING", "AUTO", "CAB", "TAXI", "BUS", "CHALO",
            "RED BUS", "REDBUS", "TRANSIT", "AIRPORT TAXI"
        ],
        reason: "Matched known ride-hailing, fuel, transit, or toll service"
    },

    // 4. BILLS & UTILITIES
    {
        category: "Bills",
        keywords: [
            "ELECTRICITY", "POWER", "BESCOM", "TNEB", "MSEB", "TATA POWER",
            "ADANI ELEC", "WATER BILL", "JAL BOARD", "GAS BILL", "IGL",
            "MAHANAGAR GAS", "INDANE", "HP GAS", "BHARAT GAS", "BROADBAND",
            "WIFI", "AIRTEL", "JIO", "VI PREPAID", "VI POSTPAID", "VODAFONE",
            "ACT FIBERNET", "HATHWAY", "TATA PLAY", "DISH TV", "DTH", "POSTPAID",
            "BILLDESK", "UTILITY", "MAINTENANCE CHARGE", "CREDIT CARD BILL",
            "CREDIT CARD PAYMENT"
        ],
        reason: "Matched known electricity, water, telecom, or utility provider"
    },

    // 5. SUBSCRIPTIONS
    {
        category: "Subscriptions",
        keywords: [
            "NETFLIX", "SPOTIFY", "AMAZON PRIME", "PRIME VIDEO", "DISNEY",
            "HOTSTAR", "YOUTUBE", "APPLE MUSIC", "APPLE.COM", "GOOGLE PLAY",
            "GOOGLE STORAGE", "ICLOUD", "CHATGPT", "OPENAI", "GITHUB", "ADOBE",
            "AUDIBLE", "PLAYSTATION PLUS", "XBOX GAME PASS", "MEDIUM", "SUBSTACK",
            "LINKEDIN PREMIUM", "NOTION", "SUBSCRIPTION"
        ],
        reason: "Matched recurring digital subscription or streaming service"
    },

    // 6. ENTERTAINMENT
    {
        category: "Entertainment",
        keywords: [
            "BOOKMYSHOW", "PVR", "INOX", "CINEPOLIS", "CINEMA", "THEATRE",
            "STEAM", "PLAYSTATION", "XBOX", "EPIC GAMES", "NINTENDO", "RIOT GAMES",
            "GAMING", "CONCERT", "AMUSEMENT", "BOWLING", "CLUB", "PUBS",
            "ENTERTAINMENT", "MOVIES"
        ],
        reason: "Matched cinema, gaming, or entertainment venue"
    },

    // 7. HEALTHCARE
    {
        category: "Healthcare",
        keywords: [
            "APOLLO", "NETMEDS", "PHARMEASY", "TATA 1MG", "1MG", "MEDPLUS",
            "PHARMACY", "CHEMIST", "HOSPITAL", "CLINIC", "DOCTOR", "DIAGNOSTIC",
            "PATHOLOGY", "DR LAL", "THYROCARE", "DENTAL", "DENTIST", "OPTICAL",
            "MEDANTA", "FORTIS", "MAX HEALTHCARE", "MANIPAL", "HEALTHCARE",
            "MEDICAL", "MEDICINE"
        ],
        reason: "Matched hospital, pharmacy, lab, or healthcare clinic"
    },

    // 8. EDUCATION
    {
        category: "Education",
        keywords: [
            "UDEMY", "COURSERA", "EDX", "SKILLSHARE", "SCHOOL", "COLLEGE",
            "UNIVERSITY", "ACADEMY", "CLASSES", "TUITION", "COACHING", "ALLEN",
            "BYJU", "UNACADEMY", "PHYSICS WALLAH", "BOOKSTORE", "STATIONERY",
            "EXAM FEE", "COURSE", "EDUCATION"
        ],
        reason: "Matched educational institution, course, or bookstore"
    },

    // 9. RENT
    {
        category: "Rent",
        keywords: [
            "RENT", "HOUSE RENT", "FLAT RENT", "LANDLORD", "NOBROKER", "HOUSING",
            "NESTAWAY", "PG FEE", "PG RENT", "HOSTEL FEE", "SOCIETY RENT",
            "TENANT"
        ],
        reason: "Matched rental or housing payment pattern"
    },

    // 10. TRAVEL
    {
        category: "Travel",
        keywords: [
            "MAKEMYTRIP", "MMT", "CLEARTRIP", "YATRA", "GOIBIBO", "EASEMYTRIP",
            "INDIGO", "AIR INDIA", "VISTARA", "SPICEJET", "AKASA", "AIRASIA",
            "FLIGHT", "HOTEL", "RESORT", "AIRBNB", "BOOKING.COM", "AGODA",
            "OYO", "HOSTELWORLD", "TOUR", "TRAVEL", "VACATION"
        ],
        reason: "Matched flight, hotel, or travel booking platform"
    },

    // 11. PERSONAL CARE & FITNESS
    {
        category: "Personal",
        keywords: [
            "SALON", "PARLOUR", "SPA", "MASSAGE", "BARBER", "ENRICH", "NATURALS",
            "JAWED HABIB", "GYM", "FITNESS", "CULT FIT", "CULTFIT", "ANYTIME FITNESS",
            "GOLD GYM", "COSMETICS", "BEAUTY", "SKINCARE", "PERSONAL"
        ],
        reason: "Matched fitness center, salon, spa, or personal care service"
    },

    // 12. OTHER / FINANCIAL / TRANSFERS
    {
        category: "Other",
        keywords: [
            "ATM", "CASH WITHDRAWAL", "SELF TRANSFER", "INTEREST", "BANK CHARGES",
            "TAX", "STAMP DUTY", "INCOME TAX", "CHG", "MISC", "OTHER"
        ],
        reason: "Matched cash withdrawal, bank charge, or generic financial transfer"
    }
];

/**
 * Checks if the normalized or raw merchant matches any deterministic keyword rules.
 */
function matchDeterministicRule(normalized = "", rawText = "") {
    const normUpper = normalized.toUpperCase();
    const rawUpper = rawText.toUpperCase();

    for (const rule of DETERMINISTIC_RULES) {
        for (const kw of rule.keywords) {
            // Match whole word or bounded substring
            const kwUpper = kw.toUpperCase();
            if (normUpper.includes(kwUpper) || rawUpper.includes(kwUpper)) {
                return {
                    category: rule.category,
                    confidence: 0.95,
                    reason: rule.reason,
                    source: "rule"
                };
            }
        }
    }
    return null;
}

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
 * Hybrid categorization of a transaction:
 * 1. User manual category preserved if already deliberately chosen.
 * 2. Merchant normalized.
 * 3. User corrections lookup.
 * 4. Deterministic dictionary rules (instant, 0ms, highly accurate).
 * 5. Fallback to local Ollama (llama3.1:8b).
 * 6. Graceful degradation to "Other" if Ollama is unreachable.
 */
async function categorizeTransaction(transaction, userCorrections = {}) {
    // 1. If the user already assigned a deliberate non-default category (e.g. from manual entry form), preserve it!
    const existingCat = (transaction.category || "").trim();
    if (
        existingCat &&
        existingCat !== "Uncategorized" &&
        existingCat !== "Other" &&
        CANONICAL_CATEGORIES.includes(existingCat)
    ) {
        return {
            category: existingCat,
            confidence: 1.0,
            reason: "User selected category",
            source: "manual",
            normalizedMerchant: normalizeMerchant(transaction.merchant || transaction.originalDescription || "")
        };
    }

    const rawMerchant = transaction.merchant || transaction.originalMerchant || "";
    const rawDescription = transaction.originalDescription || transaction.desc || rawMerchant || "";
    const normalized = normalizeMerchant(rawMerchant || rawDescription);

    // 2. Check known user corrections
    const lowerNorm = normalized.toLowerCase();
    if (userCorrections && userCorrections[lowerNorm] && CANONICAL_CATEGORIES.includes(userCorrections[lowerNorm])) {
        return {
            category: userCorrections[lowerNorm],
            confidence: 1.0,
            reason: "Matched your previous manual correction",
            source: "user_correction",
            normalizedMerchant: normalized
        };
    }

    // 3. Check deterministic keyword rules
    const ruleMatch = matchDeterministicRule(normalized, rawDescription);
    if (ruleMatch) {
        return {
            category: ruleMatch.category,
            confidence: ruleMatch.confidence,
            reason: ruleMatch.reason,
            source: "rule",
            normalizedMerchant: normalized
        };
    }

    // 4. Fallback to Ollama with timeout protection
    try {
        const systemPrompt = `
You are FinPal's transaction categorization assistant.

Your job is to classify financial transactions into exactly one of the allowed categories.

Allowed categories:
${CANONICAL_CATEGORIES.join(", ")}

Rules:
- Choose exactly one category from the allowed list.
- Never invent a category.
- Use the merchant and transaction description.
- If ambiguous, choose "Other".
- Return valid JSON only.

Required JSON format:
{
  "category": "Food",
  "confidence": 0.9,
  "reason": "Merchant appears to be a dining establishment"
}
`;

        const userPrompt = `
Categorize this transaction:
Normalized Merchant: ${normalized}
Raw Description: ${rawDescription}
Amount: ${transaction.amount ?? "Unknown"}
Type: ${transaction.type || "expense"}
`;

        // Run Ollama with a 10s promise race timeout so users never get stuck
        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Ollama request timed out after 10 seconds")), 10000)
        );

        const ollamaPromise = askOllama({
            systemPrompt,
            userPrompt,
            json: true
        });

        const rawResponse = await Promise.race([ollamaPromise, timeoutPromise]);

        let result;
        try {
            result = JSON.parse(rawResponse);
        } catch {
            result = { category: "Other", confidence: 0.5, reason: "Unable to parse LLM JSON" };
        }

        let assignedCat = result.category;
        if (!CANONICAL_CATEGORIES.includes(assignedCat)) {
            assignedCat = "Other";
        }

        let confidence = Number(result.confidence);
        if (!Number.isFinite(confidence)) confidence = 0.6;
        confidence = Math.max(0, Math.min(1, confidence));

        return {
            category: assignedCat,
            confidence,
            reason: result.reason || "Classified via local Ollama",
            source: "llm",
            normalizedMerchant: normalized
        };
    } catch (ollamaErr) {
        // Graceful degradation when Ollama is offline or slow
        console.warn("Ollama categorization fallback:", ollamaErr.message);
        return {
            category: "Other",
            confidence: 0.5,
            reason: "Could not be automatically categorized; default to Other",
            source: "fallback",
            normalizedMerchant: normalized
        };
    }
}

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
    normalizeMerchant,
    matchDeterministicRule,
    CANONICAL_CATEGORIES,
    analyzeFinancialBehavior,
    generateTemptationAlertMessage
};