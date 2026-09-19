function calculateAnalytics(transactions, options = {}) {
    const {
        currentMonth,
        previousMonth
    } = options;

    const activeTransactions = transactions.filter(
        (transaction) =>
            transaction.status === "active" ||
            transaction.status === "reconciled"
    );

    const currentTransactions = currentMonth
        ? activeTransactions.filter((transaction) =>
            transaction.date.startsWith(currentMonth)
        )
        : activeTransactions;

    const previousTransactions = previousMonth
        ? activeTransactions.filter((transaction) =>
            transaction.date.startsWith(previousMonth)
        )
        : [];

    const monthlyIncome = sumTransactions(
        currentTransactions,
        "income"
    );

    const monthlyExpenses = sumTransactions(
        currentTransactions,
        "expense"
    );

    const savings = monthlyIncome - monthlyExpenses;

    const savingsRate =
        monthlyIncome > 0
            ? Number(((savings / monthlyIncome) * 100).toFixed(1))
            : 0;

    const categorySpending =
        calculateCategorySpending(currentTransactions);

    const previousCategorySpending =
        calculateCategorySpending(previousTransactions);

    const categoryChanges =
        calculateCategoryChanges(
            categorySpending,
            previousCategorySpending
        );

    const recurringExpenses =
        detectRecurringExpenses(activeTransactions);

    return {
        period: {
            current: currentMonth || null,
            previous: previousMonth || null
        },

        overview: {
            income: monthlyIncome,
            expenses: monthlyExpenses,
            savings,
            savingsRate
        },

        spending: {
            total: monthlyExpenses,
            categorySpending,
            topCategory: categorySpending[0] || null
        },

        trends: {
            categoryChanges
        },

        recurringExpenses,

        transactionStats: {
            transactionCount: currentTransactions.length,
            expenseCount: currentTransactions.filter(
                (transaction) => transaction.type === "expense"
            ).length,
            incomeCount: currentTransactions.filter(
                (transaction) => transaction.type === "income"
            ).length,
            averageExpense: calculateAverageExpense(
                currentTransactions
            ),
            largestExpense: findLargestExpense(
                currentTransactions
            )
        }
    };
}

function calculateAverageExpense(transactions) {
    const expenses = transactions.filter(
        (transaction) => transaction.type === "expense"
    );

    if (expenses.length === 0) {
        return 0;
    }

    const total = expenses.reduce(
        (sum, transaction) =>
            sum + Number(transaction.amount || 0),
        0
    );

    return Number(
        (total / expenses.length).toFixed(2)
    );
}


function findLargestExpense(transactions) {
    const expenses = transactions.filter(
        (transaction) => transaction.type === "expense"
    );

    if (expenses.length === 0) {
        return null;
    }

    const largest = expenses.reduce(
        (max, transaction) =>
            Number(transaction.amount) >
                Number(max.amount)
                ? transaction
                : max
    );

    return {
        id: largest.id,
        merchant: largest.merchant,
        amount: Number(largest.amount),
        category: largest.category,
        date: largest.date
    };
}

function sumTransactions(transactions, type) {
    return Number(
        transactions
            .filter((transaction) => transaction.type === type)
            .reduce(
                (total, transaction) =>
                    total + Number(transaction.amount || 0),
                0
            )
            .toFixed(2)
    );
}


function calculateCategorySpending(transactions) {
    const expenses = transactions.filter(
        (transaction) =>
            transaction.type === "expense"
    );

    const totalExpenses = expenses.reduce(
        (total, transaction) =>
            total + Number(transaction.amount || 0),
        0
    );

    const categoryTotals = {};

    for (const transaction of expenses) {
        const category =
            transaction.category || "Other";

        categoryTotals[category] =
            (categoryTotals[category] || 0) +
            Number(transaction.amount || 0);
    }

    return Object.entries(categoryTotals)
        .map(([category, amount]) => ({
            category,
            amount: Number(amount.toFixed(2)),
            percentage:
                totalExpenses > 0
                    ? Number(
                        ((amount / totalExpenses) * 100).toFixed(1)
                    )
                    : 0
        }))
        .sort((a, b) => b.amount - a.amount);
}


function calculateCategoryChanges(
    currentCategories,
    previousCategories
) {
    const previousMap = {};

    for (const item of previousCategories) {
        previousMap[item.category] = item.amount;
    }

    return currentCategories.map((current) => {
        const previousAmount =
            previousMap[current.category] || 0;

        let changePercent = 0;

        if (previousAmount > 0) {
            changePercent =
                ((current.amount - previousAmount) /
                    previousAmount) *
                100;
        } else if (current.amount > 0) {
            changePercent = 100;
        }

        return {
            category: current.category,
            currentAmount: current.amount,
            previousAmount,
            changePercent: Number(changePercent.toFixed(1))
        };
    });
}


function detectRecurringExpenses(transactions) {
    const expenses = transactions.filter(
        (transaction) =>
            transaction.type === "expense"
    );

    const merchantGroups = {};

    for (const transaction of expenses) {
        const merchant =
            normalizeMerchant(transaction.merchant);

        if (!merchant) continue;

        if (!merchantGroups[merchant]) {
            merchantGroups[merchant] = [];
        }

        merchantGroups[merchant].push(transaction);
    }

    const recurring = [];

    for (const [merchant, items] of Object.entries(
        merchantGroups
    )) {
        if (items.length < 2) continue;

        const amounts = items.map(
            (item) => Number(item.amount)
        );

        const averageAmount =
            amounts.reduce((sum, amount) => sum + amount, 0) /
            amounts.length;

        const amountsAreSimilar = amounts.every(
            (amount) =>
                Math.abs(amount - averageAmount) <=
                averageAmount * 0.1
        );

        if (!amountsAreSimilar) continue;

        recurring.push({
            merchant: items[0].merchant,
            amount: Number(averageAmount.toFixed(2)),
            occurrences: items.length
        });
    }

    return recurring;
}


function normalizeMerchant(merchant) {
    if (!merchant) return "";

    return merchant
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, "")
        .replace(/\s+/g, " ")
        .trim();
}


module.exports = {
    calculateAnalytics
};