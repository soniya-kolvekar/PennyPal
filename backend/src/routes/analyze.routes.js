const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const analyzeController = require("../controllers/analyze.controller");
const temptationController = require("../controllers/temptation.controller");

const router = express.Router();

router.post(
    "/statement",
    authMiddleware,
    analyzeController.analyzeStatement
);

router.post(
    "/analytics",
    authMiddleware,
    analyzeController.generateAnalytics
);

router.post(
    "/categorize",
    authMiddleware,
    analyzeController.categorizeTransactions
);

router.post(
    "/insights",
    authMiddleware,
    analyzeController.generateInsights
);

router.post(
    "/temptation",
    authMiddleware,
    temptationController.generateTemptationAlert
);

module.exports = router;
