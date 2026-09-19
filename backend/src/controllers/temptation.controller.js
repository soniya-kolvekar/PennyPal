const {
    generateTemptationAlertMessage
} = require("../services/categorizationLlmService");

async function generateTemptationAlert(req, res, next) {
    try {
        const { category, analyticsSummary } = req.body;

        if (!category || typeof category !== "string") {
            return res.status(400).json({
                success: false,
                message: "Category is required."
            });
        }

        const message = await generateTemptationAlertMessage(category, analyticsSummary || {});

        return res.status(200).json({
            success: true,
            message: "Temptation alert generated successfully.",
            alertMessage: message
        });
    } catch (error) {
        console.error("Temptation alert generation error:", error);
        next(error);
    }
}

module.exports = {
    generateTemptationAlert
};
