const express = require("express");
const { authUser, isAdmin } = require("../middlewares/auth.middleware");
const exportController = require("../controllers/export.controller");

const router = express.Router();

// Route mappings protected by authUser and isAdmin
router.get("/users", authUser, isAdmin, exportController.exportUsers);
router.get("/ats", authUser, isAdmin, exportController.exportAtsReports);
router.get("/interviews", authUser, isAdmin, exportController.exportInterviews);
router.get("/analytics", authUser, isAdmin, exportController.exportAiAnalytics);

module.exports = router;
