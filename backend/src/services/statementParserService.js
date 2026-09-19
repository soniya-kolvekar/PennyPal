function parseBankStatement(text) {
    const lines = text
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean);

    const transactions = [];

    for (const line of lines) {
        const transaction = parseTransactionLine(line);

        if (transaction) {
            transactions.push(transaction);
        }
    }

    return transactions;
}

function parseTransactionLine(line) {
    const dateMatch = line.match(
        /\b(\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4})\b/
    );

    if (!dateMatch) {
        return null;
    }

    const date = normalizeDate(dateMatch[1]);

    if (!date) {
        return null;
    }

    const amountMatches = [
        ...line.matchAll(
            /(?:₹|Rs\.?|INR)?\s*([\d,]+(?:\.\d{1,2})?)/gi
        ),
    ];

    if (amountMatches.length === 0) {
        return null;
    }

    const amountString =
        amountMatches[amountMatches.length - 1][1];

    const amount = Number(
        amountString.replace(/,/g, "")
    );

    if (!Number.isFinite(amount) || amount <= 0) {
        return null;
    }

    /*Remove date and amount from the description.*/

    let description = line
        .replace(dateMatch[0], "")
        .replace(
            /(?:₹|Rs\.?|INR)?\s*[\d,]+(?:\.\d{1,2})?/gi,
            ""
        )
        .replace(/\s+/g, " ")
        .trim();

    if (!description) {
        description = "Unknown";
    }

    /*debit/credit detection.*/

    const upperLine = line.toUpperCase();

    let type = "expense";

    if (
        upperLine.includes("CREDIT") ||
        upperLine.includes("CR") ||
        upperLine.includes("SALARY")
    ) {
        type = "income";
    }

    return {
        id: crypto.randomUUID(),

        date,

        merchant: description,

        originalDescription: description,

        amount,

        type,

        category: "Uncategorized",

        source: "bank_statement",

        status: "active",
    };
}

function normalizeDate(value) {
    const parts = value.split(/[\/-]/);

    if (parts.length !== 3) {
        return null;
    }

    let [day, month, year] = parts;

    if (year.length === 2) {
        year = `20${year}`;
    }

    const dayNumber = Number(day);
    const monthNumber = Number(month);
    const yearNumber = Number(year);

    if (
        !Number.isInteger(dayNumber) ||
        !Number.isInteger(monthNumber) ||
        !Number.isInteger(yearNumber)
    ) {
        return null;
    }

    if (
        dayNumber < 1 ||
        dayNumber > 31 ||
        monthNumber < 1 ||
        monthNumber > 12
    ) {
        return null;
    }

    return `${yearNumber}-${String(monthNumber).padStart(
        2,
        "0"
    )}-${String(dayNumber).padStart(2, "0")}`;
}

module.exports = {
    parseBankStatement,
};