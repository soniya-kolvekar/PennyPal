const express = require("express");

const authMiddleware =
    require("../middleware/authMiddleware");

const {
    analyzeGoalController
} = require("../controllers/goals.controller");

const router = express.Router();


router.post(
    "/analyze",
    authMiddleware,
    analyzeGoalController
);


module.exports = router;
