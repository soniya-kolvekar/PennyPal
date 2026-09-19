const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const analyzeController = require("../controllers/analyze.controller");

const router = express.Router();

router.post(
    "/statement",
    authMiddleware,
    analyzeController.analyzeStatement
);

router.post(
    "/categorize",
    authMiddleware,
    analyzeController.categorizeTransactions
);

module.exports = router;
