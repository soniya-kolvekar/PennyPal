const fs = require("fs");
const path = require("path");
const { ollamaClient } = require("../config/ollama");

const FAQS_FILE_PATH = path.join(__dirname, "../data/faqs.json");

let cachedFaqs = [];

function loadFaqs() {
    try {
        if (fs.existsSync(FAQS_FILE_PATH)) {
            const data = fs.readFileSync(FAQS_FILE_PATH, "utf-8");
            cachedFaqs = JSON.parse(data);
        }
    } catch (error) {
        console.error("Failed to load FAQs knowledge base:", error);
        cachedFaqs = [];
    }
}

// Initial load
loadFaqs();

/**
 * Tokenize string into lowercased clean words
 */
function tokenize(text) {
    if (!text) return new Set();
    return new Set(
        text
            .toLowerCase()
            .replace(/[^\w\s]/g, "")
            .split(/\s+/)
            .filter((word) => word.length > 2)
    );
}

/**
 * Calculate Jaccard Similarity between two token sets
 */
function calculateSimilarity(setA, setB) {
    if (setA.size === 0 || setB.size === 0) return 0;
    let intersection = 0;
    for (const token of setA) {
        if (setB.has(token)) {
            intersection++;
        }
    }
    const union = setA.size + setB.size - intersection;
    return union > 0 ? intersection / union : 0;
}

/**
 * Retrieve top matching FAQ knowledge chunks for a query
 * @param {string} query User query
 * @param {object} options Options like topK and threshold
 * @returns {Array} Array of matching FAQ items with relevance score
 */
async function findRelevantKnowledge(query, options = {}) {
    const { topK = 2, threshold = 0.15 } = options;

    if (!query || typeof query !== "string") {
        return [];
    }

    if (cachedFaqs.length === 0) {
        loadFaqs();
    }

    const queryTokens = tokenize(query);
    if (queryTokens.size === 0) {
        return [];
    }

    const scoredFaqs = [];

    for (const faq of cachedFaqs) {
        const questionTokens = tokenize(faq.question);
        const topicTokens = tokenize(faq.topic || "");
        const answerTokens = tokenize(faq.answer);

        // Weighted similarity: matching question/topic gets higher weight than answer body
        const questionSim = calculateSimilarity(queryTokens, questionTokens);
        const topicSim = calculateSimilarity(queryTokens, topicTokens);
        const answerSim = calculateSimilarity(queryTokens, answerTokens);

        const score = (questionSim * 0.6) + (topicSim * 0.3) + (answerSim * 0.1);

        if (score >= threshold) {
            scoredFaqs.push({
                ...faq,
                score
            });
        }
    }

    // Sort descending by relevance score
    scoredFaqs.sort((a, b) => b.score - a.score);

    return scoredFaqs.slice(0, topK);
}

module.exports = {
    findRelevantKnowledge,
    loadFaqs
};
