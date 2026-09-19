function analyzeGoal(goal, analytics) {
    const targetAmount = Number(goal.targetAmount || 0);
    const currentAmount = Number(goal.currentAmount || 0);

    if (!Number.isFinite(targetAmount) || targetAmount <= 0) {
        throw new Error("Goal target amount must be greater than zero.");
    }

    if (!Number.isFinite(currentAmount) || currentAmount < 0) {
        throw new Error("Goal current amount must be zero or greater.");
    }

    const remainingAmount = Math.max(
        0,
        targetAmount - currentAmount
    );

    // Current amount already reaches the target.
    if (remainingAmount === 0) {
        return {
            status: "completed",

            targetAmount,
            currentAmount,
            remainingAmount: 0,

            requiredMonthlySaving: 0,
            currentMonthlySaving: getCurrentMonthlySaving(analytics),
            savingsGap: 0,

            estimatedMonths: 0,
            estimatedDays: 0,

            savingsOpportunities: [],

            monthlyPlan: []
        };
    }

    const currentMonthlySaving =
        getCurrentMonthlySaving(analytics);

    /*
     * If the user supplied a target date,
     * calculate how much they need to save every month.
     *
     * Otherwise, use their current monthly savings
     * to estimate how long the goal will take.
     */
    let requiredMonthlySaving;
    let estimatedMonths;
    let estimatedDays;

    if (goal.targetDate) {
        const monthsUntilTarget =
            calculateMonthsUntilTarget(goal.targetDate);

        if (monthsUntilTarget <= 0) {
            throw new Error(
                "Goal target date must be in the future."
            );
        }

        requiredMonthlySaving =
            remainingAmount / monthsUntilTarget;

        estimatedMonths = monthsUntilTarget;
        estimatedDays = Math.ceil(
            monthsUntilTarget * 30
        );
    } else {
        requiredMonthlySaving =
            currentMonthlySaving;

        if (currentMonthlySaving > 0) {
            estimatedMonths =
                remainingAmount / currentMonthlySaving;

            estimatedDays = Math.ceil(
                estimatedMonths * 30
            );
        } else {
            estimatedMonths = null;
            estimatedDays = null;
        }
    }

    const savingsGap =
        Math.max(
            0,
            requiredMonthlySaving -
            currentMonthlySaving
        );

    const savingsOpportunities =
        findSavingsOpportunities(
            analytics,
            savingsGap
        );

    const monthlyPlan =
        requiredMonthlySaving > 0
            ? buildMonthlyPlan(
                remainingAmount,
                requiredMonthlySaving
            )
            : [];

    return {
        status: "active",

        targetAmount,
        currentAmount,
        remainingAmount: round(remainingAmount),

        currentMonthlySaving:
            round(currentMonthlySaving),

        requiredMonthlySaving:
            round(requiredMonthlySaving),

        savingsGap:
            round(savingsGap),

        estimatedMonths:
            estimatedMonths !== null
                ? round(estimatedMonths)
                : null,

        estimatedDays,

        savingsOpportunities,

        monthlyPlan
    };
}


/**
 * Get the user's current monthly savings
 * from the analytics engine.
 */
function getCurrentMonthlySaving(analytics) {
    if (!analytics) return 0;

    // Support both our old analytics structure
    // and the newer overview structure.
    if (
        analytics.overview &&
        Number.isFinite(
            Number(analytics.overview.savings)
        )
    ) {
        return Number(
            analytics.overview.savings
        );
    }

    if (
        Number.isFinite(
            Number(analytics.savings)
        )
    ) {
        return Number(analytics.savings);
    }

    const income =
        Number(analytics.monthlyIncome || 0);

    const expenses =
        Number(analytics.monthlyExpenses || 0);

    return Math.max(
        0,
        income - expenses
    );
}


/**
 * Calculate months until a target date.
 */
function calculateMonthsUntilTarget(targetDate) {
    const target = new Date(targetDate);

    if (Number.isNaN(target.getTime())) {
        throw new Error(
            "Invalid goal target date."
        );
    }

    const now = new Date();

    const months =
        (target.getFullYear() -
            now.getFullYear()) *
        12 +
        (target.getMonth() -
            now.getMonth());

    // Add a fraction based on the day of month.
    const dayFraction =
        (target.getDate() -
            now.getDate()) /
        30;

    return months + dayFraction;
}


