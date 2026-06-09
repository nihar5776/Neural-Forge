const express = require("express");
const { authUser, isAdmin } = require("../middlewares/auth.middleware");
const aiAnalyticsController = require("../controllers/aiAnalytics.controller");

const router = express.Router();

router.get("/", authUser, isAdmin, aiAnalyticsController.getAiAnalyticsDashboard);

module.exports = router;
