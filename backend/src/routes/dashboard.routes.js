const express = require("express");
const { authUser, isAdmin } = require("../middlewares/auth.middleware");
const dashboardController = require("../controllers/dashboard.controller");

const router = express.Router();

router.get("/stats", authUser, isAdmin, dashboardController.getAdminDashboard);

module.exports = router;