/**
 * Find categories where spending could potentially
 * be reviewed.
 *
 * This does NOT mean the user should cut these expenses.
 * They are simply potential areas to investigate.
 */
function findSavingsOpportunities(
    analytics,
    savingsGap
) {
    const categories =
        getCategorySpending(analytics);

    if (!categories.length) {
        return [];
    }

    const changes =
        getCategoryChanges(analytics);

    const opportunities = categories
        .filter((category) =>
            isPotentiallyFlexibleCategory(
                category.category
            )
        )
        .map((category) => {
            const change =
                changes.find(
                    (item) =>
                        item.category ===
                        category.category
                );

            const changePercent =
                change
                    ? Number(change.changePercent || 0)
                    : 0;

            /*
             * This is only a planning estimate.
             *
             * We use a maximum potential reduction of 20%
             * rather than assuming the entire category is
             * unnecessary.
             */
            const potentialReduction =
                category.amount * 0.2;

            let reason =
                "This category has potentially flexible spending.";

            if (changePercent > 20) {
                reason =
                    "Spending in this category has increased recently.";
            }

            return {
                category: category.category,

                currentAmount:
                    round(category.amount),

                percentage:
                    round(category.percentage || 0),

                changePercent:
                    round(changePercent),

                potentialReduction:
                    round(potentialReduction),

                reason
            };
        })
        .sort(
            (a, b) =>
                b.potentialReduction -
                a.potentialReduction
        );

    /*
     * Only return opportunities relevant to the
     * current savings gap.
     */
    if (savingsGap <= 0) {
        return opportunities.slice(0, 3);
    }

    let remainingGap = savingsGap;
    const selected = [];

    for (const opportunity of opportunities) {
        if (remainingGap <= 0) break;

        const suggestedAmount =
            Math.min(
                opportunity.potentialReduction,
                remainingGap
            );

        selected.push({
            ...opportunity,

            suggestedMonthlySaving:
                round(suggestedAmount)
        });

        remainingGap -= suggestedAmount;
    }

    return selected;
}


/**
 * Categories that are generally more flexible.
 *
 * This is a planning heuristic, not a statement that
 * the user's spending is unnecessary.
 */
function isPotentiallyFlexibleCategory(
    category
) {
    const flexibleCategories = [
        "Food",
        "Shopping",
        "Entertainment",
        "Subscriptions",
        "Travel",
        "Personal"
    ];

    return flexibleCategories.includes(
        category
    );
}


/**
 * Read category spending regardless of whether
 * the analytics object uses the old or new structure.
 */
function getCategorySpending(analytics) {
    if (!analytics) return [];

    if (
        analytics.spending &&
        Array.isArray(
            analytics.spending.categorySpending
        )
    ) {
        return analytics.spending.categorySpending;
    }

    if (
        Array.isArray(
            analytics.categorySpending
        )
    ) {
        return analytics.categorySpending;
    }

    return [];
}


/**
 * Read category changes.
 */
function getCategoryChanges(analytics) {
    if (!analytics) return [];

    if (
        analytics.trends &&
        Array.isArray(
            analytics.trends.categoryChanges
        )
    ) {
        return analytics.trends.categoryChanges;
    }

    if (
        Array.isArray(
            analytics.categoryChanges
        )
    ) {
        return analytics.categoryChanges;
    }

    return [];
}


/**
 * Build the month-by-month roadmap.
 */
function buildMonthlyPlan(
    remainingAmount,
    monthlySaving
) {
    const plan = [];

    let remaining =
        remainingAmount;

    let month = 1;

    while (remaining > 0) {
        const targetSaving =
            Math.min(
                monthlySaving,
                remaining
            );

        remaining -= targetSaving;

        plan.push({
            month,

            targetSaving:
                round(targetSaving),

            remaining:
                round(
                    Math.max(
                        0,
                        remaining
                    )
                )
        });

        month++;

        // Prevent accidental infinite loops.
        if (month > 120) {
            break;
        }
    }

    return plan;
}


/**
 * Round financial values.
 */
function round(value) {
    return Number(
        Number(value || 0).toFixed(2)
    );
}


module.exports = {
    analyzeGoal
};
