const {
    analyzeGoal
} = require("../services/goalPlannerService");

const {
    generateGoalAdvice
} = require("../services/goalAdviceService");


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


/**
 * POST /api/goals/plan
 * Generate a realistic saving plan using the goal planner service.
 * No goal data is stored on the backend.
 */
async function generateGoalPlanController(
    req,
    res,
    next
) {
    try {
        const { goal, analytics } = req.body;

        if (!goal) {
            return res.status(400).json({
                success: false,
                message: "Goal data is required."
            });
        }

        if (!analytics) {
            return res.status(400).json({
                success: false,
                message:
                    "Analytics data is required for plan generation."
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

        const plan = analyzeGoal(goal, analytics);

        return res.status(200).json({
            success: true,
            message:
                "Saving plan generated successfully.",
            plan
        });
    } catch (error) {
        console.error(
            "Goal plan generation error:",
            error
        );
        next(error);
    }
}


/**
 * POST /api/goals/advice
 * Generate motivational financial coaching using Ollama.
 * No goal data is stored on the backend.
 */
async function generateGoalAdviceController(
    req,
    res,
    next
) {
    try {
        const { goal } = req.body;

        if (!goal) {
            return res.status(400).json({
                success: false,
                message: "Goal data is required."
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

        const advice =
            await generateGoalAdvice(goal);

        return res.status(200).json({
            success: true,
            message:
                "Goal advice generated successfully.",
            advice
        });
    } catch (error) {
        console.error(
            "Goal advice generation error:",
            error
        );
        next(error);
    }
}


module.exports = {
    analyzeGoalController,
    generateGoalPlanController,
    generateGoalAdviceController
};
