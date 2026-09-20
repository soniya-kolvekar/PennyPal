const express = require("express");

const authMiddleware =
    require("../middleware/authMiddleware");

const {
    analyzeGoalController,
    generateGoalPlanController,
    generateGoalAdviceController
} = require("../controllers/goals.controller");

const router = express.Router();


router.post(
    "/analyze",
    authMiddleware,
    analyzeGoalController
);

router.post(
    "/plan",
    authMiddleware,
    generateGoalPlanController
);

router.post(
    "/advice",
    authMiddleware,
    generateGoalAdviceController
);


module.exports = router;
