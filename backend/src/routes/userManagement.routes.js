const express = require("express");
const { authUser, isAdmin } = require("../middlewares/auth.middleware");
const userManagementController = require("../controllers/userManagement.controller");

const router = express.Router();

// Apply auth and admin protections to all User Management endpoints
router.use(authUser, isAdmin);

router.get("/", userManagementController.getUsersController);
router.get("/:id", userManagementController.getUserByIdController);
router.patch("/:id/suspend", userManagementController.suspendUserController);
router.patch("/:id/activate", userManagementController.activateUserController);
router.delete("/:id", userManagementController.deleteUserController);

module.exports = router;
