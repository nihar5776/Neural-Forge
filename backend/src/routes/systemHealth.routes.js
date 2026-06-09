const express = require("express");
const { authUser, isAdmin } = require("../middlewares/auth.middleware");
const systemHealthController = require("../controllers/systemHealth.controller");

const router = express.Router();

// Public endpoint (for load-balancers & external monitors)
router.get("/health", systemHealthController.getPublicHealth);

// Admin-only endpoint (for detailed telemetry and rolling SLAs)
router.get("/admin/health", authUser, isAdmin, systemHealthController.getSystemHealth);

module.exports = router;
