const {
    analyzeGoal
} = require("../services/goalPlannerService");


async function analyzeGoalController(
    req,
    res,
    next
) {
    try {
        const {
            goal,
            analytics
        } = req.body;

        if (!goal) {
            return res.status(400).json({
                success: false,
                message: "Goal is required."
            });
        }

        if (!analytics) {
            return res.status(400).json({
                success: false,
                message: "Analytics data is required."
            });
        }

        if (
            !goal.title ||
            typeof goal.title !== "string"
        ) {
            return res.status(400).json({
                success: false,
                message: "Goal title is required."
            });
        }

        if (
            !goal.targetAmount ||
            Number(goal.targetAmount) <= 0
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Goal target amount must be greater than zero."
            });
        }

        const goalPlan =
            analyzeGoal(
                goal,
                analytics
            );

        return res.status(200).json({
            success: true,
            message: "Goal analyzed successfully.",
            goalPlan
        });

    } catch (error) {
        console.error(
            "Goal analysis error:",
            error
        );

        next(error);
    }
}


module.exports = {
    analyzeGoalController
};
